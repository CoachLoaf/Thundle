let currentMode = "daily"; // "daily" or "endless"
let songs = [];
let todaySongs = [];
const SUPABASE_URL = "https://saotkxjbrtubbjuukwhj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhb3RreGpicnR1YmJqdXVrd2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzkyMzYsImV4cCI6MjA4OTcxNTIzNn0.vCKaoj44QHYmd7sPTP5Ssh8vmYzlwuCVIHkoxkj2kKA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEV_MODE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const WELCOME_MODAL_SEEN_KEY = "thundleWelcomeSeen";

let authMode = "login";
let currentUser = null;
let welcomeBackShownThisLoad = false;
let cloudSaveDebounceTimer = null;
let applyingCloudSave = false;
let syncStatus = "No cloud sync";
let isSyncingNow = false;
let lastSuccessfulSyncAt = "";

const CLIPS = [1, 2, 4, 6, 8, 10];
const MAX_GUESSES = 6;
const PUZZLE_EPOCH_UTC = Date.UTC(2026, 2, 16);
const STORAGE_KEYS = {
  ACHIEVEMENTS: "thundle_achievements"
};

const LAST_AUTH_USER_ID_KEY = "thundleLastAuthUserId";

let leaderboardSortKey = "daily_wins";
let favoriteSongSearchResults = [];
let profileDraft = null;

const DEFAULT_PROFILE = {
  avatar: "default",
  favoriteSong: "",
  favoriteAlbum: "the_ep"
};

const AVATAR_PATHS = {
  default: "branding/avatars/default.png"
};

const FAVORITE_ALBUMS = {
  the_ep: {
    id: "the_ep",
    title: "ThunderPunch! The EP!",
    art: "art/the-ep.jpg"
  },
  diamond_blisters: {
    id: "diamond_blisters",
    title: "Diamond Blisters",
    art: "art/diamond-blisters.jpg"
  },
  space_cat: {
    id: "space_cat",
    title: "Space Cat",
    art: "art/space-cat.jpg"
  },
  stupid_silly_happy_songs: {
    id: "stupid_silly_happy_songs",
    title: "Stupid, Silly, Happy Songs",
    art: "art/stupid-silly-happy-songs.png"
  }
};

let achievements = {};
let achievementProgress = {};
let achievementDefinitions = [];
let achievementToastQueue = [];
let achievementToastShowing = false;
let totalLogoClickCount = Number(localStorage.getItem("thundleTotalLogoClicks") || 0);
let logoClickStreakCount = 0;
let lightningKicksTriggeredThisLoad = false;
let logoClickSaveTimer = null;
let logoProgressSaveTimer = null;
const FEATURED_SONGS = {
  hidden_caleb: [
    "6-7-8-9-10",
    "Apartment 69 (Funky Dade)",
    "Being Serious (Intro)",
    "Birds",
    "Fat Albert",
    "Feel Good",
    "Joey, Baby!",
    "Playground Freestyle",
    "Puch",
    "Radio Friendly",
    "Respectfully",
    "Revenge Of The Brobots",
    "Ridin' In The Civic",
    "Space Cat",
    "Stacy And The Brobots",
    "The Wizard Of Oz",
    "Thotty Train",
    "We Have Lots Of Sex"
  ],
  hidden_dom: [
    "Missed Calls (Interlude)",
    "Orders From Above (Interlude)"
  ],
  hidden_dylan: [
    "Birds",
    "Joey, Baby!",
    "I Am The Liquor"
  ],
  hidden_mallory: [
    "Half-Mast",
    "Radio Friendly",
    "Space Cat"
  ],
  hidden_cal: [
    "Being Serious (Intro)",
    "Serious People (Interlude)",
    "Space Cat"
  ],
  hidden_brendon: [
    "Apartment 69 (Funky Dade)",
    "Loose Floor",
    "Miami Love Sounds",
    "Radio Friendly",
    "ThunderParty DiscoStick"
  ],
  hidden_mike: [
    "Distant Imagination",
    "Today",
    "Uproarious Applause"
  ]
};

let songIndex = 0;
let guessNumber = 0;
let guessHistory = [[], []];
let currentAudio = null;
let currentAudioRequestId = 0;
let waveformTimer = null;
let bonusStarted = false;
let gameFinished = false;
let resultPreviewAudio = null;
let resultPreviewSongIndex = null;
let confettiPieces = [];
let confettiAnimationFrame = null;
let preloadedAudio = [null, null];
let preloadedAudioReady = [false, false];
let endlessPreloadedReady = false;
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

const SOUND_POOL_SIZE = 4;

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  incorrect: new Audio("sounds/incorrect.mp3"),
  fail: new Audio("sounds/fail.mp3"),
  newBest: new Audio("sounds/new-best.mp3"),
  achievement: new Audio("sounds/achievement.mp3"),
};

const clickVariations = [
  "sounds/click-1.mp3",
  "sounds/click-2.mp3",
  "sounds/click-3.mp3",
  "sounds/click-4.mp3",
  "sounds/click-5.mp3"
];

const zapVariations = [
  "sounds/logo-zap-1.mp3",
  "sounds/logo-zap-2.mp3",
  "sounds/logo-zap-3.mp3",
  "sounds/logo-zap-4.mp3",
  "sounds/logo-zap-5.mp3"
];

// Add these files to your /sounds folder.
// You can rename the files if you want, just keep the paths updated here.
const logoMilestoneSounds = {
  10: "sounds/logo-10.mp3",
  20: "sounds/logo-20.mp3",
  30: "sounds/logo-30.mp3",
  40: "sounds/logo-40.mp3",
  50: "sounds/logo-50.mp3",
  60: "sounds/logo-60.mp3",
  70: "sounds/logo-70.mp3",
  80: "sounds/logo-80.mp3",
  90: "sounds/logo-90.mp3",
  100: "sounds/logo-100-finale.mp3"
};

const pooledSfxSources = [
  ...clickVariations,
  ...zapVariations,
  ...Object.values(logoMilestoneSounds)
];

const sfxPools = {};
const sfxPoolIndexes = {};
let sfxUnlocked = false;

function buildSfxPools() {
  pooledSfxSources.forEach(src => {
    sfxPools[src] = Array.from({ length: SOUND_POOL_SIZE }, () => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      return audio;
    });
    sfxPoolIndexes[src] = 0;
  });
}

function getPooledSfx(src) {
  const pool = sfxPools[src];
  if (!pool || !pool.length) return null;

  const index = sfxPoolIndexes[src] || 0;
  const sound = pool[index];
  sfxPoolIndexes[src] = (index + 1) % pool.length;
  return sound;
}

function unlockSfx() {
  if (sfxUnlocked) return;
  sfxUnlocked = true;

  const allSounds = [
    ...Object.values(sounds),
    ...Object.values(sfxPools).flat()
  ];

  allSounds.forEach(sound => {
    try {
      const oldVolume = sound.volume;
      sound.volume = 0;

      const playPromise = sound.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            sound.pause();
            sound.currentTime = 0;
            sound.volume = oldVolume;
          })
          .catch(() => {
            sound.volume = oldVolume;
          });
      } else {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = oldVolume;
      }
    } catch {}
  });
}

function scheduleLogoClickSave() {
  clearTimeout(logoClickSaveTimer);
  logoClickSaveTimer = setTimeout(() => {
    localStorage.setItem("thundleTotalLogoClicks", String(totalLogoClickCount));
    renderProfileModalIfOpen();
  }, 2500);
}

function scheduleLogoProgressSave() {
  clearTimeout(logoProgressSaveTimer);
  logoProgressSaveTimer = setTimeout(() => {
    if (!achievements["hidden_lightning_kicks"]) {
      updateProgress("hidden_lightning_kicks", Math.min(logoClickStreakCount, 100), 100);
    }
  }, 2500);
}

function playLogoMilestoneSound() {
  const milestone = Math.min(logoClickStreakCount, 100);

  if (milestone % 10 !== 0) return;

  const src = logoMilestoneSounds[milestone];
  if (!src) return;

  playPitchedSfx(src, {
    volumeMultiplier: milestone === 100 ? 0.45 : 0.28,
    pitchMin: 0.995,
    pitchMax: 1.005
  });
}

buildSfxPools();

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function handleLogoClick() {
  totalLogoClickCount += 1;
  logoClickStreakCount += 1;

  scheduleLogoClickSave();
  scheduleLogoProgressSave();

  updateLogoClickVisualState();
  renderProfileModalIfOpen();
  playLogoMilestoneSound();

  if (logoClickStreakCount >= 100 && !lightningKicksTriggeredThisLoad) {
    lightningKicksTriggeredThisLoad = true;
    clearTimeout(logoProgressSaveTimer);
    unlockAchievement("hidden_lightning_kicks");
    triggerLightningKicksFinale();
  }
}

function getLogoElement() {
  return document.querySelector(".game-logo");
}

function updateLogoClickVisualState() {
  const logo = getLogoElement();
  if (!logo) return;

  const progress = Math.min(logoClickStreakCount, 100) / 100;
  const glowStrength = 0.22 + progress * 0.95;
  const brightness = 1.1 + progress * 0.55;

  logo.style.setProperty("--logo-glow-strength", glowStrength.toFixed(3));
  logo.style.setProperty("--logo-brightness", brightness.toFixed(3));

  if (logoClickStreakCount >= 100) {
    logo.classList.add("logo-fully-charged");
  } else {
    logo.classList.remove("logo-fully-charged");
  }
}

function resetLightningKicksRunState() {
  logoClickStreakCount = 0;
  lightningKicksTriggeredThisLoad = false;
  updateLogoClickVisualState();

  if (!achievements["hidden_lightning_kicks"]) {
    updateProgress("hidden_lightning_kicks", 0, 100);
  }
}

function triggerLightningKicksFinale() {
  const logo = getLogoElement();
  if (!logo) return;

  logo.classList.remove("logo-lightning-finale");
  void logo.offsetWidth;
  logo.classList.add("logo-lightning-finale");
}

