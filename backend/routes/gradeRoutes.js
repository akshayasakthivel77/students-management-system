const express = require('express');
const router = express.Router();
const {
  addGrade,
  getGrades,
  getStudentReportCard,
  getGradeById,
  updateGrade,
  deleteGrade,
} = require('../controllers/gradeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(adminOnly, addGrade)
  .get(getGrades);

router.get('/student/:studentId', getStudentReportCard);

router.route('/:id')
  .get(getGradeById)
  .put(adminOnly, updateGrade)
  .delete(adminOnly, deleteGrade);

module.exports = router;
