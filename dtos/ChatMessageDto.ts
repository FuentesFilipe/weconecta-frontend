import { SurveyElementOption, SurveyElementType } from './SurveysElementsDto';

export type ChatRole = 'BOT' | 'USER' | 'SYSTEM'


export type ChatMessageDto = {
    id: string;
    surveyId: number;
    surveyElementId?: number;
    role: ChatRole;
    type: SurveyElementType;
    content: string;
    options?: SurveyElementOption[];
    createdAt: string;
};

// reposta de historico de conversa
export type ChatHistoryResponse = {
    messages: ChatMessageDto[];
    hasMore?: boolean;
    nextCursor?: string | null;
};

// payload para enviar a resposta do user ao backend
export type SendAnswerRequest = {
    surveyId: number;
    clientId: string;
    content?: string;
    surveyElementId?: number;
    selectedOptionsIds?: number[];
};

// resposta do backend ao enviar, pode vir como append ou messages
export type NextResponseDto = 
| {appended: ChatMessageDto[]; done?: boolean}
| {messages: ChatMessageDto[]; done?: boolean};