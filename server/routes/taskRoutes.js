/**
 * ============================================
 *  Daily Task Routes
 * ============================================
 *  GET /api/tasks/:planId/:date   → get tasks for a day
 *  PUT /api/tasks/:taskId         → update / complete task
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { validateGetTasks, validateUpdateTask } = require('../middleware/validators');
const { getTasksByDate, updateTask } = require('../controllers/taskController');

// All task routes require authentication
router.use(authenticate);

router.get('/:planId/:date', validateGetTasks, getTasksByDate);
router.put('/:taskId', validateUpdateTask, updateTask);

module.exports = router;
