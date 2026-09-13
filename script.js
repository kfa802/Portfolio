/* =========================================
   REVEAL ANIMATIONS
========================================= */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach((entry) => {

            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("visible");

            observer.unobserve(entry.target);
        });

    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    revealObserver.observe(element);
});


/* =========================================
   SCROLL PROGRESS
========================================= */

const scrollProgress =
    document.getElementById("scroll-progress");

function updateScrollProgress() {

    const scrollTop = window.scrollY;

    const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    if (documentHeight <= 0) {
        scrollProgress.style.width = "0%";
        return;
    }

    const progress =
        (scrollTop / documentHeight) * 100;

    scrollProgress.style.width =
        `${Math.min(progress, 100)}%`;
}

window.addEventListener(
    "scroll",
    updateScrollProgress,
    { passive: true }
);

updateScrollProgress();


/* =========================================
   SEASONAL BACKGROUND
========================================= */

const gradientA =
    document.getElementById("bg-gradient-a");

const gradientB =
    document.getElementById("bg-gradient-b");

const canvasA =
    document.getElementById("bg-particles-a");

const canvasB =
    document.getElementById("bg-particles-b");

const ctxA =
    canvasA.getContext("2d");

const ctxB =
    canvasB.getContext("2d");


/*
    Longer season duration makes the background
    feel atmospheric instead of like an animation.
*/

const SEASON_DURATION = 30000;


/*
    This is deliberately long.

    The old background and leaves disappear slowly,
    while the new ones appear gradually.
*/

const TRANSITION_DURATION = 7000;


/* =========================================
   SEASON DEFINITIONS
========================================= */

const seasons = {

    autumn: {

        backgroundClass: "autumn",

        leafColors: [
            "#D9823B",
            "#E6A04B",
            "#C96B3B",
            "#B9573E",
            "#D18A43"
        ]

    },

    winter: {

        backgroundClass: "winter",

        leafColors: [
            "#DCEAF2",
            "#C7DCE9",
            "#B7D0E2",
            "#E8F0F5",
            "#AFC8DA"
        ]

    },

    spring: {

        backgroundClass: "spring",

        leafColors: [
            "#7EAD69",
            "#91BC73",
            "#A7C97B",
            "#6D9F68",
            "#B1CE82"
        ]

    },

    summer: {

        backgroundClass: "summer",

        leafColors: [
            "#6F9F5D",
            "#80AE62",
            "#92BA68",
            "#5D9359",
            "#A1C875"
        ]

    }

};


/*
    Order of the seasons.

    Change this if you want a different order.
*/

const seasonOrder = [
    "autumn",
    "winter",
    "spring",
    "summer"
];


/* =========================================
   PARTICLE SYSTEM
========================================= */

class LeafSystem {

    constructor(canvas, context) {

        this.canvas = canvas;
        this.ctx = context;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.leaves = [];

        this.season = "autumn";

        this.resize();

        this.createLeaves();
    }


    /* -------------------------------------
       RESIZE
    -------------------------------------- */

