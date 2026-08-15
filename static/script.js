console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const header = document.getElementById("header");
    const backToTop = document.getElementById("backToTop");
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    const themeToggle = document.getElementById("themeToggle");
    const loader = document.getElementById("loader");

    // ==========================================
    // LOADER
    // ==========================================

    window.addEventListener("load", () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = "0";
                loader.style.pointerEvents = "none";

                setTimeout(() => {
                    loader.style.display = "none";
                }, 600);
            }
        }, 500);
    });

    // ==========================================
    // HEADER + BACK TO TOP
    // ==========================================

    function handleScroll() {

        if (header) {
            header.classList.toggle(
                "scrolled",
                window.scrollY > 20
            );
        }

        if (backToTop) {
            backToTop.classList.toggle(
                "show",
                window.scrollY > 500
            );
        }

        updateActiveNav();
    }

    window.addEventListener("scroll", handleScroll);

    // ==========================================
    // BACK TO TOP
    // ==========================================

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // ==========================================
    // MOBILE MENU
    // ==========================================

    if (menuBtn && navLinks) {

        menuBtn.addEventListener("click", () => {

            navLinks.classList.toggle("open");

            const isOpen = navLinks.classList.contains("open");

            menuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuBtn.textContent = isOpen ? "✕" : "☰";
        });

        document.querySelectorAll(".nav-links a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuBtn.textContent = "☰";
            });

        });
    }

    // ==========================================
    // ACTIVE NAVIGATION
    // ==========================================

    const sections = [
        ...document.querySelectorAll("section[id]")
    ];

    const navItems = [
        ...document.querySelectorAll(".nav-links a")
    ];

    function updateActiveNav() {

        if (!sections.length || !navItems.length) {
            return;
        }

        let current = "home";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;

            if (window.scrollY >= sectionTop) {
                current = section.id;
            }
        });

        navItems.forEach(link => {

            const href = link.getAttribute("href");

            link.classList.toggle(
                "active",
                href === `#${current}`
            );
        });
    }

    updateActiveNav();

    // ==========================================
    // DARK / LIGHT THEME
    // ==========================================

    if (themeToggle) {

        const savedTheme =
            localStorage.getItem("theme");

        if (savedTheme === "light") {
            document.body.classList.add("light");
            themeToggle.textContent = "☀";
        } else {
            themeToggle.textContent = "◐";
        }

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("light");

            const isLight =
                document.body.classList.contains("light");

            localStorage.setItem(
                "theme",
                isLight ? "light" : "dark"
            );

            themeToggle.textContent =
                isLight ? "☀" : "◐";
        });
    }

    // ==========================================
    // REVEAL ANIMATION
    // ==========================================

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const element = entry.target;

                element.classList.add("show");

                // Progress bars
                element
                    .querySelectorAll(".progress span")
                    .forEach(bar => {

                        const width =
                            bar.dataset.width;

                        if (width) {
                            setTimeout(() => {
                                bar.style.width = width;
                            }, 150);
                        }
                    });

                // Counters
                element
                    .querySelectorAll(".counter")
                    .forEach(counter => {

                        if (counter.dataset.done === "true") {
                            return;
                        }

                        counter.dataset.done = "true";

                        const target =
                            Number(counter.dataset.target);

                        if (Number.isNaN(target)) {
                            return;
                        }

                        let value = 0;

                        const duration = 1500;
                        const interval = 20;

                        const increment =
                            Math.max(
                                1,
                                Math.ceil(
                                    target /
                                    (duration / interval)
                                )
                            );

                        const timer =
                            setInterval(() => {

                                value += increment;

                                if (value >= target) {

                                    value = target;

                                    clearInterval(timer);
                                }

                                counter.textContent =
                                    value;
                            }, interval);
                    });
            });

        },
        {
            threshold: 0.15
        }
    );

    document
        .querySelectorAll(".reveal")
        .forEach(element => {
            observer.observe(element);
        });

    // ==========================================
    // TYPING ANIMATION
    // ==========================================

    const words = [
        "Software Developer",
        "Backend Developer",
        "Python Enthusiast",
        "Java Developer",
        "FastAPI Builder"
    ];

    const typing =
        document.getElementById("typing");

    if (typing) {

        let wordIndex = 0;
        let characterIndex = 0;
        let deleting = false;

        function typeLoop() {

            const word =
                words[wordIndex];

            typing.textContent =
                word.substring(
                    0,
                    characterIndex
                );

            if (!deleting) {

                if (characterIndex < word.length) {

                    characterIndex++;

                    setTimeout(
                        typeLoop,
                        90
                    );

                } else {

                    deleting = true;

                    setTimeout(
                        typeLoop,
                        1200
                    );
                }

            } else {

                if (characterIndex > 0) {

                    characterIndex--;

                    setTimeout(
                        typeLoop,
                        45
                    );

                } else {

                    deleting = false;

                    wordIndex =
                        (wordIndex + 1) %
                        words.length;

                    setTimeout(
                        typeLoop,
                        250
                    );
                }
            }
        }

        typeLoop();
    }

    // ==========================================
    // PROJECT FILTER
    // ==========================================

    const filterBtns =
        document.querySelectorAll(".filter-btn");

    const projects =
        document.querySelectorAll(".project");

    filterBtns.forEach(button => {

        button.addEventListener("click", () => {

            filterBtns.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const filter =
                button.dataset.filter;

            projects.forEach(project => {

                const category =
                    project.dataset.category;

                const shouldShow =
                    filter === "all" ||
                    category === filter;

                if (shouldShow) {

                    project.style.display = "";

                    setTimeout(() => {
                        project.classList.add("project-visible");
                    }, 10);

                } else {

                    project.classList.remove(
                        "project-visible"
                    );

                    project.style.display = "none";
                }
            });
        });
    });

    // ==========================================
    // CONTACT FORM
    // ==========================================

    const form =
        document.getElementById("contactForm");

    const popup =
        document.getElementById("popup");

    const popupMessage =
        document.getElementById("popupMessage");

    const popupClose =
        document.getElementById("popupClose");

    function showPopup(message) {

        if (!popup || !popupMessage) {
            alert(message);
            return;
        }

        popupMessage.textContent = message;

        popup.classList.remove("hidden");

        document.body.classList.add(
            "popup-open"
        );
    }

    function closePopup() {

        if (!popup) {
            return;
        }

        popup.classList.add("hidden");

        document.body.classList.remove(
            "popup-open"
        );
    }

    if (popupClose) {

        popupClose.addEventListener(
            "click",
            closePopup
        );
    }

    if (popup) {

        popup.addEventListener(
            "click",
            event => {

                if (event.target === popup) {
                    closePopup();
                }
            }
        );
    }

    // ESC closes popup/menu
    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closePopup();

                if (navLinks && menuBtn) {

                    navLinks.classList.remove(
                        "open"
                    );

                    menuBtn.textContent = "☰";

                    menuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );

    // ==========================================
    // INITIAL STATE
    // ==========================================

    handleScroll();

});