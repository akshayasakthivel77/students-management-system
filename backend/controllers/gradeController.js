const Grade = require('../models/Grade');
const Student = require('../models/Student');

// @desc    Add / Record new grade for a student
// @route   POST /api/grades
// @access  Private
const addGrade = async (req, res) => {
  try {
    const { student, examType, academicYear, semester, subjects, remarks } = req.body;

    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingGrade = await Grade.findOne({ student, examType, semester, academicYear });
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade record already exists for this exam and semester' });
    }

    const grade = new Grade({
      student,
      examType,
      academicYear,
      semester,
      subjects,
      remarks,
    });

    const savedGrade = await grade.save();
    const populated = await Grade.findById(savedGrade._id).populate('student', 'name rollNumber course year section');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all grades with filters & pagination
// @route   GET /api/grades
// @access  Private
const getGrades = async (req, res) => {
  try {
    const { student, examType, semester, academicYear, page = 1, limit = 15 } = req.query;

    const query = {};
    if (student) query.student = student;
    if (examType) query.examType = examType;
    if (semester) query.semester = Number(semester);
    if (academicYear) query.academicYear = academicYear;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Grade.countDocuments(query);

    const grades = await Grade.find(query)
      .populate('student', 'name rollNumber course year section email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      grades,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student complete report card / academic history
// @route   GET /api/grades/student/:studentId
// @access  Private
const getStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const grades = await Grade.find({ student: studentId }).sort({ semester: 1, createdAt: 1 });

    let cumulativeGpa = 0;
    if (grades.length > 0) {
      const sumGpa = grades.reduce((acc, curr) => acc + (curr.gpa || 0), 0);
      cumulativeGpa = parseFloat((sumGpa / grades.length).toFixed(2));
    }

    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        year: student.year,
        section: student.section,
      },
      cumulativeGpa,
      totalExams: grades.length,
      grades,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single grade record by ID
// @route   GET /api/grades/:id
// @access  Private
const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id).populate('student', 'name rollNumber course year section');
    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade record
// @route   PUT /api/grades/:id
// @access  Private
const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    const { examType, academicYear, semester, subjects, remarks } = req.body;

    if (examType) grade.examType = examType;
    if (academicYear) grade.academicYear = academicYear;
    if (semester) grade.semester = semester;
    if (subjects) grade.subjects = subjects;
    if (remarks !== undefined) grade.remarks = remarks;

    const updated = await grade.save();
    const populated = await Grade.findById(updated._id).populate('student', 'name rollNumber course year section');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete grade record
// @route   DELETE /api/grades/:id
// @access  Private
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }
    res.json({ message: 'Grade record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addGrade,
  getGrades,
  getStudentReportCard,
  getGradeById,
  updateGrade,
  deleteGrade,
};
