// routes/index.js
const express = require('express');
const router = express.Router();

const youtubeRoutes = require('./youtube');
const instagramRoutes = require('./instagram');
const facebookRoutes = require('./facebook');
const adminRoutes = require('./admin');
const axios = require('axios');

router.use('/youtube', youtubeRoutes);
router.use('/instagram', instagramRoutes);
router.use('/facebook', facebookRoutes);
router.use('/admin', adminRoutes);

// Proxy download endpoint: POST /api/download/proxy
// Body: { url: string, filename?: string }
router.post('/proxy', async (req, res) => {
    try {
        const { url, filename } = req.body || {};
        if (!url) {
            return res.status(400).json({ error: 'url is required' });
        }

        // Sanitize filename and set default
        const safeBase = (filename || 'video').toString().replace(/[^\w\-.]+/g, '_');

        // Fetch the remote resource as a stream
        const upstream = await axios.get(url, { responseType: 'stream', validateStatus: () => true });

        if (upstream.status < 200 || upstream.status >= 300 || !upstream.data) {
            return res.status(400).json({ error: 'Failed to fetch video' });
        }

        // Forward useful headers
        const ct = upstream.headers['content-type'];
        const cl = upstream.headers['content-length'];
        if (ct) res.setHeader('Content-Type', ct);
        if (cl) res.setHeader('Content-Length', cl);

        // Force download with a filename
        res.setHeader('Content-Disposition', `attachment; filename="${safeBase}.mp4"`);

        // Stream to client
        upstream.data.on('error', (err) => {
            console.error('Upstream stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error' });
            } else {
                res.destroy(err);
            }
        });

        upstream.data.pipe(res);
    } catch (error) {
        console.error('Proxy download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
        } else {
            res.end();
        }
    }
});

module.exports = router;