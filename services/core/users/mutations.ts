import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/services/query-client';
import QUERY_KEYS from '@/utils/contants/queries';
import { usersApi, UserItemDto, UserSearchParams } from '.';

export interface CreateUserDto {
    email: string;
    friendlyName: string;
    phone?: string;
    role?: 'ADMIN' | 'MEMBER';
}

export interface UpdateUserDto {
    friendlyName?: string;
    phone?: string;
    role?: 'ADMIN' | 'MEMBER';
    blockedAt?: Date | null;
}

export const useCreateUserMutation = () =>
    useMutation({
        mutationFn: (payload: CreateUserDto) =>
            usersApi.post<UserItemDto>('', payload).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS],
            });
            toast.success('Membro criado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Erro ao criar membro';
            toast.error(errorMessage);
        },
    });

export const useUpdateUserMutation = () =>
    useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserDto }) =>
            usersApi.put<UserItemDto>(`/${userId}`, payload).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS],
            });
            toast.success('Membro atualizado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Erro ao atualizar membro';
            toast.error(errorMessage);
        },
    });

export const useBlockUserMutation = () =>
    useMutation({
        mutationFn: (userId: string) =>
            usersApi.put<UserItemDto>(`/${userId}/block`).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS],
            });
            toast.success('Membro bloqueado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Erro ao bloquear membro';
            toast.error(errorMessage);
        },
    });

export const useUnblockUserMutation = () =>
    useMutation({
        mutationFn: (userId: string) =>
            usersApi.put<UserItemDto>(`/${userId}/unblock`).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS],
            });
            toast.success('Membro desbloqueado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Erro ao desbloquear membro';
            toast.error(errorMessage);
        },
    });

export const useDeleteUserMutation = () =>
    useMutation({
        mutationFn: (userId: string) =>
            usersApi.delete(`/${userId}`).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USERS],
            });
            toast.success('Membro deletado com sucesso!');
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Erro ao deletar membro';
            toast.error(errorMessage);
        },
    });

