import { useQuery } from '@tanstack/react-query';
import { getSurveyStatistics, getAnswersGroupedByMonth, getAnswersByCurrentAndPreviousMonth, getTopSurveysAnswers } from '.';
import QUERY_KEYS from '@/utils/contants/queries';

export interface SurveyStatistics {
    totalStarted: number;
    totalFinished: number;
    totalInProgress: number;
}

export const useGetSurveyStatistics = (surveyId?: number) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEY_STATISTICS, surveyId],
        queryFn: async () => {
            if (!surveyId) throw new Error('Survey ID is required');
            return getSurveyStatistics(surveyId);
        },
        enabled: !!surveyId,
    });

export const useGetAllSurveysStatistics = (surveyIds: number[]) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEY_STATISTICS, 'all', surveyIds.sort().join(',')],
        queryFn: async () => {
            if (surveyIds.length === 0) return [];
            
            // Usa Promise.allSettled para não falhar se uma requisição der erro
            const statisticsPromises = surveyIds.map(async (id) => {
                try {
                    const stats = await getSurveyStatistics(id);
                    return { status: 'fulfilled' as const, value: stats, surveyId: id };
                } catch (error) {
                    console.error(`Erro ao buscar estatísticas do questionário ${id}:`, error);
                    return { 
                        status: 'rejected' as const, 
                        reason: error, 
                        surveyId: id,
                        value: { totalStarted: 0, totalFinished: 0, totalInProgress: 0 }
                    };
                }
            });
            
            const results = await Promise.all(statisticsPromises);
            return results.map((result) => ({
                surveyId: result.surveyId,
                statistics: result.status === 'fulfilled' ? result.value : result.value,
            }));
        },
        enabled: surveyIds.length > 0,
        retry: 1, // Tenta novamente apenas uma vez em caso de erro
    });

export const useGetAnswersGroupedByMonth = (months: number = 6) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEY_STATISTICS, 'monthly', months],
        queryFn: () => getAnswersGroupedByMonth(months),
    });

export const useGetAnswersByCurrentAndPreviousMonth = () =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEY_STATISTICS, 'monthly-comparison'],
        queryFn: () => getAnswersByCurrentAndPreviousMonth(),
    });

export const useGetTopSurveysAnswers = (limit: number = 6) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEY_STATISTICS, 'top-surveys', limit],
        queryFn: () => getTopSurveysAnswers(limit),
    });

