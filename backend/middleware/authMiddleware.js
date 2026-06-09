const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }
    
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: 'Password was recently changed. Please log in again.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please refresh.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Role-based authorization - prevent role spoofing
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }
    next();
  };
};

// Check if account is approved
exports.requireApproval = (req, res, next) => {
  if (!req.user.isApproved && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval. Please wait.'
    });
  }
  next();
};
