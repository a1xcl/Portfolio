// Enhanced Dynamic Background Effect (inspired by f1nk1r.lol)
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.getElementById('canvas-container').appendChild(canvas);
const ctx = canvas.getContext('2d');

// Optimized particle system configuration
const config = {
    particleCount: 150, // Reduced for better performance
    particleSizeMin: 1,
    particleSizeMax: 3,
    minSpeed: 0.2,
    maxSpeed: 0.8,
    connectionDistance: 150, // Reduced for better performance
    mouseInteractionRadius: 150, // Reduced for better performance
    mouseForce: 0.1,
    fadeSpeed: 0.02,
    colors: [
        'rgba(159, 0, 255, 0.6)', // Light purple with reduced opacity
        'rgba(255, 255, 255, 0.4)', // White/grey with reduced opacity
        'rgba(100, 100, 120, 0.3)' // Dark grey/near black with reduced opacity
    ],
    glowStrength: 8, // Reduced for better performance
    particleLifespan: { min: 60, max: 120 }
};

// Optimized mouse tracking
const mouse = {
    x: null,
    y: null,
    radius: config.mouseInteractionRadius
};

// Optimized event listeners
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Optimized Particle Class
class Particle {
    constructor(init = {}) {
        this.x = init.x !== undefined ? init.x : Math.random() * canvas.width;
        this.y = init.y !== undefined ? init.y : Math.random() * canvas.height;
        this.type = init.type || 'moving';

        if (this.type === 'moving') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        this.radius = Math.random() * (config.particleSizeMax - config.particleSizeMin) + config.particleSizeMin;
        this.originalRadius = this.radius;
        this.color = init.color || config.colors[Math.floor(Math.random() * config.colors.length)];
        this.opacity = init.opacity !== undefined ? init.opacity : (this.type === 'twinkle' ? 0 : Math.random() * 0.5 + 0.2);
        this.maxOpacity = this.type === 'twinkle' ? Math.random() * 0.6 + 0.4 : this.opacity;

        this.lifespan = Math.floor(Math.random() * (config.particleLifespan.max - config.particleLifespan.min)) + config.particleLifespan.min;
        this.life = init.life || this.lifespan;
        this.fadeState = init.skipFade ? 'visible' : 'fadeIn';

        if (this.type === 'moving') {
            this.pulse = Math.random() * 0.1;
            this.pulseSpeed = 0.01 + Math.random() * 0.02;
            this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
        }

        if (this.type === 'twinkle') {
            this.twinkleSpeed = config.fadeSpeed * (Math.random() * 0.5 + 0.5);
            this.holdDuration = Math.floor(Math.random() * 60) + 30;
            this.holdTimer = 0;
        }
    }

    update() {
        if (this.type === 'moving') {
            this.x += this.vx;
            this.y += this.vy;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.vx += Math.cos(angle) * force * config.mouseForce;
                    this.vy += Math.sin(angle) * force * config.mouseForce;
                }
            }

            this.vx *= 0.99;
            this.vy *= 0.99;

            if (this.x < -50) this.x = canvas.width + 50;
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.y < -50) this.y = canvas.height + 50;
            if (this.y > canvas.height + 50) this.y = -50;

            this.pulse += this.pulseSpeed * this.pulseDirection;
            if (this.pulse > 0.3 || this.pulse < 0) {
                this.pulseDirection *= -1;
            }
        }

        if (this.type === 'moving') {
            switch (this.fadeState) {
                case 'fadeIn':
                    this.opacity += config.fadeSpeed;
                    if (this.opacity >= this.maxOpacity) {
                        this.opacity = this.maxOpacity;
                        this.fadeState = 'visible';
                    }
                    break;
                case 'fadeOut':
                    this.opacity -= config.fadeSpeed;
                    if (this.opacity <= 0) {
                        this.opacity = 0;
                        return true;
                    }
                    break;
                case 'visible':
                    this.life--;
                    if (this.life <= 0) {
                        this.fadeState = 'fadeOut';
                    }
                    break;
            }
        } else {
            switch (this.fadeState) {
                case 'fadeIn':
                    this.opacity += this.twinkleSpeed;
                    if (this.opacity >= this.maxOpacity) {
                        this.opacity = this.maxOpacity;
                        this.fadeState = 'holding';
                        this.holdTimer = 0;
                    }
                    break;
                case 'holding':
                    this.holdTimer++;
                    if (this.holdTimer >= this.holdDuration) {
                        this.fadeState = 'fadeOut';
                    }
                    break;
                case 'fadeOut':
                    this.opacity -= this.twinkleSpeed;
                    if (this.opacity <= 0) {
                        this.opacity = 0;
                        return true;
                    }
                    break;
            }
        }

        return false;
    }

    draw() {
        const glow = this.radius + (this.type === 'moving' ? (this.pulse * config.glowStrength) : 0);

        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glow
        );

        const colorBase = this.color.replace('0.8', this.opacity.toFixed(2));
        const colorTransparent = this.color.replace('0.8', '0');
        gradient.addColorStop(0, colorBase);
        gradient.addColorStop(1, colorTransparent);

        ctx.beginPath();
        ctx.arc(this.x, this.y, glow, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('0.8', this.opacity.toFixed(2));
        ctx.fill();
    }
}

