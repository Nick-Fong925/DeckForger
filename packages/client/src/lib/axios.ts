import axios, { type InternalAxiosRequestConfig } from 'axios'
import { auth } from './firebase'

const BASE_URL =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:8080'

export const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.request.use(async (config) => {
  const { currentUser } = auth
  if (currentUser) {
    const token = await currentUser.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// On 401, force-refresh the Firebase token and retry the request once
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)
    const config = error.config as RetryableConfig | undefined
    const { currentUser } = auth
    if (error.response?.status === 401 && currentUser && config && !config._retry) {
      config._retry = true
      const token = await currentUser.getIdToken(true)
      config.headers.Authorization = `Bearer ${token}`
      return apiClient(config)
    }
    return Promise.reject(error)
  },
)
