const characters = [
  "assets/official-pokemon-01.gif",
  "assets/official-pokemon-02.gif",
  "assets/official-pokemon-03.webp",
  "assets/official-pokemon-04.gif",
  "assets/official-pokemon-05.gif",
  "assets/official-pokemon-06.gif",
  "assets/official-pokemon-07.gif",
  "assets/official-pokemon-08.gif",
  "assets/official-pokemon-09.gif",
  "assets/official-pokemon-10.gif",
  "assets/official-pokemon-11.gif",
  "assets/official-pokemon-12.gif",
  "assets/official-pokemon-13.gif",
  "assets/official-pokemon-14.gif",
  "assets/official-pokemon-15.gif",
  "assets/official-pokemon-16.gif",
  "assets/official-pokemon-17.gif",
  "assets/official-pokemon-18.gif",
  "assets/official-pokemon-20.gif",
  "assets/official-pokemon-21.webp"
];

const defaultWords = ["reading", "writing", "running", "eating", "sleeping", "drinking", "swimming"];
let words = [...defaultWords];
let bubbleText = "I'm...";
const gameTitle = document.querySelector("#gameTitle");
const selectScreen = document.querySelector("#selectScreen");
const playScreen = document.querySelector("#playScreen");
const leaderboardScreen = document.querySelector("#leaderboardScreen");
const leaderboard = document.querySelector("#leaderboard");
const setupPanel = document.querySelector("#setupPanel");
const titleInput = document.querySelector("#titleInput");
const bubbleInput = document.querySelector("#bubbleInput");
const wordsInput = document.querySelector("#wordsInput");
const rosterList = document.querySelector("#rosterList");
const addPlayerButton = document.querySelector("#addPlayerButton");
const startPlayersButton = document.querySelector("#startPlayersButton");
const playerSlots = document.querySelector("#playerSlots");
const characterGrid = document.querySelector("#characterGrid");
const scoreRow = document.querySelector("#scoreRow");
const activePlayer = document.querySelector("#activePlayer");
const pokeballRack = document.querySelector("#pokeballRack");

let rosterNames = ["Thomas", "Amanda", "Ben"];
let players = [];
let currentPick = 0;
let currentPlayer = 0;
let audioContext;
let gameOver = false;

function renderNameSetup() {
  rosterList.innerHTML = "";

  rosterNames.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "name-row";

    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.placeholder = `Student ${index + 1}`;
    input.maxLength = 18;
    input.addEventListener("input", () => {
      rosterNames[index] = input.value;
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "X";
    remove.disabled = rosterNames.length === 1;
    remove.addEventListener("click", () => {
      rosterNames.splice(index, 1);
      renderNameSetup();
    });

    row.append(input, remove);
    rosterList.append(row);
  });
}

function addPlayerName() {
  rosterNames.push(`Student ${rosterNames.length + 1}`);
  renderNameSetup();
}

function startPlayerSelect() {
  const names = rosterNames
    .map((name, index) => name.trim() || `Student ${index + 1}`)
    .filter(Boolean);
  const customTitle = titleInput.value.trim() || "What are you doing?";
  const customBubble = bubbleInput.value.trim() || "I'm...";
  const customWords = parseWords(wordsInput.value);

  gameTitle.textContent = customTitle;
  bubbleText = customBubble;
  words = customWords.length ? customWords : [...defaultWords];
  players = names.map((name) => ({ name, character: "", score: 0 }));
  currentPick = 0;
  currentPlayer = 0;
  gameOver = false;
  setupPanel.classList.add("hidden");
  characterGrid.classList.remove("hidden");
  renderSlots();
  renderCharacterGrid();
}

