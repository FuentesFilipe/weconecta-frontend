import {
    SurveysElementsPayload,
    SurveysElementsResponse,
} from '@/dtos/SurveysElementsDto';
import QUERY_KEYS from '@/utils/contants/queries';
import { useQuery } from '@tanstack/react-query';
import { surveyElementApi } from '.';

export const useGetAllSurveysElements = (payload: SurveysElementsPayload) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
        queryFn: async () =>
            (
                await surveyElementApi.get<SurveysElementsResponse[]>('', {
                    params: payload,
                })
            ).data,
    });

export const useGetSurveysElementById = (surveysElementId?: number) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS, surveysElementId],
        queryFn: async () =>
            (
                await surveyElementApi.get<SurveysElementsResponse>(
                    `/${surveysElementId}`,
                )
            ).data,
        enabled: !!surveysElementId,
    });
