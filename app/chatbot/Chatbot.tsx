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
import { ArrowRight, Paperclip } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Loading } from '../../components/ui';
import { SurveyDto } from '../../dtos/SurveyDto';
import { useGetSurveyByIdAndClientId } from '../../services/core/surveys/queries';
import { useGetSurveysElementById } from '@/services/core/surveysElements/queries';
import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { sendSurveyResponse } from '@/services/core/surveys';
import './index.css';

type SendPayload = { surveyId?: number; elementId?: number; value: string | number | number[] };

export default function ChatbotWrapper() {
    const params = new URLSearchParams(window.location.search);
    // Id do questionário
    const questionarioId = Number(params.get('s')) ?? undefined;
    // Id de quem gerou o link para o questionário
    const clientId = params.get('c') ?? undefined;

    const {
        data: survey,
        isLoading,
        error,
    } = useGetSurveyByIdAndClientId(questionarioId, clientId);

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

function Chatbot({ survey, clientId }: { survey: SurveyDto; clientId: string }) {
    // messages: a simple in-memory sequence combining questions (from the survey)
    // and user responses. We render question bubbles (left) and user bubbles (right).
    type QuestionMsg = { kind: 'question'; element: SurveyElementDto };
    type ResponseMsg = { kind: 'response'; text: string; align?: 'left' | 'right' };
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<QuestionMsg | ResponseMsg>>([]);

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
            if (last && last.kind === 'question' && last.element.id === currentElement.id) {
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
    const handleQuestionSend = async (payload: { surveyId?: number; elementId?: number; value: string | number | number[] }) => {
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
            const opt = element?.options?.find((o) => o.id === payload.value as number);
            text = opt?.description ?? String(payload.value);
        } else if (Array.isArray(payload.value)) {
            const parts = (payload.value as number[])
                .map((id) => element?.options?.find((o) => o.id === id)?.description ?? String(id));
            text = parts.join(', ');
        }

        // append user response bubble (right aligned)
        setMessages((prev) => [...prev, { kind: 'response', text, align: 'right' }]);

        // determine next element id from flow
        const next = resolveNextElementId(survey.flow, payload.elementId ?? element?.id ?? null, payload.value);
        setCurrentElementId(next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages((prev) => [...prev, { kind: 'response', text: input.trim(), align: 'right' }]);
            setInput('');
        }
    };

    return (
        <div className='chatbot-container'>
            <Card className='chatbot-main'>
                <CardHeader className='chatbot-header'>
                    <div aria-label='logo-group'>
                        <img src='/logo_padrao_horizontal.png' className='weconecta-logo' />
                    </div>
                </CardHeader>

                <CardContent className='chatbot-messages'>
                    {/* Área das mensagens */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                                Nenhuma mensagem ainda. Digite sua resposta abaixo.
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            if (msg.kind === 'question') {
                                return (
                                    <SpeechBubble
                                        key={`q-${msg.element.id}-${idx}`}
                                        element={msg.element}
                                        isQuestion
                                        surveyId={survey.id}
                                        align={'left'}
                                        onSend={(payload: SendPayload) => handleQuestionSend(payload)}
                                    />
                                );
                            }
                            return (
                                <SpeechBubble
                                    key={`r-${idx}`}
                                    isQuestion={false}
                                    responseText={msg.text}
                                    align={msg.align === 'right' ? 'right' : 'left'}
                                />
                            );
                        })}
                    </div>
                </CardContent>

                <CardFooter className='chatbot-input-container'>
                    <form onSubmit={handleSubmit} className='chatbot-input-wrapper'>
                        <Button type='button' variant='ghost' size='icon' className='attachment-icon'>
                            <Paperclip className='w-5 h-5 icon-orange' />
                        </Button>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Digite sua resposta aqui...'
                            className='chatbot-input'
                        />

                        <Button type='submit' variant='ghost' size='icon' className='send-icon'>
                            <ArrowRight className='w-5 h-5' color='#e46f2c' />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
