const DICTIONARY = [
  "jeg", "kan", "ble", "vil", "skal", "sier", "etter", "også", "hun", "dette", "ved", "blir", "nå", "være", "hadde", "over",
  "mot", "eller", "går", "andre", "opp", "sin", "når", "bare", "alle", "mer", "denne", "selv", "noe", "mange", "inn", "bli",
  "noen", "vært", "får", "før", "der", "man", "kroner", "nye", "dag", "Norge", "flere", "fikk", "første", "under", "slik",
  "siden", "mye", "norske", "kommer", "både", "kunne", "meg", "mellom", "hva", "tre", "her", "store", "mener", "ingen", "dem",
  "oss", "hele", "sine", "siste", "gang", "skulle", "hans", "helt", "godt", "sammen", "kom", "norsk", "blant", "tid", "sitt",
  "ville", "uten", "blitt", "igjen", "fått", "rundt", "samme", "mens", "annet", "disse", "litt", "stor", "står", "gjør", "gikk",
  "folk", "ned", "hvis", "derfor", "gamle", "fire", "fordi", "mest", "god", "tilbake", "gir", "barn", "like", "neste", "kanskje",
  "langt", "tatt", "del", "bedre", "komme", "saken", "ønsker", "tror", "viser", "måtte", "aldri", "side", "ligger", "min",
  "hvordan", "hos", "tok", "bør", "beste", "vår", "grunn", "hver", "sett", "vel", "gjort", "land", "allerede", "frem", "heller",
  "gode", "vet", "jo", "tiden", "fem", "foto", "fram", "plass", "mennesker", "likevel", "svært", "hatt", "fortsatt", "fjor",
  "bak", "rett", "viktig", "forhold", "videre", "større", "leder", "dermed", "satt", "egen", "nytt", "annen", "landet",
  "samtidig", "mindre", "Norges", "Bergens", "ifølge", "hvert", "klart", "kveld", "deg", "ett", "mulig", "lite", "mål", "gjelder",
  "tillegg", "liv", "dersom", "verden", "penger", "laget", "nesten", "stort", "henne", "løpet", "finne", "synes", "eneste",
  "minst", "senere", "mann", "gjorde", "årene", "største", "lørdag", "hennes", "fleste", "lenge", "våre", "dager", "søndag",
  "kvinner", "livet", "begge", "dessuten", "alltid", "meget", "unge", "nei", "kampen", "gått", "finnes", "liten", "måte", "ganger",
  "møte", "ofte", "seks", "mannen", "kommet", "utenfor", "gitt", "foran", "bra", "gjerne", "deres", "vei", "arbeidet", "året",
  "bruk", "rekke", "vårt", "byen", "fast", "fall", "dagens", "klar", "betyr", "særlig", "trenger", "kort", "stadig", "hjem",
  "vant", "bruke", "bjørn", "hjelp", "innen", "slike", "følge", "eksempel", "problemer", "spesielt", "små", "ute", "lenger",
  "fredag", "dagen", "holde", "kjent", "full", "lett", "meter", "gammel", "lagt", "skriver", "spiller", "legger", "støtte",
  "hjemme", "sted", "skole", "sterkt", "arbeid", "veldig", "lag", "sette", "enkelte", "stedet", "ting", "ansatte", "enda",
  "personer", "tro", "holder", "hvem", "lang", "overfor", "barna", "høyre", "eget", "sitter", "spørsmål", "dårlig", "egne", "uke",
  "altså", "menn", "skolen", "hvorfor", "funnet", "årets", "par", "holdt", "skjer", "bort", "kamp", "ennå", "legge", "deler",
  "håper", "slutt", "sagt", "politisk", "mandag", "brann", "tekst", "krav", "ganske", "tross", "dere", "best", "hus", "finner",
  "ord", "nemlig", "form", "burde", "trolig", "ulike", "hverandre", "fotball", "torsdag", "måneder", "viste", "kirke", "riktig",
  "akkurat", "veien", "bilen", "kontakt", "heter", "inne", "egentlig", "sentrum", "bruker", "jobb", "føler", "ellers", "området",
  "brukt", "morgen", "nettopp", "klare", "forbindelse", "begynte", "onsdag", "familien", "uker", "spille", "selskapet", "åtte",
  "møter", "vise", "startet", "fant", "forslag", "verdens", "imot", "skjedde", "nærmere", "snart", "års", "setter", "direkte",
  "faktisk", "sterk", "grad", "samlet", "bildet", "samarbeid", "eldre", "forrig", "slo", "vanlig", "feil", "timer", "bygge",
  "lange", "pris", "betale", "mor", "navn", "mitt", "sist", "tidlig", "glad", "høy", "tenke", "mine", "ferdig", "natt", "vite",
  "lille", "seier", "satte", "venner", "alvorlig", "skje", "filmen", "regner", "mat", "far", "huset", "høyt", "kjøpe", "bil",
  "bok", "lov", "lage", "din", "sto", "elevene"
];

