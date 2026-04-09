import { apiClient } from '@/lib/axios'
import type { Upload } from '@deckforge/shared'

export async function fetchUploads(): Promise<Upload[]> {
  const res = await apiClient.get<Upload[]>('/uploads')
  return res.data
}

export async function fetchUpload(id: string): Promise<Upload> {
  const res = await apiClient.get<Upload>(`/uploads/${id}`)
  return res.data
}

export async function initUpload(file: File): Promise<Upload> {
  const formData = new FormData()
  // Field name must match multer's upload.single('file') config on the server
  formData.append('file', file)
  // Do NOT set Content-Type — Axios sets multipart/form-data with boundary automatically
  const res = await apiClient.post<Upload>('/uploads/init', formData)
  return res.data
}
