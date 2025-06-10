document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const avatar = document.getElementById("avatar")
  const dropdown = document.getElementById("dropdown")
  const uploadArea = document.getElementById("uploadArea")
  const imageUpload = document.getElementById("imageUpload")
  const imagePreview = document.getElementById("imagePreview")
  const previewImg = document.getElementById("previewImg")
  const removeImage = document.getElementById("removeImage")
  const renderBtn = document.getElementById("renderBtn")
  const geminiBtn = document.getElementById("geminiBtn")
  const audioBtn = document.getElementById("audioBtn")
  const resultContent = document.getElementById("resultContent")
  const logoutBtn = document.getElementById("logout")
  const API_GEMINI_KEY = "AIzaSyCsnBXKdeauNWlz_KYhjjUn3f8o7ClOpT4"
  const hiddenGeminiBtn = document.getElementById("hiddenGeminiBtn")
  const cameraModal = document.getElementById('cameraModal');
  const cameraFeed = document.getElementById('cameraFeed');
  const captureBtn = document.getElementById('captureBtn');
  const closeCameraModal = document.getElementById('closeCameraModal');
  const imageEditorModal = document.getElementById('imageEditorModal');
  const editorImg = document.getElementById('editorImg');
  const closeEditorModal = document.getElementById('closeEditorModal');
  const cropBtn = document.getElementById('cropBtn');
  const resetBtn = document.getElementById('resetBtn');
  const applyBtn = document.getElementById('applyBtn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  // NEW: Ensure image editor modal is hidden by default on load
  imageEditorModal.style.display = 'none';

  // NEW: Create Rotate buttons dynamically - REMOVED since now in HTML
  // const rotateLeftBtn = document.createElement("button");
  // rotateLeftBtn.id = "rotateLeftBtn";
  // rotateLeftBtn.className = "translation-btn";
  // rotateLeftBtn.innerHTML = '<i class="fas fa-undo"></i> Xoay trái 90 độ';

  // const rotateRightBtn = document.createElement("button");
  // rotateRightBtn.id = "rotateRightBtn";
  // rotateRightBtn.className = "translation-btn";
  // rotateRightBtn.innerHTML = '<i class="fas fa-redo"></i> Xoay phải 90 độ';

  // Find the parent of cropBtn and insert rotate buttons - REMOVED
  // if (cropBtn && cropBtn.parentNode) {
  //   const editorButtonContainer = cropBtn.parentNode;
  //   editorButtonContainer.insertBefore(rotateLeftBtn, cropBtn.nextSibling);
  //   editorButtonContainer.insertBefore(rotateRightBtn, rotateLeftBtn.nextSibling);
  // }

  // NEW: Add styles for image editor modal to handle overflow and image scaling
  const imageEditorModalStyle = document.createElement("style");
  imageEditorModalStyle.textContent = `
    #imageEditorModal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7); /* Dark overlay */
      display: flex; /* Use flexbox for centering */
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 10px; /* Padding around the content */
      box-sizing: border-box; /* Include padding in dimensions */
      overflow-y: auto; /* Allow the modal itself to scroll if it's too tall */
    }

    #imageEditorModal .modal-content.large {
      display: flex;
      flex-direction: column;
      max-height: 95vh; /* Allow it to take more height on smaller screens if needed */
      width: 90%; /* Max width for the modal */
      max-width: 600px; /* Limit overall modal width */
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      overflow: hidden; /* Hide overflow of the content itself, modal-body handles scroll */
    }

    #imageEditorModal .modal-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        flex-shrink: 0; /* Don't shrink */
    }

    #imageEditorModal .modal-body {
        flex-grow: 1; /* Allow modal-body to take available space */
        overflow-y: auto; /* Enable scrolling for the content within modal-body */
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #imageEditorModal .editor-container {
        flex-grow: 1; /* Editor container should take available space in modal-body */
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 100%;
        overflow-y: auto; /* This is where the image and cropper will scroll */
    }

    #imageEditorModal .image-container {
        flex-shrink: 0; /* Don't shrink the image container */
        max-width: 100%;
        max-height: 100%; /* Important: Constrain image container height relative to editor-container */
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px; /* Space between image and controls */
        overflow: hidden; /* Hide potential overflow from the image itself */
    }

    #editorImg {
      display: block; /* Required by Cropper.js */
      max-width: 100%; /* Ensure image fits container */
      height: auto; /* Maintain aspect ratio */
    }

    /* Ensure Cropper's canvas and view box respect the container */
    .cropper-canvas, .cropper-view-box {
      max-width: 100%;
      max-height: 100%;
    }

    /* Add styles for controls container */
    .editor-controls {
      width: 100%;
      padding: 10px;
      background: #fff;
      border-top: 1px solid #eee;
      position: sticky;
      bottom: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0; /* Don't shrink */
    }

    .editor-controls-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .editor-controls-row button {
      flex: 1;
      min-width: 120px;
      max-width: 200px;
      padding: 8px 15px;
      border: none;
      border-radius: 4px;
      background: #4CAF50;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: background-color 0.2s;
    }

    .editor-controls-row button:hover {
      background: #45a049;
    }

    .editor-controls-row button i {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      #imageEditorModal .modal-content.large {
        width: 95%;
      }

      .editor-controls-row button {
        min-width: 100px;
        padding: 6px 12px;
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(imageEditorModalStyle);

  // Global variables
  let stream = null;
  let cropper = null;
  let originalImage = null;
  let currentRotationAngle = 0; // NEW: Global variable to track total rotation
  let currentMode = 'upload';
  let isGeminiMode = false;

  // Fetch user profile to get avatar when page loads
  if (window.Auth) {
    window.Auth.fetchUserProfile()
  }

  // Toggle dropdown menu
  if (avatar) {
    avatar.addEventListener("click", () => {
      dropdown.classList.toggle("active")
    })
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (avatar && dropdown && !avatar.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.remove("active")
    }
  })

  // Image mode selection
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      
      if (currentMode === 'camera') {
        openCamera();
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.style.display = 'none';
      }
    });
  });

  // Camera functionality
  async function openCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      cameraFeed.srcObject = stream;
      cameraModal.style.display = 'block';
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  }

  closeCameraModal.addEventListener('click', () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cameraModal.style.display = 'none';
  });

  captureBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraFeed, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      handleImageUpload(file);
    }, 'image/jpeg');
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cameraModal.style.display = 'none';
  });

  // Handle image upload
  function handleImageUpload(file) {
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      openImageEditor(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  // Handle image upload via click
  if (uploadArea) {
    uploadArea.addEventListener("click", () => {
      imageUpload.click()
    })

    // Handle image upload via drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragover')
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove('dragover')
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragover')

      if (e.dataTransfer.files.length) {
        handleImageUpload(e.dataTransfer.files[0])
      }
    })
  }

  // Handle file input change
  if (imageUpload) {
    imageUpload.addEventListener("change", function () {
      if (this.files.length) {
        handleImageUpload(this.files[0])
      }
    })
  }

  // Image Editor functions
  function openImageEditor(imageSrc) {
    originalImage = imageSrc; // Store the original image
    currentRotationAngle = 0; // Reset rotation when a new image is opened
    
    editorImg.src = imageSrc; // Set initial image for display
    imageEditorModal.style.display = 'block';
    
    // Initial render of the image (without rotation) and cropper setup
    renderRotatedImage(); 
  }

  // NEW: Helper function to render the image with current total rotation
  async function renderRotatedImage() {
    if (!originalImage) return;

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    const img = new Image();
    img.src = originalImage;
    
    await new Promise(resolve => {
      img.onload = () => {
        resolve();
      };
      img.onerror = (e) => {
        console.error("Error loading image for rotation:", e);
        resolve();
      };
    });

    if (!img.complete || img.naturalWidth === 0) {
      console.error("Failed to load image for rotation or image is empty.");
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const radians = currentRotationAngle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const rotatedWidth = Math.abs(img.width * cos) + Math.abs(img.height * sin);
    const rotatedHeight = Math.abs(img.width * sin) + Math.abs(img.height * cos);

    tempCanvas.width = rotatedWidth;
    tempCanvas.height = rotatedHeight;

    ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    editorImg.src = tempCanvas.toDataURL('image/png');

    // Re-initialize cropper with the newly drawn, physically rotated image
    cropper = new Cropper(editorImg, {
      aspectRatio: NaN,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8, // Reduce crop box size to 80% of the image
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      minContainerWidth: 200,
      minContainerHeight: 200,
      responsive: true,
      checkCrossOrigin: false,
    });
  }

  // Image Editor event listeners
  closeEditorModal.addEventListener('click', () => {
    imageEditorModal.style.display = 'none';
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    // Clear the file input value when closing the editor without applying
    if (imageUpload) {
      imageUpload.value = "";
    }
    // Also reset rotation angle and original image
    currentRotationAngle = 0;
    originalImage = null; // Clear original image data
  });

  // Get editor buttons for event listeners (they are now static in HTML)
  const cropBtnEditor = document.querySelector('#imageEditorModal #cropBtn');
  const rotateLeftBtnEditor = document.querySelector('#imageEditorModal #rotateLeftBtn');
  const rotateRightBtnEditor = document.querySelector('#imageEditorModal #rotateRightBtn');
  const resetBtnEditor = document.querySelector('#imageEditorModal #resetBtn');
  const applyBtnEditor = document.querySelector('#imageEditorModal #applyBtn');

  // Add event listeners for the editor buttons
  if (cropBtnEditor) {
    cropBtnEditor.addEventListener('click', () => {
      if (cropper) {
        cropper.setDragMode('crop');
      }
    });
  }

  if (rotateLeftBtnEditor) {
    rotateLeftBtnEditor.addEventListener('click', () => {
      if (cropper) {
        currentRotationAngle -= 90;
        renderRotatedImage();
      }
    });
  }

  if (rotateRightBtnEditor) {
    rotateRightBtnEditor.addEventListener('click', () => {
      if (cropper) {
        currentRotationAngle += 90;
        renderRotatedImage();
      }
    });
  }

  if (resetBtnEditor) {
    resetBtnEditor.addEventListener('click', () => {
      if (originalImage) {
        currentRotationAngle = 0; // Reset rotation angle
        renderRotatedImage(); // Re-render with original image and 0 rotation
      }
    });
  }

  if (applyBtnEditor) {
    applyBtnEditor.addEventListener('click', async () => {
      let finalImage = editorImg.src;
      
      if (cropper) {
        const canvas = cropper.getCroppedCanvas({
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          maxWidth: 4096, 
          maxHeight: 4096,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });

        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { alpha: false });
        
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0);
        
        finalImage = tempCanvas.toDataURL('image/png', 1.0);
        
        cropper.destroy();
        cropper = null;
      }
      
      // Update preview image
      previewImg.src = finalImage;
      uploadArea.style.display = "none";
      imagePreview.style.display = "block";
      renderBtn.disabled = false;
      
      // Convert data URL to File object
      fetch(finalImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'edited-image.png', { type: 'image/png' });
          // Store the file for form submission
          window.currentImageFile = file;
        });
      
      imageEditorModal.style.display = 'none';
      
      // Reset rotation angle and original image after applying
      currentRotationAngle = 0;
      originalImage = null;
    });
  }

  // Remove image
  if (removeImage) {
    removeImage.addEventListener("click", () => {
      // Reset image preview
      previewImg.src = ""
      imagePreview.style.display = "none"
      uploadArea.style.display = "block"
      renderBtn.disabled = true
      
      // Reset file input
      if (imageUpload) {
        imageUpload.value = ""
      }
      
      // Reset result
      resetResult()
    })
  }

  // Add download button
  const downloadBtn = document.createElement("button")
  downloadBtn.className = "download-btn"
  downloadBtn.innerHTML = '<i class="fas fa-download"></i>'
  downloadBtn.disabled = true
  downloadBtn.style.marginLeft = "10px"
  downloadBtn.style.display = "inline-block"; // Ensure the button is visible

  // Add event listener for the download button
  downloadBtn.addEventListener("click", () => {
    // Pass the current recognized text to the translation modal
    showTranslationModal(resultContent.textContent);
  });

  // Insert downloadBtn into the DOM (e.g., in the result-header)
  const resultHeader = document.querySelector(".result-header");
  const audioBtnElement = document.getElementById("audioBtn"); // Get the actual audio button element
  if (resultHeader && audioBtnElement) {
    resultHeader.insertBefore(downloadBtn, audioBtnElement.nextSibling); // Insert downloadBtn after audioBtn
  } else if (resultHeader) {
    resultHeader.appendChild(downloadBtn); // Fallback: just append if audioBtn not found or not in resultHeader
  }

  // Add edit button to image preview
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa ảnh';
  editBtn.style.width = "100%";
  editBtn.style.marginTop = "10px";
  editBtn.style.backgroundColor = "#4CAF50";
  editBtn.style.color = "white";
  editBtn.style.border = "none";
  editBtn.style.padding = "10px";
  editBtn.style.borderRadius = "5px";
  editBtn.style.cursor = "pointer";
  editBtn.style.display = "none";
  editBtn.onclick = () => {
    openImageEditor(previewImg.src);
  };

  // Add edit button after render button
  if (renderBtn && renderBtn.parentNode) {
    renderBtn.parentNode.insertBefore(editBtn, renderBtn.nextSibling);
  }

  // Show edit button when image is uploaded
  if (imageUpload) {
    imageUpload.addEventListener("change", function () {
      if (this.files.length) {
        editBtn.style.display = "block";
      }
    });
  }

  // Show edit button when image is dropped
  if (uploadArea) {
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        editBtn.style.display = "block";
      }
    });
  }

  // Hide edit button when image is removed
  if (removeImage) {
    removeImage.addEventListener("click", () => {
      editBtn.style.display = "none";
      // ... existing code ...
    });
  }

  // Form submission
  renderBtn.addEventListener('click', async () => {
    try {
      if (!window.currentImageFile) {
        alert('Vui lòng chọn ảnh trước');
        return;
      }

      // Show loading state
      renderBtn.disabled = true;
      renderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

      if (isGeminiMode) {
        console.log("Using Gemini Vision mode - sending image directly to Gemini")
        // Direct Gemini Vision mode
        const base64Image = previewImg.src.split(',')[1]
        console.log("Image converted to base64, length:", base64Image.length)
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + API_GEMINI_KEY, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Extract and return only the text content from this image. Do not add any explanations or additional text."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        })

        console.log("Gemini API response status:", response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Gemini API error:", errorText)
          throw new Error(`Lỗi khi xử lý ảnh: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("Gemini API response data:", data)
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const recognizedText = data.candidates[0].content.parts[0].text
          console.log("Recognized text from Recognition API:", recognizedText)
          resultContent.innerHTML = `<p>${recognizedText}</p>`
          audioBtn.disabled = false
          downloadBtn.disabled = false
          
          // Save to history
          await saveRecognitionToHistory(previewImg.src, recognizedText)
        } else {
          console.error("Invalid Gemini API response:", data)
          throw new Error('Không nhận được kết quả nhận dạng')
        }
      } else {
        console.log("Using external API mode")
        // Normal mode - use external API then Gemini for spell check
        const recognizedText = await simulateTextRecognition()
        console.log("External API recognition result:", recognizedText)

        if (!recognizedText || recognizedText.length === 0) {
          throw new Error("Không thể nhận diện văn bản từ hình ảnh")
        }

        console.log("Sending text to Gemini for spell check")
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
          API_GEMINI_KEY,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Tôi vừa OCR được đoạn văn sau:\n"${recognizedText}"\n, Xử lý ngôn ngữ tự nhiên, hãy sửa lại và trả về kết quả cho đúng chính tả, giữ nguyên thứ tự xuống dòng và cấu trúc đoạn văn, ngữ pháp và giữ nguyên ý nghĩa. 
                                Lưu ý rằng, chỉ trả về kết quả là đoạn văn bản đã được xử lý, không cần gì thêm, vì kết quả đó là kết quả cuối cùng cho người dùng của tôi xem.`,
                    },
                  ],
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`Lỗi khi xử lý văn bản: ${response.status}`)
        }

        const data = await response.json()
        console.log("Gemini spell check response:", data)
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const fixedText = data.candidates[0].content.parts[0].text
          resultContent.innerHTML = `<p>${fixedText}</p>`
          audioBtn.disabled = false
          downloadBtn.disabled = false

          // Save to history
          await saveRecognitionToHistory(previewImg.src, fixedText)
        } else {
          throw new Error('Không nhận được kết quả xử lý')
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý nhận diện:", error)
      resultContent.innerHTML = `<p class="error">Lỗi: ${error.message}</p>`
      // Ensure buttons stay disabled on error
      audioBtn.disabled = true
      downloadBtn.disabled = true
    } finally {
      // Reset button state
      renderBtn.disabled = false;
      renderBtn.innerHTML = 'Nhận dạng văn bản';
    }
  });

  // Gemini mode toggle
  hiddenGeminiBtn.addEventListener('click', function() {
    isGeminiMode = !isGeminiMode;
    this.style.backgroundColor = isGeminiMode ? "#4CAF50" : "#f44336";
    this.style.cursor = isGeminiMode ? "default" : "pointer";
  });

  // Text-to-speech functionality
  if (audioBtn) {
    // Xóa nội dung hiện tại của nút
    audioBtn.innerHTML = ""

    // Thêm biểu tượng loa
    const speakerIcon = document.createElement("i")
    speakerIcon.className = "fas fa-volume-up"
    audioBtn.appendChild(speakerIcon)

    // Tạo dropdown cho tùy chọn ngôn ngữ
    const audioDropdown = document.createElement("div")
    audioDropdown.className = "audio-dropdown"
    audioDropdown.innerHTML = `
    <div class="audio-dropdown-content">
      <button class="audio-option" data-lang="vi">
        <i class="fas fa-play"></i> Vietnamese
      </button>
      <button class="audio-option" data-lang="en">
        <i class="fas fa-play"></i> English
      </button>
    </div>
  `

    // Thêm style cho dropdown
    const style = document.createElement("style")
    style.textContent = `
    .result-header {
      position: relative;
    }
    .audio-btn {
      position: relative;
    }
    .audio-dropdown {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 100;
      margin-top: 0.5rem;
      min-width: 150px;
      overflow: hidden;
    }
    .audio-dropdown.active {
      display: block;
    }
    .audio-dropdown-content {
      padding: 0.5rem;
    }
    .audio-option {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0.5rem 1rem;
      border: none;
      background-color: transparent;
      color: var(--text-dark);
      cursor: pointer;
      text-align: left;
      transition: background-color 0.2s;
      border-radius: 0.25rem;
    }
    .audio-option:hover {
      background-color: #f3f4f6;
    }
    .audio-option i {
      margin-right: 0.5rem;
      font-size: 0.875rem;
    }
    
    /* Translation Modal Styles */
    .translation-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .translation-modal-content {
      background-color: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .translation-modal h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      text-align: center;
    }
    .translation-modal h4 {
      margin: 1rem 0 0.5rem 0;
      font-size: 1rem;
      color: var(--text-dark);
    }
    .language-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.25rem;
      margin-bottom: 1rem;
      background-color: white;
    }
    .translation-btn-group {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }
    .translation-btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.25rem;
      background-color: var(--primary-color);
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .translation-btn:hover {
      background-color: #322abd;
    }
    .translation-btn.cancel {
      background-color: #9ca3af;
    }
    .translation-btn.cancel:hover {
      background-color: #6b7280;
    }
    .translation-btn i, .translation-btn .icon {
      margin-right: 0.5rem;
    }
    .translation-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    .translation-result {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.25rem;
      background-color: #f9fafb;
      max-height: 200px;
      overflow-y: auto;
    }
    .translation-error {
      color: #ef4444;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Audio options styles */
    .audio-options-container {
      margin-top: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 1rem;
      background-color: #f9fafb;
    }
    .audio-options-title {
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
    }
    .audio-options-title i {
      margin-right: 0.5rem;
    }
    .audio-options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    .audio-option-btn {
      padding: 0.5rem;
      border: none;
      border-radius: 0.25rem;
      background-color: var(--primary-color);
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .audio-option-btn:hover {
      background-color: #322abd;
    }
    .audio-option-btn i {
      margin-right: 0.5rem;
    }
    .audio-note {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-light);
    }
  `
    document.head.appendChild(style)

    // Thêm dropdown vào DOM
    document.querySelector(".result-header").appendChild(audioDropdown)

    // Toggle dropdown khi click vào nút
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      audioDropdown.classList.toggle("active")
    })

    // Đóng dropdown khi click bên ngoài
    document.addEventListener("click", (e) => {
      if (!audioBtn.contains(e.target) && !audioDropdown.contains(e.target)) {
        audioDropdown.classList.remove("active")
      }
    })

    // Xử lý sự kiện khi chọn ngôn ngữ
    const audioOptions = audioDropdown.querySelectorAll(".audio-option")
    audioOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const lang = option.getAttribute("data-lang")
        speakText(resultContent.textContent, lang)
        audioDropdown.classList.remove("active")
      })
    })
  }

  // Danh sách 15 ngôn ngữ phổ biến nhất trên thế giới
  const popularLanguages = [
    { code: "en", name: "English (Tiếng Anh)" },
    { code: "zh", name: "Chinese (Tiếng Trung)" },
    { code: "hi", name: "Hindi (Tiếng Hindi)" },
    { code: "es", name: "Spanish (Tiếng Tây Ban Nha)" },
    { code: "fr", name: "French (Tiếng Pháp)" },
    { code: "ar", name: "Arabic (Tiếng Ả Rập)" },
    { code: "bn", name: "Bengali (Tiếng Bengali)" },
    { code: "ru", name: "Russian (Tiếng Nga)" },
    { code: "pt", name: "Portuguese (Tiếng Bồ Đào Nha)" },
    { code: "id", name: "Indonesian (Tiếng Indonesia)" },
    { code: "ur", name: "Urdu (Tiếng Urdu)" },
    { code: "de", name: "German (Tiếng Đức)" },
    { code: "ja", name: "Japanese (Tiếng Nhật)" },
    { code: "sw", name: "Swahili (Tiếng Swahili)" },
    { code: "vi", name: "Vietnamese (Tiếng Việt)" }
  ]

  // Hiển thị modal dịch văn bản trước khi tải xuống
  function showTranslationModal(text) {
    // Tạo modal cho dịch văn bản
    const translationModal = document.createElement("div")
    translationModal.className = "translation-modal"

    // Tạo options cho select
    const languageOptions = popularLanguages.map(lang =>
      `<option value="${lang.code}">${lang.name}</option>`
    ).join('')

    translationModal.innerHTML = `
      <div class="translation-modal-content">
        <h3>Dịch văn bản trước khi tải xuống</h3>
        <div>
          <label for="language-select">Chọn ngôn ngữ:</label>
          <select id="language-select" class="language-select">
            ${languageOptions}
          </select>
        </div>
        
        <div class="translation-btn-group">
          <button id="translateBtn" class="translation-btn">
            <i class="fas fa-language"></i> Dịch văn bản
          </button>
          
          <div>
            <button id="downloadOriginalBtn" class="translation-btn">
              <i class="fas fa-download"></i> Tải văn bản gốc
            </button>
          </div>
        </div>
        
        <div id="translationResult" style="display: none;" class="translation-result">
          <h4>Văn bản đã dịch:</h4>
          <p id="translatedText"></p>
        </div>
        
        <div id="translationError" class="translation-error" style="display: none;"></div>
        
        <!-- Tùy chọn tải xuống âm thanh cho văn bản gốc -->
        <div class="audio-options-container">
          <div class="audio-options-title">
            <i class="fas fa-volume-up"></i> Tải xuống âm thanh (văn bản gốc)
          </div>
          <div class="audio-options-grid">
            <button id="downloadAudioVi" class="audio-option-btn">
              <i class="fas fa-download"></i> Tiếng Việt
            </button>
            <button id="downloadAudioEn" class="audio-option-btn">
              <i class="fas fa-download"></i> Tiếng Anh
            </button>
          </div>
          <div class="audio-note">
            <p><i class="fas fa-info-circle"></i> Đối với văn bản dài, chúng tôi sẽ tạo một tệp âm thanh duy nhất.</p>
          </div>
        </div>
        
        <!-- Tùy chọn tải xuống âm thanh cho văn bản đã dịch (hiển thị sau khi dịch) -->
        <div id="translatedAudioOptions" class="audio-options-container" style="display: none; margin-top: 1rem;">
          <div class="audio-options-title">
            <i class="fas fa-volume-up"></i> Tải xuống âm thanh (văn bản đã dịch)
          </div>
          <div class="audio-options-grid">
            <button id="downloadTranslatedAudio" class="audio-option-btn">
              <i class="fas fa-download"></i> <span id="translatedAudioLang">Tải xuống</span>
            </button>
            <button id="listenTranslatedBtn" class="audio-option-btn">
              <i class="fas fa-play"></i> Nghe thử
            </button>
          </div>
        </div>
        
        <div class="translation-btn-group" style="margin-top: 1.5rem;">
          <button id="downloadTranslatedBtn" class="translation-btn" style="display: none;">
            <i class="fas fa-download"></i> Tải văn bản đã dịch
          </button>
          
          <button id="cancelTranslationBtn" class="translation-btn cancel">
            <i class="fas fa-times"></i> Đóng
          </button>
        </div>
      </div>
    `
    document.body.appendChild(translationModal)

    // Lấy các phần tử DOM trong modal
    const languageSelect = document.getElementById("language-select")
    const translateBtn = document.getElementById("translateBtn")
    const downloadOriginalBtn = document.getElementById("downloadOriginalBtn")
    const downloadTranslatedBtn = document.getElementById("downloadTranslatedBtn")
    const listenTranslatedBtn = document.getElementById("listenTranslatedBtn")
    const cancelTranslationBtn = document.getElementById("cancelTranslationBtn")
    const translationResult = document.getElementById("translationResult")
    const translatedText = document.getElementById("translatedText")
    const translationError = document.getElementById("translationError")
    const translatedAudioOptions = document.getElementById("translatedAudioOptions")
    const translatedAudioLang = document.getElementById("translatedAudioLang")
    const downloadTranslatedAudio = document.getElementById("downloadTranslatedAudio")

    // Xử lý sự kiện tải xuống âm thanh văn bản gốc
    document.getElementById("downloadAudioVi").addEventListener("click", () => {
      downloadServerAudio(text, "van-ban-goc-vi.mp3", "vi")
    })

    document.getElementById("downloadAudioEn").addEventListener("click", () => {
      downloadServerAudio(text, "van-ban-goc-en.mp3", "en")
    })

    // Xử lý sự kiện dịch văn bản
    translateBtn.addEventListener("click", async () => {
      const selectedLanguage = languageSelect.value

      // Reset UI
      translationResult.style.display = "none"
      translationError.style.display = "none"
      downloadTranslatedBtn.style.display = "none"
      translatedAudioOptions.style.display = "none"

      // Hiển thị trạng thái đang dịch
      translateBtn.disabled = true
      translateBtn.innerHTML = '<div class="spinner"></div> Đang dịch...'

      try {
        // Gọi API dịch văn bản
        const translatedContent = await translateText(text, selectedLanguage)

        // Hiển thị kết quả dịch
        translatedText.textContent = translatedContent
        translationResult.style.display = "block"
        downloadTranslatedBtn.style.display = "inline-flex"

        // Hiển thị tùy chọn tải xuống âm thanh cho văn bản đã dịch
        translatedAudioOptions.style.display = "block"

        // Cập nhật tên ngôn ngữ cho nút tải xuống âm thanh đã dịch
        const selectedLangName = popularLanguages.find(lang => lang.code === selectedLanguage)?.name || selectedLanguage
        translatedAudioLang.textContent = selectedLangName.split(" ")[0] // Lấy tên tiếng Anh

        // Cập nhật sự kiện cho nút tải xuống âm thanh đã dịch
        downloadTranslatedAudio.onclick = () => {
          downloadServerAudio(translatedContent, `van-ban-dich-${selectedLanguage}.mp3`, selectedLanguage)
        }

        // Cập nhật sự kiện cho nút nghe thử
        listenTranslatedBtn.onclick = () => {
          speakText(translatedContent, selectedLanguage)
        }
      } catch (error) {
        console.error("Lỗi khi dịch văn bản:", error)
        translationError.textContent = `Lỗi khi dịch văn bản: ${error.message}`
        translationError.style.display = "block"
      } finally {
        // Khôi phục trạng thái nút dịch
        translateBtn.disabled = false
        translateBtn.innerHTML = '<i class="fas fa-language"></i> Dịch văn bản'
      }
    })

    // Xử lý sự kiện tải xuống văn bản gốc
    downloadOriginalBtn.addEventListener("click", () => {
      downloadTextFile(text, "van-ban-goc.txt")
    })

    // Xử lý sự kiện tải xuống văn bản đã dịch
    downloadTranslatedBtn.addEventListener("click", () => {
      const selectedLanguage = languageSelect.value
      downloadTextFile(translatedText.textContent, `van-ban-dich-${selectedLanguage}.txt`)
    })

    // Xử lý sự kiện đóng modal
    cancelTranslationBtn.addEventListener("click", () => {
      closeTranslationModal()
    })

    // Đóng modal khi click bên ngoài
    translationModal.addEventListener("click", (e) => {
      if (e.target === translationModal) {
        closeTranslationModal()
      }
    })

    // Hàm đóng modal
    function closeTranslationModal() {
      document.body.removeChild(translationModal)
    }
  }

  // Hàm dịch văn bản
  async function translateText(text, targetLanguage) {
    try {
      console.log(`Đang dịch văn bản sang ${targetLanguage}...`)

      // Sử dụng API Gemini tương tự như OCR để dịch văn bản
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
          API_GEMINI_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate the following text to ${targetLanguage}. Only return the translated text, keep paragraph formatting, nothing else:
                    
                    "${text}"`,
                  },
                ],
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API responded with status: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log("Translation API response:", data)

      // Kiểm tra cấu trúc phản hồi API
      if (
        data &&
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const translatedText = data.candidates[0].content.parts[0].text
        return translatedText
      } else {
        throw new Error("Không tìm thấy văn bản đã dịch trong kết quả API")
      }
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error)
      throw new Error(`Không thể dịch văn bản: ${error.message}`)
    }
  }

  // Hàm tải xuống văn bản dưới dạng file
  function downloadTextFile(text, filename) {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Tải xuống file âm thanh từ server
  async function downloadServerAudio(text, filename, language = "vi") {
    let loadingOverlay
    let progressStyle

    try {
      // Scroll to the top of the page to ensure the overlay is visible
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Hiển thị overlay loading với progress bar
      loadingOverlay = document.createElement("div")
      loadingOverlay.className = "loading-overlay"
      loadingOverlay.innerHTML = `
        <div class="loading-content">
          <h3>Audio File Download</h3>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p class="progress-text">Preparing download...</p>
          </div>
          <p class="loading-text">Please wait while we process your request...</p>
        </div>
      `
      document.body.appendChild(loadingOverlay)

      // Add styles for progress bar and ensure overlay is visible
      progressStyle = document.createElement("style")
      progressStyle.textContent = `
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .loading-content {
          background-color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
          text-align: center;
          position: relative;
          top: -10%; /* Move it slightly up from center */
          max-height: 80vh;
          overflow-y: auto;
        }
        .progress-container {
          margin: 1rem 0;
          width: 100%;
        }
        .progress-bar {
          width: 100%;
          height: 15px;
          background-color: #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
          border: 1px solid #d1d5db;
        }
        .progress-fill {
          height: 100%;
          background-color: var(--primary-color);
          width: 0%;
          transition: width 0.2s ease;
          position: relative;
        }
        .progress-fill.indeterminate {
          width: 100%;
          background-image: linear-gradient(
            45deg, 
            rgba(255,255,255,.15) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(255,255,255,.15) 50%, 
            rgba(255,255,255,.15) 75%, 
            transparent 75%, 
            transparent
          );
          background-size: 40px 40px;
          animation: progress-indeterminate 1.5s infinite linear;
        }
        @keyframes progress-indeterminate {
          0% { background-position: -40px 0; }
          100% { background-position: 40px 0; }
        }
        .progress-text {
          text-align: center;
          font-size: 0.875rem;
          margin: 0;
          color: var(--text-dark);
          font-weight: 500;
        }
        .loading-text {
          margin-top: 0.5rem;
          color: var(--text-dark);
        }
      `
      document.head.appendChild(progressStyle)

      // Get UI elements
      const progressFill = loadingOverlay.querySelector(".progress-fill")
      const progressText = loadingOverlay.querySelector(".progress-text")
      const loadingText = loadingOverlay.querySelector(".loading-text")

      // Show indeterminate progress while preparing
      progressFill.classList.add("indeterminate")
      progressText.textContent = "Preparing download..."

      // Lấy auth headers từ Auth module
      const headers = window.Auth ? window.Auth.getAuthHeaders(false) : {}

      // Xóa Content-Type header để browser tự động thiết lập với boundary đúng
      delete headers["Content-Type"]

      // Tạo FormData để gửi dữ liệu
      const formData = new FormData()
      formData.append("text", text)
      formData.append("language", language)

      console.log("Đang gửi yêu cầu tạo file âm thanh...")
      loadingText.textContent = "Generating audio file..."

      // First phase - generating the audio file
      let response
      try {
        response = await fetch("/api/text-to-speech/", {
          method: "POST",
          headers: headers,
          body: formData,
        })
      } catch (error) {
        console.error("Network error:", error)
        throw new Error("Network error: Could not connect to the server. Please check your internet connection.")
      }

      // Check for HTTP errors
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText)
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`

        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            if (errorText) errorMessage += ` - ${errorText}`
          }
        } catch (e) {
          console.error("Error parsing error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("audio")) {
        console.error("Invalid content type:", contentType)
        throw new Error("Server did not return an audio file. Please try again.")
      }

      // Get file size if available
      const contentLength = response.headers.get("content-length")
      const totalSize = contentLength ? Number.parseInt(contentLength, 10) : 0
      console.log(`File size: ${totalSize} bytes`)

      // Update UI for download phase
      progressFill.classList.remove("indeterminate")
      progressFill.style.width = "0%"
      loadingText.textContent = "Downloading audio file..."

      // If we can't determine the size, show indeterminate progress
      if (!totalSize) {
        progressFill.classList.add("indeterminate")
        progressText.textContent = "Downloading..."
      }

      // Second phase - downloading the file
      try {
        // Read the response as a stream
        const reader = response.body.getReader()
        let receivedSize = 0
        const chunks = []
        let lastUpdateTime = Date.now()
        let lastReceivedSize = 0

        // Process the stream
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log("Download complete")
            break
          }

          // Push the chunk to our array
          chunks.push(value)
          receivedSize += value.length

          // Update progress every 200ms to avoid too frequent updates
          const now = Date.now()
          if (now - lastUpdateTime > 200 || done) {
            // Calculate download speed
            const timeDiff = (now - lastUpdateTime) / 1000 // in seconds
            const bytesPerSecond = (receivedSize - lastReceivedSize) / timeDiff

            // Update progress if we know the total size
            if (totalSize) {
              const percentComplete = Math.round((receivedSize / totalSize) * 100)
              progressFill.style.width = `${percentComplete}%`
              progressText.textContent = `${percentComplete}% - ${formatBytes(receivedSize)} of ${formatBytes(totalSize)} (${formatBytes(bytesPerSecond)}/s)`
            } else {
              // If we don't know the size, just show how much we've downloaded
              progressText.textContent = `Downloaded ${formatBytes(receivedSize)} (${formatBytes(bytesPerSecond)}/s)`
            }

            lastUpdateTime = now
            lastReceivedSize = receivedSize
          }
        }

        // Combine all chunks into a single Uint8Array
        const allChunks = new Uint8Array(receivedSize)
        let position = 0
        for (const chunk of chunks) {
          allChunks.set(chunk, position)
          position += chunk.length
        }

        // Create a blob from the data
        const blob = new Blob([allChunks], { type: contentType })

        // Check blob size
        if (blob.size === 0) {
          throw new Error("Empty audio file. Please try again.")
        }

        console.log(`Audio file received: ${blob.size} bytes`)

        // Update UI to show download is complete
        progressFill.style.width = "100%"
        progressFill.classList.remove("indeterminate")
        progressText.textContent = "100% - Download complete!"
        loadingText.textContent = "Saving file to your device..."

        // Short delay to show the completed progress
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Create URL for blob and trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()

        // Clean up
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Show success notification
        if (window.showNotification) {
          window.showNotification("Audio file has been successfully created and downloaded!", "success")
        } else {
          alert("Audio file has been successfully created and downloaded!")
        }
      } catch (streamError) {
        console.error("Error during download:", streamError)
        throw new Error(`Download failed: ${streamError.message}`)
      }
    } catch (error) {
      console.error("Error downloading audio:", error)
      if (window.showNotification) {
        window.showNotification(`Error creating audio file: ${error.message}. Please try again later.`, "error")
      } else {
        alert(`Error creating audio file: ${error.message}. Please try again later.`)
      }
    } finally {
      // Clean up
      if (loadingOverlay && document.body.contains(loadingOverlay)) {
        document.body.removeChild(loadingOverlay)
      }
      if (progressStyle && document.head.contains(progressStyle)) {
        document.head.removeChild(progressStyle)
      }
    }
  }

  // Helper function to format bytes to human-readable format
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  // Thay đổi API_URL để sử dụng địa chỉ gốc của trang web hiện tại
  // Điều này đảm bảo rằng các yêu cầu API được gửi đến đúng server
  const API_URL = `${window.location.protocol}//${window.location.hostname}:7000/predict`;

  // Gọi API nhận diện văn bản thực tế
  async function simulateTextRecognition() {
    try {
      const formData = new FormData();
      formData.append('file', window.currentImageFile);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.texts && Array.isArray(data.texts)) {
        // Ghép các dòng text lại với nhau
        const combinedText = data.texts.join('\n');
        return combinedText;
      } else {
        throw new Error('Không nhận được kết quả nhận dạng');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Add styles for hidden Gemini button
  const style = document.createElement("style")
  style.textContent = `
    .hidden-gemini-btn {
      position: fixed;
      top: 20px;
      right: 80px;
      width: 8px;
      height: 8px;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      cursor: default;
      z-index: 1000;
      transition: all 0.3s ease;
      display: none;
    }
    .hidden-gemini-btn.active {
      background-color: #22c55e;
      display: block;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
    }
  `
  document.head.appendChild(style)

  // Show hidden button
  hiddenGeminiBtn.style.display = "block"

  // Handle keyboard shortcut
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'g') {
      isGeminiMode = !isGeminiMode
      hiddenGeminiBtn.classList.toggle('active')
      console.log("Gemini mode changed to:", isGeminiMode)
    }
  })

  // Remove click event from hidden button since it's just a status indicator
  if (hiddenGeminiBtn) {
    hiddenGeminiBtn.style.cursor = "default"
  }

  // Variable to store the last tap time for double-tap detection
  let lastTapTime = 0;

  // Handle double-tap to toggle Gemini mode for touch devices
  document.addEventListener('touchstart', (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    // Check if it's a double tap (e.g., within 300ms)
    if (tapLength < 300 && tapLength > 0) {
      event.preventDefault(); // Prevent zooming or other default touch actions
      isGeminiMode = !isGeminiMode;
      hiddenGeminiBtn.classList.toggle('active');
      console.log("Gemini mode changed to (double-tap):", isGeminiMode);
      lastTapTime = 0; // Reset last tap time after a double tap
    } else {
      lastTapTime = currentTime;
    }
  });
})

