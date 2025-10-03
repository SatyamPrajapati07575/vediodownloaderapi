// controllers/downloadController.js
const { getDirectVideoUrl } = require('../utils/downloadHelper');
const Download = require('../models/Download');

const handleDownloadRequest = async (req, res, platform, schema) => {
    try {
        // ✅ Validate
        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation Error",
                errors: parseResult.error?.errors?.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                })) || [],
            });
        }

        const { url } = parseResult.data;

        // ✅ Save DB record (without saving file)
        const downloadRecord = await Download.create({
            platform,
            videoUrl: url,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        // ✅ Get direct video download link
        const { directUrl, title } = await getDirectVideoUrl(url, platform);

        res.status(200).json({
            message: `${platform} video link generated successfully`,
            // downloadRecord,
            title,
            directDownloadUrl: directUrl, // ✅ frontend can directly download from here
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while processing your request",
            error: error.message,
        });
    }
};

module.exports = { handleDownloadRequest };
