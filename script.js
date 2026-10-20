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

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle("visible", entry.isIntersecting);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

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
========================================= */

const projectImages = Array.from(
    document.querySelectorAll(
        "main img:not(.gallery-lightbox img)"
    )
).filter(image => !image.closest(".gallery-lightbox"));

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

        document.addEventListener("mouseover", event => {
            if (event.target.closest(hoverTargets)) {
                cursorRing.classList.add("is-active");
            }
        });

        document.addEventListener("mouseout", event => {
            if (event.target.closest(hoverTargets)) {
                cursorRing.classList.remove("is-active");
            }
        });

        document.addEventListener("mouseleave", () => {
            cursorDot.style.opacity = "0";
            cursorRing.style.opacity = "0";
        });
    }
}
