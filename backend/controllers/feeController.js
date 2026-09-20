const Fee = require('../models/Fee');
const Student = require('../models/Student');

// @desc    Create / Allocate fee for a student
// @route   POST /api/fees
// @access  Private
const createFeeRecord = async (req, res) => {
  try {
    const { student, academicYear, semester, feeCategory, totalAmount, dueDate, remarks } = req.body;

    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingFee = await Fee.findOne({ student, semester, academicYear, feeCategory: feeCategory || 'Tuition' });
    if (existingFee) {
      return res.status(400).json({ message: 'Fee record already exists for this category and semester' });
    }

    const fee = new Fee({
      student,
      academicYear,
      semester,
      feeCategory: feeCategory || 'Tuition',
      totalAmount,
      dueDate,
      remarks,
    });

    const savedFee = await fee.save();
    const populated = await Fee.findById(savedFee._id).populate('student', 'name rollNumber course year section');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all fees with filtering & pagination
// @route   GET /api/fees
// @access  Private
const getFees = async (req, res) => {
  try {
    const { student, paymentStatus, semester, academicYear, feeCategory, page = 1, limit = 15 } = req.query;

    const query = {};
    if (student) query.student = student;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (semester) query.semester = Number(semester);
    if (academicYear) query.academicYear = academicYear;
    if (feeCategory) query.feeCategory = feeCategory;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Fee.countDocuments(query);

    const fees = await Fee.find(query)
      .populate('student', 'name rollNumber course year section email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      fees,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee financial overview statistics
// @route   GET /api/fees/stats
// @access  Private
const getFeeStats = async (req, res) => {
  try {
    const fees = await Fee.find({});

    let totalBilled = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    fees.forEach((f) => {
      totalBilled += f.totalAmount || 0;
      totalCollected += f.paidAmount || 0;
      totalDue += f.dueAmount || 0;

      if (f.paymentStatus === 'Paid') paidCount++;
      else if (f.paymentStatus === 'Partial') partialCount++;
      else if (f.paymentStatus === 'Overdue') overdueCount++;
      else pendingCount++;
    });

    res.json({
      totalRecords: fees.length,
      totalBilled,
      totalCollected,
      totalDue,
      collectionRate: totalBilled > 0 ? parseFloat(((totalCollected / totalBilled) * 100).toFixed(1)) : 0,
      breakdown: {
        paidCount,
        partialCount,
        pendingCount,
        overdueCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee ledger for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Private
const getStudentFeeDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fees = await Fee.find({ student: studentId }).sort({ semester: 1, dueDate: 1 });

    const totalBilled = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
    const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalDue = Math.max(0, totalBilled - totalPaid);

    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        year: student.year,
        section: student.section,
      },
      summary: {
        totalBilled,
        totalPaid,
        totalDue,
        status: totalDue === 0 ? 'All Clear' : 'Dues Pending',
      },
      fees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a payment against a fee
// @route   POST /api/fees/:id/pay
// @access  Private
const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (fee.paidAmount >= fee.totalAmount) {
      return res.status(400).json({ message: 'Fee is already fully paid' });
    }

    const paymentAmount = Math.min(Number(amount), fee.dueAmount);

    fee.paidAmount += paymentAmount;
    fee.paymentHistory.push({
      amount: paymentAmount,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId || 'TXN' + Math.floor(100000 + Math.random() * 900000),
      receiptNumber: 'REC-' + Date.now().toString().slice(-6),
      recordedBy: req.user ? req.user._id : undefined,
      note: note || '',
    });

    const updatedFee = await fee.save();
    const populated = await Fee.findById(updatedFee._id).populate('student', 'name rollNumber course year section');

    res.json({
      message: 'Payment recorded successfully',
      fee: populated,
      recentPayment: populated.paymentHistory[populated.paymentHistory.length - 1],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Private
const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const { totalAmount, dueDate, remarks, feeCategory } = req.body;

    if (totalAmount !== undefined) fee.totalAmount = Number(totalAmount);
    if (dueDate) fee.dueDate = dueDate;
    if (remarks !== undefined) fee.remarks = remarks;
    if (feeCategory) fee.feeCategory = feeCategory;

    const updated = await fee.save();
    const populated = await Fee.findById(updated._id).populate('student', 'name rollNumber course year section');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private
const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeeRecord,
  getFees,
  getFeeStats,
  getStudentFeeDetails,
  recordPayment,
  updateFee,
  deleteFee,
};
