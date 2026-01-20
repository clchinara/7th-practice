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

/* ------------------ HELPERS ------------------ */

function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeRoot(root) {
    return CHORD_IMAGE_MAP[root] || root;
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

    document.getElementById("chord").innerText =
        `${data.root}${data.quality}`;
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

/* ------------------ UI EVENTS ------------------ */

document.getElementById("pauseBtn").onclick = () => {
    paused = !paused;
    document.getElementById("pauseBtn").innerText =
        paused ? "Continue" : "Pause";

    if (paused) {
        clearTimeout(timer);
        clearTimeout(revealTimer);
    } else {
        scheduleNext();
    }
};

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

/* ------------------ START ------------------ */

fetchChord();
scheduleNext();
