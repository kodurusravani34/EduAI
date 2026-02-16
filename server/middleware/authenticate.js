/**
 * ============================================
 *  Firebase Authentication Middleware
 * ============================================
 *  - Verifies the Firebase ID token from the Authorization header
 *  - Extracts user UID
 *  - Finds or creates the User document in MongoDB
 *  - Attaches the user to req.user
 */

const admin = require('firebase-admin');
const User = require('../models/User');

/**
 * Protect routes – requires a valid Firebase ID token.
 * Usage: router.get('/me', authenticate, controller)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find existing user or create a new one (first-time login)
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      });
      console.log(`🆕 New user created: ${user.email}`);
    }

    // Attach user document & decoded token to the request
    req.user = user;
    req.firebaseUser = decodedToken;

    return next();
  } catch (error) {
    console.error('🔐 Auth error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = authenticate;
