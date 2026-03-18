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
let resultPreviewAudio = null;
let resultPreviewSongIndex = null;
let confettiPieces = [];
let confettiAnimationFrame = null;
let preloadedAudio = [null, null];

fetch("songs.json")
  .then(r => r.json())
  .then(data => {
    songs = data;
    setupAutocomplete();
    pickDailySongs();
    preloadTodaySongs();
    showPuzzleNumber();
    renderAttemptRow();
    loadProgressIfAvailable();
    updateCountdown();
    setInterval(updateCountdown, 1000);
  })

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

function preloadTodaySongs() {
  preloadedAudio = [null, null];

  todaySongs.forEach((song, index) => {
    if (!song || !song.file) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = song.file;
    preloadedAudio[index] = audio;
  });
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

  const button = document.getElementById("playButton");
  const song = getCurrentSong();
  if (!song) return;

  button.disabled = true;
  button.innerText = "Loading…";

  stopCurrentAudio();
  startWaveformLoading();

  const clipSeconds = CLIPS[Math.min(guessNumber, CLIPS.length - 1)];
  const audio = preloadedAudio[songIndex] ? preloadedAudio[songIndex].cloneNode() : new Audio(song.file);
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

    audio.play().then(() => {
      stopWaveformLoading();
      startWaveform(clipSeconds);
      button.innerText = "Playing…";
    }).catch(err => {
      console.error("Audio playback failed:", err);
      stopWaveformLoading();
      button.innerText = "Play Clip";
      button.disabled = false;
    });

    setTimeout(() => {
      if (currentAudio === audio) {
        audio.pause();
        stopWaveform();
        button.innerText = "Play Clip";
        button.disabled = false;
      }
    }, clipSeconds * 1000);
  });

  audio.addEventListener("error", () => {
    console.error("Audio failed to load:", song.file);
    stopWaveformLoading();
    button.innerText = "Play Clip";
    button.disabled = false;
  });

  if (audio.readyState >= 1) {
    audio.dispatchEvent(new Event("loadedmetadata"));
  } else {
    audio.load();
  }
}

function startWaveformLoading() {
  const wrap = document.getElementById("waveformWrap");
  const fill = document.getElementById("waveformFill");

  stopWaveform();
  fill.style.width = "0%";
  wrap.classList.add("loading");
}

function stopWaveformLoading() {
  const wrap = document.getElementById("waveformWrap");
  wrap.classList.remove("loading");
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
  const wrap = document.getElementById("waveformWrap");

  if (waveformTimer) {
    clearInterval(waveformTimer);
    waveformTimer = null;
  }

  fill.style.width = "0%";
  wrap.classList.remove("loading");
}

function animateReveal(...elements) {
  elements.forEach(el => {
    if (!el) return;

    el.classList.remove("reveal-pop");
    void el.offsetWidth;
    el.classList.add("reveal-pop");
  });
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

  const feedback = document.getElementById("feedback");
  feedback.innerText = "Correct!";
  animateReveal(feedback);

  launchConfetti();
  showAlbumArt(song);
  renderAttemptRow();
  stopCurrentAudio();

  input.value = "";
  document.getElementById("suggestions").innerHTML = "";

  saveProgress();
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
  saveProgress();
}

function stopResultPreviewAudio() {
  if (resultPreviewAudio) {
    resultPreviewAudio.pause();
    resultPreviewAudio.currentTime = 0;
    resultPreviewAudio = null;
  }

  resultPreviewSongIndex = null;

  const btn0 = document.getElementById("resultPlayButton0");
  const btn1 = document.getElementById("resultPlayButton1");

  if (btn0) btn0.innerText = "▶";
  if (btn1) btn1.innerText = "▶";
}

function toggleResultSong(index) {
  const song = todaySongs[index];
  if (!song) return;

  const button = document.getElementById(`resultPlayButton${index}`);
  if (!button) return;

  if (resultPreviewAudio && resultPreviewSongIndex === index) {
    if (resultPreviewAudio.paused) {
      resultPreviewAudio.play().catch(err => {
        console.error("Result preview resume failed:", err);
      });
      button.innerText = "⏸";
    } else {
      resultPreviewAudio.pause();
      button.innerText = "▶";
    }
    return;
  }

  stopResultPreviewAudio();

  resultPreviewAudio = new Audio(song.file);
  resultPreviewSongIndex = index;

  resultPreviewAudio.addEventListener("ended", () => {
    stopResultPreviewAudio();
  });

  resultPreviewAudio.play().then(() => {
    button.innerText = "⏸";
  }).catch(err => {
    console.error("Result preview play failed:", err);
    stopResultPreviewAudio();
  });
}

