const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Company = require('../models/Company');
const User = require('../models/User');

exports.applyForJob = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });
  
  const job = await Job.findById(req.params.jobId).populate('company');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
  if (job.status !== 'active' || !job.isApproved) {
    return res.status(400).json({ success: false, message: 'This job is not accepting applications.' });
  }
  if (new Date(job.deadline) < new Date()) {
    return res.status(400).json({ success: false, message: 'Application deadline has passed.' });
  }
  
  // Check eligibility
  const { eligibility } = job;
  if (eligibility.minCGPA && student.cgpa < eligibility.minCGPA) {
    return res.status(400).json({ success: false, message: `CGPA ${student.cgpa} is below minimum required ${eligibility.minCGPA}.` });
  }
  if (eligibility.maxBacklogs !== undefined && student.backlogs > eligibility.maxBacklogs) {
    return res.status(400).json({ success: false, message: `You have ${student.backlogs} backlogs. Maximum allowed is ${eligibility.maxBacklogs}.` });
  }
  if (eligibility.allowedBranches?.length && !eligibility.allowedBranches.includes('ALL') && !eligibility.allowedBranches.includes(student.branch)) {
    return res.status(400).json({ success: false, message: `Your branch (${student.branch}) is not eligible for this job.` });
  }
  
  // Check duplicate application
  const existing = await Application.findOne({ student: student._id, job: job._id });
  if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
  
  const application = await Application.create({
    student: student._id,
    job: job._id,
    company: job.company._id,
    resumeUrl: student.resumeUrl || req.body.resumeUrl,
    coverLetter: req.body.coverLetter,
    statusHistory: [{ status: 'applied', updatedBy: req.user._id, note: 'Application submitted' }]
  });
  
  // Update job application count
  await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } });
  
  res.status(201).json({ success: true, message: 'Application submitted successfully!', data: application });
};

exports.getMyApplications = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  
  const query = { student: student._id };
  if (status) query.status = status;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('job', 'title deadline package jobType workMode')
      .populate('company', 'companyName logo sector')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Application.countDocuments(query)
  ]);
  
  res.json({
    success: true, data: applications,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
};

exports.getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('student', 'firstName lastName branch cgpa resumeUrl skills')
    .populate('job', 'title description package eligibility selectionProcess')
    .populate('company', 'companyName logo hrName hrEmail');
  
  if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
  
  res.json({ success: true, data: application });
};

exports.getCompanyApplications = async (req, res) => {
  const { page = 1, limit = 10, status, jobId } = req.query;
  const company = await Company.findOne({ user: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
  
  const query = { company: company._id };
  if (status) query.status = status;
  if (jobId) query.job = jobId;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('student', 'firstName lastName branch cgpa skills resumeUrl phone')
      .populate('job', 'title deadline')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Application.countDocuments(query)
  ]);
  
  res.json({
    success: true, data: applications,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
};

exports.updateApplicationStatus = async (req, res) => {
  const { status, note, interviewSchedule, offerDetails, companyFeedback } = req.body;
  
  const application = await Application.findById(req.params.id).populate('student');
  if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
  
  // Authorization check
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!application.company.equals(company._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
  }
  
  const previousStatus = application.status;
  application.status = status;
  application.statusHistory.push({ status, updatedBy: req.user._id, note: note || `Status changed to ${status}` });
  
  if (interviewSchedule) application.interviewSchedule = interviewSchedule;
  if (offerDetails) application.offerDetails = offerDetails;
  if (companyFeedback) application.companyFeedback = companyFeedback;
  
  await application.save();
  
  // Update student placement status
  if (status === 'selected') {
    const company = await Company.findById(application.company);
    await Student.findByIdAndUpdate(application.student._id, {
      placementStatus: 'placed',
      placedCompany: application.company,
      packageOffered: offerDetails?.package
    });
    await Company.findByIdAndUpdate(application.company, { $inc: { totalHired: 1 } });
    
    // Notify student
    const studentUser = await User.findById(application.student.user);
    if (studentUser) {
      studentUser.addNotification(`Congratulations! You've been selected at ${company?.companyName || 'the company'}!`, 'success');
      await studentUser.save({ validateBeforeSave: false });
    }
  } else if (status === 'shortlisted') {
    await Student.findByIdAndUpdate(application.student._id, { placementStatus: 'shortlisted' });
    const studentUser = await User.findById(application.student.user);
    if (studentUser) {
      studentUser.addNotification('You have been shortlisted for an interview!', 'success');
      await studentUser.save({ validateBeforeSave: false });
    }
  } else if (status === 'interview_scheduled') {
    const studentUser = await User.findById(application.student.user);
    if (studentUser && interviewSchedule) {
      studentUser.addNotification(`Interview scheduled on ${new Date(interviewSchedule.date).toLocaleDateString()}!`, 'info');
      await studentUser.save({ validateBeforeSave: false });
    }
  }
  
  res.json({ success: true, message: `Application status updated to ${status}.`, data: application });
};

exports.withdrawApplication = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const application = await Application.findOne({ _id: req.params.id, student: student._id });
  if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
  
  if (['selected', 'rejected', 'withdrawn'].includes(application.status)) {
    return res.status(400).json({ success: false, message: 'Cannot withdraw this application.' });
  }
  
  application.status = 'withdrawn';
  application.statusHistory.push({ status: 'withdrawn', updatedBy: req.user._id, note: 'Withdrawn by student' });
  await application.save();
  
  res.json({ success: true, message: 'Application withdrawn.' });
};

exports.getAllApplications = async (req, res) => {
  const { page = 1, limit = 10, status, companyId, studentId } = req.query;
  const query = {};
  if (status) query.status = status;
  if (companyId) query.company = companyId;
  if (studentId) query.student = studentId;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('student', 'firstName lastName branch')
      .populate('job', 'title')
      .populate('company', 'companyName')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Application.countDocuments(query)
  ]);
  
  res.json({
    success: true, data: applications,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
};
