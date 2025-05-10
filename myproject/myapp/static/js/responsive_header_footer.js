document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sideNav = document.getElementById('side-nav');
    const overlay = document.getElementById('side-nav-overlay');

    // Open menu
    if (menuToggle && sideNav && overlay) {
        menuToggle.addEventListener('click', function() {
            this.classList.add('active');
            sideNav.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
        });
    }

    // Close menu
    if (closeMenu && sideNav && overlay) {
        closeMenu.addEventListener('click', closeNavigation);
        overlay.addEventListener('click', closeNavigation);
    }

    function closeNavigation() {
        if (menuToggle) menuToggle.classList.remove('active');
        if (sideNav) sideNav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    // Submenu Toggle
    const submenuToggles = document.querySelectorAll('.submenu-toggle');

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();

            const parent = this.closest('.has-submenu');

            // Close other submenus
            document.querySelectorAll('.has-submenu').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('active');
                }
            });

            // Toggle current submenu
            parent.classList.toggle('active');
        });
    });

    // User Profile Dropdown
    const avatarTrigger = document.getElementById('avatar-trigger');
    const userDropdown = document.getElementById('user-dropdown');

    if (avatarTrigger && userDropdown) {
        avatarTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!avatarTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Theme Toggle
    const themeSwitch = document.getElementById('theme-switch');

    if (themeSwitch) {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeSwitch.classList.add('dark-mode');
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeSwitch.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            this.classList.toggle('dark-mode');

            // Update icon
            if (this.classList.contains('dark-mode')) {
                this.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                this.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (email) {
                // Simulate form submission
                alert(`Thank you for subscribing with: ${email}`);
                emailInput.value = '';
            }
        });
    }
});