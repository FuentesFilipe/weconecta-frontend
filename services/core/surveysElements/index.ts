import { coreApi } from '..';
import { createHttpClient } from '../../http-client';

export const surveyElementApi = createHttpClient('/surveys-elements', coreApi);
