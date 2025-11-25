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
import { useCompleteSurveyMutation } from '../../services/core/surveys/mutations';
import { useGetSurveyByIdAndClientId } from '../../services/core/surveys/queries';
import { useGetSurveysElementById } from '@/services/core/surveysElements/queries';
import { SurveyElementDto } from '@/dtos/SurveysElementsDto';
import { sendSurveyAnswer, verifyPhone } from '@/services/core/surveyAnswer';
import { surveyElementApi } from '@/services/core/surveysElements';
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

function Chatbot({ survey, clientId: initialClientId }: { survey: SurveyDto; clientId: string }) {
    // messages: a simple in-memory sequence combining questions (from the survey)
    // and user responses. We render question bubbles (left) and user bubbles (right).
    type QuestionMsg = { kind: 'question'; element: SurveyElementDto };
    type ResponseMsg = { kind: 'response'; text: string; align?: 'left' | 'right' };
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<QuestionMsg | ResponseMsg>>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Estado para verificação de telefone
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [sessionIdentifier, setSessionIdentifier] = useState<string | null>(null);
    const [phoneInput, setPhoneInput] = useState('');
    const [actualClientId, setActualClientId] = useState<string>(initialClientId);

    // current element id for the flow engine
    const [currentElementId, setCurrentElementId] = useState<number | null>(null);

    // Rastreia opções selecionadas por elemento (para manter seleção visual após envio)
    const [selectedOptionsByElement, setSelectedOptionsByElement] = useState<Map<number, number | number[]>>(new Map());

    // fetch the current survey element when currentElementId is set
    const { data: currentElement } = useGetSurveysElementById(
        currentElementId ?? undefined,
    );

    // when a new element is loaded, append it as a question bubble (if not already present)
    useEffect(() => {
        if (!currentElement || !phoneVerified) return;
        setMessages((prev) => {
            // Verifica se esta pergunta já existe nas mensagens
            const questionExists = prev.some(
                (msg) => msg.kind === 'question' && msg.element.id === currentElement.id
            );
            if (questionExists) {
                return prev;
            }
            // Adiciona a nova pergunta preservando todas as mensagens anteriores
            return [...prev, { kind: 'question', element: currentElement }];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentElement?.id, phoneVerified]);

    // when user answers a question, post and advance the flow using backend
    const handleQuestionSend = async (payload: { surveyId?: number; elementId?: number; value: string | number | number[] }) => {
        const element = currentElement as SurveyElementDto | undefined | null;
        const elementId = payload.elementId ?? element?.id;
        
        if (!elementId || !survey.id) {
            console.error('Missing elementId or surveyId');
            return;
        }

        setIsProcessing(true);

        try {
        // build a user-visible text for the sent response
        let text = '';
            let optionId: number | undefined = undefined;
            let message: string | undefined = undefined;

            if (typeof payload.value === 'string') {
                text = payload.value;
                message = payload.value;
            } else if (typeof payload.value === 'number') {
                const opt = element?.options?.find((o) => o.id === payload.value);
            text = opt?.description ?? String(payload.value);
                optionId = payload.value;
        } else if (Array.isArray(payload.value)) {
            const parts = (payload.value as number[])
                .map((id) => element?.options?.find((o) => o.id === id)?.description ?? String(id));
            text = parts.join(', ');
                // Para múltipla escolha, usa o primeiro optionId
                optionId = payload.value[0];
                // O backend trata MULTIPLE_CHOICE como "non-option" e exige mensagem
                // Então enviamos o texto das opções selecionadas como mensagem
                message = text;
        }

        // append user response bubble (right aligned)
        setMessages((prev) => [...prev, { kind: 'response', text, align: 'right' }]);

            // Salva a seleção para manter visualmente selecionado após envio
            if (elementId) {
                setSelectedOptionsByElement((prev) => {
                    const newMap = new Map(prev);
                    if (typeof payload.value === 'number') {
                        newMap.set(elementId, payload.value);
                    } else if (Array.isArray(payload.value)) {
                        newMap.set(elementId, payload.value);
                    }
                    return newMap;
                });
            }

            // Chama o backend para processar a resposta e obter o próximo elemento
            if (!sessionIdentifier) {
                console.error('Session identifier not set');
                return;
            }

            // Valida se o clientId é um UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(actualClientId)) {
                console.error('clientId inválido (não é um UUID válido):', actualClientId);
                setMessages((prev) => [
                    ...prev,
                    { kind: 'response', text: 'Erro: clientId inválido. Por favor, recarregue a página.', align: 'left' },
                ]);
                return;
            }

            const response = await sendSurveyAnswer({
                identifier: sessionIdentifier,
                clientId: actualClientId,
                surveyId: survey.id,
                currentSurveyElementId: elementId,
                optionId,
                message,
            });

            // Atualiza para o próximo elemento ou finaliza
            if (response.finished) {
                setCurrentElementId(null);
                setMessages((prev) => [
                    ...prev,
                    { kind: 'response', text: 'Obrigado por responder o questionário!', align: 'left' },
                ]);
            } else {
                setCurrentElementId(response.nextSurveyElementId);
            }
        } catch (err) {
            console.error('Erro ao processar resposta:', err);
            setMessages((prev) => [
                ...prev,
                { kind: 'response', text: 'Erro ao processar sua resposta. Tente novamente.', align: 'left' },
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const { mutate: completeSurvey } = useCompleteSurveyMutation();

    // Helper para verificar se o elemento aceita input de texto
    const isTextInputElement = (element: SurveyElementDto | null | undefined): boolean => {
        if (!element) return false;
        const elementType = String(element.type).toUpperCase();
        return elementType === 'INPUT' || elementType === 'MESSAGE';
    };

    // Helper para verificar se o elemento é de seleção (alternativa ou múltipla escolha)
    const isSelectionElement = (element: SurveyElementDto | null | undefined): boolean => {
        if (!element) return false;
        const elementType = String(element.type).toUpperCase();
        return elementType === 'OPTION' || elementType === 'MULTIPLE_CHOICE';
    };

    // Função para aplicar máscara de telefone brasileiro
    const applyPhoneMask = (value: string): string => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        
        // Aplica máscara: (XX) XXXXX-XXXX para celular ou (XX) XXXX-XXXX para fixo
        if (numbers.length <= 2) {
            return numbers.length > 0 ? `(${numbers}` : numbers;
        } else if (numbers.length <= 6) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 10) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else {
            // Celular: (XX) XXXXX-XXXX
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    // Função para remover máscara do telefone
    const removePhoneMask = (value: string): string => {
        return value.replace(/\D/g, '');
    };

    // Handler para mudança do input de telefone (aplica máscara)
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const maskedValue = applyPhoneMask(value);
        setPhoneInput(maskedValue);
    };

    // Handler para verificação de telefone
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Remove a máscara antes de enviar
        const phone = removePhoneMask(phoneInput.trim());
        if (!phone || !survey.id) return;

        setIsProcessing(true);

        try {
            // Verifica o telefone no backend
            const verification = await verifyPhone({
                phone,
                surveyId: survey.id,
            });

            // Armazena o identifier e atualiza o clientId (sempre deve vir do backend)
            setSessionIdentifier(verification.identifier);
            if (verification.clientId) {
                setActualClientId(verification.clientId);
            } else {
                // Se não retornou clientId, mantém o inicial (fallback)
                console.warn('Backend não retornou clientId, usando o inicial da URL');
            }
            sessionStorage.setItem(`survey-${survey.id}-${actualClientId}-identifier`, verification.identifier);
            sessionStorage.setItem(`survey-${survey.id}-phone`, phone);

            // Se o telefone já existe e há respostas anteriores, reconstrói o histórico completo
            if (verification.exists && verification.previousAnswers && verification.previousAnswers.length > 0) {
                // Busca todos os elementos únicos das respostas anteriores
                const uniqueElementIds = [...new Set(verification.previousAnswers.map(a => a.surveyElementId))];
                
                // Busca os elementos em paralelo usando o serviço
                const elementPromises = uniqueElementIds.map(id => 
                    surveyElementApi.get(`/${id}`)
                        .then(res => res.data)
                        .catch(() => null)
                );
                
                const elements = await Promise.all(elementPromises);
                const elementsMap = new Map(elements.filter(Boolean).map((el: SurveyElementDto) => [el.id, el]));

                // Reconstrói o histórico: para cada resposta, adiciona a pergunta e a resposta
                const historyMessages: Array<QuestionMsg | ResponseMsg> = [];
                
                // Agrupa respostas por elemento para garantir ordem correta
                const answersByElement = new Map<number, typeof verification.previousAnswers>();
                for (const answer of verification.previousAnswers) {
                    if (!answersByElement.has(answer.surveyElementId)) {
                        answersByElement.set(answer.surveyElementId, []);
                    }
                    answersByElement.get(answer.surveyElementId)!.push(answer);
                }

                // Reconstrói o histórico na ordem correta
                const tempSelectedOptions = new Map<number, number | number[]>();
                
                for (const answer of verification.previousAnswers) {
                    const element = elementsMap.get(answer.surveyElementId);
                    if (element) {
                        // Adiciona a pergunta apenas uma vez antes da primeira resposta desse elemento
                        const isFirstAnswerForElement = 
                            verification.previousAnswers.indexOf(answer) === 
                            verification.previousAnswers.findIndex(a => a.surveyElementId === answer.surveyElementId);
                        
                        if (isFirstAnswerForElement) {
                            historyMessages.push({ kind: 'question', element });
                        }
                        
                        // Adiciona a resposta do usuário
                        let responseText = '';
                        if (answer.optionId && answer.optionId > 0) {
                            // Busca a descrição da opção
                            const option = element.options?.find(opt => opt.id === answer.optionId);
                            responseText = option?.description || `Opção ${answer.optionId}`;
                            
                            // Salva a seleção para manter visualmente selecionado
                            const existing = tempSelectedOptions.get(answer.surveyElementId);
                            if (Array.isArray(existing)) {
                                // Se já existe um array, adiciona a esta opção
                                if (!existing.includes(answer.optionId)) {
                                    tempSelectedOptions.set(answer.surveyElementId, [...existing, answer.optionId]);
                                }
                            } else if (typeof existing === 'number') {
                                // Se já existe um número, converte para array (múltipla escolha)
                                tempSelectedOptions.set(answer.surveyElementId, [existing, answer.optionId]);
                            } else {
                                // Primeira seleção para este elemento
                                tempSelectedOptions.set(answer.surveyElementId, answer.optionId);
                            }
                        } else if (answer.inputResponse) {
                            responseText = answer.inputResponse;
                        }
                        
                        if (responseText) {
                            historyMessages.push({ kind: 'response', text: responseText, align: 'right' });
                        }
                    }
                }
                
                // Atualiza o estado de seleções com o histórico
                setSelectedOptionsByElement(tempSelectedOptions);

                // Adiciona a resposta do telefone e a pergunta inicial no início do histórico
                historyMessages.unshift(
                    { kind: 'response', text: phone, align: 'right' },
                    { kind: 'response', text: 'Olá! Para começar, por favor informe seu número de telefone.', align: 'left' }
                );

                // Define as mensagens do histórico completo
                setMessages(historyMessages);

                if (verification.finished) {
                    // Questionário já foi finalizado
                    setMessages((prev) => [
                        ...prev,
                        { kind: 'response', text: 'Você já completou este questionário anteriormente. Obrigado!', align: 'left' },
                    ]);
                    setCurrentElementId(null);
                } else if (verification.nextElementId) {
                    // Continua de onde parou
                    setCurrentElementId(verification.nextElementId);
                } else {
                    // Começa do início
                    setCurrentElementId(survey.firstSurveyElement ?? null);
                }
            } else if (verification.exists && verification.finished) {
                // Questionário já foi finalizado mas sem histórico
                setMessages((prev) => [
                    ...prev,
                    { kind: 'response', text: 'Você já completou este questionário anteriormente. Obrigado!', align: 'left' },
                ]);
                setCurrentElementId(null);
            } else {
                // Novo usuário, começa do início
                // Adiciona a resposta do telefone às mensagens
                setMessages((prev) => [
                    ...prev,
                    { kind: 'response', text: phone, align: 'right' },
                ]);
                
                // Tenta pegar o primeiro elemento de várias fontes
                let firstElementId = verification.nextElementId;
                if (!firstElementId) {
                    firstElementId = survey.firstSurveyElement ?? null;
                }
                // Se ainda não tem, tenta pegar do flow
                if (!firstElementId && survey.flow) {
                    try {
                        const flowNodes = typeof survey.flow.nodes === 'string' 
                            ? JSON.parse(survey.flow.nodes) 
                            : survey.flow.nodes;
                        if (Array.isArray(flowNodes) && flowNodes.length > 0) {
                            // Pega o primeiro nó do flow
                            const firstNode = flowNodes[0];
                            if (firstNode && firstNode.id) {
                                // Extrai o ID do elemento do formato "element-{id}" ou apenas o número
                                const nodeId = String(firstNode.id);
                                const elementIdMatch = nodeId.match(/element-(\d+)/);
                                firstElementId = elementIdMatch 
                                    ? parseInt(elementIdMatch[1], 10) 
                                    : (isNaN(parseInt(nodeId, 10)) ? null : parseInt(nodeId, 10));
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao parsear flow:', e);
                    }
                }
                
                setCurrentElementId(firstElementId);
            }

            setPhoneVerified(true);
            setPhoneInput('');
        } catch (err) {
            console.error('Erro ao verificar telefone:', err);
            setMessages((prev) => [
                ...prev,
                { kind: 'response', text: 'Erro ao verificar telefone. Tente novamente.', align: 'left' },
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Se ainda não verificou o telefone, processa o telefone
        if (!phoneVerified) {
            await handlePhoneSubmit(e);
            return;
        }

        const text = input.trim();
        if (!text || !currentElement || !isTextInputElement(currentElement)) return;

        await handleQuestionSend({
            surveyId: survey.id,
            elementId: currentElement.id,
            value: text,
        });
        setInput('');
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
                        {!phoneVerified && messages.length === 0 && (
                            <SpeechBubble
                                isQuestion={false}
                                responseText='Olá! Para começar, por favor informe seu número de telefone.'
                                align='left'
                            />
                        )}

                        {phoneVerified && messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                                Carregando questionário...
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            if (msg.kind === 'question') {
                                // Debug: verifica se o elemento tem opções
                                console.log('Renderizando pergunta:', {
                                    elementId: msg.element.id,
                                    description: msg.element.description,
                                    type: msg.element.type,
                                    options: msg.element.options,
                                    optionsCount: msg.element.options?.length || 0
                                });
                                
                                // Obtém opções selecionadas para este elemento (se houver)
                                const selectedForElement = selectedOptionsByElement.get(msg.element.id);
                                const selectedOptionId = typeof selectedForElement === 'number' ? selectedForElement : null;
                                const selectedOptions = Array.isArray(selectedForElement) ? selectedForElement : [];

                                return (
                                    <SpeechBubble
                                        key={`q-${msg.element.id}-${idx}`}
                                        element={msg.element}
                                        isQuestion
                                        surveyId={survey.id}
                                        align={'left'}
                                        onSend={(payload: SendPayload) => handleQuestionSend(payload)}
                                        selectedOptionId={selectedOptionId}
                                        selectedOptions={selectedOptions}
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
                    {/* Só mostra o input se não for elemento de seleção ou se ainda não verificou o telefone */}
                    {(!phoneVerified || !isSelectionElement(currentElement)) && (
                    <form onSubmit={handleSubmit} className='chatbot-input-wrapper'>
                        <Button type='button' variant='ghost' size='icon' className='attachment-icon'>
                            <Paperclip className='w-5 h-5 icon-orange' />
                        </Button>

                            <Input
                                value={phoneVerified ? input : phoneInput}
                                onChange={(e) => {
                                    if (phoneVerified) {
                                        setInput(e.target.value);
                                    } else {
                                        handlePhoneInputChange(e);
                                    }
                                }}
                                maxLength={phoneVerified ? undefined : 15} // Máscara: (XX) XXXXX-XXXX = 15 caracteres
                            placeholder={
                                isProcessing
                                    ? 'Processando...'
                                    : !phoneVerified
                                    ? '(XX) XXXXX-XXXX'
                                    : isTextInputElement(currentElement)
                                    ? 'Digite sua resposta aqui...'
                                    : 'Selecione uma opção acima...'
                            }
                            className='chatbot-input'
                                disabled={
                                    isProcessing ||
                                    (phoneVerified && (!currentElement || !isTextInputElement(currentElement)))
                                }
                            />

                            <Button 
                                type='submit' 
                                variant='ghost' 
                                size='icon' 
                                className='send-icon'
                                disabled={
                                    isProcessing ||
                                    (!phoneVerified && !phoneInput.trim()) ||
                                    (phoneVerified && (!currentElement || !isTextInputElement(currentElement)))
                                }
                            >
                            <ArrowRight className='w-5 h-5' color='#e46f2c' />
                        </Button>
                    </form>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
