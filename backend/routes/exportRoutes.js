const express = require('express');
const router = express.Router();
const {
  exportStudentsCSV,
  exportAttendanceCSV,
  exportFeesCSV,
  exportGradesCSV,
} = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/students', exportStudentsCSV);
router.get('/attendance', exportAttendanceCSV);
router.get('/fees', exportFeesCSV);
router.get('/grades', exportGradesCSV);

module.exports = router;
