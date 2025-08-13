import { useQuery } from '@tanstack/react-query'
import QUERY_KEYS from '../../../utils/contants/queries'
import { exampleApi } from '.'
import { ListWrapperDto } from '../../../dtos/PaginatedDto'
import { ExampleDto } from '../../../dtos/ExampleDto'

export const useGetAllExamples = (exampleId?: number) =>
	useQuery({
		queryKey: [QUERY_KEYS.EXAMPLES],
		queryFn: async () =>
			(
				await exampleApi.get<ListWrapperDto<ExampleDto>>('/', {
					params: { exampleId }
				})
			).data.data
	})

export const useGetExampleById = (exampleId?: number) =>
	useQuery({
		queryKey: [QUERY_KEYS.EXAMPLES + exampleId],
		queryFn: async () => (await exampleApi.get<ExampleDto>(`/${exampleId}`)).data,
		enabled: !!exampleId
	})
