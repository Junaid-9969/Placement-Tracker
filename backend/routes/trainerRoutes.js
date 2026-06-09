const express = require('express');
const router = express.Router();
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');
const {
  getMyProfile, updateProfile, getAssignedStudents,
  updateStudentReadiness, getAllTrainers, getTrainerById, getTrainerDashboard
} = require('../controllers/trainerController');

router.use(protect);

router.get('/profile', authorize('trainer'), getMyProfile);
router.put('/profile', authorize('trainer'), updateProfile);
router.get('/dashboard', authorize('trainer'), requireApproval, getTrainerDashboard);
router.get('/students', authorize('trainer'), requireApproval, getAssignedStudents);
router.put('/students/:studentId/readiness', authorize('trainer'), requireApproval, updateStudentReadiness);

router.get('/', authorize('admin'), getAllTrainers);
router.get('/:id', authorize('admin', 'trainer'), getTrainerById);

module.exports = router;
