/* =========================================
   SEASONAL BACKGROUND
========================================= */

const seasons = {

    autumn: {
        colors: [
            "#D9823B",
            "#E6A04B",
            "#C96B3B",
            "#B9573E",
            "#D18A43"
        ]
    },

    winter: {
        colors: [
            "#DCEAF2",
            "#C7DCE9",
            "#B7D0E2",
            "#E8F0F5",
            "#AFC8DA"
        ]
    },

    spring: {
        colors: [
            "#7EAD69",
            "#91BC73",
            "#A7C97B",
            "#6D9F68",
            "#B1CE82"
        ]
    },

    summer: {
        colors: [
            "#6F9F5D",
            "#80AE62",
            "#92BA68",
            "#5D9359",
            "#A1C875"
        ]
    }

};


const seasonOrder = [
    "autumn",
    "winter",
    "spring",
    "summer"
];


const SEASON_DURATION = 30000;
const TRANSITION_DURATION = 7000;


/* =========================================
   REDUCED MOTION
========================================= */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =========================================
   COLOR HELPERS
========================================= */

function hexToRgb(hex) {

    hex = hex.replace("#", "");

    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };

}


function rgbToHex(r, g, b) {

    return (
        "#" +
        [r, g, b]
            .map(value =>
                Math.round(value)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );

}


function lerp(a, b, amount) {

    return a + (b - a) * amount;

}


function interpolateColor(colorA, colorB, amount) {

    const a = hexToRgb(colorA);
    const b = hexToRgb(colorB);

    return rgbToHex(
        lerp(a.r, b.r, amount),
        lerp(a.g, b.g, amount),
        lerp(a.b, b.b, amount)
    );

}


/* =========================================
   LEAF SYSTEM
========================================= */

class LeafSystem {

    constructor(canvas, seasonName) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.seasonName =
            seasonName;

        this.leaves = [];

        this.width = 0;
        this.height = 0;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.createLeaves();

    }


    resize() {

        const dpr =
            window.devicePixelRatio || 1;

        this.width =
            window.innerWidth;

        this.height =
            window.innerHeight;

        this.canvas.width =
            this.width * dpr;

        this.canvas.height =
            this.height * dpr;

        this.canvas.style.width =
            `${this.width}px`;

        this.canvas.style.height =
            `${this.height}px`;

        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    createLeaves() {

        const count =
            Math.floor(
                28 +
                Math.random() * 20
            );

        this.leaves = [];

        for (
            let i = 0;
            i < count;
            i++
        ) {

            this.leaves.push(
                this.createLeaf(true)
            );

        }

    }


    createLeaf(startAboveScreen = false) {

        const size =
            5 +
            Math.random() * 9;

        return {

            x:
                Math.random() *
                this.width,

            y:
                startAboveScreen
                    ? Math.random() *
                      this.height
                    : -20,

            size,

            speed:
                0.25 +
                Math.random() * 0.65,

            drift:
                (Math.random() - 0.5) *
                0.35,

            sway:
                Math.random() *
                Math.PI *
                2,

            swaySpeed:
                0.008 +
                Math.random() *
                0.018,

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                (Math.random() - 0.5) *
                0.015,

            opacity:
                0.25 +
                Math.random() * 0.4,

            colorIndex:
                Math.floor(
                    Math.random() *
                    seasons[
                        this.seasonName
                    ].colors.length
                )

        };

    }


    update() {

        for (
            let i = 0;
            i < this.leaves.length;
            i++
        ) {

            const leaf =
                this.leaves[i];

            leaf.y +=
                leaf.speed;

            leaf.sway +=
                leaf.swaySpeed;

            leaf.x +=
                leaf.drift +
                Math.sin(
                    leaf.sway
                ) * 0.25;

            leaf.rotation +=
                leaf.rotationSpeed;


            if (
                leaf.y >
                this.height + 30
            ) {

                this.leaves[i] =
                    this.createLeaf(false);

                this.leaves[i].y =
                    -20 -
                    Math.random() * 100;

            }


            if (
                leaf.x < -30
            ) {

                leaf.x =
                    this.width + 30;

            }


            if (
                leaf.x >
                this.width + 30
            ) {

                leaf.x =
                    -30;

            }

        }

    }


    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        const colors =
            seasons[
                this.seasonName
            ].colors;


        for (
            const leaf of this.leaves
        ) {

            const color =
                colors[
                    leaf.colorIndex %
                    colors.length
                ];

            this.ctx.save();

            this.ctx.translate(
                leaf.x,
                leaf.y
            );

            this.ctx.rotate(
                leaf.rotation
            );

            this.ctx.globalAlpha =
                leaf.opacity;

            this.ctx.fillStyle =
                color;


            this.ctx.beginPath();

            this.ctx.moveTo(
                0,
                -leaf.size
            );

            this.ctx.bezierCurveTo(
                leaf.size * 0.9,
                -leaf.size * 0.5,

                leaf.size * 0.9,
                leaf.size * 0.5,

                0,
                leaf.size
            );

            this.ctx.bezierCurveTo(
                -leaf.size * 0.9,
                leaf.size * 0.5,

                -leaf.size * 0.9,
                -leaf.size * 0.5,

                0,
                -leaf.size
            );

            this.ctx.fill();

            this.ctx.restore();

        }

    }


    animate() {

        this.update();

        this.draw();

        requestAnimationFrame(
            () => this.animate()
        );

    }

}


/* =========================================
   BACKGROUND INITIALIZATION
========================================= */

