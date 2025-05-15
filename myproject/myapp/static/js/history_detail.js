document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const avatar = document.getElementById("avatar")
  const dropdown = document.getElementById("dropdown")
  const detailImage = document.getElementById("detailImage")
  const detailResult = document.getElementById("detailResult")
  const detailDate = document.getElementById("detailDate")
  const detailId = document.getElementById("detailId")
  const audioBtn = document.getElementById("audioBtn")
  const deleteBtn = document.querySelector(".delete-btn")
  const downloadBtn = document.querySelector(".action-btn:first-child")
  const shareBtn = document.querySelector(".action-btn:nth-child(2)")
  const API_GEMINI_KEY = "AIzaSyCsnBXKdeauNWlz_KYhjjUn3f8o7ClOpT4"

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

  // Toggle dropdown menu
  if (avatar) {
    avatar.addEventListener("click", () => {
      dropdown.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove("active")
      }
    })
  }

  // Get ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get("id")

  if (!id) {
    detailResult.innerHTML = '<p class="placeholder-text">No ID provided</p>'
    detailDate.textContent = "Date: N/A"
    detailId.textContent = "ID: Not found"
    return
  }

  // Check authentication status
  function checkAuth() {
    if (!window.Auth || !window.Auth.isAuthenticated()) {
      // Redirect to login page if not authenticated
      window.location.href = "/login/"
      return false
    }
    return true
  }

  // Fetch history detail from API
  async function fetchHistoryDetail() {
    try {
      // Check authentication first
      if (!checkAuth()) return

      // Show loading state
      detailResult.innerHTML = '<p class="placeholder-text">Loading result...</p>'
      detailImage.src = "/placeholder.svg?height=300&width=400"
      detailDate.textContent = "Date: Loading..."
      detailId.textContent = "ID: Loading..."

      // Get auth headers from Auth module
      const headers = window.Auth ? window.Auth.getAuthHeaders() : {}

      const response = await fetch(`/histories/${id}/`, {
        method: "GET",
        headers: headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        displayHistoryDetail(data.data)
      } else {
        throw new Error(data.message || "Error fetching history detail")
      }
    } catch (error) {
      console.error("Error:", error)
      detailResult.innerHTML = `<p class="placeholder-text">Error: ${error.message}</p>`
      detailDate.textContent = "Date: N/A"
      detailId.textContent = "ID: Not found"

      // Show notification if available
      if (window.showNotification) {
        window.showNotification("Failed to load history detail", "error")
      }
    }
  }

  // Display history detail
  function displayHistoryDetail(record) {
    // Xử lý URL ảnh với Cloudinary
    if (record.image) {
      // Kiểm tra xem URL đã có tiền tố Cloudinary chưa
      if (!record.image.startsWith("https://")) {
        detailImage.src = `https://res.cloudinary.com/dbqoymyi8/${record.image}`
      } else {
        detailImage.src = record.image
      }
    } else {
      detailImage.src = "/placeholder.svg?height=300&width=400"
    }

    detailResult.innerHTML = `<p class="recognized-text">${record.result}</p>`

    // Format date
    const date = new Date(record.created_at)
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`

    detailDate.textContent = `Date: ${formattedDate}`
    detailId.textContent = `ID: #${record.id}`

    // Thay thế nút phát âm thanh bằng dropdown
    if (audioBtn && "speechSynthesis" in window) {
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

          // If already speaking, this will stop the audio
          // If not speaking, this will start the audio
          speakText(record.result, lang)

          audioDropdown.classList.remove("active")
        })
      })
    }

    // Setup download button
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        // Hiển thị menu tùy chọn tải xuống
        showTranslationModal(record)
      })
    }

    // Setup share button
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        shareResult(record)
      })
    }

    // Setup delete button
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        confirmDeleteHistory(record.id)
      })
    }
  }

  // Hiển thị modal dịch văn bản trước khi tải xuống
  function showTranslationModal(record) {
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
      downloadServerAudio(record.result, `history-${record.id}-vi.mp3`, "vi")
    })

    document.getElementById("downloadAudioEn").addEventListener("click", () => {
      downloadServerAudio(record.result, `history-${record.id}-en.mp3`, "en")
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
        const translatedContent = await translateText(record.result, selectedLanguage)

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
          downloadServerAudio(translatedContent, `history-${record.id}-${selectedLanguage}.mp3`, selectedLanguage)
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
      downloadTextFile(record.result, `history-${record.id}.txt`)
      closeTranslationModal()
    })

    // Xử lý sự kiện tải xuống văn bản đã dịch
    downloadTranslatedBtn.addEventListener("click", () => {
      const selectedLanguage = languageSelect.value
      downloadTextFile(translatedText.textContent, `history-${record.id}-${selectedLanguage}.txt`)
      closeTranslationModal()
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

      // Sử dụng API Gemini để dịch văn bản
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

  // Download result as text file
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

  // Phát âm thanh với tùy chọn ngôn ngữ (cho nút audio)
  function speakText(text, language = "vi") {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support text-to-speech. Please try another browser.")
      return
    }

    // Check if speech synthesis is already speaking
    if (window.speechSynthesis.speaking) {
      // If already speaking, stop the current audio
      window.speechSynthesis.cancel()

      // If the audio button has a playing state, update its appearance
      const speakerIcon = audioBtn.querySelector("i")
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
    const speakerIcon = audioBtn.querySelector("i")
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

  // Share result
  function shareResult(record) {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: "Recognition Result",
          text: record.result,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(record.result)
        .then(() => {
          alert("Result copied to clipboard!")
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
        })
    }
  }

  // Confirm delete history
  function confirmDeleteHistory(historyId) {
    if (confirm("Are you sure you want to delete this recognition record? This action cannot be undone.")) {
      deleteHistory(historyId)
    }
  }

  // Delete history
  async function deleteHistory(historyId) {
    try {
      // Check authentication first
      if (!checkAuth()) return

      // Get auth headers from Auth module
      const headers = window.Auth ? window.Auth.getAuthHeaders() : {}

      const response = await fetch(`/histories/${historyId}/`, {
        method: "DELETE",
        headers: headers,
      })

      if (response.ok) {
        // Show success message
        alert("Record deleted successfully")
        // Redirect to history page
        window.location.href = "/history/"
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete record")
      }
    } catch (error) {
      console.error("Error deleting history:", error)
      alert(`Error: ${error.message}`)
    }
  }

  // Fetch history detail
  fetchHistoryDetail()

  // Fetch user avatar if Auth module is available
  if (window.Auth) {
    window.Auth.fetchUserProfile()
  }
})