function renderProfileModalIfOpen() {
  const profileModal = document.getElementById("profileModal");
  if (profileModal && profileModal.style.display === "flex") {
    renderProfileModal();
  }
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

function applySfxVolume() {
  const volume = sfxMuted ? 0 : sfxVolume;

  Object.values(sounds).forEach(sound => {
    if (!sound) return;
    sound.volume = volume;
  });
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

async function renameCurrentUser(newUsername) {
  const { data, error } = await supabaseClient.auth.updateUser({
    data: { username: newUsername }
  });

  if (error) {
    console.error("Rename failed:", error);
    return;
  }

  currentUser = data.user || currentUser;
  await refreshAuthUI();
  await saveToCloud(true);
  console.log("Username updated to:", newUsername);
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

function closeProfileMenu() {
  const dropdown = document.getElementById("profileMenuDropdown");
  const button = document.getElementById("profileChipButton");

  if (dropdown) dropdown.style.display = "none";
  if (button) button.setAttribute("aria-expanded", "false");
}

function toggleProfileMenu() {
  const dropdown = document.getElementById("profileMenuDropdown");
  const button = document.getElementById("profileChipButton");
  const topMenu = document.getElementById("topMenuDropdown");
  const topMenuButton = document.getElementById("menuButton");

  if (!dropdown || !button) return;

  const willOpen = dropdown.style.display !== "block";

  if (topMenu) topMenu.style.display = "none";
  if (topMenuButton) topMenuButton.setAttribute("aria-expanded", "false");

  dropdown.style.display = willOpen ? "block" : "none";
  button.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function openProfileFromProfileMenu() {
  closeProfileMenu();
  openProfileModal();
}

async function handleLogoutFromProfileMenu() {
  closeProfileMenu();
  await logoutAccount();
}

function toggleTopMenu() {
  const dropdown = document.getElementById("topMenuDropdown");
  closeProfileMenu();
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

function refreshDevMenuVisibility() {
  const devResetButton = document.getElementById("devResetMenuButton");
  if (!devResetButton) return;

  const isLocalhost =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";

  devResetButton.style.display = isLocalhost ? "flex" : "none";
}

function openSettingsFromMenu() {
  closeTopMenu();
  openSettingsModal();
}

function openWhatsNewFromMenu() {
  closeTopMenu();
  openWhatsNewModal();
}

function openAchievementsFromMenu() {
  closeTopMenu();
  openAchievementsModal();
}

const WHATS_NEW_CONTENT = {
  "2.21": `
  <h3>Version 2.21</h3>
  <ul>
    <li>Added a new top-left account badge with profile picture, username, and cloud sync status.</li>
    <li>Signed-out players now see a simple Log In / Sign Up button instead of the profile dropdown.</li>
    <li>Improved account sync safety so logging into an existing account no longer overwrites cloud progress with browser test data on load.</li>
    <li>New account signups can still carry over local progress, but existing account logins now prioritize the cloud save.</li>
    <li>Fixed major performance issues caused by repeated logo clicking.</li>
    <li>Logo click progress now saves after a delay instead of after every click.</li>
    <li>Improved mobile sound effect behavior and reduced delayed/cut-off playback.</li>
    <li>Added support for special logo click milestone sound effects.</li>
    <li>Leaderboard now properly handles ties, so equal scores share the same placement.</li>
    <li>About page navigation now opens one section at a time and scrolls directly to it.</li>
    <li>Clicking the version number now opens the About page directly to What’s New.</li>
    <li>Fixed sticky footer/header layout issues in the About and Leaderboard modals.</li>
    <li>Improved save syncing behavior for certain stats and achievement-related progress.</li>
  </ul>
`,
  "2.2": `
  <h3>Version 2.2</h3>
  <ul>
    <li>Added global leaderboards to track player performance across Daily, Bonus, and Endless modes.</li>
    <li>Introduced a new Profile system for signed-in players.</li>
    <li>Profiles display username, email, profile picture, stats, favorite song, and favorite album.</li>
    <li>Added favorite song selection using a searchable dropdown of all Thundle songs.</li>
    <li>Added favorite album selection featuring artwork from the 4 main ThunderPunch! releases.</li>
    <li>Added expanded player stats, including Daily Wins, Bonus Wins, Daily Streak, Achievements, Endless mode bests, and Logo Clicks.</li>
    <li>Added a new hidden Rare achievement.</li>
    <li>Improved modal layouts and overall UI polish across the game.</li>
    <li>Fixed various bugs related to accounts, achievements, and profile behavior.</li>
  </ul>
`,
  "2.1": `
    <h3>Version 2.1</h3>
    <ul>
      <li>Added a full Achievements system with multiple categories, rarities, hidden achievements, progress tracking, and unlock notifications.</li>
      <li>Added account support with username, email, and password authentication.</li>
      <li>Added cloud save syncing for stats, achievements, daily progress, and Endless data.</li>
      <li>Added visible account status, sync status, and manual cloud sync options to the menu.</li>
      <li>Expanded the About section with dedicated panels for the band, developer, how to play, achievements, accounts and saves, coming soon, what’s new, privacy, and feedback.</li>
      <li>Added a versioned What’s New system with support for multiple update tabs.</li>
      <li>Improved the results flow with better Bonus Song integration, Spotify links, album art reveal, and play button overlays.</li>
      <li>Updated the Thundle logo with a brighter stylized text treatment, lightning flicker, click zap effects, and spark particles.</li>
      <li>Improved header layout and responsiveness, including logo sizing and menu placement polish.</li>
      <li>Added general visual polish, smoother animations, and overall UI improvements across the game.</li>
    </ul>
  `,
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

  showWhatsNewVersion("2.2");
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

  const tab22 = document.getElementById("whatsNewTab22");
  const tab21 = document.getElementById("whatsNewTab21");
  const tab201 = document.getElementById("whatsNewTab201");
  const tab20 = document.getElementById("whatsNewTab20");
  const tab10 = document.getElementById("whatsNewTab10");

  [tab22, tab21, tab201, tab20, tab10].forEach(btn => btn?.classList.remove("active"));

  if (version === "2.2" && tab22) tab22.classList.add("active");
  if (version === "2.1" && tab21) tab21.classList.add("active");
  if (version === "2.01" && tab201) tab201.classList.add("active");
  if (version === "2.0" && tab20) tab20.classList.add("active");
  if (version === "1.0" && tab10) tab10.classList.add("active");
}

function getDefaultProfile() {
  return { ...DEFAULT_PROFILE };
}

function getProfile() {
  let savedProfile = {};

  try {
    savedProfile = JSON.parse(localStorage.getItem("thundleProfile")) || {};
  } catch {
    savedProfile = {};
  }

  const validAlbumIds = Object.keys(FAVORITE_ALBUMS);
  const songTitles = Array.isArray(songs) ? songs.map(song => song.title) : [];

  return {
    avatar:
      typeof savedProfile.avatar === "string" && savedProfile.avatar
        ? savedProfile.avatar
        : DEFAULT_PROFILE.avatar,

    favoriteSong:
      typeof savedProfile.favoriteSong === "string" &&
      songTitles.includes(savedProfile.favoriteSong)
        ? savedProfile.favoriteSong
        : DEFAULT_PROFILE.favoriteSong,

    favoriteAlbum:
      typeof savedProfile.favoriteAlbum === "string" &&
      validAlbumIds.includes(savedProfile.favoriteAlbum)
        ? savedProfile.favoriteAlbum
        : DEFAULT_PROFILE.favoriteAlbum
  };
}

function saveProfile(profile) {
  localStorage.setItem("thundleProfile", JSON.stringify(profile));
  markLocalSaveUpdated();
  scheduleCloudSave();
}

function getAvatarUrl(avatarId) {
  return AVATAR_PATHS[avatarId] || AVATAR_PATHS.default;
}

function countUnlockedAchievements() {
  return Object.values(achievements || {}).filter(Boolean).length;
}

function getLeaderboardStatsFromLocalState() {
  const stats = getStats();
  const configBests = getEndlessConfigBests();
  const profile = getProfile();

  return {
    avatar: profile.avatar || "default",
    daily_streak: stats.streak || 0,
    daily_wins: stats.wins || 0,
    bonus_wins: stats.bonusWins || 0,
    endless_best_normal_beginning: configBests["guessLimit:6|clipStart:beginning"] || 0,
    endless_best_normal_middle: configBests["guessLimit:6|clipStart:middle"] || 0,
    endless_best_hard_beginning: configBests["guessLimit:1|clipStart:beginning"] || 0,
    endless_best_hard_middle: configBests["guessLimit:1|clipStart:middle"] || 0,
    achievements_unlocked: countUnlockedAchievements()
  };
}

function handleAccountButtonClick() {
  if (currentUser) {
    openProfileModal();
  } else {
    openAuthModal();
  }
}

function getFavoriteAlbumData(albumId) {
  return FAVORITE_ALBUMS[albumId] || FAVORITE_ALBUMS[DEFAULT_PROFILE.favoriteAlbum];
}

function getSortedSongTitles() {
  return Array.isArray(songs)
    ? songs.map(song => song.title).sort((a, b) => a.localeCompare(b))
    : [];
}

function openFavoriteSongDropdown() {
  const dropdown = document.getElementById("favoriteSongDropdown");
  if (!dropdown) return;

  dropdown.style.display = "block";
}

function closeFavoriteSongDropdown() {
  const dropdown = document.getElementById("favoriteSongDropdown");
  if (!dropdown) return;

  dropdown.style.display = "none";
}

function updateFavoriteSongSelectedText(songTitle) {
  const selectedText = document.getElementById("favoriteSongSelectedText");
  if (!selectedText) return;

  selectedText.textContent = songTitle || "No favorite song selected";
}

function renderFavoriteSongDropdown(options) {
  const dropdown = document.getElementById("favoriteSongDropdown");
  const selectedSong = profileDraft?.favoriteSong || "";

  if (!dropdown) return;

  dropdown.innerHTML = "";

  if (!options.length) {
    const empty = document.createElement("div");
    empty.className = "profile-song-option";
    empty.textContent = "No matching songs";
    dropdown.appendChild(empty);
    dropdown.style.display = "block";
    return;
  }

  options.forEach(title => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile-song-option";

    if (title === selectedSong) {
      button.classList.add("is-selected");
    }

    button.textContent = title;
    button.onclick = () => selectFavoriteSong(title);
    dropdown.appendChild(button);
  });

  dropdown.style.display = "block";
}

function populateFavoriteSongPicker() {
  const input = document.getElementById("favoriteSongSearchInput");
  const titles = getSortedSongTitles();
  const selectedSong = profileDraft?.favoriteSong || "";

  if (!input) return;

  favoriteSongSearchResults = [...titles];
  input.value = selectedSong;
  updateFavoriteSongSelectedText(selectedSong);
  renderFavoriteSongDropdown(favoriteSongSearchResults);
  closeFavoriteSongDropdown();
}

function filterFavoriteSongOptions(query) {
  const normalizedQuery = (query || "").trim().toLowerCase();
  const titles = getSortedSongTitles();

  favoriteSongSearchResults = titles.filter(title =>
    title.toLowerCase().includes(normalizedQuery)
  );

  renderFavoriteSongDropdown(favoriteSongSearchResults);
}

function selectFavoriteSong(songTitle) {
  const input = document.getElementById("favoriteSongSearchInput");

  if (!profileDraft) {
    createProfileDraftFromSavedProfile();
  }

  profileDraft.favoriteSong = songTitle;

  if (input) {
    input.value = songTitle;
  }

  updateFavoriteSongSelectedText(songTitle);
  renderFavoriteSongDropdown(getSortedSongTitles());
  closeFavoriteSongDropdown();
  updateProfileSaveCloseButton();
}

function updateFavoriteAlbumUI(albumId) {
  const album = getFavoriteAlbumData(albumId);

  const featuredArt = document.getElementById("profileFavoriteAlbumArt");
  const featuredTitle = document.getElementById("profileFavoriteAlbumTitle");
  const previewArt = document.getElementById("favoriteAlbumDropdownPreviewArt");
  const previewTitle = document.getElementById("favoriteAlbumDropdownPreviewTitle");

  if (featuredArt) {
    featuredArt.src = album.art;
    featuredArt.alt = `${album.title} album art`;
  }

  if (featuredTitle) {
    featuredTitle.textContent = album.title;
  }

  if (previewArt) {
    previewArt.src = album.art;
    previewArt.alt = `${album.title} album art`;
  }

  if (previewTitle) {
    previewTitle.textContent = album.title;
  }
}

function toggleFavoriteAlbumDropdown() {
  const dropdown = document.getElementById("favoriteAlbumDropdown");
  if (!dropdown) return;

  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function selectFavoriteAlbum(albumId) {
  if (!profileDraft) {
    createProfileDraftFromSavedProfile();
  }

  profileDraft.favoriteAlbum = albumId;
  updateFavoriteAlbumUI(albumId);

  const dropdown = document.getElementById("favoriteAlbumDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }

  updateProfileSaveCloseButton();
}

function createProfileDraftFromSavedProfile() {
  const profile = getProfile();

  profileDraft = {
    favoriteSong: profile.favoriteSong || "",
    favoriteAlbum: profile.favoriteAlbum || DEFAULT_PROFILE.favoriteAlbum
  };
}

function hasProfileChanges() {
  const profile = getProfile();
  if (!profileDraft) return false;

  return (
    (profileDraft.favoriteSong || "") !== (profile.favoriteSong || "") ||
    (profileDraft.favoriteAlbum || DEFAULT_PROFILE.favoriteAlbum) !==
      (profile.favoriteAlbum || DEFAULT_PROFILE.favoriteAlbum)
  );
}

function updateProfileSaveCloseButton() {
  const button = document.getElementById("profileSaveCloseButton");
  if (!button) return;

  button.textContent = hasProfileChanges() ? "Save and Close" : "Close";
}

function handleProfileSaveClose() {
  if (hasProfileChanges()) {
    saveProfileFromModal();
  } else {
    closeProfileModal();
  }
}

function renderProfileModal() {
  const profile = getProfile();
    if (!profileDraft) {
    createProfileDraftFromSavedProfile();
  }
  const stats = getStats();
  const configBests = getEndlessConfigBests();

  const username =
    currentUser?.user_metadata?.username ||
    currentUser?.email ||
    "Unknown user";

  const email = currentUser?.email || "-";

  const avatarImage = document.getElementById("profileAvatarImage");
  const usernameText = document.getElementById("profileUsernameText");
  const emailText = document.getElementById("profileEmailText");

  const dailyWins = document.getElementById("profileStatDailyWins");
  const bonusWins = document.getElementById("profileStatBonusWins");
  const dailyStreak = document.getElementById("profileStatDailyStreak");
  const achievementsText = document.getElementById("profileStatAchievements");
  const logoClicksText = document.getElementById("profileStatLogoClicks");
  const endlessNB = document.getElementById("profileStatEndlessNB");
  const endlessNM = document.getElementById("profileStatEndlessNM");
  const endlessHB = document.getElementById("profileStatEndlessHB");
  const endlessHM = document.getElementById("profileStatEndlessHM");

  if (avatarImage) {
    avatarImage.src = getAvatarUrl(profile.avatar);
  }

  if (usernameText) usernameText.textContent = username;
  if (emailText) emailText.textContent = email;

  if (dailyWins) dailyWins.textContent = String(stats.wins || 0);
  if (bonusWins) bonusWins.textContent = String(stats.bonusWins || 0);
  if (dailyStreak) dailyStreak.textContent = String(stats.streak || 0);
  if (achievementsText) achievementsText.textContent = String(countUnlockedAchievements());
  if (logoClicksText) logoClicksText.textContent = String(totalLogoClickCount || 0);

  if (endlessNB) {
    endlessNB.textContent = String(
      configBests["guessLimit:6|clipStart:beginning"] || 0
    );
  }

  if (endlessNM) {
    endlessNM.textContent = String(
      configBests["guessLimit:6|clipStart:middle"] || 0
    );
  }

  if (endlessHB) {
    endlessHB.textContent = String(
      configBests["guessLimit:1|clipStart:beginning"] || 0
    );
  }

  if (endlessHM) {
    endlessHM.textContent = String(
      configBests["guessLimit:1|clipStart:middle"] || 0
    );
  }

  populateFavoriteSongPicker();
  updateFavoriteAlbumUI(profileDraft.favoriteAlbum || profile.favoriteAlbum);
  updateProfileSaveCloseButton();
}

function handleProfileModalOutsideClicks(event) {
  const songPicker = document.querySelector(".profile-song-picker");

  if (songPicker && !songPicker.contains(event.target)) {
    closeFavoriteSongDropdown();
  }

  const albumButton = document.getElementById("favoriteAlbumDropdownButton");
  const albumDropdown = document.getElementById("favoriteAlbumDropdown");

  if (
    albumButton &&
    albumDropdown &&
    !albumButton.contains(event.target) &&
    !albumDropdown.contains(event.target)
  ) {
    albumDropdown.style.display = "none";
  }
}

function openProfileModal() {
  if (!currentUser) {
    openAuthModal();
    return;
  }

  closeTopMenu();

  const modal = document.getElementById("profileModal");
  if (!modal) return;

  createProfileDraftFromSavedProfile();
  renderProfileModal();

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeProfileModal() {
  const modal = document.getElementById("profileModal");
  if (!modal) return;

  const dropdown = document.getElementById("favoriteAlbumDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }

  closeFavoriteSongDropdown();

  modal.classList.remove("is-open");

    setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
    profileDraft = null;
  }, 200);
}

function saveProfileFromModal() {
  const currentProfile = getProfile();
  const validSongTitles = getSortedSongTitles();

  if (!profileDraft) {
    closeProfileModal();
    return;
  }

  const favoriteSong = validSongTitles.includes(profileDraft.favoriteSong)
    ? profileDraft.favoriteSong
    : currentProfile.favoriteSong;

  const updatedProfile = {
    ...currentProfile,
    favoriteSong,
    favoriteAlbum: profileDraft.favoriteAlbum || currentProfile.favoriteAlbum
  };

  saveProfile(updatedProfile);
  closeProfileModal();
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

function openAchievementsModal() {
  const modal = document.getElementById("achievementsModal");
  if (!modal) return;

  renderAchievementsModal();

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeAchievementsModal() {
  const modal = document.getElementById("achievementsModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function openLeaderboardModal() {
  closeTopMenu();

  const modal = document.getElementById("leaderboardModal");
  if (!modal) return;

  const select = document.getElementById("leaderboardSort");
  if (select) {
    select.value = leaderboardSortKey;
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });

  loadLeaderboard();
}

function closeLeaderboardModal() {
  const modal = document.getElementById("leaderboardModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function changeLeaderboardSort(value) {
  leaderboardSortKey = value;
  loadLeaderboard();
}

function formatLeaderboardStatLabel(key) {
  const labels = {
    daily_streak: "Daily Streak",
    daily_wins: "Daily Wins",
    bonus_wins: "Bonus Wins",
    endless_best_normal_beginning: "Endless NB",
    endless_best_normal_middle: "Endless NM",
    endless_best_hard_beginning: "Endless HB",
    endless_best_hard_middle: "Endless HM",
    achievements_unlocked: "Achievements"
  };

  return labels[key] || key;
}

async function loadLeaderboard() {
  const status = document.getElementById("leaderboardStatus");
  const list = document.getElementById("leaderboardList");

  if (!status || !list) return;

  status.textContent = "Loading leaderboard...";
  list.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("game_saves")
    .select(`
      username,
      avatar,
      daily_streak,
      daily_wins,
      bonus_wins,
      endless_best_normal_beginning,
      endless_best_normal_middle,
      endless_best_hard_beginning,
      endless_best_hard_middle,
      achievements_unlocked
    `)
    .order(leaderboardSortKey, { ascending: false })
    .limit(100);

  if (error) {
    console.error("Leaderboard load error:", error);
    status.textContent = "Failed to load leaderboard.";
    return;
  }

  if (!data || data.length === 0) {
  status.textContent = "No leaderboard data yet.";
  return;
}

const filteredRows = data.filter(row => (row?.[leaderboardSortKey] ?? 0) > 0);

if (filteredRows.length === 0) {
  status.textContent = `No players have a score for ${formatLeaderboardStatLabel(leaderboardSortKey)} yet.`;
  return;
}

status.textContent = `Sorted by ${formatLeaderboardStatLabel(leaderboardSortKey)}`;
renderLeaderboardRows(filteredRows);
}

function renderLeaderboardRows(rows) {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  list.innerHTML = "";

  const currentUsername = (currentUser?.user_metadata?.username || "").trim().toLowerCase();

  let previousScore = null;
  let displayRank = 0;

  rows.forEach((row, index) => {
    const score = Number(row?.[leaderboardSortKey] ?? 0);

    if (previousScore === null || score !== previousScore) {
      displayRank = index + 1;
      previousScore = score;
    }

    const rowUsername = (row.username || "").trim().toLowerCase();
    const isYou = !!currentUsername && rowUsername === currentUsername;
    const isDev = row.username === "DEV_CoachLoaf";

    const item = document.createElement("div");
    item.className = "leaderboard-row";

    if (isYou) {
      item.classList.add("leaderboard-row-you");
    }

    if (displayRank === 1) item.classList.add("leaderboard-row-gold");
    if (displayRank === 2) item.classList.add("leaderboard-row-silver");
    if (displayRank === 3) item.classList.add("leaderboard-row-bronze");

    item.innerHTML = `
      <div class="leaderboard-rank">#${displayRank}</div>

      <img
        class="leaderboard-avatar"
        src="${getAvatarUrl(row.avatar || "default")}"
        alt="${row.username || "Player"} avatar"
      />

      <div class="leaderboard-main">
        <div class="leaderboard-top-row">
          <div class="leaderboard-username-row">
            <div class="leaderboard-username ${isDev ? "leaderboard-dev" : ""}">
              ${row.username || "Unknown Player"}
              ${isDev ? `<span class="leaderboard-dev-badge">⚡ DEV</span>` : ""}
            </div>
            ${isYou ? `<span class="leaderboard-you-badge">You</span>` : ""}
          </div>

          <div class="leaderboard-highlight">
            ${score}
          </div>
        </div>

        <div class="leaderboard-stats-grid">
          <span class="${leaderboardSortKey === "daily_wins" ? "leaderboard-stat-active" : ""}">
            <strong>Daily:</strong> ${row.daily_wins ?? 0}
          </span>

          <span class="${leaderboardSortKey === "bonus_wins" ? "leaderboard-stat-active" : ""}">
            <strong>Bonus:</strong> ${row.bonus_wins ?? 0}
          </span>

          <span class="${leaderboardSortKey === "daily_streak" ? "leaderboard-stat-active" : ""}">
            <strong>Streak:</strong> ${row.daily_streak ?? 0}
          </span>

          <span class="${leaderboardSortKey === "endless_best_normal_beginning" ? "leaderboard-stat-active" : ""}">
            <strong>ENB:</strong> ${row.endless_best_normal_beginning ?? 0}
          </span>

          <span class="${leaderboardSortKey === "endless_best_normal_middle" ? "leaderboard-stat-active" : ""}">
            <strong>ENM:</strong> ${row.endless_best_normal_middle ?? 0}
          </span>

          <span class="${leaderboardSortKey === "endless_best_hard_beginning" ? "leaderboard-stat-active" : ""}">
            <strong>EHB:</strong> ${row.endless_best_hard_beginning ?? 0}
          </span>

          <span class="${leaderboardSortKey === "endless_best_hard_middle" ? "leaderboard-stat-active" : ""}">
            <strong>EHM:</strong> ${row.endless_best_hard_middle ?? 0}
          </span>

          <span class="${leaderboardSortKey === "achievements_unlocked" ? "leaderboard-stat-active" : ""}">
            <strong>Ach.:</strong> ${row.achievements_unlocked ?? 0}
          </span>
        </div>
      </div>
    `;

    list.appendChild(item);
  });
}

function openAboutModal() {
  const modal = document.getElementById("aboutModal");
  if (!modal) return;

  showAboutWhatsNewVersion("2.21");

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });

  closeTopMenu();
}

function closeAboutModal() {
  const modal = document.getElementById("aboutModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function openAboutAndFocusSection(sectionId) {
  openAboutModal();

  setTimeout(() => {
    toggleAboutSection(sectionId, true);
  }, 220);
}

function toggleAboutSection(sectionId, forceOpen = null) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const allSections = document.querySelectorAll(".about-section-panel");
  const shouldOpen = forceOpen === null ? !section.classList.contains("is-open") : forceOpen;

  allSections.forEach(panel => {
    if (panel.id === sectionId) {
      panel.classList.toggle("is-open", shouldOpen);
    } else {
      panel.classList.remove("is-open");
    }
  });

  if (shouldOpen) {
    setTimeout(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 40);
  }
}

function showAboutWhatsNewVersion(version) {
  const content = document.getElementById("aboutWhatsNewContent");
  if (!content) return;

  content.innerHTML = WHATS_NEW_CONTENT[version] || "<p>No update notes yet.</p>";

  const tab221 = document.getElementById("aboutWhatsNewTab221");
  const tab22 = document.getElementById("aboutWhatsNewTab22");
  const tab21 = document.getElementById("aboutWhatsNewTab21");
  const tab201 = document.getElementById("aboutWhatsNewTab201");
  const tab20 = document.getElementById("aboutWhatsNewTab20");
  const tab10 = document.getElementById("aboutWhatsNewTab10");

  [tab221, tab22, tab21, tab201, tab20, tab10].forEach(btn => btn?.classList.remove("active"));

  if (version === "2.21" && tab221) tab221.classList.add("active");
  if (version === "2.2" && tab22) tab22.classList.add("active");
  if (version === "2.1" && tab21) tab21.classList.add("active");
  if (version === "2.01" && tab201) tab201.classList.add("active");
  if (version === "2.0" && tab20) tab20.classList.add("active");
  if (version === "1.0" && tab10) tab10.classList.add("active");
}

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;

  switchAuthMode(authMode);
  setAuthMessage("");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function openWelcomeModal() {
  const modal = document.getElementById("welcomeModal");
  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modal.classList.remove("is-open");
  void modal.offsetWidth;

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

function closeWelcomeModal() {
  const modal = document.getElementById("welcomeModal");
  if (!modal) return;

  modal.classList.remove("is-open");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 200);
}

function markWelcomeSeen() {
  localStorage.setItem(WELCOME_MODAL_SEEN_KEY, "true");
}

function hasSeenWelcomeModal() {
  return localStorage.getItem(WELCOME_MODAL_SEEN_KEY) === "true";
}

function continueAsGuest() {
  markWelcomeSeen();
  closeWelcomeModal();
}

function beginWelcomeAuth() {
  markWelcomeSeen();
  closeWelcomeModal();
  openAuthModal();
}

function maybeShowWelcomeModal() {
  if (currentUser) return;
  if (hasSeenWelcomeModal()) return;

  openWelcomeModal();
}

function showWelcomeBackBanner() {
  if (!currentUser || welcomeBackShownThisLoad) return;

  const banner = document.getElementById("welcomeBackBanner");
  if (!banner) return;

  const username =
    currentUser.user_metadata?.username ||
    currentUser.email ||
    "friend";

  welcomeBackShownThisLoad = true;
  banner.textContent = `Welcome back, ${username}!`;

  banner.classList.remove("show");
  void banner.offsetWidth;
  banner.classList.add("show");
  spawnWelcomeSparkles();

  setTimeout(() => {
  banner.classList.remove("show");
}, 2600);
}

function spawnWelcomeSparkles() {
  const container = document.getElementById("sparkleContainer");
  const banner = document.getElementById("welcomeBackBanner");
  if (!container || !banner) return;

  const rect = banner.getBoundingClientRect();

  const sparkleCount = 6;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = "✦";

    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    sparkle.style.animationDelay = `${Math.random() * 200}ms`;

    container.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }
}

function switchAuthMode(mode) {
  authMode = mode;

  const loginTab = document.getElementById("authTabLogin");
  const signupTab = document.getElementById("authTabSignup");
  const submitButton = document.getElementById("authSubmitButton");
  const usernameInput = document.getElementById("authUsername");
  const usernameLabel = document.getElementById("authUsernameLabel");

  if (loginTab) loginTab.classList.toggle("active", mode === "login");
  if (signupTab) signupTab.classList.toggle("active", mode === "signup");
  if (submitButton) submitButton.textContent = mode === "login" ? "Log In" : "Sign Up";

  const showUsername = mode === "signup";
  if (usernameInput) usernameInput.style.display = showUsername ? "block" : "none";
  if (usernameLabel) usernameLabel.style.display = showUsername ? "block" : "none";

  setAuthMessage("");
}

function setAuthMessage(message) {
  const el = document.getElementById("authMessage");
  if (el) {
    el.textContent = message;
  }
}

async function submitAuth() {
  const username = document.getElementById("authUsername")?.value.trim() || "";
  const email = document.getElementById("authEmail")?.value.trim() || "";
  const password = document.getElementById("authPassword")?.value || "";

  if (!email || !password) {
    setAuthMessage("Enter your email and password.");
    return;
  }

  if (authMode === "signup" && !username) {
    setAuthMessage("Enter a username.");
    return;
  }

  setAuthMessage(authMode === "login" ? "Logging in..." : "Creating account...");

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) throw error;

      currentUser = data.user || null;
      saveProfile(getDefaultProfile());
      markWelcomeSeen();
      await refreshAuthUI();
      await syncSaveDataAfterLogin({ allowLocalSeed: true });
      closeAuthModal();
      showWelcomeBackBanner();
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user || null;
    markWelcomeSeen();
    await refreshAuthUI();
    await syncSaveDataAfterLogin({ allowLocalSeed: false });
    closeAuthModal();
    showWelcomeBackBanner();
  } catch (error) {
    console.error("Auth error:", error);
    setAuthMessage(error.message || "Something went wrong.");
  }
}


function resetToFreshGuestState() {
  stopCurrentAudio();
  stopResultPreviewAudio();
  stopMainRevealAudio();
  closeModal();
  closeRestartConfirmModal();
  closeSettingsModal();
  closeWhatsNewModal();
  closeAchievementsModal();
  closeAuthModal();

  localStorage.removeItem("thundleStats");
  localStorage.removeItem("thundleProgress");
  localStorage.removeItem("thundleEndlessProgress");
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  localStorage.removeItem(ENDLESS_CONFIG_BESTS_KEY);
  localStorage.removeItem("thundleEndlessBest");
  localStorage.removeItem("thundleCloudSaveUpdatedAt");
  localStorage.removeItem("thundleLocalSaveUpdatedAt");

  achievements = {};
  achievementProgress = {};
  endlessBest = 0;
  endlessScore = 0;
  endlessCurrentSong = null;
  endlessCurrentStartTime = 0;
  endlessQueue = [];
  endlessUsedIndices = [];
  endlessNewBestCelebrated = false;
  endlessSettings = {
    guessLimit: 6,
    clipStart: "beginning"
  };

  gameMode = "daily";
  songIndex = 0;
  guessNumber = 0;
  guessHistory = [[], []];
  bonusStarted = false;
  gameFinished = false;
  waveformPreviewShown = false;

  const endlessSetupCard = document.getElementById("endlessSetupCard");
  const gameCard = document.getElementById("game");
  const nextCard = document.getElementById("countdownCard");
  const showResultsSection = document.getElementById("showResultsSection");
  const mainBonusButton = document.getElementById("mainBonusButton");

  if (endlessSetupCard) endlessSetupCard.style.display = "none";
  if (gameCard) gameCard.style.display = "block";
  if (nextCard) nextCard.style.display = "block";
  if (showResultsSection) showResultsSection.style.display = "none";
  if (mainBonusButton) mainBonusButton.style.display = "none";

  document.getElementById("songLabel").innerText = "Song #1";
  document.getElementById("roundHint").innerText = "Starts at the beginning of the track.";
  document.getElementById("feedback").innerText = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessInput").disabled = false;
  document.getElementById("guessButton").disabled = false;
  document.getElementById("playButton").disabled = false;
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("artWrap").style.display = "none";

  hideEndlessActionButtons();
  hideWaveformPreviewMarker();

  pickDailySongs();
  preloadTodaySongs();
  showPuzzleNumber();
  renderAttemptRow();

  updateModeButtons();
  updateEndlessSetupBestText();
  updateEndlessRunCounter();
  updateEndlessRestartButton();
  renderAchievementsModalIfOpen();
  updateGuestCloudBadge();

  const banner = document.getElementById("welcomeBackBanner");
if (banner) {
  banner.classList.remove("show");
}
}

async function logoutAccount() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    currentUser = null;
welcomeBackShownThisLoad = false;
isSyncingNow = false;
lastSuccessfulSyncAt = "";
setSyncStatus("No cloud sync");

resetToFreshGuestState();

await refreshAuthUI();
closeTopMenu();
maybeShowWelcomeModal();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

async function refreshAuthUI() {
  const statusText = document.getElementById("accountStatusText");
  const buttonText = document.getElementById("accountButtonText");
  const logoutButton = document.getElementById("logoutMenuButton");
  const syncButton = document.getElementById("syncNowMenuButton");

  const { data, error } = await supabaseClient.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") {
    console.error("Get user error:", error);
  }

  currentUser = data?.user || null;

  if (currentUser) {
  const username =
    currentUser.user_metadata?.username ||
    currentUser.email ||
    "Signed in";

  if (statusText) statusText.textContent = `Signed in as ${username}`;
  if (buttonText) buttonText.textContent = "Profile";
  if (logoutButton) logoutButton.style.display = "flex";
  if (syncButton) syncButton.style.display = "flex";
} else {
  if (statusText) statusText.textContent = "Not signed in";
  if (buttonText) buttonText.textContent = "Sign Up / Log In";
  if (logoutButton) logoutButton.style.display = "none";
  if (syncButton) syncButton.style.display = "none";
  lastSuccessfulSyncAt = "";
  syncStatus = "No cloud sync";
}

updateSyncStatusUI();
updateTopbarAccountUI();
}

function getLocalSaveTimestamp() {
  return localStorage.getItem("thundleLocalSaveUpdatedAt") || "";
}

function setLocalSaveTimestamp(value) {
  if (value) {
    localStorage.setItem("thundleLocalSaveUpdatedAt", value);
  } else {
    localStorage.removeItem("thundleLocalSaveUpdatedAt");
  }
}

function getCloudSaveTimestamp() {
  return localStorage.getItem("thundleCloudSaveUpdatedAt") || "";
}

function setCloudSaveTimestamp(value) {
  if (value) {
    localStorage.setItem("thundleCloudSaveUpdatedAt", value);
  } else {
    localStorage.removeItem("thundleCloudSaveUpdatedAt");
  }
}

function markLocalSaveUpdated() {
  setLocalSaveTimestamp(new Date().toISOString());

  if (currentUser && !applyingCloudSave) {
    setSyncStatus("Local changes not yet synced");
  }
}

function resetLocalStateForCloudAccount() {
  applyingCloudSave = true;

  try {
    stopCurrentAudio();
    stopResultPreviewAudio();
    stopMainRevealAudio();

    localStorage.setItem("thundleStats", JSON.stringify(getDefaultStats()));
    localStorage.removeItem("thundleProgress");
    localStorage.removeItem("thundleEndlessProgress");
    localStorage.setItem("thundleProfile", JSON.stringify(getDefaultProfile()));
    localStorage.setItem(
      STORAGE_KEYS.ACHIEVEMENTS,
      JSON.stringify({
        unlocked: {},
        progress: {}
      })
    );
    localStorage.setItem(ENDLESS_CONFIG_BESTS_KEY, JSON.stringify({}));
    localStorage.setItem("thundleEndlessBest", "0");

    setLocalSaveTimestamp("");
    setCloudSaveTimestamp("");
    lastSuccessfulSyncAt = "";

    achievements = {};
    achievementProgress = {};
    endlessBest = 0;
    endlessScore = 0;
    endlessCurrentSong = null;
    endlessCurrentStartTime = 0;
    endlessQueue = [];
    endlessUsedIndices = [];
    endlessNewBestCelebrated = false;
    endlessSettings = {
      guessLimit: 6,
      clipStart: "beginning"
    };

    gameMode = "daily";
    songIndex = 0;
    guessNumber = 0;
    guessHistory = [[], []];
    bonusStarted = false;
    gameFinished = false;
    waveformPreviewShown = false;

    const endlessSetupCard = document.getElementById("endlessSetupCard");
    const gameCard = document.getElementById("game");
    const nextCard = document.getElementById("countdownCard");
    const showResultsSection = document.getElementById("showResultsSection");
    const mainBonusButton = document.getElementById("mainBonusButton");

    if (endlessSetupCard) endlessSetupCard.style.display = "none";
    if (gameCard) gameCard.style.display = "block";
    if (nextCard) nextCard.style.display = "block";
    if (showResultsSection) showResultsSection.style.display = "none";
    if (mainBonusButton) mainBonusButton.style.display = "none";

    document.getElementById("songLabel").innerText = "Song #1";
    document.getElementById("roundHint").innerText = "Starts at the beginning of the track.";
    document.getElementById("feedback").innerText = "";
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessButton").disabled = false;
    document.getElementById("suggestions").innerHTML = "";
    document.getElementById("artWrap").style.display = "none";

    hideEndlessActionButtons();
    hideWaveformPreviewMarker();

    pickDailySongs();
    preloadTodaySongs();
    showPuzzleNumber();
    renderAttemptRow();
    updateModeButtons();
    updateEndlessSetupBestText();
    updateEndlessRunCounter();
    updateEndlessRestartButton();
    renderAchievementsModalIfOpen();
    renderProfileModalIfOpen();
    updateTopbarAccountUI();
  } finally {
    applyingCloudSave = false;
  }
}

function getLocalSaveBundle() {
  return {
    stats: getStats(),
    profile: getProfile(),
    dailyProgress: getProgress(),
    endlessProgress: getEndlessProgress(),
    achievements: {
      unlocked: achievements,
      progress: achievementProgress
    },
    endlessConfigBests: getEndlessConfigBests(),
    updatedAt: getLocalSaveTimestamp() || ""
  };
}

function applyFullSaveData(saveData) {
  if (!saveData || typeof saveData !== "object") return;

  applyingCloudSave = true;

  try {
    if (saveData.stats) {
      localStorage.setItem("thundleStats", JSON.stringify(saveData.stats));
    }

    if (saveData.dailyProgress) {
      localStorage.setItem("thundleProgress", JSON.stringify(saveData.dailyProgress));
    }

    if (saveData.endlessProgress) {
      localStorage.setItem("thundleEndlessProgress", JSON.stringify(saveData.endlessProgress));
    }

    if (saveData.profile) {
      localStorage.setItem("thundleProfile", JSON.stringify(saveData.profile));
    }

    if (saveData.achievements) {
      localStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          unlocked: saveData.achievements.unlocked || {},
          progress: saveData.achievements.progress || {}
        })
      );
    }

    if (saveData.endlessConfigBests) {
      localStorage.setItem(
        ENDLESS_CONFIG_BESTS_KEY,
        JSON.stringify(saveData.endlessConfigBests)
      );
    }

    if (saveData.updatedAt) {
      setCloudSaveTimestamp(saveData.updatedAt);
      setLocalSaveTimestamp(saveData.updatedAt);
      lastSuccessfulSyncAt = saveData.updatedAt;
    }

    loadAchievements();

    endlessBest = Number(localStorage.getItem("thundleEndlessBest")) || getEndlessProgress().endlessBest || 0;

    if (gameMode === "endless") {
      const restored = loadEndlessProgressIfAvailable();
      if (!restored) {
        gameMode = "daily";
        pickDailySongs();
        preloadTodaySongs();
        showPuzzleNumber();
        renderAttemptRow();
        loadProgressIfAvailable();
      }
    } else {
      pickDailySongs();
      preloadTodaySongs();
      showPuzzleNumber();
      renderAttemptRow();
      loadProgressIfAvailable();
    }

    updateEndlessSetupBestText();
    updateEndlessRunCounter();
    renderAchievementsModalIfOpen();
    reconcileAchievementsFromCurrentState();
      const profileModal = document.getElementById("profileModal");
  if (profileModal && profileModal.style.display === "flex") {
    renderProfileModal();
    updateTopbarAccountUI();
  }
  } finally {
    applyingCloudSave = false;
  }
}