// Lưu kết quả nhận diện vào lịch sử
async function saveRecognitionToHistory(imageData, recognizedText) {
  try {
    // Kiểm tra xem có kết quả nhận diện không
    if (!recognizedText || recognizedText.includes("Recognition results will appear here")) {
      console.log("Không có kết quả nhận diện để lưu")
      return
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!window.Auth || !window.Auth.isAuthenticated()) {
      console.log("Người dùng chưa đăng nhập, không thể lưu lịch sử")
      return
    }

    // Lấy thông tin người dùng
    const userData = window.Auth.getUserData()
    if (!userData || !userData.id) {
      console.error("Không tìm thấy ID người dùng")
      return
    }

    // Chuẩn bị dữ liệu để gửi lên server
    const formData = new FormData()

    // Nếu imageData là URL data, cần chuyển đổi thành Blob
    if (imageData.startsWith("data:image")) {
      // Chuyển đổi data URL thành Blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      formData.append("image", blob, "recognized_image.png")
    } else {
      // Nếu là URL thông thường, gửi URL
      formData.append("image_url", imageData)
    }

    formData.append("result", recognizedText)
    formData.append("id_user", userData.id)

    // Lấy headers từ Auth module (không bao gồm Content-Type vì FormData sẽ tự thiết lập)
    const headers = window.Auth.getAuthHeaders()
    delete headers["Content-Type"]

    // Gọi API để tạo bản ghi lịch sử
    console.log("Đang lưu kết quả nhận diện vào lịch sử...")
    const response = await fetch("/histories/", {
      method: "POST",
      headers: headers,
      body: formData,
    })

    // Xử lý kết quả
    const result = await response.json()
    if (response.ok && result.status === "success") {
      console.log("Đã lưu kết quả nhận diện vào lịch sử:", result.data)

      // Hiển thị thông báo thành công nếu có hàm showNotification
      if (window.showNotification) {
        window.showNotification("Đã lưu kết quả nhận diện vào lịch sử", "success")
      }
    } else {
      console.error("Lỗi khi lưu lịch sử:", result.message || "Unknown error")

      // Hiển thị thông báo lỗi nếu có hàm showNotification
      if (window.showNotification) {
        window.showNotification("Không thể lưu kết quả nhận diện: " + (result.message || "Lỗi không xác định"), "error")
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử:", error)

    // Hiển thị thông báo lỗi nếu có hàm showNotification
    if (window.showNotification) {
      window.showNotification("Lỗi khi lưu lịch sử: " + error.message, "error")
    }
  }
}

function speakText(text, language = "vi") {
  if (!("speechSynthesis" in window)) {
    alert("Your browser does not support text-to-speech. Please try another browser.")
    return
  }

  // Lấy nút audio từ DOM
  const audioBtn = document.getElementById("audioBtn")

  // Check if speech synthesis is already speaking
  if (window.speechSynthesis.speaking) {
    // If already speaking, stop the current audio
    window.speechSynthesis.cancel()

    // If the audio button has a playing state, update its appearance
    const speakerIcon = audioBtn?.querySelector("i")
    if (speakerIcon) {
      speakerIcon.className = "fas fa-volume-up"
    }

    return // Exit the function to stop playback
  }

  // Dừng tất cả âm thanh đang phát
  window.speechSynthesis.cancel()

  // Tạo utterance mới
  const utterance = new SpeechSynthesisUtterance(text)

  // Đặt ngôn ngữ
  utterance.lang = language === "vi" ? "vi-VN" : language === "en" ? "en-US" : language

  // Update the speaker icon to indicate playing state
  const speakerIcon = audioBtn?.querySelector("i")
  if (speakerIcon) {
    speakerIcon.className = "fas fa-volume-mute"
  }

  // Add event listener for when speech ends
  utterance.onend = () => {
    // Reset the speaker icon when speech ends
    if (speakerIcon) {
      speakerIcon.className = "fas fa-volume-up"
    }
  }

  // Phát âm thanh
  window.speechSynthesis.speak(utterance)
}

function resetResult() {
  const resultContent = document.getElementById("resultContent")
  const audioBtn = document.getElementById("audioBtn")
  const downloadBtn = document.querySelector(".download-btn")

  if (resultContent) {
    resultContent.innerHTML = '<p class="placeholder-text">Recognition results will appear here after processing.</p>'
    if (audioBtn) {
      audioBtn.disabled = true
    }
    if (downloadBtn) {
      downloadBtn.disabled = true
    }
  }
}