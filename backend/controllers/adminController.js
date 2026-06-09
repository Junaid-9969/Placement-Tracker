const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Trainer = require('../models/Trainer');
const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getPendingApprovals = async (req, res) => {
  const pendingUsers = await User.find({ isApproved: false, role: { $ne: 'admin' } })
    .sort({ createdAt: -1 });
  
  const enriched = await Promise.all(pendingUsers.map(async (user) => {
    let profile = null;
    if (user.role === 'student') profile = await Student.findOne({ user: user._id }).select('firstName lastName branch');
    if (user.role === 'company') profile = await Company.findOne({ user: user._id }).select('companyName hrName sector');
    if (user.role === 'trainer') profile = await Trainer.findOne({ user: user._id }).select('firstName lastName');
    return { user, profile };
  }));
  
  res.json({ success: true, data: enriched });
};

exports.approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isApproved: true },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  
  user.addNotification('Your account has been approved! You can now access all features.', 'success');
  await user.save({ validateBeforeSave: false });
  
  res.json({ success: true, message: `${user.role} account approved.`, data: user });
};

exports.rejectUser = async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  
  user.isActive = false;
  user.addNotification(`Your registration was rejected. Reason: ${reason || 'Not provided'}`, 'error');
  await user.save({ validateBeforeSave: false });
  
  res.json({ success: true, message: 'User rejected.' });
};

exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { isActive: user.isActive } });
};

exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, role, search, isApproved } = req.query;
  const query = {};
  
  if (role) query.role = role;
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  if (search) query.email = new RegExp(search, 'i');
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query)
  ]);
  
  res.json({
    success: true, data: users,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
};

exports.getAdminDashboard = async (req, res) => {
  const [
    totalStudents, totalCompanies, totalTrainers,
    pendingApprovals, totalJobs, totalApplications,
    placedStudents, shortlistedStudents, activeJobs
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'company' }),
    User.countDocuments({ role: 'trainer' }),
    User.countDocuments({ isApproved: false, role: { $ne: 'admin' } }),
    Job.countDocuments(),
    Application.countDocuments(),
    Student.countDocuments({ placementStatus: 'placed' }),
    Student.countDocuments({ placementStatus: 'shortlisted' }),
    Job.countDocuments({ status: 'active', isApproved: true })
  ]);
  
  const approvedStudents = await User.countDocuments({ role: 'student', isApproved: true });
  const placementPercentage = approvedStudents > 0 ? Math.round((placedStudents / approvedStudents) * 100) : 0;
  
  // Recent activity
  const [recentStudents, recentCompanies, recentJobs] = await Promise.all([
    Student.find().populate('user', 'email isApproved createdAt').sort({ createdAt: -1 }).limit(5),
    Company.find().populate('user', 'email isApproved createdAt').sort({ createdAt: -1 }).limit(5),
    Job.find().populate('company', 'companyName').sort({ createdAt: -1 }).limit(5)
  ]);
  
  // Branch-wise placement stats
  const branchStats = await Student.aggregate([
    { $match: { placementStatus: 'placed' } },
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      stats: {
        totalStudents, totalCompanies, totalTrainers, pendingApprovals,
        totalJobs, totalApplications, placedStudents, shortlistedStudents,
        activeJobs, placementPercentage, approvedStudents
      },
      recentActivity: { recentStudents, recentCompanies, recentJobs },
      branchStats
    }
  });
};

exports.assignTrainer = async (req, res) => {
  const { studentId, trainerId } = req.body;
  
  const [student, trainer] = await Promise.all([
    Student.findById(studentId),
    Trainer.findById(trainerId)
  ]);
  
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
  
  student.assignedTrainer = trainerId;
  await student.save();
  
  if (!trainer.assignedStudents.includes(studentId)) {
    trainer.assignedStudents.push(studentId);
    await trainer.save();
  }
  
  res.json({ success: true, message: 'Trainer assigned to student.' });
};

exports.getPlacementStats = async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student', isApproved: true });
  
  const stats = await Student.aggregate([
    { $group: {
      _id: '$placementStatus',
      count: { $sum: 1 },
      avgCGPA: { $avg: '$cgpa' }
    }}
  ]);
  
  const applicationStats = await Application.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]);
  
  const topCompanies = await Application.aggregate([
    { $match: { status: 'selected' } },
    { $group: { _id: '$company', hired: { $sum: 1 } } },
    { $sort: { hired: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    { $project: { companyName: '$company.companyName', hired: 1 } }
  ]);
  
  res.json({ success: true, data: { totalStudents, placementStats: stats, applicationStats, topCompanies } });
};
