// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorHandler');
const allRoutes = require('./routes'); // Import all routes

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Disposition']
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/download', allRoutes); // All platform-specific routes will be under /api/download/

// Serve static files from the 'downloads' directory (if you want to make downloaded files accessible)
// This is for demonstration. In a real production app, consider secure file serving or cloud storage.
app.use('/downloads', express.static('downloads'));

// Basic health endpoint and landing
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'DownloaderYaar API is running',
        apiBase: '/api/download'
    });
});


// Custom error handler middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));