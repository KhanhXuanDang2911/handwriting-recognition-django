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
  const audioBtn = document.getElementById("audioBtn")
  const resultContent = document.getElementById("resultContent")
  const logoutBtn = document.getElementById("logout")
  const API_GEMINI_KEY = "AIzaSyCsnBXKdeauNWlz_KYhjjUn3f8o7ClOpT4"

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

  // Handle image upload via click
  if (uploadArea) {
    uploadArea.addEventListener("click", () => {
      imageUpload.click()
    })

    // Handle image upload via drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = "var(--primary-color)"
      uploadArea.style.backgroundColor = "rgba(67, 97, 238, 0.05)"
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.style.borderColor = "var(--dark-gray)"
      uploadArea.style.backgroundColor = "transparent"
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.style.borderColor = "var(--dark-gray)"
      uploadArea.style.backgroundColor = "transparent"

      if (e.dataTransfer.files.length) {
        handleImageFile(e.dataTransfer.files[0])
      }
    })
  }

  // Handle file input change
  if (imageUpload) {
    imageUpload.addEventListener("change", function () {
      if (this.files.length) {
        handleImageFile(this.files[0])
      }
    })
  }

  // Handle image file
  function handleImageFile(file) {
    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      previewImg.src = e.target.result
      uploadArea.style.display = "none"
      imagePreview.style.display = "block"
      renderBtn.disabled = false
    }

    reader.readAsDataURL(file)
  }

  // Remove image
  if (removeImage) {
    removeImage.addEventListener("click", () => {
      previewImg.src = ""
      imagePreview.style.display = "none"
      uploadArea.style.display = "block"
      renderBtn.disabled = true
      resetResult()
    })
  }

  // Thêm nút tải xuống
  const downloadBtn = document.createElement("button")
  downloadBtn.className = "download-btn"
  downloadBtn.innerHTML = '<i class="fas fa-download"></i>'
  downloadBtn.disabled = true
  downloadBtn.style.marginLeft = "10px"

  // Thêm nút tải xuống vào header
  const resultHeader = document.querySelector(".result-header")
  if (resultHeader) {
    resultHeader.appendChild(downloadBtn)
  }

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

  // Recognize text
  if (renderBtn) {
    renderBtn.addEventListener("click", async () => {
      // Show loading state
      resultContent.innerHTML = '<p class="placeholder-text">Processing image...</p>'

      try {
        // Gọi API nhận diện văn bản thực tế
        const recognizedText = await simulateTextRecognition()
        console.log("Recognized text:", recognizedText)

        // Nếu không có kết quả nhận diện, hiển thị thông báo lỗi
        if (!recognizedText || recognizedText.length === 0) {
          throw new Error("Không thể nhận diện văn bản từ hình ảnh")
        }

        // Nếu kết quả là mảng, ghép lại thành chuỗi
        const textOfficial = Array.isArray(recognizedText)
          ? recognizedText.reduce((text, item) => text + item + "\n", "")
          : recognizedText

        // URL API đúng dựa trên mẫu curl của bạn (sử dụng Gemini 2.0 Flash)
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
                      text: `Tôi vừa OCR được đoạn văn sau:\n"${textOfficial}"\nHãy sửa lại cho đúng chính tả, ngữ pháp và giữ nguyên ý nghĩa. 
                              Lưu ý rằng, chỉ trả về kết quả là đoạn văn bản đã được xử lý, không cần gì thêm, vì kết quả đó là kết quả cuối cùng cho người dùng của tôi xem.`,
                    },
                  ],
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API responded with status: ${response.status}. Details: ${errorText}`)
        }

        const data = await response.json()
        console.log("API response:", data) // Log để debug

        // Kiểm tra cấu trúc phản hồi API theo tài liệu mới nhất
        if (
          data &&
          data.candidates &&
          data.candidates.length > 0 &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0
        ) {
          const fixedText = data.candidates[0].content.parts[0].text

          if (fixedText) {
            resultContent.innerHTML = `<p class="recognized-text">${fixedText}</p>`
          } else {
            throw new Error("Không tìm thấy văn bản trong kết quả API")
          }
        } else {
          // Xử lý trường hợp cấu trúc API response không đúng như mong đợi
          console.error("Cấu trúc phản hồi API không hợp lệ:", data)
          throw new Error("Cấu trúc phản hồi API không hợp lệ")
        }
      } catch (error) {
        console.error("Lỗi khi xử lý nhận diện:", error)
        // Hiển thị thông báo lỗi cụ thể hơn
        resultContent.innerHTML = `
          <p class="error-text">Lỗi: ${error.message}</p>
        `
      } finally {
        // Bật nút audio và download trong mọi trường hợp
        if (audioBtn) {
          audioBtn.disabled = false
        }
        if (downloadBtn) {
          downloadBtn.disabled = false
        }

        // Lưu kết quả vào lịch sử nếu người dùng đã đăng nhập
        if (
          window.Auth &&
          window.Auth.isAuthenticated() &&
          resultContent.textContent &&
          !resultContent.textContent.includes("Lỗi:")
        ) {
          saveRecognitionToHistory(previewImg.src, resultContent.textContent)
        }
      }
    })
  }

  // Thêm sự kiện click cho nút tải xuống
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const text = resultContent.textContent
      if (text && !text.includes("Recognition results will appear here")) {
        showDownloadOptions(text)
      }
    })
  }

  // Hiển thị menu tùy chọn tải xuống
  function showDownloadOptions(text) {
    // Tạo modal cho các tùy chọn tải xuống
    const downloadModal = document.createElement("div")
    downloadModal.className = "download-modal"
    downloadModal.innerHTML = `
      <div class="download-modal-content">
        <h3>Download Options</h3>
        <button id="downloadText" class="download-option">Download as Text</button>
        <div class="audio-options">
          <h4>Download as Audio</h4>
          <button id="downloadAudioVi" class="download-option audio-option">
            <i class="fas fa-volume-up"></i> Vietnamese Voice
          </button>
          <button id="downloadAudioEn" class="download-option audio-option">
            <i class="fas fa-volume-up"></i> English Voice
          </button>
          <div class="audio-note">
            <p><i class="fas fa-info-circle"></i> For long text, we'll create a single combined audio file.</p>
          </div>
        </div>
        <button id="cancelDownload" class="download-option cancel">Cancel</button>
      </div>
    `
    document.body.appendChild(downloadModal)

    // Thêm style cho modal
    const style = document.createElement("style")
    style.textContent = `
      .download-modal {
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
      .download-modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 100%;
      }
      .download-modal h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        text-align: center;
      }
      .download-modal h4 {
        margin: 1rem 0 0.5rem 0;
        font-size: 1rem;
        color: var(--text-dark);
      }
      .download-option {
        display: block;
        width: 100%;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        border: none;
        border-radius: 0.25rem;
        background-color: var(--primary-color);
        color: white;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        text-align: center;
      }
      .download-option:hover {
        background-color: var(--primary-hover);
      }
      .audio-option {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .audio-option i {
        margin-right: 0.5rem;
      }
      .audio-options {
        margin-bottom: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        padding: 0.5rem 1rem 1rem;
        background-color: #f9fafb;
      }
      .audio-note {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-light);
      }
      .audio-note p {
        margin: 0;
      }
      .audio-note i {
        margin-right: 0.25rem;
      }
      .download-option.cancel {
        background-color: #9ca3af;
      }
      .download-option.cancel:hover {
        background-color: #6b7280;
      }
    `
    document.head.appendChild(style)

    // Xử lý sự kiện cho các nút
    document.getElementById("downloadText").addEventListener("click", () => {
      downloadResult(text, "recognition-result.txt")
      closeDownloadModal()
    })

    document.getElementById("downloadAudioVi").addEventListener("click", () => {
      downloadServerAudio(text, "recognition-result-vi.mp3", "vi")
      closeDownloadModal()
    })

    document.getElementById("downloadAudioEn").addEventListener("click", () => {
      downloadServerAudio(text, "recognition-result-en.mp3", "en")
      closeDownloadModal()
    })

    document.getElementById("cancelDownload").addEventListener("click", () => {
      closeDownloadModal()
    })

    // Đóng modal khi click bên ngoài
    downloadModal.addEventListener("click", (e) => {
      if (e.target === downloadModal) {
        closeDownloadModal()
      }
    })

    // Hàm đóng modal
    function closeDownloadModal() {
      document.body.removeChild(downloadModal)
      document.head.removeChild(style)
    }
  }

  // Download result as text file
  function downloadResult(text, filename) {
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

  // Gọi API nhận diện văn bản thực tế
  async function simulateTextRecognition() {
    const fileInput = document.getElementById("imageUpload")
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      // Nếu không có file, sử dụng text mẫu cho mục đích demo
      console.warn("Không có file ảnh, sử dụng text mẫu")
      return "Dù cuộc sống có khó khăn như thế nào đi nữa, cũng đừng từ bỏ sự lương thiện, dù chúng ta có cô đơn như thế nào đi nữa, hãy đi theo con đường được xây dựng bởi nhân cách tốt. Con người sống trên đời này sẽ có những khó khăn, vất vả khác nhau nhưng hy vọng, với mỗi đau thương đi qua ta đều có thể cảm nhận được sự ấm áp của tình người.\n\nMột ngày nào đó, chúng ta sẽ hiểu, có tấm lòng lương thiện còn khó hơn có được trí thông minh. Bởi vì thông minh là thiên phú, còn lương thiện là lựa chọn của chính chúng ta."
    }

    const formData = new FormData()
    formData.append("file", fileInput.files[0])

    try {
      // Thay đổi URL API tùy theo cấu hình thực tế của bạn
      const response = await fetch("http://192.168.208.233:8000/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      return result.texts
    } catch (error) {
      console.error("Error during the fetch:", error)
      // Trả về text mẫu nếu có lỗi (chỉ cho mục đích demo)
      return "Dù cuộc sống có khó khăn như thế nào đi nữa, cũng đừng từ bỏ sự lương thiện, dù chúng ta có cô đơn như thế nào đi nữa, hãy đi theo con đường được xây dựng bởi nhân cách tốt. Con người sống trên đời này sẽ có những khó khăn, vất vả khác nhau nhưng hy vọng, với mỗi đau thương đi qua ta đều có thể cảm nhận được sự ấm áp của tình người.\n\nMột ngày nào đó, chúng ta sẽ hiểu, có tấm lòng lương thiện còn khó hơn có được trí thông minh. Bởi vì thông minh là thiên phú, còn lương thiện là lựa chọn của chính chúng ta."
    }
  }
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
  utterance.lang = language === "vi" ? "vi-VN" : "en-US"

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
