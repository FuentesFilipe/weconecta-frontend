'use client';

import SpeechBubble from '@/components/SpeechBubble';
import { SurveyElementType } from '@/dtos/SurveysElementsDto';

const optionElement = {
    id: 1,
    description: 'Você possui alguma dor na região da lombar?',
    type: SurveyElementType.OPTION,
    options: [
        { id: 11, description: 'Sim' },
        { id: 12, description: 'Não' },
    ],
};

const multiElement = {
    id: 2,
    description: 'Quais regiões do corpo doem?',
    type: SurveyElementType.MULTIPLE_CHOICE,
    options: [
        { id: 21, description: 'Lombar' },
        { id: 22, description: 'Cervical' },
        { id: 23, description: 'Joelho' },
    ],
};

const inputElement = {
    id: 3,
    description: 'Descreva a intensidade da dor:',
    type: SurveyElementType.INPUT,
    options: [],
};

export default function TestBubblesPage() {
    const handleSend = async (payload: any) => {
        // Aqui você integra com seu mutation do react-query.
        // Para teste rápido apenas logamos e mostramos um alerta.
        // eslint-disable-next-line no-console
        console.log('onSend payload:', payload);
        await new Promise((r) => setTimeout(r, 300));
        alert('Enviado (simulado): ' + JSON.stringify(payload));
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Question — OPTION</h2>
            <SpeechBubble
                element={optionElement as any}
                isQuestion
                surveyId={42}
                onSend={handleSend}
                align='left'
            />

            <h2 style={{ marginTop: 32 }}>Question — MULTIPLE_CHOICE</h2>
            <SpeechBubble
                element={multiElement as any}
                isQuestion
                surveyId={42}
                onSend={handleSend}
                align='left'
            />

            <h2 style={{ marginTop: 32 }}>Question — INPUT</h2>
            <SpeechBubble
                element={inputElement as any}
                isQuestion
                surveyId={42}
                onSend={handleSend}
                align='left'
            />

            <h2 style={{ marginTop: 32 }}>Response bubble</h2>
            <SpeechBubble isQuestion={false} responseText='Sim' align='right' />
        </div>
    );
}
