import { coreApi } from '..';
import { createHttpClient } from '../../http-client';

export const usersApi = createHttpClient('/users', coreApi);

