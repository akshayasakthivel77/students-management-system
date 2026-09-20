const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc  Get attendance records
// @route GET /api/attendance
// @access Private
const getAttendance = async (req, res) => {
  try {
    const { studentId, date, subject, page = 1, limit = 20 } = req.query;

    const query = {};
    if (studentId) query.student = studentId;
    if (subject) query.subject = subject;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('student', 'name rollNumber course year')
      .populate('markedBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get attendance summary for a student
// @route GET /api/attendance/summary/:studentId
// @access Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const summary = await Attendance.aggregate([
      { $match: { student: require('mongoose').Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = summary.reduce((acc, s) => acc + s.count, 0);
    res.json({ summary, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Mark attendance
// @route POST /api/attendance
// @access Private
const markAttendance = async (req, res) => {
  try {
    const { student, date, status, subject, remarks } = req.body;

    const attendance = new Attendance({
      student,
      date: date || new Date(),
      status,
      subject,
      remarks,
      markedBy: req.user._id,
    });

    const saved = await attendance.save();
    await saved.populate('student', 'name rollNumber');
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this date/subject' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc  Bulk mark attendance
// @route POST /api/attendance/bulk
// @access Private
const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // array of { student, date, status, subject }
    const withUser = records.map((r) => ({ ...r, markedBy: req.user._id }));
    const saved = await Attendance.insertMany(withUser, { ordered: false });
    res.status(201).json({ message: `${saved.length} records saved`, saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc  Update attendance
// @route PUT /api/attendance/:id
// @access Private
const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc  Delete attendance record
// @route DELETE /api/attendance/:id
// @access Private/Admin
const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  getAttendanceSummary,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
};
