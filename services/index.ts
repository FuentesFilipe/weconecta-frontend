import { createHttpClient } from './http-client';

export const baseApi = createHttpClient((process.env.API_BASE_URL || '') + '/api');
