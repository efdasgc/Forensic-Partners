/*
 * Forensic Partners Website JavaScript
 * Handles mobile navigation, form validation, TOC generation, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initTableOfContents();
    initContactForm();
    initFAQAccordion();
    initModals();
    initScrollReveal();
    initSmoothScroll();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('nav--open');
        
        // Focus management
        if (!isExpanded) {
            const firstLink = nav.querySelector('.nav__link');
            if (firstLink) firstLink.focus();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('nav--open');
            menuToggle.focus();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('nav--open');
        }
    });

    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 767) {
            menuToggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('nav--open');
        }
    });
}

/**
 * Generate Table of Contents from article headings
 */
function initTableOfContents() {
    const article = document.querySelector('.main-article');
    const tocList = document.getElementById('toc-list');
    
    if (!article || !tocList) return;

    const headings = article.querySelectorAll('h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        // Hide TOC if no headings found
        const toc = document.querySelector('.toc');
        if (toc) toc.style.display = 'none';
        return;
    }

    headings.forEach((heading, index) => {
        // Create unique ID for each heading
        const id = 'heading-' + index;
        heading.id = id;

        // Create TOC entry
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = '#' + id;
        link.textContent = heading.textContent;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            smoothScrollTo(heading);
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
}

/**
 * Contact Form Validation and Submission
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const submitButton = form.querySelector('button[type="submit"]');

    // Add real-time validation
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(field);
        });

        field.addEventListener('input', function() {
            clearFieldError(field);
        });
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Validate all required fields
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Check confidentiality agreement
        const confidentialityCheckbox = document.getElementById('confidentiality-agreement');
        if (confidentialityCheckbox && !confidentialityCheckbox.checked) {
            showFieldError(confidentialityCheckbox, 'You must acknowledge the confidentiality notice to proceed.');
            isValid = false;
        }

        if (isValid) {
            showFormSuccess();
            form.reset();
        } else {
            // Focus on first error field
            const firstError = form.querySelector('.form-input--error, .form-select--error, .form-textarea--error');
            if (firstError) firstError.focus();
        }
    });

    /**
     * Validate individual form field
     */
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if required field is empty
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required.';
            isValid = false;
        }
        // Email validation
        else if (field.type === 'email' && value && !isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address.';
            isValid = false;
        }
        // Case type validation
        else if (field.name === 'case-type' && field.hasAttribute('required') && !value) {
            errorMessage = 'Please select a case type.';
            isValid = false;
        }

        if (isValid) {
            clearFieldError(field);
        } else {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    function showFieldError(field, message) {
        field.classList.add('form-input--error', 'form-select--error', 'form-textarea--error');
        
        const errorId = field.id + '-error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('form-error--visible');
        }
    }

    /**
     * Clear field error
     */
    function clearFieldError(field) {
        field.classList.remove('form-input--error', 'form-select--error', 'form-textarea--error');
        
        const errorId = field.id + '-error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('form-error--visible');
        }
    }

    /**
     * Show form success message
     */
    function showFormSuccess() {
        const successElement = document.getElementById('form-success');
        if (successElement) {
            successElement.classList.add('form-success--visible');
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Email validation helper
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/**
 * FAQ Accordion Functionality
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;

        question.addEventListener('click', function() {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    
                    if (otherQuestion && otherAnswer) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherAnswer.classList.remove('faq-answer--open');
                    }
                }
            });
            
            // Toggle current item
            question.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('faq-answer--open');
        });
    });
}

/**
 * Modal Functionality
 */
function initModals() {
    // Privacy modal
    const privacyToggle = document.getElementById('privacy-toggle');
    const privacyModal = document.getElementById('privacy-modal');
    const privacyClose = document.getElementById('privacy-close');

    if (privacyToggle && privacyModal && privacyClose) {
        privacyToggle.addEventListener('click', () => openModal(privacyModal));
        privacyClose.addEventListener('click', () => closeModal(privacyModal));
    }

    // Terms modal
    const termsToggle = document.getElementById('terms-toggle');
    const termsModal = document.getElementById('terms-modal');
    const termsClose = document.getElementById('terms-close');

    if (termsToggle && termsModal && termsClose) {
        termsToggle.addEventListener('click', () => openModal(termsModal));
        termsClose.addEventListener('click', () => closeModal(termsModal));
    }

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.modal--open');
            if (openModal) closeModal(openModal);
        }
    });

    // Close modal on backdrop click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal--open')) {
            closeModal(e.target);
        }
    });

    function openModal(modal) {
        modal.classList.add('modal--open');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const closeButton = modal.querySelector('.btn');
        if (closeButton) closeButton.focus();
    }

    function closeModal(modal) {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Scroll-triggered reveal animations
 */
function initScrollReveal() {
    // Only run if motion is not reduced
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const elementsToObserve = document.querySelectorAll(
        '.service-card, .credibility-point, .case-study-card, .contact-card'
    );

    elementsToObserve.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    // Handle all anchor links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            e.preventDefault();
            smoothScrollTo(targetElement);
        }
    });
}

/**
 * Smooth scroll to element with offset for fixed header
 */
function smoothScrollTo(element) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const elementTop = element.offsetTop - headerHeight - 20;

    // Use native smooth scrolling if supported and motion not reduced
    if ('scrollBehavior' in document.documentElement.style && 
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
        });
    } else {
        // Fallback for browsers without smooth scrolling
        window.scrollTo(0, elementTop);
    }
}

/**
 * Utility function to debounce events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', debounce(function() {
    // Close mobile menu if window becomes wide enough
    if (window.innerWidth > 767) {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            menuToggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('nav--open');
        }
    }
}, 250));

/**
 * Performance optimization: Only run expensive operations when needed
 */
if ('IntersectionObserver' in window) {
    // Modern browser with IntersectionObserver support
    initScrollReveal();
} else {
    // Fallback for older browsers - just add classes immediately
    const elementsToShow = document.querySelectorAll(
        '.service-card, .credibility-point, .case-study-card, .contact-card'
    );
    
    elementsToShow.forEach(element => {
        element.classList.add('fade-in-up');
    });
}

// Log initialization completion for debugging
console.log('Forensic Partners website initialized successfully');