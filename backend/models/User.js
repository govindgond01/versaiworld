const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // Core Identity
  name: { type: String, required: true, trim: true },
  // ===== NEW FIELD: Father's Name =====
  fatherName: { type: String, trim: true },  // Optional field
  
  // ===== NEW FIELD: Date of Birth =====
  dob: { type: Date },  // Optional field
  
  email: {type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { 
    type: String, 
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  profileImage: {
    public_id: { type: String },
    secure_url: { type: String },
    url: { type: String },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  },
  userId: { type: String, unique: true, index: true },
  
  // Education/Work
 course: { 
  type: String, 
  enum: ["", "RS CIT", "Excel", "Advance Excel", "Web Development", "php", "Graphic Design", "Digital Marketing", "Tally"],
  required: function() {
    // Sirf academy students ke liye required
    return this.userType === 'student' && this.studentCategory === 'academy';
  },
  default: function() {
    // Admin/staff/library student ke liye default undefined
    return this.userType === 'student' && this.studentCategory === 'academy' ? '' : undefined;
  },
  validate: {
    validator: function(v) {
      // Agar user student nahi hai, validation skip karo
      if (this.userType !== 'student') return true;
      // Agar academy student hai to value honi chahiye
      if (this.studentCategory === 'academy') {
        return v && v !== '';
      }
      return true;
    },
    message: 'Course is required for academy students'
  }
},
  batch: String,
  department: String,
  
  // Role Management
  userType: { 
    type: String, 
    enum: ["superAdmin", "admin", "student", "staff"], 
    default: "student",
    index: true
  },
  studentCategory: { 
    type: String, 
    enum: ["academy", "library", "both"] 
  },
  staffRole: { 
    type: String, 
    enum: ["teacher", "Digital Marketer", "Web Developer","Front-End Developer","Back-End Developer","Full-Stack Developer", "other"] 
  },
  
  // Financial Structure - Optimized
  fees: {
    // For Students
    totalFee: { type: Number, default: 0 },
    paidFee: { type: Number, default: 0 },
    dueFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    
    // For Staff (Salary)
    salary: { type: Number, default: 0 },
    paidSalary: { type: Number, default: 0 },
    dueSalary: { type: Number, default: 0 },
    salaryType: { 
      type: String, 
      enum: ["monthly", "hourly", "commission", "contract"], 
      default: "monthly" 
    },
    
    // Payment Methods & History
    paymentHistory: [{
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true },
      type: { 
        type: String, 
        enum: ["fee", "salary", "advance", "refund", "other"],
        required: true 
      },
      paymentMethod: { 
        type: String, 
        enum: ["cash", "bank_transfer", "card", "upi", "cheque"],
        default: "cash" 
      },
      transactionId: String,
      receiptNo: String,
      month: String, // For salary: "2024-01"
      description: String,
      status: { 
        type: String, 
        enum: ["paid", "pending", "failed", "refunded"], 
        default: "paid" 
      },
      recordedBy: String // Admin who recorded payment
    }],
    
    // Bank Details (Optional)
    bankDetails: {
      accountNumber: String,
      accountHolder: String,
      bankName: String,
      ifsc: String,
      branch: String
    }
  },
  
  // Dates & Duration
  admissionDate: { type: Date, default: Date.now },
  joinDate: { type: Date, default: Date.now },
  membershipDuration: { 
    type: String, 
    enum: ["1_month", "3_months", "6_months", "1_year", "custom"],
    default: "1_month" 
  },
  endDate: Date,
  
  // Contact & Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" }
  },
  
  // Status & Tracking
  status: { 
    type: String, 
    enum: ["active", "inactive", "suspended", "graduated", "left"], 
    default: "active" 
  },
  
  // Security fields
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date, // Account lock timestamp
  refreshToken: String, // For refresh token mechanism
  
  // Academic/Performance (Optional)
  attendance: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  
  // ✅ NOTIFICATIONS ADDED HERE - BAKI SAB WAISA HI HAI
  notifications: [{
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["student", "payment", "academic", "system", "meeting", "security", "other"],
      default: "system"
    },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],

  // ✅ NOTIFICATION SETTINGS ADDED HERE
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    sound: { type: Boolean, default: true }
  },
  
  // Admin Notes
  notes: [{
    date: { type: Date, default: Date.now },
    text: String,
    createdBy: String
  }],
  
  // Login/Security
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for quick access
UserSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const addr = this.address;
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.trim();
});

UserSchema.virtual('isStudent').get(function() {
  return this.userType === 'student';
});

UserSchema.virtual('isStaff').get(function() {
  return this.userType === 'staff';
});

UserSchema.virtual('isAdmin').get(function() {
  return this.userType === 'admin';
});

