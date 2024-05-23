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
    const outputPath = path.resolve(__dirname, 'public', `${videoId}.mp3`);
    const tempOutputPath = path.resolve(__dirname, 'public', `${videoId}.mp4`);

    try {
        const audioStream = ytdl(url, { filter: 'audioonly' });

        const writeStream = fs.createWriteStream(tempOutputPath);
        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            ffmpeg(tempOutputPath)
                .audioBitrate(128)
                .on('start', commandLine => {
                    console.log('Spawned FFmpeg with command: ' + commandLine);
                })
                .on('progress', progress => {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('end', () => {
                    console.log('Conversion succeeded');
                    fs.unlinkSync(tempOutputPath); // Entfernen Sie die temporäre Datei
                    res.json({ success: true, downloadUrl: `/${videoId}.mp3` });
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err.message);
                    fs.unlinkSync(tempOutputPath); // Entfernen Sie die temporäre Datei bei Fehlern
                    res.json({ success: false, message: 'Error converting video' });
                })
                .save(outputPath);
        });

        writeStream.on('error', (err) => {
            console.error('Stream error:', err.message);
            res.json({ success: false, message: 'Error downloading video' });
        });
    } catch (error) {
        console.error('Stream error:', error.message);
        res.json({ success: false, message: 'Error downloading video' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
