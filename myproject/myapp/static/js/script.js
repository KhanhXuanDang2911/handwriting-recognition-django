document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const avatar = document.getElementById('avatar');
    const dropdown = document.getElementById('dropdown');
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImage = document.getElementById('removeImage');
    const renderBtn = document.getElementById('renderBtn');
    const audioBtn = document.getElementById('audioBtn');
    const resultContent = document.getElementById('resultContent');
    const logoutBtn = document.getElementById('logout');

    // Toggle dropdown menu
    avatar.addEventListener('click', function() {
        dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Handle image upload via click
    uploadArea.addEventListener('click', function() {
        imageUpload.click();
    });

    // Handle image upload via drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = 'var(--dark-gray)';
        uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--dark-gray)';
        uploadArea.style.backgroundColor = 'transparent';

        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    // Handle file input change
    imageUpload.addEventListener('change', function() {
        if (this.files.length) {
            handleImageFile(this.files[0]);
        }
    });

    // Handle image file
    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            renderBtn.disabled = false;
        };

        reader.readAsDataURL(file);
    }

    // Remove image
    removeImage.addEventListener('click', function() {
        previewImg.src = '';
        imagePreview.style.display = 'none';
        uploadArea.style.display = 'block';
        renderBtn.disabled = true;
        resetResult();
    });

    // Reset result
    function resetResult() {
        resultContent.innerHTML = '<p class="placeholder-text">Recognition results will appear here after processing.</p>';
        audioBtn.disabled = true;
    }

    // Recognize text (simulated)
    renderBtn.addEventListener('click', async function () {
        // Show loading state
        resultContent.innerHTML = '<p class="placeholder-text">Processing image...</p>';

        // Simulate API call delay
        // Sample recognized text (in a real app, this would come from an API)
        const recognizedText = await simulateTextRecognition();

        // Display result
        resultContent.innerHTML = `<p class="recognized-text">${recognizedText}</p>`;

        // Enable audio button
        audioBtn.disabled = false;
    });

    // Simulate text recognition (in a real app, this would be an API call)
    async function simulateTextRecognition() {
    const fileInput = document.getElementById('imageUpload');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('http://192.168.56.233:8000/predict', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result.prediction;
    } catch (error) {
        console.error('Error during the fetch:', error);
        return 'Error occurred during prediction.';
    }
}


    audioBtn.addEventListener('click', function () {
    const text = resultContent.textContent;

    // Nếu đang nói, thì hủy trước
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return; // Nếu đang nói thì hủy và không phát lại
    }

    if (text && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
    });


    // Logout functionality (simulated)
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Logout successful');
        // In a real app, this would redirect to login page or perform actual logout
    });
});