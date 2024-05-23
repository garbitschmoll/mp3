document.getElementById('convert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const messageDiv = document.getElementById('message');
    const downloadLinksDiv = document.getElementById('download-links');
    const downloadMp3Link = document.getElementById('download-mp3');
    const downloadMp4Link = document.getElementById('download-mp4');
    const loadingDiv = document.getElementById('loading');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    messageDiv.innerHTML = '';
    downloadLinksDiv.classList.add('hidden');
    loadingDiv.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.innerText = '0%';

    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            result += decoder.decode(value);
            const messages = result.split('\n');
            for (let message of messages) {
                if (message.trim() === '') continue;
                try {
                    const progressData = JSON.parse(message);
                    if (progressData.progress) {
                        progressBar.style.width = `${progressData.progress}%`;
                        progressText.innerText = `${progressData.progress}%`;
                    }
                    if (progressData.success !== undefined) {
                        if (progressData.success) {
                            setTimeout(() => {
                                loadingDiv.style.display = 'none';
                                downloadLinksDiv.classList.remove('hidden');
                                downloadMp3Link.href = progressData.downloadMp3Url;
                                downloadMp3Link.classList.remove('hidden');
                                downloadMp4Link.href = progressData.downloadMp4Url;
                                downloadMp4Link.classList.remove('hidden');
                                messageDiv.innerHTML = 'Conversion successful!';
                                
                                // Start the timer
                                startTimer();
                            }, 500);
                        } else {
                            loadingDiv.style.display = 'none';
                            messageDiv.innerHTML = `Error: ${progressData.message}`;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing progress data:', e);
                }
            }
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        messageDiv.innerHTML = `Error: ${error.message}`;
    }
});

function startTimer() {
    const timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    document.getElementById('download-links').appendChild(timerDiv);
    
    let timeLeft = 60;
    timerDiv.innerHTML = `Files will be deleted in ${timeLeft} seconds`;

    const timerInterval = setInterval(() => {
        timeLeft--;
        timerDiv.innerHTML = `Files will be deleted in ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDiv.innerHTML = 'Files have been deleted.';
        }
    }, 1000);
}