const gradientA =
    document.getElementById(
        "bg-gradient-a"
    );

const gradientB =
    document.getElementById(
        "bg-gradient-b"
    );

const particlesA =
    document.getElementById(
        "bg-particles-a"
    );

const particlesB =
    document.getElementById(
        "bg-particles-b"
    );


let activeGradient =
    gradientA;

let inactiveGradient =
    gradientB;

let activeParticles =
    particlesA;

let inactiveParticles =
    particlesB;

let currentSeasonIndex =
    0;

let activeSeason =
    seasonOrder[
        currentSeasonIndex
    ];


/* =========================================
   APPLY INITIAL SEASON
========================================= */

activeGradient.classList.add(
    activeSeason
);

activeParticles.style.opacity =
    "0.72";


const activeLeafSystem =
    new LeafSystem(
        activeParticles,
        activeSeason
    );

activeLeafSystem.animate();


let inactiveLeafSystem =
    null;


/* =========================================
   CHANGE SEASON
========================================= */

function changeSeason() {

    currentSeasonIndex =
        (
            currentSeasonIndex + 1
        ) %
        seasonOrder.length;


    const nextSeason =
        seasonOrder[
            currentSeasonIndex
        ];


    inactiveGradient.className =
        "bg-gradient";

    inactiveGradient.classList.add(
        nextSeason
    );


    inactiveParticles.style.opacity =
        "0";


    inactiveLeafSystem =
        new LeafSystem(
            inactiveParticles,
            nextSeason
        );

    inactiveLeafSystem.animate();


    requestAnimationFrame(() => {

        inactiveGradient.style.opacity =
            "1";

        activeGradient.style.opacity =
            "0";

        inactiveParticles.style.opacity =
            "0.72";

        activeParticles.style.opacity =
            "0";

    });


    setTimeout(() => {

        activeGradient.className =
            "bg-gradient";

        activeGradient.style.opacity =
            "0";

        activeParticles.style.opacity =
            "0";


        const oldGradient =
            activeGradient;

        activeGradient =
            inactiveGradient;

        inactiveGradient =
            oldGradient;


        const oldParticles =
            activeParticles;

        activeParticles =
            inactiveParticles;

        inactiveParticles =
            oldParticles;


        activeSeason =
            nextSeason;

    }, TRANSITION_DURATION);

}


/* =========================================
   SEASON TIMER
========================================= */

if (!prefersReducedMotion) {

    setInterval(
        changeSeason,
        SEASON_DURATION
    );

}

/* =========================================
   CLICK LEAF EFFECT
========================================= */


document.addEventListener("click", event => {

    /*
        Ignore clicks on anything interactive.
    */

    if (
        event.target.closest(
            "a, button, input, textarea, select, label"
        )
    ) {
        return;
    }


    /*
        Don't create leaves when reduced motion
        is enabled.
    */

    if (prefersReducedMotion) {
        return;
    }


    /*
        Create a small burst of leaves.
    */

    const leafCount = 5 + Math.floor(Math.random() * 4);


    for (let i = 0; i < leafCount; i++) {

        createClickLeaf(
            event.clientX,
            event.clientY
        );

    }

});


function createClickLeaf(x, y) {

    const leaf =
        document.createElement("span");

    leaf.className = "click-leaf";


    /*
        Pick a color from the CURRENT season.
    */

   const seasonColors = 
    seasons[activeSeason].colors;

    const color =
        seasonColors[
            Math.floor(
                Math.random() * seasonColors.length
            )
        ];


    leaf.style.left = `${x}px`;
    leaf.style.top = `${y}px`;
    leaf.style.background = color;


    /*
        Give every leaf slightly different
        movement and rotation.
    */

    const angle =
        Math.random() * Math.PI * 2;

    const distance =
        35 + Math.random() * 65;

    const startX =
        Math.cos(angle) * 8;

    const startY =
        Math.sin(angle) * 8;

    const endX =
        Math.cos(angle) * distance;

    const endY =
        Math.sin(angle) * distance;


    leaf.style.setProperty(
        "--start-x",
        `${startX}px`
    );

    leaf.style.setProperty(
        "--start-y",
        `${startY}px`
    );

    leaf.style.setProperty(
        "--end-x",
        `${endX}px`
    );

    leaf.style.setProperty(
        "--end-y",
        `${endY}px`
    );

    leaf.style.setProperty(
        "--start-rotation",
        `${Math.random() * 360}deg`
    );

    leaf.style.setProperty(
        "--end-rotation",
        `${360 + Math.random() * 720}deg`
    );

    leaf.style.setProperty(
        "--leaf-duration",
        `${1.1 + Math.random() * 0.8}s`
    );


    /*
        Slightly randomize the shape.
    */

    const scale =
        0.7 + Math.random() * 0.7;

    leaf.style.width =
        `${12 * scale}px`;

    leaf.style.height =
        `${8 * scale}px`;


    document.body.appendChild(leaf);


    /*
        Clean it up afterwards.
    */

    setTimeout(() => {
        leaf.remove();
    }, 2200);

}


/* =========================================
   HERO NAME LETTER REVEAL
========================================= */

const hero =
    document.querySelector(
        ".hero"
    );

const heroName =
    document.querySelector(
        ".hero-name"
    );


