// utils/validationSchemas.js
const { z } = require('zod');

const youtubeUrlSchema = z.object({
    url: z.string().url('Invalid URL format').regex(
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        'Invalid YouTube URL'
    ),
});

const instagramUrlSchema = z.object({
    url: z.string().url('Invalid URL format').regex(
        /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|reels|tv)\/.+$/,
        'Invalid Instagram URL'
    ),
});

const facebookUrlSchema = z.object({
    url: z.string().url('Invalid URL format').regex(
        /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/,
        'Invalid Facebook URL'
    ),
});

module.exports = {
    youtubeUrlSchema,
    instagramUrlSchema,
    facebookUrlSchema,
};
