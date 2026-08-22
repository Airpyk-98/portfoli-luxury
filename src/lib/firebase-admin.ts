import * as admin from 'firebase-admin';

function formatPrivateKey(key?: string) {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
}

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return {
      adminApp: admin.app(),
      adminAuth: admin.auth(),
      adminDb: admin.firestore(),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  try {
    if (projectId && clientEmail && privateKey) {
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      return {
        adminApp: app,
        adminAuth: admin.auth(app),
        adminDb: admin.firestore(app),
      };
    } else if (projectId) {
      const app = admin.initializeApp({ projectId });
      return {
        adminApp: app,
        adminAuth: admin.auth(app),
        adminDb: admin.firestore(app),
      };
    }
  } catch (err) {
    console.warn('Firebase Admin initialize fallback (mock mode):', err);
  }

  return {
    adminApp: null,
    adminAuth: null,
    adminDb: null,
  };
}
