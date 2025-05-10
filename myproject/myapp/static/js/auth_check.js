// Add this script to your base template to check authentication on every page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/check-auth/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            // User is authenticated
            console.log('User is authenticated:', result.data);

            // You can update UI elements based on authentication status
            const userElements = document.querySelectorAll('.user-authenticated');
            const guestElements = document.querySelectorAll('.guest-only');

            userElements.forEach(el => el.style.display = 'block');
            guestElements.forEach(el => el.style.display = 'none');

            // If there's a user profile element, update it
            const userProfileElement = document.getElementById('user-profile');
            if (userProfileElement && result.data) {
                userProfileElement.textContent = result.data.username;
            }
        } else {
            // User is not authenticated
            console.log('User is not authenticated');

            // Update UI for guest users
            const userElements = document.querySelectorAll('.user-authenticated');
            const guestElements = document.querySelectorAll('.guest-only');

            userElements.forEach(el => el.style.display = 'none');
            guestElements.forEach(el => el.style.display = 'block');

            // If on a protected page, redirect to login
            const protectedPages = ['/profile/', '/history/', '/myadmin/'];
            if (protectedPages.includes(window.location.pathname)) {
                window.location.href = '/login/';
            }
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
});