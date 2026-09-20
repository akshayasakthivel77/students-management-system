const Student = require('../models/Student');

// @desc  Get all students
// @route GET /api/students
// @access Private
const getStudents = async (req, res) => {
  try {
    const { search, course, year, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) query.course = course;
    if (year) query.year = Number(year);

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ rollNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      students,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single student
// @route GET /api/students/:id
// @access Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a student
// @route POST /api/students
// @access Private
const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or Roll Number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc  Update a student
// @route PUT /api/students/:id
// @access Private
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc  Delete a student (soft delete)
// @route DELETE /api/students/:id
// @access Private (admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
