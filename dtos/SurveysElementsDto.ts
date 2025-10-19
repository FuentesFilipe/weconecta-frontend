export type SurveyElementDto = {
    id: number;
    description: string;
    type: SurveyElementType;
    options: SurveyElementOption[];
    deletedAt: Date | null;
};

export type SurveysElementsCreateDto = {
    description: string;
    type: SurveyElementType;
    options: SurveyElementOption[];
};

export type SurveysElementsResponse = {
    id: number;
    description: string;
    type: SurveyElementType;
    options: SurveyElementOption[];
    deletedAt: Date | null;
};

export type SurveyElementOption = {
    id?: number;
    description: string;
    deletedAt?: Date | null;
};

export enum SurveyElementType {
    OPTION = 'OPTION',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    INPUT = 'INPUT',
    MESSAGE = 'MESSAGE',
}

export enum SurveyElementEnum {
    OPTION = 'Alternativa',
    MULTIPLE_CHOICE = 'MultiplaEscolha',
    INPUT = 'Input',
    MESSAGE = 'Feedback',
}

export type SurveysElementsPayload = {
    surveyId?: number;
    description?: string;
    type?: SurveyElementType;
};
