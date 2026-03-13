const User = require('../models/User');

// ✅ CREATE STAFF
exports.createStaff = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      staffRole = 'teacher', 
      salary = 0,
      joinDate,
      department,
      address,
      bankDetails
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email and phone are required" 
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    const staff = await User.create({
      name,
      email,
      phone,
      password: phone || "staff@123",
      userType: "staff",
      staffRole,
      
      fees: {
        salary: parseFloat(salary) || 0,
        paidSalary: 0,
        dueSalary: parseFloat(salary) || 0,
        salaryType: "monthly",
        bankDetails: bankDetails || {},
        paymentHistory: []
      },
      
      joinDate: joinDate || new Date(),
      status: "active",
      department: department || "General",
      address: typeof address === 'object' ? address : { 
        street: address || "", 
        city: "", 
        state: "", 
        pincode: "", 
        country: "India" 
      }
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      staff: {
        _id: staff._id,
        staffId: staff.userId,
        userId: staff.userId,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        staffRole: staff.staffRole,
        status: staff.status,
        department: staff.department,
        salary: staff.fees?.salary || 0,
        paidSalary: staff.fees?.paidSalary || 0,
        dueSalary: staff.fees?.dueSalary || 0,
        joinDate: staff.joinDate
      }
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// ✅ GET ALL STAFF
exports.getAllStaff = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      status = '',
      staffRole = ''
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const filter = { userType: "staff" };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status && status !== 'all') filter.status = status;
    if (staffRole && staffRole !== 'all') filter.staffRole = staffRole;
    
    const total = await User.countDocuments(filter);
    
    const staff = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const formattedStaff = staff.map(staffMember => ({
      _id: staffMember._id,
      staffId: staffMember.userId,
      userId: staffMember.userId,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      profileImage: staffMember.profileImage || '',
      staffRole: staffMember.staffRole || 'teacher',
      status: staffMember.status || 'active',
      salary: staffMember.fees?.salary || 0,
      paidSalary: staffMember.fees?.paidSalary || 0,
      dueSalary: staffMember.fees?.dueSalary || 0,
      joinDate: staffMember.joinDate || staffMember.createdAt,
      department: staffMember.department || '',
      address: staffMember.address || '',
      bankDetails: staffMember.fees?.bankDetails || {},
      createdAt: staffMember.createdAt,
      updatedAt: staffMember.updatedAt
    }));
    
    res.json({
      success: true,
      staff: formattedStaff,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    console.error("Get all staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STAFF BY ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({ 
      _id: req.params.id, 
      userType: "staff" 
    }).select('-password').lean();
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: "Staff not found" 
      });
    }
    
    const formattedStaff = {
      _id: staff._id,
      staffId: staff.userId,
      userId: staff.userId,
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      profileImage: staff.profileImage || '',
      staffRole: staff.staffRole || 'teacher',
      status: staff.status || 'active',
      salary: staff.fees?.salary || 0,
      paidSalary: staff.fees?.paidSalary || 0,
      dueSalary: staff.fees?.dueSalary || 0,
      joinDate: staff.joinDate || staff.createdAt,
      department: staff.department || '',
      address: staff.address || '',
      bankDetails: staff.fees?.bankDetails || {},
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      fees: staff.fees || {}
    };
    
    res.json({ 
      success: true, 
      staff: formattedStaff 
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ UPDATE STAFF
exports.updateStaff = async (req, res) => {
  try {
    const { salary, paidSalary, ...otherUpdates } = req.body;
    const updateData = { ...otherUpdates };
    
    if (salary !== undefined || paidSalary !== undefined) {
      const amount = parseFloat(salary) || 0;
      const paid = parseFloat(paidSalary) || 0;
      
      updateData.$set = updateData.$set || {};
      
      updateData.$set['fees.salary'] = amount;
      updateData.$set['fees.paidSalary'] = paid;
      updateData.$set['fees.dueSalary'] = amount - paid;
      
      if (req.body.bankDetails) {
        updateData.$set['fees.bankDetails'] = req.body.bankDetails;
      }
    }
    
    const updatedStaff = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "staff" },
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();
    
    if (!updatedStaff) {
      return res.status(404).json({ 
        success: false, 
        message: "Staff not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Staff updated successfully", 
      staff: updatedStaff 
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ 
      _id: req.params.id, 
      userType: "staff" 
    });
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: "Staff not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Staff deleted successfully" 
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ UPDATE STAFF STATUS
exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }
    
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "staff" },
      { status },
      { new: true }
    ).select('-password').lean();
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: "Staff not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Staff status updated", 
      staff 
    });
  } catch (error) {
    console.error("Update staff status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET ACTIVE STAFF
exports.getActiveStaff = async (req, res) => {
  try {
    const activeStaff = await User.find({ 
      userType: "staff", 
      status: "active" 
    })
      .select('userId name email phone staffRole department joinDate')
      .sort({ name: 1 })
      .limit(50)
      .lean();
    
    const formattedStaff = activeStaff.map(staff => ({
      _id: staff._id,
      staffId: staff.userId,
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      staffRole: staff.staffRole || 'teacher',
      department: staff.department || '',
      joinDate: staff.joinDate || staff.createdAt
    }));
    
    res.json({ 
      success: true, 
      staff: formattedStaff,
      count: activeStaff.length 
    });
  } catch (error) {
    console.error("Get active staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STAFF STATS - FIXED
exports.getStaffStats = async (req, res) => {
  try {
    console.log("📊 Fetching staff stats...");
    
    const total = await User.countDocuments({ userType: "staff" });
    const active = await User.countDocuments({ userType: "staff", status: "active" });
    
    // Calculate avgSalary separately
    const allStaff = await User.find({ userType: "staff" }).select('fees staffRole').lean();
    const salaryMap = {};
    
    allStaff.forEach(s => {
      const role = s.staffRole || 'other';
      const salary = s.fees?.salary || 0;
      
      if (!salaryMap[role]) {
        salaryMap[role] = { total: 0, count: 0 };
      }
      salaryMap[role].total += salary;
      salaryMap[role].count += 1;
    });
    
    // Get roles with counts
    const roles = await User.aggregate([
      { $match: { userType: "staff" } },
      { $group: { 
        _id: "$staffRole", 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Add avgSalary to roles
    const rolesWithAvgSalary = roles.map(role => ({
      ...role,
      avgSalary: salaryMap[role._id] ? Math.round(salaryMap[role._id].total / salaryMap[role._id].count) : 0
    }));
    
    const departments = await User.aggregate([
      { $match: { userType: "staff", department: { $exists: true, $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log("✅ Staff stats fetched");
    
    res.json({ 
      success: true, 
      roles: rolesWithAvgSalary || [],
      departments: departments || [],
      stats: { 
        total: total || 0, 
        active: active || 0, 
        inactive: (total || 0) - (active || 0) 
      } 
    });
    
  } catch (error) {
    console.error("❌ Get staff stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ EXPORT STAFF DATA
exports.exportStaff = async (req, res) => {
  try {
    const staff = await User.find({ userType: "staff" })
      .select('-password')
      .lean();
    
    const exportData = staff.map(staffMember => ({
      "Staff ID": staffMember.userId || "N/A",
      "Name": staffMember.name || "N/A",
      "Email": staffMember.email || "N/A",
      "Phone": staffMember.phone || "N/A",
      "Role": staffMember.staffRole || "N/A",
      "Status": staffMember.status || "N/A",
      "Department": staffMember.department || "N/A",
      "Salary": staffMember.fees?.salary || 0,
      "Paid": staffMember.fees?.paidSalary || 0,
      "Due": staffMember.fees?.dueSalary || 0,
      "Join Date": staffMember.joinDate ? 
        new Date(staffMember.joinDate).toISOString().split("T")[0] : "N/A",
      "Address": staffMember.address || "N/A",
      "Bank Account": staffMember.fees?.bankDetails?.accountNumber || "N/A",
      "Bank Name": staffMember.fees?.bankDetails?.bankName || "N/A"
    }));
    
    res.json({ 
      success: true, 
      data: exportData, 
      count: staff.length 
    });
  } catch (error) {
    console.error("Export staff error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// ✅ GET STAFF DASHBOARD STATS - ULTIMATE FIXED VERSION
exports.getStaffDashboardStats = async (req, res) => {
  try {
    console.log("📊 Fetching staff dashboard stats...");
    
    // Simple counts
    const totalStaff = await User.countDocuments({ userType: "staff" });
    const activeStaff = await User.countDocuments({ userType: "staff", status: "active" });
    
    // Get all staff for calculations
    const allStaff = await User.find({ userType: "staff" })
      .select('fees staffRole name email status joinDate department createdAt')
      .lean();
    
    // Calculate role distribution with avgSalary
    const roleMap = {};
    allStaff.forEach(s => {
      const role = s.staffRole || 'other';
      if (!roleMap[role]) {
        roleMap[role] = { count: 0, totalSalary: 0 };
      }
      roleMap[role].count++;
      roleMap[role].totalSalary += s.fees?.salary || 0;
    });
    
    const staffByRole = Object.keys(roleMap).map(role => ({
      _id: role,
      count: roleMap[role].count,
      avgSalary: roleMap[role].count > 0 ? Math.round(roleMap[role].totalSalary / roleMap[role].count) : 0
    }));
    
    // Recent staff (last 7)
    const recentStaff = allStaff
      .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
      .slice(0, 7)
      .map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        staffRole: s.staffRole || 'teacher',
        status: s.status,
        salary: s.fees?.salary || 0,
        joinDate: s.joinDate
      }));
    
    // Department distribution
    const deptMap = {};
    allStaff.forEach(s => {
      if (s.department) {
        deptMap[s.department] = (deptMap[s.department] || 0) + 1;
      }
    });
    
    const departments = Object.keys(deptMap).map(dept => ({
      _id: dept,
      count: deptMap[dept]
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    
    // Salary calculations
    let totalSalary = 0, totalPaid = 0, totalDue = 0;
    allStaff.forEach(s => {
      const salary = s.fees?.salary || 0;
      const paid = s.fees?.paidSalary || 0;
      totalSalary += salary;
      totalPaid += paid;
      totalDue += (salary - paid);
    });
    
    const avgSalary = totalStaff > 0 ? totalSalary / totalStaff : 0;
    
    // Active staff list
    const activeStaffList = allStaff
      .filter(s => s.status === 'active')
      .slice(0, 5)
      .map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        staffRole: s.staffRole || 'teacher',
        department: s.department || 'General',
        joinDate: s.joinDate
      }));
    
    console.log("✅ Staff dashboard stats fetched successfully");
    
    res.json({
      success: true,
      stats: {
        totalStaff: totalStaff || 0,
        activeStaff: activeStaff || 0,
        inactiveStaff: (totalStaff || 0) - (activeStaff || 0),
        totalSalary: totalSalary || 0,
        paidSalary: totalPaid || 0,
        dueSalary: totalDue || 0,
        avgSalary: Math.round(avgSalary) || 0
      },
      recentStaff: recentStaff,
      roles: staffByRole || [],
      departments: departments || [],
      activeStaffList
    });
    
  } catch (error) {
    console.error("❌ Get staff dashboard stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};