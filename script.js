/* =========================================================
   SEASONAL BACKGROUND
========================================================= */

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


const seasonOrder = [
    "autumn",
    "winter",
    "spring",
    "summer"
];


const SEASON_DURATION = 30000;
const TRANSITION_DURATION = 7000;


/* =========================================================
   HELPERS
========================================================= */

function hexToRgb(hex) {

    const value =
        hex.replace("#", "");

    return {
        r: parseInt(
            value.substring(0, 2),
            16
        ),

        g: parseInt(
            value.substring(2, 4),
            16
        ),

        b: parseInt(
            value.substring(4, 6),
            16
        )
    };
}


function rgbToHex(r, g, b) {

    return (
        "#" +

        [r, g, b]
            .map((value) =>
                Math.round(value)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}


function lerp(a, b, amount) {

    return (
        a +
        (b - a) * amount
    );
}


function interpolateColor(
    colorA,
    colorB,
    amount
) {

    const a =
        hexToRgb(colorA);

    const b =
        hexToRgb(colorB);

    return rgbToHex(
        lerp(a.r, b.r, amount),
        lerp(a.g, b.g, amount),
        lerp(a.b, b.b, amount)
    );
}


/* =========================================================
   LEAF SYSTEM
========================================================= */

class LeafSystem {

    constructor(
        canvas,
        seasonName
    ) {

        this.canvas =
            canvas;

        this.ctx =
            canvas.getContext("2d");

        this.seasonName =
            seasonName;

        this.leaves = [];

        this.resize();

        this.createLeaves();

        window.addEventListener(
            "resize",
            () => {
                this.resize();
            }
        );
    }


    resize() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

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

        const amount =
            Math.max(
                28,
                Math.min(
                    48,
                    Math.floor(
                        this.width / 30
                    )
                )
            );

        this.leaves = [];

        for (
            let i = 0;
            i < amount;
            i++
        ) {

            this.leaves.push(
                this.createLeaf(true)
            );
        }
    }


    createLeaf(
        randomY = false
    ) {

        const colors =
            seasons[
                this.seasonName
            ].leafColors;

        const size =
            Math.random() * 7 + 5;

        return {

            x:
                Math.random() *
                this.width,

            y:
                randomY
                    ? Math.random() *
                      this.height
                    : -30,

            size,

            speed:
                Math.random() *
                0.25 +
                0.18,

            drift:
                Math.random() *
                0.45 +
                0.15,

            driftOffset:
                Math.random() *
                Math.PI *
                2,

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                (
                    Math.random() -
                    0.5
                ) * 0.015,

            width:
                size *
                (
                    Math.random() *
                    0.7 +
                    0.8
                ),

            height:
                size *
                (
                    Math.random() *
                    0.35 +
                    0.45
                ),

            opacity:
                Math.random() *
                0.35 +
                0.35,

            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

            targetColor:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

            startColor: null
        };
    }


    update(time) {

        this.leaves.forEach(
            (leaf) => {

                leaf.y +=
                    leaf.speed;

                leaf.x +=
                    Math.sin(
                        time * 0.0005 +
                        leaf.driftOffset
                    ) *
                    leaf.drift;

                leaf.rotation +=
                    leaf.rotationSpeed;


                if (
                    leaf.y >
                    this.height + 40
                ) {

                    leaf.y = -40;

                    leaf.x =
                        Math.random() *
                        this.width;
                }


                if (
                    leaf.x < -40
                ) {

                    leaf.x =
                        this.width + 40;
                }


                if (
                    leaf.x >
                    this.width + 40
                ) {

                    leaf.x = -40;
                }

            }
        );
    }


    drawLeaf(leaf) {

        const ctx =
            this.ctx;

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


        ctx.beginPath();


        ctx.moveTo(
            0,
            -leaf.height
        );


        ctx.quadraticCurveTo(
            leaf.width,
            -leaf.height * 0.4,
            leaf.width * 0.7,
            0
        );


        ctx.quadraticCurveTo(
            leaf.width * 0.25,
            leaf.height * 0.75,
            0,
            leaf.height
        );


        ctx.quadraticCurveTo(
            -leaf.width * 0.25,
            leaf.height * 0.75,
            -leaf.width * 0.7,
            0
        );


        ctx.quadraticCurveTo(
            -leaf.width,
            -leaf.height * 0.4,
            0,
            -leaf.height
        );


        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        this.leaves.forEach(
            (leaf) => {
                this.drawLeaf(leaf);
            }
        );
    }


    animate(time) {

        this.update(time);

        this.draw();

        requestAnimationFrame(
            (nextTime) =>
                this.animate(nextTime)
        );
    }


    start() {

        requestAnimationFrame(
            (time) =>
                this.animate(time)
        );
    }

}


/* =========================================================
   SEASON MANAGER
========================================================= */

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


let currentSeasonIndex = 0;


let activeGradient =
    gradientA;

let inactiveGradient =
    gradientB;


let activeParticles =
    particlesA;

let inactiveParticles =
    particlesB;


let activeLeafSystem =
    new LeafSystem(
        particlesA,
        seasonOrder[
            currentSeasonIndex
        ]
    );


let inactiveLeafSystem =
    new LeafSystem(
        particlesB,
        seasonOrder[
            (
                currentSeasonIndex +
                1
            ) %
            seasonOrder.length
        ]
    );


activeLeafSystem.start();
inactiveLeafSystem.start();


/* =========================================================
   SEASON CLASS
========================================================= */

function setSeasonClass(
    element,
    season
) {

    element.classList.remove(
        "autumn",
        "winter",
        "spring",
        "summer"
    );

    element.classList.add(
        season
    );
}


/* =========================================================
   SEASON TRANSITION
========================================================= */

function transitionToSeason(
    nextSeason
) {

    const nextIndex =
        seasonOrder.indexOf(
            nextSeason
        );

    if (
        nextIndex === -1
    ) {
        return;
    }


    const nextSeasonData =
        seasons[nextSeason];


    const currentSeason =
        seasonOrder[
            currentSeasonIndex
        ];


    if (
        nextSeason ===
        currentSeason
    ) {
        return;
    }


    /* -----------------------------------------
       Prepare hidden layers
    ----------------------------------------- */

    setSeasonClass(
        inactiveGradient,
        nextSeason
    );

    setSeasonClass(
        inactiveParticles,
        nextSeason
    );


    /* -----------------------------------------
       Prepare leaves
    ----------------------------------------- */

    inactiveLeafSystem.seasonName =
        nextSeason;


    inactiveLeafSystem.leaves.forEach(
        (leaf) => {

            const colors =
                nextSeasonData.leafColors;

            leaf.startColor =
                leaf.color;

            leaf.targetColor =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];
        }
    );


    /* -----------------------------------------
       Fade new background in
    ----------------------------------------- */

    inactiveGradient.style.opacity =
        "1";

    inactiveParticles.style.opacity =
        "0.72";


    /* -----------------------------------------
       Animate leaf colors
    ----------------------------------------- */

    const startTime =
        performance.now();


    function animateColorTransition(
        now
    ) {

        const elapsed =
            now -
            startTime;


        const progress =
            Math.min(
                elapsed /
                TRANSITION_DURATION,
                1
            );


        const eased =
            progress *
            progress *
            (
                3 -
                2 * progress
            );


        inactiveLeafSystem.leaves.forEach(
            (leaf) => {

                leaf.color =
                    interpolateColor(
                        leaf.startColor,
                        leaf.targetColor,
                        eased
                    );
            }
        );


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                animateColorTransition
            );

        } else {

            inactiveLeafSystem.leaves.forEach(
                (leaf) => {

                    leaf.color =
                        leaf.targetColor;

                    leaf.startColor =
                        null;
                }
            );
        }
    }


    requestAnimationFrame(
        animateColorTransition
    );


    /* -----------------------------------------
       Swap layers
    ----------------------------------------- */

    setTimeout(
        () => {

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


            const oldLeafSystem =
                activeLeafSystem;

            activeLeafSystem =
                inactiveLeafSystem;

            inactiveLeafSystem =
                oldLeafSystem;


            currentSeasonIndex =
                nextIndex;


            inactiveGradient.style.opacity =
                "0";

            inactiveParticles.style.opacity =
                "0";

        },
        TRANSITION_DURATION
    );
}


