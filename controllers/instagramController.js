// controllers/instagramController.js
const { handleDownloadRequest } = require('./downloadController');
const { instagramUrlSchema } = require('../utils/validationSchemas');

const downloadInstagramVideo = async (req, res) => {
    await handleDownloadRequest(req, res, 'Instagram', instagramUrlSchema);
};

module.exports = { downloadInstagramVideo };
