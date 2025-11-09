import {
    SurveysElementsCreateDto,
    SurveysElementsResponse
} from '@/dtos/SurveysElementsDto';
import { queryClient } from '@/services/query-client';
import QUERY_KEYS from '@/utils/contants/queries';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios'; // Importar AxiosError para tipagem
import { toast } from 'react-toastify';
import { surveyElementApi } from '.';

// Helper function para extrair mensagem de erro
const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        // Tenta usar a mensagem de erro do servidor (se houver) ou a mensagem padrão do Axios
        return error.response?.data?.message || error.message;
    }
    return 'Ocorreu um erro desconhecido.';
};


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
        onError: (error) => {
            const message = getErrorMessage(error);
            toast.error(`Erro ao criar elemento: ${message}`);
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
        onError: (error) => {
            const message = getErrorMessage(error);
            toast.error(`Erro ao atualizar elemento: ${message}`);
        },
    });

export const useSurveysElementsDeleteMutation = () =>
    useMutation({
        mutationFn: (id: number) =>
            surveyElementApi
                .delete(`/${id}`)
                .then((res) => res.data as SurveysElementsResponse),
        onSuccess: () => {
            toast.success('Elemento deletado com sucesso!');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
            });
        },
        // 👇 ESTE É O BLOCO ADICIONADO PARA TRATAR O ERRO 500
        onError: (error) => {
            console.error('Falha na deleção da API:', error);
            const message = getErrorMessage(error);
            // Mensagem mais informativa sobre a provável causa do 500
            if (message.includes('500') || message.includes('Internal Server Error')) {
                toast.error('Erro no servidor. O elemento pode ter dependências no banco de dados (chaves estrangeiras).');
            } else {
                toast.error(`Erro ao deletar elemento: ${message}`);
            }
        },
    });