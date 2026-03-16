let songs = [];
let todaySongs = [];

const CLIPS = [1, 2, 4, 6, 8, 10];
const MAX_GUESSES = 6;
const PUZZLE_EPOCH_UTC = Date.UTC(2026, 2, 16);

let songIndex = 0;
let guessNumber = 0;
let guessHistory = [[], []];
let currentAudio = null;
let waveformTimer = null;
let bonusStarted = false;
let gameFinished = false;

fetch("songs.json")
  .then(r => r.json())
  .then(data => {
    songs = data;
    setupAutocomplete();
    pickDailySongs();
    showPuzzleNumber();
    renderAttemptRow();
  })
  .catch(err => {
    console.error("Failed to load songs.json:", err);
  });

function getDefaultStats() {
  return {
    played: 0,
    wins: 0,
    streak: 0,
    best: 0,
    lastPlayed: "",
    distribution: [0, 0, 0, 0, 0, 0]
  };
}

function getStats() {
  let stats;

  try {
    stats = JSON.parse(localStorage.getItem("thundleStats")) || {};
  } catch {
    stats = {};
  }

  const defaults = getDefaultStats();

  return {
    played: Number.isInteger(stats.played) ? stats.played : defaults.played,
    wins: Number.isInteger(stats.wins) ? stats.wins : defaults.wins,
    streak: Number.isInteger(stats.streak) ? stats.streak : defaults.streak,
    best: Number.isInteger(stats.best) ? stats.best : defaults.best,
    lastPlayed: typeof stats.lastPlayed === "string" ? stats.lastPlayed : defaults.lastPlayed,
    distribution: Array.isArray(stats.distribution) && stats.distribution.length === 6
      ? stats.distribution.map(v => Number.isInteger(v) ? v : 0)
      : [...defaults.distribution]
  };
}

function saveStats(stats) {
  localStorage.setItem("thundleStats", JSON.stringify(stats));
}

function setupAutocomplete() {
  const input = document.getElementById("guessInput");
  const box = document.getElementById("suggestions");

  input.addEventListener("input", () => {
    box.innerHTML = "";
    const val = input.value.trim().toLowerCase();

    if (!val) return;

    const matches = songs
      .filter(song => song.title.toLowerCase().includes(val))
      .slice(0, 8);

    matches.forEach(song => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = song.title;
      div.onclick = () => {
        input.value = song.title;
        box.innerHTML = "";
      };
      box.appendChild(div);
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input) {
      box.innerHTML = "";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitGuess();
    }
  });
}

function getUTCDayNumber() {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((todayUTC - PUZZLE_EPOCH_UTC) / 86400000);
}

function getTodayKeyUTC() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDailySongs() {
  const day = getUTCDayNumber();
  const rng = mulberry32(day + 1);

  const i1 = Math.floor(rng() * songs.length);
  const i2 = Math.floor(rng() * songs.length);

  todaySongs = [songs[i1], songs[i2]];
}

function showPuzzleNumber() {
  document.getElementById("puzzleNumber").innerText = `#${getUTCDayNumber()}`;
}

function getCurrentSong() {
  return todaySongs[songIndex];
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  stopWaveform();
}

function playClip() {
  if (gameFinished) return;

  const song = getCurrentSong();
  if (!song) return;

  stopCurrentAudio();

  const clipSeconds = CLIPS[Math.min(guessNumber, CLIPS.length - 1)];
  const audio = new Audio(song.file);
  currentAudio = audio;

  audio.addEventListener("loadedmetadata", () => {
    let startTime = 0;

    if (songIndex === 1) {
      const day = getUTCDayNumber();
      const bonusRng = mulberry32((day + 1) * 999 + 17);
      const minStart = audio.duration * 0.35;
      const maxStart = audio.duration * 0.7;
      startTime = minStart + bonusRng() * (maxStart - minStart);
    }

    audio.currentTime = Math.max(0, startTime);
    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
    });

    startWaveform(clipSeconds);

    setTimeout(() => {
      if (currentAudio === audio) {
        audio.pause();
        stopWaveform();
      }
    }, clipSeconds * 1000);
  });
}

