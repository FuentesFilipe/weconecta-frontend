import { useMutation } from '@tanstack/react-query'
import { loginApi } from '.'
import { AuthDto, LoginDto } from '../../../dtos/AuthDto'

export const useLoginMutation = (payload: LoginDto) =>
	useMutation({
		mutationFn: () => loginApi.post('', payload).then((res) => res.data as AuthDto)
	})
