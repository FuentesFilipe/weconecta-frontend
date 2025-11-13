import { coreApi } from '..';
import { createHttpClient } from '../../http-client';

export const surveyApi = createHttpClient('/surveys', coreApi);

// Minimal payload shape for sending survey element responses
export type SurveyResponsePayload = {
    elementId?: number;
    value: string | number | number[];
};

/**
 * Explicit helper to POST a survey response to the backend.
 * POST /surveys/{surveyId}/responses
 */
export const sendSurveyResponse = async (
    surveyId: number,
    payload: SurveyResponsePayload,
) => {
    const url = `/${surveyId}/responses`;
    const res = await surveyApi.post(url, payload);
    return res.data as unknown;
};

export interface MonthlySurveyData {
    month: string;
    count: number;
}

/**
 * Busca questionários agrupados por mês
 * GET /core/surveys/history/monthly?months=12
 */
export const getSurveysGroupedByMonth = async (
    months: number = 12,
): Promise<MonthlySurveyData[]> => {
    const res = await surveyApi.get<MonthlySurveyData[]>('/history/monthly', {
        params: { months },
    });
    return res.data;
};
