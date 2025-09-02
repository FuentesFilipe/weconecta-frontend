import { authApi } from '..';

export const loginApi = authApi;

loginApi.defaults.baseURL += '/login';