if (heroName) {

    const firstLine =
        heroName.querySelector(
            ".name-line"
        );

    const secondLine =
        heroName.querySelector(
            ".name-line-second"
        );


    /* FIRST LINE */

    if (firstLine) {

        firstLine
            .querySelectorAll(
                ".letter"
            )
            .forEach(
                (letter, index) => {

                    /*
                       The space does not need
                       its own delay.
                    */

                    if (
                        letter.classList.contains(
                            "space"
                        )
                    ) {

                        return;

                    }

                    letter.style.setProperty(
                        "--letter-delay",
                        `${0.10 + index * 0.045}s`
                    );

                }
            );

    }


    /* SECOND LINE */

    if (secondLine) {

        secondLine
            .querySelectorAll(
                ".letter"
            )
            .forEach(
                (letter, index) => {

                    letter.style.setProperty(
                        "--letter-delay",
                        `${0.62 + index * 0.055}s`
                    );

                }
            );

    }


    /* =========================================
       PLAY HERO ANIMATION
    ========================================= */

    function playHeroName() {

        if (
            !heroName ||
            prefersReducedMotion
        ) {

            return;

        }


        /*
           Remove the class first.
           Force a reflow.
           Add it again.

           This makes the CSS animation
           properly restart.
        */

        heroName.classList.remove(
            "play"
        );

        void heroName.offsetWidth;

        heroName.classList.add(
            "play"
        );

    }


    /* =========================================
       INITIAL LOAD
    ========================================= */

    if (prefersReducedMotion) {

        heroName.classList.add(
            "play"
        );

    } else {

        /*
           Small delay so the page has loaded
           before the name starts appearing.
        */

        window.setTimeout(
            playHeroName,
            150
        );

    }


    /* =========================================
       REPLAY WHEN RETURNING TO HERO
    ========================================= */

    if (
        hero &&
        !prefersReducedMotion
    ) {

        let heroWasVisible =
            true;


        const heroNameObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                if (
                                    !heroWasVisible
                                ) {

                                    playHeroName();

                                }

                                heroWasVisible =
                                    true;

                            } else {

                                heroWasVisible =
                                    false;

                            }

                        }
                    );

                },
                {
                    threshold:
                        0.35
                }
            );


        heroNameObserver.observe(
            hero
        );

    }

}


/* =========================================
   SCROLL REVEALS
========================================= */

const heroMediaEls = document.querySelectorAll(".project-hero-media.reveal");
const otherRevealEls = document.querySelectorAll(".reveal:not(.project-hero-media)");

if (prefersReducedMotion) {

    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));

} else {

    // Reveal once, and stagger elements that enter the screen together
    const revealObserver = new IntersectionObserver(entries => {
        let step = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Math.min(step * 0.09, 0.45);
            step++;
            if (delay > 0) {
                el.style.transitionDelay = delay + "s";
                // clear it afterwards so hover effects aren't delayed
                setTimeout(() => { el.style.transitionDelay = ""; }, (delay + 1.2) * 1000);
            }
            el.classList.add("visible");
            revealObserver.unobserve(el);
        });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });

    otherRevealEls.forEach(el => revealObserver.observe(el));

    // Hero media: don't start observing until the user actually scrolls,
    // so it never reveals on initial load even if it fits in the viewport.
    function startObservingHeroMedia() {
        heroMediaEls.forEach(el => revealObserver.observe(el));
        window.removeEventListener("scroll", startObservingHeroMedia);
    }

    if (heroMediaEls.length) {
        window.addEventListener("scroll", startObservingHeroMedia, { passive: true, once: true });
    }
}


/* =========================================
   SCROLL PROGRESS
========================================= */

const scrollProgress =
    document.getElementById(
        "scroll-progress"
    );


function updateScrollProgress() {

    if (!scrollProgress) {
        return;
    }


    const scrollTop =
        window.scrollY;

    const documentHeight =
        document.documentElement
            .scrollHeight -
        window.innerHeight;


    if (
        documentHeight <= 0
    ) {

        scrollProgress.style.width =
            "0%";

        return;

    }


    const progress =
        (
            scrollTop /
            documentHeight
        ) * 100;


    scrollProgress.style.width =
        `${progress}%`;

}


window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
        passive: true
    }
);


updateScrollProgress();




/* =========================================
   SMOOTH ANCHOR NAVIGATION
========================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const targetId =
                        anchor.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth"

                    });

                }
            );

        }
    );

   
/* =========================================
   PROJECT GALLERY
   Dynamic image count + full-screen viewer
========================================= */

let currentGalleryImages = [];
let currentGalleryIndex = 0;
let currentGalleryLightbox = null;
let currentGalleryContent = null;

