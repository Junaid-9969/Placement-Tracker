const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(protect);
router.get('/', authorize('admin', 'trainer'), getAnalytics);
router.get('/trainer', authorize('trainer'), getAnalytics);

module.exports = router;
