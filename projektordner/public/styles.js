document.getElementById('convertForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const youtubeUrl = document.getElementById('youtubeUrl').value;
    
    try {
        const response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: youtubeUrl })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('mp3Link').href = data.downloadUrl;
            document.getElementById('downloadLink').style.display = 'block';
        } else {
            alert('Fehler beim Konvertieren des Videos.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
});
