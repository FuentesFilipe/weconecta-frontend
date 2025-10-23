import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from '../utils/stores/auth';

export type HttpClient = {
    url: string;
} & AxiosInstance;

export const createHttpClient = (url: string, parent?: HttpClient) => {
    const baseUrl = parent ? parent.url + url : url;

    const httpClient = axios.create({
        baseURL: baseUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        paramsSerializer: { dots: true }
    }) as HttpClient;
    httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    httpClient.url = baseUrl;

    return httpClient;
};
