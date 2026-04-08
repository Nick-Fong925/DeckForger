import axios from 'axios'
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
