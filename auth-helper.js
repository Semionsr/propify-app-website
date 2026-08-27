/**
 * Propify Authentication Helper
 * Manages user authentication state and onboarding flow
 */

const PropifyAuth = {
    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return localStorage.getItem('propify_user_logged_in') === 'true';
    },

    /**
     * Check if user has completed onboarding
     */
    hasCompletedOnboarding() {
        return localStorage.getItem('propify_onboarding_completed') === 'true';
    },

    /**
     * Set user as logged in
     */
    setLoggedIn(loggedIn = true) {
        localStorage.setItem('propify_user_logged_in', loggedIn ? 'true' : 'false');
        
        // If user logs out, clear onboarding status
        if (!loggedIn) {
            this.clearOnboarding();
        }
    },

    /**
     * Mark onboarding as completed
     */
    completeOnboarding() {
        localStorage.setItem('propify_onboarding_completed', 'true');
        localStorage.setItem('propify_onboarding_date', new Date().toISOString());
    },

    /**
     * Clear onboarding completion status
     */
    clearOnboarding() {
        localStorage.removeItem('propify_onboarding_completed');
        localStorage.removeItem('propify_onboarding_date');
    },

    /**
     * Get the appropriate destination based on auth and onboarding status
     * @returns {string} URL to redirect to
     */
    getDestination() {
        const isLoggedIn = this.isLoggedIn();
        const hasOnboarded = this.hasCompletedOnboarding();

        if (!isLoggedIn) {
            // Not logged in - go to onboarding
            // Don't clear onboarding status here - let them complete it
            return 'onboarding.html';
        } else if (!hasOnboarded) {
            // Logged in but hasn't completed onboarding
            return 'onboarding.html';
        } else {
            // Logged in and onboarded - go to app
            return 'ai-chat.html';
        }
    },

    /**
     * Redirect to appropriate page based on auth status
     * Use this for protected pages like AI Chat
     */
    requireAuth() {
        const destination = this.getDestination();
        
        // Only redirect if we're not already on the correct page
        const currentPage = window.location.pathname.split('/').pop();
        if (destination !== currentPage) {
            window.location.href = destination;
        }
    },

    /**
     * Complete onboarding and redirect appropriately
     */
    finishOnboarding() {
        this.completeOnboarding();
        
        const isLoggedIn = this.isLoggedIn();
        
        if (isLoggedIn) {
            // Logged in - go to app
            window.location.href = 'ai-chat.html';
        } else {
            // Not logged in - go to login with redirect back to app
            window.location.href = 'login.html?redirect=ai-chat.html';
        }
    },

    /**
     * Setup all clickable elements to use proper routing
     * Call this on page load
     */
    setupNavigation() {
        const destination = this.getDestination();
        
        // Update all AI Chat and Try Now links
        const aiChatLinks = document.querySelectorAll('a[href="ai-chat.html"]');
        aiChatLinks.forEach(link => {
            link.href = destination;
        });

        // Update Try Now button specifically
        const tryNowBtn = document.getElementById('tryNowBtn');
        if (tryNowBtn) {
            tryNowBtn.href = destination;
        }
    },

    /**
     * Update UI elements based on auth state
     * Updates button text, icons, and links for logged-in users
     */
    updateAuthUI() {
        const isLoggedIn = this.isLoggedIn();
        
        // Update Sign In button to View Account if logged in
        const navSignInBtn = document.getElementById('navSignInBtn');
        const navSignInText = document.getElementById('navSignInText');
        
        if (navSignInBtn && navSignInText) {
            if (isLoggedIn) {
                navSignInText.textContent = 'View Account';
                navSignInBtn.href = 'ai-chat.html';
                
                // Update icon to user-circle
                const icon = navSignInBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'user-circle');
                }
            } else {
                navSignInText.textContent = 'Sign In';
                navSignInBtn.href = 'login.html';
                
                // Update icon to log-in
                const icon = navSignInBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'log-in');
                }
            }
            
            // Reinitialize Lucide icons if available
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    },

    /**
     * Logout user and clear all data
     */
    logout() {
        this.setLoggedIn(false);
        this.clearOnboarding();
        
        // Clear any other user-specific data
        localStorage.removeItem('propify_selected_sports');
        localStorage.removeItem('propify_user_data');
        
        // Redirect to home
        window.location.href = 'propify.html';
    }
};

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropifyAuth;
}