// Auto-process before save
UserSchema.pre("save", async function(next) {
  // Hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Generate User ID if new
  if (this.isNew && !this.userId) {
    const prefixMap = {
      "student_academy": "ACAD",
      "student_library": "LIB",
      "student_both": "STU",
      "staff_teacher": "TCH",
      "staff_librarian": "LIBR",
      "staff_accountant": "ACC",
      "staff_receptionist": "REC",
      "staff_other": "STF",
      "admin": "ADM"
    };
    
    const category = this.userType === 'student' ? this.studentCategory : (this.staffRole || 'other');
    const key = `${this.userType}_${category}`;
    const prefix = prefixMap[key] || "USR";
    
    // Find the highest existing userId with this prefix
    const lastUser = await this.constructor.findOne({ 
      userId: new RegExp(`^${prefix}`) 
    }).sort({ userId: -1 });
    
    let nextNumber = 1;
    if (lastUser && lastUser.userId) {
      const lastNumber = parseInt(lastUser.userId.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }
    
    this.userId = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
  
  // Auto-calculate due amounts
  if (this.userType === 'student') {
    this.fees.dueFee = (this.fees.totalFee || 0) - (this.fees.paidFee || 0);
  } else if (this.userType === 'staff') {
    this.fees.dueSalary = (this.fees.salary || 0) - (this.fees.paidSalary || 0);
  }
  
  // Auto-calculate attendance percentage
  if (this.attendance && (this.attendance.present + this.attendance.absent) > 0) {
    this.attendance.percentage = Math.round(
      (this.attendance.present / (this.attendance.present + this.attendance.absent)) * 100
    );
  }
  
  // Set end date based on membership duration
  if (this.isModified('membershipDuration') || this.isNew) {
    const durationMap = {
      "1_month": 1,
      "3_months": 3,
      "6_months": 6,
      "1_year": 12
    };
    
    const months = durationMap[this.membershipDuration] || 1;
    const startDate = this.admissionDate || this.joinDate || new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    this.endDate = endDate;
  }
  
  typeof next === 'function' && next();
});

// ✅ BACKWARD COMPATIBILITY: Virtual 'financials' field
// This provides the old 'financials' structure computed from 'fees'
UserSchema.virtual('financials').get(function() {
  if (this.userType === 'student') {
    return {
      amount: this.fees.totalFee || 0,
      paid: this.fees.paidFee || 0,
      due: this.fees.dueFee || 0,
      paymentHistory: this.fees.paymentHistory || []
    };
  } else if (this.userType === 'staff') {
    return {
      amount: this.fees.salary || 0,
      paid: this.fees.paidSalary || 0,
      due: this.fees.dueSalary || 0,
      paymentHistory: this.fees.paymentHistory || []
    };
  }
  return {
    amount: 0,
    paid: 0,
    due: 0,
    paymentHistory: []
  };
});

// Helper methods
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Add payment method
UserSchema.methods.addPayment = function(paymentData) {
  const payment = {
    date: new Date(),
    amount: paymentData.amount,
    type: paymentData.type || (this.userType === 'student' ? 'fee' : 'salary'),
    paymentMethod: paymentData.paymentMethod || 'cash',
    transactionId: paymentData.transactionId,
    receiptNo: paymentData.receiptNo,
    month: paymentData.month,
    description: paymentData.description,
    status: paymentData.status || 'paid',
    recordedBy: paymentData.recordedBy
  };
  
  // Update financials
  if (payment.type === 'fee' && this.userType === 'student') {
    this.fees.paidFee += payment.amount;
    this.fees.dueFee = this.fees.totalFee - this.fees.paidFee;
  } else if (payment.type === 'salary' && this.userType === 'staff') {
    this.fees.paidSalary += payment.amount;
    this.fees.dueSalary = this.fees.salary - this.fees.paidSalary;
  }
  
  // Add to history
  if (!this.fees.paymentHistory) {
    this.fees.paymentHistory = [];
  }
  this.fees.paymentHistory.push(payment);
  
  return payment;
};

// Get due amount
UserSchema.methods.getDueAmount = function() {
  if (this.userType === 'student') {
    return this.fees.dueFee;
  } else if (this.userType === 'staff') {
    return this.fees.dueSalary;
  }
  return 0;
};

// Get payment summary
UserSchema.methods.getPaymentSummary = function() {
  const summary = {
    total: 0,
    paid: 0,
    due: 0,
    lastPayment: null
  };
  
  if (this.userType === 'student') {
    summary.total = this.fees.totalFee;
    summary.paid = this.fees.paidFee;
    summary.due = this.fees.dueFee;
  } else if (this.userType === 'staff') {
    summary.total = this.fees.salary;
    summary.paid = this.fees.paidSalary;
    summary.due = this.fees.dueSalary;
  }
  
  if (this.fees.paymentHistory && this.fees.paymentHistory.length > 0) {
    summary.lastPayment = this.fees.paymentHistory[this.fees.paymentHistory.length - 1];
  }
  
  return summary;
};

module.exports = mongoose.model("User", UserSchema);