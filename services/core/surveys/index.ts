import { coreApi } from '..';
import { createHttpClient } from '../../http-client';

export const surveyApi = createHttpClient('/surveys', coreApi);
