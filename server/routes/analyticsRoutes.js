/**
 * ============================================
 *  Analytics Routes
 * ============================================
 *  GET /api/analytics → aggregated study analytics
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(authenticate);

router.get('/', getAnalytics);

module.exports = router;
