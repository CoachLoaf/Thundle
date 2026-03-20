let currentMode = "daily"; // "daily" or "endless"
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
let gameMode = "daily";
let endlessQueue = [];
let endlessUsedIndices = [];
let endlessScore = 0;
let endlessBest = Number(localStorage.getItem("thundleEndlessBest")) || 0;
let endlessCurrentSong = null;
let endlessNewBestCelebrated = false;
let endlessSettings = {
  guessLimit: 6,
  clipStart: "beginning"
};

const ENDLESS_CONFIG_BESTS_KEY = "thundleEndlessConfigBests";

let endlessRunStarted = false;
let endlessCurrentStartTime = 0;
let waveformPreviewShown = false;

const sounds = {
  click: new Audio("sounds/click.mp3"),
  correct: new Audio("sounds/correct.mp3"),
  incorrect: new Audio("sounds/incorrect.mp3"),
  fail: new Audio("sounds/fail.mp3"),
  newBest: new Audio("sounds/new-best.mp3")
};



function applySfxVolume() {
  Object.values(sounds).forEach(sound => {
    sound.volume = sfxMuted ? 0 : sfxVolume;
  });
}

function updateSfxControlsUI() {
  const muteButton = document.getElementById("sfxMuteButton");
  const slider = document.getElementById("sfxVolumeSlider");

  if (muteButton) {
    muteButton.textContent = sfxMuted ? "SFX: Off" : "SFX: On";
  }

  if (slider) {
    slider.value = String(Math.round(sfxVolume * 100));
    slider.disabled = sfxMuted;
  }
}

function toggleSfxMute() {
  sfxMuted = !sfxMuted;
  localStorage.setItem(SFX_MUTED_KEY, String(sfxMuted));
  applySfxVolume();
  updateSfxControlsUI();
}

function setSfxVolume(value) {
  sfxVolume = Math.max(0, Math.min(1, Number(value) / 100));
  localStorage.setItem(SFX_VOLUME_KEY, String(sfxVolume));

  if (sfxVolume <= 0) {
    sfxMuted = true;
    localStorage.setItem(SFX_MUTED_KEY, "true");
  } else if (sfxMuted) {
    sfxMuted = false;
    localStorage.setItem(SFX_MUTED_KEY, "false");
  }

  applySfxVolume();
  updateSettingsUI();
}

function updateSettingsUI() {
  const slider = document.getElementById("sfxVolumeSlider");
  const value = document.getElementById("sfxVolumeValue");

  if (slider) {
    slider.value = String(Math.round(sfxVolume * 100));
  }

  if (value) {
    value.textContent = `${Math.round(sfxVolume * 100)}%`;
  }
}

function toggleTopMenu() {
  const dropdown = document.getElementById("topMenuDropdown");
  const button = document.getElementById("menuButton");
  if (!dropdown || !button) return;

  const isOpen = dropdown.style.display === "block";
  dropdown.style.display = isOpen ? "none" : "block";
  button.setAttribute("aria-expanded", isOpen ? "false" : "true");
}

function closeTopMenu() {
  const dropdown = document.getElementById("topMenuDropdown");
  const button = document.getElementById("menuButton");
  if (!dropdown || !button) return;

  dropdown.style.display = "none";
  button.setAttribute("aria-expanded", "false");
}

function openSettingsFromMenu() {
  closeTopMenu();
  openSettingsModal();
}

function openWhatsNewFromMenu() {
  closeTopMenu();
  openWhatsNewModal();
}

const WHATS_NEW_CONTENT = {
  "2.01": `
    <h3>Version 2.01</h3>
    <ul>
      <li>Added Endless mode improvements and resume behavior fixes.</li>
      <li>Fixed issues where switching modes could affect Daily progress display.</li>
      <li>Improved the waveform preview marker so it appears at the correct times.</li>
      <li>Updated the Results modal layout and share feedback animation.</li>
      <li>Added better button layout and polish across the results screen.</li>
      <li>Added a What's New? page.</li>
      <li>Moved settings and the What's New? page into a hamburger menu.</li>
      <li>Various bug fixes for audio playback, mode switching, and UI consistency.</li>
    </ul>
  `,
  "2.0": `
    <h3>Version 2.0</h3>
    <ul>
      <li>Added Endless mode.</li>
      <li>Added configurable Endless settings like guess limit and clip start position.</li>
      <li>Added Endless run score tracking and best score tracking.</li>
      <li>Added setup screen for Endless mode.</li>
      <li>Added sound effects.</li>
      <li>Added an overall settings menu.</li>
      <li>Added visual improvements to gameplay flow and interface polish.</li>
      <li>Improved results presentation and overall game feel.</li>
    </ul>
  `,
  "1.0": `
    <h3>Version 1.0</h3>
    <ul>
      <li>Initial release of Thundle.</li>
      <li>Daily song guessing mode with ThunderPunch! songs.</li>
      <li>Autocomplete guessing input.</li>
      <li>Clip-based guessing progression.</li>
      <li>Stats tracking including played, win percentage, streak, and best streak.</li>
      <li>Shareable results grid.</li>
      <li>Bonus song feature.</li>
    </ul>
  `
};

