// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle other navigation links that don't exist yet (remove app handling since they have pages now)
    const otherNavLinks = document.querySelectorAll('.nav-link[href="about.html"], .nav-link[href="contact.html"], .nav-link[href="responsible-gambling.html"]');
    otherNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== 'privacy.html' && href !== 'terms.html' && href !== 'index.html' && href !== 'propify.html' && href !== 'fitiva.html' && href !== 'micro.html' && href !== 'support.html') {
                e.preventDefault();
                const pageName = this.textContent;
                alert(`${pageName} page is coming soon!\n\nWe're working hard to bring you this content. Please check back later.`);
            }
        });
    });

    // Email signup form handling
    const emailForms = document.querySelectorAll('.email-signup-form');
    emailForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = form.querySelector('.email-input');
            const submitBtn = form.querySelector('.notify-btn');
            const email = emailInput.value;
            
            if (email && isValidEmail(email)) {
                // Store email in localStorage (in production, send to backend)
                let emails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
                if (!emails.includes(email)) {
                    emails.push(email);
                    localStorage.setItem('waitlistEmails', JSON.stringify(emails));
                    
                    // Show success message
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = '✓ Added to waitlist!';
                    submitBtn.style.background = '#10b981';
                    emailInput.value = '';
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                    }, 3000);
                    
                    // Update waitlist counter
                    updateWaitlistCounter();
                } else {
                    alert('This email is already on our waitlist!');
                }
            } else {
                alert('Please enter a valid email address.');
            }
        });
    });

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Update waitlist counter
    function updateWaitlistCounter() {
        const counter = document.querySelector('.waitlist-count');
        if (counter) {
            const emails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
            const baseCount = 2500;
            counter.textContent = `🎯 Join ${baseCount + emails.length}+ people on our waitlist`;
        }
    }

    // Initialize waitlist counter
    updateWaitlistCounter();

    // Mobile menu functionality
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '☰';
    navToggle.style.display = 'none';
    navToggle.style.background = 'none';
    navToggle.style.border = 'none';
    navToggle.style.fontSize = '24px';
    navToggle.style.color = '#22c55e';
    navToggle.style.cursor = 'pointer';
    
    const navMenu = document.querySelector('.nav-menu');
    const navContainer = document.querySelector('.nav-container');
    
    // Insert toggle button before nav menu
    navContainer.insertBefore(navToggle, navMenu);
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('nav-menu-open');
    });
    
    // Close menu when clicking on a link
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('nav-menu-open');
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards for animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Simulate AI button interactions with pre-launch messaging
    const aiButtons = document.querySelectorAll('.ai-button');
    aiButtons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = button.textContent;
            
            // Show coming soon message for app demos
            button.textContent = 'Coming Soon!';
            button.style.background = '#fbbf24';
            button.style.color = '#92400e';
            
            setTimeout(() => {
                alert('🚀 This feature will be available when the app launches!\n\nJoin our waitlist to be notified when it\'s ready.');
            }, 500);
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        });
    });
    
    // Add hover effects to download buttons
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroVisual) {
            const rate = scrolled * -0.5;
            heroVisual.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Stats counter animation
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (element.textContent.includes('%') ? '%' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (element.textContent.includes('%') ? '%' : '');
            }
        }, 16);
    }
    
    // Animate stats when they come into view
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        observer.observe(stat);
        stat.addEventListener('animationstart', function() {
            const value = parseInt(stat.textContent);
            if (!isNaN(value)) {
                animateCounter(stat, value);
            }
        });
    });
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    // Add ripple effect to AI buttons
    aiButtons.forEach(button => {
        button.addEventListener('click', createRipple);
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
    });
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @media (max-width: 768px) {
            .nav-toggle {
                display: block !important;
            }
            
            .nav-menu {
                position: absolute;
                top: 70px;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                flex-direction: column;
                padding: 20px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                transform: translateY(-100%);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .nav-menu.nav-menu-open {
                transform: translateY(0);
                opacity: 1;
                pointer-events: all;
            }
            
            .nav-menu .nav-link {
                padding: 10px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .nav-menu .nav-link:last-child {
                border-bottom: none;
            }
        }
    `;
    document.head.appendChild(style);
});

// Utility function for smooth scrolling
function smoothScroll(target, duration = 1000) {
    const targetPosition = target.offsetTop - 70; // Account for fixed header
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Add click tracking for analytics (placeholder)
function trackClick(elementName) {
    console.log(`Clicked: ${elementName}`);
    // Add your analytics tracking code here
}

// Add event listeners for tracking
document.addEventListener('click', function(e) {
    if (e.target.matches('.download-btn')) {
        trackClick('Download Button');
    } else if (e.target.matches('.nav-link')) {
        trackClick(`Navigation: ${e.target.textContent}`);
    } else if (e.target.matches('.ai-button')) {
        trackClick('AI Generate Button');
    }
}); 