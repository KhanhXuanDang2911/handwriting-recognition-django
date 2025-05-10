// Thêm đoạn code này vào đầu file admin.js
document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra xem adminApi đã được tải chưa
  if (!window.adminApi) {
    console.error("Admin API not loaded! Check if admin-api.js is properly included.")
    // Hiển thị thông báo lỗi cho người dùng
    alert("Không thể tải API. Vui lòng tải lại trang hoặc liên hệ quản trị viên.")
    return
  }

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!window.Auth || !window.Auth.isAuthenticated()) {
    console.error("User is not authenticated")
    alert("Bạn cần đăng nhập để truy cập trang quản trị. Đang chuyển hướng đến trang đăng nhập...")
    window.location.href = "/login/"
    return
  }

  // Kiểm tra xem người dùng có quyền admin không
  const userData = window.Auth.getUserData()
  if (!userData || userData.role !== "admin") {
    console.error("User does not have admin privileges")
    alert("Bạn không có quyền truy cập trang quản trị. Đang chuyển hướng đến trang chủ...")
    window.location.href = "/home/"
    return
  }

  // Phần còn lại của code...
  console.log("Admin authentication check passed. Loading admin panel...")
})

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const avatar = document.getElementById("avatar")
  const dropdown = document.getElementById("dropdown")
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const usersTableBody = document.getElementById("usersTableBody")
  const historyTableBodyAdmin = document.getElementById("historyTableBodyAdmin")

  // User Modal Elements
  const addUserBtn = document.getElementById("addUserBtn")
  const userModal = document.getElementById("userModal")
  const closeModal = document.getElementById("closeModal")
  const cancelUserForm = document.getElementById("cancelUserForm")
  const userForm = document.getElementById("userForm")
  const modalTitle = document.getElementById("modalTitle")
  const userId = document.getElementById("userId")
  const userUsername = document.getElementById("userUsername")
  const userEmail = document.getElementById("userEmail")
  const userPassword = document.getElementById("userPassword")
  const userRole = document.getElementById("userRole")
  const userStatus = document.getElementById("userStatus")
  const userFullName = document.getElementById("userFullName")

  // History Modal Elements
  const historyModal = document.getElementById("historyModal")
  const closeHistoryModal = document.getElementById("closeHistoryModal")
  const cancelHistoryForm = document.getElementById("cancelHistoryForm")
  const historyForm = document.getElementById("historyForm")
  const historyModalTitle = document.getElementById("historyModalTitle")
  const historyId = document.getElementById("historyId")
  const historyUser = document.getElementById("historyUser")
  const historyImagePreview = document.getElementById("historyImagePreview")
  const historyResult = document.getElementById("historyResult")
  const historyDate = document.getElementById("historyDate")

  // Delete Modal Elements
  const deleteModal = document.getElementById("deleteModal")
  const closeDeleteModal = document.getElementById("closeDeleteModal")
  const cancelDelete = document.getElementById("cancelDelete")
  const confirmDelete = document.getElementById("confirmDelete")
  const deleteMessage = document.getElementById("deleteMessage")

  // Filter and Search Elements
  const userFilter = document.getElementById("userFilter")
  const dateFilterAdmin = document.getElementById("dateFilterAdmin")
  const userSearchInput = document.querySelector("#usersTab .search-box input")
  const userSearchBtn = document.querySelector("#usersTab .search-box button")
  const historySearchInput = document.querySelector("#historyTab .search-box input")
  const historySearchBtn = document.querySelector("#historyTab .search-box button")

  // Pagination Elements
  const userPrevBtn = document.querySelector("#usersTab .pagination-btn:first-child")
  const userNextBtn = document.querySelector("#usersTab .pagination-btn:last-child")
  const userPaginationInfo = document.querySelector("#usersTab .pagination-info")
  const historyPrevBtn = document.querySelector("#historyTab .pagination-btn:first-child")
  const historyNextBtn = document.querySelector("#historyTab .pagination-btn:last-child")
  const historyPaginationInfo = document.querySelector("#historyTab .pagination-info")

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

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.dataset.tab

      // Update active tab button
      tabBtns.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Update active tab content
      tabContents.forEach((content) => content.classList.remove("active"))
      document.getElementById(tabId + "Tab").classList.add("active")

      // Load data for the active tab
      if (tabId === "users") {
        loadUsers()
      } else if (tabId === "history") {
        loadHistories()
      }
    })
  })

  // Load Users with API
  async function loadUsers(page = 1, search = "") {
    try {
      // Show loading state
      usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>'

      console.log(`Loading users page ${page} with search: "${search}"`)
      const data = await window.adminApi.users.fetch(page, window.adminApi.users.pagination.pageSize, search)

      if (!data) return

      // Update pagination UI
      updateUserPagination()

      // Populate table
      populateUsersTable(data.results)

      // Update user filter in history tab
      await populateUserFilter()
    } catch (error) {
      console.error("Error loading users:", error)
      usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading data</td></tr>'
    }
  }

  // Load Histories with API
  async function loadHistories(page = 1, search = "", userId = "all", dateFilter = "all") {
    try {
      // Show loading state
      historyTableBodyAdmin.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>'

      console.log(
        `Loading histories page ${page} with search: "${search}", userId: ${userId}, dateFilter: ${dateFilter}`,
      )
      const data = await window.adminApi.histories.fetch(
        page,
        window.adminApi.histories.pagination.pageSize,
        search,
        userId,
        dateFilter,
      )

      if (!data) return

      // Update pagination UI
      updateHistoryPagination()

      // Populate table
      populateHistoryTable(data.results)
    } catch (error) {
      console.error("Error loading histories:", error)
      historyTableBodyAdmin.innerHTML = '<tr><td colspan="6" class="text-center">Error loading data</td></tr>'
    }
  }

  // Update User Pagination UI
  function updateUserPagination() {
    const { currentPage, totalPages, count, next, previous } = window.adminApi.users.pagination

    console.log(
      `Updating user pagination UI: Page ${currentPage} of ${totalPages} (Total: ${count}, Next: ${next ? "Yes" : "No"}, Previous: ${previous ? "Yes" : "No"})`,
    )

    // Ensure we display valid pagination information
    userPaginationInfo.textContent = `Page ${currentPage} of ${totalPages}`
    userPrevBtn.disabled = !previous
    userNextBtn.disabled = !next
  }

  // Update History Pagination UI
  function updateHistoryPagination() {
    const { currentPage, totalPages, count, next, previous } = window.adminApi.histories.pagination

    console.log(
      `Updating history pagination UI: Page ${currentPage} of ${totalPages} (Total: ${count}, Next: ${next ? "Yes" : "No"}, Previous: ${previous ? "Yes" : "No"})`,
    )

    // Ensure we display valid pagination information
    historyPaginationInfo.textContent = `Page ${currentPage} of ${totalPages}`
    historyPrevBtn.disabled = !previous
    historyNextBtn.disabled = !next
  }

  // Populate User Filter Dropdown
  async function populateUserFilter() {
    try {
      // Get all users for the filter - increase to get more users
      const data = await window.adminApi.users.fetch(1, 1000) // Get up to 1000 users for the filter

      if (!data) return

      // Clear existing options except the "All Users" option in the filter dropdown
      while (userFilter.options.length > 1) {
        userFilter.remove(1)
      }

      // Clear all options in the history edit modal dropdown
      if (historyUser) {
        while (historyUser.options.length > 0) {
          historyUser.remove(0)
        }
      }

      // Add user options
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((user) => {
          // For the filter dropdown
          const option = document.createElement("option")
          option.value = user.id
          option.textContent = user.username
          userFilter.appendChild(option)

          // For the history edit modal dropdown
          if (historyUser) {
            const modalOption = document.createElement("option")
            modalOption.value = user.id
            modalOption.textContent = user.username
            historyUser.appendChild(modalOption)
          }
        })

        console.log(`Populated user dropdowns with ${data.results.length} users`)
      } else {
        console.error("Invalid user data format:", data)
      }
    } catch (error) {
      console.error("Error populating user filter:", error)
    }
  }

  // Populate users table
  function populateUsersTable(users) {
    usersTableBody.innerHTML = ""

    if (!users || users.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>'
      return
    }

    users.forEach((user) => {
      const row = document.createElement("tr")

      // Set status class
      let statusClass = ""
      switch (user.status) {
        case "active":
          statusClass = "status-active"
          break
        case "inactive":
          statusClass = "status-inactive"
          break
        case "suspended":
          statusClass = "status-suspended"
          break
      }

      // Xử lý URL avatar với Cloudinary
      let avatarUrl = "/placeholder.svg?height=40&width=40"
      if (user.avatar) {
        // Kiểm tra xem URL đã có tiền tố Cloudinary chưa
        if (!user.avatar.startsWith("https://")) {
          avatarUrl = `https://res.cloudinary.com/dbqoymyi8/${user.avatar}`
        } else {
          avatarUrl = user.avatar
        }
      }

      row.innerHTML = `
      <td>${user.id}</td>
      <td><img src="${avatarUrl}" alt="Avatar" class="user-avatar-small"></td>
      <td>${user.username}</td>
      <td>${user.full_name || ""}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td><span class="status-badge ${statusClass}">${user.status}</span></td>
      <td class="actions-cell">
          <button class="action-icon edit-user" data-id="${user.id}">
              <i class="fas fa-edit"></i>
          </button>
          <button class="action-icon delete-user" data-id="${user.id}" data-name="${user.username}">
              <i class="fas fa-trash"></i>
          </button>
      </td>
    `

      usersTableBody.appendChild(row)
    })

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-user").forEach((btn) => {
      btn.addEventListener("click", function () {
        const userId = this.dataset.id
        openEditUserModal(userId)
      })
    })

    document.querySelectorAll(".delete-user").forEach((btn) => {
      btn.addEventListener("click", function () {
        const userId = this.dataset.id
        const username = this.dataset.name
        openDeleteUserModal(userId, username)
      })
    })
  }
  // Populate history table
  function populateHistoryTable(histories) {
    historyTableBodyAdmin.innerHTML = ""

    if (!histories || histories.length === 0) {
      historyTableBodyAdmin.innerHTML = '<tr><td colspan="6" class="text-center">No history records found</td></tr>'
      return
    }

    histories.forEach((item) => {
      const row = document.createElement("tr")

      // Format date
      const date = new Date(item.created_at)
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`

      // Truncate result for preview
      const truncatedResult = item.result.length > 40 ? item.result.substring(0, 40) + "..." : item.result

      // Xử lý URL ảnh với Cloudinary
      let imageUrl = "/placeholder.svg?height=40&width=40"
      if (item.image) {
        // Kiểm tra xem URL đã có tiền tố Cloudinary chưa
        if (!item.image.startsWith("https://")) {
          imageUrl = `https://res.cloudinary.com/dbqoymyi8/${item.image}`
        } else {
          imageUrl = item.image
        }
      }

      // Lấy username từ đối tượng user
      let username = "Unknown User"
      let userId = ""
      if (item.id_user) {
        if (typeof item.id_user === "object" && item.id_user.username) {
          username = item.id_user.username
          userId = item.id_user.id
        } else if (typeof item.id_user === "string" || typeof item.id_user === "number") {
          // Nếu chỉ có ID, hiển thị ID (nhưng không nên xảy ra với API đã được cập nhật)
          username = `User #${item.id_user}`
          userId = item.id_user
        }
      }

      row.innerHTML = `
      <td>${item.id}</td>
      <td>${username}</td>
      <td><img src="${imageUrl}" alt="Preview" class="history-thumbnail"></td>
      <td>${truncatedResult}</td>
      <td>${formattedDate}</td>
      <td class="actions-cell">
          <button class="action-icon edit-history" data-id="${item.id}" data-user-id="${userId}">
              <i class="fas fa-edit"></i>
          </button>
          <a href="history-detail/?id=${item.id}" class="action-icon">
              <i class="fas fa-eye"></i>
          </a>
          <button class="action-icon delete-history" data-id="${item.id}">
              <i class="fas fa-trash"></i>
          </button>
      </td>
    `

      historyTableBodyAdmin.appendChild(row)
    })

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-history").forEach((btn) => {
      btn.addEventListener("click", function () {
        const historyId = this.dataset.id
        const userId = this.dataset.userId
        openEditHistoryModal(historyId, userId)
      })
    })

    document.querySelectorAll(".delete-history").forEach((btn) => {
      btn.addEventListener("click", function () {
        const historyId = this.dataset.id
        openDeleteHistoryModal(historyId)
      })
    })
  }
  // Initial data loading
  loadUsers()
  populateUserFilter()

  // Open add user modal
  addUserBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add User"
    userId.value = ""
    userForm.reset()
    userModal.style.display = "block"
  })

  // Open edit user modal
  async function openEditUserModal(id) {
    try {
      const user = await window.adminApi.users.fetchById(id)

      if (user) {
        modalTitle.textContent = "Edit User"
        userId.value = user.id
        userUsername.value = user.username
        userFullName.value = user.full_name || ""
        userEmail.value = user.email
        userPassword.value = "" // Don't populate password
        userRole.value = user.role
        userStatus.value = user.status

        userModal.style.display = "block"
      }
    } catch (error) {
      console.error("Error opening edit user modal:", error)
    }
  }

  // Open edit history modal
  async function openEditHistoryModal(id, presetUserId = null) {
    try {
      const record = await window.adminApi.histories.fetchById(id)
      console.log("History record loaded:", record) // Debug log

      if (record) {
        historyModalTitle.textContent = "Edit Recognition Record"
        historyId.value = record.id

        // First, make sure we have users in the dropdown
        await populateUserFilter()

        // Debug log for user dropdown
        console.log(
          "User dropdown options:",
          Array.from(historyUser.options).map((opt) => ({ value: opt.value, text: opt.text })),
        )

        // Set user ID correctly based on the response format or preset value
        let userId = presetUserId

        if (!userId && record.id_user) {
          console.log("User data in record:", record.id_user) // Debug log

          if (typeof record.id_user === "object" && record.id_user.id) {
            userId = record.id_user.id
          } else {
            userId = record.id_user
          }
        }

        if (userId) {
          console.log("Setting user dropdown to:", userId) // Debug log
          historyUser.value = userId

          // If the value wasn't set (option might not exist), create it
          if (historyUser.value != userId) {
            const newOption = document.createElement("option")
            newOption.value = userId
            newOption.textContent =
              typeof record.id_user === "object" && record.id_user.username
                ? record.id_user.username
                : `User #${userId}`
            historyUser.appendChild(newOption)
            historyUser.value = userId
          }
        }

        // Handle image URL with Cloudinary
        let imageUrl = "/placeholder.svg?height=200&width=300"
        if (record.image) {
          // Check if URL already has Cloudinary prefix
          if (!record.image.startsWith("https://")) {
            imageUrl = `https://res.cloudinary.com/dbqoymyi8/${record.image}`
          } else {
            imageUrl = record.image
          }
        }
        historyImagePreview.src = imageUrl

        historyResult.value = record.result || ""

        // Format date for datetime-local input
        const date = new Date(record.created_at)
        const formattedDate = date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
        historyDate.value = formattedDate

        historyModal.style.display = "block"
      }
    } catch (error) {
      console.error("Error opening edit history modal:", error)
      alert("Failed to load history details. Please try again.")
    }
  }
  // Open delete user modal
  function openDeleteUserModal(id, username) {
    deleteMessage.textContent = `Are you sure you want to delete user "${username}"?`

    confirmDelete.onclick = async () => {
      try {
        const success = await window.adminApi.users.delete(id)

        if (success) {
          // Reload users after deletion
          loadUsers(window.adminApi.users.pagination.currentPage)
          deleteModal.style.display = "none"
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }

    deleteModal.style.display = "block"
  }

  // Open delete history modal
  function openDeleteHistoryModal(id) {
    deleteMessage.textContent = `Are you sure you want to delete this recognition record?`

    confirmDelete.onclick = async () => {
      try {
        const success = await window.adminApi.histories.delete(id)

        if (success) {
          // Reload histories after deletion
          loadHistories(
            window.adminApi.histories.pagination.currentPage,
            historySearchInput.value,
            userFilter.value,
            dateFilterAdmin.value,
          )
          deleteModal.style.display = "none"
        }
      } catch (error) {
        console.error("Error deleting history:", error)
      }
    }

    deleteModal.style.display = "block"
  }

  // Close user modal
  closeModal.addEventListener("click", () => {
    userModal.style.display = "none"
  })

  cancelUserForm.addEventListener("click", () => {
    userModal.style.display = "none"
  })

  // Close history modal
  closeHistoryModal.addEventListener("click", () => {
    historyModal.style.display = "none"
  })

  cancelHistoryForm.addEventListener("click", () => {
    historyModal.style.display = "none"
  })

  // Close delete modal
  closeDeleteModal.addEventListener("click", () => {
    deleteModal.style.display = "none"
  })

  cancelDelete.addEventListener("click", () => {
    deleteModal.style.display = "none"
  })

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === userModal) {
      userModal.style.display = "none"
    }
    if (event.target === historyModal) {
      historyModal.style.display = "none"
    }
    if (event.target === deleteModal) {
      deleteModal.style.display = "none"
    }
  })

  // Handle user form submission
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = {
      username: userUsername.value,
      full_name: userFullName.value,
      email: userEmail.value,
      role: userRole.value,
      status: userStatus.value,
    }

    // Only include password if it's provided (for new users or password changes)
    if (userPassword.value) {
      formData.password = userPassword.value
    }

    try {
      if (userId.value) {
        // Update existing user
        await window.adminApi.users.update(userId.value, formData)
      } else {
        // Add new user (password is required for new users)
        if (!userPassword.value) {
          alert("Password is required for new users")
          return
        }
        await window.adminApi.users.create(formData)
      }

      // Reload users after successful operation
      loadUsers(window.adminApi.users.pagination.currentPage)
      userModal.style.display = "none"
    } catch (error) {
      console.error("Error saving user:", error)
    }
  })
  // Handle history form submission
  historyForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = {
      id_user: historyUser.value,
      result: historyResult.value,
      // We don't update the image through this form
    }

    // Convert the date to ISO format
    if (historyDate.value) {
      const date = new Date(historyDate.value)
      formData.created_at = date.toISOString()
    }

    try {
      await window.adminApi.histories.update(historyId.value, formData)

      // Reload histories after successful operation
      loadHistories(
        window.adminApi.histories.pagination.currentPage,
        historySearchInput.value,
        userFilter.value,
        dateFilterAdmin.value,
      )
      historyModal.style.display = "none"
    } catch (error) {
      console.error("Error saving history:", error)
    }
  })

  // User pagination - Direct event handlers with proper function binding
  userPrevBtn.onclick = () => {
    const prevUrl = window.adminApi.users.pagination.previous
    if (prevUrl) {
      console.log("Navigating to previous page:", prevUrl)
      window.location.href = prevUrl
    }
  }

  userNextBtn.onclick = () => {
    const nextUrl = window.adminApi.users.pagination.next
    if (nextUrl) {
      console.log("Navigating to next page:", nextUrl)
      window.location.href = nextUrl
    }
  }

  // History pagination - Direct URL navigation
  historyPrevBtn.onclick = () => {
    const prevUrl = window.adminApi.histories.pagination.previous
    if (prevUrl) {
      console.log("Navigating to previous page:", prevUrl)
      window.location.href = prevUrl
    }
  }

  historyNextBtn.onclick = () => {
    const nextUrl = window.adminApi.histories.pagination.next
    if (nextUrl) {
      console.log("Navigating to next page:", nextUrl)
      window.location.href = nextUrl
    }
  }

  // Search functionality
  userSearchBtn.addEventListener("click", () => {
    loadUsers(1, userSearchInput.value)
  })

  userSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadUsers(1, userSearchInput.value)
    }
  })

  historySearchBtn.addEventListener("click", () => {
    loadHistories(1, historySearchInput.value, userFilter.value, dateFilterAdmin.value)
  })

  historySearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadHistories(1, historySearchInput.value, userFilter.value, dateFilterAdmin.value)
    }
  })

  // Filter history by user
  userFilter.addEventListener("change", function () {
    loadHistories(1, historySearchInput.value, this.value, dateFilterAdmin.value)
  })

  // Filter history by date
  dateFilterAdmin.addEventListener("change", function () {
    loadHistories(1, historySearchInput.value, userFilter.value, this.value)
  })
})
