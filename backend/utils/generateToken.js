const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userType: user.userType,
      email: user.email 
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;