import {
    SurveyElementDto,
    SurveyElementOption,
    SurveyElementType,
} from '@/dtos/SurveysElementsDto';
import { surveyApi } from '@/services/core/surveys';
import React, { useMemo, useState } from 'react';
import './index.css';
type SendPayload = {
    surveyId?: number;
    elementId?: number;
    value: string | number | number[];
};

type Props = {
    element?: SurveyElementDto | null;
    isQuestion?: boolean; // question (true) or response (false)
    surveyId?: number;
    align?: 'left' | 'right';
    onSend?: (payload: SendPayload) => Promise<unknown> | void;
    responseText?: string; // when rendering an answer bubble
};

export const SpeechBubble: React.FC<Props> = ({
    element = null,
    isQuestion = true,
    surveyId,
    align = 'left',
    onSend,
    responseText,
}) => {
    const [text, setText] = useState('');
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
        null,
    );
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const type = element?.type;
    
    // Debug: log do elemento recebido
    React.useEffect(() => {
        if (element) {
            console.log('SpeechBubble recebeu elemento:', {
                id: element.id,
                description: element.description,
                type: element.type,
                options: element.options,
                optionsLength: element.options?.length || 0
            });
        }
    }, [element]);

    const isSelectionType = useMemo(() => {
        if (!type) return false;
        // Normaliza o tipo para comparação (pode vir como string ou enum)
        const normalizedType = String(type).toUpperCase();
        const isSelection = (
            normalizedType === 'OPTION' ||
            normalizedType === 'MULTIPLE_CHOICE' ||
            normalizedType === SurveyElementType.OPTION ||
            normalizedType === SurveyElementType.MULTIPLE_CHOICE
        );
        console.log('isSelectionType:', isSelection, 'type:', type, 'normalizedType:', normalizedType);
        return isSelection;
    }, [type]);

    // Filtra opções deletadas e garante que temos opções válidas
    const options = useMemo(() => {
        if (!element?.options) {
            console.log('Elemento sem opções:', element);
            return [];
        }
        const filtered = element.options.filter((opt: SurveyElementOption) => !opt.deletedAt);
        console.log('Opções filtradas:', filtered);
        return filtered;
    }, [element?.options]);

    const isTextEnabled = !isSelectionType && isQuestion;

    const toggleMultiple = (optId: number) => {
        setSelectedOptions((prev) =>
            prev.includes(optId)
                ? prev.filter((id) => id !== optId)
                : [...prev, optId],
        );
    };

    const defaultSend = async (payload: SendPayload): Promise<unknown> => {
        // best-effort default: POST to /surveys/{surveyId}/responses
        if (!surveyId) throw new Error('surveyId is required for default send');
        const url = `/${surveyId}/responses`;
        return surveyApi.post(url, payload).then((r) => r.data as unknown);
    };

    const handleSend = async () => {
        if (!element && !responseText) return;
        const payload: SendPayload = {
            surveyId,
            elementId: element?.id,
            value: '',
        };

        if (isSelectionType) {
            if (type === SurveyElementType.OPTION) {
                if (selectedOptionId == null) return;
                payload.value = selectedOptionId;
            } else {
                // MULTIPLE_CHOICE
                if (selectedOptions.length === 0) return;
                payload.value = selectedOptions;
            }
        } else {
            // INPUT or MESSAGE
            if (!text) return;
            payload.value = text;
        }

        try {
            setLoading(true);
            if (onSend) {
                await onSend(payload);
            } else {
                await defaultSend(payload);
            }
            // simple reset after send
            setText('');
            setSelectedOptionId(null);
            setSelectedOptions([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isQuestion) {
        // render a simple response bubble
        return (
            <div className={`sb ${align === 'right' ? 'sb-right' : 'sb-left'}`}>
                <div className='sb-bubble sb-response'>
                    <div className='sb-response-title'>Usuário</div>
                    <div className='sb-response-text'>{responseText}</div>
                </div>
            </div>
        );
    }

    // Question UI
    if (!element) {
        return null;
    }

    return (
        <div className={`sb ${align === 'right' ? 'sb-right' : 'sb-left'}`}>
            <div className='sb-bubble sb-question'>
                <div className='sb-title' style={{ color: '#000000', fontWeight: 700 }}>Empresa A</div>
                <div className='sb-description' style={{ color: '#000000', fontWeight: 400, display: 'block', visibility: 'visible', opacity: 1 }}>
                    {element.description || 'Sem descrição'}
                </div>

                {isSelectionType && (
                    <div className='sb-options' style={{ display: 'block', visibility: 'visible' }}>
                        {options.length > 0 ? (
                            options.map((opt: SurveyElementOption, i) => {
                                // Não mostra opções deletadas
                                if (opt.deletedAt) return null;
                                
                                const optKey = opt.id ?? i;
                                const optId = opt.id ?? i; // fallback to index if id missing
                                
                                const description = opt.description?.trim() || `Opção ${i + 1}`;
                                
                                return (
                                    <label
                                        key={`opt-${optKey}`}
                                        className='sb-option'
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', visibility: 'visible', opacity: 1 }}
                                    >
                                        {String(type).toUpperCase() === 'OPTION' ? (
                                            <input
                                                type='radio'
                                                name={`opt-${element.id}`}
                                                checked={selectedOptionId === optId}
                                                onChange={() =>
                                                    setSelectedOptionId(optId)
                                                }
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                        ) : (
                                            <input
                                                type='checkbox'
                                                checked={selectedOptions.includes(
                                                    optId,
                                                )}
                                                onChange={() =>
                                                    toggleMultiple(optId)
                                                }
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                        )}
                                        <span 
                                            className='sb-option-text' 
                                            style={{ 
                                                color: '#000000', 
                                                fontWeight: 400, 
                                                fontSize: '14px',
                                                display: 'block', 
                                                visibility: 'visible', 
                                                opacity: 1 
                                            }}
                                        >
                                            {description}
                                        </span>
                                    </label>
                                );
                            })
                        ) : (
                            <div style={{ padding: '1rem', color: '#999', fontStyle: 'italic' }}>
                                Nenhuma opção disponível para este elemento.
                            </div>
                        )}
                    </div>
                )}

                <textarea
                    className={`sb-textarea ${isTextEnabled ? '' : 'sb-disabled'}`}
                    placeholder={
                        isTextEnabled
                            ? 'Escreva sua resposta...'
                            : 'Entrada desabilitada para este tipo de pergunta.'
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={!isTextEnabled}
                />

                <div className='sb-actions'>
                    <button
                        className='sb-send'
                        onClick={() => {
                            void handleSend();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeechBubble;
