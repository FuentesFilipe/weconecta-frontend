import { coreApi } from '..';
import { createHttpClient } from '../../http-client';

export const surveyAnswerApi = createHttpClient('/survey-answer', coreApi);

export interface ReceiveMessagePayload {
    identifier: string;
    clientId: string;
    surveyId: number;
    currentSurveyElementId: number;
    optionId?: number;
    message?: string;
}

export interface NextResponse {
    nextSurveyElementId: number | null;
    finished: boolean;
}

/**
 * Envia uma resposta do usuário e recebe o próximo elemento do fluxo
 * POST /core/survey-answer
 */
export const sendSurveyAnswer = async (
    payload: ReceiveMessagePayload,
): Promise<NextResponse> => {
    const res = await surveyAnswerApi.post<NextResponse>('', payload);
    return res.data;
};

export interface VerifyPhonePayload {
    phone: string;
    surveyId: number;
}

export interface PreviousAnswer {
    surveyElementId: number;
    optionId: number | null;
    inputResponse: string | null;
    createdAt: string;
}

export interface VerifyPhoneResponse {
    exists: boolean;
    identifier: string;
    clientId?: string;
    nextElementId: number | null;
    finished: boolean;
    previousAnswers?: PreviousAnswer[];
}

/**
 * Verifica se o telefone já está registrado e retorna o estado do questionário
 * POST /core/survey-answer/verify-phone
 */
export const verifyPhone = async (
    payload: VerifyPhonePayload,
): Promise<VerifyPhoneResponse> => {
    const res = await surveyAnswerApi.post<VerifyPhoneResponse>('/verify-phone', payload);
    return res.data;
};

export interface SurveyStatistics {
    totalStarted: number;
    totalFinished: number;
    totalInProgress: number;
}

/**
 * Busca estatísticas de um questionário
 * GET /core/survey-answer/statistics/:surveyId
 */
export const getSurveyStatistics = async (
    surveyId: number,
): Promise<SurveyStatistics> => {
    const res = await surveyAnswerApi.get<SurveyStatistics>(`/statistics/${surveyId}`);
    return res.data;
};

