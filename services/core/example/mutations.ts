import { useMutation } from '@tanstack/react-query'
import { ExampleDto } from '../../../dtos/ExampleDto'
import { exampleApi } from '.'
import { queryClient } from '../../query-client'
import QUERY_KEYS from '../../../utils/contants/queries'

export const useExampleMutation = (payload: ExampleDto) =>
	useMutation({
		mutationFn: () => exampleApi.post('', payload).then((res) => res.data as ExampleDto),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXAMPLES] })
	})
