import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAdminApp } from './firebase'

export function getFirestoreDb(): Firestore {
  return getFirestore(getAdminApp())
}
