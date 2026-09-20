const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Grade = require('../models/Grade');

// RFC 4180 CSV value sanitizer
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

// @desc    Export students as CSV
// @route   GET /api/export/students
// @access  Private
const exportStudentsCSV = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).sort({ rollNumber: 1 });

    const headers = [
      'Roll Number',
      'Name',
      'Course',
      'Year',
      'Section',
      'Email',
      'Phone',
      'Gender',
      'Address',
      'Status',
    ];

    const rows = students.map((s) => [
      escapeCSV(s.rollNumber),
      escapeCSV(s.name),
      escapeCSV(s.course),
      escapeCSV(s.year),
      escapeCSV(s.section),
      escapeCSV(s.email),
      escapeCSV(s.phone || ''),
      escapeCSV(s.gender || ''),
      escapeCSV(s.address || ''),
      escapeCSV(s.isActive ? 'Active' : 'Inactive'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_list.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance records as CSV
// @route   GET /api/export/attendance
// @access  Private
const exportAttendanceCSV = async (req, res) => {
  try {
    const { date, subject } = req.query;
    const query = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (subject) query.subject = subject;

    const records = await Attendance.find(query)
      .populate('student', 'name rollNumber course section')
      .sort({ date: -1, createdAt: -1 });

    const headers = [
      'Date',
      'Roll Number',
      'Student Name',
      'Course',
      'Section',
      'Subject',
      'Status',
      'Remarks',
    ];

    const rows = records.map((r) => [
      escapeCSV(new Date(r.date).toISOString().split('T')[0]),
      escapeCSV(r.student ? r.student.rollNumber : 'N/A'),
      escapeCSV(r.student ? r.student.name : 'Unknown'),
      escapeCSV(r.student ? r.student.course : ''),
      escapeCSV(r.student ? r.student.section : ''),
      escapeCSV(r.subject || 'General'),
      escapeCSV(r.status),
      escapeCSV(r.remarks || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export fees and collections as CSV
// @route   GET /api/export/fees
// @access  Private
const exportFeesCSV = async (req, res) => {
  try {
    const fees = await Fee.find({})
      .populate('student', 'name rollNumber course year')
      .sort({ createdAt: -1 });

    const headers = [
      'Roll Number',
      'Student Name',
      'Course',
      'Academic Year',
      'Semester',
      'Fee Category',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Due Amount (INR)',
      'Status',
      'Due Date',
    ];

    const rows = fees.map((f) => [
      escapeCSV(f.student ? f.student.rollNumber : 'N/A'),
      escapeCSV(f.student ? f.student.name : 'Unknown'),
      escapeCSV(f.student ? f.student.course : ''),
      escapeCSV(f.academicYear),
      escapeCSV(f.semester),
      escapeCSV(f.feeCategory),
      escapeCSV(f.totalAmount),
      escapeCSV(f.paidAmount),
      escapeCSV(f.dueAmount),
      escapeCSV(f.paymentStatus),
      escapeCSV(f.dueDate ? new Date(f.dueDate).toISOString().split('T')[0] : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fees_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export grades / exam marks as CSV
// @route   GET /api/export/grades
// @access  Private
const exportGradesCSV = async (req, res) => {
  try {
    const grades = await Grade.find({})
      .populate('student', 'name rollNumber course year section')
      .sort({ semester: 1, createdAt: -1 });

    const headers = [
      'Roll Number',
      'Student Name',
      'Course',
      'Academic Year',
      'Semester',
      'Exam Type',
      'Total Marks Obtained',
      'Maximum Total Marks',
      'Percentage (%)',
      'GPA',
      'Remarks',
    ];

    const rows = grades.map((g) => [
      escapeCSV(g.student ? g.student.rollNumber : 'N/A'),
      escapeCSV(g.student ? g.student.name : 'Unknown'),
      escapeCSV(g.student ? g.student.course : ''),
      escapeCSV(g.academicYear),
      escapeCSV(g.semester),
      escapeCSV(g.examType),
      escapeCSV(g.totalMarks),
      escapeCSV(g.maxTotalMarks),
      escapeCSV(g.percentage),
      escapeCSV(g.gpa),
      escapeCSV(g.remarks || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="grades_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportStudentsCSV,
  exportAttendanceCSV,
  exportFeesCSV,
  exportGradesCSV,
};
