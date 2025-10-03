// routes/youtube.js
const express = require('express');
const { downloadYouTubeVideo } = require('../controllers/youtubeController');
const router = express.Router();

router.post('/', downloadYouTubeVideo);

module.exports = router;