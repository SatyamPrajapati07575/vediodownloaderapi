const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get admin from database
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({ error: 'Invalid token - admin not found' });
        }

        if (!admin.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    }
};

// Middleware to check if admin is superadmin
const requireSuperAdmin = (req, res, next) => {
    if (req.admin.role !== 'superadmin') {
        return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireSuperAdmin
};
