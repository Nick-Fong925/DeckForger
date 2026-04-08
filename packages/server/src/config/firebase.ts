import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

export function getAdminAuth(): Auth {
  if (getApps().length === 0) {
    const projectId = process.env['FIREBASE_PROJECT_ID']
    const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON']

    if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required')

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      // Fall back to application default credentials (GCP environment)
      initializeApp({ projectId })
    }
  }

  return getAuth()
}
