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

        var previewSrc = video.getAttribute('src'), fullSrc = video.getAttribute('data-full');
        function backToPreview() {
            if (fullSrc && video.getAttribute('src') !== previewSrc) { video.src = previewSrc; video.loop = true; }
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
            if (fullSrc) { video.src = fullSrc; video.loop = false; }   // play the whole film, not just the preview clip
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

/* =========================================================
   Project quick-switcher (side rail on project pages)
   ========================================================= */
(function () {
    if (!/\/projects\/[^/]+\.html/.test(location.pathname)) return;
    var projects = [
        ['womens-suffrage', '🗳️', "Women's Suffrage"],
        ['hearing-loss', '👂', 'Hearing Loss'],
        ['dance-pads', '💃', 'Dance Pads'],
        ['nico-nitro', '✋', 'Nico Nitro'],
        ['liv', '📖', 'LIV'],
        ['blue-planet', '🐢', 'Blue Planet'],
        ['plan-bee', '🐝', 'Plan Bee'],
        ['trivia-quiz', '❓', 'Trivia Quiz'],
        ['harry-potter-escape-room', '🪄', 'Harry Potter'],
        ['zombie-game', '🧟', 'Zombie Game'],
        ['but-worse-resident-evil', '🔦', 'Resident Evil']
    ];
    var here = location.pathname.split('/').pop().replace('.html', '');
    var nav = document.createElement('nav');
    nav.className = 'pj-switch';
    nav.setAttribute('aria-label', 'All projects');
    var html = '<button class="pj-switch-toggle" type="button" aria-expanded="false">' +
        '<span aria-hidden="true">☰</span> Projects</button>' +
        '<div class="pj-switch-panel"><span class="pj-switch-label">Projects</span><ol>';
    projects.forEach(function (p, i) {
        var cur = p[0] === here;
        html += '<li><a href="' + p[0] + '.html"' + (cur ? ' class="is-current" aria-current="page"' : '') + '>' +
            '<i aria-hidden="true">' + p[1] + '</i><span class="pj-switch-num">' + String(i + 1).padStart(2, '0') +
            '</span><span class="pj-switch-name">' + p[2] + '</span></a></li>';
    });
    html += '</ol><a class="pj-switch-all" href="../index.html#projects">← All projects</a></div>';
    nav.innerHTML = html;
    document.body.appendChild(nav);
    var btn = nav.querySelector('.pj-switch-toggle');
    btn.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
})();

/* =========================================================
   Project cards: gameplay clip after hovering ~1.2 s
   ========================================================= */
(function () {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.project-card[data-loop]').forEach(function (card) {
        var box = card.querySelector('.project-image');
        if (!box) return;
        var timer = null, video = null;
        card.addEventListener('mouseenter', function () {
            timer = setTimeout(function () {
                if (!video) {
                    video = document.createElement('video');
                    video.className = 'project-hover-video';
                    video.src = card.getAttribute('data-loop');
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    video.setAttribute('aria-hidden', 'true');
                    video.addEventListener('playing', function () { video.classList.add('is-on'); });
                    box.appendChild(video);
                }
                video.currentTime = 0;
                var p = video.play();
                if (p && p.catch) p.catch(function () {});
                if (!video.paused) video.classList.add('is-on');
            }, 500);
        });
        card.addEventListener('mouseleave', function () {
            clearTimeout(timer);
            if (video) { video.classList.remove('is-on'); video.pause(); }
        });
    });
})();

/* =========================================================
   Menu bar: hide while scrolling down, show when scrolling up
   ========================================================= */
(function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var lastY = window.scrollY, ticking = false;
    function menuOpen() {
        return !!header.querySelector('[aria-expanded="true"]') || document.body.classList.contains('nav-open') || header.classList.contains('is-open');
    }
    function update() {
        var y = window.scrollY, dy = y - lastY;
        if (y < 20 || menuOpen()) header.classList.remove('is-tucked');
        else if (dy > 0) header.classList.add('is-tucked');
        else if (dy < -6) header.classList.remove('is-tucked');
        if (dy > 0 || dy < -6 || y < 20) lastY = y;
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('is-tucked'); });
})();

/* =========================================================
   Plan Bee page: a swarm of bees flies across when it opens
   ========================================================= */
(function () {
    if (!/plan-bee\.html/.test(location.pathname)) return;
    function swarm() {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var W = window.innerWidth, H = window.innerHeight;
        var count = reduce ? 6 : (W < 700 ? 14 : 26);
        var layer = document.createElement('div');
        layer.className = 'bee-swarm';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        var longest = 0;
        for (var i = 0; i < count; i++) {
            var bee = document.createElement('span');
            bee.textContent = '\uD83D\uDC1D';
            bee.style.fontSize = (18 + Math.random() * 22) + 'px';
            layer.appendChild(bee);
            var fromLeft = Math.random() < 0.5;
            var y0 = Math.random() * H, y1 = Math.random() * H;
            var x0 = fromLeft ? -60 : W + 60, x1 = fromLeft ? W + 60 : -60;
            var flip = fromLeft ? -1 : 1;
            var frames = [];
            for (var k = 0; k <= 8; k++) {
                var t = k / 8;
                var x = x0 + (x1 - x0) * t;
                var y = y0 + (y1 - y0) * t + (reduce ? 0 : Math.sin(t * Math.PI * (2 + Math.random() * 2)) * (40 + Math.random() * 60));
                frames.push({ transform: 'translate(' + x + 'px,' + y + 'px) scaleX(' + flip + ') rotate(' + (reduce ? 0 : (Math.random() * 30 - 15)) + 'deg)' });
            }
            var dur = 2600 + Math.random() * 2600, delay = Math.random() * 1400;
            longest = Math.max(longest, dur + delay);
            bee.animate(frames, { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'both' });
        }
        setTimeout(function () { layer.remove(); }, longest + 400);
    }

    // button next to the title to send the bees out again
    var meta = document.querySelector('.pj-hero .pj-meta');
    if (meta) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fx-dark-btn fx-bee-btn';
        btn.innerHTML = '<span aria-hidden="true">🐝</span> Release the bees';
        var busy = false;
        btn.addEventListener('click', function () {
            if (busy) return;
            busy = true; swarm();
            setTimeout(function () { busy = false; }, 1500);
        });
        meta.appendChild(btn);
    }
})();

