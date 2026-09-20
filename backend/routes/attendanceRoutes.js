const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceSummary,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAttendance).post(protect, markAttendance);
router.post('/bulk', protect, bulkMarkAttendance);
router.get('/summary/:studentId', protect, getAttendanceSummary);
router
  .route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance);

module.exports = router;
