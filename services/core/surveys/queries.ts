import { SurveyDto, SurveyPayload, SurveyResponse } from '@/dtos/SurveyDto';
import QUERY_KEYS from '@/utils/contants/queries';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '.';

export const useGetAllSurveys = (payload: SurveyPayload) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS, payload],
        queryFn: async () =>
            (
                await surveyApi.get<SurveyResponse>('', {
                    params: payload,
                })
            ).data,
    });

export const useGetSurveysById = (surveyId?: number) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS, surveyId],
        queryFn: async () =>
            (await surveyApi.get<SurveyDto>(`/${surveyId}`)).data,
        enabled: !!surveyId,
    });
