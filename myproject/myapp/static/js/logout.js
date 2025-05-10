// Add event listener when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find the logout link
    const logoutLink = document.getElementById('logout-btn');

    if (logoutLink) {
        // Add click event listener
        logoutLink.addEventListener('click', function(event) {
            // Prevent the default anchor behavior (navigation)
            event.preventDefault();

            // Call the logout function
            logout();
        });
    }
});

// Logout function
async function logout() {
    try {
        // Get CSRF token first
        const csrfResponse = await fetch('/api/csrf-token/');
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;

        // Show loading indicator (optional)
        const logoutLink = document.getElementById('logout-btn');
        if (logoutLink) {
            const originalContent = logoutLink.innerHTML;
            logoutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';

        // Send logout request
        const response = await fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            // Logout successful
            console.log('Logout successful:', result);

            // Redirect to login page
            window.location.href = '/login/';
        } else {
            // Logout failed
            console.error('Logout failed:', result);
            alert(result.message || 'Logout failed. Please try again.');

            // Reset the button content if logout failed
            if (logoutLink) {
                logoutLink.innerHTML = originalContent;
            }
        }
    }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout. Please try again.');

        // Reset the button content if there was an error
        const logoutLink = document.getElementById('logout-btn');
        if (logoutLink) {
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        }
    }
}