document.addEventListener('DOMContentLoaded', function() {
    // Get CSRF token first
    let csrfToken = '';

    // Function to get CSRF token
    async function getCsrfToken() {
        try {
            // Get the CSRF token from the cookie
            csrfToken = getCookie('csrftoken');

            // If no token in cookie, fetch it from the server
            if (!csrfToken) {
                const response = await fetch('/api/csrf-token/');
                const data = await response.json();
                csrfToken = data.csrfToken;
            }

            console.log('CSRF token obtained');
        } catch (error) {
            console.error('Error getting CSRF token:', error);
        }
    }

    // Helper function to get cookie value
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Call this when the page loads
    getCsrfToken();

    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle eye icon
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const emailOrUsername = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const originalContent = loginBtn.innerHTML;

            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            loginBtn.disabled = true;

            try {
                // Determine if input is email or username
                const isEmail = emailOrUsername.includes('@');

                // Prepare request data
                const requestData = {
                    password,
                    remember
                };

                // Set either email or username based on input
                if (isEmail) {
                    requestData.email = emailOrUsername;
                } else {
                    requestData.username = emailOrUsername;
                }

                // Make sure we have a CSRF token
                if (!csrfToken) {
                    await getCsrfToken();
                }

                // Send login request to API
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(requestData),
                    credentials: 'include' // Important for cookies/session
                });

                const result = await response.json();

                if (response.ok) {
                    // Login successful
                    console.log('Login successful:', result);

                    // Redirect to home page
                    window.location.href = '/home/';
                } else {
                    // Login failed
                    console.error('Login failed:', result);

                    // Show error message
                    alert(result.message || 'Login failed. Please check your credentials.');

                    // Reset button
                    loginBtn.innerHTML = originalContent;
                    loginBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again.');

                // Reset button
                loginBtn.innerHTML = originalContent;
                loginBtn.disabled = false;
            }
        });
    }

    // Social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');

    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList[1]; // google, facebook, etc.
            console.log(`Attempting to login with ${provider}`);

            // In a real app, you would implement OAuth flow here
            alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would happen here.`);
        });
    });
});