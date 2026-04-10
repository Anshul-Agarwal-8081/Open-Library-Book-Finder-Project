const BASE_URL = 'https://openlibrary.org/search.json';
const COVER_URL = "https://covers.openlibrary.org/b/id/";

// App State
let readCount = parseInt(localStorage.getItem("read_count") || "0");
let readKeys = JSON.parse(localStorage.getItem("read_keys") || "[]");

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const resultsGrid = document.getElementById("resultsGrid");
const counterNum = document.getElementById("counterNum");
const cardTemplate = document.getElementById("cardTemplate");

// Initialize UI
counterNum.textContent = readCount;

/**
 * Perform search when button or Enter key is pressed
 */
const handleSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
        console.log(`Searching for: ${query}`);
        fetchBooks(query);
    } else {
        showStatus("Please enter a title or author to search.", "warning");
    }
};

if (searchBtn) searchBtn.addEventListener("click", handleSearch);
if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSearch();
    });
}

// Setup quick tags
document.querySelectorAll(".tag").forEach(tag => {
    tag.onclick = () => {
        searchInput.value = tag.dataset.q;
        fetchBooks(tag.dataset.q);
    };
});

/**
 * Fetch books from Open Library API
 */
async function fetchBooks(query) {
    // Show loading state
    statusMsg.innerHTML = '<div class="spinner"></div>';
    resultsGrid.innerHTML = "";

    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(query)}&limit=24&fields=key,title,author_name,first_publish_year,cover_i`;
        console.log(`Fetching from URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Data received:", data);

        if (!data.docs || data.docs.length === 0) {
            showStatus(`No results found for "${query}". Try another search!`, "info");
            return;
        }

        statusMsg.textContent = "";
        displayResults(data.docs);
    } catch (err) {
        console.error("Fetch Error:", err);
        showStatus(`Error: ${err.message}. Please check your connection.`, "error");
    }
}

/**
 * Display search results in the grid
 */
function displayResults(books) {
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        try {
            const clone = cardTemplate.content.cloneNode(true);
            const card = clone.querySelector(".card");
            const img = card.querySelector(".card-img");

            // Handle cover image
            if (book.cover_i) {
                img.src = `${COVER_URL}${book.cover_i}-M.jpg`;
                img.alt = `${book.title} cover`;
            } else {
                img.src = "https://openlibrary.org/images/icons/avatar_book-sm.png";
                img.alt = "Cover not available";
                img.classList.add("no-cover");
            }

            // Set text content
            card.querySelector(".card-year").textContent = book.first_publish_year || "N/A";
            card.querySelector(".card-title").textContent = book.title || "Unknown Title";

            // Handle multiple authors
            const authors = (book.author_name && Array.isArray(book.author_name)) 
                ? book.author_name.slice(0, 2).join(", ") 
                : "Unknown Author";
            card.querySelector(".card-author").textContent = authors;

            const bookKey = book.key || book.title;
            const readBtn = card.querySelector(".read-btn");

            // Check if already read
            if (readKeys.includes(bookKey)) {
                markAsReadUI(readBtn);
            }

            // Read button logic
            readBtn.addEventListener("click", () => {
                if (!readKeys.includes(bookKey)) {
                    updateReadStatus(bookKey, readBtn);
                }
            });

            fragment.appendChild(clone);
        } catch (cardErr) {
            console.error("Error creating card for book:", book, cardErr);
        }
    });

    resultsGrid.appendChild(fragment);
}

/**
 * Updates local storage and UI when a book is marked as read
 */
function updateReadStatus(key, button) {
    readKeys.push(key);
    readCount++;
    
    localStorage.setItem("read_keys", JSON.stringify(readKeys));
    localStorage.setItem("read_count", readCount);
    
    counterNum.textContent = readCount;
    markAsReadUI(button);
}

function markAsReadUI(button) {
    button.textContent = "✓ Finished Reading";
    button.classList.add("read-done");
    button.disabled = true;
}

function showStatus(message, type) {
    statusMsg.textContent = message;
    if (type === "error") {
        statusMsg.style.color = "#f87171";
        statusMsg.style.fontWeight = "bold";
    } else {
        statusMsg.style.color = "inherit";
        statusMsg.style.fontWeight = "normal";
    }
}

/**
 * Initialize background particles for ambiance
 */
function initParticles() {
    const container = document.getElementById('bgAnimation');
    if (!container) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        const size = (Math.random() * 4 + 1) + 'px';
        p.style.width = size;
        p.style.height = size;
        
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.top = (Math.random() * 100) + 'vh';
        
        const duration = (Math.random() * 20 + 10) + 's';
        const delay = (Math.random() * 20) + 's';
        
        p.style.animationDuration = duration;
        p.style.animationDelay = `-${delay}`;
        
        container.appendChild(p);
    }
}

document.addEventListener("DOMContentLoaded", initParticles);
