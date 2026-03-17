const User = require('../models/User');
const Payment = require('../models/Payment');

// ==========================================
// ✅ ADD PAYMENT - 100% WORKING
// ==========================================
// ✅ ADD PAYMENT - 100% WORKING (ADDRESS FIXED)
exports.addPayment = async (req, res) => {
  try {
    const { userId, amount, type, paymentMethod, month, description, transactionId, receiptNo } = req.body;
    
    if (!userId || !amount || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID, amount and payment type are required" 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // 🔥🔥🔥 CRITICAL FIX - ADDRESS KO OBJECT BANAO AGAR STRING HAI
    if (typeof user.address === 'string') {
      user.address = {
        street: user.address || "",
        city: "",
        state: "",
        pincode: "",
        country: "India"
      };
    }
    
    const paymentData = {
      amount: parseFloat(amount),
      type,
      paymentMethod: paymentMethod || 'cash',
      transactionId,
      receiptNo: receiptNo || `REC-${Date.now()}`,
      month,
      description: description || `${type} payment`,
      recordedBy: req.user?.name || req.user?.email || 'Admin',
      status: 'paid',
      date: new Date()
    };
    
    // ===== STUDENT PAYMENT =====
    if (user.userType === 'student') {
      if (!user.financials) {
        user.financials = { amount: 0, paid: 0, due: 0, paymentHistory: [] };
      }
      if (!user.fees) {
        user.fees = { totalFee: 0, paidFee: 0, dueFee: 0, paymentHistory: [] };
      }
      
      user.financials.paid = (user.financials.paid || 0) + paymentData.amount;
      user.financials.due = (user.financials.amount || 0) - (user.financials.paid || 0);
      if (user.financials.due < 0) user.financials.due = 0;
      
      if (!user.financials.paymentHistory) user.financials.paymentHistory = [];
      user.financials.paymentHistory.push(paymentData);
      
      user.fees.paidFee = user.financials.paid;
      user.fees.dueFee = user.financials.due;
      if (!user.fees.paymentHistory) user.fees.paymentHistory = [];
      user.fees.paymentHistory.push(paymentData);
    }
    
    // ===== STAFF PAYMENT =====
    else if (user.userType === 'staff') {
      if (!user.financials) {
        user.financials = { amount: 0, paid: 0, due: 0, paymentHistory: [] };
      }
      if (!user.fees) {
        user.fees = { salary: 0, paidSalary: 0, dueSalary: 0, paymentHistory: [] };
      }
      
      user.financials.paid = (user.financials.paid || 0) + paymentData.amount;
      user.financials.due = (user.financials.amount || 0) - (user.financials.paid || 0);
      if (user.financials.due < 0) user.financials.due = 0;
      
      if (!user.financials.paymentHistory) user.financials.paymentHistory = [];
      user.financials.paymentHistory.push(paymentData);
      
      user.fees.paidSalary = user.financials.paid;
      user.fees.dueSalary = user.financials.due;
      if (!user.fees.paymentHistory) user.fees.paymentHistory = [];
      user.fees.paymentHistory.push(paymentData);
    }
    
    // ✅ Create Payment record in standalone Payment collection
    const paymentRecord = await Payment.create({
      user: user._id,
      amount: paymentData.amount,
      type: paymentData.type,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId,
      receiptNo: paymentData.receiptNo,
      month: paymentData.month,
      description: paymentData.description,
      status: paymentData.status,
      recordedBy: paymentData.recordedBy
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      payment: paymentData,
      paymentId: paymentRecord._id
    });
    
  } catch (error) {
    console.error("❌ Add payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// ==========================================
// ✅ GET PAYMENTS BY CATEGORY - WORKING
// ==========================================
exports.getPaymentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    let userFilter = {};
    if (category === 'academy') userFilter = { userType: 'student', studentCategory: 'academy' };
    else if (category === 'library') userFilter = { userType: 'student', studentCategory: 'library' };
    else if (category === 'staff') userFilter = { userType: 'staff' };
    else return res.status(400).json({ success: false, message: "Invalid category" });
    
    const users = await User.find(userFilter)
      .select('name email userId studentCategory staffRole financials fees')
      .lean();
    
    let allPayments = [];
    let totalPaid = 0;
    let totalDue = 0;
    
    const formattedUsers = users.map(user => {
      // ✅ FINANCIALS SE DATA LO, NAHI TO FEES SE
      const financials = user.financials || {};
      const fees = user.fees || {};
      
      let userTotal = 0, userPaid = 0, userDue = 0;
      
      if (category === 'staff') {
        userTotal = financials.amount || fees.salary || 0;
        userPaid = financials.paid || fees.paidSalary || 0;
        userDue = financials.due || fees.dueSalary || 0;
      } else {
        userTotal = financials.amount || fees.totalFee || 0;
        userPaid = financials.paid || fees.paidFee || 0;
        userDue = financials.due || fees.dueFee || 0;
      }
      
      totalPaid += userPaid;
      totalDue += userDue;
      
      // Payment history collect karo
      const paymentHistory = financials.paymentHistory || fees.paymentHistory || [];
      paymentHistory.forEach(payment => {
        allPayments.push({
          ...payment,
          userId: user._id,
          userDetails: {
            name: user.name,
            email: user.email,
            userId: user.userId,
            userType: user.userType,
            studentCategory: user.studentCategory,
            staffRole: user.staffRole
          }
        });
      });
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        totalAmount: userTotal,
        paidAmount: userPaid,
        dueAmount: userDue,
        studentCategory: user.studentCategory,
        staffRole: user.staffRole
      };
    });
    
    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      category,
      summary: {
        totalUsers: users.length,
        totalPaid,
        totalDue,
        recentPaymentsCount: allPayments.length
      },
      users: formattedUsers,
      recentPayments: allPayments.slice(0, 10)
    });
    
  } catch (error) {
    console.error("❌ Get payments by category error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================================
// ✅ GET MY PAYMENTS - WORKING
// ==========================================
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Financials se payment history lo
    const payments = user.financials?.paymentHistory || user.fees?.paymentHistory || [];
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Summary banao
    const summary = {
      total: user.financials?.amount || user.fees?.totalFee || user.fees?.salary || 0,
      paid: user.financials?.paid || user.fees?.paidFee || user.fees?.paidSalary || 0,
      due: user.financials?.due || user.fees?.dueFee || user.fees?.dueSalary || 0
    };
    
    res.json({ 
      success: true, 
      payments, 
      summary,
      user: {
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        studentCategory: user.studentCategory,
        staffRole: user.staffRole
      }
    });
    
  } catch (error) {
    console.error("❌ Get my payments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// ✅ GET PAYMENT HISTORY - WORKING
// ==========================================
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, paymentMethod, startDate, endDate, userId, userType } = req.query;
    
    const userFilter = {};
    if (userId) userFilter._id = userId;
    if (userType) userFilter.userType = userType;
    
    const users = await User.find(userFilter)
      .select('name email userId userType studentCategory staffRole financials fees');
    
    let allPayments = [];
    users.forEach(user => {
      const payments = user.financials?.paymentHistory || user.fees?.paymentHistory || [];
      payments.forEach(payment => {
        allPayments.push({
          ...(payment.toObject ? payment.toObject() : payment),
          userId: user._id,
          userDetails: {
            name: user.name,
            email: user.email,
            userId: user.userId,
            userType: user.userType,
            studentCategory: user.studentCategory,
            staffRole: user.staffRole
          }
        });
      });
    });
    
    // Apply filters
    let filteredPayments = allPayments;
    if (type && type !== 'all') filteredPayments = filteredPayments.filter(p => p.type === type);
    if (paymentMethod && paymentMethod !== 'all') filteredPayments = filteredPayments.filter(p => p.paymentMethod === paymentMethod);
    if (startDate) {
      const start = new Date(startDate);
      filteredPayments = filteredPayments.filter(p => new Date(p.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredPayments = filteredPayments.filter(p => new Date(p.date) <= end);
    }
    
    filteredPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const total = filteredPayments.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + limitNum);
    
    res.json({
      success: true,
      payments: paginatedPayments,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
    
  } catch (error) {
    console.error("❌ Get payment history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// ✅ GET USERS WITH DUE PAYMENTS - WORKING
// ==========================================
exports.getUsersWithDuePayments = async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    if (category === 'academy') {
      filter = { 
        userType: 'student', 
        studentCategory: 'academy',
        $or: [
          { 'financials.due': { $gt: 0 } },
          { 'fees.dueFee': { $gt: 0 } }
        ]
      };
    } else if (category === 'library') {
      filter = { 
        userType: 'student', 
        studentCategory: 'library',
        $or: [
          { 'financials.due': { $gt: 0 } },
          { 'fees.dueFee': { $gt: 0 } }
        ]
      };
    } else if (category === 'staff') {
      filter = { 
        userType: 'staff',
        $or: [
          { 'financials.due': { $gt: 0 } },
          { 'fees.dueSalary': { $gt: 0 } }
        ]
      };
    } else {
      filter = { 
        $or: [
          { 'financials.due': { $gt: 0 } },
          { 'fees.dueFee': { $gt: 0 } },
          { 'fees.dueSalary': { $gt: 0 } }
        ] 
      };
    }
    
    const users = await User.find(filter)
      .select('name email userId userType studentCategory staffRole financials fees')
      .limit(50);
    
    const formattedUsers = users.map(user => {
      const financials = user.financials || {};
      const fees = user.fees || {};
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        userType: user.userType,
        studentCategory: user.studentCategory,
        staffRole: user.staffRole,
        totalAmount: user.userType === 'staff' 
          ? (financials.amount || fees.salary || 0)
          : (financials.amount || fees.totalFee || 0),
        paidAmount: user.userType === 'staff'
          ? (financials.paid || fees.paidSalary || 0)
          : (financials.paid || fees.paidFee || 0),
        dueAmount: user.userType === 'staff'
          ? (financials.due || fees.dueSalary || 0)
          : (financials.due || fees.dueFee || 0),
        lastPayment: (() => {
          const payments = financials.paymentHistory || fees.paymentHistory || [];
          return payments.length > 0 ? payments[payments.length - 1] : null;
        })()
      };
    });
    
    res.json({ success: true, users: formattedUsers, count: formattedUsers.length });
    
  } catch (error) {
    console.error("❌ Get users with due payments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// ✅ GET PAYMENT SUMMARY - WORKING
// ==========================================
exports.getPaymentSummary = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { 'financials.paymentHistory.0': { $exists: true } },
        { 'fees.paymentHistory.0': { $exists: true } },
        { 'financials.amount': { $gt: 0 } },
        { 'fees.totalFee': { $gt: 0 } },
        { 'fees.salary': { $gt: 0 } }
      ]
    });
    
    let totalFees = 0, totalPaidFees = 0, totalDueFees = 0;
    let totalSalary = 0, totalPaidSalary = 0, totalDueSalary = 0;
    let totalPayments = 0, todayPayments = 0, monthPayments = 0, yearPayments = 0;
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    users.forEach(user => {
      const financials = user.financials || {};
      const fees = user.fees || {};
      
      if (user.userType === 'student') {
        totalFees += financials.amount || fees.totalFee || 0;
        totalPaidFees += financials.paid || fees.paidFee || 0;
        totalDueFees += financials.due || fees.dueFee || 0;
      } else if (user.userType === 'staff') {
        totalSalary += financials.amount || fees.salary || 0;
        totalPaidSalary += financials.paid || fees.paidSalary || 0;
        totalDueSalary += financials.due || fees.dueSalary || 0;
      }
      
      const payments = financials.paymentHistory || fees.paymentHistory || [];
      payments.forEach(payment => {
        totalPayments++;
        const paymentDate = new Date(payment.date);
        if (paymentDate.toDateString() === today.toDateString()) todayPayments++;
        if (paymentDate >= startOfMonth) monthPayments++;
        if (paymentDate >= startOfYear) yearPayments++;
      });
    });
    
    res.json({
      success: true,
      summary: {
        financials: {
          totalFees, totalPaidFees, totalDueFees,
          totalSalary, totalPaidSalary, totalDueSalary
        },
        payments: {
          total: totalPayments,
          today: todayPayments,
          thisMonth: monthPayments,
          thisYear: yearPayments
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Get payment summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// ✅ GENERATE RECEIPT - WORKING
// ==========================================
exports.generateReceipt = async (req, res) => {
  try {
    const { userId, paymentId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    // Payment dhundho - fees ya financials mein
    let payment = null;
    
    if (user.fees?.paymentHistory) {
      payment = user.fees.paymentHistory.find(p => p._id?.toString() === paymentId);
    }
    
    if (!payment && user.financials?.paymentHistory) {
      payment = user.financials.paymentHistory.find(p => p._id?.toString() === paymentId);
    }
    
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    
    res.json({
      success: true,
      receipt: {
        receiptNo: payment.receiptNo || `REC-${Date.now()}`,
        date: payment.date,
        user: {
          name: user.name,
          userId: user.userId,
          email: user.email,
          phone: user.phone
        },
        payment: {
          amount: payment.amount,
          type: payment.type,
          method: payment.paymentMethod,
          description: payment.description,
          transactionId: payment.transactionId,
          month: payment.month
        },
        recordedBy: payment.recordedBy,
        status: payment.status
      }
    });
    
  } catch (error) {
    console.error("❌ Generate receipt error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};