import multer from 'multer'
import path from 'path'
import fs from 'fs'
import type { FileType } from '@deckforge/shared'

const UPLOAD_DIR = path.resolve('uploads')
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

const ALLOWED_EXTENSIONS: Record<string, FileType> = {
  '.pdf': 'pdf',
  '.pptx': 'pptx',
  '.csv': 'csv',
  '.apkg': 'apkg',
}

// ZIP magic bytes — covers PPTX and APKG (both are ZIP-based)
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF

export async function validateMagicBytes(filePath: string, fileType: FileType): Promise<boolean> {
  const buffer = Buffer.alloc(4)
  const fd = await fs.promises.open(filePath, 'r')
  try {
    await fd.read(buffer, 0, 4, 0)
  } finally {
    await fd.close()
  }
  if (fileType === 'pdf') return buffer.equals(PDF_MAGIC)
  if (fileType === 'pptx' || fileType === 'apkg') return buffer.equals(ZIP_MAGIC)
  return true // csv: no reliable magic bytes, extension check is sufficient
}

export function detectFileType(originalName: string): FileType | null {
  const ext = path.extname(originalName).toLowerCase()
  return ALLOWED_EXTENSIONS[ext] ?? null
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `${timestamp}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const fileType = detectFileType(file.originalname)
    if (!fileType) {
      cb(new Error(`Unsupported file type: ${path.extname(file.originalname)}`))
      return
    }
    cb(null, true)
  },
})
