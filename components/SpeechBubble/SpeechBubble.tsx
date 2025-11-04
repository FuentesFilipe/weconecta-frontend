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

    const isSelectionType = useMemo(() => {
        return (
            type === SurveyElementType.OPTION ||
            type === SurveyElementType.MULTIPLE_CHOICE
        );
    }, [type]);

    const options = element?.options ?? [];

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
    return (
        <div className={`sb ${align === 'right' ? 'sb-right' : 'sb-left'}`}>
            <div className='sb-bubble sb-question'>
                <div className='sb-title'>Empresa A</div>
                <div className='sb-description'>{element?.description}</div>

                {isSelectionType && (
                    <div className='sb-options'>
                        {options.map((opt: SurveyElementOption, i) => {
                            const optKey = opt.id ?? i;
                            const optId = opt.id ?? i; // fallback to index if id missing
                            return (
                                <label
                                    key={`opt-${optKey}`}
                                    className='sb-option'
                                >
                                    {type === SurveyElementType.OPTION ? (
                                        <input
                                            type='radio'
                                            name={`opt-${element?.id}`}
                                            checked={selectedOptionId === optId}
                                            onChange={() =>
                                                setSelectedOptionId(optId)
                                            }
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
                                        />
                                    )}
                                    <span className='sb-option-text'>
                                        {opt.description}
                                    </span>
                                </label>
                            );
                        })}
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
