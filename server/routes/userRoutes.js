/**
 * ============================================
 *  User Routes
 * ============================================
 *  GET  /api/users/me            → get current user profile
 *  PUT  /api/users/preferences   → update preferences
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { validatePreferences } = require('../middleware/validators');
const { getMe, updatePreferences } = require('../controllers/userController');

// All user routes require authentication
router.use(authenticate);

router.get('/me', getMe);
router.put('/preferences', validatePreferences, updatePreferences);

module.exports = router;
