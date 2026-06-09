const Job = require('../models/Job');
const Company = require('../models/Company');
const Student = require('../models/Student');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: 'Company profile not found.' });
  if (!company.isVerified) return res.status(403).json({ success: false, message: 'Company must be verified to post jobs.' });
  
  const job = await Job.create({
    ...req.body,
    company: company._id,
    postedBy: req.user._id,
    isApproved: false
  });
  
  await Company.findByIdAndUpdate(company._id, { $inc: { totalJobsPosted: 1 } });
  
  res.status(201).json({ success: true, message: 'Job posted successfully. Awaiting admin approval.', data: job });
};

exports.getAllJobs = async (req, res) => {
  const { page = 1, limit = 10, search, status, jobType, branch, minPackage } = req.query;
  const query = {};
  
  // Students only see approved active jobs
  if (req.user?.role === 'student') {
    query.status = 'active';
    query.isApproved = true;
    query.deadline = { $gte: new Date() };
  } else {
    if (status) query.status = status;
  }
  
  if (jobType) query.jobType = jobType;
  if (minPackage) query['package.min'] = { $gte: parseInt(minPackage) };
  if (branch && branch !== 'ALL') query['eligibility.allowedBranches'] = { $in: [branch, 'ALL'] };
  if (search) query.$or = [
    { title: new RegExp(search, 'i') },
    { description: new RegExp(search, 'i') }
  ];
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'companyName logo sector headquarters')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Job.countDocuments(query)
  ]);
  
  res.json({
    success: true, data: jobs,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
};

exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'companyName logo sector website hrName hrEmail headquarters description')
    .populate('postedBy', 'email');
  
  if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
  
  // Increment view count
  await Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  
  // Check eligibility for student
  let eligibilityStatus = null;
  if (req.user?.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (student) eligibilityStatus = checkEligibility(student, job);
  }
  
  res.json({ success: true, data: job, eligibilityStatus });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
  
  // Company can only update their own jobs
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!job.company.equals(company._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job.' });
    }
  }
  
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('company', 'companyName logo');
  
  res.json({ success: true, message: 'Job updated successfully.', data: updatedJob });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
  
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!job.company.equals(company._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
  }
  
  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted.' });
};

exports.approveJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, approvedBy: req.user._id },
    { new: true }
  ).populate('company', 'companyName user');
  
  if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
  
  // Notify company
  const companyUser = await User.findById(job.company.user);
  if (companyUser) {
    companyUser.addNotification(`Your job posting "${job.title}" has been approved!`, 'success');
    await companyUser.save({ validateBeforeSave: false });
  }
  
  res.json({ success: true, message: 'Job approved.', data: job });
};

exports.getCompanyJobs = async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
  
  const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: jobs });
};

function checkEligibility(student, job) {
  const issues = [];
  const { eligibility } = job;
  
  if (eligibility.minCGPA && student.cgpa < eligibility.minCGPA) {
    issues.push(`CGPA ${student.cgpa} is below minimum ${eligibility.minCGPA}`);
  }
  if (eligibility.maxBacklogs !== undefined && student.backlogs > eligibility.maxBacklogs) {
    issues.push(`Backlogs ${student.backlogs} exceed maximum ${eligibility.maxBacklogs}`);
  }
  if (eligibility.allowedBranches?.length && 
      !eligibility.allowedBranches.includes('ALL') && 
      !eligibility.allowedBranches.includes(student.branch)) {
    issues.push(`Branch ${student.branch} not eligible`);
  }
  
  return { isEligible: issues.length === 0, issues };
}
