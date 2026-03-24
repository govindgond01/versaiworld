const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper function to update user percentage
async function updateUserAttendance(userId) {
  try {
    const totalDays = await Attendance.countDocuments({ userId });
    const presentDays = await Attendance.countDocuments({ userId, status: 'present' });
    const halfDays = await Attendance.countDocuments({ userId, status: 'half-day' });
    
    const percentage = totalDays > 0 
      ? Math.round(((presentDays + (halfDays * 0.5)) / totalDays) * 100) 
      : 0;
    
    await User.findByIdAndUpdate(userId, {
      'attendance.present': presentDays,
      'attendance.absent': await Attendance.countDocuments({ userId, status: 'absent' }),
      'attendance.percentage': percentage
    });
  } catch (error) {
    console.error('Error updating user attendance:', error);
  }
}

// ==========================================
// USER ROUTES - Sirf today mark kar sakte hain
// ==========================================

//  Mark attendance
exports.markMyAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existing = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already marked attendance for today' 
      });
    }
    
    const attendance = await Attendance.create({
      userId,
      date: new Date(),
      status,
      markedBy: req.user.id
    });
    
    await updateUserAttendance(userId);
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get today's attendance
exports.getMyTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today }
    });
    
    res.json({
      success: true,
      data: attendance || { status: null }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get monthly attendance
exports.getMyMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);
    
    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;
    const total = present + absent + halfDay;
    const percentage = total > 0 ? Math.round((present + (halfDay * 0.5)) / total * 100) : 0;
    
    res.json({
      success: true,
      data: {
        attendance,
        stats: { present, absent, halfDay, total, percentage }
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get all attendance history (year wise)
exports.getMyAllAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Group by month
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthAttendance = attendance.filter(a => new Date(a.date).getMonth() === month);
      
      if (monthAttendance.length > 0) {
        const present = monthAttendance.filter(a => a.status === 'present').length;
        const absent = monthAttendance.filter(a => a.status === 'absent').length;
        const halfDay = monthAttendance.filter(a => a.status === 'half-day').length;
        const total = present + absent + halfDay;
        const percentage = total > 0 ? Math.round((present + (halfDay * 0.5)) / total * 100) : 0;
        
        months.push({
          month,
          year: parseInt(year),
          attendance: monthAttendance,
          stats: { present, absent, halfDay, total, percentage }
        });
      }
    }
    
    res.json({
      success: true,
      data: months
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN ROUTES - Full control
// ==========================================

//  Admin: Mark user attendance - FIXED
exports.markUserAttendance = async (req, res) => {
  try {
    const { userId, status, date } = req.body;
    
    // Validation
    if (!userId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and status are required' 
      });
    }
    
    // Parse date
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Future date check
    if (attendanceDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot mark attendance for future dates' 
      });
    }
    
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Check if already exists
    const existing = await Attendance.findOne({
      userId,
      date: { $gte: attendanceDate, $lt: nextDay }
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already marked for this date' 
      });
    }
    
    // Create new attendance
    const attendance = await Attendance.create({
      userId,
      date: attendanceDate,
      status,
      markedBy: req.user.id
    });
    
    // Update user percentage
    await updateUserAttendance(userId);
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
    
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//  Admin: Update attendance - FIXED
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;
    
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceDate = new Date(attendance.date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    if (attendanceDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update future date attendance' 
      });
    }
    
    attendance.status = status || attendance.status;
    attendance.lastModifiedBy = req.user.id;
    attendance.modifiedAt = new Date();
    
    await attendance.save();
    await updateUserAttendance(attendance.userId);
    
    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
    
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//  Admin: Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceDate = new Date(attendance.date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    if (attendanceDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete future date attendance' 
      });
    }
    
    const userId = attendance.userId;
    await attendance.deleteOne();
    await updateUserAttendance(userId);
    
    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Admin: Get user's today attendance
exports.getUserTodayAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today }
    }).populate('userId', 'name email userId');
    
    res.json({
      success: true,
      data: attendance || { status: null }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Admin: Get user's monthly attendance
exports.getUserMonthlyAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);
    
    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).populate('userId', 'name email userId');
    
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;
    const total = present + absent + halfDay;
    const percentage = total > 0 ? Math.round((present + (halfDay * 0.5)) / total * 100) : 0;
    
    res.json({
      success: true,
      data: {
        attendance,
        stats: { present, absent, halfDay, total, percentage }
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Admin: Get all attendances
exports.getAllAttendances = async (req, res) => {
  try {
    const { date, status, userId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const attendances = await Attendance.find(query)
      .populate('userId', 'name email userId userType studentCategory staffRole')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Attendance.countDocuments(query);
    
    res.json({
      success: true,
      data: attendances,
      total,
      page: +page,
      pages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Admin: Get all attendance for a date
exports.getAllAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date is required' 
      });
    }
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name email userId userType studentCategory staffRole');
    
    res.json({ 
      success: true, 
      data: attendance 
    });
    
  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};