const express = require('express');
const router = express.Router();
const { protect, authorize, requireApproval } = require('../middleware/authMiddleware');
const {
  createJob, getAllJobs, getJobById, updateJob,
  deleteJob, approveJob, getCompanyJobs
} = require('../controllers/jobController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

router.use(protect);

const jobValidation = [
  body('title').notEmpty().trim().withMessage('Job title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('deadline').isISO8601().withMessage('Valid deadline required'),
  validate
];

router.get('/', getAllJobs);
router.get('/my-jobs', authorize('company'), getCompanyJobs);
router.get('/:id', getJobById);
router.post('/', authorize('company'), requireApproval, jobValidation, createJob);
router.put('/:id', authorize('company', 'admin'), updateJob);
router.delete('/:id', authorize('company', 'admin'), deleteJob);
router.put('/:id/approve', authorize('admin'), approveJob);

module.exports = router;
