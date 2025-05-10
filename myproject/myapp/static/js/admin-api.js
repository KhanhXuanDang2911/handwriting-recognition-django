// API URL Constants
const API_BASE_URL = ""
const USERS_API = `${API_BASE_URL}/users/`
const HISTORIES_API = `${API_BASE_URL}/histories/`

// Lấy CSRF token từ cookie
function getCSRFToken() {
  const name = "csrftoken="
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(";")

  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim()
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length)
    }
  }
  return ""
}

// Get authentication headers
function getAuthHeaders(includeContentType = true) {
  const headers = {}

  // Add CSRF token if available
  const csrfToken = getCSRFToken()
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken
  }

  // Add JWT token if available through Auth module
  if (window.Auth && window.Auth.isAuthenticated()) {
    headers["Authorization"] = `Bearer ${window.Auth.getAuthToken()}`
  }

  // Add Content-Type for JSON requests
  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

// Check authentication status
function checkAuthentication() {
  if (!window.Auth || !window.Auth.isAuthenticated()) {
    console.error("User is not authenticated")
    alert("You must be logged in to access this feature. Redirecting to login page...")
    window.location.href = "/login/"
    return false
  }
  return true
}

// Pagination state
const usersPagination = {
  currentPage: 1,
  totalPages: 1,
  pageSize: 1000,
  count: 0,
  next: null,
  previous: null,
}

const historiesPagination = {
  currentPage: 1,
  totalPages: 1,
  pageSize: 1000,
  count: 0,
  next: null,
  previous: null,
}

// Error handling
function handleApiError(error) {
  console.error("API Error:", error)

  let errorMessage = ""

  if (error.response) {
    // Server responded with error
    const data = error.response.data
    if (data.message) {
      errorMessage = data.message
    } else if (data.errors) {
      errorMessage = Object.entries(data.errors)
        .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
        .join("\n")
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
  } else if (error.status === 401 || error.status === 403) {
    // Authentication error
    errorMessage = "Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại."
    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/login/"
    }, 2000)
  } else if (error.message) {
    // Error has a message property
    errorMessage = error.message
  }

  // Only show alert if we have a specific error message
  if (errorMessage) {
    alert(errorMessage)
  }

  return null
}

// API Functions for Users
async function fetchUsers(page = 1, pageSize = 10, search = "", role = "", status = "") {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    let url = `${USERS_API}?page=${page}&page_size=${pageSize}`

    if (search) url += `&search=${encodeURIComponent(search)}`
    if (role) url += `&role=${encodeURIComponent(role)}`
    if (status) url += `&status=${encodeURIComponent(status)}`

    console.log("Fetching users with URL:", url)
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(false), // Don't include Content-Type for GET requests
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Users API response:", data)

    if (data.status === 'success') {
      // Update pagination state directly from API response
      usersPagination.currentPage = Number.parseInt(page, 10)
      usersPagination.count = data.data.count || 0
      usersPagination.next = data.data.next
      usersPagination.previous = data.data.previous
      usersPagination.pageSize = pageSize

      // Calculate total pages based on count and pageSize
      usersPagination.totalPages = Math.max(1, Math.ceil(usersPagination.count / pageSize))

      console.log("Users pagination updated:", usersPagination)
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi lấy dữ liệu người dùng")
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return handleApiError(error)
  }
}

async function fetchUserById(userId) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${USERS_API}${userId}/`, {
      method: "GET",
      headers: getAuthHeaders(false), // Don't include Content-Type for GET requests
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'success') {
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi lấy thông tin người dùng")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

async function createUser(userData) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(USERS_API, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw { response: { data } }
    }

    if (data.status === 'success') {
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi tạo người dùng")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

async function updateUser(userId, userData) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${USERS_API}${userId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw { response: { data } }
    }

    if (data.status === 'success') {
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi cập nhật người dùng")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

async function deleteUser(userId) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${USERS_API}${userId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(false), // Don't include Content-Type for DELETE requests
    })

    if (response.status === 204 || response.status === 200) {
      return true // Successful deletion
    }

    if (response.status === 401 || response.status === 403) {
      throw { status: response.status, message: "Authentication error" }
    }

    const data = await response.json()

    if (!response.ok) {
      throw { response: { data } }
    }

    if (data.status === 'success') {
      return true
    } else {
      throw new Error(data.message || "Lỗi khi xóa người dùng")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// API Functions for Histories
async function fetchHistories(page = 1, pageSize = 10, search = "", userId = "", dateFilter = "") {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    let url = `${HISTORIES_API}?page=${page}&page_size=${pageSize}`

    if (search) url += `&search=${encodeURIComponent(search)}`
    if (userId && userId !== "all") url += `&user_id=${encodeURIComponent(userId)}`

    // Handle date filtering
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    if (dateFilter && dateFilter !== "all") {
      let startDate

      switch (dateFilter) {
        case "today":
          startDate = today.toISOString().split("T")[0]
          break
        case "week":
          startDate = weekStart.toISOString().split("T")[0]
          break
        case "month":
          startDate = monthStart.toISOString().split("T")[0]
          break
      }

      if (startDate) {
        url += `&created_at__gte=${startDate}`
      }
    }

    console.log("Fetching histories with URL:", url)
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(false), // Don't include Content-Type for GET requests
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log("History API response:", data)

    if (data.status === 'success') {
      // Update pagination state directly from API response
      historiesPagination.currentPage = Number.parseInt(page, 10)
      historiesPagination.count = data.data.count || 0
      historiesPagination.next = data.data.next
      historiesPagination.previous = data.data.previous
      historiesPagination.pageSize = pageSize

      // Calculate total pages based on count and pageSize
      historiesPagination.totalPages = Math.max(1, Math.ceil(historiesPagination.count / pageSize))

      console.log("Histories pagination updated:", historiesPagination)
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi lấy dữ liệu lịch sử")
    }
  } catch (error) {
    console.error("Error fetching histories:", error)
    return handleApiError(error)
  }
}

async function fetchHistoryById(historyId) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${HISTORIES_API}${historyId}/`, {
      method: "GET",
      headers: getAuthHeaders(false), // Don't include Content-Type for GET requests
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'success') {
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi lấy thông tin lịch sử")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

async function updateHistory(historyId, historyData) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${HISTORIES_API}${historyId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(historyData),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw { status: response.status, message: "Authentication error" }
      }
      throw { response: { data } }
    }

    if (data.status === 'success') {
      return data.data
    } else {
      throw new Error(data.message || "Lỗi khi cập nhật lịch sử")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

async function deleteHistory(historyId) {
  // Check authentication
  if (!checkAuthentication()) return null

  try {
    const response = await fetch(`${HISTORIES_API}${historyId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(false), // Don't include Content-Type for DELETE requests
    })

    if (response.status === 204 || response.status === 200) {
      return true // Successful deletion
    }

    if (response.status === 401 || response.status === 403) {
      throw { status: response.status, message: "Authentication error" }
    }

    const data = await response.json()

    if (!response.ok) {
      throw { response: { data } }
    }

    if (data.status === 'success') {
      return true
    } else {
      throw new Error(data.message || "Lỗi khi xóa lịch sử")
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// Export functions
window.adminApi = {
  users: {
    fetch: fetchUsers,
    fetchById: fetchUserById,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
    pagination: usersPagination,
  },
  histories: {
    fetch: fetchHistories,
    fetchById: fetchHistoryById,
    update: updateHistory,
    delete: deleteHistory,
    pagination: historiesPagination,
  },
}
