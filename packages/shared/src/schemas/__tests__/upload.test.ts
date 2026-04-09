import { describe, it, expect } from 'vitest'
import { fileTypeSchema, uploadStatusSchema, uploadSchema } from '../upload'

const validUpload = {
  id: 'upload-abc123',
  firebase_uid: 'uid-abc123',
  file_name: 'lecture.pdf',
  gcs_path: 'uploads/uid-abc123/lecture.pdf',
  file_type: 'pdf',
  status: 'uploaded',
  created_at: '2024-01-15T10:30:00.000Z',
}

describe('fileTypeSchema', () => {
  const validTypes = ['pdf', 'pptx', 'csv', 'apkg'] as const

  it.each(validTypes)('accepts "%s"', (type) => {
    expect(() => fileTypeSchema.parse(type)).not.toThrow()
  })

  it('rejects an unlisted file type', () => {
    expect(fileTypeSchema.safeParse('docx').success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(fileTypeSchema.safeParse('').success).toBe(false)
  })

  it('rejects uppercase variant', () => {
    expect(fileTypeSchema.safeParse('PDF').success).toBe(false)
  })
})

describe('uploadStatusSchema', () => {
  const validStatuses = ['uploaded', 'extracting', 'generating', 'complete', 'error'] as const

  it.each(validStatuses)('accepts "%s"', (status) => {
    expect(() => uploadStatusSchema.parse(status)).not.toThrow()
  })

  it('rejects an unlisted status', () => {
    expect(uploadStatusSchema.safeParse('pending').success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(uploadStatusSchema.safeParse('').success).toBe(false)
  })
})

describe('uploadSchema', () => {
  it('accepts a valid upload with a GCS path', () => {
    expect(() => uploadSchema.parse(validUpload)).not.toThrow()
  })

  it('accepts a null gcs_path for CSV and apkg uploads', () => {
    expect(uploadSchema.safeParse({ ...validUpload, gcs_path: null, file_type: 'csv' }).success).toBe(true)
    expect(uploadSchema.safeParse({ ...validUpload, gcs_path: null, file_type: 'apkg' }).success).toBe(true)
  })

  it('rejects a missing gcs_path — must be null or string, not absent', () => {
    const { gcs_path: _, ...upload } = validUpload
    expect(uploadSchema.safeParse(upload).success).toBe(false)
  })

  it('rejects an empty file_name', () => {
    expect(uploadSchema.safeParse({ ...validUpload, file_name: '' }).success).toBe(false)
  })

  it('rejects an empty firebase_uid', () => {
    expect(uploadSchema.safeParse({ ...validUpload, firebase_uid: '' }).success).toBe(false)
  })

  it('rejects an empty id', () => {
    expect(uploadSchema.safeParse({ ...validUpload, id: '' }).success).toBe(false)
  })

  it.each(['pdf', 'pptx', 'csv', 'apkg'] as const)('accepts file_type "%s"', (file_type) => {
    expect(uploadSchema.safeParse({ ...validUpload, file_type }).success).toBe(true)
  })

  it('rejects an invalid file_type', () => {
    expect(uploadSchema.safeParse({ ...validUpload, file_type: 'txt' }).success).toBe(false)
  })

  it.each(['uploaded', 'extracting', 'generating', 'complete', 'error'] as const)('accepts status "%s"', (status) => {
    expect(uploadSchema.safeParse({ ...validUpload, status }).success).toBe(true)
  })

  it('rejects an invalid status', () => {
    expect(uploadSchema.safeParse({ ...validUpload, status: 'processing' }).success).toBe(false)
  })

  it('rejects a date-only created_at string', () => {
    expect(uploadSchema.safeParse({ ...validUpload, created_at: '2024-01-15' }).success).toBe(false)
  })

  it('rejects a non-ISO created_at string', () => {
    expect(uploadSchema.safeParse({ ...validUpload, created_at: 'Jan 15 2024' }).success).toBe(false)
  })

  it('strips unknown fields', () => {
    const result = uploadSchema.safeParse({ ...validUpload, unexpected_field: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>)['unexpected_field']).toBeUndefined()
    }
  })
})
