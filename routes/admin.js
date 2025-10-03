const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, getAllDownloads } = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/auth');

// @route   POST /api/admin/login
// @desc    Login admin with email or phone
// @access  Public
router.post('/login', loginAdmin);

// @route   GET /api/admin/profile
// @desc    Get current admin profile
// @access  Private (requires authentication)
router.get('/profile', authenticateToken, getAdminProfile);

// @route   GET /api/admin/downloads
// @desc    List downloads with pagination and filtering
// @access  Private (requires authentication)
router.get('/downloads', authenticateToken, getAllDownloads);

module.exports = router;
