/**
 * ============================================
 *  Firebase Admin SDK Initialization
 * ============================================
 *  Supports two modes:
 *    A) Service-account JSON file (local dev)
 *    B) Inline JSON via env var  (cloud deploy)
 */

const admin = require("firebase-admin");
const path = require("path");

const initializeFirebase = () => {
  // Prevent multiple initializations
  if (admin.apps.length) {
    return admin;
  }

  let credential;

  // =====================================================
  // OPTION B — Inline JSON (Render / Vercel / Cloud)
  // =====================================================
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      );

      // 🔥 CRITICAL: Fix private key formatting
      if (serviceAccount.private_key) {
        serviceAccount.private_key =
          serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      credential = admin.credential.cert(serviceAccount);

      console.log("🔥 Firebase using INLINE JSON credentials");

    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON");
      console.error(err);
      process.exit(1);
    }

  // =====================================================
  // OPTION A — File path (Local development only)
  // =====================================================
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const resolvedPath = path.resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      );

      // eslint-disable-next-line global-require
      const serviceAccount = require(resolvedPath);

      credential = admin.credential.cert(serviceAccount);

      console.log("🔥 Firebase using FILE PATH credentials");

    } catch (err) {
      console.error("❌ Failed to load service account file");
      console.error(err);
      process.exit(1);
    }

  // =====================================================
  // NO CONFIG FOUND
  // =====================================================
  } else {
    console.error(
      "❌ Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH"
    );
    process.exit(1);
  }

  // Initialize Firebase Admin
  admin.initializeApp({ credential });

  console.log("✅ Firebase Admin SDK initialized");

  return admin;
};

module.exports = initializeFirebase;
