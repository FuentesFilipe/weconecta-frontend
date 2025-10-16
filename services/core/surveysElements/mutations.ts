import {
    SurveysElementsCreateDto,
    SurveysElementsResponse,
} from '@/dtos/SurveysElementsDto';
import { queryClient } from '@/services/query-client';
import QUERY_KEYS from '@/utils/contants/queries';
import { useMutation } from '@tanstack/react-query';
import { surveyElementApi } from '.';

export const useSurveysElementsCreateMutation = (
    payload: SurveysElementsCreateDto,
) =>
    useMutation({
        mutationFn: () =>
            surveyElementApi
                .post('', payload)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            }),
    });

export const useSurveysElementsUpdateMutation = (
    id: number,
    payload: SurveysElementsCreateDto,
) =>
    useMutation({
        mutationFn: () =>
            surveyElementApi
                .put(`/${id}`, payload)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            }),
    });
