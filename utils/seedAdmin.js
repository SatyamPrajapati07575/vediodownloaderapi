const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
require('dotenv').config();

// Connect to database
connectDB();

const seedAdmin = async () => {
    try {
        const SEED_USERNAME = 'satyamadmin123@gmail.com';
        const SEED_PASSWORD = 'satyam@123'; // Change after first login

        // Check if admin already exists (same username we intend to create)
        const existingAdmin = await Admin.findOne({ username: SEED_USERNAME });

        if (existingAdmin) {
            console.log('Admin user already exists:', SEED_USERNAME);
            return;
        }

        // Create new admin
        const admin = new Admin({
            username: SEED_USERNAME,
            password: SEED_PASSWORD,
            role: 'superadmin',
            isActive: true
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Username:', SEED_USERNAME);
        console.log('Password:', SEED_PASSWORD);
        console.log('Please change the password after first login!');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin();
