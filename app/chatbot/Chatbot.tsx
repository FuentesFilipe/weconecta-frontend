'use client';

import SpeechBubble from '@/components/SpeechBubble';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { sendSurveyResponse } from '@/services/core/surveys';
import { useGetSurveysElementById } from '@/services/core/surveysElements/queries';
import { ArrowRight, Paperclip } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SurveyElementType } from '@/dtos/SurveysElementsDto';
import { useSurveyConvo } from '@/hooks/useSurveyConvo';
import { Loading } from '../../components/ui';
import { SurveyDto } from '../../dtos/SurveyDto';
import { useCompleteSurveyMutation } from '../../services/core/surveys/mutations';
import { useGetSurveyByIdAndClientId } from '../../services/core/surveys/queries';
import './index.css';

type SendPayload = {
    surveyId?: number;
    elementId?: number;
    value: string | number | number[];
};

export default function ChatbotWrapper() {
    const params = new URLSearchParams(window.location.search);
    // Id do questionário
    const questionarioId = Number(params.get('s')) ?? undefined;
    // Id de quem gerou o link para o questionário
    const clientId = params.get('c') ?? undefined;

    // busca metadados antes de montar o chat
    const { data: survey, isLoading, error } = useGetSurveyByIdAndClientId(questionarioId, clientId);

    if (!questionarioId || !clientId) {
        return <div>Parâmetros do questionário inválidos.</div>;
    }

    if (error) {
        return <div>Erro ao carregar o questionário.</div>;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!survey) {
        return <></>;
    }

    return <Chatbot survey={survey} clientId={clientId} />;
}

