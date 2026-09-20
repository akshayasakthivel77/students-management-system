const express = require('express');
const router = express.Router();
const {
  createFeeRecord,
  getFees,
  getFeeStats,
  getStudentFeeDetails,
  recordPayment,
  updateFee,
  deleteFee,
} = require('../controllers/feeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(adminOnly, createFeeRecord)
  .get(getFees);

router.get('/stats', getFeeStats);
router.get('/student/:studentId', getStudentFeeDetails);
router.post('/:id/pay', recordPayment);

router.route('/:id')
  .put(adminOnly, updateFee)
  .delete(adminOnly, deleteFee);

module.exports = router;
