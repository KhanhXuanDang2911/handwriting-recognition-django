// Add event listener when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Find the logout link
  const logoutLink = document.getElementById("logout-btn")

  if (logoutLink) {
    // Add click event listener
    logoutLink.addEventListener("click", (event) => {
      // Prevent the default anchor behavior (navigation)
      event.preventDefault()

      // Call the logout function
      logout()
    })
  }
})

// Logout function
async function logout() {
  try {
    // Show loading indicator
    const logoutLink = document.getElementById("logout-btn")
    let originalContent = ""

    if (logoutLink) {
      originalContent = logoutLink.innerHTML
      logoutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...'
      logoutLink.disabled = true
    }

    // Get auth token
    const token = window.Auth ? window.Auth.getAuthToken() : null

    if (!token) {
      // If no token, just clear local data and redirect
      if (window.Auth) {
        window.Auth.clearAuthData()
      }
      window.location.href = "/login/"
      return
    }

    // Send logout request to the correct endpoint
    const response = await fetch("/auth/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    // Clear auth data regardless of response
    if (window.Auth) {
      window.Auth.clearAuthData()
    }

    if (response.ok && result.success) {
      // Show success notification if available
      if (window.showNotification) {
        window.showNotification(result.message || "Logged out successfully", "success")
      }
    } else {
      console.error("Logout API error:", result)
      // Still show success since we cleared local data
      if (window.showNotification) {
        window.showNotification("Logged out successfully", "success")
      }
    }

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/login/"
    }, 1000)
  } catch (error) {
    console.error("Error during logout:", error)

    // Clear auth data even if there's an error
    if (window.Auth) {
      window.Auth.clearAuthData()
    }

    // Show notification if available
    if (window.showNotification) {
      window.showNotification("Logged out successfully", "success")
    }

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/login/"
    }, 1000)
  }
}