function openWhatsNewModal() {
  const modal = document.getElementById("whatsNewModal");
  if (!modal) return;

  showWhatsNewVersion("2.01");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeWhatsNewModal() {
  const modal = document.getElementById("whatsNewModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function showWhatsNewVersion(version) {
  const content = document.getElementById("whatsNewContent");
  if (!content) return;

  content.innerHTML = WHATS_NEW_CONTENT[version] || "<p>No update notes yet.</p>";

  const tab201 = document.getElementById("whatsNewTab201");
  const tab20 = document.getElementById("whatsNewTab20");
  const tab10 = document.getElementById("whatsNewTab10");

  [tab201, tab20, tab10].forEach(btn => btn?.classList.remove("active"));

  if (version === "2.01" && tab201) tab201.classList.add("active");
  if (version === "2.0" && tab20) tab20.classList.add("active");
  if (version === "1.0" && tab10) tab10.classList.add("active");
}

function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;

  updateSettingsUI();
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}


function playSound(sound) {
  if (!sound || sfxMuted) return;

  sound.currentTime = 0;
  sound.play().catch(() => {
    // ignore autoplay-related errors
  });
}

Object.values(sounds).forEach(sound => {
  sound.load();
});

const SFX_MUTED_KEY = "thundleSfxMuted";
const SFX_VOLUME_KEY = "thundleSfxVolume";

let sfxMuted = localStorage.getItem(SFX_MUTED_KEY) === "true";

const savedSfxVolume = localStorage.getItem(SFX_VOLUME_KEY);
let sfxVolume = savedSfxVolume === null ? 1 : Number(savedSfxVolume);

if (Number.isNaN(sfxVolume)) {
  sfxVolume = 1;
}


fetch("songs.json")
  .then(r => r.json())
  .then(data => {
    songs = data;
    setupAutocomplete();

    const restoredEndless = loadEndlessProgressIfAvailable();

    if (!restoredEndless) {
      gameMode = "daily";
      pickDailySongs();
      preloadTodaySongs();
      showPuzzleNumber();
      renderAttemptRow();
      loadProgressIfAvailable();
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
    updateModeButtons();
    applySfxVolume();
    updateSettingsUI();
    updateEndlessSetupBestText();
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

function getEasternDateParts() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(now);

  const year = Number(parts.find(part => part.type === "year").value);
  const month = Number(parts.find(part => part.type === "month").value);
  const day = Number(parts.find(part => part.type === "day").value);

  return { year, month, day };
}

function getUTCDayNumber() {
  const { year, month, day } = getEasternDateParts();
  const easternDayAsUTC = Date.UTC(year, month - 1, day);
  return Math.floor((easternDayAsUTC - PUZZLE_EPOCH_UTC) / 86400000);
}

function getTodayKeyUTC() {
  const { year, month, day } = getEasternDateParts();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const offsetPart = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset"
  })
    .formatToParts(date)
    .find(part => part.type === "timeZoneName")?.value || "GMT-0";

  const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);

  return sign * (hours * 60 + minutes);
}

