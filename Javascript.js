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

});
