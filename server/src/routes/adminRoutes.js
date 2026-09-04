const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const { seedDatabase } = require('../seeds/seedData');

const router = express.Router();

router.get('/stats', authenticate, adminController.getDashboardStats);

router.post('/seed', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Sample college knowledge base seeded successfully.',
      ...result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
