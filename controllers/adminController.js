const Admin = require('../models/Admin');
const Download = require('../models/Download');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Login admin (email or phone)
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        // Find admin by email or phone
        const admin = await Admin.findOne({
            username: username.toLowerCase().trim()
        });

        if (!admin) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(401).json({
                error: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordCorrect = await admin.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin._id);

        // Return admin data without password
        const adminData = {
            _id: admin._id,
            username: admin.username,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: adminData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed'
        });
    }
};

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private (requires authentication)
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');

        if (!admin) {
            return res.status(404).json({
                error: 'Admin not found'
            });
        }

        return res.json({
            success: true,
            admin: {
                _id: admin._id,
                username: admin.username,
                role: admin.role,
                isActive: admin.isActive,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            error: 'Failed to get profile'
        });
    }
};

// @desc    Get all download records with pagination and filtering
// @route   GET /api/admin/downloads
// @access  Private (requires authentication)
const getAllDownloads = async (req, res) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            platform,
            startDate,
            endDate,
            search,
            ipAddress,
            userAgent,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Filter by platform
        if (platform) {
            filter.platform = { $regex: platform, $options: 'i' }; // Case-insensitive search
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Filter by IP address
        if (ipAddress) {
            filter.ipAddress = { $regex: ipAddress, $options: 'i' };
        }

        // Filter by user agent
        if (userAgent) {
            filter.userAgent = { $regex: userAgent, $options: 'i' };
        }

        // Search in video URL
        if (search) {
            filter.videoUrl = { $regex: search, $options: 'i' };
        }

        // Pagination
        const pageNum = Number.parseInt(page, 10) || 1;
        const limitNum = Number.parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get total count for pagination info
        const totalCount = await Download.countDocuments(filter);

        // Get downloads with filters, pagination, and sorting
        const downloads = await Download.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-__v'); // Exclude version field

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limitNum) || 1;
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.json({
            success: true,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage,
                hasPrevPage
            },
            filters: {
                platform,
                startDate,
                endDate,
                search,
                ipAddress,
                userAgent,
                sortBy,
                sortOrder
            },
            downloads: downloads
        });

    } catch (error) {
        console.error('Get downloads error:', error);
        res.status(500).json({
            error: 'Failed to get download records'
        });
    }
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    getAllDownloads
};
