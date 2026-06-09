const express = require('express');
const router = express.Router();
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');
const {
  applyForJob, getMyApplications, getApplicationById,
  getCompanyApplications, updateApplicationStatus,
  withdrawApplication, getAllApplications
} = require('../controllers/applicationController');

router.use(protect);

// Student routes
router.post('/apply/:jobId', authorize('student'), requireApproval, applyForJob);
router.get('/my', authorize('student'), getMyApplications);
router.put('/:id/withdraw', authorize('student'), withdrawApplication);

// Company routes
router.get('/company', authorize('company'), requireApproval, getCompanyApplications);
router.put('/:id/status', authorize('company', 'admin'), updateApplicationStatus);

// Admin routes
router.get('/', authorize('admin'), getAllApplications);

// Shared
router.get('/:id', authorize('student', 'company', 'admin', 'trainer'), getApplicationById);

module.exports = router;
