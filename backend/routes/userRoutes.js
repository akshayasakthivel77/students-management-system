const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  forgotPassword,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/', protect, adminOnly, getUsers);

module.exports = router;
