import { useQuery } from '@tanstack/react-query';
import QUERY_KEYS from '@/utils/contants/queries';
import { usersApi } from '.';

export interface UserItemDto {
    id: string;
    email: string;
    friendlyName: string;
    phone?: string;
    role: 'ADMIN' | 'MEMBER';
    createdAt: string;
    blockedAt?: string | null;
}

export interface UserSearchParams {
    email?: string;
    friendlyName?: string;
    phone?: string;
    role?: 'ADMIN' | 'MEMBER';
}

export const useGetAllUsers = (params?: UserSearchParams) =>
    useQuery({
        queryKey: [QUERY_KEYS.USERS, params],
        queryFn: async () => {
            const response = await usersApi.get<UserItemDto[]>('', {
                params,
            });
            return response.data;
        },
    });

export const useGetUserById = (userId?: string) =>
    useQuery({
        queryKey: [QUERY_KEYS.USERS, userId],
        queryFn: async () => {
            const response = await usersApi.get<UserItemDto>(`/${userId}`);
            return response.data;
        },
        enabled: !!userId,
    });

