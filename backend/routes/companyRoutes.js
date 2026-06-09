const express = require('express');
const router = express.Router();
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');
const {
  getMyProfile, updateProfile, getAllCompanies, getCompanyById,
  verifyCompany, deleteCompany, getCompanyDashboard
} = require('../controllers/companyController');

router.use(protect);

router.get('/profile', authorize('company'), getMyProfile);
router.put('/profile', authorize('company'), updateProfile);
router.get('/dashboard', authorize('company'), requireApproval, getCompanyDashboard);

router.get('/', authorize('admin', 'trainer', 'student'), getAllCompanies);
router.get('/:id', getAllCompanies); // any logged in user
router.get('/:id', getCompanyById);
router.put('/:id/verify', authorize('admin'), verifyCompany);
router.delete('/:id', authorize('admin'), deleteCompany);

module.exports = router;