function parseWords(value) {
  return value
    .split(/[\n,]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function renderSlots() {
  playerSlots.innerHTML = "";

  players.forEach((player, index) => {
    const slot = document.createElement("div");
    slot.className = `slot${index === currentPick && !player.character ? " active-pick" : ""}`;

    if (player.character) {
      const img = document.createElement("img");
      img.src = player.character;
      img.alt = "";
      slot.append(img);
    }

    const name = document.createElement("span");
    name.textContent = player.name;
    slot.append(name);

    playerSlots.append(slot);
  });
}

function renderCharacterGrid() {
  characterGrid.innerHTML = "";

  characters.forEach((src) => {
    const button = document.createElement("button");
    button.className = "character-card";
    button.type = "button";
    button.setAttribute("aria-label", "Pokemon");

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    button.append(img);

    button.addEventListener("click", () => pickCharacter(src));
    characterGrid.append(button);
  });
}

function pickCharacter(src) {
  if (currentPick >= players.length) {
    return;
  }

  playClickSound();
  players[currentPick].character = src;
  currentPick += 1;
  renderSlots();
  renderCharacterGrid();

  if (currentPick === players.length) {
    setTimeout(startGame, 300);
  }
}

function startGame() {
  selectScreen.classList.add("hidden");
  playScreen.classList.remove("hidden");
  resetRound();
  renderScores();
  renderActivePlayer();
}

function resetRound() {
  const ballWords = buildBallWords();
  const outcomes = buildOutcomes(ballWords.length);
  pokeballRack.innerHTML = "";

  shuffle(ballWords).forEach((word, index) => {
    const button = document.createElement("button");
    button.className = "ball-button";
    button.type = "button";
    button.style.setProperty("--i", index);
    button.dataset.word = word;
    button.dataset.outcome = String(outcomes[index]);
    button.setAttribute("aria-label", word);

    const img = document.createElement("img");
    img.src = "assets/pokeball.png";
    img.alt = "";

    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.textContent = word;

    button.append(img, chip);
    button.addEventListener("click", () => openBall(button));
    pokeballRack.append(button);
  });
}

function buildBallWords() {
  const ballCount = Math.max(20, players.length * 2);
  return Array.from({ length: ballCount }, (_, index) => words[index % words.length]);
}

function buildOutcomes(count) {
  const pattern = [5, 6, 7, 8, 9, 10, 5, 6, 7, 8, "bomb", 9, 10, 5, 6, "bomb", 7, 8, 9, "bomb"];
  return shuffle(Array.from({ length: count }, (_, index) => pattern[index % pattern.length]));
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function openBall(button) {
  if (gameOver || button.classList.contains("opened")) {
    return;
  }

  playClickSound();
  const outcome = button.dataset.outcome;
  const pop = document.createElement("span");
  pop.className = "result-pop";
  button.classList.add("opened");

  if (outcome === "bomb") {
    players[currentPlayer].score = Math.max(0, players[currentPlayer].score - 2);
    button.classList.add("bomb");
    pop.textContent = "-2";
    playBombSound();
  } else {
    const points = Number(outcome);
    players[currentPlayer].score += points;
    pop.textContent = `+${points}`;
    speak(`${points} points!`, playPointSound);
  }

  button.append(pop);
  renderScores();
  advancePlayer();
}

function advancePlayer() {
  currentPlayer = (currentPlayer + 1) % players.length;
  renderScores();
  renderActivePlayer();

  if ([...pokeballRack.children].every((ball) => ball.classList.contains("opened"))) {
    gameOver = true;
    setTimeout(showLeaderboard, 1200);
  }
}

function renderScores() {
  scoreRow.innerHTML = "";

  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = `score-card${index === currentPlayer ? " active" : ""}`;

    const img = document.createElement("img");
    img.src = player.character;
    img.alt = "";

    const text = document.createElement("div");
    text.className = "score-text";

    const name = document.createElement("span");
    name.textContent = player.name;

    const score = document.createElement("strong");
    score.textContent = player.score;

    text.append(name, score);
    card.append(img, text);
    scoreRow.append(card);
  });
}

function showLeaderboard() {
  playScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  leaderboard.innerHTML = "";

  [...players]
    .sort((first, second) => second.score - first.score)
    .forEach((player, index) => {
      const row = document.createElement("div");
      row.className = `leader-row${index === 0 ? " winner" : ""}`;

      const img = document.createElement("img");
      img.src = player.character;
      img.alt = "";

      const name = document.createElement("span");
      name.textContent = player.name;

      const score = document.createElement("strong");
      score.textContent = player.score;

      row.append(img, name, score);
      leaderboard.append(row);
    });
}

function renderActivePlayer() {
  activePlayer.innerHTML = "";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = bubbleText;

  const img = document.createElement("img");
  img.src = players[currentPlayer].character;
  img.alt = "";

  activePlayer.append(bubble, img);
}

function speak(text, afterSpeech) {
  if (!("speechSynthesis" in window)) {
    if (afterSpeech) {
      afterSpeech();
    }
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.15;
  utterance.volume = 1;
  utterance.onend = () => {
    if (afterSpeech) {
      afterSpeech();
    }
  };
  window.speechSynthesis.speak(utterance);
}

function playClickSound() {
  ensureAudio();
  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(660, now);
  oscillator.frequency.exponentialRampToValueAtTime(990, now + 0.08);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.12);
}

function playPointSound() {
  ensureAudio();
  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  [784, 988, 1175].forEach((frequency, index) => {
    const start = now + index * 0.12;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  });
}

function playBombSound() {
  ensureAudio();
  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.55, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  const noise = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(90, now + 0.5);
  noise.buffer = noiseBuffer;
  noiseGain.gain.setValueAtTime(0.55, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  noise.connect(filter).connect(noiseGain).connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + 0.55);

  const boom = audioContext.createOscillator();
  const boomGain = audioContext.createGain();
  boom.type = "sawtooth";
  boom.frequency.setValueAtTime(95, now);
  boom.frequency.exponentialRampToValueAtTime(35, now + 0.38);
  boomGain.gain.setValueAtTime(0.35, now);
  boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
  boom.connect(boomGain).connect(audioContext.destination);
  boom.start(now);
  boom.stop(now + 0.42);
}

function ensureAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  audioContext = audioContext || new AudioCtor();
}

renderSlots();
renderNameSetup();
addPlayerButton.addEventListener("click", addPlayerName);
startPlayersButton.addEventListener("click", startPlayerSelect);
