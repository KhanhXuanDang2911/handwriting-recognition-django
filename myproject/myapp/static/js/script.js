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
    renderBtn.addEventListener('click', function() {
        // Show loading state
        resultContent.innerHTML = '<p class="placeholder-text">Processing image...</p>';

        // Simulate API call delay
        setTimeout(function() {
            // Sample recognized text (in a real app, this would come from an API)
            const recognizedText = simulateTextRecognition();

            // Display result
            resultContent.innerHTML = `<p class="recognized-text">${recognizedText}</p>`;

            // Enable audio button
            audioBtn.disabled = false;
        }, 2000);
    });

    // Simulate text recognition (in a real app, this would be an API call)
    function simulateTextRecognition() {
        const sampleTexts ="Trong thế giới ngày nay, công nghệ đang phát triển với một tốc độ chóng mặt, thay đổi cách chúng ta sống, làm việc và giao tiếp. Chúng ta không còn xa lạ với những công nghệ tiên tiến như trí tuệ nhân tạo (AI), Internet of Things (IoT), và Blockchain, tất cả đều đang tạo ra những bước tiến đáng kể trong nhiều lĩnh vực, từ y tế, giáo dục đến kinh tế. AI, chẳng hạn, đã trở thành một phần không thể thiếu trong nhiều ứng dụng hàng ngày, từ trợ lý ảo đến các hệ thống phân tích dữ liệu phức tạp.\n" +
            "Một trong những ứng dụng thú vị của AI là trong việc nhận diện giọng nói và hình ảnh. Những hệ thống này không chỉ giúp cải thiện chất lượng cuộc sống mà còn mang lại sự tiện lợi cho người dùng. Việc sử dụng giọng nói để điều khiển thiết bị hoặc nhập liệu đang ngày càng phổ biến, giúp tiết kiệm thời gian và công sức, đồng thời tạo ra những trải nghiệm người dùng mượt mà hơn.\n" +
            "Mặc dù vậy, với những tiến bộ trong công nghệ, chúng ta cũng phải đối mặt với những thách thức lớn. Bảo mật và quyền riêng tư trở thành những vấn đề cần được quan tâm hơn bao giờ hết. Khi mà công nghệ ngày càng thâm nhập vào mọi ngóc ngách của cuộc sống, việc bảo vệ dữ liệu cá nhân và tránh các nguy cơ tiềm ẩn trở nên cấp thiết hơn bao giờ hết. Cùng với đó, việc phát triển và sử dụng công nghệ một cách có đạo đức và trách nhiệm cũng là yếu tố không thể thiếu trong tương lai";


        return sampleTexts;
    }

    audioBtn.addEventListener('click', function() {
    const text = resultContent.textContent;

    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    } else {
        if (text && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }
});


    // Logout functionality (simulated)
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Logout successful');
        // In a real app, this would redirect to login page or perform actual logout
    });
});