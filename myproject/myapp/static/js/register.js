document.addEventListener("DOMContentLoaded", () => {
  console.log("Register page loaded") // Debug log

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

  // Password strength meter
  const strengthMeter = document.querySelector(".strength-meter-fill")
  const strengthText = document.querySelector(".strength-text span")

  if (passwordInput && strengthMeter && strengthText) {
    passwordInput.addEventListener("input", function () {
      const password = this.value
      const strength = calculatePasswordStrength(password)

      // Update strength meter
      strengthMeter.setAttribute("data-strength", strength)

      // Update strength text
      const strengthLabels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"]
      const strengthClasses = ["weak", "weak", "fair", "strong", "very-strong"]

      strengthText.textContent = strengthLabels[strength]

      // Remove all classes
      strengthText.className = ""
      // Add appropriate class
      strengthText.classList.add(strengthClasses[strength])
    })
  }

  // Calculate password strength
  function calculatePasswordStrength(password) {
    let strength = 0

    // Length check
    if (password.length >= 8) {
      strength += 1
    }

    // Contains lowercase letters
    if (/[a-z]/.test(password)) {
      strength += 1
    }

    // Contains uppercase letters
    if (/[A-Z]/.test(password)) {
      strength += 1
    }

    // Contains numbers
    if (/[0-9]/.test(password)) {
      strength += 1
    }

    // Contains special characters
    if (/[^a-zA-Z0-9]/.test(password)) {
      strength += 1
    }

    return Math.min(Math.floor(strength / 1.25), 4)
  }

  // Form validation
  const signupForm = document.getElementById("signupForm")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Form submitted") // Debug log

      // Check if passwords match
      if (passwordInput.value !== confirmPasswordInput.value) {
        console.log("Passwords don't match") // Debug log
        alert("Passwords do not match!")
        return
      }

      // Get form values
      const full_name = document.getElementById("fullName").value
      const email = document.getElementById("email").value
      const username = document.getElementById("username").value
      const password = passwordInput.value
      const terms = document.getElementById("terms").checked

      // Validate terms
      if (!terms) {
        console.log("Terms not accepted") // Debug log
        alert("You must agree to the Terms of Service and Privacy Policy")
        return
      }

      // Show loading state
      const signupBtn = document.querySelector(".signup-btn")
      const originalContent = signupBtn.innerHTML

      signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...'
      signupBtn.disabled = true

      try {
        console.log("Sending registration request") // Debug log

        // Gọi API đăng ký
        const response = await fetch("/users/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            full_name,
            email,
          }),
        })

        const result = await response.json()
        console.log("Registration response:", result) // Debug log

        if (response.ok && result.success) {
          // Đăng ký thành công
          console.log("Registration successful") // Debug log

          // Show success message with alert as fallback
          alert("Account created successfully! Redirecting to login...")

          // Chuyển hướng đến trang đăng nhập
          console.log("Redirecting to login page in 2 seconds") // Debug log
          setTimeout(() => {
            window.location.href = "/login/"
          }, 2000)
        } else {
          // Đăng ký thất bại
          let errorMessage = result.message || "Registration failed. Please try again."

          // Check if there are specific field errors
          if (result.errors) {
            const errorFields = Object.keys(result.errors)
            if (errorFields.length > 0) {
              // Display the first error message
              const firstErrorField = errorFields[0]
              errorMessage = result.errors[firstErrorField][0] || errorMessage
            }
          }

          console.log("Registration failed:", errorMessage) // Debug log
          alert(errorMessage)

          // Reset button
          signupBtn.innerHTML = originalContent
          signupBtn.disabled = false
        }
      } catch (error) {
        console.error("Error during registration:", error)
        alert("An error occurred during registration. Please try again.")

        // Reset button
        signupBtn.innerHTML = originalContent
        signupBtn.disabled = false
      }
    })
  }

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng về trang chủ
  if (window.Auth && window.Auth.isAuthenticated()) {
    window.location.href = "/home/"
  }
})
