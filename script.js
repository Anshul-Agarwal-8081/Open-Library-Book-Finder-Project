const BASE_URL = 'https://openlibrary.org/search.json';
var COVER_URL = "https://covers.openlibrary.org/b/id/";

let readCount = parseInt(localStorage.getItem("read_count") || "0");
var readKeys = JSON.parse(localStorage.getItem("read_keys") || "[]");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const resultsGrid = document.getElementById("resultsGrid");
const counterNum = document.getElementById("counterNum");
const cardTemplate = document.getElementById("cardTemplate");

counterNum.textContent = readCount;

// search button click handler
searchBtn.addEventListener("click", function () {
    var query = searchInput.value.trim();
    if(query) {
        fetchBooks(query);
    }
});

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    let q = searchInput.value.trim();
    if (q) fetchBooks(q);
  }
});

// tag clickers
document.querySelectorAll(".tag").forEach(function (tag) {
  tag.onclick = function () {
    searchInput.value = tag.dataset.q;
    fetchBooks(tag.dataset.q);
  };
});

async function fetchBooks(query) {
  statusMsg.innerHTML = "Searching...";
  resultsGrid.innerHTML = "";

  try {
    const url = BASE_URL + "?q=" + encodeURIComponent(query) + "&limit=24&fields=key,title,author_name,first_publish_year,cover_i";
    let res = await fetch(url);
    var data = await res.json();

    if (!data.docs || data.docs.length === 0) {
      statusMsg.textContent = 'No results found for "' + query + '"';
      return;
    }

    statusMsg.textContent = "";
    showBooks(data.docs);
  } catch (err) {
    statusMsg.textContent = "Something went wrong... try again later";
    console.error(err);
  }
}

function showBooks(books) {
  books.forEach(function (book) {
    var clone = cardTemplate.content.cloneNode(true);
    let card = clone.querySelector(".card");

    var img = card.querySelector(".card-img");
    if (book.cover_i) {
      img.src = COVER_URL + book.cover_i + "-M.jpg";
      img.alt = book.title || "Book cover";
    } else {
      img.src = "https://openlibrary.org/images/icons/avatar_book-sm.png";
      img.alt = "No cover";
      img.classList.add("no-cover");
    }

    card.querySelector(".card-year").innerText = book.first_publish_year || "—";
    card.querySelector(".card-title").textContent = book.title || "Unknown Title";

    var author = "Unknown Author";
    if (book.author_name && Array.isArray(book.author_name)) {
      author = book.author_name.slice(0, 2).join(", ");
    }
    card.querySelector(".card-author").textContent = author;

    const bookKey = book.key || book.title;
    var readBtn = card.querySelector(".read-btn");

    if (readKeys.includes(bookKey)) {
      readBtn.textContent = "✓ Read";
      readBtn.classList.add("read-done");
    }

    readBtn.addEventListener("click", function() {
      if (!readKeys.includes(bookKey)) {
        readKeys.push(bookKey);
        localStorage.setItem("read_keys", JSON.stringify(readKeys));
        readCount++;
        localStorage.setItem("read_count", readCount);
        counterNum.textContent = readCount;
        readBtn.textContent = "✓ Read";
        readBtn.classList.add("read-done");
      }
    });

    resultsGrid.appendChild(clone);
  });
}

// this handles the bg animation particles
function initBgAnimation() {
  const container = document.getElementById('bgAnimation');
  var particleCount = 40;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    
    let size = (Math.random() * 6 + 2) + 'px';
    p.style.width = size;
    p.style.height = size;
    
    p.style.left = (Math.random() * 100) + 'vw';
    
    const dur = (Math.random() * 15 + 10) + 's';
    const dly = (Math.random() * 15) + 's';
    p.style.animationDuration = dur;
    p.style.animationDelay = '-' + dly;
    
    p.style.opacity = Math.random() * 0.5 + 0.1;
    
    container.appendChild(p);
  }
}

initBgAnimation();