function startWaveform(durationSeconds) {
  const fill = document.getElementById("waveformFill");
  stopWaveform();
  fill.style.width = "0%";

  const startTime = performance.now();

  waveformTimer = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    const percent = Math.min(100, (elapsed / durationSeconds) * 100);
    fill.style.width = `${percent}%`;

    if (percent >= 100) {
      stopWaveform();
    }
  }, 16);
}

function stopWaveform() {
  const fill = document.getElementById("waveformFill");
  if (waveformTimer) {
    clearInterval(waveformTimer);
    waveformTimer = null;
  }
  fill.style.width = "0%";
}

function submitGuess() {
  if (gameFinished) return;

  const input = document.getElementById("guessInput");
  const guess = input.value.trim().toLowerCase();
  const song = getCurrentSong();

  if (!song || !guess) return;

  const answer = song.title.toLowerCase();

  if (guess === answer) {
    guessHistory[songIndex].push("correct");
    document.getElementById("feedback").innerText = "Correct!";
    showAlbumArt(song);
    renderAttemptRow();
    stopCurrentAudio();

    input.value = "";
    document.getElementById("suggestions").innerHTML = "";

    finishCurrentRound();
    return;
  }

  guessHistory[songIndex].push("wrong");
  guessNumber++;
  renderAttemptRow();

  if (guessNumber >= MAX_GUESSES) {
    document.getElementById("feedback").innerText = `Answer: ${song.title}`;
    showAlbumArt(song);
    stopCurrentAudio();
    finishCurrentRound();
  } else {
    document.getElementById("feedback").innerText = "Try again";
  }

  input.value = "";
  document.getElementById("suggestions").innerHTML = "";
}

function finishCurrentRound() {
  document.getElementById("playButton").disabled = true;
  document.getElementById("guessInput").disabled = true;
  document.getElementById("guessButton").disabled = true;

  if (songIndex === 0) {
    prepareResults(false);
    openResultsModal();
  } else {
    gameFinished = true;
    updateStatsFinal();
    prepareResults(true);
    openResultsModal();
  }
}

function renderAttemptRow() {
  const row = document.getElementById("attemptRow");
  row.innerHTML = "";

  const history = guessHistory[songIndex];

  for (let i = 0; i < MAX_GUESSES; i++) {
    const box = document.createElement("div");
    box.className = "attempt-box";

    if (i < history.length) {
      box.classList.add(history[i] === "correct" ? "correct" : "wrong");
    } else {
      box.classList.add("empty");
    }

    row.appendChild(box);
  }
}

function showAlbumArt(song) {
  const artWrap = document.getElementById("artWrap");
  const albumArt = document.getElementById("albumArt");

  if (!song.art) {
    artWrap.style.display = "none";
    return;
  }

  albumArt.onload = () => {
    artWrap.style.display = "block";
  };

  albumArt.onerror = () => {
    console.error("Album art failed to load:", song.art);
    artWrap.style.display = "none";
  };

  albumArt.src = song.art;
}

function startBonusFromModal() {
  closeModal();
  startBonus();
}

function startBonus() {
  bonusStarted = true;
  songIndex = 1;
  guessNumber = 0;

  document.getElementById("songLabel").innerText = "Bonus Song";
  document.getElementById("roundHint").innerText = "Starts from a seeded random point in the middle.";
  document.getElementById("feedback").innerText = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessInput").disabled = false;
  document.getElementById("guessButton").disabled = false;
  document.getElementById("playButton").disabled = false;
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("artWrap").style.display = "none";

  renderAttemptRow();
}

function didWinSong(index) {
  return guessHistory[index].includes("correct");
}