function renderAchievementsModalIfOpen() {
  const modal = document.getElementById("achievementsModal");
  if (modal && modal.style.display === "flex") {
    renderAchievementsModal();
  }
}

function setSyncStatus(message) {
  syncStatus = message;
  updateSyncStatusUI();
}

function formatTimeAgo(isoString) {
  if (!isoString) return "Never";

  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function updateSyncStatusUI() {
  const syncText = document.getElementById("syncStatusText");
  const syncButton = document.getElementById("syncNowMenuButton");

  const profileMenuSyncText = document.getElementById("profileMenuSyncText");
  const profileMenuSyncNowButton = document.getElementById("profileMenuSyncNowButton");
  const topbarSyncText = document.getElementById("topbarSyncText");

  let syncMessage = "No cloud sync";
  let topbarMessage = "";
  let showSyncButton = false;

  if (currentUser) {
    showSyncButton = true;

    if (isSyncingNow) {
      syncMessage = "Syncing...";
      topbarMessage = "Cloud syncing...";
    } else if (lastSuccessfulSyncAt) {
      syncMessage = `Last synced ${formatTimeAgo(lastSuccessfulSyncAt)}`;
      topbarMessage = `Cloud synced ${formatTimeAgo(lastSuccessfulSyncAt)}`;
    } else {
      syncMessage = syncStatus || "Cloud sync ready";
      topbarMessage = "Cloud save enabled";
    }
  }

  if (syncText) syncText.textContent = syncMessage;
  if (profileMenuSyncText) profileMenuSyncText.textContent = syncMessage;
  if (topbarSyncText) topbarSyncText.textContent = topbarMessage;

  if (syncButton) syncButton.style.display = showSyncButton ? "flex" : "none";
  if (profileMenuSyncNowButton) profileMenuSyncNowButton.style.display = showSyncButton ? "flex" : "none";

  updateGuestCloudBadge();
}

function updateTopbarAccountUI() {
  const profileChipWrap = document.getElementById("profileChipWrap");
  const guestAuthButton = document.getElementById("guestAuthButton");
  const profileMenuDropdown = document.getElementById("profileMenuDropdown");

  const topbarAvatarImage = document.getElementById("topbarAvatarImage");
  const topbarUsernameText = document.getElementById("topbarUsernameText");

  const profileMenuAccountText = document.getElementById("profileMenuAccountText");
  const profileMenuAccountButton = document.getElementById("profileMenuAccountButton");
  const profileMenuAccountButtonText = document.getElementById("profileMenuAccountButtonText");
  const profileMenuProfileButton = document.getElementById("profileMenuProfileButton");
  const profileMenuLogoutButton = document.getElementById("profileMenuLogoutButton");
  const profileMenuDevResetButton = document.getElementById("profileMenuDevResetButton");

  const profile = getProfile();
  const avatarKey = profile?.avatar || "default";
  const avatarUrl = getAvatarUrl(avatarKey);

  if (topbarAvatarImage) {
    topbarAvatarImage.src = avatarUrl;
  }

  if (!currentUser) {
    closeProfileMenu();

    if (profileChipWrap) profileChipWrap.style.display = "none";
    if (guestAuthButton) guestAuthButton.style.display = "flex";
    if (profileMenuDropdown) profileMenuDropdown.style.display = "none";

    if (topbarUsernameText) topbarUsernameText.textContent = "";
    if (profileMenuAccountText) profileMenuAccountText.textContent = "Not signed in";
    if (profileMenuAccountButtonText) profileMenuAccountButtonText.textContent = "Sign Up / Log In";

    if (profileMenuProfileButton) profileMenuProfileButton.style.display = "none";
    if (profileMenuLogoutButton) profileMenuLogoutButton.style.display = "none";
    if (profileMenuDevResetButton) profileMenuDevResetButton.style.display = "none";
    if (profileMenuAccountButton) profileMenuAccountButton.style.display = "flex";

    updateSyncStatusUI();
    return;
  }

  const username =
    currentUser.user_metadata?.username ||
    currentUser.email ||
    "Player";

  if (profileChipWrap) profileChipWrap.style.display = "flex";
  if (guestAuthButton) guestAuthButton.style.display = "none";

  if (topbarUsernameText) topbarUsernameText.textContent = username;
  if (profileMenuAccountText) profileMenuAccountText.textContent = `Signed in as ${username}`;
  if (profileMenuAccountButtonText) profileMenuAccountButtonText.textContent = "Manage Account";

  if (profileMenuProfileButton) profileMenuProfileButton.style.display = "flex";
  if (profileMenuLogoutButton) profileMenuLogoutButton.style.display = "flex";
  if (profileMenuDevResetButton) {
    profileMenuDevResetButton.style.display = username === "DEV_CoachLoaf" ? "flex" : "none";
  }

  if (profileMenuAccountButton) profileMenuAccountButton.style.display = "none";

  updateSyncStatusUI();
}

function updateGuestCloudBadge() {
  const badge = document.getElementById("cloudBadge");
  if (!badge) return;

  if (!currentUser) {
    badge.textContent = "Playing as guest";
    return;
  }

  if (isSyncingNow) {
    badge.textContent = "Cloud sync in progress...";
    return;
  }

  if (lastSuccessfulSyncAt) {
    badge.textContent = `Cloud synced ${formatTimeAgo(lastSuccessfulSyncAt)}`;
    return;
  }

  badge.textContent = "Cloud save enabled";
}

function startSyncStatusTicker() {
  setInterval(() => {
    if (currentUser && !isSyncingNow && lastSuccessfulSyncAt) {
      updateSyncStatusUI();
    }
  }, 1000);
}

async function manualCloudSync() {
  if (!currentUser || isSyncingNow) return;
  await saveToCloud(true);
}

async function loadCloudSave() {
  if (!currentUser) return null;

  const { data, error } = await supabaseClient
    .from("game_saves")
    .select(`
      username,
      email,
      daily_streak,
      daily_wins,
      bonus_wins,
      achievements_unlocked,
      save_data,
      updated_at
    `)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Cloud load error:", error);
    return null;
  }

  if (!data) return null;

  const mergedSaveData = {
    ...(data.save_data || {})
  };

  const mergedStats = {
    ...getDefaultStats(),
    ...(mergedSaveData.stats || {})
  };

  mergedStats.wins = Math.max(mergedStats.wins || 0, Number(data.daily_wins || 0));
  mergedStats.bonusWins = Math.max(mergedStats.bonusWins || 0, Number(data.bonus_wins || 0));
  mergedStats.streak = Math.max(mergedStats.streak || 0, Number(data.daily_streak || 0));
  mergedStats.best = Math.max(mergedStats.best || 0, mergedStats.streak || 0);

  mergedSaveData.stats = mergedStats;

  return {
    ...mergedSaveData,
    username: data.username || "",
    email: data.email || "",
    updatedAt: data.updated_at || data.save_data?.updatedAt || ""
  };
}

