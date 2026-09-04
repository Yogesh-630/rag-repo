const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// List documents (accessible to authenticated users, students and admins)
router.get('/', authenticate, documentController.getDocuments);

// Single document details
router.get('/:id', authenticate, documentController.getDocumentById);

// Upload new document (admin only)
router.post('/upload', authenticate, requireAdmin, upload.single('file'), documentController.uploadDocument);

// Delete document (admin only)
router.delete('/:id', authenticate, requireAdmin, documentController.deleteDocument);

// Trigger re-indexing (admin only)
router.post('/:id/reindex', authenticate, requireAdmin, documentController.reindexDocument);

module.exports = router;
