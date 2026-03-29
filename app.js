const TOTAL_ROUNDS = 20;
const DICTIONARY = window.DICTIONARY || [];

const state = {
  currentRound: 1,
  score: 0,
  currentWord: "",
  currentScrambled: "",
  currentAttempts: 0,
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
  celebration: document.getElementById("celebration")
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

  if (event.key === "1") {
    event.preventDefault();
    showHint();
  }

  if (event.key === "2") {
    event.preventDefault();
    nextWord();
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
  window.addEventListener("keydown", handleKeydown);

  startRound(true);
}

init();
