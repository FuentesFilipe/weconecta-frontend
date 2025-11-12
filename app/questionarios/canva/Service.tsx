import type { SurveyGraphPayload } from '@/dtos/SurveyConnectionDto';
import { MockGraph } from './MockGraph';

export async function getSurveyGraph(_surveyId: number | string): Promise <SurveyGraphPayload> {
    return MockGraph;
}


/* USANDO O MOCK NO MOMENTO, DEPOIS TROCAR POR FETCH */