function populateResultSongCards(isFinalRound) {
  const mainSong = todaySongs[0];
  const bonusSong = todaySongs[1];

  const mainArt = document.getElementById("resultAlbumArt0");
  const mainTitle = document.getElementById("resultSongTitle0");
  const mainButton = document.getElementById("resultPlayButton0");
  const mainSpotify = document.getElementById("resultSpotifyLink0");

  const bonusCard = document.getElementById("bonusResultCard");
  const bonusArt = document.getElementById("resultAlbumArt1");
  const bonusTitle = document.getElementById("resultSongTitle1");
  const bonusButton = document.getElementById("resultPlayButton1");
  const bonusSpotify = document.getElementById("resultSpotifyLink1");

  if (mainSong) {
    mainArt.src = mainSong.art || "";
    mainTitle.innerText = mainSong.title;
    mainButton.style.display = "inline-flex";
    mainArt.style.display = mainSong.art ? "block" : "none";

    if (mainSong.spotify) {
      mainSpotify.href = mainSong.spotify;
      mainSpotify.style.display = "inline-flex";
    } else {
      mainSpotify.style.display = "none";
    }

    animateReveal(mainArt, mainTitle);
  }

  if (isFinalRound && bonusStarted && bonusSong) {
    bonusCard.style.display = "block";
    bonusArt.src = bonusSong.art || "";
    bonusTitle.innerText = bonusSong.title;
    bonusButton.style.display = "inline-flex";
    bonusArt.style.display = bonusSong.art ? "block" : "none";

    if (bonusSong.spotify) {
      bonusSpotify.href = bonusSong.spotify;
      bonusSpotify.style.display = "inline-flex";
    } else {
      bonusSpotify.style.display = "none";
    }

    animateReveal(bonusArt, bonusTitle, bonusCard);
  } else {
    bonusCard.style.display = "none";
  }
}

function finishCurrentRound() {
  document.getElementById("playButton").disabled = true;
  document.getElementById("guessInput").disabled = true;
  document.getElementById("guessButton").disabled = true;

  saveProgress();

  if (songIndex === 0) {
    prepareResults(false);
    document.getElementById("showResultsSection").style.display = "block";
    openResultsModal();
  } else {
    gameFinished = true;
    saveProgress();
    updateStatsFinal();
    prepareResults(true);
    document.getElementById("showResultsSection").style.display = "block";
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
    animateReveal(albumArt, artWrap);
  };

  albumArt.onerror = () => {
    console.error("Album art failed to load:", song.art);
    artWrap.style.display = "none";
  };

  albumArt.src = song.art;
}

function startBonusFromModal() {
  stopResultPreviewAudio();
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
  document.getElementById("showResultsSection").style.display = "none";

  renderAttemptRow();
  saveProgress();
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

function getDefaultProgress() {
  return {
    dateKey: "",
    songIndex: 0,
    guessNumber: 0,
    guessHistory: [[], []],
    bonusStarted: false,
    gameFinished: false,
    resultsModalOpen: false
  };
}

function getProgress() {
  let progress;

  try {
    progress = JSON.parse(localStorage.getItem("thundleProgress")) || {};
  } catch {
    progress = {};
  }

  const defaults = getDefaultProgress();

  return {
    dateKey: typeof progress.dateKey === "string" ? progress.dateKey : defaults.dateKey,
    songIndex: Number.isInteger(progress.songIndex) ? progress.songIndex : defaults.songIndex,
    guessNumber: Number.isInteger(progress.guessNumber) ? progress.guessNumber : defaults.guessNumber,
    guessHistory:
      Array.isArray(progress.guessHistory) &&
      progress.guessHistory.length === 2 &&
      Array.isArray(progress.guessHistory[0]) &&
      Array.isArray(progress.guessHistory[1])
        ? [
            progress.guessHistory[0].filter(v => v === "correct" || v === "wrong"),
            progress.guessHistory[1].filter(v => v === "correct" || v === "wrong")
          ]
        : defaults.guessHistory,
    bonusStarted: typeof progress.bonusStarted === "boolean" ? progress.bonusStarted : defaults.bonusStarted,
    gameFinished: typeof progress.gameFinished === "boolean" ? progress.gameFinished : defaults.gameFinished,
    resultsModalOpen: typeof progress.resultsModalOpen === "boolean" ? progress.resultsModalOpen : defaults.resultsModalOpen
  };
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  confettiPieces = [];

  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.3,
      w: 8 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      vx: -3 + Math.random() * 6,
      vy: 2 + Math.random() * 4,
      gravity: 0.05 + Math.random() * 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.2 + Math.random() * 0.4,
      color: ["#ffe066", "#ff5a5a", "#2ecc71", "#66d9ff", "#c084fc"][Math.floor(Math.random() * 5)],
      life: 120 + Math.random() * 40
    });
  }

  if (confettiAnimationFrame) {
    cancelAnimationFrame(confettiAnimationFrame);
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces.forEach(piece => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += piece.gravity;
      piece.rotation += piece.rotationSpeed;
      piece.life -= 1;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    });

    confettiPieces = confettiPieces.filter(piece =>
      piece.life > 0 && piece.y < window.innerHeight + 40
    );

    if (confettiPieces.length > 0) {
      confettiAnimationFrame = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiAnimationFrame = null;
    }
  }

  animateConfetti();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
});