async function saveToCloud(force = false) {
  if (!currentUser || applyingCloudSave || isSyncingNow) return;

  isSyncingNow = true;
  setSyncStatus("Syncing...");

  const saveData = getLocalSaveBundle();
  const timestamp = new Date().toISOString();

  saveData.updatedAt = timestamp;

  const leaderboardStats = getLeaderboardStatsFromLocalState();
const profile = getProfile();

const payload = {
  user_id: currentUser.id,
  username: currentUser.user_metadata?.username || "",
  email: currentUser.email || "",
  avatar: profile.avatar || "default",
  daily_streak: leaderboardStats.daily_streak,
  daily_wins: leaderboardStats.daily_wins,
  bonus_wins: leaderboardStats.bonus_wins,
  endless_best_normal_beginning: leaderboardStats.endless_best_normal_beginning,
  endless_best_normal_middle: leaderboardStats.endless_best_normal_middle,
  endless_best_hard_beginning: leaderboardStats.endless_best_hard_beginning,
  endless_best_hard_middle: leaderboardStats.endless_best_hard_middle,
  achievements_unlocked: leaderboardStats.achievements_unlocked,
  save_data: saveData,
  updated_at: timestamp
};

  const { error } = await supabaseClient
    .from("game_saves")
    .upsert(payload);

  isSyncingNow = false;

  if (error) {
    console.error("Cloud save error:", error);
    setSyncStatus("Sync failed");
    updateTopbarAccountUI();
    updateSyncStatusUI();
    return;
  }

  setLocalSaveTimestamp(timestamp);
  setCloudSaveTimestamp(timestamp);
  lastSuccessfulSyncAt = timestamp;
  setSyncStatus("Synced just now");
  updateTopbarAccountUI();

  if (force) {
    console.log("Cloud save complete");
  }
}

