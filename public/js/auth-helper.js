// Authentication Helper Script
// This script helps maintain authentication across page navigations

(function() {
    // Function to get token from localStorage
    function getToken() {
        return localStorage.getItem('token');
    }

    // Function to add token to all links
    function addTokenToLinks() {
        const token = getToken();
        if (!token) return;

        // Add token to all internal links
        document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('token=')) {
                const separator = href.includes('?') ? '&' : '?';
                link.setAttribute('href', href + separator + 'token=' + token);
            }
        });

        // Add token to form actions
        document.querySelectorAll('form').forEach(form => {
            const action = form.getAttribute('action');
            if (action && !action.includes('token=')) {
                const separator = action.includes('?') ? '&' : '?';
                form.setAttribute('action', action + separator + 'token=' + getToken());
            }
        });
    }

    // Function to add token to current page URL if not present
    function addTokenToURL() {
        const token = getToken();
        if (!token) return;

        const url = new URL(window.location.href);
        if (!url.searchParams.has('token')) {
            url.searchParams.set('token', token);
            window.history.replaceState({}, '', url);
        }
    }

    // Add token to fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const token = getToken();
        if (token && args[1]) {
            args[1].headers = args[1].headers || {};
            if (!args[1].headers['Authorization']) {
                args[1].headers['Authorization'] = 'Bearer ' + token;
            }
        }
        return originalFetch.apply(this, args);
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addTokenToURL();
            addTokenToLinks();
        });
    } else {
        addTokenToURL();
        addTokenToLinks();
    }

    // Re-run after dynamic content loads
    const observer = new MutationObserver(function(mutations) {
        addTokenToLinks();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

