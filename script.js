document.addEventListener('DOMContentLoaded', () => {
    // GSAP and ScrollTrigger registration
    gsap.registerPlugin(ScrollTrigger);

    // --- Custom Cursor Animation ---
    const blob = document.querySelector('.cursor-blob');
    let mouseX = 0;
    let mouseY = 0;
    let blobX = 0;
    let blobY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        blobX += (mouseX - blobX) * 0.1; // Slower, fluid movement
        blobY += (mouseY - blobY) * 0.1;
        blob.style.transform = `translate3d(${blobX}px, ${blobY}px, 0)`;

        requestAnimationFrame(animateCursor);
    };
    animateCursor();
    
    // --- Navbar Toggle for Mobile ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Hero Section Animation ---
    gsap.from(".hero-content", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.5
    });
    gsap.from(".hero-title", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
        delay: 0.8
    });
    gsap.from(".hero-tagline", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
        delay: 1
    });
    gsap.from(".primary-btn", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
        delay: 1.2
    });


    // --- Section Scroll Animations (Intersection Observer for better performance) ---
    const sections = document.querySelectorAll('section:not(#hero)'); // Exclude hero section
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Section becomes visible when 15% of it is in the viewport
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                // Optional: Stop observing once it's visible to save resources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Contact Form Validation (Client-side) ---
    const contactForm = document.getElementById('contactForm');
    const formMessages = document.getElementById('form-messages');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name === '' || email === '' || message === '') {
                displayMessage('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                displayMessage('Please enter a valid email address.', 'error');
                return;
            }

            // In a real application, you would send this data to a server.
            // For now, we'll just simulate a successful submission.
            simulateFormSubmission(name, email, message);
        });
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function displayMessage(message, type) {
        formMessages.textContent = message;
        formMessages.className = 'form-messages ' + type; // Reset class and add new type
        gsap.fromTo(formMessages, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    }

    function simulateFormSubmission(name, email, message) {
        // Simulate an API call
        console.log("Form submitted:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Message:", message);

        displayMessage('Thank you for your message, Sriram will get back to you soon!', 'success');

        // Clear the form after a short delay
        setTimeout(() => {
            contactForm.reset();
            gsap.to(formMessages, { opacity: 0, y: -10, duration: 0.5, delay: 3, onComplete: () => {
                formMessages.textContent = '';
                formMessages.className = 'form-messages';
            }});
        }, 2000);
    }
});