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

export interface MonthlyAnswerData {
    month: string;
    count: number;
}

/**
 * Busca respostas agrupadas por mês
 * GET /core/survey-answer/history/monthly?months=6
 */
export const getAnswersGroupedByMonth = async (
    months: number = 6,
): Promise<MonthlyAnswerData[]> => {
    const res = await surveyAnswerApi.get<MonthlyAnswerData[]>('/history/monthly', {
        params: { months },
    });
    return res.data;
};

export interface MonthlyComparison {
    currentMonth: number;
    previousMonth: number;
}

/**
 * Busca comparação de respostas entre mês atual e anterior
 * GET /core/survey-answer/history/monthly-comparison
 */
export const getAnswersByCurrentAndPreviousMonth = async (): Promise<MonthlyComparison> => {
    const res = await surveyAnswerApi.get<MonthlyComparison>('/history/monthly-comparison');
    return res.data;
};

export interface TopSurveyAnswer {
    surveyId: number;
    count: number;
}

/**
 * Busca top questionários por número de respostas
 * GET /core/survey-answer/history/top-surveys?limit=6
 */
export const getTopSurveysAnswers = async (
    limit: number = 6,
): Promise<TopSurveyAnswer[]> => {
    const res = await surveyAnswerApi.get<TopSurveyAnswer[]>('/history/top-surveys', {
        params: { limit },
    });
    return res.data;
};