// Optimized ParticleSystem class
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.initialize();
    }

    initialize() {
        for (let i = 0; i < config.particleCount; i++) {
            this.particles.push(new Particle({skipFade: true, type: 'moving'}));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update()) {
                const type = this.particles[i].type;
                this.particles.splice(i, 1);
                if (type === 'moving') {
                    this.particles.push(new Particle({type: 'moving'}));
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.particles.forEach(particle => {
            particle.draw();
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }

    resize(width, height) {
        canvas.width = width;
        canvas.height = height;
        this.particles = [];
        this.initialize();
    }
}

// Create and start particle system
const particleSystem = new ParticleSystem();
particleSystem.animate();

// Optimized resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        particleSystem.resize(window.innerWidth, window.innerHeight);
    }, 250);
});

// Navbar scroll effect - Show/hide background based on scroll position relative to Hero section
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const aboutSection = document.getElementById('about');
    // Check if scrolled to or past the about section
    if (window.scrollY >= aboutSection.offsetTop - navbar.offsetHeight - 50) { // Adjust offset slightly higher
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll reveal animation
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealElements);
revealElements(); // Initial check on load

// Highlight active navigation link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNavLink() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Adjust offset based on header height and a small buffer
        const offset = 100;
        if (pageYOffset >= sectionTop - offset && pageYOffset < sectionTop + sectionHeight - offset) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavLink);
window.addEventListener('DOMContentLoaded', highlightNavLink);

// Smooth scroll to About section when scroll indicator is clicked
const scrollIndicator = document.querySelector('.scroll-indicator');
const aboutSection = document.getElementById('about');

if (scrollIndicator && aboutSection) {
    scrollIndicator.addEventListener('click', () => {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Number counting animation on scroll reveal
function animateNumbers() {
    const infoCards = document.querySelectorAll('.info-card');

    infoCards.forEach(card => {
        const numberElement = card.querySelector('h3');
        const targetNumberText = numberElement.textContent.replace('+', ''); // Remove '+' for parsing
        const targetNumber = parseInt(targetNumberText);
        let currentNumber = 0;
        const duration = 1500; // Animation duration in milliseconds
        const increment = targetNumber / (duration / 16); // Calculate increment based on desired FPS (approx 60)

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !card.classList.contains('animated')) {
                    card.classList.add('animated'); // Mark card as animated
                    const startTime = performance.now();

                    function updateNumber(currentTime) {
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        currentNumber = Math.ceil(progress * targetNumber);

                        // Update text content, add '+' back if it was there
                        numberElement.textContent = currentNumber + (targetNumberText !== numberElement.textContent ? '+' : '');

                        if (progress < 1) {
                            requestAnimationFrame(updateNumber);
                        }
                    }

                    requestAnimationFrame(updateNumber);
                    observer.unobserve(card); // Stop observing once animated
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

        observer.observe(card);
    });
}

// Run the animation function when the page loads and on scroll
window.addEventListener('DOMContentLoaded', animateNumbers);
// No need to run on scroll as IntersectionObserver handles it

// Smooth scroll for the 'Contact with me' button
const contactButton = document.querySelector('.hero-actions .cta-btn');
const contactSection = document.getElementById('contact');

if (contactButton && contactSection) {
    contactButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default anchor link behavior
        contactSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Add JavaScript code here 