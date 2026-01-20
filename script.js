let intervalMs = 5000;
let paused = false;
let timer = null;
let revealTimer = null;

/* ------------------ DATA ------------------ */

const ROOTS = [
    "C", "C#", "Db", "D", "D#", "Eb", "E",
    "F", "F#", "Gb", "G", "G#", "Ab",
    "A", "A#", "Bb", "B"
];

const QUALITIES = ["maj7", "m7", "7"];

const INVERSIONS = [
    { label: "root position", suffix: "root" },
    { label: "1st inversion", suffix: "1st" },
    { label: "2nd inversion", suffix: "2nd" },
    { label: "3rd inversion", suffix: "3rd" }
];

const CHORD_IMAGE_MAP = {
    "C#": "Csharp",
    "Db": "Csharp",
    "D#": "Eb",
    "F#": "Fsharp",
    "Gb": "Fsharp",
    "G#": "Ab",
    "A#": "Bb",
    "Cb": "B",
    "E#": "F",
    "Fb": "E",
    "B#": "C"
};

const ROOT_COLORS = {
    "C": "#C0392B",

    "C#": "#D35400",
    "Db": "#D35400",

    "D": "#E67E22",

    "D#": "#F39C12",
    "Eb": "#F39C12",

    "E": "#F1C40F",

    "F": "#9ACD32",

    "F#": "#27AE60",
    "Gb": "#27AE60",

    "G": "#16A085",

    "G#": "#1ABC9C",
    "Ab": "#1ABC9C",

    "A": "#2980B9",

    "A#": "#6C5CE7",
    "Bb": "#6C5CE7",

    "B": "#8E44AD"
};

/* ------------------ HELPERS ------------------ */

function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeRoot(root) {
    return CHORD_IMAGE_MAP[root] || root;
}

/* ------------------ IMAGE PRELOAD ------------------ */

function preloadImages() {
    const cache = [];

    ROOTS.forEach(root => {
        QUALITIES.forEach(quality => {
            INVERSIONS.forEach(inv => {
                const normalizedRoot = normalizeRoot(root);
                const img = new Image();
                img.src = `chords/${normalizedRoot}${quality}_${inv.suffix}.png`;
                cache.push(img);
            });
        });
    });

    const empty = new Image();
    empty.src = "chords/empty.png";
    cache.push(empty);

    window._imageCache = cache;
}

/* ------------------ CHORD GENERATION ------------------ */

function generateChord() {
    const root = choice(ROOTS);
    const quality = choice(QUALITIES);
    const inversion = choice(INVERSIONS);

    const normalizedRoot = normalizeRoot(root);
    const image =
        `${normalizedRoot}${quality}_${inversion.suffix}.png`;

    return {
        root,
        quality,
        inversionLabel: inversion.label,
        image
    };
}

/* ------------------ MAIN LOGIC ------------------ */

function fetchChord() {
    if (paused) return;

    const data = generateChord();

    const chordEl = document.getElementById("chord");
    chordEl.innerText = `${data.root}${data.quality}`;
    chordEl.style.color = ROOT_COLORS[data.root] || "#000";

    document.getElementById("inversion").innerText =
        data.inversionLabel;

    const img = document.getElementById("chordImage");
    const revealLater = document.getElementById("revealLater").checked;

    clearTimeout(revealTimer);

    if (revealLater) {
        img.src = "chords/empty.png";

        revealTimer = setTimeout(() => {
            if (!paused) {
                img.src = `chords/${data.image}`;
            }
        }, intervalMs);
    } else {
        img.src = `chords/${data.image}`;
    }
}

function scheduleNext() {
    clearTimeout(timer);

    timer = setTimeout(() => {
        fetchChord();
        scheduleNext();
    }, document.getElementById("revealLater").checked
        ? intervalMs * 2
        : intervalMs
    );
}

function togglePause() {
    paused = !paused;
    document.body.classList.toggle("paused", paused);

    document.getElementById("pauseBtn").innerText =
        paused ? "Continue" : "Pause";

    if (paused) {
        clearTimeout(timer);
        clearTimeout(revealTimer);
    } else {
        scheduleNext();
    }
}

/* ------------------ UI EVENTS ------------------ */

document.getElementById("pauseBtn").onclick = togglePause;

document.getElementById("setIntervalBtn").onclick = () => {
    const seconds = Number(document.getElementById("intervalInput").value);
    if (!seconds || seconds <= 0) return;

    intervalMs = seconds * 1000;

    clearTimeout(timer);
    clearTimeout(revealTimer);

    if (!paused) {
        scheduleNext();
    }
};

document.addEventListener("click", (e) => {
    // Ignore clicks on controls (buttons, inputs, labels)
    const tag = e.target.tagName.toLowerCase();
    if (["button", "input", "label"].includes(tag)) return;

    togglePause();
});

/* ------------------ START ------------------ */

preloadImages();
fetchChord();
scheduleNext();
