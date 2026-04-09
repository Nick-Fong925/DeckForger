import fs from 'fs'
import type { Upload } from '@deckforge/shared'
import { listUploadsByUid, getUploadById, createUpload, updateUploadStatus } from '../repositories/uploadRepository'
import { spawnExtractor } from './jobRunner'
import { NotFoundError, ValidationError } from '../middleware/errorHandler'
import { detectFileType, validateMagicBytes } from '../config/multer'

export async function listUploads(uid: string): Promise<Upload[]> {
  return listUploadsByUid(uid)
}

export async function getUpload(id: string, uid: string): Promise<Upload> {
  const upload = await getUploadById(id, uid)
  if (!upload) throw new NotFoundError()
  return upload
}

export async function initUpload(uid: string, file: Express.Multer.File): Promise<Upload> {
  const fileType = detectFileType(file.originalname)
  if (!fileType) throw new ValidationError(`Unsupported file type: ${file.originalname}`)

  const isValid = await validateMagicBytes(file.path, fileType)
  if (!isValid) {
    await fs.promises.unlink(file.path).catch(() => undefined)
    throw new ValidationError(`File content does not match the declared type`)
  }

  const upload = await createUpload(uid, file.originalname, fileType, file.path)
  // Spawn first so status is only updated if the spawn succeeds (avoids stuck uploads)
  spawnExtractor(upload.id)
  await updateUploadStatus(upload.id, 'extracting')
  return { ...upload, status: 'extracting' }
}
