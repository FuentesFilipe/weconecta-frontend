import { ExampleDto } from '@/dtos/ExampleDto';
import { ListWrapperDto } from '@/dtos/PaginatedDto';
import QUERY_KEYS from '@/utils/contants/queries';
import { useQuery } from '@tanstack/react-query';
import { surveyElementApi } from '.';

export const useGetAllSurveysElements = (surveyId?: number) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS],
        queryFn: async () =>
            (
                await surveyElementApi.get<ListWrapperDto<ExampleDto>>('/', {
                    params: { surveyId },
                })
            ).data.data,
    });

export const useGetSurveysElementById = (surveysElementId?: number) =>
    useQuery({
        queryKey: [QUERY_KEYS.SURVEYS_ELEMENTS + surveysElementId],
        queryFn: async () =>
            (await surveyElementApi.get<ExampleDto>(`/${surveysElementId}`))
                .data,
        enabled: !!surveysElementId,
    });
