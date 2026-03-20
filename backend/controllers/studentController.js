const User = require('../models/User');

// ✅ CREATE STUDENT - WITH FATHERNAME & DOB
exports.createStudent = async (req, res) => {
  try {
    console.log('🔥 CREATE STUDENT REQUEST');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    console.log('📌 Course value:', req.body.course);
    console.log('📌 Course type:', typeof req.body.course);
    
    const { 
      name, 
      email, 
      phone, 
      totalFees = 0, 
      admissionDate, 
      studentCategory = "academy", 
      membershipDuration = "1_month", 
      address, 
      department,
      course,
      // ===== NEW FIELDS ADDED =====
      fatherName,
      dob
    } = req.body;
    
    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    // ✅ FIXED: Dono objects - financials (purana) + fees (naya)
    const user = await User.create({
      name,
      email,
      phone,
      // ===== NEW FIELDS ADDED =====
      fatherName,
      dob,
      password: phone || "password123",
      userType: "student",
      studentCategory,
      course,
      
      // ✅ Purane system ke liye - financials
      financials: {
        amount: parseFloat(totalFees) || 0,
        paid: 0,
        due: parseFloat(totalFees) || 0,
        salaryType: "monthly"
      },
      
      // ✅ Naye payment system ke liye - fees
      fees: {
        totalFee: parseFloat(totalFees) || 0,
        paidFee: 0,
        dueFee: parseFloat(totalFees) || 0,
        paymentHistory: []
      },
      
      admissionDate: admissionDate || new Date(),
      membershipDuration,
      status: "active",
      department: department || "",
      address: typeof address === 'object' ? address : { street: address || "", city: "", state: "", pincode: "", country: "India" }
    });
    
    // Calculate expiry date
    const expiryDate = new Date(user.admissionDate);
    const months = { 
      '1_month': 1, 
      '3_months': 3, 
      '6_months': 6,
      '1_year': 12 
    };
    expiryDate.setMonth(expiryDate.getMonth() + (months[membershipDuration] || 1));
    user.endDate = expiryDate;
    await user.save();
    
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: {
        _id: user._id,
        studentId: user.userId,
        userId: user.userId,
        name: user.name,
        // ===== NEW FIELDS IN RESPONSE =====
        fatherName: user.fatherName,
        dob: user.dob,
        email: user.email,
        phone: user.phone,
        studentCategory: user.studentCategory,
        course: user.course,
        membershipDuration: user.membershipDuration,
        status: user.status,
        expiryDate: user.endDate,
        // ✅ DONO SE DATA LE
        totalFees: user.financials?.amount || user.fees?.totalFee || 0,
        paidFees: user.financials?.paid || user.fees?.paidFee || 0,
        feesDue: user.financials?.due || user.fees?.dueFee || 0
      }
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ GET ALL STUDENTS - WITH FATHERNAME & DOB (FIXED)
exports.getAllStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      studentCategory,
      course 
    } = req.query;
    
    const filter = { userType: "student" };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        // ===== NEW: Search in fatherName bhi =====
        { fatherName: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status && status !== "all") filter.status = status;
    if (studentCategory && studentCategory !== "all") filter.studentCategory = studentCategory;
    if (course && course !== "all") filter.course = course;
    
    // ✅ FIXED: Added .lean() to prevent Mongoose document conversion
    const [students, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(+limit)
        .lean(),  // 👈 CRITICAL FIX - prevents schema validation on string profileImage
      User.countDocuments(filter)
    ]);
    
    // ✅ Map students to safe format
    const mappedStudents = students.map(student => ({
      _id: student._id,
      studentId: student.userId,
      userId: student.userId,
      name: student.name,
      // ===== NEW FIELDS =====
      fatherName: student.fatherName,
      dob: student.dob,
      email: student.email,
      phone: student.phone,
      profileImage: student.profileImage,  // String ya object dono chalega
      course: student.course,
      status: student.status,
      studentCategory: student.studentCategory,
      totalFees: student.financials?.amount || student.fees?.totalFee || 0,
      paidFees: student.financials?.paid || student.fees?.paidFee || 0,
      feesDue: student.financials?.due || student.fees?.dueFee || 0,
      admissionDate: student.admissionDate,
      joinDate: student.joinDate,
      expiryDate: student.endDate,
      membershipDuration: student.membershipDuration,
      department: student.department,
      address: student.address,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    }));
    
    res.json({
      success: true,
      students: mappedStudents,
      total,
      page: +page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STUDENT BY ID - WITH FATHERNAME & DOB
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ 
      _id: req.params.id, 
      userType: "student" 
    }).select('-password').lean();  // 👈 Added lean() here too for consistency
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    // ✅ FIXED: DONO OBJECTS SE DATA LE
    const mappedStudent = {
      _id: student._id,
      studentId: student.userId,
      userId: student.userId,
      name: student.name,
      // ===== NEW FIELDS =====
      fatherName: student.fatherName,
      dob: student.dob,
      email: student.email,
      phone: student.phone,
      profileImage: student.profileImage,  // String ya object dono chalega
      course: student.course,
      status: student.status,
      studentCategory: student.studentCategory,
      totalFees: student.financials?.amount || student.fees?.totalFee || 0,
      paidFees: student.financials?.paid || student.fees?.paidFee || 0,
      feesDue: student.financials?.due || student.fees?.dueFee || 0,
      admissionDate: student.admissionDate,
      joinDate: student.joinDate,
      expiryDate: student.endDate,
      membershipDuration: student.membershipDuration,
      department: student.department,
      address: student.address,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      financials: student.financials,
      fees: student.fees
    };
    
    res.json({ 
      success: true, 
      student: mappedStudent 
    });
  } catch (error) {
    console.error("Get student by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ UPDATE STUDENT - WITH FATHERNAME & DOB
exports.updateStudent = async (req, res) => {
  try {
    const { totalFees, paidFees, fatherName, dob, ...otherUpdates } = req.body;
    const updateData = { ...otherUpdates };
    
    // ===== NEW FIELDS ADDED =====
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (dob !== undefined) updateData.dob = dob;
    
    // Handle financial updates - DONO OBJECTS UPDATE KARO
    if (totalFees !== undefined || paidFees !== undefined) {
      const amount = parseFloat(totalFees) || 0;
      const paid = parseFloat(paidFees) || 0;
      
      // ✅ Purane system ke liye
      updateData.financials = {
        amount,
        paid,
        due: amount - paid,
        salaryType: "monthly"
      };
      
      // ✅ Naye system ke liye
      updateData.fees = {
        totalFee: amount,
        paidFee: paid,
        dueFee: amount - paid,
        paymentHistory: []
      };
    }
    
    // Handle membership renewal
    if (updateData.membershipDuration) {
      const student = await User.findById(req.params.id);
      if (student) {
        const months = { 
          '1_month': 1, 
          '3_months': 3, 
          '6_months': 6,
          '1_year': 12
        };
        const newExpiry = new Date(student.endDate || new Date());
        newExpiry.setMonth(newExpiry.getMonth() + (months[updateData.membershipDuration] || 1));
        updateData.endDate = newExpiry;
      }
    }
    
    const updatedStudent = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "student" },
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();  // 👈 Added lean() here
    
    if (!updatedStudent) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Student updated successfully", 
      student: updatedStudent 
    });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ DELETE STUDENT - NO CHANGE
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ 
      _id: req.params.id, 
      userType: "student" 
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Student deleted successfully" 
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ UPDATE STUDENT STATUS - NO CHANGE
exports.updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "student" },
      { status },
      { new: true }
    ).select('-password').lean();  // 👈 Added lean()
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Student status updated", 
      student 
    });
  } catch (error) {
    console.error("Update student status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET ACTIVE STUDENTS - NO CHANGE
exports.getActiveStudents = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const [students, newThisMonth] = await Promise.all([
      User.find({ 
        userType: "student", 
        status: "active" 
      })
        .select('userId name email phone course studentCategory admissionDate')
        .sort({ admissionDate: -1 })
        .limit(50)
        .lean(),  // 👈 Added lean()
      User.countDocuments({ 
        userType: "student", 
        status: "active", 
        admissionDate: { $gte: startOfMonth } 
      })
    ]);
    
    const mappedStudents = students.map(student => ({
      _id: student._id,
      studentId: student.userId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      studentCategory: student.studentCategory,
      admissionDate: student.admissionDate
    }));
    
    res.json({ 
      success: true, 
      students: mappedStudents, 
      stats: { 
        totalActive: students.length, 
        newThisMonth 
      } 
    });
  } catch (error) {
    console.error("Get active students error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STUDENT STATS - NO CHANGE
exports.getStudentStats = async (req, res) => {
  try {
    const [categories, courses, active, total, departments] = await Promise.all([
      User.aggregate([
        { $match: { userType: "student" } },
        { $group: { 
          _id: "$studentCategory", 
          count: { $sum: 1 } 
        }}
      ]),
      User.aggregate([
        { $match: { userType: "student", course: { $exists: true, $ne: "" } } },
        { $group: { 
          _id: "$course", 
          count: { $sum: 1 } 
        }}
      ]),
      User.countDocuments({ userType: "student", status: "active" }),
      User.countDocuments({ userType: "student" }),
      User.aggregate([
        { $match: { userType: "student", department: { $exists: true, $ne: "" } } },
        { $group: { 
          _id: "$department", 
          count: { $sum: 1 } 
        }}
      ])
    ]);
    
    res.json({ 
      success: true, 
      categories,
      courses,
      departments,
      stats: { 
        total, 
        active, 
        inactive: total - active 
      } 
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET EXPIRING STUDENTS - NO CHANGE
exports.getExpiringStudents = async (req, res) => {
  try {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    const students = await User.find({
      userType: "student",
      status: "active",
      endDate: { $gte: today, $lte: next30Days }
    })
      .select('userId name email phone course endDate studentCategory membershipDuration')
      .sort({ endDate: 1 })
      .lean();  // 👈 Added lean()
    
    res.json({ 
      success: true, 
      students, 
      count: students.length 
    });
  } catch (error) {
    console.error("Get expiring students error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ RENEW MEMBERSHIP - NO CHANGE
exports.renewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration = '1_month' } = req.body;
    
    const student = await User.findOne({ 
      _id: id, 
      userType: "student" 
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    const months = { 
      '1_month': 1, 
      '3_months': 3, 
      '6_months': 6,
      '1_year': 12
    };
    const newExpiry = new Date(student.endDate || new Date());
    newExpiry.setMonth(newExpiry.getMonth() + (months[duration] || 1));
    
    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { 
        endDate: newExpiry, 
        membershipDuration: duration, 
        status: 'active' 
      },
      { new: true }
    ).select('-password').lean();  // 👈 Added lean()
    
    res.json({ 
      success: true, 
      message: `Membership renewed for ${duration.replace('_', ' ')}`, 
      student: updatedStudent 
    });
  } catch (error) {
    console.error("Renew membership error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ EXPORT STUDENTS - NO CHANGE
exports.exportStudents = async (req, res) => {
  try {
    const students = await User.find({ userType: "student" })
      .select('-password')
      .lean();  // 👈 Already had lean()
    
    const csvData = students.map(student => ({
      "User ID": student.userId || "N/A",
      "Name": student.name,
      // ===== NEW FIELDS =====
      "Father's Name": student.fatherName || "N/A",
      "Date of Birth": student.dob ? new Date(student.dob).toISOString().split("T")[0] : "N/A",
      "Email": student.email,
      "Phone": student.phone,
      "Course": student.course || "N/A",
      "Status": student.status,
      "Student Category": student.studentCategory || "N/A",
      "Department": student.department || "N/A",
      "Total Fees": student.financials?.amount || student.fees?.totalFee || 0,
      "Paid Fees": student.financials?.paid || student.fees?.paidFee || 0,
      "Fees Due": student.financials?.due || student.fees?.dueFee || 0,
      "Admission Date": student.admissionDate ? 
        student.admissionDate.toISOString().split("T")[0] : "N/A",
      "Join Date": student.joinDate ? 
        student.joinDate.toISOString().split("T")[0] : "N/A",
      "Expiry Date": student.endDate ? 
        student.endDate.toISOString().split("T")[0] : "N/A",
      "Membership Duration": student.membershipDuration || "N/A",
      "Address": student.address || "N/A"
    }));
    
    res.json({ 
      success: true, 
      data: csvData, 
      count: students.length 
    });
  } catch (error) {
    console.error("Export students error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STUDENT BY EMAIL - NO CHANGE
exports.getStudentByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const student = await User.findOne({ 
      email, 
      userType: "student" 
    }).select('-password').lean();  // 👈 Added lean()
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    res.json({
      success: true,
      student: {
        studentId: student.userId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        totalFees: student.financials?.amount || student.fees?.totalFee || 0,
        paidFees: student.financials?.paid || student.fees?.paidFee || 0,
        feesDue: student.financials?.due || student.fees?.dueFee || 0,
        status: student.status,
        admissionDate: student.admissionDate,
        joinDate: student.joinDate,
        membershipDuration: student.membershipDuration,
        expiryDate: student.endDate,
        studentCategory: student.studentCategory
      }
    });
  } catch (error) {
    console.error('Error getting student by email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ GET STUDENTS BY COURSE - NO CHANGE
exports.getStudentsByCourse = async (req, res) => {
  try {
    const { course } = req.params;
    
    const students = await User.find({ 
      userType: "student", 
      course: course,
      status: "active"
    })
      .select('userId name email phone admissionDate studentCategory')
      .sort({ name: 1 })
      .lean();  // 👈 Added lean()
    
    res.json({ 
      success: true, 
      course,
      students,
      count: students.length 
    });
  } catch (error) {
    console.error("Get students by course error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};