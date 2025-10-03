// utils/downloadHelper.js
const ytDlp = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

const getDirectVideoUrl = async (videoUrl, platform) => {
    try {
        const options = {
            dumpSingleJson: true, // ✅ get JSON metadata
            noWarnings: true,
            preferFreeFormats: true,
            noCheckCertificates: true,
        };

        // YouTube ke liye specific format selection
        if (platform === "YouTube") {
            // Combined video+audio MP4 format prefer karo
            options.format = 'best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best[height<=720]/best';
        }

        // Instagram / Facebook ke liye cookies
        if (platform === "Instagram" || platform === "Facebook") {
            const cookiesPath = path.join(__dirname, '..', 'cookies.txt');
            if (fs.existsSync(cookiesPath)) {
                options.cookies = cookiesPath;
            }
        }

        const info = await ytDlp(videoUrl, options);

        // ✅ JSON se best video URL nikalna
        let directUrl = info.url;
        const title = info.title || `${platform}-video`;

        // YouTube ke liye MP4 format ensure karo
        if (platform === "YouTube" && info.formats) {
            // Combined video+audio MP4 formats filter karo
            const combinedMp4Formats = info.formats.filter(format => 
                format.ext === 'mp4' && 
                format.url && 
                !format.url.includes('.m3u8') &&
                format.vcodec !== 'none' && // video track chahiye
                format.acodec !== 'none'    // audio track bhi chahiye
            );

            if (combinedMp4Formats.length > 0) {
                // Best quality combined MP4 select karo
                const bestCombinedMp4 = combinedMp4Formats.reduce((best, current) => {
                    const bestHeight = best.height || 0;
                    const currentHeight = current.height || 0;
                    return currentHeight > bestHeight ? current : best;
                });
                directUrl = bestCombinedMp4.url;
            } else {
                // Agar combined format nahi mila to fallback to any MP4
                const mp4Formats = info.formats.filter(format => 
                    format.ext === 'mp4' && 
                    format.url && 
                    !format.url.includes('.m3u8') &&
                    format.vcodec !== 'none'
                );
                
                if (mp4Formats.length > 0) {
                    const bestMp4 = mp4Formats.reduce((best, current) => {
                        const bestHeight = best.height || 0;
                        const currentHeight = current.height || 0;
                        return currentHeight > bestHeight ? current : best;
                    });
                    directUrl = bestMp4.url;
                }
            }
        }

        return { directUrl, title, info };

    } catch (error) {
        console.error(`❌ Error fetching ${platform} video URL:`, error.message);
        throw new Error(`Failed to fetch ${platform} video link`);
    }
};

module.exports = { getDirectVideoUrl };
