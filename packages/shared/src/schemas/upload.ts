import { z } from 'zod'

export const fileTypeSchema = z.enum(['pdf', 'pptx', 'csv', 'apkg'])
export type FileType = z.infer<typeof fileTypeSchema>

// CSV and .apkg imports skip 'generating' — they go uploaded → extracting → complete
export const uploadStatusSchema = z.enum([
  'uploaded',
  'extracting',
  'generating',
  'complete',
  'error',
])
export type UploadStatus = z.infer<typeof uploadStatusSchema>

export const uploadSchema = z.object({
  id: z.string().min(1),
  firebase_uid: z.string().min(1),
  file_name: z.string().min(1),
  gcs_path: z.string().nullable(),
  file_type: fileTypeSchema,
  status: uploadStatusSchema,
  created_at: z.string().datetime(),
})

export type Upload = z.infer<typeof uploadSchema>

export const createUploadSchema = uploadSchema.omit({ id: true, created_at: true, firebase_uid: true })
export type CreateUploadInput = z.infer<typeof createUploadSchema>
