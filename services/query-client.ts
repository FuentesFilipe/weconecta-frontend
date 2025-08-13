import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry(failureCount, error) {
				return failureCount < 3 && error instanceof Error && error.message === 'Network Error'
			},
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false
		}
	}
})
