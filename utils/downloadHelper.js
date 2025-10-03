// utils/downloadHelper.js
const path = require('path');
const fs = require('fs');

// Prefer a bundled yt-dlp binary for consistent behavior across environments (e.g., Render)
// Fallback to system-installed yt-dlp if the package is not available.
let ytDlp;
try {
  const ytdlpPath = require('@distube/yt-dlp');
  ytDlp = require('youtube-dl-exec').create(ytdlpPath);
} catch (_) {
  ytDlp = require('youtube-dl-exec');
}

const getDirectVideoUrl = async (videoUrl, platform) => {
    try {
        const options = {
            dumpSingleJson: true, // ✅ get JSON metadata
            noWarnings: true,
            preferFreeFormats: true,
            noCheckCertificates: true,
        };

        // Apply cookies if provided via environment for any platform that may require authentication.
        // Set COOKIES_PATH to a readable file path (e.g., ./cookies.txt) in your environment.
        const cookiesPathFromEnv = process.env.COOKIES_PATH;
        if (cookiesPathFromEnv) {
            const resolved = path.isAbsolute(cookiesPathFromEnv)
                ? cookiesPathFromEnv
                : path.join(process.cwd(), cookiesPathFromEnv);
            if (fs.existsSync(resolved)) {
                options.cookies = resolved;
            }
        }

        // YouTube ke liye specific format selection
        if (platform === "YouTube") {
            // Combined video+audio MP4 format prefer karo
            options.format = 'best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best[height<=720]/best';
            // Add desktop UA and referer to reduce bot checks
            options.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
            options.addHeader = [
                'Referer: https://www.youtube.com',
                'Origin: https://www.youtube.com'
            ];
        }

        // Backward compatibility: also look for project-local cookies.txt if COOKIES_PATH not set
        if (!options.cookies && (platform === "Instagram" || platform === "Facebook" || platform === "YouTube")) {
            const fallbackCookies = path.join(__dirname, '..', 'cookies.txt');
            if (fs.existsSync(fallbackCookies)) {
                options.cookies = fallbackCookies;
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
