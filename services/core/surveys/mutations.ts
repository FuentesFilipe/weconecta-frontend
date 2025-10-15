import { SurveyDto } from '@/dtos/SurveyDto';
import { SurveysElementsResponse } from '@/dtos/SurveysElementsDto';
import { queryClient } from '@/services/query-client';
import QUERY_KEYS from '@/utils/contants/queries';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { surveyApi } from '.';

export const useSurveysCreateMutation = (payload: SurveyDto) =>
    useMutation({
        mutationFn: () =>
            surveyApi
                .post('', payload)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS],
            });
            const verb = payload.id ? 'atualizado' : 'criado';
            toast.success(`Questionário ${verb} com sucesso!`);
        },
    });

export const useSurveysDeleteMutation = (payload: SurveyDto) =>
    useMutation({
        mutationFn: () =>
            surveyApi
                .delete(`/${payload.id}`)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS],
            });
            toast.success('Questionário deletado com sucesso!');
        },
    });
