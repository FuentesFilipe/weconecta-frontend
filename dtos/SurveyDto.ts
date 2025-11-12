export type SurveysElementsPayload = {
    description?: string;
};

export type SurveyDto = {
    id?: number;
    title: string;
    description: string;
    url: string;
    flow: null | {
        nodes: string;
        edges: string;
    };
    firstSurveyElement: number | null;
};

export type SurveyResponse = {
    0: SurveyDto[];
    1: number;
};

export type SurveyPayload = {
    search?: string;
    page?: number;
    limit?: number;
};
