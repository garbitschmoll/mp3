const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/convert', async (req, res) => {
    const { url } = req.body;
    if (!ytdl.validateURL(url)) {
        return res.json({ success: false, message: 'Invalid URL' });
    }

    const videoId = ytdl.getURLVideoID(url);
    const outputPathMp3 = path.resolve(__dirname, 'public', `${videoId}.mp3`);
    const outputPathMp4 = path.resolve(__dirname, 'public', `${videoId}.mp4`);

    try {
        const videoStream = ytdl(url);

        // Download MP4
        const mp4WriteStream = fs.createWriteStream(outputPathMp4);
        videoStream.pipe(mp4WriteStream);

        mp4WriteStream.on('finish', () => {
            // Convert MP4 to MP3
            ffmpeg(outputPathMp4)
                .audioBitrate(128)
                .on('start', commandLine => {
                    console.log('Spawned FFmpeg with command: ' + commandLine);
                })
                .on('progress', progress => {
                    const percent = progress.percent ? progress.percent.toFixed(2) : 0;
                    res.write(JSON.stringify({ progress: percent }) + '\n');
                })
                .on('end', async () => {
                    console.log('Conversion succeeded');
                    res.write(JSON.stringify({
                        success: true,
                        downloadMp3Url: `/${videoId}.mp3`,
                        downloadMp4Url: `/${videoId}.mp4`
                    }) + '\n');

                    // Close the response
                    res.end();

                    // Delete files after 1 minute
                    setTimeout(() => {
                        if (fs.existsSync(outputPathMp3)) {
                            fs.unlinkSync(outputPathMp3);
                        }
                        if (fs.existsSync(outputPathMp4)) {
                            fs.unlinkSync(outputPathMp4);
                        }
                    }, 60000); // Deletes the files after 1 minute
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err.message);
                    fs.unlinkSync(outputPathMp4); // Remove the temporary MP4 file on error
                    res.write(JSON.stringify({ success: false, message: 'Error converting video' }) + '\n');
                    res.end();
                })
                .save(outputPathMp3);
        });

        mp4WriteStream.on('error', (err) => {
            console.error('Stream error:', err.message);
            res.write(JSON.stringify({ success: false, message: 'Error downloading video' }) + '\n');
            res.end();
        });
    } catch (error) {
        console.error('Stream error:', error.message);
        res.write(JSON.stringify({ success: false, message: 'Error downloading video' }) + '\n');
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