function openGallery(index = 0) {
    const gallery = document.querySelector(".project-gallery");
    if (!gallery) return;

    currentGalleryLightbox =
        gallery.parentElement.querySelector(".gallery-lightbox");

    if (!currentGalleryLightbox) return;

    currentGalleryContent =
        currentGalleryLightbox.querySelector(".gallery-lightbox-content");

    if (!currentGalleryContent) return;

    currentGalleryImages = Array.from(
        currentGalleryContent.querySelectorAll("img")
    );

    if (!currentGalleryImages.length) return;

    showGalleryImage(index);

    currentGalleryLightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function showGalleryImage(index) {
    if (!currentGalleryImages.length || !currentGalleryContent) return;

    currentGalleryIndex =
        (index + currentGalleryImages.length) %
        currentGalleryImages.length;

    currentGalleryImages.forEach((img, i) => {
        img.classList.toggle("is-active", i === currentGalleryIndex);
    });

    let counter = currentGalleryContent.querySelector(
        ".gallery-image-counter"
    );

    if (!counter) {
        counter = document.createElement("div");
        counter.className = "gallery-image-counter";
        currentGalleryContent.appendChild(counter);
    }

    counter.textContent =
        `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
}

function closeGallery() {
    if (!currentGalleryLightbox) {
        currentGalleryLightbox =
            document.querySelector(".gallery-lightbox");
    }

    if (currentGalleryLightbox) {
        currentGalleryLightbox.style.display = "none";
    }

    document.body.style.overflow = "";
}

function nextGalleryImage() {
    showGalleryImage(currentGalleryIndex + 1);
}

function previousGalleryImage() {
    showGalleryImage(currentGalleryIndex - 1);
}


/* INITIALISE EACH PROJECT GALLERY */

document.querySelectorAll(".project-gallery").forEach(gallery => {
    const lightbox =
        gallery.parentElement.querySelector(".gallery-lightbox");

    if (!lightbox) return;

    const content =
        lightbox.querySelector(".gallery-lightbox-content");

    if (!content) return;

    const allImages = Array.from(content.querySelectorAll("img"));
    const thumbnails = Array.from(gallery.querySelectorAll("img"));
    const moreButton = gallery.querySelector(".gallery-more");

    /* Automatically calculate how many images are hidden */

    if (moreButton) {
        const hiddenCount = Math.max(
            0,
            allImages.length - thumbnails.length
        );

        const label = moreButton.querySelector("span");

        if (label) {
            label.textContent =
                hiddenCount > 0 ? `+${hiddenCount} more` : "";
        }

        moreButton.style.display =
            hiddenCount > 0 ? "" : "none";
    }

    /* Clicking a thumbnail opens that image */

    thumbnails.forEach(thumbnail => {
        thumbnail.style.cursor = "pointer";

        thumbnail.addEventListener("click", () => {
            const source = thumbnail.getAttribute("src");

            const index = allImages.findIndex(
                img => img.getAttribute("src") === source
            );

            openGallery(index >= 0 ? index : 0);
        });
    });

    /* Close when clicking the dark area around the image */

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            closeGallery();
        }
    });

    /* Create navigation arrows */

    if (!lightbox.querySelector(".gallery-prev")) {
        const previous = document.createElement("button");

        previous.className = "gallery-prev";
        previous.type = "button";
        previous.textContent = "←";
        previous.setAttribute("aria-label", "Previous image");

        previous.addEventListener("click", previousGalleryImage);
        lightbox.appendChild(previous);
    }

    if (!lightbox.querySelector(".gallery-next")) {
        const next = document.createElement("button");

        next.className = "gallery-next";
        next.type = "button";
        next.textContent = "→";
        next.setAttribute("aria-label", "Next image");

        next.addEventListener("click", nextGalleryImage);
        lightbox.appendChild(next);
    }
});


/* KEYBOARD CONTROLS */

document.addEventListener("keydown", event => {
    if (
        !currentGalleryLightbox ||
        currentGalleryLightbox.style.display === "none" ||
        !currentGalleryImages.length
    ) {
        return;
    }

    if (event.key === "Escape") {
        closeGallery();
    } else if (event.key === "ArrowRight") {
        nextGalleryImage();
    } else if (event.key === "ArrowLeft") {
        previousGalleryImage();
    }
});

/* =========================================
   ABOUT PHOTO GALLERY LIGHTBOX
========================================= */

const aboutPhotoGrid = document.querySelector(".about-photo-grid");

if (aboutPhotoGrid) {
    const aboutPhotos = Array.from(
        aboutPhotoGrid.querySelectorAll(".about-photo img")
    );

    if (aboutPhotos.length > 0) {
        const lightbox = document.createElement("div");
        lightbox.className = "about-lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Photo viewer");

        lightbox.innerHTML = `
            <button class="about-lightbox-close"
                    type="button"
                    aria-label="Close photo viewer">×</button>

            <button class="about-lightbox-prev"
                    type="button"
                    aria-label="Previous photo">←</button>

            <img class="about-lightbox-image" alt="">

            <button class="about-lightbox-next"
                    type="button"
                    aria-label="Next photo">→</button>

            <div class="about-lightbox-counter"></div>
        `;

        document.body.appendChild(lightbox);

        const lightboxImage = lightbox.querySelector(
            ".about-lightbox-image"
        );

        const counter = lightbox.querySelector(
            ".about-lightbox-counter"
        );

        const closeButton = lightbox.querySelector(
            ".about-lightbox-close"
        );

        const previousButton = lightbox.querySelector(
            ".about-lightbox-prev"
        );

        const nextButton = lightbox.querySelector(
            ".about-lightbox-next"
        );

        let currentIndex = 0;
        let previouslyFocused = null;

        function showAboutPhoto(index) {
            currentIndex =
                (index + aboutPhotos.length) % aboutPhotos.length;

            const photo = aboutPhotos[currentIndex];

            lightboxImage.src = photo.src;
            lightboxImage.alt = photo.alt || "About Me photo";

            counter.textContent =
                `${currentIndex + 1} / ${aboutPhotos.length}`;
        }

        function openAboutPhoto(index) {
            previouslyFocused = document.activeElement;

            showAboutPhoto(index);

            lightbox.classList.add("is-open");
            document.body.style.overflow = "hidden";

            closeButton.focus();
        }

        function closeAboutPhoto() {
            lightbox.classList.remove("is-open");
            document.body.style.overflow = "";

            lightboxImage.removeAttribute("src");

            if (previouslyFocused) {
                previouslyFocused.focus();
            }
        }

        function showNextAboutPhoto() {
            showAboutPhoto(currentIndex + 1);
        }

        function showPreviousAboutPhoto() {
            showAboutPhoto(currentIndex - 1);
        }

        // Make every gallery photo clickable
        aboutPhotos.forEach((photo, index) => {
            photo.style.cursor = "pointer";

            photo.addEventListener("click", () => {
                openAboutPhoto(index);
            });
        });

        // Lightbox controls
        closeButton.addEventListener(
            "click",
            closeAboutPhoto
        );

        nextButton.addEventListener(
            "click",
            showNextAboutPhoto
        );

        previousButton.addEventListener(
            "click",
            showPreviousAboutPhoto
        );

        // Close when clicking the dark background
        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) {
                closeAboutPhoto();
            }
        });

        // Keyboard controls
        document.addEventListener("keydown", event => {
            if (!lightbox.classList.contains("is-open")) {
                return;
            }

            if (event.key === "Escape") {
                closeAboutPhoto();
            } else if (event.key === "ArrowRight") {
                showNextAboutPhoto();
            } else if (event.key === "ArrowLeft") {
                showPreviousAboutPhoto();
            }
        });
    }
}


/* =========================================
   PROJECT PAGE — CLICKABLE IMAGES
   Images inside links (project cards, social
   icons, next-project links) are skipped, so
   they just follow their link.
========================================= */

const projectImages = Array.from(
    document.querySelectorAll("main img")
).filter(image =>
    !image.closest(".gallery-lightbox") &&
    !image.closest("a")
);

if (projectImages.length > 0) {
    const projectLightbox = document.createElement("div");

    projectLightbox.className = "about-lightbox";
    projectLightbox.setAttribute("role", "dialog");
    projectLightbox.setAttribute("aria-modal", "true");
    projectLightbox.setAttribute("aria-label", "Project image viewer");

    projectLightbox.innerHTML = `
        <button class="about-lightbox-close"
                type="button"
                aria-label="Close image viewer">×</button>

        <button class="about-lightbox-prev"
                type="button"
                aria-label="Previous image">←</button>

        <img class="about-lightbox-image" alt="">

        <button class="about-lightbox-next"
                type="button"
                aria-label="Next image">→</button>

        <div class="about-lightbox-counter"></div>
    `;

    document.body.appendChild(projectLightbox);

    const imageElement = projectLightbox.querySelector(
        ".about-lightbox-image"
    );

    const counterElement = projectLightbox.querySelector(
        ".about-lightbox-counter"
    );

    const closeButton = projectLightbox.querySelector(
        ".about-lightbox-close"
    );

    const previousButton = projectLightbox.querySelector(
        ".about-lightbox-prev"
    );

    const nextButton = projectLightbox.querySelector(
        ".about-lightbox-next"
    );

    let currentProjectImage = 0;
    let previousFocus = null;

    function showProjectImage(index) {
        currentProjectImage =
            (index + projectImages.length) % projectImages.length;

        const image = projectImages[currentProjectImage];

        imageElement.src = image.currentSrc || image.src;
        imageElement.alt = image.alt || "Project image";

        counterElement.textContent =
            `${currentProjectImage + 1} / ${projectImages.length}`;
    }

    function openProjectImage(index) {
        previousFocus = document.activeElement;

        showProjectImage(index);

        projectLightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";

        closeButton.focus();
    }

    function closeProjectImage() {
        projectLightbox.classList.remove("is-open");
        document.body.style.overflow = "";

        imageElement.removeAttribute("src");

        if (previousFocus) {
            previousFocus.focus();
        }
    }

    function nextProjectImage() {
        showProjectImage(currentProjectImage + 1);
    }

    function previousProjectImage() {
        showProjectImage(currentProjectImage - 1);
    }

    projectImages.forEach((image, index) => {
        image.style.cursor = "pointer";

        image.addEventListener("click", () => {
            openProjectImage(index);
        });
    });

    closeButton.addEventListener("click", closeProjectImage);
    nextButton.addEventListener("click", nextProjectImage);
    previousButton.addEventListener("click", previousProjectImage);

    projectLightbox.addEventListener("click", event => {
        if (event.target === projectLightbox) {
            closeProjectImage();
        }
    });

    document.addEventListener("keydown", event => {
        if (!projectLightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeProjectImage();
        } else if (event.key === "ArrowRight") {
            nextProjectImage();
        } else if (event.key === "ArrowLeft") {
            previousProjectImage();
        }
    });
}

/* =========================================
   CUSTOM CURSOR
========================================= */

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {

    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");

    if (cursorDot && cursorRing) {

        document.body.classList.add("has-custom-cursor");

        const hoverTargets =
            "a, button, .project-card, main img, .about-lightbox-image";

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        let ringX = mouseX;
        let ringY = mouseY;

        document.addEventListener("mousemove", event => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;

            cursorDot.style.opacity = "1";
            cursorRing.style.opacity = "1";
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;

            requestAnimationFrame(animateRing);
        }

        animateRing();

        // label shown inside the ring over project cards
        const cursorLabel = document.createElement("span");
        cursorLabel.className = "cursor-label";
        cursorLabel.innerHTML = "View<br>project";
        cursorRing.appendChild(cursorLabel);

        document.addEventListener("mouseover", event => {
            if (event.target.closest(hoverTargets)) {
                cursorRing.classList.add("is-active");
            }
            const onCard = !!event.target.closest(".project-card");
            cursorRing.classList.toggle("is-view", onCard);
            cursorDot.classList.toggle("is-hidden", onCard);
        });

        document.addEventListener("mouseout", event => {
            if (event.target.closest(hoverTargets)) {
                cursorRing.classList.remove("is-active");
            }
            const to = event.relatedTarget;
            if (!to || !to.closest || !to.closest(".project-card")) {
                cursorRing.classList.remove("is-view");
                cursorDot.classList.remove("is-hidden");
            }
        });

        document.addEventListener("mouseleave", () => {
            cursorDot.style.opacity = "0";
            cursorRing.style.opacity = "0";
        });
    }
}

/* =========================================
   NAVIGATION — sticky header + current page
========================================= */

(function () {
    const header = document.querySelector(".site-header");
    if (!header) return;

    // Show/hide on scroll direction
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 20);

        lastY = y;
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    onScroll();


    // Highlight the current page
    const links = header.querySelectorAll(".nav-links a[data-nav]");
    function setActive(name) {
        links.forEach(a => {
            const on = a.dataset.nav === name;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "page");
            else a.removeAttribute("aria-current");
        });
    }

    const page = document.body.dataset.page || "home";
    setActive(page);

    // On the homepage, follow the section you're in
    if (page === "home") {
        const sections = ["work", "research", "contact"]
            .map(id => document.getElementById(id))
            .filter(Boolean);

        function updateFromScroll() {
            let current = "home";
            sections.forEach(sec => {
                if (sec.getBoundingClientRect().top < window.innerHeight * 0.4) {
                    current = sec.id;
                }
            });
            // at the very bottom of the page, the last section is the current one
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
                current = "contact";
            }
            setActive(current);
        }

        window.addEventListener("scroll", updateFromScroll, { passive: true });
        updateFromScroll();
    }
})();


/* =========================================
   BACK BUTTON — returns to the page you came from
========================================= */

(function () {
    const btn = document.querySelector(".nav-history");
    let previous = null;

    try {
        previous = JSON.parse(sessionStorage.getItem("kfaLastPage") || "null");
        // remember this page for the next one
        sessionStorage.setItem("kfaLastPage", JSON.stringify({
            url: location.href.split("#")[0],
            title: (document.body.dataset.page === "home")
                ? "Home"
                : document.title.split(/\s[—–|-]\s/)[0].trim()
        }));
    } catch (e) { /* storage blocked: just don't show the button */ }

    if (!btn || !previous || previous.url === location.href.split("#")[0]) return;

    btn.hidden = false;
    btn.title = "Back to " + previous.title;
    btn.setAttribute("aria-label", "Back to " + previous.title);

    btn.addEventListener("click", () => {
        // history.back keeps the scroll position you left the page at
        if (history.length > 1) history.back();
        else location.href = previous.url;
    });
})();


/* =========================================
   LEAF TRAIL — hold the mouse button and drag
========================================= */

(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return; // mouse only

    const canvas = document.createElement("canvas");
    canvas.className = "leaf-trail";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let w = 0, h = 0;
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const leaves = [];
    const MAX_LEAVES = 140;
    let dragging = false;
    let lastX = 0, lastY = 0, distSinceLeaf = 0;
    let running = false;

    function currentColors() {
        try { return seasons[activeSeason].colors; }
        catch (e) { return ["#D9823B", "#E6A04B", "#C96B3B"]; }
    }

    function spawn(x, y, dx, dy) {
        const colors = currentColors();
        const speed = Math.min(Math.hypot(dx, dy), 30);
        leaves.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            // drift a little in the drag direction, then fall
            vx: dx * 0.04 + (Math.random() - 0.5) * 1.2,
            vy: dy * 0.04 - Math.random() * 0.8,
            size: 5 + Math.random() * 5 + speed * 0.08,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.12,
            sway: Math.random() * Math.PI * 2,
            life: 0,
            maxLife: 70 + Math.random() * 50,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
        if (leaves.length > MAX_LEAVES) leaves.shift();
    }

    function drawLeaf(l, alpha) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = l.color;
        const s = l.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.9, s * 0.5, 0, s);
        ctx.bezierCurveTo(-s * 0.9, s * 0.5, -s * 0.9, -s * 0.5, 0, -s);
        ctx.fill();
        ctx.restore();
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);
        for (let i = leaves.length - 1; i >= 0; i--) {
            const l = leaves[i];
            l.life++;
            l.sway += 0.08;
            l.vy += 0.035;              // gentle gravity
            l.vx *= 0.98;
            l.x += l.vx + Math.sin(l.sway) * 0.5;
            l.y += l.vy;
            l.rot += l.vr;
            const t = l.life / l.maxLife;
            if (t >= 1) { leaves.splice(i, 1); continue; }
            // quick fade in, slow fade out
            const alpha = t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9;
            drawLeaf(l, alpha * 0.9);
        }
        if (leaves.length || dragging) {
            requestAnimationFrame(tick);
        } else {
            running = false;
            ctx.clearRect(0, 0, w, h);
        }
    }

    function start() {
        if (!running) { running = true; requestAnimationFrame(tick); }
    }

    // Drags that start on empty background shouldn't highlight text.
    // Only counts as "text" when the mouse is really on letters.
    const INTERACTIVE = "a, button, input, textarea, select, label, img, video, iframe, [contenteditable]";

    function pointIsOnText(x, y) {
        let node = null, offset = 0;
        if (document.caretRangeFromPoint) {
            const r = document.caretRangeFromPoint(x, y);
            if (r) { node = r.startContainer; offset = r.startOffset; }
        } else if (document.caretPositionFromPoint) {
            const p = document.caretPositionFromPoint(x, y);
            if (p) { node = p.offsetNode; offset = p.offset; }
        }
        if (!node || node.nodeType !== 3 || !node.textContent.trim()) return false;
        const range = document.createRange();
        range.setStart(node, Math.max(0, offset - 1));
        range.setEnd(node, Math.min(node.length, offset + 1));
        for (const rect of range.getClientRects()) {
            if (x >= rect.left - 2 && x <= rect.right + 2 &&
                y >= rect.top - 2 && y <= rect.bottom + 2) return true;
        }
        return false;
    }

    window.addEventListener("mousedown", e => {
        if (e.button !== 0) return;
        if (e.target.closest && e.target.closest(INTERACTIVE)) return;
        if (pointIsOnText(e.clientX, e.clientY)) return;
        e.preventDefault();
        const sel = window.getSelection && window.getSelection();
        if (sel) sel.removeAllRanges();
    });

    window.addEventListener("pointerdown", e => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        distSinceLeaf = 0;
    });

    window.addEventListener("pointermove", e => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        distSinceLeaf += Math.hypot(dx, dy);
        // one leaf roughly every 14px of movement
        while (distSinceLeaf > 14) {
            spawn(e.clientX, e.clientY, dx, dy);
            distSinceLeaf -= 14;
        }
        lastX = e.clientX;
        lastY = e.clientY;
        start();
    });

    const stop = () => { dragging = false; };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    // native drags (images/links) swallow pointer events; end the trail cleanly
    window.addEventListener("dragstart", stop);
})();


/* =========================================
   CONTACT — copy email button
========================================= */

document.querySelectorAll(".contact-copy").forEach(btn => {
    const label = btn.querySelector(".contact-copy-text");
    const original = label.textContent;
    btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            // fallback for older browsers / file://
            const t = document.createElement("textarea");
            t.value = text;
            t.style.position = "fixed";
            t.style.opacity = "0";
            document.body.appendChild(t);
            t.select();
            try { document.execCommand("copy"); } catch (err) {}
            t.remove();
        }
        label.textContent = "Copied ✓";
        btn.classList.add("is-copied");
        setTimeout(() => {
            label.textContent = original;
            btn.classList.remove("is-copied");
        }, 1800);
    });
});


/* =========================================
   PROJECT CARDS — play a video preview on hover
   (mouse only; the video loads the first time you hover)
========================================= */

(function () {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (!canHover || reduceMotion || saveData) return;

    document.querySelectorAll(".project-card[data-preview]").forEach(card => {
        const box = card.querySelector(".project-image");
        if (!box) return;
        let video = null;
        let hovering = false;
        let startTime = null;   // set once the video's length is known

        function ensureVideo() {
            if (video) return video;
            video = document.createElement("video");
            video.className = "project-preview-video";
            video.src = card.dataset.preview;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("aria-hidden", "true");

            // skip intro/title cards: start a little way in
            video.addEventListener("loadedmetadata", () => {
                const custom = parseFloat(card.dataset.previewStart);
                startTime = !isNaN(custom)
                    ? custom
                    : Math.min(video.duration * 0.15, 20);
                if (!isFinite(startTime)) startTime = 0;
                video.currentTime = startTime;
            }, { once: true });

            video.addEventListener("playing", () => {
                if (hovering) video.classList.add("is-playing");
            });

            const img = box.querySelector("img");
            img ? img.after(video) : box.prepend(video);
            return video;
        }

        card.addEventListener("mouseenter", () => {
            hovering = true;
            const v = ensureVideo();
            // always start from the beginning of the preview
            if (startTime !== null) v.currentTime = startTime;
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
        });

        card.addEventListener("mouseleave", () => {
            hovering = false;
            if (!video) return;
            video.classList.remove("is-playing");
            video.pause();
        });
    });
})();


/* About page: videos can start a few seconds in (data-start="12") */
document.querySelectorAll(".ab-figure video[data-start]").forEach(v => {
    const start = parseFloat(v.dataset.start) || 0;
    const jump = () => { try { v.currentTime = start; } catch (e) {} };
    if (v.readyState >= 1) jump();
    else v.addEventListener("loadedmetadata", jump, { once: true });
    v.addEventListener("ended", jump);
});

/* ===== About page: click a film to watch it full screen with sound ===== */
(function () {
    document.querySelectorAll('.ab-video-play').forEach(function (btn) {
        var video = btn.querySelector('video');
        if (!video) return;

        function backToPreview() {
            video.muted = true;
            video.controls = false;
            video.play().catch(function () {});
        }

        btn.addEventListener('click', function () {
            // clicks on the player controls while in full screen shouldn't restart it
            if (document.fullscreenElement || document.webkitFullscreenElement) return;
            // stop sound on any other film
            document.querySelectorAll('.ab-video-play video').forEach(function (v) {
                if (v !== video) { v.muted = true; }
            });
            video.currentTime = 0;
            video.muted = false;
            video.controls = true;
            video.play().catch(function () {});

            if (video.requestFullscreen) {
                video.requestFullscreen().catch(function () {});
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen(); // iPhone
            }
        });

        document.addEventListener('fullscreenchange', function () {
            if (!document.fullscreenElement) backToPreview();
        });
        document.addEventListener('webkitfullscreenchange', function () {
            if (!document.webkitFullscreenElement) backToPreview();
        });
        video.addEventListener('webkitendfullscreen', backToPreview); // iPhone
    });
})();

/* ===== Project pages: big play button on videos ===== */
(function () {
    document.querySelectorAll('.pj-video').forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var btn = wrap.querySelector('.pj-play');
        if (!video || !btn) return;
        btn.addEventListener('click', function () {
            video.controls = true;
            wrap.classList.add('is-playing');
            video.play().catch(function () {});
        });
        video.addEventListener('play', function () { wrap.classList.add('is-playing'); });
    });
})();

/* ===== Normal mouse while something is full screen ===== */
(function () {
    function update() {
        var fs = document.fullscreenElement || document.webkitFullscreenElement;
        document.body.classList.toggle('is-fullscreen', !!fs);
    }
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
})();

/* ===== Sound on/off button on looping videos ===== */
(function () {
    document.querySelectorAll('.ab-sound-btn').forEach(function (btn) {
        var video = btn.parentElement.querySelector('video');
        if (!video) return;
        btn.addEventListener('click', function () {
            var turnOn = video.muted;
            document.querySelectorAll('video').forEach(function (v) { if (v !== video) v.muted = true; });
            document.querySelectorAll('.ab-sound-btn').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Turn sound on'); });
            video.muted = !turnOn;
            if (turnOn) { video.currentTime = 0; video.play().catch(function () {}); }
            btn.setAttribute('aria-pressed', turnOn ? 'true' : 'false');
            btn.setAttribute('aria-label', turnOn ? 'Turn sound off' : 'Turn sound on');
        });
    });
})();

/* ===== Plan Bee: season switcher (auto-plays, stops when clicked) ===== */
(function () {
    document.querySelectorAll('[data-seasons]').forEach(function (box) {
        var imgs = box.querySelectorAll('.pj-seasons-stage img');
        var tabs = box.querySelectorAll('.pj-seasons-tabs button');
        var i = 0, timer = null;
        function show(n) {
            i = n;
            imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === n); });
            tabs.forEach(function (t, k) { t.classList.toggle('is-active', k === n); });
        }
        tabs.forEach(function (t, k) {
            t.addEventListener('click', function () { clearInterval(timer); show(k); });
        });
        timer = setInterval(function () { show((i + 1) % imgs.length); }, 3000);
    });
})();

/* ===== UI sounds: soft click (made in code, no files) ===== */
(function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx = null, noise = null;
    var enabled = true;
    try { enabled = localStorage.getItem('kfaSound') !== 'off'; } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        try { if (localStorage.getItem('kfaSound') === null) enabled = false; } catch (e) {}
    }

    function audio() {
        if (!ctx) {
            ctx = new AC();
            var len = ctx.sampleRate * 1;
            noise = ctx.createBuffer(1, len, ctx.sampleRate);
            var d = noise.getChannelData(0);
            for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function click() {
        if (!enabled) return;
        var c = audio(), t = c.currentTime;
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(880, t);
        o.frequency.exponentialRampToValueAtTime(420, t + 0.07);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.connect(g).connect(c.destination);
        o.start(t); o.stop(t + 0.1);
    }

    var lastWhoosh = 0;
    function whoosh(strength) {
        if (!enabled) return;
        var c = audio(), t = c.currentTime;
        var s = c.createBufferSource(); s.buffer = noise;
        var f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
        f.frequency.setValueAtTime(400, t);
        f.frequency.exponentialRampToValueAtTime(1600 + 1400 * strength, t + 0.18);
        f.frequency.exponentialRampToValueAtTime(500, t + 0.45);
        var g = c.createGain();
        var peak = 0.05 + 0.1 * strength;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        s.connect(f).connect(g).connect(c.destination);
        s.start(t, Math.random() * 0.4); s.stop(t + 0.55);
    }

    // click sound on links, buttons and project cards — turned off for now.
    // To turn it back on, remove the /* and */ around the next block.
    /*
    document.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        if (e.target.closest && e.target.closest('a, button, [role="button"], .project-card, summary, label')) click();
    }, true);
    */

    // small sound on/off button (bottom-left), choice is remembered
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'site-sound-toggle';
    btn.innerHTML =
        '<svg class="off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>' +
        '<svg class="on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
    function sync() {
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        btn.setAttribute('aria-label', enabled ? 'Turn interface sounds off' : 'Turn interface sounds on');
        btn.title = enabled ? 'Sounds on' : 'Sounds off';
    }
    btn.addEventListener('click', function () {
        enabled = !enabled;
        try { localStorage.setItem('kfaSound', enabled ? 'on' : 'off'); } catch (e) {}
        sync();
        if (enabled) click();
    });
    sync();
    // the sound button is hidden while there are no interface sounds
    // document.body.appendChild(btn);
})();

/* ===== Fun fact: replay the marker highlight each time it comes into view ===== */
(function () {
    var clips = document.querySelectorAll('.ab-clip');
    if (!clips.length || !('IntersectionObserver' in window)) {
        clips.forEach(function (c) { c.classList.add('hl-on'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) en.target.classList.add('hl-on');
            else en.target.classList.remove('hl-on');
        });
    }, { threshold: 0.6 });
    clips.forEach(function (c) { io.observe(c); });
})();
