const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
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

    ytdl(url, { filter: 'audioonly' })
        .pipe(ffmpeg()
            .audioBitrate(128)
            .save(outputPath)
            .on('end', () => {
                res.json({ success: true, downloadUrl: `/${videoId}.mp3` });
            })
            .on('error', (err) => {
                console.error(err);
                res.json({ success: false, message: 'Error converting video' });
            })
        );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
