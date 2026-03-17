const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  type: {
    type: String,
    enum: ['fee', 'salary', 'advance', 'refund', 'other'],
    required: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'upi', 'cheque'],
    default: 'cash'
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  month: {
    type: String, // Format: "YYYY-MM" for salary/fee tracking
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'paid'
  },
  
  // Metadata
  recordedBy: {
    type: String,
    trim: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ type: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ month: 1, type: 1 });

// Pre-save middleware
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique receipt number
PaymentSchema.statics.generateReceiptNo = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const receiptNo = `REC-${year}${month}-${random}`;
  
  // Check if exists, generate new if conflict
  const existing = await this.findOne({ receiptNo });
  if (existing) {
    return this.generateReceiptNo();
  }
  
  return receiptNo;
};

module.exports = mongoose.model('Payment', PaymentSchema);