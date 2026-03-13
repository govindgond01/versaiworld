const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ✅ REGISTER USER
exports.register = async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    const { 
      name, 
      email, 
      password, 
      role, // This should be 'userType' in your model
      phone,
      studentCategory,
      staffRole,
      cource
    } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and password' 
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    // Validate role/userType
    const allowedUserTypes = ['admin', 'student', 'staff'];
    const userType = role || 'student';
    
    if (!allowedUserTypes.includes(userType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }
    
    // Additional validations based on userType
    if (userType === 'student' && !studentCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Student category is required for students' 
      });
    }
    
    if (userType === 'staff' && !staffRole) {
      return res.status(400).json({ 
        success: false,
        message: 'Staff role is required for staff' 
      });
    }
    
    // Create user
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      userType,
      status: 'active',
      profileImage: req.body.profileImage || '',
      cource: cource || ''
    };
    
    // Add specific fields based on userType
    if (userType === 'student') {
      userData.studentCategory = studentCategory || 'academy';
      userData.membershipDuration = '1_month';
    }
    
    if (userType === 'staff') {
      userData.staffRole = staffRole;
      userData.salaryType = 'monthly';
    }
    
    const user = await User.create(userData);
    
    // ✅ CORRECTED: Pass entire user object to generateToken
    const token = generateToken(user);
    
    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      cource: user.cource,
      createdAt: user.createdAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.salaryType;
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is inactive. Please contact administrator.' 
      });
    }

    // ✅ CORRECTED: Pass entire user object to generateToken
    const token = generateToken(user);

    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // userType -> role mapping for frontend
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      cource: user.cource,
      createdAt: user.createdAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.expiryDate;
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.financials?.salaryType;
    }
    
    if (user.userType === 'admin') {
      userResponse.isAdmin = true;
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// ✅ GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      cource: user.cource,
      address: user.address,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.expiryDate;
      
      // Financial info for students
      userResponse.financials = user.financials || {};
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.financials?.salaryType;
      userResponse.joinDate = user.joinDate;
      
      // Financial info for staff
      userResponse.financials = user.financials || {};
    }
    
    if (user.userType === 'admin') {
      userResponse.isAdmin = true;
    }
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// ✅ LOGOUT (Optional - client-side token removal)
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};