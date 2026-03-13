const User = require('../models/User');
// ✅ COMMENT OUT - Remove Notification model dependency
// const Notification = require('../models/Notification');
// const Payment = require('../models/Payment');
// const Attendance = require('../models/Attendance');

// ==========================================
// GLOBAL SEARCH - Role Based (Working Version)
// ==========================================
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const userType = req.user.userType;
    const userId = req.user.id;
    const userCategory = req.user.studentCategory;

    console.log('🔍 Search Query:', q);
    console.log('👤 User Type:', userType);
    console.log('🆔 User ID:', userId);

    if (!q || q.length < 2) {
      return res.json({ success: true, results: [], count: 0 });
    }

    let results = [];

    // ===== ADMIN SEARCH =====
    if (userType === 'admin') {
      // Search Users (all types)
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { userId: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { course: { $regex: q, $options: 'i' } },
          { department: { $regex: q, $options: 'i' } }
        ]
      })
      .select('name email userId userType studentCategory staffRole phone course profileImage')
      .limit(10);

      console.log('📊 Admin Search Results:', users.length);

      results = users.map(u => ({
        id: u._id,
        type: 'user',
        userType: u.userType,
        category: u.studentCategory || u.staffRole,
        title: u.name,
        subtitle: `${u.email} • ${u.userId}`,
        image: u.profileImage,
        url: u.userType === 'student' 
          ? `/admin-dashboard/students/${u._id}`
          : u.userType === 'staff'
            ? `/admin-dashboard/staff/${u._id}`
            : '#'
      }));
    }

    // ===== ACADEMY STUDENT SEARCH =====
    else if (userType === 'student' && userCategory === 'academy') {
      // Search in own data only (simplified for now)
      const user = await User.findById(userId).select('name email course fees');
      
      results = [
        {
          id: user._id,
          type: 'profile',
          title: user.name,
          subtitle: user.email,
          url: '/academy-dashboard/profile'
        }
      ];

      // Add fee search if matches
      if (user.fees?.totalFee && user.fees.totalFee.toString().includes(q)) {
        results.push({
          id: 'fees',
          type: 'payment',
          title: `Total Fees: ₹${user.fees.totalFee}`,
          subtitle: `Paid: ₹${user.fees.paidFee} | Due: ₹${user.fees.dueFee}`,
          url: '/academy-dashboard/payments'
        });
      }
    }

    // ===== LIBRARY STUDENT SEARCH =====
    else if (userType === 'student' && userCategory === 'library') {
      // Simplified library search
      const user = await User.findById(userId).select('name email membershipDuration');
      
      results = [
        {
          id: user._id,
          type: 'profile',
          title: user.name,
          subtitle: user.email,
          url: '/library-dashboard/profile'
        },
        {
          id: 'membership',
          type: 'membership',
          title: 'Membership',
          subtitle: user.membershipDuration || 'Active',
          url: '/library-dashboard/profile'
        }
      ];
    }

    // ===== STAFF SEARCH =====
    else if (userType === 'staff') {
      // Simplified staff search
      const user = await User.findById(userId).select('name email staffRole department');
      
      results = [
        {
          id: user._id,
          type: 'profile',
          title: user.name,
          subtitle: `${user.staffRole || 'Staff'} • ${user.department || 'General'}`,
          url: '/staff-dashboard/profile'
        }
      ];

      // Search students if teacher
      if (user.staffRole === 'teacher') {
        const students = await User.find({
          userType: 'student',
          course: { $regex: q, $options: 'i' }
        }).select('name email course').limit(5);

        students.forEach(s => {
          results.push({
            id: s._id,
            type: 'student',
            title: s.name,
            subtitle: `${s.email} • ${s.course || 'No course'}`,
            url: '#'
          });
        });
      }
    }

    console.log('✅ Search completed. Results:', results.length);

    res.json({ 
      success: true, 
      results,
      count: results.length 
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};