const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingApprovals, approveUser, rejectUser, toggleUserStatus,
  getAllUsers, getAdminDashboard, assignTrainer, getPlacementStats
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/pending-approvals', getPendingApprovals);
router.put('/approve/:userId', approveUser);
router.put('/reject/:userId', rejectUser);
router.put('/toggle-status/:userId', toggleUserStatus);
router.get('/users', getAllUsers);
router.post('/assign-trainer', assignTrainer);
router.get('/placement-stats', getPlacementStats);

module.exports = router;
