// routes/instagram.js
const express = require('express');
const { downloadInstagramVideo } = require('../controllers/instagramController');
const router = express.Router();

router.post('/', downloadInstagramVideo);

module.exports = router;