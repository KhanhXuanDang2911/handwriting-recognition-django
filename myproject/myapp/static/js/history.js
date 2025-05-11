document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const avatar = document.getElementById("avatar");
    const dropdown = document.getElementById("dropdown");
    const historyTableBody = document.getElementById("historyTableBody");
    const dateFilter = document.getElementById("dateFilter");
    const searchBox = document.querySelector(".search-box input");
    const searchButton = document.querySelector(".search-box button");
    const paginationPrev = document.querySelector(".pagination-btn:first-child");
    const paginationNext = document.querySelector(".pagination-btn:last-child");
    const paginationInfo = document.querySelector(".pagination-info");

    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let pageSize = 10;

    // Toggle dropdown menu
    if (avatar) {
        avatar.addEventListener("click", function () {
            dropdown.classList.toggle("active");
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }
    });

    // Check authentication status
    function checkAuth() {
        if (!window.Auth || !window.Auth.isAuthenticated()) {
            // Redirect to login page if not authenticated
            window.location.href = "/login/";
            return false;
        }
        return true;
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }

    // Truncate text for display
    function truncateText(text, maxLength = 50) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        }
        return text;
    }

    // Fetch history data from API
    async function fetchHistoryData() {
        if (!checkAuth()) return;

        try {
            // Show loading state
            historyTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p style="margin-top: 1rem; color: var(--text-light);">Loading history data...</p>
          </td>
        </tr>
      `;

            // Get user data from Auth
            const userData = window.Auth.getUserData();
            if (!userData || !userData.id) {
                throw new Error("User data not found");
            }

            // Build query parameters
            const params = new URLSearchParams();
            params.append("user_id", userData.id);
            params.append("page", currentPage);
            params.append("page_size", pageSize);

            // Add date filter if selected
            const filterValue = dateFilter.value;
            if (filterValue !== "all") {
                const now = new Date();
                let filterDate;

                switch (filterValue) {
                    case "today":
                        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case "week": {
                        const dayOfWeek = now.getDay(); // 0 (CN) -> 6 (T7)
                        const diffToMonday = (dayOfWeek + 6) % 7; // Chuyển CN = 6, T2 = 0, ...
                        const monday = new Date(now);
                        monday.setDate(now.getDate() - diffToMonday);
                        monday.setHours(0, 0, 0, 0);

                        const sunday = new Date(monday);
                        sunday.setDate(monday.getDate() + 6);
                        sunday.setHours(23, 59, 59, 999);

                        params.append("created_at__gte", monday.toISOString());
                        params.append("created_at__lte", sunday.toISOString());
                        break;
                    }

                    case "month":
                        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }

                if (filterDate) {
                    params.append("created_at__gte", filterDate.toISOString());
                }
            }

            // Add search term if provided
            const searchTerm = searchBox.value.trim();
            if (searchTerm) {
                params.append("search", searchTerm);
            }

            // Fetch data from API
            const response = await fetch(`/histories/by_user/?${params.toString()}`, {
                method: "GET",
                headers: window.Auth.getAuthHeaders(),
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                // Update pagination info
                if (result.data.count !== undefined) {
                    totalPages = Math.ceil(result.data.count / pageSize);
                    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

                    // Update pagination buttons
                    paginationPrev.disabled = currentPage <= 1;
                    paginationNext.disabled = currentPage >= totalPages;
                }

                // Populate table with data
                populateHistoryTable(result.data.results || result.data);
            } else {
                throw new Error(result.message || "Failed to fetch history data");
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            historyTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--danger);">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
            <p style="margin-top: 1rem;">Error loading history data. ${error.message}</p>
          </td>
        </tr>
      `;

            // Show notification if available
            if (window.showNotification) {
                window.showNotification("Failed to load history data", "error");
            }
        }
    }

    // Populate history table with data
    function populateHistoryTable(data) {
        if (!data || data.length === 0) {
            historyTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem;">
            <i class="fas fa-history" style="font-size: 2rem; color: var(--text-light);"></i>
            <p style="margin-top: 1rem; color: var(--text-light);">No history records found</p>
          </td>
        </tr>
      `;
            return;
        }

        historyTableBody.innerHTML = "";

        data.forEach((item, index) => {
            const row = document.createElement("tr");

            // Calculate the actual item number based on pagination
            const itemNumber = (currentPage - 1) * pageSize + index + 1;

            // Get image URL - handle both full URLs and Cloudinary paths
            let imageUrl = item.image || "placeholder.svg?height=50&width=50";
            if (imageUrl && imageUrl.startsWith('image/upload')) {
                imageUrl = 'https://res.cloudinary.com/dbqoymyi8/' + imageUrl;
            }

            // Format date
            const formattedDate = formatDate(item.created_at);

            // Truncate result for preview
            const truncatedResult = truncateText(item.result);

            row.innerHTML = `
        <td>${itemNumber}</td>
        <td><img src="${imageUrl}" alt="Preview" class="history-thumbnail"></td>
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

    // Event listeners for filters and pagination
    dateFilter.addEventListener("change", function () {
        currentPage = 1; // Reset to first page when filter changes
        fetchHistoryData();
    });

    searchButton.addEventListener("click", function (e) {
        e.preventDefault();
        currentPage = 1; // Reset to first page when searching
        fetchHistoryData();
    });

    // Allow search on Enter key
    searchBox.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            currentPage = 1;
            fetchHistoryData();
        }
    });

    // Pagination controls
    paginationPrev.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            fetchHistoryData();
        }
    });

    paginationNext.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;
            fetchHistoryData();
        }
    });

    // Initial data fetch
    fetchHistoryData();

    // Fetch user avatar
    if (window.Auth) {
        window.Auth.fetchUserProfile();
    }
});