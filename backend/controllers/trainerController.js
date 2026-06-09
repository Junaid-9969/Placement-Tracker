const Trainer = require('../models/Trainer');
const Student = require('../models/Student');

exports.getMyProfile = async (req, res) => {
  const trainer = await Trainer.findOne({ user: req.user._id })
    .populate('user', 'email isApproved')
    .populate('assignedStudents', 'firstName lastName branch cgpa placementStatus readinessScore');
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer profile not found.' });
  res.json({ success: true, data: trainer });
};

exports.updateProfile = async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'specialization', 'designation', 'bio', 'experience'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  
  const trainer = await Trainer.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
  res.json({ success: true, message: 'Profile updated.', data: trainer });
};

exports.getAssignedStudents = async (req, res) => {
  const { search, branch, placementStatus } = req.query;
  const trainer = await Trainer.findOne({ user: req.user._id });
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
  
  const query = { _id: { $in: trainer.assignedStudents } };
  if (branch) query.branch = branch;
  if (placementStatus) query.placementStatus = placementStatus;
  if (search) query.$or = [
    { firstName: new RegExp(search, 'i') },
    { lastName: new RegExp(search, 'i') }
  ];
  
  const students = await Student.find(query)
    .populate('user', 'email isApproved')
    .sort({ readinessScore: -1 });
  
  res.json({ success: true, data: students, count: students.length });
};

exports.updateStudentReadiness = async (req, res) => {
  const { readinessScore, feedback, category } = req.body;
  const trainer = await Trainer.findOne({ user: req.user._id });
  
  if (!trainer.assignedStudents.includes(req.params.studentId)) {
    return res.status(403).json({ success: false, message: 'Student not assigned to you.' });
  }
  
  const updates = {};
  if (readinessScore !== undefined) updates.readinessScore = readinessScore;
  
  if (feedback) {
    const student = await Student.findById(req.params.studentId);
    student.trainerFeedback.unshift({ trainer: trainer._id, feedback, category: category || 'overall' });
    if (readinessScore !== undefined) student.readinessScore = readinessScore;
    await student.save();
    return res.json({ success: true, message: 'Feedback and readiness updated.', data: student });
  }
  
  const student = await Student.findByIdAndUpdate(req.params.studentId, updates, { new: true });
  res.json({ success: true, message: 'Readiness score updated.', data: student });
};

exports.getAllTrainers = async (req, res) => {
  const trainers = await Trainer.find()
    .populate('user', 'email isApproved isActive')
    .select('-assignedStudents');
  res.json({ success: true, data: trainers });
};

exports.getTrainerById = async (req, res) => {
  const trainer = await Trainer.findById(req.params.id)
    .populate('user', 'email isApproved')
    .populate('assignedStudents', 'firstName lastName branch cgpa');
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
  res.json({ success: true, data: trainer });
};

exports.getTrainerDashboard = async (req, res) => {
  const trainer = await Trainer.findOne({ user: req.user._id });
  if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found.' });
  
  const students = await Student.find({ _id: { $in: trainer.assignedStudents } });
  
  const placed = students.filter(s => s.placementStatus === 'placed').length;
  const shortlisted = students.filter(s => s.placementStatus === 'shortlisted').length;
  const notPlaced = students.filter(s => s.placementStatus === 'not_placed').length;
  const highReadiness = students.filter(s => s.readinessScore >= 70).length;
  const lowReadiness = students.filter(s => s.readinessScore < 40).length;
  const avgReadiness = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (s.readinessScore || 0), 0) / students.length)
    : 0;

  const stats = {
    totalAssigned: students.length,
    placed, shortlisted, notPlaced, avgReadiness, highReadiness, lowReadiness
  };
  
  const recentStudents = await Student.find({ _id: { $in: trainer.assignedStudents } })
    .populate('user', 'email').sort({ updatedAt: -1 }).limit(10);
  
  res.json({ success: true, data: { stats, recentStudents, trainer } });
};
