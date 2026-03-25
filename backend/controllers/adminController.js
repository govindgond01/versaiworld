const User = require('../models/User');
const Payment = require('../models/Payment');

// Generate sequential student ID
const generateStudentId = async () => {
  const last = await User.findOne({ userType: "student" }, 'userId').sort({ userId: -1 });
  const lastNum = last ? parseInt(last.userId.slice(3), 10) : 0;
  return `STU${(lastNum + 1).toString().padStart(4, '0')}`;
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, activeStudents] = await Promise.all([
      User.countDocuments({ userType: 'student' }),
      User.countDocuments({ userType: 'student', status: 'active' })
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: { totalStudents, activeStudents, monthlyRevenue: monthlyRevenue[0]?.total || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Students
// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, studentCategory } = req.query;
    let query = { userType: 'student' };
    
    if (status && status !== 'all') query.status = status;
    if (studentCategory && studentCategory !== 'all') query.studentCategory = studentCategory;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }
    
    let students = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .select('-password');
    
    //  FORCE FILTER - Double check category
    if (studentCategory && studentCategory !== 'all') {
      students = students.filter(s => s.studentCategory === studentCategory);
    }
    
    const count = students.length;
    
    res.json({ 
      success: true, 
      count, 
      totalPages: Math.ceil(count / limit), 
      currentPage: page, 
      students 
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
//  FIXED: Create Student - Now handles studentCategory properly
exports.addStudent = async (req, res) => {
  try {
    const { 
      name, email, phone, totalFees, admissionDate, 
      studentType = "academy", 
      membershipDuration = "1_month", 
      course,
      studentCategory  //  ADDED - to receive category from frontend
    } = req.body;
    
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    //  Priority: studentCategory (from frontend) > studentType (backup)
    const finalCategory = studentCategory || studentType;
    
    //  Set default course for academy students
    let finalCourse = undefined;
    if (finalCategory === 'academy') {
      finalCourse = course && course.trim() !== '' ? course : 'RS CIT';
    }
    
    const admission = admissionDate ? new Date(admissionDate) : new Date();
    
    const student = await User.create({
      name, email, phone, password: phone || "password123", userType: "student",
      studentCategory: finalCategory,  //  USES THE CORRECT CATEGORY
      admissionDate: admission, 
      membershipDuration, 
      status: 'active',
      financials: { amount: totalFees || 0, paid: 0, due: totalFees || 0 },
      fees: { totalFee: totalFees || 0, paidFee: 0, dueFee: totalFees || 0, paymentHistory: [] },
      course: finalCourse
    });
    
    res.status(201).json({ success: true, message: 'Student added successfully', student });
  } catch (error) {
    console.error("Add student error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, userType: 'student' });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        if (key === 'studentType') {
          student.studentCategory = req.body[key];
        } else if (key === 'totalFees') {
          student.financials.amount = req.body[key];
        } else if (key === 'paidFees') {
          student.financials.paid = req.body[key];
        } else {
          student[key] = req.body[key];
        }
      }
    });
    
    student.financials.due = student.financials.amount - student.financials.paid;
    await student.save();
    
    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, userType: 'student' });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    
    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Active Students
exports.getActiveStudents = async (req, res) => {
  try {
    const students = await User.find({ userType: 'student', status: 'active' }).sort({ admissionDate: -1 }).select('-password');
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Expiring Students
exports.getExpiringStudents = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const students = await User.find({ userType: 'student', status: 'active' }).select('-password');
    
    const studentsWithDaysLeft = students.map(student => {
      const expiryDate = new Date(student.admissionDate);
      const months = { '1_month': 1, '2_months': 2, '3_months': 3 };
      expiryDate.setMonth(expiryDate.getMonth() + (months[student.membershipDuration] || 1));
      
      return {
        ...student.toObject(),
        expiryDate,
        daysLeft: Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      };
    }).filter(student => {
      return student.expiryDate <= thirtyDaysFromNow && student.expiryDate >= new Date();
    }).sort((a, b) => a.expiryDate - b.expiryDate);
    
    res.json({ success: true, count: studentsWithDaysLeft.length, students: studentsWithDaysLeft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Renew Membership
exports.renewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = '1_month' } = req.body;
    
    const student = await User.findOne({ _id: id, userType: 'student' });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    
    student.admissionDate = new Date();
    student.membershipDuration = duration;
    student.status = 'active';
    await student.save();
    
    res.json({ success: true, message: `Membership renewed for ${duration.replace('_', ' ')}`, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Student Types Stats (DEPRECATED - use getStudentStats instead)
exports.getStudentTypes = async (req, res) => {
  try {
    const types = await User.aggregate([
      { $match: { userType: 'student' } },
      { $group: { _id: '$studentCategory', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Comprehensive Student Stats for Dashboard
exports.getStudentStats = async (req, res) => {
  try {
    const { category } = req.query;
    
    let matchQuery = { userType: 'student' };
    if (category && category !== 'all') {
      matchQuery.studentCategory = category;
    }

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      byCategory,
      byCourse,
      byDepartment
    ] = await Promise.all([
      User.countDocuments(matchQuery),
      User.countDocuments({ ...matchQuery, status: 'active' }),
      User.countDocuments({ ...matchQuery, status: { $in: ['inactive', 'suspended'] } }),
      // Category breakdown
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$studentCategory', count: { $sum: 1 } } }
      ]),
      // Course breakdown
      User.aggregate([
        { $match: { ...matchQuery, course: { $exists: true, $ne: '' } } },
        { $group: { _id: '$course', count: { $sum: 1 } } }
      ]),
      // Department breakdown
      User.aggregate([
        { $match: { ...matchQuery, department: { $exists: true, $ne: '' } } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents
      },
      categories: byCategory,
      courses: byCourse,
      departments: byDepartment
    });
  } catch (error) {
    console.error('getStudentStats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Staff Management
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ userType: 'staff' }).select('-password');
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, email, password, staffRole, phone } = req.body;
    
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    const user = await User.create({ 
      name, email, password, userType: 'staff', staffRole: staffRole || 'teacher', phone 
    });
    
    res.status(201).json({ success: true, message: 'Staff added successfully', staff: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== SUPER ADMIN FUNCTIONS ==========

// Get All Users (Super Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    let query = {};

    if (role && role !== 'all') query.userType = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update User Role (Super Admin) - FIXED
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, studentCategory, staffRole } = req.body;

    // Prevent caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    console.log('📝 ===== UPDATE USER ROLE =====');
    console.log('ID:', id);
    console.log('userType:', userType);
    console.log('studentCategory:', studentCategory);
    console.log('staffRole:', staffRole);
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user?.userType, req.user?._id);

    // ========== INPUT VALIDATION ==========
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required',
        code: 'MISSING_ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID format',
        code: 'INVALID_ID'
      });
    }

    if (!userType) {
      return res.status(400).json({ 
        success: false, 
        error: 'userType is required',
        code: 'MISSING_USER_TYPE'
      });
    }

    const validUserTypes = ['superAdmin', 'admin', 'staff', 'student'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid user type. Allowed: ${validUserTypes.join(', ')}`,
        code: 'INVALID_USER_TYPE'
      });
    }

    // Validate studentCategory if userType is student
    const validStudentCategories = ['academy', 'library', 'both'];
    if (userType === 'student') {
      if (!studentCategory) {
        return res.status(400).json({ 
          success: false, 
          error: 'studentCategory is required when userType is student',
          code: 'MISSING_STUDENT_CATEGORY'
        });
      }
      if (!validStudentCategories.includes(studentCategory)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid studentCategory. Allowed: ${validStudentCategories.join(', ')}`,
          code: 'INVALID_STUDENT_CATEGORY'
        });
      }
    }

    // Validate staffRole if userType is staff
    const validStaffRoles = ['teacher', 'Digital Marketer', 'Web Developer', 'Front-End Developer', 'Back-End Developer', 'Full-Stack Developer', 'other'];
    if (userType === 'staff') {
      if (!staffRole) {
        return res.status(400).json({ 
          success: false, 
          error: 'staffRole is required when userType is staff',
          code: 'MISSING_STAFF_ROLE'
        });
      }
      if (!validStaffRoles.includes(staffRole)) {
        return res.status(400).json({ 
          success: false, 
          error: `Invalid staffRole. Allowed: ${validStaffRoles.join(', ')}`,
          code: 'INVALID_STAFF_ROLE'
        });
      }
    }

    // ========== AUTHORIZATION CHECK ==========
    // Check if trying to modify superAdmin
    const user = await User.findById(id).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log('👤 BEFORE UPDATE:', {
      _id: user._id,
      name: user.name,
      currentUserType: user.userType,
      currentStudentCategory: user.studentCategory,
      currentStaffRole: user.staffRole
    });

    // Prevent modifying superAdmin unless you are superAdmin
    if (user.userType === 'superAdmin' && req.user?.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions. Only superAdmin can modify superAdmin roles.',
        code: 'FORBIDDEN_SUPER_ADMIN'
      });
    }

    // Prevent elevating to superAdmin without permission
    if (userType === 'superAdmin' && req.user?.userType !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to assign superAdmin role',
        code: 'FORBIDDEN_ELEVATE_SUPER_ADMIN'
      });
    }

    // ========== PERFORM UPDATE ==========
    
    // Store old values for logging
    const oldUserType = user.userType;
    const oldStudentCategory = user.studentCategory;
    const oldStaffRole = user.staffRole;

    // Update userType
    user.userType = userType;

    // Handle studentCategory
    if (userType === 'student') {
      // Always set studentCategory (must be provided and validated above)
      user.studentCategory = studentCategory;
      console.log(`✓ Setting studentCategory: ${oldStudentCategory || 'none'} → ${studentCategory}`);
      // Clear staffRole
      user.staffRole = undefined;
    } else {
      // For non-student types, clear studentCategory
      if (user.studentCategory) {
        console.log(`✓ Clearing studentCategory: ${user.studentCategory} → undefined`);
        user.studentCategory = undefined;
      }
    }

    // Handle staffRole
    if (userType === 'staff') {
      // Always set staffRole (must be provided and validated above)
      user.staffRole = staffRole;
      console.log(`✓ Setting staffRole: ${oldStaffRole || 'none'} → ${staffRole}`);
      // Clear studentCategory
      user.studentCategory = undefined;
    } else {
      // For non-staff types, clear staffRole
      if (user.staffRole) {
        console.log(`✓ Clearing staffRole: ${user.staffRole} → undefined`);
        user.staffRole = undefined;
      }
    }

    // Mark modified fields explicitly
    user.markModified('userType');
    user.markModified('studentCategory');
    user.markModified('staffRole');

    // Save with error handling
    await user.save();

    console.log('✅ UPDATE SUCCESS:', {
      _id: user._id,
      name: user.name,
      userType: oldUserType + ' → ' + user.userType,
      studentCategory: oldStudentCategory + ' → ' + user.studentCategory,
      staffRole: oldStaffRole + ' → ' + user.staffRole
    });

    // Fetch fresh user
    const freshUser = await User.findById(id).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

    // Success response
    return res.json({ 
      success: true, 
      message: 'User role updated successfully',
      code: 'ROLE_UPDATE_SUCCESS',
      user: {
        _id: freshUser._id,
        name: freshUser.name,
        email: freshUser.email,
        userType: freshUser.userType,
        studentCategory: freshUser.studentCategory,
        staffRole: freshUser.staffRole,
        userId: freshUser.userId,
        status: freshUser.status,
        isActive: freshUser.isActive
      }
    });

  } catch (error) {
    console.error('❌ Update role error:', error);
    
    // Check for MongoDB specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: ' + error.message,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data format provided',
        code: 'CAST_ERROR'
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: 'Duplicate key error',
        code: 'DUPLICATE_KEY'
      });
    }

    // For authorization errors (handled above), don't override with 500
    if (error.statusCode) {
      return res.status(error.statusCode).json({ 
        success: false, 
        error: error.message,
        code: error.code || 'AUTHORIZATION_ERROR'
      });
    }

    // Generic server error
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Block/Unblock User (Super Admin)
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent blocking superAdmin
    if (user.userType === 'superAdmin') {
      return res.status(403).json({ success: false, error: 'Cannot block super admin' });
    }

    user.isActive = isActive;
    if (!isActive) {
      user.status = 'suspended';
    } else {
      user.status = 'active';
    }
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete User (Super Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent deleting superAdmin
    if (user.userType === 'superAdmin') {
      return res.status(403).json({ success: false, error: 'Cannot delete super admin' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Admin Stats (Super Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      superAdmins,
      admins,
      staff,
      students,
      blockedUsers,
      recentLogins
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ userType: 'superAdmin' }),
      User.countDocuments({ userType: 'admin' }),
      User.countDocuments({ userType: 'staff' }),
      User.countDocuments({ userType: 'student' }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
    ]);

    // Get recent activity (last 10 user actions)
    const recentActivity = await User.find()
      .select('name userType lastLogin createdAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .then(users => users.map(user => ({
        action: user.lastLogin ? 'User logged in' : 'User registered',
        user: user.name,
        timestamp: user.lastLogin || user.createdAt,
        type: user.lastLogin ? 'login' : 'register'
      })));

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        superAdmins,
        admins,
        staff,
        students,
        blockedUsers,
        recentLogins,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};