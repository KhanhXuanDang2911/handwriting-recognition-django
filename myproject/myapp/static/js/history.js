document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const avatar = document.getElementById("avatar");
  const dropdown = document.getElementById("dropdown");
  const historyTableBody = document.getElementById("historyTableBody");
  const logoutBtn = document.getElementById("logout");
  const dateFilter = document.getElementById("dateFilter");

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

  // Sample history data (in a real app, this would come from a database)
  const historyData = [
    {
      id: 1,
      imageUrl: "placeholder.svg?height=50&width=50",
      result: "The quick brown fox jumps over the lazy dog.",
      date: "2023-11-15T14:30:00",
      fullResult:
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
    },
    {
      id: 2,
      imageUrl: "placeholder.svg?height=50&width=50",
      result: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      date: "2023-11-14T10:15:00",
      fullResult:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 3,
      imageUrl: "placeholder.svg?height=50&width=50",
      result:
        "Artificial intelligence (AI) is intelligence demonstrated by machines.",
      date: "2023-11-13T16:45:00",
      fullResult:
        "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans.",
    },
    {
      id: 4,
      imageUrl: "placeholder.svg?height=50&width=50",
      result:
        "Text recognition technology, also known as Optical Character Recognition (OCR).",
      date: "2023-11-12T09:20:00",
      fullResult:
        "Text recognition technology, also known as Optical Character Recognition (OCR), converts different types of documents, such as scanned paper documents, PDF files or images into editable and searchable data.",
    },
    {
      id: 5,
      imageUrl: "placeholder.svg?height=50&width=50",
      result:
        "The development of mobile applications involves creating software applications.",
      date: "2023-11-11T13:10:00",
      fullResult:
        "The development of mobile applications involves creating software applications that run on mobile devices. These applications can be pre-installed or downloaded and installed by the user later.",
    },
  ];

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
  // Populate history table
  function populateHistoryTable(data) {
    historyTableBody.innerHTML = "";

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
        item.result.length > 50
          ? item.result.substring(0, 50) + "..."
          : item.result;

      row.innerHTML = `
                <td>${item.id}</td>
                <td><img src="${item.imageUrl}" alt="Preview" class="history-thumbnail"></td>
                <td>${truncatedResult}</td>
                <td>${formattedDate}</td>
                <td>
                    <a href="/history-detail/?id=${item.id}" class="view-btn">
                        <i class="fas fa-eye"></i> View
                    </a>
                </td>
            `;

      historyTableBody.appendChild(row);
    });
  }

  // Initial population of the table
  populateHistoryTable(historyData);

  // Filter by date
  dateFilter.addEventListener("change", function () {
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
