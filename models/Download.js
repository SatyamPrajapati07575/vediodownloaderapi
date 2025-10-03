// models/Download.js
const mongoose = require('mongoose');

const downloadSchema = mongoose.Schema(
    {
        platform: {
            type: String,
            required: [true, 'Please add a platform (e.g., YouTube, Instagram, Facebook)'],
        },
        videoUrl: {
            type: String,
            required: [true, 'Please add a video URL'],
        },
        downloadTimestamp: {
            type: Date,
            default: Date.now,
        },
        ipAddress: {
            type: String,
            required: false, // Optional, can be logged for analytics
        },
        userAgent: {
            type: String,
            required: false, // Optional, can be logged for analytics
        },
        // Add more fields if needed for future analytics
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('Download', downloadSchema);