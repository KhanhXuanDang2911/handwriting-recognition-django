document.addEventListener("DOMContentLoaded", () => {
  console.log("Profile page loaded") // Debug log

  // DOM Elements
  const avatar = document.getElementById("avatar")
  const dropdown = document.getElementById("dropdown")
  const profileAvatar = document.getElementById("profileAvatar")
  const avatarUpload = document.getElementById("avatarUpload")
  const profileForm = document.getElementById("profileForm")
  const logoutBtn = document.getElementById("logout")

  // Kiểm tra đăng nhập
  if (window.Auth && !window.Auth.isAuthenticated()) {
    window.location.href = "/login/"
    return
  }

  // Fetch user data from API
  async function fetchUserProfile() {
    try {
      console.log("Fetching user profile") // Debug log

      // Get user ID from auth data (still need this to make the API call)
      const userData = window.Auth ? window.Auth.getUserData() : null
      if (!userData || !userData.id) {
        console.error("User ID not found") // Debug log
        alert("User ID not found")
        return
      }

      console.log("User ID:", userData.id) // Debug log

      // Show loading indicator
      const saveBtn = document.querySelector(".save-btn")
      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
        saveBtn.disabled = true
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
      console.log("Profile data response:", result) // Debug log

      // Reset save button
      if (saveBtn) {
        saveBtn.textContent = "Save Changes"
        saveBtn.disabled = false
      }

      if (response.ok && result.status === 'success') {
        // Fill form with user data from API
        const user = result.data
        console.log("Filling form with user data:", user) // Debug log

        document.getElementById("username").value = user.username || ""
        document.getElementById("fullname").value = user.full_name || ""
        document.getElementById("email").value = user.email || ""
        document.getElementById("phone").value = user.phone || ""
        document.getElementById("bio").value = user.bio || ""

        // Update avatar
        if (user.avatar) {
          profileAvatar.src = 'https://res.cloudinary.com/dbqoymyi8/' + user.avatar
          if (avatar) {
            avatar.querySelector("img").src = 'https://res.cloudinary.com/dbqoymyi8/' + user.avatar
          }
        }

        // Show success message
      } else {
        console.error("Failed to load profile data:", result) // Debug log
        alert(result.message || "Failed to load profile data")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      alert("An error occurred while loading profile data")

      // Reset save button
      const saveBtn = document.querySelector(".save-btn")
      if (saveBtn) {
        saveBtn.textContent = "Save Changes"
        saveBtn.disabled = false
      }
    }
  }

  // Load user profile data when page loads
  console.log("Calling fetchUserProfile") // Debug log
  fetchUserProfile()

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

  // Handle profile avatar upload
  if (profileAvatar && avatarUpload) {
    profileAvatar.parentElement.addEventListener("click", () => {
      avatarUpload.click()
    })

    avatarUpload.addEventListener("change", function () {
      if (this.files.length) {
        const file = this.files[0]

        if (!file.type.match("image.*")) {
          alert("Please select an image file")
          return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
          profileAvatar.src = e.target.result
          // Also update the header avatar
          if (avatar) {
            avatar.querySelector("img").src = e.target.result
          }
        }

        reader.readAsDataURL(file)
      }
    })
  }

  // Handle form submission
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Profile form submitted") // Debug log

      // Get user ID from auth data (still need this to make the API call)
      const userData = window.Auth ? window.Auth.getUserData() : null
      if (!userData || !userData.id) {
        alert("User ID not found")
        return
      }

      // Lấy dữ liệu từ form
      const formData = new FormData(profileForm)

      // Tạo FormData mới để gửi lên server
      const dataToSend = new FormData()

      // Thêm các trường dữ liệu
      dataToSend.append("full_name", formData.get("fullname"))
      dataToSend.append("email", formData.get("email"))
      dataToSend.append("phone", formData.get("phone"))
      dataToSend.append("bio", formData.get("bio"))
      dataToSend.append("language", formData.get("language"))

      // Thêm avatar nếu có
      if (avatarUpload && avatarUpload.files.length > 0) {
        dataToSend.append("avatar", avatarUpload.files[0])
      }

      try {
        console.log("Updating profile") // Debug log

        // Hiển thị loading
        const saveBtn = document.querySelector(".save-btn")
        const originalContent = saveBtn.textContent
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'
        saveBtn.disabled = true

        // Gọi API cập nhật profile
        const userId = userData.id

        // Sử dụng FormData để gửi cả file và dữ liệu
        const response = await fetch(`/users/${userId}/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${window.Auth.getAuthToken()}`,
            // Không cần set Content-Type khi dùng FormData
          },
          body: dataToSend,
        })

        const result = await response.json()
        console.log("Profile update response:", result) // Debug log

        if (response.ok && result.success) {
          // Cập nhật thông tin user trong localStorage
          if (window.Auth) {
            window.Auth.saveAuthData(window.Auth.getAuthToken(), result.data)
          }

          alert(result.message || "Profile updated successfully!")

          // Refresh profile data
          fetchUserProfile()
        } else {
          let errorMessage = result.message || "Failed to update profile"

          // Check if there are specific field errors
          if (result.errors) {
            const errorFields = Object.keys(result.errors)
            if (errorFields.length > 0) {
              // Display the first error message
              const firstErrorField = errorFields[0]
              errorMessage = result.errors[firstErrorField][0] || errorMessage
            }
          }

          alert(errorMessage)
        }

        // Khôi phục nút save
        saveBtn.textContent = originalContent
        saveBtn.disabled = false
      } catch (error) {
        console.error("Error updating profile:", error)
        alert("An error occurred while updating profile")

        // Khôi phục nút save
        const saveBtn = document.querySelector(".save-btn")
        if (saveBtn) {
          saveBtn.textContent = "Save Changes"
          saveBtn.disabled = false
        }
      }
    })
  }

  // Xử lý nút Cancel
  const cancelBtn = document.querySelector(".cancel-btn")
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      // Hiển thị hộp thoại xác nhận
      if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
        // Quay lại trang trước đó hoặc trang chủ
        window.location.href = "/home/"
      }
    })
  }
})
