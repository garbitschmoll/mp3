document.getElementById('convert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const messageDiv = document.getElementById('message');
    const downloadLinksDiv = document.getElementById('download-links');
    const downloadMp3Link = document.getElementById('download-mp3');
    const downloadMp4Link = document.getElementById('download-mp4');
    const loadingDiv = document.getElementById('loading');
    const progressBar = document.getElementById('progress-bar');
    
    messageDiv.innerHTML = '';
    downloadLinksDiv.classList.add('hidden');
    loadingDiv.style.display = 'block';
    progressBar.style.width = '0%';

    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const result = await response.json();
        
        if (result.success) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                loadingDiv.style.display = 'none';
                downloadLinksDiv.classList.remove('hidden');
                downloadMp3Link.href = result.downloadMp3Url;
                downloadMp3Link.classList.remove('hidden');
                downloadMp4Link.href = result.downloadMp4Url;
                downloadMp4Link.classList.remove('hidden');
                messageDiv.innerHTML = 'Conversion successful!';
            }, 500);
        } else {
            loadingDiv.style.display = 'none';
            messageDiv.innerHTML = `Error: ${result.message}`;
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        messageDiv.innerHTML = `Error: ${error.message}`;
    }
});