function saveProgress() {
  const modal = document.getElementById("resultModal");

  const progress = {
    dateKey: getTodayKeyUTC(),
    songIndex,
    guessNumber,
    guessHistory,
    bonusStarted,
    gameFinished,
    resultsModalOpen: modal ? modal.style.display === "block" : false
  };

  localStorage.setItem("thundleProgress", JSON.stringify(progress));
}

function clearProgress() {
  localStorage.removeItem("thundleProgress");
}

function loadProgressIfAvailable() {
  const progress = getProgress();
  const todayKey = getTodayKeyUTC();

  if (progress.dateKey !== todayKey) {
    clearProgress();
    return;
  }

  songIndex = progress.songIndex;
  guessNumber = progress.guessNumber;
  guessHistory = progress.guessHistory;
  bonusStarted = progress.bonusStarted;
  gameFinished = progress.gameFinished;

  if (songIndex === 1) {
    document.getElementById("songLabel").innerText = "Bonus Song";
    document.getElementById("roundHint").innerText = "Starts from a seeded random point in the middle.";
  } else {
    document.getElementById("songLabel").innerText = "Song #1";
    document.getElementById("roundHint").innerText = "Starts at the beginning of the track.";
  }

  const playedMain = guessHistory[0].length > 0;
  const finishedMain = playedMain && (
    guessHistory[0].includes("correct") || guessHistory[0].length >= MAX_GUESSES
  );

  const finishedBonus = guessHistory[1].length > 0 && (
    guessHistory[1].includes("correct") || guessHistory[1].length >= MAX_GUESSES
  );

  if (finishedMain && !bonusStarted) {
    document.getElementById("playButton").disabled = true;
    document.getElementById("guessInput").disabled = true;
    document.getElementById("guessButton").disabled = true;
    document.getElementById("showResultsSection").style.display = "block";
  } else if (songIndex === 1 && !gameFinished) {
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessButton").disabled = false;
    document.getElementById("playButton").disabled = false;
    document.getElementById("showResultsSection").style.display = "none";
  }

  if (gameFinished || finishedBonus) {
    document.getElementById("showResultsSection").style.display = "block";
    document.getElementById("playButton").disabled = true;
    document.getElementById("guessInput").disabled = true;
    document.getElementById("guessButton").disabled = true;
  }

  const currentSong = todaySongs[songIndex];
  const currentHistory = guessHistory[songIndex];

  if (currentHistory.includes("correct")) {
    document.getElementById("feedback").innerText = "Correct!";
    if (currentSong) showAlbumArt(currentSong);
  } else if (currentHistory.length >= MAX_GUESSES) {
    document.getElementById("feedback").innerText = currentSong ? `Answer: ${currentSong.title}` : "";
    if (currentSong) showAlbumArt(currentSong);
  } else {
    document.getElementById("feedback").innerText = "";
    document.getElementById("artWrap").style.display = "none";
  }

  renderAttemptRow();

  if (gameFinished) {
    prepareResults(true);
  } else if (finishedMain && !bonusStarted) {
    prepareResults(false);
  }

  if (progress.resultsModalOpen) {
    if (gameFinished) {
      prepareResults(true);
      openResultsModal();
    } else if (finishedMain) {
      prepareResults(false);
      openResultsModal();
    }
  }
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

  populateResultSongCards(isFinalRound);
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

  stopResultPreviewAudio();
  modal.style.display = "block";
  saveProgress();
}

function closeModal() {
  stopResultPreviewAudio();
  document.getElementById("resultModal").style.display = "none";
  saveProgress();
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
  const link = window.location.origin;

  return `${mainIcon} Thundle ${puzzleNum}${streakText}

${row1}
${bonusIcon} Bonus
${row2}

${link}`;
}

async function share() {
  const text = buildShareText();
  const shareData = {
    title: "Thundle",
    text: text,
    url: window.location.href
  };

  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      await navigator.share(shareData);
      document.getElementById("copiedMessage").innerText = "Shared!";
      return;
    }

    await navigator.clipboard.writeText(text);
    document.getElementById("copiedMessage").innerText = "Copied!";
  } catch (error) {
    if (error && error.name === "AbortError") {
      document.getElementById("copiedMessage").innerText = "Share canceled";
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      document.getElementById("copiedMessage").innerText = "Copied!";
    } catch {
      document.getElementById("copiedMessage").innerText = "Could not share";
    }
  }
}

function getNextPuzzleUTCDate() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function updateCountdown() {
  const now = new Date();
  const nextPuzzle = getNextPuzzleUTCDate();
  const diff = nextPuzzle - now;
  const text = `Next Thundle in ${formatCountdown(diff)}`;

  const pageCountdown = document.getElementById("countdownText");
  const modalCountdown = document.getElementById("modalCountdownText");

  if (pageCountdown) {
    pageCountdown.innerText = text;
  }

  if (modalCountdown) {
    modalCountdown.innerText = text;
  }
}