function scheduleCloudSave() {
  if (!currentUser || applyingCloudSave) return;

  clearTimeout(cloudSaveDebounceTimer);
  cloudSaveDebounceTimer = setTimeout(() => {
    saveToCloud();
  }, 600);
}

async function syncSaveDataAfterLogin({ allowLocalSeed = false } = {}) {
  if (!currentUser) return;

  const previousUserId = localStorage.getItem(LAST_AUTH_USER_ID_KEY) || "";
  const switchedAccounts = !!previousUserId && previousUserId !== currentUser.id;
  localStorage.setItem(LAST_AUTH_USER_ID_KEY, currentUser.id);

  const cloudSave = await loadCloudSave();
  const localSave = getLocalSaveBundle();
  const localTimestamp = getLocalSaveTimestamp() || "";

  const hasMeaningfulLocalSave =
    !!localTimestamp &&
    (
      localSave.stats?.played > 0 ||
      localSave.dailyProgress?.guessHistory?.[0]?.length > 0 ||
      localSave.dailyProgress?.guessHistory?.[1]?.length > 0 ||
      localSave.endlessProgress?.endlessScore > 0 ||
      Object.keys(localSave.achievements?.unlocked || {}).length > 0 ||
      Object.keys(localSave.endlessConfigBests || {}).length > 0
    );

  // Existing account login: always trust cloud, never auto-push local on login.
  if (cloudSave) {
    applyFullSaveData(cloudSave);
    reconcileAchievementsFromCurrentState();
    return;
  }

  // Brand-new signup: okay to seed cloud from meaningful local progress.
  if (allowLocalSeed && hasMeaningfulLocalSave && !switchedAccounts) {
    await saveToCloud(true);
    reconcileAchievementsFromCurrentState();
    return;
  }

  // Logged into an account with no cloud save:
  // start that account fresh locally instead of importing browser guest progress.
  resetLocalStateForCloudAccount();
  reconcileAchievementsFromCurrentState();
}

async function devResetAccountProgress() {
  if (!DEV_MODE) return;

  const confirmed = window.confirm("Reset all local and cloud progress for this account?");
  if (!confirmed) return;

  try {
    localStorage.removeItem("thundleStats");
    localStorage.removeItem("thundleProgress");
    localStorage.removeItem("thundleEndlessProgress");
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(ENDLESS_CONFIG_BESTS_KEY);
    localStorage.removeItem("thundleEndlessBest");
    localStorage.removeItem("thundleCloudSaveUpdatedAt");
    localStorage.removeItem("thundleLocalSaveUpdatedAt");
    localStorage.removeItem(WELCOME_MODAL_SEEN_KEY);
    localStorage.removeItem("thundleProfile");

    achievements = {};
    achievementProgress = {};

    if (currentUser) {
      const { error } = await supabaseClient
        .from("game_saves")
        .delete()
        .eq("user_id", currentUser.id);

      if (error) throw error;
    }

    stopCurrentAudio();
    stopResultPreviewAudio();
    stopMainRevealAudio();

    gameMode = "daily";
    endlessScore = 0;
    endlessCurrentSong = null;
    endlessCurrentStartTime = 0;
    endlessQueue = [];
    endlessUsedIndices = [];
    endlessBest = 0;
    endlessNewBestCelebrated = false;
    bonusStarted = false;
    gameFinished = false;
    songIndex = 0;
    guessNumber = 0;
    guessHistory = [[], []];

    pickDailySongs();
    preloadTodaySongs();
    showPuzzleNumber();
    resetRoundState();
    loadProgressIfAvailable();
    updateModeButtons();
    updateEndlessSetupBestText();
    updateEndlessRunCounter();
    renderAchievementsModalIfOpen();

    welcomeBackShownThisLoad = false;
    maybeShowWelcomeModal();

    alert("Dev reset complete.");
    console.log("Dev reset complete.");
  } catch (error) {
    console.error("Dev reset failed:", error);
    alert("Dev reset failed. Check console.");
  }
}

