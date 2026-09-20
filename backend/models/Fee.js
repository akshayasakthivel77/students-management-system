const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 1,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque'],
    default: 'UPI',
  },
  transactionId: {
    type: String,
    trim: true,
    default: () => 'TXN' + Math.floor(100000 + Math.random() * 900000),
  },
  receiptNumber: {
    type: String,
    trim: true,
    default: () => 'REC-' + Date.now().toString().slice(-6),
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
});

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    feeCategory: {
      type: String,
      enum: ['Tuition', 'Hostel', 'Exam', 'Transport', 'General'],
      default: 'Tuition',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paymentHistory: [paymentHistorySchema],
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-calculate dueAmount and paymentStatus before saving
feeSchema.pre('save', function (next) {
  this.dueAmount = Math.max(0, this.totalAmount - this.paidAmount);

  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = this.dueDate && new Date() > this.dueDate ? 'Overdue' : 'Partial';
  } else {
    this.paymentStatus = this.dueDate && new Date() > this.dueDate ? 'Overdue' : 'Pending';
  }

  next();
});

feeSchema.index({ student: 1, semester: 1, academicYear: 1, feeCategory: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
