import {
    SurveysElementsCreateDto,
    SurveysElementsResponse,
} from '@/dtos/SurveysElementsDto';
import { queryClient } from '@/services/query-client';
import QUERY_KEYS from '@/utils/contants/queries';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { surveyElementApi } from '.';

export const useSurveysElementsCreateMutation = (
    payload: SurveysElementsCreateDto,
) =>
    useMutation({
        mutationFn: () =>
            surveyElementApi
                .post('', payload)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            toast.success('Elemento criado com sucesso!');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            });
        },
    });

export const useSurveysElementsUpdateMutation = (
    id: number,
    payload: SurveysElementsCreateDto,
) =>
    useMutation({
        mutationFn: () =>
            surveyElementApi
                .patch(`/${id}`, payload)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            toast.success('Elemento atualizado com sucesso!');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            });
        },
    });