/* =========================================================
   Harry Potter page: floating candles + wand-light cursor
   ========================================================= */
(function () {
    if (!/harry-potter-escape-room\.html/.test(location.pathname)) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // "Lumos" button by the title: the page dims, then a golden wand light blooms and fades
    var meta = document.querySelector('.pj-hero .pj-meta');
    if (meta) {
        var lb = document.createElement('button');
        lb.type = 'button';
        lb.className = 'fx-dark-btn hp-lumos-btn';
        lb.innerHTML = '<span aria-hidden="true">🪄</span> Lumos';
        meta.appendChild(lb);
        var casting = false, actx = null;
        function chime() {
            try {
                if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
                if (actx.state === 'suspended') actx.resume();
                [784, 988, 1175, 1568].forEach(function (f, i) {
                    var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + 0.35 + i * 0.09;
                    o.type = 'sine'; o.frequency.value = f;
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
                    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1.25);
                });
            } catch (e) {}
        }
        lb.addEventListener('click', function () {
            if (casting) return;
            casting = true;
            chime();
            var r = lb.getBoundingClientRect(), x = r.left + 18, y = r.top + r.height / 2;
            var fx = document.createElement('div');
            fx.className = 'hp-lumos';
            fx.setAttribute('aria-hidden', 'true');
            fx.innerHTML = '<div class="hp-lumos-dim"></div><div class="hp-lumos-glow"></div>';
            var glow = fx.querySelector('.hp-lumos-glow');
            glow.style.left = x + 'px'; glow.style.top = y + 'px';
            document.body.appendChild(fx);
            if (!reduce) {
                for (var i = 0; i < 34; i++) {
                    var sp = document.createElement('span');
                    sp.className = 'hp-lumos-spark';
                    sp.style.left = x + 'px'; sp.style.top = y + 'px';
                    fx.appendChild(sp);
                    var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 260;
                    sp.animate([
                        { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0 },
                        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.15 },
                        { transform: 'translate(calc(-50% + ' + Math.cos(ang) * dist + 'px), calc(-50% + ' + (Math.sin(ang) * dist + 40) + 'px)) scale(0.3)', opacity: 0 }
                    ], { duration: 1300 + Math.random() * 900, delay: 380 + Math.random() * 200, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
                }
            }
            setTimeout(function () { fx.remove(); casting = false; }, 2700);
        });
    }

    // Wand-light cursor trail
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cv = document.createElement('canvas');
    cv.className = 'hp-wand-trail';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    var parts = [], lx = null, ly = null, running = false;
    window.addEventListener('mousemove', function (e) {
        var x = e.clientX, y = e.clientY;
        var dist = lx === null ? 0 : Math.hypot(x - lx, y - ly);
        var count = reduce ? 0 : Math.min(2, Math.floor(dist / 14));
        if (Math.random() < 0.35) count += 1;
        for (var i = 0; i < count; i++) {
            var t = count > 1 ? i / count : 0;
            parts.push({
                x: lx === null ? x : lx + (x - lx) * t, y: ly === null ? y : ly + (y - ly) * t,
                vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 + 0.25,
                r: 0.5 + Math.random() * 1.1, life: 0.75, decay: 0.022 + Math.random() * 0.025,
                hue: 38 + Math.random() * 18
            });
        }
        if (parts.length > 90) parts.splice(0, parts.length - 90);
        lx = x; ly = y;
        if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    function tick() {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.globalCompositeOperation = 'lighter';
        for (var i = parts.length - 1; i >= 0; i--) {
            var p = parts[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.012; p.life -= p.decay;
            if (p.life <= 0) { parts.splice(i, 1); continue; }
            var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            g.addColorStop(0, 'hsla(' + p.hue + ',100%,85%,' + p.life + ')');
            g.addColorStop(0.35, 'hsla(' + p.hue + ',100%,62%,' + (p.life * 0.4) + ')');
            g.addColorStop(1, 'hsla(' + p.hue + ',100%,50%,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
        }
        if (parts.length) requestAnimationFrame(tick); else running = false;
    }
})();

/* =========================================================
   Page effects: flashlight (horror games), bubbles (Blue Planet),
   rhythm arrows (Dance Pads)
   ========================================================= */
(function () {
    var path = location.pathname;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    function layer(cls) {
        var d = document.createElement('div');
        d.className = 'fx-layer ' + cls;
        d.setAttribute('aria-hidden', 'true');
        document.body.appendChild(d);
        document.body.classList.add('fx-page');
        return d;
    }

    /* ---- Dark mode with a flashlight: Resident Evil ---- */
    if (/but-worse-resident-evil\.html/.test(path)) {
        var dark = layer('fx-flashlight');
        var meta = document.querySelector('.pj-hero .pj-meta');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fx-dark-btn';
        (meta || document.querySelector('.pj-hero') || document.body).appendChild(btn);
        var isDark = false, timers = [];
        function label() {
            btn.innerHTML = isDark ? '<span aria-hidden="true">☀️</span> Light mode' : '<span aria-hidden="true">🔦</span> Dark mode';
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            if (typeof exitBtn !== 'undefined') exitBtn.classList.toggle('is-on', isDark);
        }
        // small exit button in the corner while dark mode is on (the one by the title gets dark too)
        var exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.className = 'fx-dark-exit';
        exitBtn.innerHTML = '<span aria-hidden="true">☀️</span> Light mode';
        document.body.appendChild(exitBtn);
        exitBtn.addEventListener('click', function () { btn.click(); });
        label();
        function beam(v) { dark.style.setProperty('--beam', v); }
        beam(0);

        // flashlight position follows the mouse (or sits in the middle on touch screens)
        var tx = innerWidth / 2, ty = innerHeight * 0.45, cx = tx, cy = ty, raf = null;
        function draw() {
            cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
            dark.style.setProperty('--x', cx + 'px');
            dark.style.setProperty('--y', cy + 'px');
            raf = (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(draw) : null;
        }
        draw();
        window.addEventListener('mousemove', function (e) {
            tx = e.clientX; ty = e.clientY;
            if (!raf) raf = requestAnimationFrame(draw);
        }, { passive: true });

        // Small sounds made in code: a switch click and a few crackles as the torch flickers
        var actx = null;
        function audio() {
            try {
                if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
                if (actx.state === 'suspended') actx.resume();
            } catch (e) { actx = null; }
            return actx;
        }
        function noiseBurst(when, dur, vol, freq) {
            var a = audio(); if (!a) return;
            var len = Math.max(1, Math.floor(a.sampleRate * dur));
            var buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
            for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
            var src = a.createBufferSource(); src.buffer = buf;
            var f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
            var g = a.createGain(); g.gain.value = vol;
            src.connect(f); f.connect(g); g.connect(a.destination);
            src.start(a.currentTime + when);
        }
        function thump(when, vol, pitch) {
            var a = audio(); if (!a) return;
            var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
            o.type = 'sine'; o.frequency.setValueAtTime(pitch, t); o.frequency.exponentialRampToValueAtTime(pitch * 0.5, t + 0.08);
            g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
            o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.1);
        }
        function switchClick(on) {
            noiseBurst(0, 0.03, on ? 0.5 : 0.4, on ? 2600 : 3200);
            thump(0, 0.18, on ? 160 : 220);
        }

        btn.addEventListener('click', function () {
            timers.forEach(clearTimeout); timers = [];
            switchClick(!isDark);
            isDark = !isDark;
            label();
            if (isDark) {
                beam(0);
                dark.classList.add('is-dark');                 // room goes dark
                if (reduce) { beam(1); return; }
                // torch flickers on: a few weak, uneven sputters before it holds
                var seq = [[650, 0.25], [700, 0], [790, 0.45], [830, 0.12], [900, 0.6],
                           [960, 0.3], [1010, 0.85], [1080, 0.7], [1180, 1], [1420, 0.88], [1480, 1]];
                seq.forEach(function (s) { timers.push(setTimeout(function () { beam(s[1]); }, s[0])); });
                // torch click, then soft crackles while it sputters
                noiseBurst(0.6, 0.025, 0.35, 1800); thump(0.6, 0.12, 120);
                seq.forEach(function (s, i) {
                    if (i < seq.length - 2) noiseBurst(s[0] / 1000, 0.018 + Math.random() * 0.02, 0.06 + s[1] * 0.08, 3500 + Math.random() * 2500);
                });
            } else {
                dark.classList.remove('is-dark');
            }
        });
    }

    /* ---- Bubbles + the odd jellyfish: Blue Planet ---- */
    if (/blue-planet\.html/.test(path)) {
        var sea = layer('fx-sea');
        var nB = reduce ? 0 : (innerWidth < 700 ? 12 : 24);
        for (var i = 0; i < nB; i++) {
            var b = document.createElement('span');
            b.className = 'fx-bubble';
            var s = 6 + Math.random() * 22;
            b.style.width = b.style.height = s + 'px';
            b.style.left = (Math.random() * 100) + '%';
            b.style.setProperty('--sway', (10 + Math.random() * 30) + 'px');
            b.style.animationDuration = (9 + Math.random() * 12) + 's, ' + (2.5 + Math.random() * 3) + 's';
            b.style.animationDelay = (-Math.random() * 20) + 's, ' + (-Math.random() * 4) + 's';
            b.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
            sea.appendChild(b);
        }
        function jelly() {
            var j = document.createElement('span');
            j.className = 'fx-jelly';
            j.innerHTML = '<i></i><b></b><b></b><b></b><b></b>';
            j.style.left = (Math.random() < 0.5 ? 3 + Math.random() * 15 : 80 + Math.random() * 15) + '%';
            j.style.setProperty('--js', (0.7 + Math.random() * 0.6).toFixed(2));
            sea.appendChild(j);
            setTimeout(function () { j.remove(); }, 26000);
        }
        if (!reduce) { setTimeout(jelly, 2500); setInterval(jelly, 14000); }
    }

    /* ---- Rhythm-game arrows: Dance Pads ---- */
    if (/dance-pads\.html/.test(path)) {
        var stage = layer('fx-arrows');
        var lanes = [
            { key: 'arrowleft', r: -90, x: 9, c: '#ff5fb2' },
            { key: 'arrowdown', r: 180, x: 18, c: '#5fd3ff' },
            { key: 'arrowup', r: 0, x: 82, c: '#7dff8a' },
            { key: 'arrowright', r: 90, x: 91, c: '#ffd25f' }
        ];
        function arrow(lane, bright) {
            var a = document.createElement('span');
            a.className = 'fx-arrow' + (bright ? ' is-hit' : '');
            a.innerHTML = '<svg viewBox="0 0 40 40" style="transform:rotate(' + lane.r + 'deg)"><path d="M20 3 L37 20 L28 20 L28 37 L12 37 L12 20 L3 20 Z" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';
            a.style.left = lane.x + '%';
            a.style.color = lane.c;
            a.style.setProperty('--glow', lane.c);
            a.style.animationDuration = (bright ? 2.6 : 7 + Math.random() * 3) + 's';
            stage.appendChild(a);
            setTimeout(function () { a.remove(); }, bright ? 2700 : 10500);
        }
        if (!reduce) setInterval(function () { arrow(lanes[Math.floor(Math.random() * 4)], false); }, 900);
        document.addEventListener('keydown', function (e) {
            var k = (e.key || '').toLowerCase();
            for (var i = 0; i < lanes.length; i++) if (lanes[i].key === k) arrow(lanes[i], true);
        });
    }
})();

/* =========================================================
   Fun buttons by the title on more project pages
   ========================================================= */
(function () {
    var path = location.pathname;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var meta = document.querySelector('.pj-hero .pj-meta');
    if (!meta) return;
    function addBtn(html, onClick) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fx-dark-btn fx-fun-btn';
        b.innerHTML = html;
        var busy = false;
        b.addEventListener('click', function () {
            if (busy) return; busy = true;
            var t = onClick(b) || 2500;
            setTimeout(function () { busy = false; }, t);
        });
        meta.appendChild(b);
        return b;
    }
    var actx = null;
    function ac() {
        try {
            if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === 'suspended') actx.resume();
        } catch (e) { actx = null; }
        return actx;
    }
    function tone(freq, start, dur, vol, type) {
        var a = ac(); if (!a) return;
        var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
        o.type = type || 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(start, dur, vol, filterType, f0, f1) {
        var a = ac(); if (!a) return;
        var len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var s = a.createBufferSource(); s.buffer = buf;
        var f = a.createBiquadFilter(); f.type = filterType; f.Q.value = 0.8;
        var g = a.createGain(), t = a.currentTime + start;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
    }
    function overlay(cls) {
        var o = document.createElement('div');
        o.className = 'fun-fx ' + cls;
        o.setAttribute('aria-hidden', 'true');
        document.body.appendChild(o);
        return o;
    }

    /* ---- Women's Suffrage: cast your vote ---- */
    if (/womens-suffrage\.html/.test(path)) {
        addBtn('<span aria-hidden="true">🗳️</span> Cast your vote', function () {
            var o = overlay('fun-vote');
            o.innerHTML = '<div class="fv-box"><div class="fv-slot"></div><span>STEMMESEDLER</span></div>' +
                          '<div class="fv-paper"><b>✕</b></div>' +
                          '<div class="fv-stamp">1915<small>Danish women win the vote</small></div>';
            tone(220, 0.55, 0.12, 0.12, 'triangle');            // paper drops in
            noise(0.5, 0.15, 0.08, 'bandpass', 1200, 600);
            tone(110, 0.95, 0.18, 0.2, 'sine');                 // stamp thud
            noise(0.93, 0.08, 0.12, 'lowpass', 900, 300);
            setTimeout(function () { o.remove(); }, 3600);
            return 3700;
        });
    }

    /* ---- Hearing Loss: hear it ---- */
    if (/hearing-loss\.html/.test(path)) {
        addBtn('<span aria-hidden="true">👂</span> Hear it', function () {
            document.body.classList.add('fun-muffled');
            var o = overlay('fun-muffle');
            o.innerHTML = '<p>This is roughly how a conversation can start to feel…</p>';
            noise(0, 3.4, 0.09, 'lowpass', 380, 260);           // muffled room
            tone(3800, 0.2, 3.0, 0.012, 'sine');                 // faint ringing
            setTimeout(function () { document.body.classList.remove('fun-muffled'); }, 3200);
            setTimeout(function () { o.remove(); }, 3900);
            return 4000;
        });
    }

    /* ---- Nico Nitro: nitro boost ---- */
    if (/nico-nitro\.html/.test(path)) {
        addBtn('<span aria-hidden="true">🚀</span> Nitro boost', function () {
            var o = overlay('fun-nitro');
            var title = document.querySelector('.pj-title');
            if (title && !reduce) {
                title.animate([
                    { transform: 'none', filter: 'none' },
                    { transform: 'translateX(-14px) scale(0.98)', offset: 0.15 },
                    { transform: 'translateX(40px) scale(1.08)', filter: 'blur(2px)', offset: 0.45 },
                    { transform: 'none', filter: 'none' }
                ], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
            noise(0, 1.0, 0.2, 'bandpass', 300, 3200);           // whoosh
            tone(90, 0, 0.6, 0.12, 'sawtooth');
            setTimeout(function () { o.remove(); }, 1300);
            return 1400;
        });
    }

    /* ---- Trivia Quiz: a random question from the Open Trivia Database ---- */
    if (/trivia-quiz\.html/.test(path)) {
        var backup = [   // used only if the database can't be reached
            { c: 'General Knowledge', q: 'What is the capital of Denmark?', a: 'Copenhagen', w: ['Aarhus', 'Odense', 'Aalborg'] },
            { c: 'Science', q: 'What is the chemical symbol for gold?', a: 'Au', w: ['Ag', 'Gd', 'Go'] },
            { c: 'Video Games', q: 'Which company makes the Meta Quest headsets?', a: 'Meta', w: ['Sony', 'Valve', 'HTC'] }
        ];
        function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
        function getQuestion() {
            return fetch('https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986')
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    var q = d && d.results && d.results[0];
                    if (!q) throw new Error('no question');
                    var dec = decodeURIComponent;
                    return { c: dec(q.category), d: dec(q.difficulty), q: dec(q.question), a: dec(q.correct_answer), w: q.incorrect_answers.map(dec) };
                })
                .catch(function () { return backup[Math.floor(Math.random() * backup.length)]; });
        }
        function esc(t) { var e = document.createElement('span'); e.textContent = t; return e.innerHTML; }
        addBtn('<span aria-hidden="true">❓</span> Quick question', function () {
            var o = overlay('fun-quiz');
            o.setAttribute('aria-hidden', 'false');
            o.innerHTML = '<div class="fq-card" role="dialog" aria-label="Quick question">' +
                '<span class="fq-label">Quick question</span><h3>Loading a question…</h3>' +
                '<div class="fq-opts"></div><p class="fq-msg" aria-live="polite"></p>' +
                '<button class="fq-close" aria-label="Close">✕</button></div>';
            function close() { o.classList.add('is-out'); setTimeout(function () { o.remove(); }, 300); }
            o.addEventListener('click', function (e) { if (e.target === o) close(); });
            o.querySelector('.fq-close').addEventListener('click', close);
            function load() {
                var card = o.querySelector('.fq-card');
                card.querySelector('h3').textContent = 'Loading a question…';
                card.querySelector('.fq-opts').innerHTML = '';
                card.querySelector('.fq-msg').textContent = '';
                getQuestion().then(function (q) {
                    card.querySelector('.fq-label').textContent = q.c + (q.d ? ' · ' + q.d : '');
                    card.querySelector('h3').textContent = q.q;
                    var opts = card.querySelector('.fq-opts'), done = false;
                    shuffle([q.a].concat(q.w)).forEach(function (ans) {
                        var b = document.createElement('button');
                        b.innerHTML = esc(ans);
                        b.addEventListener('click', function () {
                            if (done) return;
                            var msg = card.querySelector('.fq-msg');
                            if (ans === q.a) {
                                done = true;
                                b.classList.add('is-ok'); msg.innerHTML = 'Correct! 🎉 <button class="fq-next">Another one →</button>';
                                tone(784, 0, 0.18, 0.08); tone(1047, 0.1, 0.3, 0.08);
                                confetti(b);
                                msg.querySelector('.fq-next').addEventListener('click', load);
                            } else {
                                b.classList.add('is-no'); b.disabled = true; msg.textContent = 'Not quite, try again!';
                                tone(180, 0, 0.2, 0.08, 'triangle');
                            }
                        });
                        opts.appendChild(b);
                    });
                    var f = opts.querySelector('button'); if (f) f.focus();
                });
            }
            load();
            return 600;
        });
        function confetti(from) {
            var r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
            var o = overlay('fun-confetti'), cols = ['#FFB454', '#63E6D8', '#ff5fb2', '#7dff8a', '#fff'];
            for (var i = 0; i < 60; i++) {
                var c = document.createElement('i');
                c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = cols[i % cols.length];
                o.appendChild(c);
                var an = Math.random() * Math.PI * 2, d = 80 + Math.random() * 220;
                c.animate([
                    { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                    { transform: 'translate(' + Math.cos(an) * d + 'px,' + (Math.sin(an) * d + 220) + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 0 }
                ], { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
            }
            setTimeout(function () { o.remove(); }, 2000);
        }
    }

    /* ---- LIV: a calm breathing moment ---- */
    if (/\/liv\.html/.test(path)) {
        addBtn('<span aria-hidden="true">💙</span> Breathe', function () {
            var o = overlay('fun-breathe');
            o.innerHTML = '<div class="fb-circle"></div><p class="fb-text">Breathe in…</p>';
            var txt = o.querySelector('.fb-text');
            var a = ac(), nodes = [];
            if (a) {                                              // soft, slowly swelling pad
                var t = a.currentTime;
                [220, 277.2, 329.6].forEach(function (f) {
                    var os = a.createOscillator(), g = a.createGain();
                    os.type = 'sine'; os.frequency.value = f;
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(0.025, t + 4);
                    g.gain.exponentialRampToValueAtTime(0.012, t + 8);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + 9.5);
                    os.connect(g); g.connect(a.destination); os.start(t); os.stop(t + 9.6);
                });
            }
            setTimeout(function () { txt.textContent = 'Breathe out…'; }, 4000);
            setTimeout(function () { o.classList.add('is-out'); }, 8600);
            setTimeout(function () { o.remove(); }, 9600);
            return 9700;
        });
    }

    /* ---- Zombie Game: brains… ---- */
    if (/zombie-game\.html/.test(path)) {
        addBtn('<span aria-hidden="true">🧟</span> Zombie attack', function (btn) {
            var o = overlay('fun-zombie');
            var r = btn.getBoundingClientRect();
            o.innerHTML = '<svg class="fz-hand" viewBox="0 0 160 300" style="left:' + Math.max(20, r.left + 40) + 'px">' +
                '<path d="M45 300 L50 175 Q48 160 52 150 L115 150 Q120 165 118 180 L122 300 Z" fill="#3d4a3a"/>' +
                '<path d="M50 300 L56 190 L66 205 L72 188 L84 204 L92 186 L100 202 L112 190 L118 300 Z" fill="#2f3a2d"/>' +
                '<path d="M52 158 Q40 120 44 92 L40 52 Q38 40 47 39 Q55 39 57 52 L62 88 L63 34 Q63 22 72 22 Q81 22 81 34 L82 86 L88 30 Q90 18 99 20 Q107 22 106 34 L102 90 L111 50 Q114 39 122 42 Q129 45 126 57 L116 112 Q132 100 140 92 Q148 86 152 94 Q155 101 147 109 L120 142 Q114 156 112 158 Z" fill="#8fb27a" stroke="#4e6a42" stroke-width="3" stroke-linejoin="round"/>' +
                '<path d="M60 70 L66 72 M79 64 L85 65 M98 68 L103 70" stroke="#5f7f51" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
                '<path d="M74 132 l10 -6 l4 9 z" fill="#6d8f5d"/></svg>';
            var a = ac();
            if (a) {                                              // low groan
                var os = a.createOscillator(), lf = a.createOscillator(), lg = a.createGain(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + 0.3;
                os.type = 'sawtooth'; os.frequency.setValueAtTime(95, t); os.frequency.linearRampToValueAtTime(70, t + 1.6);
                lf.frequency.value = 5; lg.gain.value = 6; lf.connect(lg); lg.connect(os.frequency);
                f.type = 'lowpass'; f.frequency.value = 520;
                g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
                os.connect(f); f.connect(g); g.connect(a.destination);
                os.start(t); lf.start(t); os.stop(t + 1.8); lf.stop(t + 1.8);
            }
            // the hit: visual flash, screen shake, sound and (on phones) vibration
            var hit = document.createElement('div');
            hit.className = 'fz-hit';
            hit.innerHTML = '<span>👁 Visual</span><span>🔊 Sound</span><span>📳 Haptic</span>';
            o.appendChild(hit);
            setTimeout(function () {
                if (!reduce) document.body.classList.add('fz-shake');
                try { if (navigator.vibrate) navigator.vibrate([90, 40, 140]); } catch (e) {}
                noise(0, 0.25, 0.22, 'lowpass', 1400, 200);
                tone(60, 0, 0.3, 0.25, 'sine');
                setTimeout(function () { document.body.classList.remove('fz-shake'); }, 500);
            }, 950);
            setTimeout(function () { o.remove(); }, 3600);
            return 3700;
        });
    }
})();

/* =========================================================
   Mini games: Dance Pads (hit the arrows) + Blue Planet (clean the ocean)
   ========================================================= */
(function () {
    var path = location.pathname;
    var meta = document.querySelector('.pj-hero .pj-meta');
    if (!meta) return;
    var actx = null;
    function ac() {
        try {
            if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === 'suspended') actx.resume();
        } catch (e) { actx = null; }
        return actx;
    }
    function blip(freq, dur, vol, type, when) {
        var a = ac(); if (!a) return;
        var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (when || 0);
        o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    function kick(when) {
        var a = ac(); if (!a) return;
        var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
        o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.2);
    }
    function hat(when) {
        var a = ac(); if (!a) return;
        var len = Math.floor(a.sampleRate * 0.04), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        s.buffer = b; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = 0.08;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + when);
    }
    function addBtn(html, fn) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'fx-dark-btn fx-fun-btn'; b.innerHTML = html;
        b.addEventListener('click', fn);
        meta.appendChild(b);
    }
    function modal(cls, inner) {
        var o = document.createElement('div');
        o.className = 'fun-fx fun-game ' + cls;
        o.innerHTML = '<div class="fg-card" role="dialog">' + inner + '<button class="fq-close fg-close" aria-label="Close">✕</button></div>';
        document.body.appendChild(o);
        document.body.classList.add('fg-open');
        return o;
    }
    function closeModal(o, cleanup) {
        if (cleanup) cleanup();
        o.classList.add('is-out');
        document.body.classList.remove('fg-open');
        setTimeout(function () { o.remove(); }, 300);
    }

    /* ---------------- Dance Pads: rhythm mini game ---------------- */
    if (/dance-pads\.html/.test(path)) {
        var LANES = [
            { key: 'arrowleft', r: -90, c: '#ff5fb2' },
            { key: 'arrowdown', r: 180, c: '#5fd3ff' },
            { key: 'arrowup', r: 0, c: '#7dff8a' },
            { key: 'arrowright', r: 90, c: '#ffd25f' }
        ];
        var SVG = function (r) { return '<svg viewBox="0 0 40 40" style="transform:rotate(' + r + 'deg)"><path d="M20 3 L37 20 L28 20 L28 37 L12 37 L12 20 L3 20 Z" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>'; };
        addBtn('<span aria-hidden="true">🕹️</span> Play a mini version', function () {
            var lanesHtml = LANES.map(function (l, i) {
                return '<div class="dg-lane" data-i="' + i + '"><div class="dg-target" style="color:' + l.c + '">' + SVG(l.r) + '</div></div>';
            }).join('');
            var o = modal('fun-dance',
                '<p class="fg-note">Just for fun: a small web version <b>inspired by</b> Dance Pads, not the real prototype (which uses physical pads and sound).</p>' +
                '<div class="dg-head"><span class="fq-label">Mini game · inspired by Dance Pads</span><span class="dg-score">Score <b>0</b></span><span class="dg-combo"></span></div>' +
                '<div class="dg-field">' + lanesHtml + '<div class="dg-judge"></div>' +
                '<div class="dg-start"><p>Hit the arrow keys when the arrows reach the top.<br><small>On a phone, tap the lanes.</small></p><button class="dg-go">Start ▶</button></div></div>');
            var field = o.querySelector('.dg-field'), lanes = o.querySelectorAll('.dg-lane');
            var scoreEl = o.querySelector('.dg-score b'), comboEl = o.querySelector('.dg-combo'), judge = o.querySelector('.dg-judge');
            var notes = [], running = false, start = 0, raf = null, score = 0, combo = 0, best = 0, hits = 0, total = 0;
            var BPM = 112, beat = 60 / BPM, TRAVEL = 1.6, LEN = 24; // seconds
            function chart() {
                var list = [], t = 2, last = -1;
                while (t < LEN) {
                    var lane = Math.floor(Math.random() * 4); if (lane === last && Math.random() < 0.6) lane = (lane + 1) % 4;
                    list.push({ t: t, lane: lane }); last = lane;
                    if (Math.random() < 0.15 && t > 6) list.push({ t: t, lane: (lane + 2) % 4 });   // occasional jump
                    t += beat * (Math.random() < 0.3 ? 0.5 : 1);
                }
                return list;
            }
            function music() {
                for (var b = 0; b * beat < LEN + 1; b++) {
                    kick(b * beat); hat(b * beat + beat / 2);
                    if (b % 4 === 0) blip([262, 330, 392, 349][(b / 4) % 4], 0.25, 0.05, 'triangle', b * beat);
                }
            }
            function show(txt, col) {
                judge.textContent = txt; judge.style.color = col;
                judge.classList.remove('is-pop'); void judge.offsetWidth; judge.classList.add('is-pop');
            }
            function begin() {
                o.querySelector('.dg-start').remove();
                notes = chart().map(function (n) {
                    var el = document.createElement('div');
                    el.className = 'dg-note'; el.style.color = LANES[n.lane].c; el.innerHTML = SVG(LANES[n.lane].r);
                    lanes[n.lane].appendChild(el);
                    return { t: n.t, lane: n.lane, el: el, done: false };
                });
                total = notes.length;
                ac(); music();
                start = (actx ? actx.currentTime : performance.now() / 1000);
                running = true; tick();
            }
            function now() { return (actx ? actx.currentTime : performance.now() / 1000) - start; }
            function tick() {
                if (!running) return;
                var t = now(), h = field.clientHeight, targetY = 18;
                notes.forEach(function (n) {
                    if (n.done) return;
                    var dt = n.t - t, y = targetY + (dt / TRAVEL) * (h - 60);
                    n.el.style.transform = 'translateY(' + y + 'px)';
                    if (dt < -0.18) { n.done = true; n.el.classList.add('is-miss'); combo = 0; comboEl.textContent = ''; show('Miss', '#ff8a8a'); }
                });
                if (t > LEN + 1) return finish();
                raf = requestAnimationFrame(tick);
            }
            function press(i) {
                var tgt = lanes[i].querySelector('.dg-target');
                tgt.classList.remove('is-hit'); void tgt.offsetWidth; tgt.classList.add('is-hit');
                if (!running) return;
                var t = now(), bestN = null, bestD = 1;
                notes.forEach(function (n) { if (!n.done && n.lane === i) { var d = Math.abs(n.t - t); if (d < bestD) { bestD = d; bestN = n; } } });
                if (!bestN || bestD > 0.18) { blip(140, 0.08, 0.05, 'square'); return; }
                bestN.done = true; bestN.el.classList.add('is-hit');
                combo++; best = Math.max(best, combo); hits++;
                var pts = bestD < 0.06 ? 300 : 100;
                score += pts * (1 + Math.floor(combo / 10));
                scoreEl.textContent = score;
                comboEl.textContent = combo > 2 ? combo + ' combo' : '';
                if (bestD < 0.06) show(combo >= 5 && Math.random() < 0.6 ? 'Keep slaying!' : 'Slay!', '#ff7ad1');
                else show(Math.random() < 0.5 ? 'Hit' : 'Good', '#5fd3ff');
                blip([523, 587, 659, 784][i], 0.12, 0.07, 'triangle');
            }
            function finish() {
                running = false;
                var pct = total ? Math.round(hits / total * 100) : 0;
                var res = document.createElement('div');
                res.className = 'dg-start';
                res.innerHTML = '<p><b class="dg-big">' + score + '</b><br>' + pct + '% hit · best combo ' + best + '</p><button class="dg-go">Play again ↻</button>';
                field.appendChild(res);
                res.querySelector('.dg-go').addEventListener('click', function () {
                    notes.forEach(function (n) { n.el.remove(); }); score = combo = best = hits = 0; scoreEl.textContent = '0'; comboEl.textContent = ''; res.remove(); begin2();
                });
                blip(523, 0.15, 0.07, 'triangle'); blip(659, 0.15, 0.07, 'triangle', 0.12); blip(784, 0.3, 0.07, 'triangle', 0.24);
            }
            function begin2() {
                var s = document.createElement('div'); s.className = 'dg-start'; field.appendChild(s); begin();
            }
            function onKey(e) {
                var k = (e.key || '').toLowerCase();
                for (var i = 0; i < 4; i++) if (LANES[i].key === k) { e.preventDefault(); press(i); }
                if (k === 'escape') done();
            }
            document.addEventListener('keydown', onKey);
            lanes.forEach(function (l, i) { l.addEventListener('pointerdown', function () { press(i); }); });
            o.querySelector('.dg-go').addEventListener('click', begin);
            function done() { closeModal(o, function () { running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); if (actx) { try { actx.close(); } catch (e) {} actx = null; } }); }
            o.querySelector('.fg-close').addEventListener('click', done);
        });
    }

    /* ---------------- Blue Planet: clean the ocean ---------------- */
    if (/blue-planet\.html/.test(path)) {
        addBtn('<span aria-hidden="true">🐢</span> Help Tessa (mini game)', function () {
            var o = modal('fun-ocean',
                '<p class="fg-note">Just for fun: a small web version <b>inspired by</b> the Blue Planet game, not the real game made for the aquarium.</p>' +
                '<div class="dg-head"><span class="fq-label">Mini game · inspired by Blue Planet</span><span class="dg-score">Plastic removed <b>0</b></span><span class="oc-time">20s</span></div>' +
                '<div class="oc-sea"><div class="oc-rays"></div><div class="oc-turtle">🐢</div><div class="oc-msg"></div>' +
                '<div class="dg-start"><p>Click the <b>plastic bags</b> to clean the ocean for Tessa.<br><small>Careful, the jellyfish are her food!</small></p><button class="dg-go">Start ▶</button></div></div>');
            var sea = o.querySelector('.oc-sea'), scoreEl = o.querySelector('.dg-score b'), timeEl = o.querySelector('.oc-time'), msg = o.querySelector('.oc-msg');
            var running = false, spawnT = null, clockT = null, score = 0, oops = 0, left = 20;
            var BAG = '<svg viewBox="0 0 60 80"><path d="M14 18 Q12 6 20 4 Q24 4 24 14 M46 18 Q48 6 40 4 Q36 4 36 14" fill="none" stroke="rgba(235,245,250,.85)" stroke-width="3"/><path d="M8 18 L52 18 Q56 50 48 70 Q40 78 30 74 Q22 78 14 72 Q4 52 8 18 Z" fill="rgba(235,245,250,.55)" stroke="rgba(255,255,255,.9)" stroke-width="2"/><path d="M18 30 Q22 50 18 64 M38 28 Q42 46 40 62" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/></svg>';
            var JELLY = '<span class="fx-jelly oc-j"><i></i><b></b><b></b><b></b><b></b></span>';
            function say(t, col) { msg.textContent = t; msg.style.color = col || '#e9fbff'; msg.classList.remove('is-pop'); void msg.offsetWidth; msg.classList.add('is-pop'); }
            function spawn() {
                if (!running) return;
                var isBag = Math.random() < 0.62;
                var el = document.createElement('button');
                el.type = 'button';
                el.className = 'oc-item ' + (isBag ? 'is-bag' : 'is-jelly');
                el.setAttribute('aria-label', isBag ? 'Plastic bag' : 'Jellyfish');
                el.innerHTML = isBag ? BAG : JELLY;
                el.style.left = (6 + Math.random() * 82) + '%';
                var dur = 5200 + Math.random() * 3000;
                el.style.animationDuration = dur + 'ms, ' + (1.8 + Math.random() * 1.5) + 's';
                sea.appendChild(el);
                el.addEventListener('pointerdown', function () {
                    if (el.classList.contains('is-gone')) return;
                    el.classList.add('is-gone');
                    if (isBag) {
                        score++; scoreEl.textContent = score;
                        blip(660, 0.08, 0.06, 'sine'); blip(990, 0.12, 0.05, 'sine', 0.05);
                        if (score % 5 === 0) say(['Nice!', 'Tessa is happy 🐢', 'Keep going!', 'Ocean hero!'][Math.floor(Math.random() * 4)]);
                    } else {
                        oops++; blip(200, 0.2, 0.06, 'triangle'); say('That was Tessa’s food! 🪼', '#ffc4ef');
                    }
                    setTimeout(function () { el.remove(); }, 400);
                });
                setTimeout(function () { el.remove(); }, dur + 100);
                spawnT = setTimeout(spawn, Math.max(380, 900 - score * 18));
            }
            function begin() {
                var s = sea.querySelector('.dg-start'); if (s) s.remove();
                score = 0; oops = 0; left = 20; scoreEl.textContent = '0'; timeEl.textContent = '20s';
                running = true; ac(); spawn();
                clockT = setInterval(function () {
                    left--; timeEl.textContent = left + 's';
                    if (left <= 0) finish();
                }, 1000);
            }
            function finish() {
                running = false; clearTimeout(spawnT); clearInterval(clockT);
                sea.querySelectorAll('.oc-item').forEach(function (e) { e.remove(); });
                var res = document.createElement('div'); res.className = 'dg-start';
                res.innerHTML = '<p><b class="dg-big">' + score + '</b> plastic bags removed' + (oops ? '<br><small>' + oops + ' jellyfish clicked by mistake</small>' : '') + '<br>Tessa says thank you! 🐢</p><button class="dg-go">Play again ↻</button>';
                sea.appendChild(res);
                res.querySelector('.dg-go').addEventListener('click', begin);
                blip(523, 0.15, 0.06, 'sine'); blip(659, 0.15, 0.06, 'sine', 0.12); blip(784, 0.3, 0.06, 'sine', 0.24);
            }
            o.querySelector('.dg-go').addEventListener('click', begin);
            function done() { closeModal(o, function () { running = false; clearTimeout(spawnT); clearInterval(clockT); }); }
            o.querySelector('.fg-close').addEventListener('click', done);
            document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { done(); document.removeEventListener('keydown', esc); } });
        });
    }
})();
