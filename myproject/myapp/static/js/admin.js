document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const avatar = document.getElementById("avatar");
  const dropdown = document.getElementById("dropdown");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const usersTableBody = document.getElementById("usersTableBody");
  const historyTableBodyAdmin = document.getElementById(
    "historyTableBodyAdmin"
  );
  const addUserBtn = document.getElementById("addUserBtn");
  const userModal = document.getElementById("userModal");
  const closeModal = document.getElementById("closeModal");
  const cancelUserForm = document.getElementById("cancelUserForm");
  const userForm = document.getElementById("userForm");
  const modalTitle = document.getElementById("modalTitle");
  const userId = document.getElementById("userId");
  const userUsername = document.getElementById("userUsername");
  const userEmail = document.getElementById("userEmail");
  const userPassword = document.getElementById("userPassword");
  const userRole = document.getElementById("userRole");
  const userStatus = document.getElementById("userStatus");
  const deleteModal = document.getElementById("deleteModal");
  const closeDeleteModal = document.getElementById("closeDeleteModal");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");
  const deleteMessage = document.getElementById("deleteMessage");
  const logoutBtn = document.getElementById("logout");
  const userFilter = document.getElementById("userFilter");
  const dateFilterAdmin = document.getElementById("dateFilterAdmin");

  // Toggle dropdown menu
  avatar.addEventListener("click", function () {
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.dataset.tab;

      // Update active tab button
      tabBtns.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Update active tab content
      tabContents.forEach((content) => content.classList.remove("active"));
      document.getElementById(tabId + "Tab").classList.add("active");
    });
  });

  // Sample users data (in a real app, this would come from a database)
  const usersData = [
    {
      id: 1,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: "johndoe123",
      email: "john.doe@example.com",
      role: "admin",
      status: "active",
    },
    {
      id: 2,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: "janesmith",
      email: "jane.smith@example.com",
      role: "user",
      status: "active",
    },
    {
      id: 3,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: "robertjohnson",
      email: "robert.johnson@example.com",
      role: "user",
      status: "inactive",
    },
    {
      id: 4,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: "sarahwilliams",
      email: "sarah.williams@example.com",
      role: "user",
      status: "suspended",
    },
    {
      id: 5,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: "michaelbrown",
      email: "michael.brown@example.com",
      role: "user",
      status: "active",
    },
  ];

  // Sample history data (in a real app, this would come from a database)
  const historyData = [
    {
      id: 1,
      userId: 1,
      username: "johndoe123",
      imageUrl: "placeholder.svg?height=40&width=40",
      result: "The quick brown fox jumps over the lazy dog.",
      date: "2023-11-15T14:30:00",
    },
    {
      id: 2,
      userId: 2,
      username: "janesmith",
      imageUrl: "placeholder.svg?height=40&width=40",
      result: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      date: "2023-11-14T10:15:00",
    },
    {
      id: 3,
      userId: 1,
      username: "johndoe123",
      imageUrl: "placeholder.svg?height=40&width=40",
      result:
        "Artificial intelligence (AI) is intelligence demonstrated by machines.",
      date: "2023-11-13T16:45:00",
    },
    {
      id: 4,
      userId: 3,
      username: "robertjohnson",
      imageUrl: "placeholder.svg?height=40&width=40",
      result:
        "Text recognition technology, also known as Optical Character Recognition (OCR).",
      date: "2023-11-12T09:20:00",
    },
    {
      id: 5,
      userId: 2,
      username: "janesmith",
      imageUrl: "placeholder.svg?height=40&width=40",
      result:
        "The development of mobile applications involves creating software applications.",
      date: "2023-11-11T13:10:00",
    },
  ];

  // Populate users table
  function populateUsersTable(data) {
    usersTableBody.innerHTML = "";

    data.forEach((user) => {
      const row = document.createElement("tr");

      // Set status class
      let statusClass = "";
      switch (user.status) {
        case "active":
          statusClass = "status-active";
          break;
        case "inactive":
          statusClass = "status-inactive";
          break;
        case "suspended":
          statusClass = "status-suspended";
          break;
      }

      row.innerHTML = `
                <td>${user.id}</td>
                <td><img src="${user.avatarUrl}" alt="Avatar" class="user-avatar-small"></td>
                <td>${user.username}</td>
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
            `;

      usersTableBody.appendChild(row);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-user").forEach((btn) => {
      btn.addEventListener("click", function () {
        const userId = this.dataset.id;
        openEditUserModal(userId);
      });
    });

    document.querySelectorAll(".delete-user").forEach((btn) => {
      btn.addEventListener("click", function () {
        const userId = this.dataset.id;
        const username = this.dataset.name;
        openDeleteUserModal(userId, username);
      });
    });
  }

  // Populate history table
  function populateHistoryTable(data) {
    historyTableBodyAdmin.innerHTML = "";

    data.forEach((item) => {
      const row = document.createElement("tr");

      // Format date
      const date = new Date(item.date);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      // Truncate result for preview
      const truncatedResult =
        item.result.length > 40
          ? item.result.substring(0, 40) + "..."
          : item.result;

      row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.username}</td>
                <td><img src="${item.imageUrl}" alt="Preview" class="history-thumbnail"></td>
                <td>${truncatedResult}</td>
                <td>${formattedDate}</td>
                <td class="actions-cell">
                    <a href="history-detail.html?id=${item.id}" class="action-icon">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="action-icon delete-history" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

      historyTableBodyAdmin.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-history").forEach((btn) => {
      btn.addEventListener("click", function () {
        const historyId = this.dataset.id;
        openDeleteHistoryModal(historyId);
      });
    });
  }

  // Initial population of the tables
  populateUsersTable(usersData);
  populateHistoryTable(historyData);

  // Open add user modal
  addUserBtn.addEventListener("click", function () {
    modalTitle.textContent = "Add User";
    userId.value = "";
    userForm.reset();
    userModal.style.display = "block";
  });

  // Open edit user modal
  function openEditUserModal(id) {
    const user = usersData.find((user) => user.id === parseInt(id));

    if (user) {
      modalTitle.textContent = "Edit User";
      userId.value = user.id;
      userUsername.value = user.username;
      userEmail.value = user.email;
      userPassword.value = "";
      userRole.value = user.role;
      userStatus.value = user.status;

      userModal.style.display = "block";
    }
  }

  // Open delete user modal
  function openDeleteUserModal(id, username) {
    deleteMessage.textContent = `Are you sure you want to delete user "${username}"?`;

    confirmDelete.onclick = function () {
      // In a real app, you would send a request to delete the user
      console.log(`Deleting user with ID: ${id}`);

      // Remove from the UI
      const updatedUsers = usersData.filter((user) => user.id !== parseInt(id));
      populateUsersTable(updatedUsers);

      deleteModal.style.display = "none";
    };

    deleteModal.style.display = "block";
  }

  // Open delete history modal
  function openDeleteHistoryModal(id) {
    deleteMessage.textContent = `Are you sure you want to delete this recognition record?`;

    confirmDelete.onclick = function () {
      // In a real app, you would send a request to delete the record
      console.log(`Deleting history record with ID: ${id}`);

      // Remove from the UI
      const updatedHistory = historyData.filter(
        (item) => item.id !== parseInt(id)
      );
      populateHistoryTable(updatedHistory);

      deleteModal.style.display = "none";
    };

    deleteModal.style.display = "block";
  }

  // Close modals
  closeModal.addEventListener("click", function () {
    userModal.style.display = "none";
  });

  cancelUserForm.addEventListener("click", function () {
    userModal.style.display = "none";
  });

  closeDeleteModal.addEventListener("click", function () {
    deleteModal.style.display = "none";
  });

  cancelDelete.addEventListener("click", function () {
    deleteModal.style.display = "none";
  });

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === userModal) {
      userModal.style.display = "none";
    }
    if (event.target === deleteModal) {
      deleteModal.style.display = "none";
    }
  });

  // Handle user form submission
  userForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      id: userId.value ? parseInt(userId.value) : usersData.length + 1,
      avatarUrl: "placeholder.svg?height=40&width=40",
      username: userUsername.value,
      email: userEmail.value,
      role: userRole.value,
      status: userStatus.value,
    };

    if (userId.value) {
      // Update existing user
      console.log("Updating user:", formData);

      // In a real app, you would send this data to your server
      // For now, we'll just update the UI
      const updatedUsers = usersData.map((user) =>
        user.id === formData.id ? { ...user, ...formData } : user
      );

      populateUsersTable(updatedUsers);
    } else {
      // Add new user
      console.log("Adding new user:", formData);

      // In a real app, you would send this data to your server
      // For now, we'll just update the UI
      const newUsers = [...usersData, formData];

      populateUsersTable(newUsers);
    }

    userModal.style.display = "none";
  });

  // Filter history by user
  userFilter.addEventListener("change", function () {
    const filterValue = this.value;
    let filteredData = [...historyData];

    if (filterValue !== "all") {
      filteredData = historyData.filter(
        (item) => item.userId === parseInt(filterValue)
      );
    }

    populateHistoryTable(filteredData);
  });

  // Filter history by date
  dateFilterAdmin.addEventListener("change", function () {
    const filterValue = this.value;
    let filteredData = [...historyData];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (filterValue !== "all") {
      filteredData = historyData.filter((item) => {
        const itemDate = new Date(item.date);

        switch (filterValue) {
          case "today":
            return itemDate >= today;
          case "week":
            return itemDate >= weekStart;
          case "month":
            return itemDate >= monthStart;
          default:
            return true;
        }
      });
    }

    populateHistoryTable(filteredData);
  });

  // Logout functionality (simulated)
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    alert("Logout successful");
    // In a real app, this would redirect to login page or perform actual logout
  });
});
