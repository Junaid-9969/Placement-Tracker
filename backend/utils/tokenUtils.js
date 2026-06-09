const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

exports.generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

exports.sendTokenResponse = (user, statusCode, res) => {
  const accessToken = exports.generateAccessToken(user._id, user.role);
  const refreshToken = exports.generateRefreshToken(user._id, user.role);
  
  const userObj = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    notifications: user.notifications || []
  };
  
  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userObj
  });
};
