/* ── Config ──────────────────────────────────── */
const API_KEY = "your_api_key_here"; // Not required by Open Library — kept as per spec
const BASE_URL = "https://openlibrary.org/search.json";
const COVER_URL = "https://covers.openlibrary.org/b/id/";
const LS_KEY_COUNT = "bookfinder_read_count";
const LS_KEY_READ  = "bookfinder_read_keys";

/* ── State ───────────────────────────────────── */
let readCount = parseInt(localStorage.getItem(LS_KEY_COUNT) || "0", 10);
let readKeys  = JSON.parse(localStorage.getItem(LS_KEY_READ) || "[]");

/* ── DOM refs ────────────────────────────────── */
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");
const statusMsg     = document.getElementById("statusMsg");
const resultsGrid   = document.getElementById("resultsGrid");
const counterNum    = document.getElementById("counterNum");
const cardTemplate  = document.getElementById("cardTemplate");
const tags          = document.querySelectorAll(".tag");

/* ── Init ────────────────────────────────────── */
updateCounter();

/* ── Event listeners ─────────────────────────── */
searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

tags.forEach((tag) => {
  tag.addEventListener("click", () => {
    searchInput.value = tag.dataset.q;
    handleSearch();
  });
});

/* ── handleSearch ────────────────────────────── */
function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    flashInput();
    return;
  }
  fetchBooks(query);
}

/* ── fetchBooks ──────────────────────────────── */
async function fetchBooks(query) {
  setStatus("loading");
  resultsGrid.innerHTML = "";

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&limit=24&fields=key,title,author_name,first_publish_year,cover_i`;
    const res  = await fetch(url);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (!data.docs || data.docs.length === 0) {
      setStatus("empty", query);
      return;
    }

    setStatus("clear");
    displayBooks(data.docs);

  } catch (err) {
    console.error(err);
    setStatus("error");
  }
}

/* ── displayBooks ────────────────────────────── */
function displayBooks(books) {
  const fragment = document.createDocumentFragment();

  books.forEach((book, index) => {
    const card = buildCard(book, index);
    fragment.appendChild(card);
  });

  resultsGrid.appendChild(fragment);
}

/* ── buildCard ───────────────────────────────── */
function buildCard(book, index) {
  const clone = cardTemplate.content.cloneNode(true);
  const card  = clone.querySelector(".card");

  // Stagger animation
  card.style.animationDelay = `${index * 0.05}s`;

  // Unique key to track "read" state
  const bookKey = book.key || `${book.title}-${book.first_publish_year}`;

  // Cover image
  const img = card.querySelector(".card-img");
  if (book.cover_i) {
    img.src = `${COVER_URL}${book.cover_i}-M.jpg`;
    img.alt = book.title || "Book cover";
  } else {
    img.src = "https://openlibrary.org/images/icons/avatar_book-sm.png";
    img.alt = "No cover";
    img.classList.add("no-cover");
  }

  // Year badge
  const yearBadge = card.querySelector(".card-year-badge");
  yearBadge.textContent = book.first_publish_year || "—";

  // Title
  card.querySelector(".card-title").textContent =
    book.title || "Unknown Title";

  // Author
  card.querySelector(".card-author").textContent =
    book.author_name
      ? book.author_name.slice(0, 2).join(", ")
      : "Unknown Author";

  // Read button
  const readBtn = card.querySelector(".read-btn");
  if (readKeys.includes(bookKey)) markRead(readBtn);

  readBtn.addEventListener("click", () => {
    if (!readKeys.includes(bookKey)) {
      readKeys.push(bookKey);
      localStorage.setItem(LS_KEY_READ, JSON.stringify(readKeys));
      readCount++;
      updateCounter(true);
      markRead(readBtn);
      animateCounter();
    }
  });

  return clone;
}

/* ── markRead ────────────────────────────────── */
function markRead(btn) {
  btn.classList.add("read-done");
  btn.querySelector(".read-btn-text").textContent = "Read";
}

/* ── updateCounter ───────────────────────────── */
function updateCounter(save = false) {
  counterNum.textContent = readCount;
  if (save) localStorage.setItem(LS_KEY_COUNT, readCount);
}

/* ── animateCounter ──────────────────────────── */
function animateCounter() {
  const badge = document.getElementById("counterBadge");
  badge.style.transform = "scale(1.15)";
  badge.style.boxShadow = "0 0 30px rgba(212,175,55,0.6)";
  setTimeout(() => {
    badge.style.transform = "";
    badge.style.boxShadow = "";
  }, 350);
}

/* ── setStatus ───────────────────────────────── */
function setStatus(type, query = "") {
  switch (type) {
    case "loading":
      statusMsg.innerHTML = `
        <span class="status-loading">
          <span class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          Searching the library…
        </span>`;
      break;
    case "empty":
      statusMsg.innerHTML = `
        <span class="status-empty">
          No results found for "<em>${escHtml(query)}</em>"
        </span>`;
      break;
    case "error":
      statusMsg.innerHTML = `<span style="color:#c0392b">Something went wrong. Please try again.</span>`;
      break;
    case "clear":
    default:
      statusMsg.innerHTML = "";
  }
}

/* ── flashInput ──────────────────────────────── */
function flashInput() {
  searchInput.style.transition = "none";
  searchInput.style.outline = "2px solid rgba(192,57,43,0.8)";
  setTimeout(() => {
    searchInput.style.outline = "";
    searchInput.style.transition = "";
  }, 600);
}

/* ── escHtml ─────────────────────────────────── */
function escHtml(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
  );
}