    resize() {

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        const pixelRatio =
            Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width =
            this.width * pixelRatio;

        this.canvas.height =
            this.height * pixelRatio;

        this.canvas.style.width =
            `${this.width}px`;

        this.canvas.style.height =
            `${this.height}px`;

        this.ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );
    }


    /* -------------------------------------
       CREATE LEAVES
    -------------------------------------- */

    createLeaves() {

        this.leaves = [];

        /*
            Keep the number fairly low.

            The leaves should be noticeable,
            but they should never compete with
            the portfolio content.
        */

        const count =
            Math.min(
                48,
                Math.max(
                    28,
                    Math.floor(
                        (this.width * this.height) /
                        28000
                    )
                )
            );

        for (let i = 0; i < count; i++) {

            this.leaves.push(
                this.createLeaf(true)
            );
        }
    }


    /* -------------------------------------
       CREATE SINGLE LEAF
    -------------------------------------- */

    createLeaf(initial = false) {

        const seasonData =
            seasons[this.season];

        return {

            x: Math.random() * this.width,

            y: initial
                ? Math.random() * this.height
                : -30 - Math.random() * 100,

            size:
                5 + Math.random() * 7,

            speed:
                0.25 + Math.random() * 0.5,

            drift:
                -0.3 + Math.random() * 0.6,

            rotation:
                Math.random() * Math.PI * 2,

            rotationSpeed:
                -0.018 + Math.random() * 0.036,

            swing:
                Math.random() * Math.PI * 2,

            swingSpeed:
                0.008 + Math.random() * 0.018,

            opacity:
                0.35 + Math.random() * 0.4,

            width:
                0.65 + Math.random() * 0.35,

            color:
                seasonData.leafColors[
                    Math.floor(
                        Math.random() *
                        seasonData.leafColors.length
                    )
                ]
        };
    }


    /* -------------------------------------
       CHANGE SEASON
    -------------------------------------- */

    setSeason(season) {

        this.season = season;

        const colors =
            seasons[season].leafColors;

        /*
            Instead of replacing the leaves,
            slowly give existing leaves a new
            color.

            This prevents the particle field
            from suddenly popping into a
            completely different color.
        */

        this.leaves.forEach((leaf) => {

            leaf.targetColor =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];
        });
    }


    /* -------------------------------------
       UPDATE
    -------------------------------------- */

    update() {

        this.leaves.forEach((leaf) => {

            leaf.y += leaf.speed;

            leaf.swing += leaf.swingSpeed;

            leaf.x +=
                leaf.drift +
                Math.sin(leaf.swing) * 0.25;

            leaf.rotation +=
                leaf.rotationSpeed;


            /*
                Slowly move toward the seasonal
                color rather than changing instantly.
            */

            if (leaf.targetColor) {

                leaf.color =
                    this.mixColor(
                        leaf.color,
                        leaf.targetColor,
                        0.012
                    );
            }


            /*
                If a leaf leaves the screen,
                respawn it at the top.
            */

            if (leaf.y > this.height + 30) {

                leaf.y =
                    -20 - Math.random() * 50;

                leaf.x =
                    Math.random() * this.width;

                leaf.targetColor = null;

                const colors =
                    seasons[this.season].leafColors;

                leaf.color =
                    colors[
                        Math.floor(
                            Math.random() *
                            colors.length
                        )
                    ];
            }


            /*
                Wrap horizontally.
            */

            if (leaf.x < -30) {
                leaf.x = this.width + 30;
            }

            if (leaf.x > this.width + 30) {
                leaf.x = -30;
            }

        });
    }


    /* -------------------------------------
       DRAW
    -------------------------------------- */

    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        this.leaves.forEach((leaf) => {

            this.drawLeaf(leaf);

        });
    }


    /* -------------------------------------
       DRAW LEAF
    -------------------------------------- */

    drawLeaf(leaf) {

        const ctx = this.ctx;

        ctx.save();

        ctx.translate(
            leaf.x,
            leaf.y
        );

        ctx.rotate(
            leaf.rotation
        );

        ctx.globalAlpha =
            leaf.opacity;

        ctx.fillStyle =
            leaf.color;

        /*
            Slightly organic leaf shape.

            It is intentionally simple and soft
            rather than looking like an emoji/icon.
        */

        ctx.beginPath();

        ctx.moveTo(
            0,
            -leaf.size
        );

        ctx.bezierCurveTo(
            leaf.size * leaf.width,
            -leaf.size * 0.55,
            leaf.size * leaf.width,
            leaf.size * 0.55,
            0,
            leaf.size
        );

        ctx.bezierCurveTo(
            -leaf.size * leaf.width,
            leaf.size * 0.55,
            -leaf.size * leaf.width,
            -leaf.size * 0.55,
            0,
            -leaf.size
        );

        ctx.closePath();

        ctx.fill();

        /*
            Tiny central vein.
        */

        ctx.globalAlpha =
            leaf.opacity * 0.35;

        ctx.strokeStyle =
            leaf.color;

        ctx.lineWidth = 0.7;

        ctx.beginPath();

        ctx.moveTo(
            0,
            -leaf.size * 0.65
        );

        ctx.lineTo(
            0,
            leaf.size * 0.65
        );

        ctx.stroke();

        ctx.restore();
    }


    /* -------------------------------------
       COLOR MIXING
    -------------------------------------- */

    mixColor(color1, color2, amount) {

        const c1 =
            this.hexToRgb(color1);

        const c2 =
            this.hexToRgb(color2);

        if (!c1 || !c2) {
            return color2;
        }

        const r =
            Math.round(
                c1.r +
                (c2.r - c1.r) * amount
            );

        const g =
            Math.round(
                c1.g +
                (c2.g - c1.g) * amount
            );

        const b =
            Math.round(
                c1.b +
                (c2.b - c1.b) * amount
            );

        return (
            "#" +
            [r, g, b]
                .map((value) =>
                    value
                        .toString(16)
                        .padStart(2, "0")
                )
                .join("")
        );
    }


    /* -------------------------------------
       HEX → RGB
    -------------------------------------- */

    hexToRgb(hex) {

        const clean =
            hex.replace("#", "");

        if (clean.length !== 6) {
            return null;
        }

        return {

            r: parseInt(
                clean.substring(0, 2),
                16
            ),

            g: parseInt(
                clean.substring(2, 4),
                16
            ),

            b: parseInt(
                clean.substring(4, 6),
                16
            )
        };
    }


    /* -------------------------------------
       RENDER LOOP
    -------------------------------------- */

    render() {

        this.update();

        this.draw();

        requestAnimationFrame(
            () => this.render()
        );
    }

}


