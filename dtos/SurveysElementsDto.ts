export type SurveysElementsCreateDto = {
    description: string;
    type: SurveyElementType;
    options: SurveyElementOption[];
};

export type SurveysElementsCreateResponse = {
    id: number;
    description: string;
    type: SurveyElementType;
    options: SurveyElementOption[];
    deletedAt: Date | null;
};

type SurveyElementOption = {
    description: string;
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