function getNextPuzzleUTCDate() {
  const { year, month, day } = getEasternDateParts();

  const offsetProbe = new Date(Date.UTC(year, month - 1, day + 1, 12, 0, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(offsetProbe, "America/New_York");

  return new Date(
    Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - offsetMinutes * 60 * 1000
  );
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
  if (gameMode === "endless") {
    return endlessCurrentSong;
  }
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

function formatEndlessConfigText(settings) {
  const guessLabel =
    settings.guessLimit === 6 ? "Normal" : "Hard";

  const clipLabel =
    settings.clipStart === "beginning"
      ? "Beginning of song"
      : "Middle of song";

  return `${guessLabel} + ${clipLabel}`;
}

function getEndlessConfigKey(settings = endlessSettings) {
  return `guessLimit:${settings.guessLimit}|clipStart:${settings.clipStart}`;
}

function getEndlessConfigBests() {
  try {
    return JSON.parse(localStorage.getItem(ENDLESS_CONFIG_BESTS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveEndlessConfigBests(bests) {
  localStorage.setItem(ENDLESS_CONFIG_BESTS_KEY, JSON.stringify(bests));
}

function getBestForSettings(settings = endlessSettings) {
  const bests = getEndlessConfigBests();
  return bests[getEndlessConfigKey(settings)] || 0;
}

function updateEndlessSetupBestText() {
  const el = document.getElementById("endlessConfigBestText");
  if (!el) return;

  const previewSettings = {
    guessLimit: Number(
      document.querySelector('input[name="endlessGuessLimit"]:checked')?.value || 6
    ),
    clipStart:
      document.querySelector('input[name="endlessClipStart"]:checked')?.value || "beginning"
  };

  const best = getBestForSettings(previewSettings);
  const label = formatEndlessConfigText(previewSettings);

  el.textContent = `${label} • Best: ${best}`;
}

function saveBestForCurrentEndlessConfig(score) {
  const bests = getEndlessConfigBests();
  const key = getEndlessConfigKey();
  const currentBest = bests[key] || 0;

  if (score > currentBest) {
    bests[key] = score;
    saveEndlessConfigBests(bests);
  }
}

function setMode(mode) {
  if (gameMode === mode) return;

  stopCurrentAudio();
  stopResultPreviewAudio();

  const endlessSetupCard = document.getElementById("endlessSetupCard");
  const gameCard = document.getElementById("game");
  const nextCard = document.getElementById("countdownCard");

  if (mode === "daily") {
    if (gameMode === "endless") {
      saveEndlessProgress();
    }

    animateModeSwitch(
      [gameCard, nextCard],
      [endlessSetupCard],
      () => {
        gameMode = "daily";
        updateModeButtons();

        pickDailySongs();
        preloadTodaySongs();
        resetRoundState();
        showPuzzleNumber();
        updateEndlessRunCounter();
        updateEndlessRestartButton();

        document.getElementById("songLabel").innerText = "Song #1";
        document.getElementById("roundHint").innerText = "Starts at the beginning of the track.";

        loadProgressIfAvailable();
        saveProgress();
      }
    );

    return;
  }

  if (mode === "endless") {
  const hasSavedEndless = getEndlessProgress().endlessCurrentSong;

  if (hasSavedEndless) {
    animateModeSwitch(
      [gameCard],
      [endlessSetupCard, nextCard],
      () => {
        gameMode = "endless";
        updateModeButtons();
        updateEndlessSetupBestText();
        loadEndlessProgressIfAvailable();
      }
    );
  } else {
    animateModeSwitch(
      [endlessSetupCard],
      [gameCard, nextCard],
      () => {
        gameMode = "endless";
        updateModeButtons();
        updateEndlessSetupBestText();
        resetRoundState();
        document.getElementById("puzzleNumber").innerText = "Endless";
        updateEndlessRunCounter();
        updateEndlessRestartButton();
      }
    );
  }
}
}

function startEndlessMode() {
  endlessScore = 0;
  endlessNewBestCelebrated = false;
  gameFinished = false;
  endlessCurrentSong = getNextEndlessSong();
  endlessCurrentStartTime = 0;

  resetRoundState();

  document.getElementById("puzzleNumber").innerText = "Endless";
  document.getElementById("songLabel").innerText = "Song 1";
  document.getElementById("roundHint").innerText = getEndlessRoundHint();
  updateEndlessRunCounter();
  updateEndlessRestartButton();
  updateWaveformPreviewMarker();

  const nextCard = document.getElementById("countdownCard");
if (nextCard) {
  nextCard.style.display = "none";
}

  preloadedAudio = [null, null];
  if (endlessCurrentSong?.file) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = endlessCurrentSong.file;
    audio.load();
    preloadedAudio[0] = audio;
  }

  saveEndlessProgress();
}

function getRandomMiddleStartTime(duration) {
  const minStart = duration * 0.35;
  const maxStart = duration * 0.7;
  return minStart + Math.random() * (maxStart - minStart);
}

function resetRoundState() {
  songIndex = 0;
  guessNumber = 0;
  guessHistory = [[], []];
  bonusStarted = false;
  gameFinished = false;

  document.getElementById("feedback").innerText = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessInput").disabled = false;
  document.getElementById("guessButton").disabled = false;
  document.getElementById("playButton").disabled = false;
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("artWrap").style.display = "none";
  document.getElementById("showResultsSection").style.display = "none";

  const mainBonusButton = document.getElementById("mainBonusButton");
if (mainBonusButton) {
  mainBonusButton.style.display = "none";
}

  hideEndlessActionButtons();
  hideWaveformPreviewMarker();
  renderAttemptRow();
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getNextEndlessSong() {
  if (endlessQueue.length === 0) {
    refillEndlessQueue();
  }

  const index = endlessQueue.shift();
  endlessUsedIndices.push(index);

  if (endlessUsedIndices.length > 10) {
    endlessUsedIndices.shift();
  }

  return songs[index];
}

function refillEndlessQueue() {
  const allIndices = songs.map((_, i) => i);

  // optional: avoid immediate repeats from the last few songs
  const filtered = allIndices.filter(i => !endlessUsedIndices.includes(i));
  const source = filtered.length >= 5 ? filtered : allIndices;

  endlessQueue = shuffleArray(source);
}

function nextEndlessSong() {
  if (gameMode !== "endless") return;

  endlessCurrentSong = getNextEndlessSong();
  endlessCurrentStartTime = 0;
  resetRoundState();

  document.getElementById("puzzleNumber").innerText = "Endless";
  document.getElementById("songLabel").innerText = `Song ${endlessScore + 1}`;
  document.getElementById("roundHint").innerText = getEndlessRoundHint();
  updateEndlessRunCounter();
  updateEndlessRestartButton();

  preloadedAudio = [null, null];
  if (endlessCurrentSong?.file) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = endlessCurrentSong.file;
    audio.load();
    preloadedAudio[0] = audio;
  }

  saveEndlessProgress();
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  stopWaveform();
  setPlayButtonState(false);

  const button = document.getElementById("playButton");
  if (button) {
    button.disabled = false;
  }
}

function playClip() {
  if (gameFinished) return;

  const button = document.getElementById("playButton");
  const song = getCurrentSong();
  if (!song) return;

  if (currentAudio && !currentAudio.paused) {
  stopCurrentAudio();
  setPlayButtonState(false);
  button.disabled = false;
  return;
}

  button.disabled = true;
  setPlayButtonLoading();

  stopCurrentAudio();
  startWaveformLoading();

  if (!waveformPreviewShown) {
    showWaveformPreviewMarker();
  }
  updateWaveformPreviewMarker();

  const clipSeconds = CLIPS[Math.min(guessNumber, CLIPS.length - 1)];
  const preloadIndex = gameMode === "endless" ? 0 : songIndex;
  const audio = preloadedAudio[preloadIndex]
    ? preloadedAudio[preloadIndex].cloneNode()
    : new Audio(song.file);

  currentAudio = audio;

  let clipTimeout = null;
  let playbackHandled = false;
  let loadTimeout = null;

  function restoreButton() {
  setPlayButtonState(false);
  button.disabled = false;
}

  loadTimeout = setTimeout(() => {
    if (currentAudio === audio && !playbackHandled) {
      console.error("Audio load timed out:", song.file);
      stopWaveformLoading();
      stopWaveform();
      restoreButton();
      currentAudio = null;
    }
  }, 10000);

  function beginPlayback() {
  if (playbackHandled) return;
  playbackHandled = true;

  if (loadTimeout) {
    clearTimeout(loadTimeout);
    loadTimeout = null;
  }

  stopWaveformLoading();
  startWaveform(clipSeconds);
  setPlayButtonState(true);
  button.disabled = false;

  clipTimeout = setTimeout(() => {
    if (currentAudio === audio) {
      audio.pause();
      audio.currentTime = 0;
      currentAudio = null;
      stopWaveform();
      restoreButton();
    }
  }, clipSeconds * 1000 + 150);
}

  audio.addEventListener("loadedmetadata", () => {
    let startTime = 0;

    if (gameMode === "daily" && songIndex === 1) {
      const day = getUTCDayNumber();
      const bonusRng = mulberry32((day + 1) * 999 + 17);
      const minStart = audio.duration * 0.35;
      const maxStart = audio.duration * 0.7;
      startTime = minStart + bonusRng() * (maxStart - minStart);
    }

    if (gameMode === "endless") {
      if (endlessSettings.clipStart === "middle") {
        if (!endlessCurrentStartTime || endlessCurrentStartTime >= audio.duration) {
          endlessCurrentStartTime = getRandomMiddleStartTime(audio.duration);
        }
        startTime = endlessCurrentStartTime;
      } else {
        endlessCurrentStartTime = 0;
      }
    }

    audio.currentTime = Math.max(0, startTime);

    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      stopWaveformLoading();
      stopWaveform();
      restoreButton();
      currentAudio = null;
    });
  });

  audio.addEventListener("playing", beginPlayback, { once: true });

  audio.addEventListener("ended", () => {
    if (clipTimeout) clearTimeout(clipTimeout);
    if (loadTimeout) clearTimeout(loadTimeout);

    if (currentAudio === audio) {
      currentAudio = null;
      stopWaveform();
      restoreButton();
    }
  });

  audio.addEventListener("error", () => {
    console.error("Audio failed to load:", song.file);
    if (clipTimeout) clearTimeout(clipTimeout);
    if (loadTimeout) clearTimeout(loadTimeout);
    stopWaveformLoading();
    stopWaveform();
    restoreButton();
    currentAudio = null;
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

  const maxClipSeconds = CLIPS[CLIPS.length - 1];
  const targetPercent = (durationSeconds / maxClipSeconds) * 100;
  const startTime = performance.now();

  waveformTimer = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    const progress = Math.min(1, elapsed / durationSeconds);
    const percent = targetPercent * progress;

    fill.style.width = `${percent}%`;

    if (progress >= 1) {
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

function endRoundWaveformState() {
  showWaveformPreviewMarker();
  updateWaveformPreviewMarker();
}

function showWaveformPreviewMarker() {
  const marker = document.getElementById("waveformPreviewMarker");
  if (!marker) return;

  waveformPreviewShown = true;
  marker.style.display = "block";
}

function hideWaveformPreviewMarker() {
  const marker = document.getElementById("waveformPreviewMarker");
  if (!marker) return;

  waveformPreviewShown = false;
  marker.style.display = "none";
}

function updateWaveformPreviewMarker() {
  const marker = document.getElementById("waveformPreviewMarker");
  const label = document.getElementById("waveformPreviewLabel");

  if (!marker || !label) return;

  const currentClipSeconds = CLIPS[Math.min(guessNumber, CLIPS.length - 1)];
  const maxClipSeconds = CLIPS[CLIPS.length - 1];
  const percent = (currentClipSeconds / maxClipSeconds) * 100;
  const newText = `${currentClipSeconds}s`;
  const textChanged = label.innerText !== newText;

  marker.style.left = `${percent}%`;

  if (percent >= 95) {
    label.style.transform = "translateX(-100%)";
  } else {
    label.style.transform = "translateX(-50%)";
  }

  if (!textChanged) {
    return;
  }

  label.style.opacity = "0";

  setTimeout(() => {
    label.innerText = newText;
    label.style.opacity = "1";
  }, 120);
}

function animateReveal(...elements) {
  elements.forEach(el => {
    if (!el) return;

    el.classList.remove("reveal-pop");
    void el.offsetWidth;
    el.classList.add("reveal-pop");
  });
}

function updateModeButtons() {
  const dailyBtn = document.getElementById("dailyModeButton");
  const endlessBtn = document.getElementById("endlessModeButton");

  if (!dailyBtn || !endlessBtn) return;

  dailyBtn.classList.toggle("active", gameMode === "daily");
  endlessBtn.classList.toggle("active", gameMode === "endless");
}

function hideEndlessActionButtons() {
  const wrap = document.getElementById("endlessActionWrap");
  const nextBtn = document.getElementById("nextSongButton");
  const restartBtn = document.getElementById("restartRunButton");

  if (!wrap || !nextBtn || !restartBtn) return;

  wrap.style.display = "none";
  nextBtn.style.display = "none";
  restartBtn.style.display = "none";
}

function showNextSongButton() {
  const wrap = document.getElementById("endlessActionWrap");
  const nextBtn = document.getElementById("nextSongButton");
  const restartBtn = document.getElementById("restartRunButton");

  if (!wrap || !nextBtn || !restartBtn) return;

  wrap.style.display = "block";
  nextBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
}

function showRestartRunButton() {
  const wrap = document.getElementById("endlessActionWrap");
  const nextBtn = document.getElementById("nextSongButton");
  const restartBtn = document.getElementById("restartRunButton");

  if (!wrap || !nextBtn || !restartBtn) return;

  wrap.style.display = "block";
  nextBtn.style.display = "none";
  restartBtn.style.display = "inline-block";
}

function submitGuess() {
  if (gameFinished) return;

  const input = document.getElementById("guessInput");
  const guess = input.value.trim().toLowerCase();
  const song = getCurrentSong();

  if (!song || !guess) return;

  const answer = song.title.toLowerCase();
  const historyIndex = gameMode === "endless" ? 0 : songIndex;

  if (guess === answer) {
    guessHistory[historyIndex].push("correct");

    const feedback = document.getElementById("feedback");
    feedback.innerText = "Correct!";
    animateReveal(feedback);
    playSound(sounds.correct);
    launchConfetti();
    showAlbumArt(song);
    renderAttemptRow();
    stopCurrentAudio();
    endRoundWaveformState();

    input.value = "";
    document.getElementById("suggestions").innerHTML = "";

    if (gameMode === "endless") {
  endlessScore++;

  const previousOverallBest = endlessBest;
  const previousConfigBest = getBestForSettings();

  if (endlessScore > previousOverallBest) {
    endlessBest = endlessScore;
    localStorage.setItem("thundleEndlessBest", String(endlessBest));
  }

  const newBestAchieved =
    previousConfigBest > 0 &&
    !endlessNewBestCelebrated &&
    endlessScore > previousConfigBest;

  if (newBestAchieved) {
    endlessNewBestCelebrated = true;
    playSound(sounds.newBest);
  }

  saveBestForCurrentEndlessConfig(endlessScore);

  updateEndlessRunCounter(newBestAchieved);
  updateEndlessSetupBestText();

      document.getElementById("playButton").disabled = true;
      document.getElementById("guessInput").disabled = true;
      document.getElementById("guessButton").disabled = true;

      showNextSongButton();
      saveEndlessProgress();
      return;
    }

    saveProgress();
    finishCurrentRound();
    return;
  }

    guessHistory[historyIndex].push("wrong");
  guessNumber++;
  renderAttemptRow();
  updateWaveformPreviewMarker();

  if (guessNumber >= getCurrentGuessLimit()) {
    document.getElementById("feedback").innerText = `Answer: ${song.title}`;
    playSound(sounds.fail);
    showAlbumArt(song);
    stopCurrentAudio();
    endRoundWaveformState();

    if (gameMode === "endless") {
      gameFinished = true;
      document.getElementById("playButton").disabled = true;
      document.getElementById("guessInput").disabled = true;
      document.getElementById("guessButton").disabled = true;
      showRestartRunButton();
      saveEndlessProgress();
      return;
    }

    finishCurrentRound();
  } else {
    document.getElementById("feedback").innerText = "Try again";
    playSound(sounds.incorrect);
  }

  input.value = "";
  document.getElementById("suggestions").innerHTML = "";

  if (gameMode === "endless") {
    saveEndlessProgress();
  } else {
    saveProgress();
  }

  if (guessNumber >= getCurrentGuessLimit()) {
    document.getElementById("feedback").innerText = `Answer: ${song.title}`;
    playSound(sounds.fail);
    showAlbumArt(song);
    stopCurrentAudio();
    endRoundWaveformState();

    if (gameMode === "endless") {
      gameFinished = true;
      document.getElementById("playButton").disabled = true;
      document.getElementById("guessInput").disabled = true;
      document.getElementById("guessButton").disabled = true;
      showRestartRunButton();
      saveEndlessProgress();
      return;
    }

    finishCurrentRound();
  } else {
    document.getElementById("feedback").innerText = "Try again";
  }

  input.value = "";
  document.getElementById("suggestions").innerHTML = "";
  if (gameMode === "endless") {
  saveEndlessProgress();
} else {
  saveProgress();
}
}

function setPlayButtonLoading() {
  const icon = document.getElementById("playIcon");
  const label = document.getElementById("playButtonLabel");
  if (!icon || !label) return;

  icon.classList.remove("stop", "pulsing");
  icon.classList.add("play");
  label.textContent = "Loading…";
}

function setPlayButtonState(isPlaying) {
  const icon = document.getElementById("playIcon");
  const label = document.getElementById("playButtonLabel");
  if (!icon || !label) return;

  label.textContent = isPlaying ? "Stop" : "Play Clip";

  icon.classList.toggle("play", !isPlaying);
  icon.classList.toggle("stop", isPlaying);
  icon.classList.toggle("pulsing", isPlaying);
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

  const mainBonusButton = document.getElementById("mainBonusButton");
  if (mainBonusButton) {
    mainBonusButton.style.display = didWinSong(0) ? "inline-block" : "none";
  }

  openResultsModal();
} else {
  gameFinished = true;
  saveProgress();
  updateStatsFinal();
  prepareResults(true);
  document.getElementById("showResultsSection").style.display = "block";

  const mainBonusButton = document.getElementById("mainBonusButton");
  if (mainBonusButton) {
    mainBonusButton.style.display = "none";
  }

  openResultsModal();
}
}

function renderAttemptRow() {
  const row = document.getElementById("attemptRow");
  row.innerHTML = "";

  const history = gameMode === "endless" ? guessHistory[0] : guessHistory[songIndex];
  const guessLimit = getCurrentGuessLimit();

  for (let i = 0; i < guessLimit; i++) {
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

  const mainBonusButton = document.getElementById("mainBonusButton");
if (mainBonusButton) {
  mainBonusButton.style.display = "none";
}

  hideWaveformPreviewMarker();
  renderAttemptRow();
  saveProgress();
}

function updateEndlessRestartButton() {
  const button = document.getElementById("restartEndlessTopButton");
  if (!button) return;

  button.style.display = gameMode === "endless" ? "inline-block" : "none";
}

function confirmRestartEndlessRun() {
  if (gameMode !== "endless") return;

  const modal = document.getElementById("restartConfirmModal");
  if (!modal) return;

  modal.style.display = "flex";
  modal.classList.remove("is-open");

  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeRestartConfirmModal() {
  const modal = document.getElementById("restartConfirmModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
  }, 200);
}

function confirmRestartEndlessRunNow() {
  closeRestartConfirmModal();
  restartEndlessRun();
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
    resultsModalOpen: modal ? modal.classList.contains("is-open") : false
  };

  localStorage.setItem("thundleProgress", JSON.stringify(progress));
}

function clearProgress() {
  localStorage.removeItem("thundleProgress");
}

function getDefaultEndlessProgress() {
  return {
    inProgress: false,
    endlessScore: 0,
    endlessBest: Number(localStorage.getItem("thundleEndlessBest")) || 0,
    endlessCurrentSong: null,
    endlessCurrentStartTime: 0,
    endlessQueue: [],
    endlessUsedIndices: [],
    guessNumber: 0,
    guessHistory: [[], []],
    gameFinished: false,
    settings: {
      guessLimit: 6,
      clipStart: "beginning"
    }
  };
}

function getEndlessProgress() {
  let progress;

  try {
    progress = JSON.parse(localStorage.getItem("thundleEndlessProgress")) || {};
  } catch {
    progress = {};
  }

  const defaults = getDefaultEndlessProgress();

  return {
    inProgress: typeof progress.inProgress === "boolean" ? progress.inProgress : defaults.inProgress,
    endlessScore: Number.isInteger(progress.endlessScore) ? progress.endlessScore : defaults.endlessScore,
    endlessBest: Number.isInteger(progress.endlessBest) ? progress.endlessBest : defaults.endlessBest,
    endlessCurrentSong: progress.endlessCurrentSong || defaults.endlessCurrentSong,
    endlessCurrentStartTime: typeof progress.endlessCurrentStartTime === "number"
      ? progress.endlessCurrentStartTime
      : defaults.endlessCurrentStartTime,
    endlessQueue: Array.isArray(progress.endlessQueue) ? progress.endlessQueue : defaults.endlessQueue,
    endlessUsedIndices: Array.isArray(progress.endlessUsedIndices) ? progress.endlessUsedIndices : defaults.endlessUsedIndices,
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
    gameFinished: typeof progress.gameFinished === "boolean" ? progress.gameFinished : defaults.gameFinished,
    settings:
      progress.settings &&
      typeof progress.settings === "object"
        ? {
            guessLimit: progress.settings.guessLimit === 1 ? 1 : 6,
            clipStart: progress.settings.clipStart === "middle" ? "middle" : "beginning"
          }
        : defaults.settings
  };
}

function saveEndlessProgress() {
  const progress = {
    inProgress: gameMode === "endless" && !!endlessCurrentSong && !gameFinished,
    endlessScore,
    endlessBest,
    endlessCurrentSong,
    endlessCurrentStartTime,
    endlessQueue,
    endlessUsedIndices,
    guessNumber,
    guessHistory,
    gameFinished,
    settings: endlessSettings
  };

  localStorage.setItem("thundleEndlessProgress", JSON.stringify(progress));
}

function clearEndlessProgress() {
  localStorage.removeItem("thundleEndlessProgress");
}

function loadEndlessProgressIfAvailable() {
  const progress = getEndlessProgress();

  if (!progress.endlessCurrentSong) {
    return false;
  }

  endlessScore = progress.endlessScore;
  endlessBest = progress.endlessBest;
  endlessCurrentSong = progress.endlessCurrentSong;
  endlessCurrentStartTime = progress.endlessCurrentStartTime;
  endlessQueue = progress.endlessQueue;
  endlessUsedIndices = progress.endlessUsedIndices;
  guessNumber = progress.guessNumber;
  guessHistory = progress.guessHistory;
  gameFinished = progress.gameFinished;
  endlessSettings = progress.settings;
  gameMode = "endless";

  const endlessSetupCard = document.getElementById("endlessSetupCard");
const gameCard = document.getElementById("game");
const nextCard = document.getElementById("countdownCard");
  if (endlessSetupCard) {
    endlessSetupCard.style.display = "none";
  }

  if (gameCard) {
    gameCard.style.display = "block";
  }

  if (nextCard) {
    nextCard.style.display = "none";
  }

  document.getElementById("puzzleNumber").innerText = "Endless";
  document.getElementById("songLabel").innerText = `Song ${endlessScore + 1}`;
  document.getElementById("roundHint").innerText = getEndlessRoundHint();
  updateEndlessRunCounter();
  updateEndlessRestartButton();

  document.getElementById("feedback").innerText = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
  renderAttemptRow();
  updateWaveformPreviewMarker();

  if (gameFinished) {
    document.getElementById("playButton").disabled = true;
    document.getElementById("guessInput").disabled = true;
    document.getElementById("guessButton").disabled = true;
    showRestartRunButton();
  } else {
    document.getElementById("playButton").disabled = false;
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessButton").disabled = false;
    hideEndlessActionButtons();

    if (guessHistory[0].includes("correct")) {
      showAlbumArt(endlessCurrentSong);
      showNextSongButton();
      document.getElementById("playButton").disabled = true;
      document.getElementById("guessInput").disabled = true;
      document.getElementById("guessButton").disabled = true;
      document.getElementById("feedback").innerText = "Correct!";
    } else if (guessHistory[0].length >= getCurrentGuessLimit()) {
      showAlbumArt(endlessCurrentSong);
      showRestartRunButton();
      document.getElementById("playButton").disabled = true;
      document.getElementById("guessInput").disabled = true;
      document.getElementById("guessButton").disabled = true;
      document.getElementById("feedback").innerText = `Answer: ${endlessCurrentSong.title}`;
    } else {
      document.getElementById("artWrap").style.display = "none";
    }
  }

  preloadedAudio = [null, null];
  if (endlessCurrentSong?.file) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = endlessCurrentSong.file;
    audio.load();
preloadedAudio[0] = audio;
  }

  renderAttemptRow();
  return true;
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

  const mainBonusButton = document.getElementById("mainBonusButton");
  if (mainBonusButton) {
    mainBonusButton.style.display = didWinSong(0) ? "inline-block" : "none";
  }
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

  if (currentHistory.length > 0) {
  showWaveformPreviewMarker();
  updateWaveformPreviewMarker();
} else {
  hideWaveformPreviewMarker();
}

  if (gameFinished) {
    prepareResults(true);
  } else if (finishedMain && !bonusStarted) {
    prepareResults(false);
  }

  if (progress.resultsModalOpen) {
    if (gameFinished) {
      prepareResults(true);
      setTimeout(openResultsModal, 0);
    } else if (finishedMain) {
      prepareResults(false);
      setTimeout(openResultsModal, 0);
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

function populateEndlessResultCard() {
  const song = endlessCurrentSong;
  const mainArt = document.getElementById("resultAlbumArt0");
  const mainTitle = document.getElementById("resultSongTitle0");
  const mainButton = document.getElementById("resultPlayButton0");
  const mainSpotify = document.getElementById("resultSpotifyLink0");
  const bonusCard = document.getElementById("bonusResultCard");

  bonusCard.style.display = "none";

  if (!song) return;

  mainArt.src = song.art || "";
  mainTitle.innerText = song.title;
  mainButton.style.display = "inline-flex";
  mainArt.style.display = song.art ? "block" : "none";

  if (song.spotify) {
    mainSpotify.href = song.spotify;
    mainSpotify.style.display = "inline-flex";
  } else {
    mainSpotify.style.display = "none";
  }
}

function prepareEndlessResults(wonRound) {
  const resultsTitle = document.getElementById("resultsTitle");
  const statsEl = document.getElementById("stats");
  const shareGridEl = document.getElementById("shareGrid");
  const copiedMessageEl = document.getElementById("copiedMessage");
  const bonusButton = document.getElementById("bonusButton");

  resultsTitle.innerText = wonRound ? "Correct!" : "Run Over";
  statsEl.innerText =
    `Score: ${endlessScore}\nBest: ${endlessBest}`;

  bonusButton.style.display = "none";

  populateEndlessResultCard();
  renderDistributionChart([0, 0, 0, 0, 0, 0]);
  shareGridEl.innerText = buildEndlessShareText(wonRound);
  copiedMessageEl.innerText = "";
}

function openResultsModal() {
  const modal = document.getElementById("resultModal");
  if (!modal) {
    console.error("resultModal element not found");
    return;
  }

  const modalContent = modal.querySelector(".modal-content");
  const modalBody = modal.querySelector(".results-modal-body");

  stopResultPreviewAudio();

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Reset every possible scroll container immediately
  modal.scrollTop = 0;
  if (modalContent) modalContent.scrollTop = 0;
  if (modalBody) modalBody.scrollTop = 0;

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    // Reset again after layout/paint so it always sticks
    modal.scrollTop = 0;
    if (modalContent) modalContent.scrollTop = 0;
    if (modalBody) modalBody.scrollTop = 0;

    modal.classList.add("is-open");
  });

  saveProgress();
}

function closeModal() {
  stopResultPreviewAudio();

  const modal = document.getElementById("resultModal");
  if (!modal) return;

  const modalContent = modal.querySelector(".modal-content");
  const modalBody = modal.querySelector(".results-modal-body");

  modal.scrollTop = 0;
  if (modalContent) modalContent.scrollTop = 0;
  if (modalBody) modalBody.scrollTop = 0;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
    modal.scrollTop = 0;
    if (modalContent) modalContent.scrollTop = 0;
    if (modalBody) modalBody.scrollTop = 0;
    saveProgress();
  }, 200);
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

function buildShareText(includeLink = true) {
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

  let text = `${mainIcon} Thundle ${puzzleNum}${streakText}

${row1}
${bonusIcon} Bonus
${row2}`;

  if (includeLink) {
    text += `

${link}`;
  }

  return text;
}

function showShareStatus(message) {
  const el = document.getElementById("copiedMessage");
  if (!el) return;

  el.textContent = message;
  el.classList.remove("show");

  void el.offsetWidth;

  el.classList.add("show");

  clearTimeout(showShareStatus._timer);
  showShareStatus._timer = setTimeout(() => {
    el.classList.remove("show");
  }, 1600);
}

async function share() {
  const textForNativeShare = buildShareText(false);
  const textForClipboard = buildShareText(true);

  const shareData = {
    title: "Thundle",
    text: textForNativeShare,
    url: window.location.origin
  };

  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      await navigator.share(shareData);
      showShareStatus("Shared!");
      return;
    }

    await navigator.clipboard.writeText(textForClipboard);
    showShareStatus("Copied!");
  } catch (error) {
    if (error && error.name === "AbortError") {
      showShareStatus("Share canceled");
      return;
    }

    try {
      await navigator.clipboard.writeText(textForClipboard);
      showShareStatus("Copied!");
    } catch {
      showShareStatus("Could not share");
    }
  }
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

function getCurrentConfigBest() {
  return getBestForSettings();
}

function restartEndlessRun() {
  if (gameMode !== "endless") return;

  endlessNewBestCelebrated = false;
  stopCurrentAudio();
  clearEndlessProgress();

  const endlessSetupCard = document.getElementById("endlessSetupCard");
  const gameCard = document.getElementById("game");
  const nextCard = document.getElementById("countdownCard");

  endlessScore = 0;
  gameFinished = false;
  endlessCurrentSong = null;
  endlessCurrentStartTime = 0;
  endlessQueue = [];
  endlessUsedIndices = [];

  resetRoundState();
  updateEndlessRunCounter();
  updateEndlessRestartButton();

  if (gameCard) {
    gameCard.style.display = "none";
  }

  if (endlessSetupCard) {
    endlessSetupCard.style.display = "block";
  }

  if (nextCard) {
  nextCard.style.display = "none";
}

  document.getElementById("puzzleNumber").innerText = "Endless";
  updateEndlessSetupBestText();
}

function updateEndlessRunCounter(newBestAchieved = false) {
  const counter = document.getElementById("endlessRunCounter");
  if (!counter) return;

  if (gameMode === "endless") {
    counter.style.display = "block";

    const configBest = getCurrentConfigBest();

    counter.innerHTML = `
      Current Run: ${endlessScore}
      <span style="opacity:0.7;"> • Best: ${configBest}</span>
      ${newBestAchieved ? '<span id="newBestBadge" class="new-best-badge"> NEW BEST!</span>' : ''}
    `;

    counter.classList.remove("new-best-anim", "new-best-glow");
    void counter.offsetWidth;

    if (newBestAchieved) {
      counter.classList.add("new-best-anim", "new-best-glow");

      const badge = document.getElementById("newBestBadge");
      if (badge) {
        badge.classList.remove("new-best-sparkle");
        void badge.offsetWidth;
        badge.classList.add("new-best-sparkle");
      }
    }
  } else {
    counter.style.display = "none";
    counter.textContent = "Current Run: 0";
  }
}

function readEndlessSettingsFromUI() {
  const guessLimit = Number(
    document.querySelector('input[name="endlessGuessLimit"]:checked')?.value || 6
  );

  const clipStart =
    document.querySelector('input[name="endlessClipStart"]:checked')?.value || "beginning";

  endlessSettings = {
    guessLimit,
    clipStart
  };
}

function beginConfiguredEndlessRun() {
  readEndlessSettingsFromUI();

  const endlessSetupCard = document.getElementById("endlessSetupCard");
  const gameCard = document.getElementById("game");
  const nextCard = document.getElementById("countdownCard");

  if (endlessSetupCard) {
    endlessSetupCard.style.display = "none";
  }

  if (gameCard) {
    gameCard.style.display = "block";
  }

  if (nextCard) {
    nextCard.style.display = "none";
  }

  startEndlessMode();
}

function getCurrentGuessLimit() {
  if (gameMode === "endless") {
    return endlessSettings.guessLimit;
  }

  return MAX_GUESSES;
}

function getEndlessRoundHint() {
  const guessText = endlessSettings.guessLimit === 1
    ? "1 guess"
    : `${endlessSettings.guessLimit} guesses`;

  const clipText = endlessSettings.clipStart === "middle"
    ? "starts somewhere in the middle"
    : "starts at the beginning";

  return `${guessText} • ${clipText}`;
}

function animateModeSwitch(elementsToShow = [], elementsToHide = [], onMidpoint) {
  const allElements = [...elementsToShow, ...elementsToHide].filter(Boolean);

  allElements.forEach(el => {
    el.classList.remove("is-switching-in", "is-switching-out");
  });

  elementsToHide.forEach(el => {
    if (el && el.style.display !== "none") {
      el.classList.add("is-switching-out");
    }
  });

  setTimeout(() => {
    elementsToHide.forEach(el => {
      if (!el) return;
      el.classList.remove("is-switching-out");
      el.style.display = "none";
    });

    if (typeof onMidpoint === "function") {
      onMidpoint();
    }

    elementsToShow.forEach(el => {
      if (!el) return;
      el.style.display = el.id === "countdownCard" ? "block" : "block";
      el.classList.add("is-switching-in");
    });

    requestAnimationFrame(() => {
      elementsToShow.forEach(el => {
        if (!el) return;
        el.classList.remove("is-switching-in");
      });
    });
  }, 220);
}

window.addEventListener("click", (event) => {
  const restartModal = document.getElementById("restartConfirmModal");
  const resultsModal = document.getElementById("resultModal");
  const settingsModal = document.getElementById("settingsModal");
  const whatsNewModal = document.getElementById("whatsNewModal");
  const topMenu = document.getElementById("topMenuDropdown");
  const menuButton = document.getElementById("menuButton");

  if (event.target === restartModal) {
    closeRestartConfirmModal();
  }

  if (event.target === resultsModal) {
    closeModal();
  }

  if (event.target === settingsModal) {
    closeSettingsModal();
  }

  if (event.target === whatsNewModal) {
    closeWhatsNewModal();
  }

  if (
    topMenu &&
    menuButton &&
    !topMenu.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeTopMenu();
  }
});



document
  .querySelectorAll('input[name="endlessGuessLimit"], input[name="endlessClipStart"]')
  .forEach(input => {
    input.addEventListener("change", updateEndlessSetupBestText);
  });

  document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  if (button.id === "playButton") return;

  playSound(sounds.click);
});