function loadAchievements() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || {};
  achievements = saved.unlocked || {};
  achievementProgress = saved.progress || {};
}

function saveAchievements() {
  localStorage.setItem(
    STORAGE_KEYS.ACHIEVEMENTS,
    JSON.stringify({
      unlocked: achievements,
      progress: achievementProgress
    })
  );
  markLocalSaveUpdated();
  scheduleCloudSave();
}

function unlockAchievement(id) {
  if (achievements[id]) return;

  achievements[id] = true;
  saveAchievements();

  achievementToastQueue.push(id);
  processAchievementToastQueue();
}

function processAchievementToastQueue() {
  if (achievementToastShowing) return;
  if (achievementToastQueue.length === 0) return;

  const nextId = achievementToastQueue.shift();
  achievementToastShowing = true;
  showAchievementToast(nextId);
}

function updateProgress(id, value, max) {
  achievementProgress[id] = value;

  if (value >= max) {
    unlockAchievement(id);
  }

  saveAchievements();
}

function showAchievementToast(id) {
  const achievement = achievementDefinitions.find(a => a.id === id);
  if (!achievement) {
    achievementToastShowing = false;
    processAchievementToastQueue();
    return;
  }

  const toast = document.getElementById("achievementToast");
  const art = document.getElementById("achievementToastArt");
  const title = document.getElementById("achievementToastTitle");
  const description = document.getElementById("achievementToastDescription");

  if (!toast || !art || !title || !description) {
    achievementToastShowing = false;
    processAchievementToastQueue();
    return;
  }

  art.src = achievement.art;
  art.alt = achievement.title;
  title.textContent = achievement.title;
  description.textContent = achievement.description;

  toast.classList.remove(
  "toast-common",
  "toast-uncommon",
  "toast-rare",
  "toast-epic",
  "toast-legendary"
);

toast.classList.add(`toast-${achievement.rarity.toLowerCase()}`);

  playSound(sounds.achievement);
  triggerHaptic([16, 32, 16]);

  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");

  clearTimeout(showAchievementToast._timer);
  showAchievementToast._timer = setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      achievementToastShowing = false;
      processAchievementToastQueue();
    }, 250);
  }, 3000);
}

function incrementAchievementProgress(id, amount, target) {
  const current = achievementProgress[id] || 0;
  updateProgress(id, current + amount, target);
}

function markSongGuessedForDiscography(songTitle) {
  const guessedSongs = achievementProgress.special_discography_songs || [];

  if (!guessedSongs.includes(songTitle)) {
    guessedSongs.push(songTitle);
    achievementProgress.special_discography_songs = guessedSongs;
    saveAchievements();
  }

  updateProgress("special_discography", guessedSongs.length, songs.length);
}

function checkFeaturedAchievements(song) {
  if (!song || !song.title) return;

  const normalizedTitle = song.title.trim().toLowerCase();

  Object.entries(FEATURED_SONGS).forEach(([achievementId, songTitles]) => {
    const hasMatch = songTitles.some(title =>
      title.trim().toLowerCase() === normalizedTitle
    );

    if (hasMatch) {
      unlockAchievement(achievementId);
    }
  });
}

function isHardcoreEndlessMode() {
  return endlessSettings.guessLimit === 1 && endlessSettings.clipStart === "middle";
}

function checkEndlessAchievements() {
  const configBests = getEndlessConfigBests();
  const currentKey = getEndlessConfigKey();
  const currentConfigBest = Math.max(configBests[currentKey] || 0, endlessScore);

  const normalBest = Math.max(
    configBests["guessLimit:6|clipStart:beginning"] || 0,
    configBests["guessLimit:6|clipStart:middle"] || 0,
    endlessSettings.guessLimit === 6 ? endlessScore : 0
  );

  const hardcoreBest = Math.max(
    configBests["guessLimit:1|clipStart:middle"] || 0,
    isHardcoreEndlessMode() ? endlessScore : 0
  );

  updateProgress("endless_5", Math.min(normalBest, 5), 5);
  updateProgress("endless_10", Math.min(normalBest, 10), 10);
  updateProgress("endless_20", Math.min(normalBest, 20), 20);
  updateProgress("endless_30", Math.min(normalBest, 30), 30);
  updateProgress("endless_50", Math.min(normalBest, 50), 50);
  updateProgress("endless_100", Math.min(normalBest, 100), 100);

  updateProgress("endless_hardcore_5", Math.min(hardcoreBest, 5), 5);
  updateProgress("endless_hardcore_10", Math.min(hardcoreBest, 10), 10);
  updateProgress("endless_hardcore_20", Math.min(hardcoreBest, 20), 20);
  updateProgress("endless_hardcore_30", Math.min(hardcoreBest, 30), 30);
  updateProgress("endless_hardcore_50", Math.min(hardcoreBest, 50), 50);
  updateProgress("endless_hardcore_100", Math.min(hardcoreBest, 100), 100);
}
function updateDailyShareStreak() {
  const todayKey = getTodayKeyUTC();
  const lastSharedDate = achievementProgress.sharing_last_date || "";
  let currentShareStreak = achievementProgress.sharing_streak_5 || 0;

  if (lastSharedDate === todayKey) {
    updateProgress("sharing_streak_5", Math.min(currentShareStreak, 5), 5);
    return;
  }

  if (lastSharedDate && isYesterdayUTC(lastSharedDate, todayKey)) {
    currentShareStreak += 1;
  } else {
    currentShareStreak = 1;
  }

  achievementProgress.sharing_last_date = todayKey;
  achievementProgress.sharing_streak_5 = currentShareStreak;
  saveAchievements();

  updateProgress("sharing_streak_5", Math.min(currentShareStreak, 5), 5);
}

function getAchievementTarget(id) {
  const targets = {
    daily_5: 5,
    daily_10: 10,
    daily_50: 50,
    daily_100: 100,
    daily_200: 200,
    daily_365: 365,

    bonus_5: 5,
    bonus_10: 10,
    bonus_50: 50,
    bonus_100: 100,
    bonus_200: 200,
    bonus_365: 365,

    sharing_perfect: 1,
    sharing_streak_5: 5,

    streak_3: 3,
    streak_5: 5,
    streak_7: 7,
    streak_30: 30,
    streak_50: 50,
    streak_100: 100,

    endless_5: 5,
    endless_10: 10,
    endless_20: 20,
    endless_30: 30,
    endless_50: 50,
    endless_100: 100,

    endless_hardcore_5: 5,
    endless_hardcore_10: 10,
    endless_hardcore_20: 20,
    endless_hardcore_30: 30,
    endless_hardcore_50: 50,
    endless_hardcore_100: 100,

    special_discography: songs.length,
    special_perfect_week: 7,
    hidden_lightning_kicks: 100
  };

  return targets[id] || 1;
}

function reconcileAchievementsFromCurrentState() {
  const stats = getStats();
  const todayKey = getTodayKeyUTC();

  // Daily totals
  if (stats.wins >= 1) unlockAchievement("daily_1");
  updateProgress("daily_5", Math.min(stats.wins, 5), 5);
  updateProgress("daily_10", Math.min(stats.wins, 10), 10);
  updateProgress("daily_50", Math.min(stats.wins, 50), 50);
  updateProgress("daily_100", Math.min(stats.wins, 100), 100);
  updateProgress("daily_200", Math.min(stats.wins, 200), 200);
  updateProgress("daily_365", Math.min(stats.wins, 365), 365);

  // Bonus totals
  if (stats.bonusWins >= 1) unlockAchievement("bonus_1");
  updateProgress("bonus_5", Math.min(stats.bonusWins, 5), 5);
  updateProgress("bonus_10", Math.min(stats.bonusWins, 10), 10);
  updateProgress("bonus_50", Math.min(stats.bonusWins, 50), 50);
  updateProgress("bonus_100", Math.min(stats.bonusWins, 100), 100);
  updateProgress("bonus_200", Math.min(stats.bonusWins, 200), 200);
  updateProgress("bonus_365", Math.min(stats.bonusWins, 365), 365);

  // Streaks
  updateProgress("streak_3", Math.min(stats.streak, 3), 3);
  updateProgress("streak_5", Math.min(stats.streak, 5), 5);
  updateProgress("streak_7", Math.min(stats.streak, 7), 7);
  updateProgress("streak_30", Math.min(stats.streak, 30), 30);
  updateProgress("streak_50", Math.min(stats.streak, 50), 50);
  updateProgress("streak_100", Math.min(stats.streak, 100), 100);

  // Endless bests
  const configBests = getEndlessConfigBests();
  const normalBest = Math.max(
    configBests["guessLimit:6|clipStart:beginning"] || 0,
    configBests["guessLimit:6|clipStart:middle"] || 0
  );
  const hardcoreBest = Math.max(
    configBests["guessLimit:1|clipStart:middle"] || 0
  );

  updateProgress("endless_5", Math.min(normalBest, 5), 5);
  updateProgress("endless_10", Math.min(normalBest, 10), 10);
  updateProgress("endless_20", Math.min(normalBest, 20), 20);
  updateProgress("endless_30", Math.min(normalBest, 30), 30);
  updateProgress("endless_50", Math.min(normalBest, 50), 50);
  updateProgress("endless_100", Math.min(normalBest, 100), 100);

  updateProgress("endless_hardcore_5", Math.min(hardcoreBest, 5), 5);
  updateProgress("endless_hardcore_10", Math.min(hardcoreBest, 10), 10);
  updateProgress("endless_hardcore_20", Math.min(hardcoreBest, 20), 20);
  updateProgress("endless_hardcore_30", Math.min(hardcoreBest, 30), 30);
  updateProgress("endless_hardcore_50", Math.min(hardcoreBest, 50), 50);
  updateProgress("endless_hardcore_100", Math.min(hardcoreBest, 100), 100);

  // Existing progress-only achievements
  const shareStreak = achievementProgress.sharing_streak_5 || 0;
  updateProgress("sharing_streak_5", Math.min(shareStreak, 5), 5);

  const perfectWeek = achievementProgress.special_perfect_week || 0;
  updateProgress("special_perfect_week", Math.min(perfectWeek, 7), 7);

  const guessedSongs = achievementProgress.special_discography_songs || [];
  updateProgress("special_discography", Math.min(guessedSongs.length, songs.length), songs.length || 1);

  if (achievements["hidden_lightning_kicks"]) {
  updateProgress("hidden_lightning_kicks", 100, 100);
}

  renderAchievementsModalIfOpen();
}

