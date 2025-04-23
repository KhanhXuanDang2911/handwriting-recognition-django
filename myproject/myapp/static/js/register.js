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

    // Password strength meter
    const strengthMeter = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');

    if (passwordInput && strengthMeter && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);

            // Update strength meter
            strengthMeter.setAttribute('data-strength', strength);

            // Update strength text
            const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
            const strengthClasses = ['weak', 'weak', 'fair', 'strong', 'very-strong'];

            strengthText.textContent = strengthLabels[strength];

            // Remove all classes
            strengthText.className = '';
            // Add appropriate class
            strengthText.classList.add(strengthClasses[strength]);
        });
    }

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;

        // Length check
        if (password.length >= 8) {
            strength += 1;
        }

        // Contains lowercase letters
        if (/[a-z]/.test(password)) {
            strength += 1;
        }

        // Contains uppercase letters
        if (/[A-Z]/.test(password)) {
            strength += 1;
        }

        // Contains numbers
        if (/[0-9]/.test(password)) {
            strength += 1;
        }

        // Contains special characters
        if (/[^a-zA-Z0-9]/.test(password)) {
            strength += 1;
        }

        return Math.min(Math.floor(strength / 1.25), 4);
    }

    // Form validation
    const signupForm = document.getElementById('signupForm');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Check if passwords match
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert('Passwords do not match!');
                return;
            }

            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = passwordInput.value;
            const terms = document.getElementById('terms').checked;

            // Validate terms
            if (!terms) {
                alert('You must agree to the Terms of Service and Privacy Policy');
                return;
            }

            // Simulate registration - In a real app, you would send these to your server
            console.log('Registration attempt:', { fullName, email, username, password, terms });

            // Show loading state
            const signupBtn = document.querySelector('.signup-btn');
            const originalContent = signupBtn.innerHTML;

            signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            signupBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // For demo purposes, redirect to login.html after "registration"
                window.location.href = 'login.html';

                // In case the redirect fails, reset the button
                signupBtn.innerHTML = originalContent;
                signupBtn.disabled = false;
            }, 2000);
        });
    }

    // Social signup buttons
    const socialButtons = document.querySelectorAll('.social-btn');

    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList[1]; // google, facebook, etc.
            console.log(`Attempting to sign up with ${provider}`);

            // In a real app, you would implement OAuth flow here
            alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup would happen here.`);
        });
    });
});