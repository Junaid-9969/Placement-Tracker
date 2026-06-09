const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  const [
    totalStudents, totalCompanies, totalJobs, totalApplications,
    placedStudents, shortlistedStudents, selectedApplications
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isApproved: true }),
    User.countDocuments({ role: 'company', isApproved: true }),
    Job.countDocuments({ isApproved: true }),
    Application.countDocuments(),
    Student.countDocuments({ placementStatus: 'placed' }),
    Student.countDocuments({ placementStatus: 'shortlisted' }),
    Application.countDocuments({ status: 'selected' })
  ]);
  
  const placementPercentage = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;
  
  // Monthly applications trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyApplications = await Application.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Branch-wise stats
  const branchStats = await Student.aggregate([
    { $group: {
      _id: '$branch',
      total: { $sum: 1 },
      placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
      avgCGPA: { $avg: '$cgpa' }
    }},
    { $sort: { total: -1 } }
  ]);
  
  // Company-wise hiring
  const companyHiring = await Application.aggregate([
    { $match: { status: 'selected' } },
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    { $project: { companyName: '$company.companyName', sector: '$company.sector', count: 1 } }
  ]);
  
  // Application status distribution
  const statusDistribution = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Top skills in demand
  const skillsDemand = await Job.aggregate([
    { $unwind: '$requiredSkills' },
    { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: {
        totalStudents, totalCompanies, totalJobs, totalApplications,
        placedStudents, shortlistedStudents, selectedApplications, placementPercentage
      },
      monthlyApplications,
      branchStats,
      companyHiring,
      statusDistribution,
      skillsDemand
    }
  });
};
