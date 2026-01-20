let intervalMs = 5000;
let paused = false;
let timer = null;
let revealTimer = null;

/* ------------------ SELECTOR DATA ------------------ */

const ROOT_OPTIONS = [
    { label: "C", values: ["C"] },
    { label: "C# / Db", values: ["C#", "Db"] },
    { label: "D", values: ["D"] },
    { label: "D# / Eb", values: ["D#", "Eb"] },
    { label: "E", values: ["E"] },
    { label: "F", values: ["F"] },
    { label: "F# / Gb", values: ["F#", "Gb"] },
    { label: "G", values: ["G"] },
    { label: "G# / Ab", values: ["G#", "Ab"] },
    { label: "A", values: ["A"] },
    { label: "A# / Bb", values: ["A#", "Bb"] },
    { label: "B", values: ["B"] }
];

const QUALITY_OPTIONS = ["maj7", "m7", "7"];

const INVERSION_OPTIONS = [
    { label: "root position", suffix: "root" },
    { label: "1st inversion", suffix: "1st" },
    { label: "2nd inversion", suffix: "2nd" },
    { label: "3rd inversion", suffix: "3rd" }
];

/* ------------------ RENDER SELECTORS ------------------ */

function renderSelectors() {
    const rootContainer = document.getElementById("rootSelectors");
    const qualityContainer = document.getElementById("qualitySelectors");
    const inversionContainer = document.getElementById("inversionSelectors");

    ROOT_OPTIONS.forEach((group, i) => {
        rootContainer.innerHTML += `
            <label>
                <input type="checkbox" data-root-group="${i}" checked>
                ${group.label}
            </label><br>
        `;
    });

    QUALITY_OPTIONS.forEach(q => {
        qualityContainer.innerHTML += `
            <label>
                <input type="checkbox" data-quality="${q}" checked>
                ${q}
            </label><br>
        `;
    });

    INVERSION_OPTIONS.forEach(inv => {
        inversionContainer.innerHTML += `
            <label>
                <input type="checkbox" data-inversion="${inv.suffix}" checked>
                ${inv.label}
            </label><br>
        `;
    });
}

/* ------------------ READ SELECTIONS ------------------ */

function getSelectedRoots() {
    const checked = [...document.querySelectorAll("[data-root-group]:checked")];
    return checked.flatMap(cb =>
        ROOT_OPTIONS[cb.dataset.rootGroup].values
    );
}

function getSelectedQualities() {
    return [...document.querySelectorAll("[data-quality]:checked")]
        .map(cb => cb.dataset.quality);
}

function getSelectedInversions() {
    return [...document.querySelectorAll("[data-inversion]:checked")]
        .map(cb => cb.dataset.inversion);
}

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
    const roots = getSelectedRoots();
    const qualities = getSelectedQualities();
    const inversions = getSelectedInversions();

    if (!roots.length || !qualities.length || !inversions.length) {
        return null;
    }

    const root = choice(roots);
    const quality = choice(qualities);
    const inversionSuffix = choice(inversions);

    const inversionObj = INVERSION_OPTIONS.find(
        inv => inv.suffix === inversionSuffix
    );

    const normalizedRoot = normalizeRoot(root);
    const image =
        `${normalizedRoot}${quality}_${inversionSuffix}.png`;

    return {
        root,
        quality,
        inversionLabel: inversionObj.label,
        image
    };
}

/* ------------------ MAIN LOGIC ------------------ */

function fetchChord() {
    if (paused) return;

    const data = generateChord();
    if (!data) return;

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

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebarToggle");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("open");
};

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

/* ------------------ START ------------------ */

preloadImages();
renderSelectors();
fetchChord();
scheduleNext();
