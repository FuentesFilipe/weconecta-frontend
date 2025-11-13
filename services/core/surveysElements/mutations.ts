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
        mutationFn: (updatedPayload?: SurveysElementsCreateDto) => {
            const payloadToUse = updatedPayload || payload;
            console.log('Enviando payload para criar elemento:', payloadToUse);
            return surveyElementApi
                .post('', payloadToUse)
                .then((res) => {
                    console.log('Elemento criado com sucesso:', res.data);
                    return res.data as SurveysElementsResponse;
                });
        },
        onSuccess: () => {
            toast.success('Elemento criado com sucesso!');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
                refetchType: 'all',
            });
        },
        onError: (error: any) => {
            console.error('Erro ao criar elemento:', error);
            toast.error('Erro ao criar elemento. Tente novamente.');
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

export const useSurveysElementsSoftDeleteMutation = () =>
    useMutation<SurveysElementsResponse, unknown, number>({
        mutationFn: (id: number) =>
            surveyElementApi
                .patch(`/${id}`, { deletedAt: new Date().toISOString() })
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            toast.success('Elemento deletado com sucesso!');

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
                refetchType: 'all',
            });
        },
        onError: (error) => {
            console.error('Falha no soft delete da API:', error);
        },
    });