// Mobile navigation toggle
(function() {
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.getElementById('primary-nav');
    const navBackdrop = document.getElementById('nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!navToggle || !primaryNav || !navBackdrop) return;

    function toggleNav() {
        const isVisible = primaryNav.getAttribute('data-visible') === 'true';
        
        if (isVisible) {
            closeNav();
        } else {
            openNav();
        }
    }

    function openNav() {
        primaryNav.setAttribute('data-visible', 'true');
        navBackdrop.setAttribute('data-visible', 'true');
        navToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden'; // Prevent body scrolling when menu is open
    }

    function closeNav() {
        primaryNav.setAttribute('data-visible', 'false');
        navBackdrop.setAttribute('data-visible', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = ''; // Restore scrolling
    }

    // Toggle on button click
    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNav();
    });

    // Close on backdrop click
    navBackdrop.addEventListener('click', closeNav);

    // Close on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && primaryNav.getAttribute('data-visible') === 'true') {
            closeNav();
        }
    });

    // Close on window resize to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 767 && primaryNav.getAttribute('data-visible') === 'true') {
            closeNav();
        }
    });
})();

