/**
 * ============================================
 *  Firebase Admin SDK Initialization
 * ============================================
 *  Supports two modes:
 *    A) Service-account JSON file (local dev)
 *    B) Inline JSON via env var  (cloud deploy)
 */

const admin = require('firebase-admin');

const initializeFirebase = () => {
  // Prevent re-initialization if already done
  if (admin.apps.length) {
    return admin;
  }

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // --- Option B: Inline JSON string (e.g. Render / AWS / Vercel) ---
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // --- Option A: Path to JSON file (local development) ---
    // eslint-disable-next-line global-require
    const serviceAccount = require(
      require('path').resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    );
    credential = admin.credential.cert(serviceAccount);
  } else {
    console.error('❌ Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.');
    process.exit(1);
  }

  admin.initializeApp({ credential });
  console.log('✅ Firebase Admin SDK initialized');

  return admin;
};

module.exports = initializeFirebase;
