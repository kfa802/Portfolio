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

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if (prefersReducedMotion) {

    revealElements.forEach(
        element => {

            element.classList.add(
                "visible"
            );

        }
    );

} else {

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        } else {

                            /*
                               Remove the class when the
                               element leaves the viewport.

                               This allows the animation to
                               replay when scrolling back.
                            */

                            entry.target.classList.remove(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold:
                    0.12,

                rootMargin:
                    "0px 0px -50px 0px"
            }
        );


    revealElements.forEach(
        element => {

            revealObserver.observe(
                element
            );

        }
    );

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