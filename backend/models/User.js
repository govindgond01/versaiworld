const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Core Identity
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    dob: { type: Date },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    profileImage: {
      public_id: { type: String },
      secure_url: { type: String },
      url: { type: String },
      format: { type: String },
      width: { type: Number },
      height: { type: Number },
      bytes: { type: Number },
      uploadedAt: { type: Date, default: Date.now },
    },
    userId: { type: String, unique: true, index: true },

    course: {
      type: String,
      enum: [
        "RS CIT",
        "Excel",
        "Advance Excel",
        "Web Development",
        "php",
        "Graphic Design",
        "Digital Marketing",
        "Tally",
      ],
      required: function () {
        return (
          this.userType === "student" && this.studentCategory === "academy"
        );
      },
      default: function () {
        return this.userType === "student" && this.studentCategory === "academy"
          ? "RS CIT"
          : undefined;
      },
    },
    batch: String,
    department: String,

    // Role Management
    userType: {
      type: String,
      enum: ["superAdmin", "admin", "student", "employees"],
      default: "student",
      index: true,
    },
    studentCategory: {
      type: String,
      enum: ["academy", "library", "both"],
    },
    employeesRole: {
      type: String,
      enum: [
        "teacher",
        "Digital Marketer",
        "Web Developer",
        "Front-End Developer",
        "Back-End Developer",
        "Full-Stack Developer",
        "other",
      ],
    },

    // Financial Structure
    fees: {
      totalFee: { type: Number, default: 0 },
      paidFee: { type: Number, default: 0 },
      dueFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      salary: { type: Number, default: 0 },
      paidSalary: { type: Number, default: 0 },
      dueSalary: { type: Number, default: 0 },
      salaryType: {
        type: String,
        enum: ["monthly", "hourly", "commission", "contract"],
        default: "monthly",
      },
      paymentHistory: [
        {
          date: { type: Date, default: Date.now },
          amount: { type: Number, required: true },
          type: {
            type: String,
            enum: ["fee", "salary", "advance", "refund", "other"],
            required: true,
          },
          paymentMethod: {
            type: String,
            enum: ["cash", "bank_transfer", "card", "upi", "cheque"],
            default: "cash",
          },
          transactionId: String,
          receiptNo: String,
          month: String,
          description: String,
          status: {
            type: String,
            enum: ["paid", "pending", "failed", "refunded"],
            default: "paid",
          },
          recordedBy: String,
        },
      ],
      bankDetails: {
        accountNumber: String,
        accountHolder: String,
        bankName: String,
        ifsc: String,
        branch: String,
      },
    },

    // Dates & Duration
    admissionDate: {
      type: Date,
      default: function () {
        return this.userType === "student" ? Date.now() : undefined;
      },
    },
    joinDate: {
      type: Date,
      default: function () {
        return this.userType === "employees" ? Date.now() : undefined;
      },
    },
    membershipDuration: {
      type: String,
      enum: ["1_month", "3_months", "6_months", "1_year", "custom"],
      default: function () {
        return this.userType === "student" ? "1_month" : undefined;
      },
    },
    endDate: Date,

    // Contact & Address
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    // Status & Tracking
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "graduated", "left"],
      default: "active",
    },

    // Security fields
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    refreshToken: String,

    // Academic/Performance
    attendance: {
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },

    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "student",
            "payment",
            "academic",
            "system",
            "meeting",
            "security",
            "other",
          ],
          default: "system",
        },
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],

    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      sound: { type: Boolean, default: true },
    },

    notes: [
      {
        date: { type: Date, default: Date.now },
        text: String,
        createdBy: String,
      },
    ],

    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtuals
UserSchema.virtual("fullAddress").get(function () {
  if (!this.address) return "";
  const addr = this.address;
  return `${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`.trim();
});

UserSchema.virtual("isStudent").get(function () {
  return this.userType === "student";
});

UserSchema.virtual("isemployees").get(function () {
  return this.userType === "employees";
});

UserSchema.virtual("isAdmin").get(function () {
  return this.userType === "admin";
});

