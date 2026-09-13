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

                leaf.x = -30;

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


    /*
       Prepare inactive background.
    */

    inactiveGradient.className =
        "bg-gradient";

    inactiveGradient.classList.add(
        nextSeason
    );


    inactiveParticles.style.opacity =
        "0";


    /*
       Create leaves for next season.
    */

    inactiveLeafSystem =
        new LeafSystem(
            inactiveParticles,
            nextSeason
        );

    inactiveLeafSystem.animate();


    /*
       Crossfade.
    */

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


    /*
       Swap layers after transition.
    */

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

setInterval(
    changeSeason,
    SEASON_DURATION
);


/* =========================================
   REDUCED MOTION
========================================= */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =========================================
   HERO NAME ANIMATION
========================================= */

const heroName =
    document.querySelector(
        ".hero-name"
    );


/*
   Set staggered delays on every letter.

   The first line starts quickly.
   The second line starts slightly later,
   making the name feel like it is being
   written/revealed naturally.
*/

function prepareHeroLetters() {

    if (!heroName) {
        return;
    }

    const firstLine =
        heroName.querySelector(
            ".name-line:not(.name-line-second)"
        );

    const secondLine =
        heroName.querySelector(
            ".name-line-second"
        );


    if (firstLine) {

        const letters =
            firstLine.querySelectorAll(
                ".letter:not(.space)"
            );

        letters.forEach(
            (letter, index) => {

                letter.style.setProperty(
                    "--letter-delay",
                    `${0.12 + index * 0.055}s`
                );

            }
        );

    }


    if (secondLine) {

        const letters =
            secondLine.querySelectorAll(
                ".letter"
            );

        letters.forEach(
            (letter, index) => {

                letter.style.setProperty(
                    "--letter-delay",
                    `${0.72 + index * 0.065}s`
                );

            }
        );

    }

}


/*
   Replay the name animation.

   requestAnimationFrame gives the browser
   one frame to register the reset before
   starting the animation again.
*/

function replayHeroName() {

    if (!heroName || prefersReducedMotion) {
        return;
    }

    heroName.classList.add(
        "replaying"
    );


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            heroName.classList.remove(
                "replaying"
            );

        });

    });

}


prepareHeroLetters();


/*
   Play the animation on initial page load.
*/

if (
    heroName &&
    !prefersReducedMotion
) {

    replayHeroName();

}


/* =========================================
   HERO RE-ENTRY OBSERVER
========================================= */

/*
   The hero animation plays again when the
   hero leaves the screen and later comes
   back into view.

   This means:
   - Load page → animation
   - Scroll down → hero leaves
   - Scroll back up → animation again
*/

if (
    heroName &&
    !prefersReducedMotion
) {

    let heroWasVisible =
        true;


    const heroObserver =
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

                                replayHeroName();

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
                    0.25
            }
        );


    heroObserver.observe(
        document.querySelector(
            ".hero"
        )
    );

}


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


/*
   Reduced motion:
   Everything is simply visible.
*/

if (
    prefersReducedMotion
) {

    revealElements.forEach(
        element => {

            element.classList.add(
                "visible"
            );

        }
    );

} else {


    /*
       Normal scrolling.

       IMPORTANT:
       We intentionally DO NOT call
       observer.unobserve().

       This allows the animation to happen
       again when the user scrolls back up.
    */

    const revealObserver =
        new IntersectionObserver(
            (entries) => {

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

                               When it comes back,
                               the CSS transition plays again.
                            */

                            entry.target.classList.remove(
                                "visible"
                            );

                        }

                    }
                );

            },
            {

                /*
                   A slightly larger threshold
                   makes the reveal feel intentional.
                */

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
        ) *
        100;


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
    .forEach(anchor => {

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

    });