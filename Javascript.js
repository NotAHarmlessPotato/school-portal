document.addEventListener('DOMContentLoaded', () => {

  // ---------- DROPDOWN OPEN/CLOSE ----------
  const menuBtn = document.getElementById('menuBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');

  if (menuBtn && dropdownMenu) {
    menuBtn.addEventListener('click', () => {
      dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  // ---------- THEME SWITCHING ----------
  const themeCircles = dropdownMenu ? dropdownMenu.querySelectorAll('.theme-circle') : [];

  function setTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme', 'green-theme', 'blue-theme', 'purple-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    themeCircles.forEach(c => c.classList.remove('active'));
    document.querySelector(`.theme-circle[data-theme="${theme.replace('-theme','')}"]`)?.classList.add('active');
  }

  // Load saved theme or default
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  setTheme(savedTheme);

  themeCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      setTheme(circle.getAttribute('data-theme') + '-theme');
    });
  });

  // ---------- BACKGROUND EFFECT TOGGLE ----------
  const toggleEffects = document.getElementById('toggle-effects');
  const snowContainer = document.getElementById('snow');

  if (toggleEffects && snowContainer) {
    toggleEffects.addEventListener('change', () => {
      snowContainer.style.display = toggleEffects.checked ? 'block' : 'none';
    });
  }

  // ---------- SNOW EFFECT ----------
  if (snowContainer) {
    const snowflakeCount = 80;
    const snowChars = ['❄', '✻', '✼', '❅', '❆'];

    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      snowflake.textContent = snowChars[Math.floor(Math.random() * snowChars.length)];
      const size = Math.random() * 20 + 10;
      snowflake.style.fontSize = `${size}px`;
      snowflake.style.setProperty('--r0', `${Math.random() * 360}deg`);
      snowflake.style.setProperty('--r50', `${Math.random() * 360}deg`);
      snowflake.style.setProperty('--r1', `${Math.random() * 360 + 360}deg`);
      snowflake.style.setProperty('--sway', `${Math.random() * 100 - 50}px`);
      snowflake.style.setProperty('--opacity', Math.random() * 0.5 + 0.3);
      snowflake.style.setProperty('--s', Math.random() * 0.5 + 0.75);
      snowflake.style.left = `${Math.random() * 100}vw`;
      const duration = Math.random() * 5 + 5;
      const delay = Math.random() * 5;
      snowflake.style.animationDuration = `${duration}s`;
      snowflake.style.animationDelay = `${delay}s`;
      snowContainer.appendChild(snowflake);
    }
  }

  // ---------- SEARCH & FAVORITES ----------
  const searchInput = document.getElementById("quickSearch");
  const toggleFavoritesBtn = document.getElementById("toggleFavorites");
  const container = document.querySelector(".cards-container");
  const cards = Array.from(container.querySelectorAll(".card-wrapper"));
  let showOnlyFavorites = false;

  // Load saved favorites
  const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Add favorite stars and set initial favorites
  cards.forEach((card, index) => {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "favorite-star";

    const isFav = savedFavorites.includes(index);
    star.textContent = isFav ? "★" : "☆";
    if (isFav) star.classList.add("filled");
    star.dataset.favoriteOrder = isFav ? savedFavorites.indexOf(index) : -1;

    // Always prepend star
    card.prepend(star);

    star.addEventListener("click", e => {
      e.stopPropagation();
      const nowFav = star.classList.toggle("filled");
      star.textContent = nowFav ? "★" : "☆";
      star.dataset.favoriteOrder = nowFav ? getNextFavoriteOrder() : -1;

      saveFavorites();
      reorderCards();
      updateCardVisibility();
    });
  });

  function getNextFavoriteOrder() {
    const orders = cards
      .map(c => Number(c.querySelector('.favorite-star').dataset.favoriteOrder))
      .filter(o => o !== -1);
    return orders.length ? Math.max(...orders) + 1 : 0;
  }

  function saveFavorites() {
    const currentFavs = cards
      .map((c, i) => c.querySelector('.favorite-star').classList.contains('filled') ? i : -1)
      .filter(i => i !== -1);
    localStorage.setItem('favorites', JSON.stringify(currentFavs));
  }

  function reorderCards() {
    const sorted = cards.slice().sort((a, b) => {
      const favA = Number(a.querySelector('.favorite-star').dataset.favoriteOrder);
      const favB = Number(b.querySelector('.favorite-star').dataset.favoriteOrder);
      if (favA !== -1 && favB !== -1) return favA - favB;
      if (favA !== -1) return -1;
      if (favB !== -1) return 1;
      return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
    });
    sorted.forEach(card => container.appendChild(card));
  }

  // ---------- SEARCH & FAVORITES TOGGLE ----------
  function updateCardVisibility() {
    const query = searchInput.value.toLowerCase();
    cards.forEach(card => {
      const title = card.querySelector(".card-title").textContent.toLowerCase();
      const desc = card.querySelector(".card-description").textContent.toLowerCase();
      const isFav = card.querySelector('.favorite-star').classList.contains('filled');
      card.style.display = (title.includes(query) || desc.includes(query)) && (!showOnlyFavorites || isFav) ? 'flex' : 'none';
    });
  }

  searchInput.addEventListener("input", updateCardVisibility);

  if (toggleFavoritesBtn) {
    toggleFavoritesBtn.addEventListener("click", () => {
      showOnlyFavorites = !showOnlyFavorites;
      toggleFavoritesBtn.classList.toggle("active", showOnlyFavorites);
      updateCardVisibility();
    });
  }

  // ---------- INITIALIZE ----------
  // Save original order
  cards.forEach((card, index) => card.dataset.originalIndex = index);
  reorderCards();
  updateCardVisibility();

 /* ============================
       ULTRA KONAMI MODE + BANKAI
  ============================ */

  // Konami key sequence (case-sensitive)
  const konamiPattern = [
    "ArrowUp","ArrowUp",
    "ArrowDown","ArrowDown",
    "ArrowLeft","ArrowRight",
    "ArrowLeft","ArrowRight",
    "b","a"
  ];
  let konamiPos = 0;

  // Initialize state from localStorage
  let isUltraKonamiActive = localStorage.getItem("secretMode") === "on";
  if (isUltraKonamiActive) document.body.classList.add("ultra-konami");

  // Key detection
  document.addEventListener("keydown", (e) => {
    if (e.key === konamiPattern[konamiPos]) {
      konamiPos++;
      if (konamiPos === konamiPattern.length) {
        konamiPos = 0;
        toggleUltraKonamiMode();
      }
    } else {
      konamiPos = 0;
    }
  });

  // Toggle Ultra Konami Mode
  function toggleUltraKonamiMode() {
    isUltraKonamiActive = !isUltraKonamiActive;
    document.body.classList.toggle("ultra-konami", isUltraKonamiActive);
    localStorage.setItem("secretMode", isUltraKonamiActive ? "on" : "off");
    showKonamiPopup(isUltraKonamiActive ? "🌈 Ultra Konami ON!" : "❌ Ultra Konami OFF!");
  }

  // Popup message
  function showKonamiPopup(text) {
    const note = document.createElement("div");
    note.className = "konami-popup";
    note.textContent = text;
    document.body.appendChild(note);
    setTimeout(() => note.classList.add("show"), 10);
    setTimeout(() => note.classList.remove("show"), 2000);
    setTimeout(() => note.remove(), 2600);
  }

  // Particle trail
  document.addEventListener("mousemove", (e) => {
    if (!isUltraKonamiActive) return;
    const particle = document.createElement("div");
    particle.className = "ultra-konami-particle";
    particle.style.left = `${e.pageX}px`;
    particle.style.top = `${e.pageY}px`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 600); // match CSS animation duration
  });

  /* ============================
       BANKAI SECRET (dark theme circle)
  ============================ */

  let bankaiClickCount = 0;
  const darkThemeCircle = document.querySelector('.theme-circle[data-theme="dark"]');

  if (darkThemeCircle) {
    darkThemeCircle.addEventListener("click", () => {
      bankaiClickCount++;
      clearTimeout(darkThemeCircle._resetTimer);
      darkThemeCircle._resetTimer = setTimeout(() => bankaiClickCount = 0, 2500);

      if (bankaiClickCount >= 5) {
        bankaiClickCount = 0;
        playBankaiAnimation();
      }
    });
  }

  function playBankaiAnimation() {
    const overlay = document.createElement("div");
    overlay.className = "bakai-overlay";

    const aura = document.createElement("div");
    aura.className = "bakai-glow";
    overlay.appendChild(aura);

    const flash = document.createElement("div");
    flash.className = "bakai-flash";

    document.body.appendChild(overlay);
    document.body.appendChild(flash);
    document.body.classList.add("bakai-shake");

    // Particle explosion
    const cards = Array.from(document.querySelectorAll(".card-wrapper"));
    for (let i = 0; i < 80; i++) {
      const p = document.createElement("div");
      p.className = "bakai-particle";
      p.style.left = "50%";
      p.style.top = "50%";
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 600;
      p.style.setProperty("--x", `${x}px`);
      p.style.setProperty("--y", `${y}px`);
      p.style.animationDuration = `${Math.random() * 0.6 + 0.6}s`;
      overlay.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }

    // Glow cards
    cards.forEach(card => card.classList.add("bakai-card-glow"));

    // Flash effect
    flash.style.opacity = "1";
    setTimeout(() => flash.style.opacity = "0", 150);

    // Fade overlay
    setTimeout(() => overlay.style.opacity = "1", 50);

    // Optional sound
    try {
      const audio = new Audio("https://freesound.org/data/previews/276/276020_5121236-lq.mp3");
      audio.play().catch(() => {});
    } catch (err) {}

    // Cleanup
    setTimeout(() => {
      try { overlay.remove(); } catch(e){}
      try { flash.remove(); } catch(e){}
      document.body.classList.remove("bakai-shake");
      cards.forEach(card => card.classList.remove("bakai-card-glow"));
    }, 5000);
  }

  // ---------- SHADOW TOGGLE ----------
const shadowToggle = document.getElementById("shadowToggle");
if (shadowToggle) {
  // default shadows OFF
  if (localStorage.getItem("shadowsEnabled") === null || localStorage.getItem("shadowsEnabled") === "false") {
      document.body.classList.add("no-shadows");
      shadowToggle.checked = false;
  } else {
      document.body.classList.remove("no-shadows");
      shadowToggle.checked = true;
  }

  shadowToggle.addEventListener("change", () => {
      if (shadowToggle.checked) {
          document.body.classList.remove("no-shadows");
          localStorage.setItem("shadowsEnabled", "true");
      } else {
          document.body.classList.add("no-shadows");
          localStorage.setItem("shadowsEnabled", "false");
      }
  });
}

});

