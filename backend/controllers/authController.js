const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Trainer = require('../models/Trainer');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse } = require('../utils/tokenUtils');

/**
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new student
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, branch]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               branch: { type: string }
 *               rollNumber: { type: string }
 *               cgpa: { type: number }
 *     responses:
 *       201: { description: Student registered successfully }
 *       400: { description: Validation error }
 */
exports.registerStudent = async (req, res) => {
  const { email, password, firstName, lastName, branch, rollNumber, cgpa, phone } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }
  
  const user = await User.create({ email, password, role: 'student', isApproved: false });
  
  const student = await Student.create({
    user: user._id, firstName, lastName, branch,
    rollNumber: rollNumber || undefined,
    cgpa: cgpa || undefined,
    phone: phone || undefined
  });
  
  res.status(201).json({
    success: true,
    message: 'Registration successful. Awaiting admin approval.',
    data: { userId: user._id, studentId: student._id, email: user.email }
  });
};

/**
 * @swagger
 * /api/auth/register/company:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new company
 *     security: []
 */
exports.registerCompany = async (req, res) => {
  const { email, password, companyName, hrName, hrEmail, sector, hrPhone } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }
  
  const user = await User.create({ email, password, role: 'company', isApproved: false });
  
  await Company.create({
    user: user._id, companyName, hrName,
    hrEmail: hrEmail || email,
    sector: sector || 'IT',
    hrPhone: hrPhone || undefined
  });
  
  res.status(201).json({
    success: true,
    message: 'Company registration successful. Awaiting admin approval.',
    data: { userId: user._id, email: user.email }
  });
};

/**
 * @swagger
 * /api/auth/register/trainer:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new trainer
 *     security: []
 */
exports.registerTrainer = async (req, res) => {
  const { email, password, firstName, lastName, specialization, designation } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }
  
  const user = await User.create({ email, password, role: 'trainer', isApproved: false });
  
  await Trainer.create({
    user: user._id, firstName, lastName,
    specialization: specialization ? [specialization] : [],
    designation: designation || 'Trainer'
  });
  
  res.status(201).json({
    success: true,
    message: 'Trainer registration successful. Awaiting admin approval.',
    data: { userId: user._id, email: user.email }
  });
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login for all roles
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  
  // Prevent role spoofing
  if (role && user.role !== role) {
    return res.status(403).json({ success: false, message: 'Access denied. Role mismatch.' });
  }
  
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);
  
  // Store refresh token
  user.refreshTokens.push({ token: refreshToken });
  if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  
  // Get profile info
  let profileData = null;
  if (user.role === 'student') {
    profileData = await Student.findOne({ user: user._id }).select('firstName lastName branch profilePicture');
  } else if (user.role === 'company') {
    profileData = await Company.findOne({ user: user._id }).select('companyName logo hrName');
  } else if (user.role === 'trainer') {
    profileData = await Trainer.findOne({ user: user._id }).select('firstName lastName profilePicture');
  }
  
  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      profile: profileData,
      notifications: user.notifications?.filter(n => !n.isRead).slice(0, 10) || []
    }
  });
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required.' });
  }
  
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }
    
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked.' });
    }
    
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);
    
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke tokens
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }
  
  res.json({ success: true, message: 'Logged out successfully.' });
};

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change user password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  
  user.password = newPassword;
  user.refreshTokens = []; // invalidate all sessions
  await user.save();
  
  res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current logged-in user
 */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id });
  } else if (user.role === 'company') {
    profile = await Company.findOne({ user: user._id });
  } else if (user.role === 'trainer') {
    profile = await Trainer.findOne({ user: user._id });
  }
  
  res.json({ success: true, data: { user, profile } });
};

/**
 * @swagger
 * /api/auth/notifications:
 *   get:
 *     tags: [Auth]
 *     summary: Get user notifications
 */
exports.getNotifications = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user.notifications || [] });
};

/**
 * @swagger
 * /api/auth/notifications/read:
 *   put:
 *     tags: [Auth]
 *     summary: Mark all notifications as read
 */
exports.markNotificationsRead = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { 'notifications.$[].isRead': true }
  });
  res.json({ success: true, message: 'All notifications marked as read.' });
};
