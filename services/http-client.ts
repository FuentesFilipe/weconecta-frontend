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
        // Só adiciona o header Authorization se houver um token válido (não null, não undefined, não vazio)
        if (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Remove o header Authorization se não houver token válido (garante que rotas públicas funcionem)
            delete config.headers.Authorization;
        }
        return config;
    });

    httpClient.url = baseUrl;

    return httpClient;
};
