import { z } from 'zod'

export const fileTypeSchema = z.enum(['pdf', 'pptx'])
export type FileType = z.infer<typeof fileTypeSchema>

export const uploadStatusSchema = z.enum([
  'uploaded',
  'extracting',
  'generating',
  'packaging',
  'complete',
  'error',
])
export type UploadStatus = z.infer<typeof uploadStatusSchema>

export const uploadSchema = z.object({
  id: z.string().uuid(),
  firebase_uid: z.string(),
  file_name: z.string(),
  gcs_path: z.string(),
  file_type: fileTypeSchema,
  status: uploadStatusSchema,
  created_at: z.string().datetime(),
})

export type Upload = z.infer<typeof uploadSchema>
