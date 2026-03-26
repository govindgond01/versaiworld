const User = require('../models/User');

//  CREATE employees
exports.createemployees = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      employeesRole = 'teacher', 
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

    const employees = await User.create({
      name,
      email,
      phone,
      password: phone || "employees@123",
      userType: "employees",
      employeesRole,
      
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
      message: "employees created successfully",
      employees: {
        _id: employees._id,
        employeesId: employees.userId,
        userId: employees.userId,
        name: employees.name,
        email: employees.email,
        phone: employees.phone,
        employeesRole: employees.employeesRole,
        status: employees.status,
        department: employees.department,
        salary: employees.fees?.salary || 0,
        paidSalary: employees.fees?.paidSalary || 0,
        dueSalary: employees.fees?.dueSalary || 0,
        joinDate: employees.joinDate
      }
    });
  } catch (error) {
    console.error("Create employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

//  GET ALL employees
exports.getAllemployees = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      status = '',
      employeesRole = ''
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const filter = { userType: "employees" };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status && status !== 'all') filter.status = status;
    if (employeesRole && employeesRole !== 'all') filter.employeesRole = employeesRole;
    
    const total = await User.countDocuments(filter);
    
    const employees = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const formattedemployees = employees.map(employeesMember => ({
      _id: employeesMember._id,
      employeesId: employeesMember.userId,
      userId: employeesMember.userId,
      name: employeesMember.name,
      email: employeesMember.email,
      phone: employeesMember.phone || '',
      profileImage: employeesMember.profileImage || '',
      employeesRole: employeesMember.employeesRole || 'teacher',
      status: employeesMember.status || 'active',
      salary: employeesMember.fees?.salary || 0,
      paidSalary: employeesMember.fees?.paidSalary || 0,
      dueSalary: employeesMember.fees?.dueSalary || 0,
      joinDate: employeesMember.joinDate || employeesMember.createdAt,
      department: employeesMember.department || '',
      address: employeesMember.address || '',
      bankDetails: employeesMember.fees?.bankDetails || {},
      createdAt: employeesMember.createdAt,
      updatedAt: employeesMember.updatedAt
    }));
    
    res.json({
      success: true,
      employees: formattedemployees,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  GET employees BY ID
exports.getemployeesById = async (req, res) => {
  try {
    const employees = await User.findOne({ 
      _id: req.params.id, 
      userType: "employees" 
    }).select('-password').lean();
    
    if (!employees) {
      return res.status(404).json({ 
        success: false, 
        message: "employees not found" 
      });
    }
    
    const formattedemployees = {
      _id: employees._id,
      employeesId: employees.userId,
      userId: employees.userId,
      name: employees.name,
      email: employees.email,
      phone: employees.phone || '',
      profileImage: employees.profileImage || '',
      employeesRole: employees.employeesRole || 'teacher',
      status: employees.status || 'active',
      salary: employees.fees?.salary || 0,
      paidSalary: employees.fees?.paidSalary || 0,
      dueSalary: employees.fees?.dueSalary || 0,
      joinDate: employees.joinDate || employees.createdAt,
      department: employees.department || '',
      address: employees.address || '',
      bankDetails: employees.fees?.bankDetails || {},
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      fees: employees.fees || {}
    };
    
    res.json({ 
      success: true, 
      employees: formattedemployees 
    });
  } catch (error) {
    console.error("Get employees by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  UPDATE employees
exports.updateemployees = async (req, res) => {
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
    
    const updatedemployees = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "employees" },
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();
    
    if (!updatedemployees) {
      return res.status(404).json({ 
        success: false, 
        message: "employees not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "employees updated successfully", 
      employees: updatedemployees 
    });
  } catch (error) {
    console.error("Update employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  DELETE employees
exports.deleteemployees = async (req, res) => {
  try {
    const employees = await User.findOneAndDelete({ 
      _id: req.params.id, 
      userType: "employees" 
    });
    
    if (!employees) {
      return res.status(404).json({ 
        success: false, 
        message: "employees not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "employees deleted successfully" 
    });
  } catch (error) {
    console.error("Delete employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  UPDATE employees STATUS
exports.updateemployeesStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }
    
    const employees = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "employees" },
      { status },
      { new: true }
    ).select('-password').lean();
    
    if (!employees) {
      return res.status(404).json({ 
        success: false, 
        message: "employees not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "employees status updated", 
      employees 
    });
  } catch (error) {
    console.error("Update employees status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  GET ACTIVE employees
exports.getActiveemployees = async (req, res) => {
  try {
    const activeemployees = await User.find({ 
      userType: "employees", 
      status: "active" 
    })
      .select('userId name email phone employeesRole department joinDate')
      .sort({ name: 1 })
      .limit(50)
      .lean();
    
    const formattedemployees = activeemployees.map(employees => ({
      _id: employees._id,
      employeesId: employees.userId,
      name: employees.name,
      email: employees.email,
      phone: employees.phone || '',
      employeesRole: employees.employeesRole || 'teacher',
      department: employees.department || '',
      joinDate: employees.joinDate || employees.createdAt
    }));
    
    res.json({ 
      success: true, 
      employees: formattedemployees,
      count: activeemployees.length 
    });
  } catch (error) {
    console.error("Get active employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  GET employees STATS - FIXED
exports.getemployeesStats = async (req, res) => {
  try {
    console.log(" Fetching employees stats...");
    
    const total = await User.countDocuments({ userType: "employees" });
    const active = await User.countDocuments({ userType: "employees", status: "active" });
    
    // Calculate avgSalary separately
    const allemployees = await User.find({ userType: "employees" }).select('fees employeesRole').lean();
    const salaryMap = {};
    
    allemployees.forEach(s => {
      const role = s.employeesRole || 'other';
      const salary = s.fees?.salary || 0;
      
      if (!salaryMap[role]) {
        salaryMap[role] = { total: 0, count: 0 };
      }
      salaryMap[role].total += salary;
      salaryMap[role].count += 1;
    });
    
    // Get roles with counts
    const roles = await User.aggregate([
      { $match: { userType: "employees" } },
      { $group: { 
        _id: "$employeesRole", 
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
      { $match: { userType: "employees", department: { $exists: true, $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log(" employees stats fetched");
    
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
    console.error(" Get employees stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  EXPORT employees DATA
exports.exportemployees = async (req, res) => {
  try {
    const employees = await User.find({ userType: "employees" })
      .select('-password')
      .lean();
    
    const exportData = employees.map(employeesMember => ({
      "employees ID": employeesMember.userId || "N/A",
      "Name": employeesMember.name || "N/A",
      "Email": employeesMember.email || "N/A",
      "Phone": employeesMember.phone || "N/A",
      "Role": employeesMember.employeesRole || "N/A",
      "Status": employeesMember.status || "N/A",
      "Department": employeesMember.department || "N/A",
      "Salary": employeesMember.fees?.salary || 0,
      "Paid": employeesMember.fees?.paidSalary || 0,
      "Due": employeesMember.fees?.dueSalary || 0,
      "Join Date": employeesMember.joinDate ? 
        new Date(employeesMember.joinDate).toISOString().split("T")[0] : "N/A",
      "Address": employeesMember.address || "N/A",
      "Bank Account": employeesMember.fees?.bankDetails?.accountNumber || "N/A",
      "Bank Name": employeesMember.fees?.bankDetails?.bankName || "N/A"
    }));
    
    res.json({ 
      success: true, 
      data: exportData, 
      count: employees.length 
    });
  } catch (error) {
    console.error("Export employees error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

//  GET employees DASHBOARD STATS - ULTIMATE FIXED VERSION
exports.getemployeesDashboardStats = async (req, res) => {
  try {
    console.log(" Fetching employees dashboard stats...");
    
    // Simple counts
    const totalemployees = await User.countDocuments({ userType: "employees" });
    const activeemployees = await User.countDocuments({ userType: "employees", status: "active" });
    
    // Get all employees for calculations
    const allemployees = await User.find({ userType: "employees" })
      .select('fees employeesRole name email status joinDate department createdAt')
      .lean();
    
    // Calculate role distribution with avgSalary
    const roleMap = {};
    allemployees.forEach(s => {
      const role = s.employeesRole || 'other';
      if (!roleMap[role]) {
        roleMap[role] = { count: 0, totalSalary: 0 };
      }
      roleMap[role].count++;
      roleMap[role].totalSalary += s.fees?.salary || 0;
    });
    
    const employeesByRole = Object.keys(roleMap).map(role => ({
      _id: role,
      count: roleMap[role].count,
      avgSalary: roleMap[role].count > 0 ? Math.round(roleMap[role].totalSalary / roleMap[role].count) : 0
    }));
    
    // Recent employees (last 7)
    const recentemployees = allemployees
      .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
      .slice(0, 7)
      .map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        employeesRole: s.employeesRole || 'teacher',
        status: s.status,
        salary: s.fees?.salary || 0,
        joinDate: s.joinDate
      }));
    
    // Department distribution
    const deptMap = {};
    allemployees.forEach(s => {
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
    allemployees.forEach(s => {
      const salary = s.fees?.salary || 0;
      const paid = s.fees?.paidSalary || 0;
      totalSalary += salary;
      totalPaid += paid;
      totalDue += (salary - paid);
    });
    
    const avgSalary = totalemployees > 0 ? totalSalary / totalemployees : 0;
    
    // Active employees list
    const activeemployeesList = allemployees
      .filter(s => s.status === 'active')
      .slice(0, 5)
      .map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        employeesRole: s.employeesRole || 'teacher',
        department: s.department || 'General',
        joinDate: s.joinDate
      }));
    
    console.log(" employees dashboard stats fetched successfully");
    
    res.json({
      success: true,
      stats: {
        totalemployees: totalemployees || 0,
        activeemployees: activeemployees || 0,
        inactiveemployees: (totalemployees || 0) - (activeemployees || 0),
        totalSalary: totalSalary || 0,
        paidSalary: totalPaid || 0,
        dueSalary: totalDue || 0,
        avgSalary: Math.round(avgSalary) || 0
      },
      recentemployees: recentemployees,
      roles: employeesByRole || [],
      departments: departments || [],
      activeemployeesList
    });
    
  } catch (error) {
    console.error(" Get employees dashboard stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};