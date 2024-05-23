document.getElementById('convert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const messageDiv = document.getElementById('message');
    const downloadLink = document.getElementById('download-link');
    const downloadUrl = document.getElementById('download-url');
    const loadingDiv = document.getElementById('loading');
    const progressBar = document.getElementById('progress-bar');
    
    messageDiv.innerHTML = '';
    downloadLink.classList.add('hidden');
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
                downloadLink.classList.remove('hidden');
                downloadUrl.href = result.downloadUrl;
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