/* =========================================
   INITIALISE PARTICLE SYSTEMS
========================================= */

const systemA =
    new LeafSystem(
        canvasA,
        ctxA
    );

const systemB =
    new LeafSystem(
        canvasB,
        ctxB
    );


/* =========================================
   INITIAL SEASON
========================================= */

let activeLayer = "a";

let currentSeasonIndex = 0;

let currentSeason =
    seasonOrder[currentSeasonIndex];

let isTransitioning = false;


/*
    Apply the first season.
*/

gradientA.className =
    `bg-gradient ${seasons[currentSeason].backgroundClass}`;

gradientB.className =
    "bg-gradient";

systemA.setSeason(
    currentSeason
);

systemB.setSeason(
    currentSeason
);


/* =========================================
   SEASON TRANSITION
========================================= */

function transitionToSeason(nextSeason) {

    if (isTransitioning) {
        return;
    }

    isTransitioning = true;


    /*
        Determine which layer is currently visible.
    */

    const outgoingGradient =
        activeLayer === "a"
            ? gradientA
            : gradientB;

    const incomingGradient =
        activeLayer === "a"
            ? gradientB
            : gradientA;

    const outgoingCanvas =
        activeLayer === "a"
            ? canvasA
            : canvasB;

    const incomingCanvas =
        activeLayer === "a"
            ? canvasB
            : canvasA;

    const incomingSystem =
        activeLayer === "a"
            ? systemB
            : systemA;


    /*
        Prepare the incoming background
        before making it visible.
    */

    incomingGradient.className =
        `bg-gradient ${seasons[nextSeason].backgroundClass}`;


    /*
        Prepare a completely new leaf field.

        It uses the new season's colors,
        but stays hidden initially.
    */

    incomingSystem.setSeason(
        nextSeason
    );

    incomingSystem.createLeaves();


    /*
        Start the crossfade.

        The browser handles the actual smooth
        opacity interpolation through CSS.
    */

    requestAnimationFrame(() => {

        incomingGradient.style.opacity = "1";

        incomingCanvas.style.opacity = "0.72";

        outgoingGradient.style.opacity = "0";

        outgoingCanvas.style.opacity = "0";

    });


    /*
        Once the transition has finished,
        reset the old layer so it can be used
        for the next transition.
    */

    setTimeout(() => {

        outgoingGradient.className =
            "bg-gradient";

        outgoingGradient.style.opacity = "0";

        outgoingCanvas.style.opacity = "0";


        /*
            The newly visible layer is now
            considered active.
        */

        activeLayer =
            activeLayer === "a"
                ? "b"
                : "a";

        currentSeason =
            nextSeason;

        isTransitioning = false;

    }, TRANSITION_DURATION + 300);

}


/* =========================================
   START NEXT SEASON
========================================= */

function nextSeason() {

    currentSeasonIndex =
        (currentSeasonIndex + 1) %
        seasonOrder.length;

    const next =
        seasonOrder[currentSeasonIndex];

    transitionToSeason(next);
}


/* =========================================
   AUTOMATIC SEASON CYCLE
========================================= */

setInterval(
    nextSeason,
    SEASON_DURATION
);


/* =========================================
   RESIZE
========================================= */

let resizeTimeout;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimeout);

        resizeTimeout =
            setTimeout(() => {

                systemA.resize();
                systemB.resize();

            }, 150);

    }
);


/* =========================================
   START ANIMATION
========================================= */

systemA.render();
systemB.render();


/* =========================================
   REDUCED MOTION
========================================= */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


if (prefersReducedMotion.matches) {

    /*
        Stop the automatic seasonal changes
        for users who prefer reduced motion.
    */

    /*
        Make sure the current season remains
        visible without animated transitions.
    */

    clearInterval();

}