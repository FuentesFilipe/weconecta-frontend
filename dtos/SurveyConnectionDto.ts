import type { SurveysElementsResponse } from './SurveysElementsDto';

export type SurveyConnectionDto = {
    optionId: number;
    nextElementId: number | null;
};

export type SurveyGraphPayload = {
    elements: SurveysElementsResponse[];
    connections: SurveyConnectionDto[];
};