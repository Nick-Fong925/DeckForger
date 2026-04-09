import type { JobEvent } from '@deckforge/shared'
import { updateUploadStatus, getUploadByIdUnscoped } from '../repositories/uploadRepository'
import { spawnGenerator } from './jobRunner'
import { NotFoundError, ValidationError } from '../middleware/errorHandler'

const PDF_PPTX_TYPES = new Set(['pdf', 'pptx'])
const TERMINAL_STATUSES = new Set(['complete', 'error'])

export async function handleJobComplete(event: JobEvent): Promise<void> {
  const upload = await getUploadByIdUnscoped(event.upload_id)
  if (!upload) throw new NotFoundError(`Upload ${event.upload_id} not found`)

  // Idempotency: ignore duplicate webhook calls for already-finished uploads
  if (TERMINAL_STATUSES.has(upload.status)) return

  if (event.status === 'error') {
    await updateUploadStatus(event.upload_id, 'error')
    return
  }

  if (event.job_type === 'extractor') {
    const needsGenerator = PDF_PPTX_TYPES.has(upload.file_type)
    if (needsGenerator) {
      await updateUploadStatus(event.upload_id, 'generating')
      spawnGenerator(event.upload_id)
    } else {
      await updateUploadStatus(event.upload_id, 'complete')
    }
    return
  }

  if (event.job_type === 'generator') {
    await updateUploadStatus(event.upload_id, 'complete')
    return
  }

  throw new ValidationError(`Unknown job_type: ${event.job_type}`)
}
