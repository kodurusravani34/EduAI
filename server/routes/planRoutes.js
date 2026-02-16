/**
 * ============================================
 *  Study Plan Routes
 * ============================================
 *  POST   /api/plans        → create AI-generated plan
 *  GET    /api/plans        → list all user plans
 *  GET    /api/plans/:id    → get single plan
 *  PUT    /api/plans/:id    → update plan
 *  DELETE /api/plans/:id    → delete plan
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { validateCreatePlan, validateUpdatePlan } = require('../middleware/validators');
const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');

// All plan routes require authentication
router.use(authenticate);

router.post('/', validateCreatePlan, createPlan);
router.get('/', getPlans);
router.get('/:id', getPlan);
router.put('/:id', validateUpdatePlan, updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
