import { initializeApp, cert, getApps, getApp, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length === 0) {
    const projectId = process.env['FIREBASE_PROJECT_ID']
    const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON']

    if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required')

    if (serviceAccountJson) {
      // Production: JSON blob provided via environment variable (e.g. Cloud Run secret)
      // as ServiceAccount: JSON.parse returns any; Firebase's initializeApp validates
      // the credential shape at runtime and throws a clear error if it is malformed.
      // A Zod schema for ServiceAccount would duplicate Firebase's external type — not worth it.
      let serviceAccount: ServiceAccount
      try {
        serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount
      } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON')
      }
      initializeApp({ credential: cert(serviceAccount) })
    } else {
      // Local dev: GOOGLE_APPLICATION_CREDENTIALS points to the service account JSON file
      initializeApp({ projectId })
    }
  }

  return getApp()
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

// Exported solely for use by config/firestore.ts — not part of the public server API
export { getAdminApp }
