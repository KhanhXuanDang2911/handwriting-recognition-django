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
  fetchUserAvatar()

  // Function to fetch user avatar from API
  async function fetchUserAvatar() {
    // Check if user is authenticated
    if (window.Auth && window.Auth.isAuthenticated()) {
      try {
        console.log("Fetching user avatar")

        // Get user ID from auth data
        const userData = window.Auth.getUserData()
        if (!userData || !userData.id) {
          console.error("User ID not found")
          return
        }

        // Fetch user profile from API
        const response = await fetch(`/users/${userData.id}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${window.Auth.getAuthToken()}`,
            "Content-Type": "application/json",
          },
        })

        const result = await response.json()
        console.log("Profile data response:", result)
        if (response.ok && result.status === 'success') {
          // Update avatar in header
          const user = result.data
          const avatarImg = avatar.querySelector("#avatar img")
          if (avatarImg && user.avatar) {
            console.log("Updating avatar with:", user.avatar)
            avatarImg.src = 'https://res.cloudinary.com/dbqoymyi8/' + user.avatar
          }

          // Update user profile display
          const userProfileSection = document.querySelector(".user-profile")
          if (userProfileSection) {
            userProfileSection.style.display = "block"
          }

          // Update admin menu visibility if needed
          const adminMenuItem = document.querySelector(".admin-menu-item")
          if (adminMenuItem && user.role === "admin") {
            adminMenuItem.style.display = "block"
          }

          // Update localStorage with latest user data
          if (window.Auth) {
            window.Auth.saveAuthData(window.Auth.getAuthToken(), user)
          }
        } else {
          console.error("Failed to load profile data:", result)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
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

  // Reset result
  function resetResult() {
    if (resultContent) {
      resultContent.innerHTML = '<p class="placeholder-text">Recognition results will appear here after processing.</p>'
      if (audioBtn) {
        audioBtn.disabled = true
      }
    }
  }

  // Recognize text
  if (renderBtn) {
    renderBtn.addEventListener("click", async () => {
      // Show loading state
      resultContent.innerHTML = '<p class="placeholder-text">Processing image...</p>'

      const recognizedText = await simulateTextRecognition()
      console.warn(recognizedText)
      const textOfficial = recognizedText.reduce((text, item) => text + item + "\n", "")

      try {
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
        console.error("Lỗi khi gọi Gemini API:", error)
        // Hiển thị thông báo lỗi cụ thể hơn
        resultContent.innerHTML = `
                    <p class="recognized-text">${recognizedText}</p>
                `
      } finally {
        // Bật nút audio trong mọi trường hợp
        if (audioBtn) {
          audioBtn.disabled = false
        }
      }
    })
  }

  // Simulate text recognition (in a real app, this would be an API call)
  async function simulateTextRecognition() {
    const fileInput = document.getElementById("imageUpload")
    const formData = new FormData()
    formData.append("file", fileInput.files[0])

    try {
      const response = await fetch("http://192.168.208.233:8000/predict", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      return result.texts
    } catch (error) {
      console.error("Error during the fetch:", error)
      return "Error occurred during prediction."
    }
  }

  // Text-to-speech functionality
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      const text = resultContent.textContent

      // Nếu đang nói, thì hủy trước
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        return // Nếu đang nói thì hủy và không phát lại
      }

      if (text && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
      }
    })
  }

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Use Auth module's logout function if available
      if (window.Auth && typeof window.Auth.logout === "function") {
        window.Auth.logout()
      } else {
        alert("Logout successful")
        // In a real app, this would redirect to login page or perform actual logout
      }
    })
  }
})
