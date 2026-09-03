document.addEventListener('DOMContentLoaded', () => {
    
    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const cursorText = document.querySelector('.cursor-text');
    let isDesktop = window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isDesktop && cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            // Fast follow for dot
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Lagging follow for circle (using requestAnimationFrame for smoothness if needed, but CSS transition is fine)
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        });

        // Hover interactables
        const interactables = document.querySelectorAll('[data-cursor]');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const type = el.getAttribute('data-cursor');
                document.body.className = `cursor-${type}`;
                
                if(type === 'view') cursorText.innerText = 'VIEW';
                else if(type === 'open') cursorText.innerText = 'OPEN';
                else if(type === 'download') cursorText.innerText = 'GET';
                else cursorText.innerText = '';
            });
            el.addEventListener('mouseleave', () => {
                document.body.className = '';
                cursorText.innerText = '';
            });
        });
    }

    // Ambient Background Glow
    const ambientGlow = document.getElementById('ambient-glow');
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    if (isDesktop && ambientGlow) {
        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });
        
        function animateGlow() {
            if (!isDesktop) return;
            currentX += (targetX - currentX) * 0.05;
            currentY += (targetY - currentY) * 0.05;
            ambientGlow.style.left = `${currentX}px`;
            ambientGlow.style.top = `${currentY}px`;
            ambientGlow.style.transform = `translate(-50%, -50%)`;
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // Magnetic Grid Canvas
    const canvas = document.getElementById('magnetic-grid');
    let gridActive = false;
    if (isDesktop && canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let points = [];
        const spacing = 80;
        const radius = 300; // Increased radius for stronger effect
        const maxDisplacement = 40; // Increased displacement
        const spring = 0.04; // Softer spring for smoother settling
        const friction = 0.85; // Less friction for more fluid movement

        function initGrid() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            points = [];

            const cols = Math.floor(width / spacing) + 2;
            const rows = Math.floor(height / spacing) + 2;

            for (let i = 0; i < cols; i++) {
                points[i] = [];
                for (let j = 0; j < rows; j++) {
                    const x = (i - 1) * spacing;
                    const y = (j - 1) * spacing;
                    points[i][j] = { ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 };
                }
            }
        }

        window.addEventListener('resize', () => {
            if(window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                initGrid();
            }
        });
        initGrid();

        function drawGrid() {
            if (!isDesktop) return;
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 1;

            const cols = points.length;
            const rows = points[0] ? points[0].length : 0;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const p = points[i][j];
                    
                    // Calculate target position based on mouse
                    let tx = p.ox;
                    let ty = p.oy;
                    
                    const dx = targetX - p.ox;
                    const dy = targetY - p.oy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < radius) {
                        const force = Math.pow((radius - dist) / radius, 1.5); // Smoother falloff
                        if(gridActive) {
                            tx += (dx / dist) * force * maxDisplacement;
                            ty += (dy / dist) * force * maxDisplacement;
                        }
                    }
                    
                    // Very slow subtle continuous drift
                    tx += Math.sin(Date.now() * 0.0005 + p.oy * 0.01) * 2;
                    ty += Math.cos(Date.now() * 0.0005 + p.ox * 0.01) * 2;

                    // Spring physics
                    p.vx += (tx - p.x) * spring;
                    p.vy += (ty - p.y) * spring;
                    p.vx *= friction;
                    p.vy *= friction;
                    p.x += p.vx;
                    p.y += p.vy;
                }
            }

            // Draw horizontal lines
            ctx.beginPath();
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const p = points[i][j];
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();

            // Draw vertical lines
            ctx.beginPath();
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const p = points[i][j];
                    if (j === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();

            requestAnimationFrame(drawGrid);
        }
        
        drawGrid();
    }

    // Parallax Images
    const parallaxImgs = document.querySelectorAll('.parallax-subtle, .parallax-img');
    if (isDesktop) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            parallaxImgs.forEach(img => {
                const speed = 0.05;
                img.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, { passive: true });

        // Interactive Profile Photo
        const heroWrapper = document.querySelector('.hero-image-wrapper');
        const heroImg = document.querySelector('.hero-img');
        if(heroWrapper && heroImg) {
            heroImg.classList.add('interactive-photo');
            heroWrapper.addEventListener('mousemove', (e) => {
                const rect = heroWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const moveX = (x / rect.width) * 15;
                const moveY = (y / rect.height) * 15;
                heroImg.style.transform = `scale(1.03) translate(${moveX}px, ${moveY}px)`;
            });
            heroWrapper.addEventListener('mouseleave', () => {
                heroImg.style.transform = `scale(1) translate(0px, 0px)`;
            });
        }
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active Navigation Highlighting
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Intersection Observer for Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px -50px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Cinematic Page Loader Sequence
    const loader = document.getElementById('loader');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (loader && !isReducedMotion) {
        const loaderName = document.querySelector('.loader-name');
        const loaderRole = document.querySelector('.loader-role');
        const loaderQuoteContainer = document.querySelector('.loader-quote-container');
        const loaderPhotoWrapper = document.querySelector('.loader-photo-wrapper');
        const loaderQuoteText = document.getElementById('loader-quote');

        const quotes = [
            "Code is not just what I write, it's how I solve problems.",
            "Building today, impacting tomorrow.",
            "Turn ideas into real-world solutions.",
            "Innovation is my habit, not my choice.",
            "Stay curious. Keep building. Never stop learning.",
            "Discipline turns dreams into achievements.",
            "From imagination to implementation.",
            "I don't just write code, I build possibilities."
        ];
        
        // Random initial quote
        let currentQuoteIndex = Math.floor(Math.random() * quotes.length);
        if(loaderQuoteText) loaderQuoteText.innerText = `"${quotes[currentQuoteIndex]}"`;

        // Quote rotation (in case loading is extended in the future)
        setInterval(() => {
            if (!loader.classList.contains('hide') && loaderQuoteText) {
                loaderQuoteText.style.opacity = '0';
                setTimeout(() => {
                    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
                    loaderQuoteText.innerText = `"${quotes[currentQuoteIndex]}"`;
                    loaderQuoteText.style.opacity = '1';
                }, 500);
            }
        }, 6000);

        // Sequence Timing
        setTimeout(() => { if (loaderName) loaderName.classList.add('animate'); }, 800);
        setTimeout(() => { if (loaderRole) loaderRole.classList.add('animate'); }, 2000);
        setTimeout(() => { if (loaderQuoteContainer) loaderQuoteContainer.classList.add('animate'); }, 2800);
        setTimeout(() => { if (loaderPhotoWrapper) loaderPhotoWrapper.classList.add('animate'); }, 3600);

        // Loader disappearance and Hero reveal
        setTimeout(() => {
            loader.classList.add('hide');
            setTimeout(() => {
                const hero = document.getElementById('hero');
                if (hero) hero.classList.add('active');
                gridActive = true;
                setTimeout(() => loader.remove(), 1000); // Fully remove from DOM
            }, 1000); // Wait for fade out to finish (1s) before revealing hero (Total 6.5s)
        }, 5500); // 5.5s start fade out
    } else {
        if(loader) loader.style.display = 'none';
        const hero = document.getElementById('hero');
        if (hero) hero.classList.add('active');
        gridActive = true;
    }

    // Case Study Overlay Logic
    const caseStudyOverlay = document.getElementById('case-study-overlay');
    const caseStudyViews = document.querySelectorAll('.cs-view');
    let lastScrollPosition = 0;

    window.openCaseStudy = function(projectId) {
        // Save current scroll position
        lastScrollPosition = window.scrollY;
        
        // Lock body scroll and set fixed top to prevent jumping
        document.body.style.position = 'fixed';
        document.body.style.top = `-${lastScrollPosition}px`;
        document.body.style.width = '100%';
        
        // Hide all case study views
        caseStudyViews.forEach(view => view.classList.remove('active'));
        
        // Show selected case study
        const selectedView = document.getElementById(`cs-${projectId}`);
        if (selectedView) {
            selectedView.classList.add('active');
        }
        
        // Reset overlay scroll
        caseStudyOverlay.scrollTop = 0;
        
        // Show overlay
        caseStudyOverlay.classList.add('active');
    };

    window.closeCaseStudy = function() {
        // Hide overlay
        caseStudyOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, lastScrollPosition);
        
        // Small delay to allow fade out before removing content visibility
        setTimeout(() => {
            caseStudyViews.forEach(view => view.classList.remove('active'));
        }, 600);
    };

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && caseStudyOverlay.classList.contains('active')) {
            window.closeCaseStudy();
        }
    });
});
