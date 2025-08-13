import { authApi } from '..'
import { createHttpClient } from '../../http-client'

export const loginApi = createHttpClient('/login', authApi)
