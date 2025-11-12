import { baseApi } from '../..';
import { createHttpClient } from '../../http-client';

// Cria uma instância separada do authApi para logout
// Isso evita conflitos com o loginApi que modifica o baseURL do authApi compartilhado
export const logoutApi = createHttpClient('/auth', baseApi);

