const TOTAL_ROUNDS = 20;
const DICTIONARY = window.DICTIONARY || [];

const BANNER_COLORS = [
  { value: "#bfe5f5", label: "Himmel" },
  { value: "#a8e6cf", label: "Mynte" },
  { value: "#def4c6", label: "Eng" },
  { value: "#fff3b0", label: "Sol" },
  { value: "#ffd6a5", label: "Fersken" },
  { value: "#ffb3c1", label: "Rosa" },
  { value: "#ff6b6b", label: "Rød" },
  { value: "#d4b8f0", label: "Lavendel" },
  { value: "#b5d5ff", label: "Blåklokke" },
  { value: "#f5d5c8", label: "Korall" },
  { value: "#c5e8e8", label: "Sjøgrønn" },
  { value: "#ffffff", label: "Hvit" },
  { value: "#c8a07a", label: "Brun" },
  { value: "#1a2e5a", label: "Mørkeblå" },
  { value: "#e8d5f5", label: "Lyselilla" },
  { value: "#1a1a1a", label: "Svart" },
];

const BANNER_ANIMALS = ["🦊", "🐺", "🦡", "🦨", "🦝", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷", "🐸", "🦋", "🦜", "🦉", "🐧", "🦔", "🐹", "🐰", "🦄", "🐴", "🦒", "🦥", "🐱", "🧑", "🐆", "🍕", "❤️", "🥸", "🧟", "🧌", "🐶"];

const bannerState = {
  selectedColor: BANNER_COLORS[0].value,
  selectedAnimal: BANNER_ANIMALS[0],
};

const ANIMAL_MOOD = {
  "🦄": "vivid",
  "🐺": "muted",
  "🧟": "spooky",
  "🧌": "earthy",
  "🐯": "warm",
  "🦁": "warm",
  "🦜": "vivid",
  "🦋": "vivid",
  "🐧": "cool",
  "🐸": "fresh",
};

const settings = {
  uppercase: false,
};

const state = {
  currentRound: 1,
  score: 0,
  currentWord: "",
  currentScrambled: "",
  currentAttempts: 0,
  shuffleUsed: false,
  roundData: [],
  celebrationTimer: null
};

const elements = {
  gamePanel: document.getElementById("gamePanel"),
  roundInfo: document.getElementById("roundInfo"),
  scoreInfo: document.getElementById("scoreInfo"),
  scrambledWord: document.getElementById("scrambledWord"),
  guessForm: document.getElementById("guessForm"),
  guessInput: document.getElementById("guessInput"),
  message: document.getElementById("message"),
  history: document.getElementById("history"),
  hintButton: document.getElementById("hintButton"),
  nextButton: document.getElementById("nextButton"),
  reshuffleButton: document.getElementById("reshuffleButton"),
  caseToggleButton: document.getElementById("caseToggleButton"),
  celebration: document.getElementById("celebration"),
  bannerShell: document.getElementById("bannerShell"),
  bannerImage: document.getElementById("bannerImage"),
  bannerCustomDisplay: document.getElementById("bannerCustomDisplay"),
  bannerPicker: document.getElementById("bannerPicker"),
};

function applyCase(text) {
  return settings.uppercase ? text.toUpperCase() : text;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map(ch => ch + ch).join("")
    : normalized;

  const intValue = Number.parseInt(value, 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColors(colorA, colorB, ratio = 0.5) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const t = clamp(ratio, 0, 1);

  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

function colorToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

function hslToColor(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 1);
  const light = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = light - c / 2;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c; g1 = x;
  } else if (hue < 120) {
    r1 = x; g1 = c;
  } else if (hue < 180) {
    g1 = c; b1 = x;
  } else if (hue < 240) {
    g1 = x; b1 = c;
  } else if (hue < 300) {
    r1 = x; b1 = c;
  } else {
    r1 = c; b1 = x;
  }

  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function adjustColor(hex, { hueShift = 0, saturation = 1, lightness = 1 }) {
  const hsl = colorToHsl(hex);
  return hslToColor(
    hsl.h + hueShift,
    hsl.s * saturation,
    hsl.l * lightness
  );
}

function buildThemePalette(baseColor) {
  const isDark = luminance(baseColor) < 0.38;
  const top = isDark ? mixColors(baseColor, "#07090f", 0.55) : mixColors(baseColor, "#ffffff", 0.35);
  const mid = isDark ? mixColors(baseColor, "#111827", 0.5) : mixColors(baseColor, "#f7fffb", 0.55);
  const bottom = isDark ? mixColors(baseColor, "#1a2230", 0.42) : mixColors(baseColor, "#fff7ea", 0.62);
  const accent = isDark ? mixColors(baseColor, "#a8ffd5", 0.45) : adjustColor(baseColor, { saturation: 1.2, lightness: 0.62 });
  const primary = isDark ? mixColors(baseColor, "#6ec8ff", 0.55) : adjustColor(baseColor, { saturation: 1.25, lightness: 0.72 });
  const primaryHover = isDark
    ? adjustColor(primary, { saturation: 1.08, lightness: 0.92 })
    : adjustColor(primary, { saturation: 1.05, lightness: 0.86 });

  return {
    isDark,
    "--page-top": top,
    "--page-mid": mid,
    "--page-bottom": bottom,
    "--panel": isDark ? "rgba(15, 22, 35, 0.86)" : "rgba(255, 255, 255, 0.92)",
    "--panel-strong": isDark ? "#182235" : "#ffffff",
    "--panel-border": isDark ? "rgba(130, 170, 220, 0.2)" : "rgba(255, 255, 255, 0.72)",
    "--text": isDark ? "#e5efff" : "#1d5848",
    "--muted": isDark ? "#adc0d6" : "#547668",
    "--line": isDark ? "#2e3f5d" : "#d7eee3",
    "--primary": primary,
    "--primary-hover": primaryHover,
    "--button-text": isDark ? "#08111f" : "#fffdf9",
    "--secondary-border": isDark ? mixColors(baseColor, "#b6ccff", 0.52) : mixColors(baseColor, "#f1c35c", 0.55),
    "--secondary-text": isDark ? "#eaf3ff" : "#815c00",
    "--secondary-bg": isDark ? "rgba(8, 13, 24, 0.35)" : "transparent",
    "--accent-dark": accent,
    "--shadow": isDark ? "0 20px 44px rgba(3, 7, 16, 0.5)" : "0 20px 44px rgba(74, 120, 94, 0.14)",
    "--status-dot": isDark ? mixColors(baseColor, "#a6cbff", 0.5) : mixColors(baseColor, "#9fcfae", 0.4),
    "--scramble-top": isDark ? "#142037" : mixColors(baseColor, "#edfff5", 0.68),
    "--scramble-bottom": isDark ? "#172a45" : mixColors(baseColor, "#def4fb", 0.68),
    "--scramble-border": isDark ? "#33537d" : mixColors(baseColor, "#cfeee0", 0.55),
    "--scramble-dash": isDark ? "#6ea1df" : mixColors(baseColor, "#8fd7ab", 0.5),
    "--scramble-inner-shadow": isDark ? "rgba(4, 10, 22, 0.4)" : "rgba(53, 165, 106, 0.06)",
    "--input-border": isDark ? "#45638b" : mixColors(baseColor, "#b8dfc8", 0.6),
    "--input-bg": isDark ? "#111b2c" : "#fffef8",
    "--input-focus": isDark ? "#7fb7ff" : mixColors(baseColor, "#69c989", 0.55),
    "--input-focus-shadow": isDark ? "rgba(110, 171, 255, 0.25)" : "rgba(99, 203, 135, 0.18)",
  };
}

function applyAnimalMood(palette, animal) {
  const mood = ANIMAL_MOOD[animal] || "neutral";
  const next = { ...palette };

  if (mood === "vivid") {
    next["--primary"] = adjustColor(next["--primary"], { saturation: 1.45, lightness: 1.05 });
    next["--primary-hover"] = adjustColor(next["--primary-hover"], { saturation: 1.4, lightness: 1.04 });
    next["--accent-dark"] = adjustColor(next["--accent-dark"], { saturation: 1.35, lightness: 1.03 });
  }

  if (mood === "muted") {
    next["--primary"] = adjustColor(next["--primary"], { saturation: 0.55, lightness: 0.95 });
    next["--primary-hover"] = adjustColor(next["--primary-hover"], { saturation: 0.52, lightness: 0.92 });
    next["--accent-dark"] = adjustColor(next["--accent-dark"], { saturation: 0.5, lightness: 0.92 });
  }

  if (mood === "spooky") {
    next["--page-mid"] = mixColors(next["--page-mid"], "#0f2018", 0.58);
    next["--page-bottom"] = mixColors(next["--page-bottom"], "#112418", 0.62);
    next["--primary"] = "#70c97f";
    next["--primary-hover"] = "#5bb06b";
    next["--accent-dark"] = "#9ae7aa";
    next["--secondary-text"] = "#d6f2db";
  }

  if (mood === "earthy") {
    next["--primary"] = "#b88458";
    next["--primary-hover"] = "#9f6d43";
    next["--accent-dark"] = "#6f4a2d";
    next["--secondary-border"] = "#9a7554";
  }

  if (mood === "warm") {
    next["--primary"] = mixColors(next["--primary"], "#ff9b3f", 0.55);
    next["--primary-hover"] = mixColors(next["--primary-hover"], "#f47b2b", 0.58);
  }

  if (mood === "cool") {
    next["--primary"] = mixColors(next["--primary"], "#5da6ff", 0.52);
    next["--primary-hover"] = mixColors(next["--primary-hover"], "#3f87da", 0.56);
  }

  if (mood === "fresh") {
    next["--primary"] = mixColors(next["--primary"], "#5ccf70", 0.62);
    next["--primary-hover"] = mixColors(next["--primary-hover"], "#43b559", 0.62);
    next["--accent-dark"] = mixColors(next["--accent-dark"], "#2a8e3c", 0.5);
  }

  return next;
}

function applyThemeFromBanner() {
  const root = document.documentElement;
  const basePalette = buildThemePalette(bannerState.selectedColor);
  const palette = applyAnimalMood(basePalette, bannerState.selectedAnimal);

  Object.entries(palette).forEach(([name, value]) => {
    if (name === "isDark") {
      return;
    }
    root.style.setProperty(name, value);
  });
}

function getRandomWord() {
  const index = Math.floor(Math.random() * DICTIONARY.length);
  return DICTIONARY[index];
}

function shuffleWord(word) {
  const letters = [...word];

  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  const scrambled = letters.join("");
  if (scrambled === word && word.length > 1) {
    return shuffleWord(word);
  }

  return scrambled;
}

function setMessage(text) {
  elements.message.textContent = text;
}

function updateStatus() {
  elements.roundInfo.textContent = `${Math.min(state.currentRound, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`;
  elements.scoreInfo.textContent = `${state.score}`;
}

function updateHistory() {
  if (!state.roundData.length) {
    elements.history.textContent = "Stjernestien er tom ennå.";
    return;
  }

  elements.history.textContent = `Stjernesti: ${state.roundData.slice(-3).join(" · ")}`;
}

function refreshBoard() {
  updateStatus();
  elements.scrambledWord.textContent = applyCase(state.currentScrambled);
  updateHistory();
}

function clearCelebration() {
  if (state.celebrationTimer) {
    clearTimeout(state.celebrationTimer);
    state.celebrationTimer = null;
  }

  elements.gamePanel.classList.remove("is-celebrating");
  elements.scrambledWord.classList.remove("is-celebrating");
  elements.message.classList.remove("is-cheering");
  elements.celebration.innerHTML = "";
}

function celebrateRound(word, earned) {
  clearCelebration();

  elements.gamePanel.classList.add("is-celebrating");
  elements.scrambledWord.classList.add("is-celebrating");
  elements.message.classList.add("is-cheering");

  const cheers = ["Hurra!", "Bra!", "Du klarte det!", "Stjerne!"];
  const pieces = Array.from({ length: 10 }, (_, index) => {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = index % 3 === 0 ? "★" : index % 3 === 1 ? "✦" : "•";
    piece.style.left = `${10 + index * 8}%`;
    piece.style.animationDelay = `${index * 0.05}s`;
    piece.style.setProperty("--drift", `${(index % 4) * 10 - 14}px`);
    return piece;
  });

  const badge = document.createElement("div");
  badge.className = "celebration-badge";
  badge.textContent = `${cheers[state.score % cheers.length]} ${word} +${earned}`;

  pieces.forEach(piece => elements.celebration.appendChild(piece));
  elements.celebration.appendChild(badge);

  state.celebrationTimer = setTimeout(() => {
    clearCelebration();
  }, 1500);
}

function startRound(forceNew = false) {
  clearCelebration();

  if (!forceNew && state.currentRound > TOTAL_ROUNDS) {
    setMessage("Ferdig! Trykk Neste ord for å starte på nytt.");
    updateStatus();
    return;
  }

  state.currentWord = getRandomWord();
  state.currentScrambled = shuffleWord(state.currentWord);
  state.currentAttempts = 0;
  state.shuffleUsed = false;
  elements.reshuffleButton.disabled = false;

  if (state.currentScrambled === state.currentWord) {
    state.currentScrambled = shuffleWord(state.currentWord);
  }

  elements.guessInput.value = "";
  elements.guessInput.focus();
  refreshBoard();
  setMessage("Nytt ord er klart.");
}

function finishGameMessage() {
  return `Du fikk ${state.score} poeng. Trykk Neste ord for å spille igjen.`;
}

function checkGuess(guess) {
  const normalized = guess.trim().toLowerCase();

  if (!normalized) {
    setMessage("Skriv et ord først.");
    return;
  }

  state.currentAttempts += 1;

  if (normalized === state.currentWord.toLowerCase()) {
    const solvedWord = state.currentWord;
    const earned = Math.max(1, 6 - state.currentAttempts);

    state.score += earned;
    state.roundData.push(`${solvedWord} ★ +${earned}`);
    state.currentRound += 1;

    refreshBoard();
    celebrateRound(solvedWord, earned);

    if (state.currentRound > TOTAL_ROUNDS) {
      setMessage(`Riktig! ${solvedWord}. ${finishGameMessage()}`);
      return;
    }

    setMessage(`Riktig! ${solvedWord} ga ${earned} poeng.`);
    return;
  }

  if (state.currentWord.toLowerCase().includes(normalized) && normalized.length > 1) {
    setMessage("Nesten. Prøv igjen.");
  } else {
    setMessage(`Ikke helt ennå. Forsøk ${state.currentAttempts}.`);
  }
}

function showHint() {
  const first = applyCase(state.currentWord[0] || "?");
  const last = applyCase(state.currentWord[state.currentWord.length - 1] || "?");
  setMessage(`Hint: ${first} ... ${last}`);
  elements.guessInput.focus();
}

function buildBannerPicker() {
  const swatchContainer = document.getElementById("bannerColorSwatches");
  BANNER_COLORS.forEach(({ value, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.style.background = value;
    btn.dataset.color = value;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", () => selectBannerColor(value));
    swatchContainer.appendChild(btn);
  });

  const animalContainer = document.getElementById("bannerAnimalGrid");
  BANNER_ANIMALS.forEach(animal => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "animal-button";
    btn.textContent = animal;
    btn.setAttribute("aria-label", animal);
    btn.addEventListener("click", () => selectBannerAnimal(animal));
    animalContainer.appendChild(btn);
  });
}

function selectBannerColor(color) {
  bannerState.selectedColor = color;
  document.querySelectorAll(".color-swatch").forEach(btn => {
    btn.classList.toggle("is-selected", btn.dataset.color === color);
  });
}

function selectBannerAnimal(animal) {
  bannerState.selectedAnimal = animal;
  document.querySelectorAll(".animal-button").forEach(btn => {
    btn.classList.toggle("is-selected", btn.textContent === animal);
  });
}

function openBannerPicker() {
  selectBannerColor(bannerState.selectedColor);
  selectBannerAnimal(bannerState.selectedAnimal);
  elements.bannerPicker.classList.add("is-open");
  elements.bannerPicker.setAttribute("aria-hidden", "false");
}

function closeBannerPicker() {
  elements.bannerPicker.classList.remove("is-open");
  elements.bannerPicker.setAttribute("aria-hidden", "true");
}

function applyBannerCustomization() {
  elements.bannerShell.style.backgroundColor = bannerState.selectedColor;
  elements.bannerCustomDisplay.textContent = bannerState.selectedAnimal;
  elements.bannerShell.classList.add("is-custom");
  applyThemeFromBanner();
  closeBannerPicker();
}

function reshuffleWord() {
  if (state.shuffleUsed) {
    setMessage("Du kan bare stokke om én gang per ord.");
    return;
  }

  const current = state.currentScrambled;
  let next = shuffleWord(state.currentWord);
  if (next === current) {
    next = shuffleWord(state.currentWord);
  }

  state.currentScrambled = next;
  state.shuffleUsed = true;
  elements.reshuffleButton.disabled = true;
  elements.scrambledWord.textContent = applyCase(state.currentScrambled);
  setMessage("Ordet er stokket om på nytt.");
  elements.guessInput.focus();
}

function nextWord() {
  clearCelebration();

  if (state.currentRound >= TOTAL_ROUNDS) {
    state.score = 0;
    state.currentRound = 1;
    state.roundData = [];
    updateHistory();
  } else {
    state.currentRound += 1;
  }

  startRound(true);
}

function handleSubmit(event) {
  event.preventDefault();

  const guess = elements.guessInput.value;
  const normalized = guess.trim().toLowerCase();

  if (!normalized) {
    setMessage("Skriv et ord først.");
    return;
  }

  const expected = state.currentWord.toLowerCase();
  checkGuess(guess);

  if (state.currentRound <= TOTAL_ROUNDS && normalized === expected) {
    setTimeout(() => startRound(true), 950);
  }
}

function handleKeydown(event) {
  if (event.key === "Enter" && document.activeElement === elements.guessInput) {
    return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (event.key === "Escape") {
    closeBannerPicker();
  }

  if (event.key === "1") {
    event.preventDefault();
    showHint();
  }

  if (event.key === "2") {
    event.preventDefault();
    nextWord();
  }

  if (event.key === "3") {
    event.preventDefault();
    reshuffleWord();
  }
}

function init() {
  if (!DICTIONARY.length) {
    setMessage("Ordboken ble ikke lastet.");
    return;
  }

  elements.guessForm.addEventListener("submit", handleSubmit);
  elements.hintButton.addEventListener("click", showHint);
  elements.nextButton.addEventListener("click", nextWord);
  elements.reshuffleButton.addEventListener("click", reshuffleWord);
  elements.caseToggleButton.addEventListener("click", () => {
    settings.uppercase = !settings.uppercase;
    elements.caseToggleButton.classList.toggle("is-active", settings.uppercase);
    elements.scrambledWord.textContent = applyCase(state.currentScrambled);
  });
  elements.bannerShell.addEventListener("click", openBannerPicker);
  elements.bannerShell.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBannerPicker(); }
  });
  document.getElementById("bannerApplyButton").addEventListener("click", applyBannerCustomization);
  document.getElementById("bannerCancelButton").addEventListener("click", closeBannerPicker);
  elements.bannerPicker.addEventListener("click", (e) => {
    if (e.target === elements.bannerPicker) closeBannerPicker();
  });
  window.addEventListener("keydown", handleKeydown);

  buildBannerPicker();
  applyThemeFromBanner();
  startRound(true);
}

init();
