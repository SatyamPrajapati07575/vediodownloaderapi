// controllers/youtubeController.js
const { handleDownloadRequest } = require('./downloadController');
const { youtubeUrlSchema } = require('../utils/validationSchemas');

const downloadYouTubeVideo = async (req, res) => {
    await handleDownloadRequest(req, res, 'YouTube', youtubeUrlSchema);
};

module.exports = { downloadYouTubeVideo };
