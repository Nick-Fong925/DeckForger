import path from 'path'
import { getFirestoreDb } from '../config/firestore'
import { uploadSchema, type Upload, type UploadStatus, type FileType } from '@deckforge/shared'
import { normalizeTimestamps } from './firestoreUtils'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

function parseDoc(id: string, data: FirebaseFirestore.DocumentData): Upload | null {
  const result = uploadSchema.safeParse({ ...normalizeTimestamps(data), id })
  if (!result.success) return null
  return result.data
}

export async function listUploadsByUid(uid: string): Promise<Upload[]> {
  const db = getFirestoreDb()
  const snapshot = await db
    .collection('uploads')
    .where('firebase_uid', '==', uid)
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.flatMap((doc: QueryDocumentSnapshot) => {
    const upload = parseDoc(doc.id, doc.data())
    return upload ? [upload] : []
  })
}

export async function createUpload(
  uid: string,
  fileName: string,
  fileType: FileType,
  localPath: string,
): Promise<Upload> {
  const db = getFirestoreDb()
  const ref = db.collection('uploads').doc()
  const now = new Date().toISOString()
  const data = {
    firebase_uid: uid,
    file_name: path.basename(fileName),
    file_type: fileType,
    gcs_path: localPath,
    status: 'uploaded' as UploadStatus,
    created_at: now,
  }
  await ref.set(data)
  return uploadSchema.parse({ ...data, id: ref.id })
}

export async function updateUploadStatus(id: string, status: UploadStatus): Promise<void> {
  const db = getFirestoreDb()
  await db.collection('uploads').doc(id).update({ status })
}

export async function getUploadById(id: string, uid: string): Promise<Upload | null> {
  const db = getFirestoreDb()
  const doc = await db.collection('uploads').doc(id).get()
  if (!doc.exists || !doc.data()) return null

  const data = normalizeTimestamps(doc.data()!)
  if (data['firebase_uid'] !== uid) return null

  return parseDoc(doc.id, doc.data()!)
}

// For internal use only (webhooks) — no uid ownership check
export async function getUploadByIdUnscoped(id: string): Promise<Upload | null> {
  const db = getFirestoreDb()
  const doc = await db.collection('uploads').doc(id).get()
  if (!doc.exists || !doc.data()) return null
  return parseDoc(doc.id, doc.data()!)
}