function Chatbot({
    survey,
    clientId,
}: {
    survey: SurveyDto;
    clientId: string;
}) {
    // messages: a simple in-memory sequence combining questions (from the survey)
    // and user responses. We render question bubbles (left) and user bubbles (right).
    type QuestionMsg = { kind: 'question'; element: SurveyElementDto };
    type ResponseMsg = {
        kind: 'response';
        text: string;
        align?: 'left' | 'right';
    };
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<QuestionMsg | ResponseMsg>>(
        [],
    );

    // current element id for the flow engine
    const [currentElementId, setCurrentElementId] = useState<number | null>(
        survey.firstSurveyElement ?? null,
    );

    // fetch the current survey element when currentElementId is set
    const { data: currentElement } = useGetSurveysElementById(
        currentElementId ?? undefined,
    );

    // when a new element is loaded, append it as a question bubble (if not already present)
    useEffect(() => {
        if (!currentElement) return;
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (
                last &&
                last.kind === 'question' &&
                last.element.id === currentElement.id
            ) {
                return prev;
            }
            return [...prev, { kind: 'question', element: currentElement }];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentElement?.id]);

    // Helper: try to parse the survey.flow and resolve the next element id.
    // Assumptions (best-effort):
    // - survey.flow is a JSON string mapping from elementId -> rules
    // - rules may be a number (direct next element id) or an object where keys
    //   are option ids (or '*' / 'DEFAULT') mapping to next element ids.
    const resolveNextElementId = (
        flowStr: string | null,
        fromElementId: number | null,
        answerValue: string | number | number[] | undefined,
    ): number | null => {
        if (!flowStr || !fromElementId) return null;
        try {
            const flow = JSON.parse(flowStr);
            const rules = flow[String(fromElementId)];
            if (!rules) return null;
            // If rules is a number, treat as direct next id
            if (typeof rules === 'number') return rules;
            if (typeof rules === 'string') return Number(rules) || null;
            if (typeof rules === 'object') {
                // option-specific routing
                if (typeof answerValue === 'number') {
                    const k = String(answerValue);
                    if (rules[k]) return Number(rules[k]) || null;
                }
                if (Array.isArray(answerValue)) {
                    // try first matching option rule
                    for (const v of answerValue) {
                        const k = String(v);
                        if (rules[k]) return Number(rules[k]) || null;
                    }
                }
                // fallback to wildcard/default
                if (rules['*']) return Number(rules['*']) || null;
                if (rules['DEFAULT']) return Number(rules['DEFAULT']) || null;
            }
            return null;
        } catch (err) {
            // malformed flow, stop the flow
            // eslint-disable-next-line no-console
            console.warn('Failed to parse survey.flow', err);
            return null;
        }
    };

    // when user answers a question, post and advance the flow
    const handleQuestionSend = async (payload: {
        surveyId?: number;
        elementId?: number;
        value: string | number | number[];
    }) => {
        const element = currentElement as SurveyElementDto | undefined | null;
        try {
            if (survey.id) {
                // POST to backend (best-effort)
                // ignore errors but keep UX
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                sendSurveyResponse(survey.id, {
                    elementId: payload.elementId ?? element?.id,
                    value: payload.value,
                }).catch((e) => {
                    // eslint-disable-next-line no-console
                    console.error('Failed to send survey response', e);
                });
            }
        } catch (err) {
            // keep UI flow even if send fails
            // eslint-disable-next-line no-console
            console.error('sendSurveyResponse error', err);
        }

        // build a user-visible text for the sent response
        let text = '';
        if (typeof payload.value === 'string') text = payload.value;
        else if (typeof payload.value === 'number') {
            const opt = element?.options?.find(
                (o) => o.id === (payload.value as number),
            );
            text = opt?.description ?? String(payload.value);
        } else if (Array.isArray(payload.value)) {
            const parts = (payload.value as number[]).map(
                (id) =>
                    element?.options?.find((o) => o.id === id)?.description ??
                    String(id),
            );
            text = parts.join(', ');
        }

        // append user response bubble (right aligned)
        setMessages((prev) => [
            ...prev,
            { kind: 'response', text, align: 'right' },
        ]);

        // determine next element id from flow
        const next = resolveNextElementId(
            survey.flow,
            payload.elementId ?? element?.id ?? null,
            payload.value,
        );
        setCurrentElementId(next);
    };
    const [isLastQuestion, setIsLastQuestion] = useState(false);
    const { mutate: completeSurvey, isPending: isCompleting } =
        useCompleteSurveyMutation();

    // hook central, carrega historico, envia resposta e gerencia estado
    const { messages, loading, error, sendText, sendOptions, sending, bottomRef}
     = useSurveyConvo({ surveyId: survey.id!, clientId});

    // envia texto ao backend via hook
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages((prev) => [
                ...prev,
                { kind: 'response', text: input.trim(), align: 'right' },
            ]);
            console.log(
                'Mensagem enviada:',
                input,
                'Questionário ID:',
                survey.id,
                'Client ID:',
                clientId,
            );

            // Quando você receber a sinalização do backend de que não há mais perguntas,
            // defina: setIsLastQuestion(true)

            setInput('');
        }
        const text = input.trim();
        if (!text) return;
        void sendText(text);
        setInput('');
    };

    const handleCompleteSurvey = () => {
        if (survey.id) {
            completeSurvey({
                userId: clientId,
                surveyId: survey.id,
            });
        }
    };

    return (
        <div className='chatbot-container'>
            <Card className='chatbot-main'>
                <CardHeader className='chatbot-header'>
                    <div aria-label='logo-group'>
                        <img
                            src='/logo_padrao_horizontal.png'
                            className='weconecta-logo'
                        />
                    </div>
                </CardHeader>


                <CardContent className="chatbot-messages">
                    {loading && messages.length === 0 && <div>Carregando histórico...</div>}
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {messages.map(m => (
                        <div key={m.id} className={`mb-2 flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${m.role === 'USER' ? 'bg-orange-500 text-white' : 'bg-neutral-200 text-neutral-900'} rounded-lg px-3 py-2 max-w-[75%] text-sm whitespace-pre-wrap`}>
                                <div>{m.content}</div>

                                {/* Renderiza opções quando a pergunta do BOT é de múltipla escolha */}
                                {m.role !== 'USER' && m.options?.length && (m.type === SurveyElementType.OPTION || m.type === SurveyElementType.MULTIPLE_CHOICE) ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {m.options.map(opt => (
                                            <Button
                                                key={opt.id}
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => sendOptions([opt.id!], m.surveyElementId)}
                                            >
                                                {opt.description}
                                            </Button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </CardContent>


                <CardFooter className="chatbot-input-container">
                    <form onSubmit={handleSubmit} className="chatbot-input-wrapper">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="attachment-icon"
                        >
                            <Button
                                onClick={handleCompleteSurvey}
                                disabled={isCompleting}
                                className='chatbot-finish-button'
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    backgroundColor: '#e46f2c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isCompleting
                                        ? 'not-allowed'
                                        : 'pointer',
                                    opacity: isCompleting ? 0.7 : 1,
                                }}
                            >
                                {isCompleting
                                    ? 'Finalizando...'
                                    : 'Finalizar questionário'}
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className='chatbot-input-wrapper'
                        >
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='attachment-icon'
                            >
                                <Paperclip className='w-5 h-5 icon-orange' />
                            </Button>

                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder='Digite sua resposta aqui...'
                                className='chatbot-input'
                            />

                            <Button
                                type='submit'
                                variant='ghost'
                                size='icon'
                                className='send-icon'
                            >
                                <ArrowRight
                                    className='w-5 h-5'
                                    color='#e46f2c'
                                />
                            </Button>
                        </form>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
