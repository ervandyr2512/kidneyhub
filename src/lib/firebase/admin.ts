// ============================================================
// KidneyHub - Firebase Admin SDK
// Untuk operasi server-side (API routes, middleware).
// Service account: firebase-adminsdk-fbsvc@kidneyhub-id.iam.gserviceaccount.com
// ============================================================

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

let adminApp: App | null = null;

/**
 * Inisialisasi Firebase Admin SDK.
 * Menggunakan FIREBASE_ADMIN_CREDENTIAL (JSON string) untuk deployment,
 * atau FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH (path file) untuk development lokal.
 */
function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  // Opsi 1: JSON credential string (cocok untuk environment variables di hosting)
  if (process.env.FIREBASE_ADMIN_CREDENTIAL) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL,
    });
    return adminApp;
  }

  // Opsi 2: Path ke file serviceAccountKey.json (untuk development lokal)
  if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL,
    });
    return adminApp;
  }

  throw new Error(
    'Firebase Admin: Set FIREBASE_ADMIN_CREDENTIAL or FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH in .env.local'
  );
}

/** Firebase Admin Auth — untuk verifikasi ID token dari client */
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/** Firebase Admin Realtime Database — untuk operasi server-side */
export function getAdminDb() {
  return getDatabase(getAdminApp());
}

/**
 * Verifikasi Firebase ID token dari request header.
 * Gunakan di API routes yang butuh autentikasi server-side.
 *
 * Contoh penggunaan:
 *   const uid = await verifyToken(request);
 *   if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function verifyToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const idToken = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}
