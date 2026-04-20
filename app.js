const TOTAL_ROUNDS = 20;
const DICTIONARY = window.DICTIONARY || [];

const BANNER_COLORS = [
  { value: "#bfe5f5", label: "Himmel" },
  { value: "#a8e6cf", label: "Mynte" },
  { value: "#def4c6", label: "Eng" },
  { value: "#fff3b0", label: "Sol" },
  { value: "#ffd6a5", label: "Fersken" },
  { value: "#ffb3c1", label: "Rosa" },
  { value: "#d4b8f0", label: "Lavendel" },
  { value: "#b5d5ff", label: "Blåklokke" },
  { value: "#f5d5c8", label: "Korall" },
  { value: "#c5e8e8", label: "Sjøgrønn" },
];

const BANNER_ANIMALS = ["🦊", "🐺", "🦡", "🦨", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷", "🐸", "🦋", "🦜", "🦉", "🐧", "🦔", "🐹", "🐰", "🦄"];

const bannerState = {
  selectedColor: BANNER_COLORS[0].value,
  selectedAnimal: BANNER_ANIMALS[0],
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
  celebration: document.getElementById("celebration"),
  bannerShell: document.getElementById("bannerShell"),
  bannerImage: document.getElementById("bannerImage"),
  bannerCustomDisplay: document.getElementById("bannerCustomDisplay"),
  bannerPicker: document.getElementById("bannerPicker"),
};

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
  elements.scrambledWord.textContent = state.currentScrambled;
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
  elements.scrambledWord.textContent = state.currentScrambled;
  setMessage("Ordet er stokket om på nytt.");
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
  closeBannerPicker();
}

function reshuffleWord() {
  const first = state.currentWord[0] || "?";
  const last = state.currentWord[state.currentWord.length - 1] || "?";
  setMessage(`Hint: ${first} ... ${last}`);
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
  startRound(true);
}

init();