/* =========================================================
   NEXT SEASON
========================================================= */

function nextSeason() {

    const nextIndex =
        (
            currentSeasonIndex +
            1
        ) %
        seasonOrder.length;

    transitionToSeason(
        seasonOrder[nextIndex]
    );
}


/* =========================================================
   INITIAL SEASON
========================================================= */

setSeasonClass(
    gradientA,
    "autumn"
);

setSeasonClass(
    gradientB,
    "winter"
);

setSeasonClass(
    particlesA,
    "autumn"
);

setSeasonClass(
    particlesB,
    "winter"
);


gradientA.style.opacity =
    "1";

gradientB.style.opacity =
    "0";


particlesA.style.opacity =
    "0.72";

particlesB.style.opacity =
    "0";


/* =========================================================
   CHANGE SEASON EVERY 30 SECONDS
========================================================= */

setInterval(
    nextSeason,
    SEASON_DURATION
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


if (
    !prefersReducedMotion.matches &&
    "IntersectionObserver" in window
) {

    const revealObserver =
        new IntersectionObserver(
            (
                entries,
                observer
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "visible"
                        );


                        observer.unobserve(
                            entry.target
                        );
                    }
                );

            },
            {
                threshold: 0.12,

                rootMargin:
                    "0px 0px -50px 0px"
            }
        );


    revealElements.forEach(
        (element) => {

            revealObserver.observe(
                element
            );
        }
    );

} else {

    revealElements.forEach(
        (element) => {

            element.classList.add(
                "visible"
            );
        }
    );
}


/* =========================================================
   SCROLL PROGRESS
========================================================= */

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
        return;
    }


    const progress =
        scrollTop /
        documentHeight;


    scrollProgress.style.transform =
        `scaleX(${progress})`;
}


window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
        passive: true
    }
);


updateScrollProgress();


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
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
                            prefersReducedMotion.matches
                                ? "auto"
                                : "smooth",

                        block:
                            "start"
                    });
                }
            );
        }
    );