function updateStatsFinal() {
  const todayKey = getTodayKeyUTC();
  const stats = getStats();

  if (stats.lastPlayed === todayKey) {
    return;
  }

  const mainWon = didWinSong(0);
  const fullWon = didWinSong(0) && didWinSong(1);

  stats.played++;

  if (mainWon) {
    stats.wins++;
    const guessPosition = guessHistory[0].findIndex(v => v === "correct");
    if (guessPosition >= 0 && guessPosition < 6) {
      stats.distribution[guessPosition]++;
    }
  }

  if (fullWon) {
    if (stats.lastPlayed && isYesterdayUTC(stats.lastPlayed, todayKey)) {
      stats.streak++;
    } else {
      stats.streak = 1;
    }
  } else {
    stats.streak = 0;
  }

  stats.best = Math.max(stats.best, stats.streak);
  stats.lastPlayed = todayKey;

  saveStats(stats);
}

function isYesterdayUTC(lastPlayed, todayKey) {
  const last = new Date(lastPlayed + "T00:00:00Z");
  const today = new Date(todayKey + "T00:00:00Z");
  const diff = (today - last) / 86400000;
  return diff === 1;
}

function prepareResults(isFinalRound) {
  const stats = getStats();
  const winPercent = stats.played > 0
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;

  const resultsTitle = document.getElementById("resultsTitle");
  const statsEl = document.getElementById("stats");
  const shareGridEl = document.getElementById("shareGrid");
  const copiedMessageEl = document.getElementById("copiedMessage");
  const bonusButton = document.getElementById("bonusButton");

  resultsTitle.innerText = isFinalRound ? "Daily Complete" : "Song #1 Complete";
  statsEl.innerText =
    `Played: ${stats.played}\nWin %: ${winPercent}\nStreak: ${stats.streak}\nBest: ${stats.best}`;

  renderDistributionChart(stats.distribution);
  shareGridEl.innerText = buildShareText();
  copiedMessageEl.innerText = "";
  bonusButton.style.display = isFinalRound ? "none" : "inline-block";
}

function openResultsModal() {
  const modal = document.getElementById("resultModal");
  if (!modal) {
    console.error("resultModal element not found");
    return;
  }
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("resultModal").style.display = "none";
}

function renderDistributionChart(distribution) {
  const chart = document.getElementById("distributionChart");
  chart.innerHTML = "";

  const maxValue = Math.max(...distribution, 1);

  distribution.forEach((count, index) => {
    const row = document.createElement("div");
    row.className = "dist-row";

    const label = document.createElement("div");
    label.className = "dist-label";
    label.textContent = index + 1;

    const wrap = document.createElement("div");
    wrap.className = "dist-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "dist-bar";
    bar.style.width = count === 0 ? "0%" : `${(count / maxValue) * 100}%`;

    wrap.appendChild(bar);

    const countLabel = document.createElement("div");
    countLabel.className = "dist-count";
    countLabel.textContent = count;

    row.appendChild(label);
    row.appendChild(wrap);
    row.appendChild(countLabel);
    chart.appendChild(row);
  });
}

function buildShareRow(index) {
  let row = "";

  for (let i = 0; i < guessHistory[index].length; i++) {
    row += guessHistory[index][i] === "correct" ? "🟩" : "🟥";
  }

  for (let i = guessHistory[index].length; i < MAX_GUESSES; i++) {
    row += "🔳";
  }

  return row;
}

function buildShareText() {
  const puzzleNum = document.getElementById("puzzleNumber").innerText;
  const stats = getStats();

  const mainWon = didWinSong(0);
  const bonusWon = didWinSong(1);

  const row1 = buildShareRow(0);
  const row2 = buildShareRow(1);

  const mainIcon = mainWon ? "🏆" : "❌";
  const bonusIcon = bonusStarted ? (bonusWon ? "🏆" : "❌") : "⬜";
  const streakText = stats.streak > 0 ? ` 🔥${stats.streak} day streak!` : "";

  return `${mainIcon} Thundle ${puzzleNum}${streakText}\n${row1}\n${bonusIcon} Bonus:\n${row2}`;
}

function share() {
  navigator.clipboard.writeText(buildShareText()).then(() => {
    document.getElementById("copiedMessage").innerText = "Copied!";
  }).catch(() => {
    document.getElementById("copiedMessage").innerText = "Could not copy";
  });
}