function renderAchievementsModal() {
  const summary = document.getElementById("achievementsSummary");
  const list = document.getElementById("achievementsList");
  if (!summary || !list) return;

  list.innerHTML = "";

  const sortedAchievements = achievementDefinitions
    .slice()
    .sort((a, b) => a.achievementNumber - b.achievementNumber);

  const unlockedAchievements = sortedAchievements.filter(a => achievements[a.id]);
  const lockedAchievements = sortedAchievements.filter(a => !achievements[a.id]);

  const unlockedCount = unlockedAchievements.length;
  summary.textContent = `${unlockedCount}/${achievementDefinitions.length} unlocked`;

  const sections = [
    { title: "Unlocked", items: unlockedAchievements },
    { title: "Locked", items: lockedAchievements }
  ];

  sections.forEach(sectionData => {
    if (sectionData.items.length === 0) return;

    const section = document.createElement("section");
    section.className = "achievement-category-section";

    const heading = document.createElement("h3");
    heading.className = "achievement-category-heading";
    heading.textContent = sectionData.title;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "achievements-grid";

    sectionData.items.forEach(achievement => {
      const unlocked = !!achievements[achievement.id];
      const hiddenLocked = achievement.hidden && !unlocked;

      const card = document.createElement("div");
      card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}${hiddenLocked ? " hidden-achievement" : ""}`;

      const artWrap = document.createElement("div");
      artWrap.className = "achievement-art-wrap";

      const img = document.createElement("img");
      img.className = `achievement-art${unlocked ? "" : " is-locked-art"}`;
      img.src = achievement.art;
      img.alt = hiddenLocked ? "Hidden achievement" : achievement.title;

      artWrap.appendChild(img);

      if (!unlocked) {
        const overlay = document.createElement("div");
        overlay.className = "achievement-art-overlay";
        overlay.textContent = hiddenLocked ? "?" : "🔒";
        artWrap.appendChild(overlay);
      }

      const body = document.createElement("div");
      body.className = "achievement-card-body";

      const top = document.createElement("div");
      top.className = "achievement-card-top";

      const title = document.createElement("h4");
      title.textContent = hiddenLocked ? "Hidden Achievement" : achievement.title;

      const rarity = document.createElement("span");
      rarity.className = `achievement-rarity rarity-${achievement.rarity.toLowerCase()}`;
      rarity.textContent = achievement.rarity;

      top.appendChild(title);
      top.appendChild(rarity);

      const description = document.createElement("p");
      description.textContent = hiddenLocked
        ? "Keep playing Thundle to unlock!"
        : achievement.description;

      body.appendChild(top);
      body.appendChild(description);

      if (achievement.showProgressBar) {
        const progressWrap = document.createElement("div");
        progressWrap.className = "achievement-progress-wrap";

        const progressBar = document.createElement("div");
        progressBar.className = "achievement-progress-bar";

        const progressFill = document.createElement("div");
        progressFill.className = "achievement-progress-fill";

        const target = getAchievementTarget(achievement.id);
        const current = unlocked
          ? target
          : Math.min(achievementProgress[achievement.id] || 0, target);

        const percent = target > 0 ? (current / target) * 100 : 0;

        progressFill.style.width = `${percent}%`;
        progressBar.appendChild(progressFill);

        const progressText = document.createElement("span");
        progressText.className = "achievement-progress-text";
        progressText.textContent = `${current}/${target}`;

        progressWrap.appendChild(progressBar);
        progressWrap.appendChild(progressText);
        body.appendChild(progressWrap);
      } else {
        const spacer = document.createElement("div");
        spacer.className = "achievement-progress-spacer";
        body.appendChild(spacer);
      }

      card.appendChild(artWrap);
      card.appendChild(body);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    list.appendChild(section);
  });
}

function playSound(sound, options = {}) {
  if (!sound || sfxMuted) return;

  const {
    randomPitch = false,
    pitchMin = 0.96,
    pitchMax = 1.04
  } = options;

  try {
    sound.currentTime = 0;

    if (randomPitch) {
      const variation = pitchMin + Math.random() * (pitchMax - pitchMin);
      sound.playbackRate = variation;
    } else {
      sound.playbackRate = 1;
    }

    sound.play().catch(() => {});
  } catch {}
}

function playPitchedSfx(src, options = {}) {
  if (!src || sfxMuted) return;

  const {
    volumeMultiplier = 1,
    pitchMin = 0.98,
    pitchMax = 1.02
  } = options;

  try {
    const sound = getPooledSfx(src);
    if (!sound) return;

    const variation = pitchMin + Math.random() * (pitchMax - pitchMin);

    sound.pause();
    sound.currentTime = 0;
    sound.playbackRate = variation;
    sound.volume = Math.max(0, Math.min(1, sfxVolume * volumeMultiplier));

    sound.play().catch(() => {});
  } catch {}
}

function triggerHaptic(pattern = 10) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {}
}

Object.values(sounds).forEach(sound => {
  sound.preload = "auto";
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
  .then(songData => {
    songs = songData;
    return fetch("achievements.json");
  })
  .then(r => r.json())
  .then(achievementData => {
    achievementDefinitions = achievementData;

    achievementDefinitions.forEach(a => {
      a.art = `assets/achievements/${a.fileName}`;
    });

    loadAchievements();

    if (!localStorage.getItem("thundleProfile")) {
    saveProfile(getDefaultProfile());
   }
    
    console.log("Achievement definitions loaded:", achievementDefinitions);
    console.log("Unlocked achievements loaded:", achievements);

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
startSyncStatusTicker();
updateTopbarAccountUI();
updateModeButtons();
applySfxVolume();
updateSettingsUI();
updateEndlessSetupBestText();
resetLightningKicksRunState();
refreshDevMenuVisibility();

const devButton = document.getElementById("devResetButton");
if (devButton && !DEV_MODE) {
  devButton.style.display = "none";
}

refreshAuthUI().then(() => {
  if (currentUser) {
    syncSaveDataAfterLogin({ allowLocalSeed: false }).then(() => {
      showWelcomeBackBanner();
    });
  } else {
    reconcileAchievementsFromCurrentState();
    maybeShowWelcomeModal();
  }
});
  })
  .catch(err => {
    console.error("Failed to load game data:", err);
  });

function getDefaultStats() {
  return {
    played: 0,
    wins: 0,
    bonusWins: 0,
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
    bonusWins: Number.isInteger(stats.bonusWins) ? stats.bonusWins : defaults.bonusWins,
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
  markLocalSaveUpdated();
  scheduleCloudSave();
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

function setPlayButtonReadyState(isReady) {
  const button = document.getElementById("playButton");
  const label = document.getElementById("playButtonLabel");

  if (!button || !label) return;

  button.disabled = !isReady;

  if (!isReady) {
    label.textContent = "Loading…";
  } else {
    setPlayButtonState(false);
  }
}

function getCurrentPreloadedAudio() {
  if (gameMode === "endless") {
    return preloadedAudio[0];
  }
  return preloadedAudio[songIndex] || null;
}

function preloadTodaySongs() {
  preloadedAudio = [null, null];
  preloadedAudioReady = [false, false];

  todaySongs.forEach((song, index) => {
    if (!song || !song.file) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = song.file;

    audio.addEventListener("canplaythrough", () => {
      preloadedAudioReady[index] = true;

      if (gameMode === "daily" && songIndex === index) {
        setPlayButtonReadyState(true);
      }
    }, { once: true });

    audio.addEventListener("error", () => {
      preloadedAudioReady[index] = false;
    }, { once: true });

    audio.load();
    preloadedAudio[index] = audio;
  });

  if (gameMode === "daily") {
    setPlayButtonReadyState(false);
  }
}

function preloadEndlessSong(song) {
  preloadedAudio = [null, null];
  endlessPreloadedReady = false;
  setPlayButtonReadyState(false);

  if (!song?.file) return;

  const audio = new Audio();
  audio.preload = "auto";
  audio.src = song.file;

  audio.addEventListener("canplaythrough", () => {
    endlessPreloadedReady = true;
    if (gameMode === "endless" && endlessCurrentSong?.file === song.file) {
      setPlayButtonReadyState(true);
    }
  }, { once: true });

  audio.addEventListener("error", () => {
    endlessPreloadedReady = false;
  }, { once: true });

  audio.load();
  preloadedAudio[0] = audio;
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
  markLocalSaveUpdated();
  scheduleCloudSave();
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

  preloadEndlessSong(endlessCurrentSong);

  saveEndlessProgress();
}

function getRandomMiddleStartTime(duration) {
  const minStart = duration * 0.35;
  const maxStart = duration * 0.7;
  return minStart + Math.random() * (maxStart - minStart);
}

function resetRoundState() {
  stopMainRevealAudio();
  songIndex = 0;
  guessNumber = 0;
  guessHistory = [[], []];
  bonusStarted = false;
  gameFinished = false;

  document.getElementById("feedback").innerText = "";
  document.getElementById("guessInput").value = "";
  document.getElementById("guessInput").disabled = false;
  document.getElementById("guessButton").disabled = false;
  setPlayButtonReadyState(false);
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

  preloadEndlessSong(endlessCurrentSong);

  saveEndlessProgress();
}

function stopCurrentAudio() {
  currentAudioRequestId++;

  if (currentAudio) {
    const audio = currentAudio;
    currentAudio = null;

    try {
      audio.pause();
    } catch {}

    try {
      audio.removeAttribute("src");
      audio.load();
    } catch {}
  }

  stopWaveformLoading();
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
  if (!song || !button) return;

  if (currentAudio && !currentAudio.paused) {
    stopCurrentAudio();
    return;
  }

  const audio = getCurrentPreloadedAudio();
  if (!audio) return;

  if (gameMode === "daily" && !preloadedAudioReady[songIndex]) return;
  if (gameMode === "endless" && !endlessPreloadedReady) return;

  stopCurrentAudio();
  button.disabled = true;
  setPlayButtonLoading();
  startWaveformLoading();

  if (!waveformPreviewShown) {
    showWaveformPreviewMarker();
  }
  updateWaveformPreviewMarker();

  const clipSeconds = CLIPS[Math.min(guessNumber, CLIPS.length - 1)];
  const requestId = ++currentAudioRequestId;
  currentAudio = audio;

  let clipTimeout = null;
  let cleanedUp = false;

  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;

    if (clipTimeout) {
      clearTimeout(clipTimeout);
      clipTimeout = null;
    }

    try {
      audio.pause();
    } catch {}

    stopWaveformLoading();
    stopWaveform();
    setPlayButtonState(false);
    setPlayButtonReadyState(true);

    if (currentAudio === audio) {
      currentAudio = null;
    }
  }

  function getStartTime() {
    let startTime = 0;

    if (gameMode === "daily" && songIndex === 1 && Number.isFinite(audio.duration)) {
      const day = getUTCDayNumber();
      const bonusRng = mulberry32((day + 1) * 999 + 17);
      const minStart = audio.duration * 0.35;
      const maxStart = audio.duration * 0.7;
      startTime = minStart + bonusRng() * (maxStart - minStart);
    }

    if (gameMode === "endless") {
      if (endlessSettings.clipStart === "middle" && Number.isFinite(audio.duration)) {
        if (!endlessCurrentStartTime || endlessCurrentStartTime >= audio.duration) {
          endlessCurrentStartTime = getRandomMiddleStartTime(audio.duration);
        }
        startTime = endlessCurrentStartTime;
      } else {
        endlessCurrentStartTime = 0;
      }
    }

    return Math.max(0, startTime);
  }

  try {
    audio.pause();
    audio.currentTime = getStartTime();
  } catch {
    audio.currentTime = 0;
  }

  audio.play()
    .then(() => {
      if (currentAudio !== audio || requestId !== currentAudioRequestId) return;

      stopWaveformLoading();
      startWaveform(clipSeconds);
      setPlayButtonState(true);
      button.disabled = false;

      clipTimeout = setTimeout(() => {
        cleanup();
      }, clipSeconds * 1000 + 150);
    })
    .catch(err => {
      if (err?.name !== "AbortError") {
        console.error("Audio playback failed:", song.file, err);
      }
      cleanup();
    });

  audio.onended = cleanup;
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
  if (guess === "i did shrooms") {
  unlockAchievement("hidden_secret_phrase");
  }

  const answer = song.title.toLowerCase();
  const historyIndex = gameMode === "endless" ? 0 : songIndex;

    if (guess === answer) {
      guessHistory[historyIndex].push("correct");

      const currentGuessLimit = getCurrentGuessLimit();
      const allowLastGuessAchievement =
       gameMode !== "endless" || currentGuessLimit > 1;

      if (allowLastGuessAchievement && guessNumber === currentGuessLimit - 1) {
        unlockAchievement("special_last_guess");
}

    if (gameMode === "daily" && songIndex === 0) {
      unlockAchievement("daily_1");
      incrementAchievementProgress("daily_5", 1, 5);
      incrementAchievementProgress("daily_10", 1, 10);
      incrementAchievementProgress("daily_50", 1, 50);
      incrementAchievementProgress("daily_100", 1, 100);
      incrementAchievementProgress("daily_200", 1, 200);
      incrementAchievementProgress("daily_365", 1, 365);

      if (guessNumber === 0) {
        unlockAchievement("special_daily_first_try");
      }
    }

    if (gameMode === "daily" && songIndex === 1) {
      unlockAchievement("bonus_1");
      incrementAchievementProgress("bonus_5", 1, 5);
      incrementAchievementProgress("bonus_10", 1, 10);
      incrementAchievementProgress("bonus_50", 1, 50);
      incrementAchievementProgress("bonus_100", 1, 100);
      incrementAchievementProgress("bonus_200", 1, 200);
      incrementAchievementProgress("bonus_365", 1, 365);

      if (guessNumber === 0) {
        unlockAchievement("special_bonus_first_try");
      }

      if (guessHistory[0][0] === "correct" && guessNumber === 0) {
        unlockAchievement("special_double_first_try");
      }
    }

    markSongGuessedForDiscography(song.title);
    checkFeaturedAchievements(song);

    const feedback = document.getElementById("feedback");
    feedback.innerText = "Correct!";
    animateReveal(feedback);
    playSound(sounds.correct);
    triggerHaptic([20, 40, 20]);
    launchConfetti();
    showAlbumArt(song);
    renderAttemptRow();
    stopCurrentAudio();
    endRoundWaveformState();

    input.value = "";
    document.getElementById("suggestions").innerHTML = "";

    if (gameMode === "endless") {
  endlessScore++;
  checkEndlessAchievements();

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
  unlockAchievement("special_wrong_guess");
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
    triggerHaptic([12, 28, 12]);
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

let mainRevealAudio = null;
let mainRevealSong = null;

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

function stopMainRevealAudio() {
  if (mainRevealAudio) {
    mainRevealAudio.pause();
    mainRevealAudio.currentTime = 0;
    mainRevealAudio = null;
  }

  const button = document.getElementById("mainRevealPlayButton");
  if (button) {
    button.innerText = "▶";
  }

  mainRevealSong = null;
}

function toggleMainRevealSong() {
  const song = getCurrentSong();
  const button = document.getElementById("mainRevealPlayButton");
  if (!song || !button) return;

  if (mainRevealAudio && mainRevealSong?.title === song.title) {
    if (mainRevealAudio.paused) {
      mainRevealAudio.play().then(() => {
        button.innerText = "⏸";
      }).catch(() => {});
    } else {
      mainRevealAudio.pause();
      button.innerText = "▶";
    }
    return;
  }

  stopMainRevealAudio();

  mainRevealAudio = new Audio(song.file);
  mainRevealSong = song;

  mainRevealAudio.addEventListener("ended", () => {
    stopMainRevealAudio();
  });

  mainRevealAudio.play().then(() => {
    button.innerText = "⏸";
  }).catch(() => {
    stopMainRevealAudio();
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

function createResultGuessRow(history, guessLimit) {
  const row = document.createElement("div");
  row.className = "result-attempt-row";

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

  return row;
}

function renderResultGuessRows(isFinalRound) {
  const mainRowWrap = document.getElementById("resultGuessRow0");
  const bonusRowWrap = document.getElementById("resultGuessRow1");

  if (mainRowWrap) {
    mainRowWrap.innerHTML = "";
    mainRowWrap.appendChild(createResultGuessRow(guessHistory[0], MAX_GUESSES));
  }

  if (bonusRowWrap) {
    bonusRowWrap.innerHTML = "";
    if (isFinalRound && bonusStarted) {
      bonusRowWrap.appendChild(createResultGuessRow(guessHistory[1], MAX_GUESSES));
      bonusRowWrap.style.display = "flex";
    } else {
      bonusRowWrap.style.display = "none";
    }
  }
}

function renderEndlessResultGuessRow() {
  const mainRowWrap = document.getElementById("resultGuessRow0");
  const bonusRowWrap = document.getElementById("resultGuessRow1");

  if (mainRowWrap) {
    mainRowWrap.innerHTML = "";
    mainRowWrap.appendChild(createResultGuessRow(guessHistory[0], getCurrentGuessLimit()));
  }

  if (bonusRowWrap) {
    bonusRowWrap.innerHTML = "";
    bonusRowWrap.style.display = "none";
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
  const title = document.getElementById("revealedSongTitle");
  const spotify = document.getElementById("mainSpotifyLink");

  if (!song.art) {
    artWrap.style.display = "none";
    return;
  }

  if (title) {
    title.textContent = song.title;
  }

  if (spotify) {
    if (song.spotify) {
      spotify.href = song.spotify;
      spotify.style.display = "inline-flex";
    } else {
      spotify.style.display = "none";
    }
  }

  albumArt.onload = () => {
    artWrap.style.display = "block";
    animateReveal(albumArt, artWrap, title, spotify);
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
  stopMainRevealAudio();
  bonusStarted = true;
  songIndex = 1;
  guessNumber = 0;

  setPlayButtonReadyState(false);

const bonusSong = todaySongs[1];
if (bonusSong?.file) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = bonusSong.file;

  audio.addEventListener("canplaythrough", () => {
    preloadedAudioReady[1] = true;
    if (gameMode === "daily" && songIndex === 1) {
      setPlayButtonReadyState(true);
    }
  }, { once: true });

  audio.addEventListener("error", () => {
    preloadedAudioReady[1] = false;
  }, { once: true });

  audio.load();
  preloadedAudio[1] = audio;
}

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
  const perfectDaily = guessHistory[0][0] === "correct" && guessHistory[1][0] === "correct";

  stats.played++;

  if (mainWon) {
    stats.wins++;
    const guessPosition = guessHistory[0].findIndex(v => v === "correct");
    if (guessPosition >= 0 && guessPosition < 6) {
      stats.distribution[guessPosition]++;
    }
  }

  if (didWinSong(1)) {
  stats.bonusWins++;
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

  updateProgress("streak_3", Math.min(stats.streak, 3), 3);
  updateProgress("streak_5", Math.min(stats.streak, 5), 5);
  updateProgress("streak_7", Math.min(stats.streak, 7), 7);
  updateProgress("streak_30", Math.min(stats.streak, 30), 30);
  updateProgress("streak_50", Math.min(stats.streak, 50), 50);
  updateProgress("streak_100", Math.min(stats.streak, 100), 100);

  const perfectWeekCount = perfectDaily
    ? (isYesterdayUTC(stats.lastPlayed, todayKey)
        ? (achievementProgress.special_perfect_week || 0) + 1
        : 1)
    : 0;

  achievementProgress.special_perfect_week = perfectWeekCount;
  saveAchievements();
  updateProgress("special_perfect_week", Math.min(perfectWeekCount, 7), 7);

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
  markLocalSaveUpdated();
  scheduleCloudSave();
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
  markLocalSaveUpdated();
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
  const copiedMessageEl = document.getElementById("copiedMessage");
  const bonusButton = document.getElementById("bonusButton");

  resultsTitle.innerText = isFinalRound ? "Daily Complete" : "Song #1 Complete";
  statsEl.innerText =
    `Played: ${stats.played}\nWin %: ${winPercent}\nStreak: ${stats.streak}\nBest: ${stats.best}`;

  populateResultSongCards(isFinalRound);
  renderDistributionChart(stats.distribution);
  renderResultGuessRows(isFinalRound);
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
  const copiedMessageEl = document.getElementById("copiedMessage");
  const bonusButton = document.getElementById("bonusButton");

  resultsTitle.innerText = wonRound ? "Correct!" : "Run Over";
  statsEl.innerText = `Score: ${endlessScore}\nBest: ${endlessBest}`;

  bonusButton.style.display = "none";

  populateEndlessResultCard();
  renderDistributionChart([0, 0, 0, 0, 0, 0]);
  renderEndlessResultGuessRow();
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
  unlockAchievement("sharing_1");
    if (gameMode === "daily") {
    updateDailyShareStreak();
  }
    const sharedCount = (achievementProgress.sharing_1_count || 0) + 1;
  achievementProgress.sharing_1_count = sharedCount;
  saveAchievements();

  const mainPerfect = guessHistory[0][0] === "correct";
  const bonusPerfect = bonusStarted && guessHistory[1][0] === "correct";

  if (mainPerfect && bonusPerfect) {
    unlockAchievement("sharing_perfect");
  }
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

function triggerLogoZap(el, event) {
  handleLogoClick();
  if (!el) return;

  triggerHaptic(10);
  playPitchedSfx(getRandomFromArray(zapVariations), {
  volumeMultiplier: 0.10,
  pitchMin: 0.98,
  pitchMax: 1.02
});

  el.classList.remove("logo-zap");
  void el.offsetWidth;
  el.classList.add("logo-zap");

  const rect = el.getBoundingClientRect();
  const centerX = event ? event.clientX : rect.left + rect.width / 2;
  const centerY = event ? event.clientY : rect.top + rect.height / 2;

  const sparkleContainer =
    document.getElementById("sparkleContainer") || document.body;

  const flash = document.createElement("div");
  flash.className = "electric-flash";
  flash.style.left = `${centerX}px`;
  flash.style.top = `${centerY}px`;
  sparkleContainer.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 180);

  const progress = Math.min(logoClickStreakCount, 100) / 100;
  const sparkCount = 10 + Math.floor(progress * 14);

  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement("div");
    spark.className = "electric-spark";

    const angle = Math.random() * Math.PI * 2;
    const distance = 16 + Math.random() * 26;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const width = 1 + Math.random() * 1.2;
    const height = 10 + Math.random() * 10;
    const rotation = (angle * 180 / Math.PI) + (Math.random() * 50 - 25);

    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.width = `${width}px`;
    spark.style.height = `${height}px`;
    spark.style.setProperty("--spark-x", `${dx}px`);
    spark.style.setProperty("--spark-y", `${dy}px`);
    spark.style.setProperty("--spark-rotate", `${rotation}deg`);

    sparkleContainer.appendChild(spark);

    setTimeout(() => {
      spark.remove();
    }, 240);
  }

  const emberCount = 4 + Math.floor(progress * 6);

  for (let i = 0; i < emberCount; i++) {
    const ember = document.createElement("div");
    ember.className = "electric-ember";

    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 18;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    ember.style.left = `${centerX}px`;
    ember.style.top = `${centerY}px`;
    ember.style.setProperty("--ember-x", `${dx}px`);
    ember.style.setProperty("--ember-y", `${dy}px`);

    sparkleContainer.appendChild(ember);

    setTimeout(() => {
      ember.remove();
    }, 260);
  }

  setTimeout(() => {
    el.classList.remove("logo-zap");
  }, 420);
}

window.addEventListener("click", (event) => {
  const restartModal = document.getElementById("restartConfirmModal");
  const resultsModal = document.getElementById("resultModal");
  const settingsModal = document.getElementById("settingsModal");
  const whatsNewModal = document.getElementById("whatsNewModal");
  const achievementsModal = document.getElementById("achievementsModal");
  const authModal = document.getElementById("authModal");
  const welcomeModal = document.getElementById("welcomeModal");
  const topMenu = document.getElementById("topMenuDropdown");
  const menuButton = document.getElementById("menuButton");
  const aboutModal = document.getElementById("aboutModal");

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

  if (event.target === achievementsModal) {
    closeAchievementsModal();
  }

  if (event.target === authModal) {
    closeAuthModal();
  }

  if (event.target === welcomeModal) {
    closeWelcomeModal();
  }

  if (event.target === aboutModal) {
    closeAboutModal();
  }

  if (
    topMenu &&
    menuButton &&
    !topMenu.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeTopMenu();
  }

  const profileModal = document.getElementById("profileModal");
  if (event.target === profileModal) {
    closeProfileModal();
  }

  const songPicker = document.querySelector(".profile-song-picker");
  if (songPicker && !songPicker.contains(event.target)) {
    closeFavoriteSongDropdown();
  }

  const albumButton = document.getElementById("favoriteAlbumDropdownButton");
  const albumDropdown = document.getElementById("favoriteAlbumDropdown");

  if (
    albumButton &&
    albumDropdown &&
    !albumButton.contains(event.target) &&
    !albumDropdown.contains(event.target)
  ) {
    albumDropdown.style.display = "none";
  }
});



document
  .querySelectorAll('input[name="endlessGuessLimit"], input[name="endlessClipStart"]')
  .forEach(input => {
    input.addEventListener("change", updateEndlessSetupBestText);
  });

  window.addEventListener("pointerdown", unlockSfx, { once: true });
  window.addEventListener("touchstart", unlockSfx, { once: true });

  document.addEventListener("click", (e) => {


  const profileChipButton = document.getElementById("profileChipButton");
  const profileMenuDropdown = document.getElementById("profileMenuDropdown");

  if (
    profileMenuDropdown &&
    profileChipButton &&
    !profileMenuDropdown.contains(e.target) &&
    !profileChipButton.contains(e.target)
  ) {
    closeProfileMenu();
  }
  const button = e.target.closest("button");
  if (!button) return;

  if (button.id === "playButton") return;

  playPitchedSfx(getRandomFromArray(clickVariations), {
  volumeMultiplier: 1,
  pitchMin: 0.98,
  pitchMax: 1.02
});
});