const totalRounds = 20;
let currentRound = 1;
let score = 0;
let currentWord = "";
let currentScrambled = "";
let currentAttempts = 0;
let roundData = [];
let celebrationTimer = null;

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
  const arr = [...word];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const scrambled = arr.join("");
  if (scrambled === word && word.length > 1) {
    return shuffleWord(word);
  }

  return scrambled;
}

function setMessage(text) {
  elements.message.textContent = text;
}

function updateStatus() {
  elements.roundInfo.textContent = `${Math.min(currentRound, totalRounds)} / ${totalRounds}`;
  elements.scoreInfo.textContent = `${score}`;
}

function updateHistory() {
  if (!roundData.length) {
    elements.history.textContent = "Stjernestien er tom ennå.";
    return;
  }

  elements.history.textContent = `Stjernesti: ${roundData.slice(-3).join(" · ")}`;
}

function refreshBoard() {
  updateStatus();
  elements.scrambledWord.textContent = currentScrambled;
  updateHistory();
}

function clearCelebration() {
  if (celebrationTimer) {
    clearTimeout(celebrationTimer);
    celebrationTimer = null;
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
  badge.textContent = `${cheers[score % cheers.length]} ${word} +${earned}`;

  pieces.forEach(piece => elements.celebration.appendChild(piece));
  elements.celebration.appendChild(badge);

  celebrationTimer = setTimeout(() => {
    clearCelebration();
  }, 1500);
}

function startRound(forceNew = false) {
  clearCelebration();

  if (!forceNew && currentRound > totalRounds) {
    setMessage("Ferdig! Trykk Neste ord for å starte på nytt.");
    updateStatus();
    return;
  }

  currentWord = getRandomWord();
  currentScrambled = shuffleWord(currentWord);
  currentAttempts = 0;

  if (currentScrambled === currentWord) {
    currentScrambled = shuffleWord(currentWord);
  }

  elements.guessInput.value = "";
  elements.guessInput.focus();
  refreshBoard();
  setMessage("Nytt ord er klart.");
}

function finishGameMessage() {
  return `Du fikk ${score} poeng. Trykk Neste ord for å spille igjen.`;
}

function checkGuess(guess) {
  const normalized = guess.trim().toLowerCase();

  if (!normalized) {
    setMessage("Skriv et ord først.");
    return;
  }

  currentAttempts += 1;

  if (normalized === currentWord.toLowerCase()) {
    const solvedWord = currentWord;
    const earned = Math.max(1, 6 - currentAttempts);
    score += earned;
    roundData.push(`${solvedWord} ★ +${earned}`);
    currentRound += 1;
    refreshBoard();
    celebrateRound(solvedWord, earned);

    if (currentRound > totalRounds) {
      setMessage(`Riktig! ${solvedWord}. ${finishGameMessage()}`);
      return;
    }

    setMessage(`Riktig! ${solvedWord} ga ${earned} poeng.`);
    return;
  }

  if (currentWord.toLowerCase().includes(normalized) && normalized.length > 1) {
    setMessage("Nesten. Prøv igjen.");
  } else {
    setMessage(`Ikke helt ennå. Forsøk ${currentAttempts}.`);
  }
}

function showHint() {
  const first = currentWord[0] || "?";
  const last = currentWord[currentWord.length - 1] || "?";
  setMessage(`Hint: ${first} ... ${last}`);
  elements.guessInput.focus();
}

function nextWord() {
  clearCelebration();

  if (currentRound > totalRounds || currentRound >= totalRounds) {
    score = 0;
    currentRound = 1;
    roundData = [];
    updateHistory();
  } else {
    currentRound += 1;
  }

  startRound(true);
}

elements.guessForm.addEventListener("submit", event => {
  event.preventDefault();
  const guess = elements.guessInput.value;
  const normalized = guess.trim().toLowerCase();

  if (!normalized) {
    setMessage("Skriv et ord først.");
    return;
  }

  const expected = currentWord.toLowerCase();
  checkGuess(guess);

  if (currentRound <= totalRounds && normalized === expected) {
    setTimeout(() => startRound(true), 950);
  }
});

elements.hintButton.addEventListener("click", showHint);
elements.nextButton.addEventListener("click", nextWord);

window.addEventListener("keydown", event => {
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
});

startRound(true);
