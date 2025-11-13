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

export interface CompleteSurveyDTO {
    userId: string;
    surveyId: number;
}

export const useCompleteSurveyMutation = () =>
    useMutation({
        mutationFn: (payload: CompleteSurveyDTO) =>
            surveyApi.post('/complete', payload).then((res) => res.data),
        onSuccess: () => {
            toast.success('Questionário finalizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error('Erro ao finalizar questionário. Tente novamente.');
            console.error('Error completing survey:', error);
        },
    });

export interface SaveFlowPayload {
    surveyId: number;
    nodes: any[];
    edges: any[];
}

export const useSurveysSaveFlowMutation = (
    surveyId: number,
    payload: SaveFlowPayload,
) =>
    useMutation({
        mutationFn: () => {
            // Usa o endpoint que aceita nodes/edges diretamente
            // O backend converte automaticamente para o formato de flow
            const canvas = {
                nodes: payload.nodes,
                edges: payload.edges,
            };
            return surveyApi
                .post(`/${payload.surveyId}/flow`, canvas)
                .then((res) => res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS, surveyId],
            });
            toast.success('Fluxo salvo com sucesso!');
        },
        onError: (error: any) => {
            toast.error('Erro ao salvar fluxo. Tente novamente.');
            console.error('Error saving flow:', error);
        },
    });
