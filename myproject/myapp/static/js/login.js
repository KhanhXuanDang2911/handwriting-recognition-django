document.addEventListener("DOMContentLoaded", () => {
  console.log("Login page loaded") // Debug log

  // Toggle password visibility
  const togglePassword = document.querySelector(".toggle-password")
  const passwordInput = document.querySelector("#password")

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      // Toggle eye icon
      const eyeIcon = this.querySelector("i")
      eyeIcon.classList.toggle("fa-eye")
      eyeIcon.classList.toggle("fa-eye-slash")
    })
  }

  // Form submission
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Login form submitted") // Debug log

      // Get form values
      const username = document.getElementById("email").value
      const password = document.getElementById("password").value
      const remember = document.getElementById("remember").checked

      // Show loading state
      const loginBtn = document.querySelector(".login-btn")
      const originalContent = loginBtn.innerHTML

      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...'
      loginBtn.disabled = true

      try {
        console.log("Sending login request") // Debug log

        // Send login request to API
        const response = await fetch("/auth/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        const result = await response.json()
        console.log("Login response:", result) // Debug log

        if (response.ok && result.status === 'success') {
          // Login successful
          console.log("Login successful") // Debug log

          // Lưu token và thông tin user
          if (window.Auth) {
            window.Auth.saveAuthData(result.data.token, result.data.user)
          }

          // Hiển thị thông báo thành công
          alert("Login successful")

          // Redirect to home page
          console.log("Redirecting to home page in 1 second") // Debug log
          setTimeout(() => {
            window.location.href = "/home/"
          }, 1000)
        } else {
          // Login failed
          console.error("Login failed:", result) // Debug log

          // Show error message
          alert(result.message || "Login failed. Please check your credentials.")

          // Reset button
          loginBtn.innerHTML = originalContent
          loginBtn.disabled = false
        }
      } catch (error) {
        console.error("Error during login:", error)
        alert("An error occurred during login. Please try again.")

        // Reset button
        loginBtn.innerHTML = originalContent
        loginBtn.disabled = false
      }
    })
  }

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng về trang chủ
  if (window.Auth && window.Auth.isAuthenticated()) {
    window.location.href = "/home/"
  }
})
