import type { SurveyGraphPayload } from '@/dtos/SurveyConnectionDto';
import { SurveyElementType } from '@/dtos/SurveysElementsDto';

export const MockGraph: SurveyGraphPayload = {
    elements: [
        {
            id: 1,
            description: 'Pergunta inicial',
            type: SurveyElementType.MULTIPLE_CHOICE,
            options: [{ id: 10, description: 'Sim' }, { id: 11, description: 'Não' }],
            deletedAt: null
        },

        { 
            id: 2, 
            description: 'Pergunta de follow-up', 
            type: SurveyElementType.INPUT, 
            options: [], 
            deletedAt: null 
        },

        { 
            id: 3, 
            description: 'Mensagem final', 
            type: SurveyElementType.MESSAGE, 
            options: [], 
            deletedAt: null 
        }


    ],
    connections: [
        { optionId: 10, nextElementId: 2 },
        { optionId: 11, nextElementId: 3 }
    ]
};