import { coreApi } from '..'
import { createHttpClient } from '../../http-client'

export const exampleApi = createHttpClient('/example', coreApi)