// Pre-save hook
UserSchema.pre("save", async function (next) {
  if (!this) {
    return next();
  }

  if (this.userType === "admin") {
    this.attendance = undefined;
    this.fees = undefined;
    this.admissionDate = undefined;
    this.membershipDuration = undefined;
    this.joinDate = undefined;
    this.endDate = undefined;
    this.course = undefined;
    this.studentCategory = undefined;
    this.address = undefined;
    this.notificationSettings = undefined;
    this.notifications = undefined;
    this.notes = undefined;
  }

  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew && !this.userId) {
    let prefix;

    if (this.userType === "superAdmin") {
      prefix = "SUP";
    } else if (this.userType === "admin") {
      prefix = "ADM";
    } else if (this.userType === "student") {
      const category = this.studentCategory || "academy";
      if (category === "academy") prefix = "ACAD";
      else if (category === "library") prefix = "LIB";
      else prefix = "STU";
    } else if (this.userType === "employees") {
      const role = this.employeesRole || "other";
      if (role === "teacher") prefix = "TCH";
      else if (role === "Digital Marketer") prefix = "DGM";
      else if (role === "Web Developer") prefix = "WEB";
      else if (role === "Front-End Developer") prefix = "FED";
      else if (role === "Back-End Developer") prefix = "BED";
      else if (role === "Full-Stack Developer") prefix = "FSD";
      else prefix = "EMP";
    } else {
      prefix = "USR";
    }

    const lastUser = await this.constructor
      .findOne({
        userId: new RegExp(`^${prefix}`),
      })
      .sort({ userId: -1 });

    let nextNumber = 1;
    if (lastUser && lastUser.userId) {
      const lastNumber = parseInt(lastUser.userId.replace(prefix, ""));
      nextNumber = lastNumber + 1;
    }

    this.userId = `${prefix}${nextNumber.toString().padStart(4, "0")}`;
  }

  if (this.userType === "student") {
    this.fees.dueFee = (this.fees.totalFee || 0) - (this.fees.paidFee || 0);
  } else if (this.userType === "employees") {
    this.fees.dueSalary = (this.fees.salary || 0) - (this.fees.paidSalary || 0);
  }

  if (this.attendance && this.attendance.present + this.attendance.absent > 0) {
    this.attendance.percentage = Math.round(
      (this.attendance.present /
        (this.attendance.present + this.attendance.absent)) *
        100,
    );
  }

  if (
    (this.isModified("membershipDuration") || this.isNew) &&
    this.userType === "student"
  ) {
    const durationMap = {
      "1_month": 1,
      "3_months": 3,
      "6_months": 6,
      "1_year": 12,
    };

    const months = durationMap[this.membershipDuration] || 1;
    const startDate = this.admissionDate || this.joinDate || new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    this.endDate = endDate;
  }

  typeof next === 'function' && next();
});

// Virtual financials field
UserSchema.virtual("financials").get(function () {
  if (this.userType === "student") {
    return {
      amount: this.fees.totalFee || 0,
      paid: this.fees.paidFee || 0,
      due: this.fees.dueFee || 0,
      paymentHistory: this.fees.paymentHistory || [],
    };
  } else if (this.userType === "employees") {
    return {
      amount: this.fees.salary || 0,
      paid: this.fees.paidSalary || 0,
      due: this.fees.dueSalary || 0,
      paymentHistory: this.fees.paymentHistory || [],
    };
  }
  return {
    amount: 0,
    paid: 0,
    due: 0,
    paymentHistory: [],
  };
});

// Helper methods
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.addPayment = function (paymentData) {
  const payment = {
    date: new Date(),
    amount: paymentData.amount,
    type: paymentData.type || (this.userType === "student" ? "fee" : "salary"),
    paymentMethod: paymentData.paymentMethod || "cash",
    transactionId: paymentData.transactionId,
    receiptNo: paymentData.receiptNo,
    month: paymentData.month,
    description: paymentData.description,
    status: paymentData.status || "paid",
    recordedBy: paymentData.recordedBy,
  };

  if (payment.type === "fee" && this.userType === "student") {
    this.fees.paidFee += payment.amount;
    this.fees.dueFee = this.fees.totalFee - this.fees.paidFee;
  } else if (payment.type === "salary" && this.userType === "employees") {
    this.fees.paidSalary += payment.amount;
    this.fees.dueSalary = this.fees.salary - this.fees.paidSalary;
  }

  if (!this.fees.paymentHistory) {
    this.fees.paymentHistory = [];
  }
  this.fees.paymentHistory.push(payment);

  return payment;
};

UserSchema.methods.getDueAmount = function () {
  if (this.userType === "student") {
    return this.fees.dueFee;
  } else if (this.userType === "employees") {
    return this.fees.dueSalary;
  }
  return 0;
};

UserSchema.methods.getPaymentSummary = function () {
  const summary = {
    total: 0,
    paid: 0,
    due: 0,
    lastPayment: null,
  };

  if (this.userType === "student") {
    summary.total = this.fees.totalFee;
    summary.paid = this.fees.paidFee;
    summary.due = this.fees.dueFee;
  } else if (this.userType === "employees") {
    summary.total = this.fees.salary;
    summary.paid = this.fees.paidSalary;
    summary.due = this.fees.dueSalary;
  }

  if (this.fees.paymentHistory && this.fees.paymentHistory.length > 0) {
    summary.lastPayment =
      this.fees.paymentHistory[this.fees.paymentHistory.length - 1];
  }

  return summary;
};

module.exports = mongoose.model("User", UserSchema);
