document.addEventListener('DOMContentLoaded', function() {
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
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Simulate login - In a real app, you would send these to your server
            console.log('Login attempt:', { email, password, remember });

            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const originalContent = loginBtn.innerHTML;

            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            loginBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // For demo purposes, redirect to index.html after "login"
                window.location.href = 'index.html';

                // In case the redirect fails, reset the button
                loginBtn.innerHTML = originalContent;
                loginBtn.disabled = false;
            }, 1500);
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