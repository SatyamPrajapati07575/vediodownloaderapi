// routes/facebook.js
const express = require('express');
const { downloadFacebookVideo } = require('../controllers/facebookController');
const router = express.Router();

router.post('/', downloadFacebookVideo);

module.exports = router;