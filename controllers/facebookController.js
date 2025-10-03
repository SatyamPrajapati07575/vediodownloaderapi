// controllers/facebookController.js
const { handleDownloadRequest } = require('./downloadController');
const { facebookUrlSchema } = require('../utils/validationSchemas');

const downloadFacebookVideo = async (req, res) => {
    await handleDownloadRequest(req, res, 'Facebook', facebookUrlSchema);
};

module.exports = { downloadFacebookVideo };
