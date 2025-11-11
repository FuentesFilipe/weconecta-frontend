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
