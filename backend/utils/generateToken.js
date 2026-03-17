const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userType: user.userType,
      email: user.email 
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '15m' } // Short-lived access token
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userType: user.userType
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '30d' } // Long-lived refresh token
  );
};

module.exports = { generateToken, generateRefreshToken };