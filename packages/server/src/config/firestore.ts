import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAdminApp } from './firebase'

let db: Firestore | undefined

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp())
    // preferRest avoids gRPC/protobufjs which crashes on Node.js 22 (buffer bounds bug)
    db.settings({ preferRest: true })
  }
  return db
}
