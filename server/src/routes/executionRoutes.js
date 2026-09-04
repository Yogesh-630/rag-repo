const express = require('express');
const executionController = require('../controllers/executionController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticate, executionController.listExecutions);
router.get('/:id', authenticate, executionController.getExecutionById);

module.exports = router;
