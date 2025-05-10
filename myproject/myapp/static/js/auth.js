// Các hàm xử lý authentication
const AUTH_TOKEN_KEY = "auth_token"
const USER_DATA_KEY = "user_data"

// Lưu token và thông tin user vào localStorage
function saveAuthData(token, userData) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
}

// Lấy token từ localStorage
function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Lấy thông tin user từ localStorage
function getUserData() {
  const userData = localStorage.getItem(USER_DATA_KEY)
  return userData ? JSON.parse(userData) : null
}

// Kiểm tra user đã đăng nhập chưa
function isAuthenticated() {
  return !!getAuthToken()
}

// Xóa thông tin đăng nhập
function clearAuthData() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_DATA_KEY)
}

// Lấy headers chuẩn cho API requests
function getAuthHeaders() {
  const token = getAuthToken()
  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Đăng xuất
async function logout() {
  try {
    const token = getAuthToken()
    if (token) {
      // Gọi API logout
      const response = await fetch("/auth/logout/", {
        method: "POST",
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      // Xóa dữ liệu đăng nhập khỏi localStorage
      clearAuthData()

      // Hiển thị thông báo
      if (window.showNotification) {
        window.showNotification(result.message || "Logged out successfully", "success")
      } else {
        alert("Logged out successfully")
      }
    } else {
      // Nếu không có token, chỉ xóa dữ liệu local
      clearAuthData()
      if (window.showNotification) {
        window.showNotification("Logged out successfully", "success")
      } else {
        alert("Logged out successfully")
      }
    }

    // Chuyển hướng về trang login
    setTimeout(() => {
      window.location.href = "/login/"
    }, 1000)
  } catch (error) {
    console.error("Logout error:", error)
    // Xóa dữ liệu đăng nhập khỏi localStorage ngay cả khi có lỗi
    clearAuthData()
    // Hiển thị thông báo
    if (window.showNotification) {
      window.showNotification("Logged out successfully", "success")
    } else {
      alert("Logged out successfully")
    }
    // Chuyển hướng về trang login
    setTimeout(() => {
      window.location.href = "/login/"
    }, 1000)
  }
}

// Fetch user profile from API
async function fetchUserProfile() {
  try {
    // Get user ID from auth data
    const userData = getUserData()
    if (!userData || !userData.id) {
      console.error("User ID not found")
      return null
    }

    // Fetch user profile from API
    const response = await fetch(`/users/${userData.id}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    const result = await response.json()

    if (response.ok && result.status === 'success') {
      // Update localStorage with latest user data
      saveAuthData(getAuthToken(), result.data)
      return result.data
    } else {
      console.error("Failed to fetch user profile:", result.message)
      return null
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Kiểm tra và cập nhật UI dựa trên trạng thái đăng nhập
async function updateAuthUI() {
  const isLoggedIn = isAuthenticated()

  // Các phần tử cần cập nhật
  const loginLinks = document.querySelectorAll(".auth-login-link")
  const registerLinks = document.querySelectorAll(".auth-register-link")
  const userProfileSection = document.querySelector(".user-profile")
  const userAvatar = document.querySelector(".avatar img")
  const adminMenuItem = document.querySelector(".admin-menu-item")

  if (isLoggedIn) {
    // Fetch latest user data from API
    const userData = (await fetchUserProfile()) || getUserData()

    if (userData) {
      // Ẩn liên kết đăng nhập/đăng ký
      loginLinks.forEach((link) => (link.style.display = "none"))
      registerLinks.forEach((link) => (link.style.display = "none"))

      // Hiển thị phần user profile
      if (userProfileSection) {
        userProfileSection.style.display = "block"
      }

      // Cập nhật avatar nếu có
      if (userAvatar && userData.avatar) {
        userAvatar.src = userData.avatar
      }

      // Hiển thị/ẩn menu admin dựa vào role
      if (adminMenuItem) {
        adminMenuItem.style.display = userData.role === "admin" ? "block" : "none"
      }
    }
  } else {
    // Hiển thị liên kết đăng nhập/đăng ký
    loginLinks.forEach((link) => (link.style.display = "block"))
    registerLinks.forEach((link) => (link.style.display = "block"))

    // Ẩn phần user profile
    if (userProfileSection) {
      userProfileSection.style.display = "none"
    }

    // Ẩn menu admin
    if (adminMenuItem) {
      adminMenuItem.style.display = "none"
    }
  }
}

// Khởi tạo các event listeners cho đăng xuất
function initAuthListeners() {
  const logoutBtn = document.getElementById("logout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      logout()
    })
  }
}

// Hàm khởi tạo authentication
function initAuth() {
  updateAuthUI()
  initAuthListeners()
}

// Export các hàm để sử dụng ở các file khác
window.Auth = {
  saveAuthData,
  getAuthToken,
  getUserData,
  isAuthenticated,
  clearAuthData,
  getAuthHeaders,
  logout,
  updateAuthUI,
  fetchUserProfile,
  initAuth,
}

// Khởi tạo khi DOM đã load
document.addEventListener("DOMContentLoaded", initAuth)
