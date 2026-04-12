import { analyzeURL } from "./js/analyzer.js";
import { render } from "./js/ui.js";
import { getFromStorage, saveToStorage } from "./js/storage.js";
import { debounce, paginate } from "./js/utils.js";

const state = {
  history: [],
  searchTerm: "",
  filter: "All",
  sortMode: "newest",
  currentPage: 1,
  itemsPerPage: 6
};

// Grab the DOM elements easily
const getEl = (id) => document.getElementById(id);

// Crunch the numbers for the stats board
function updateSummary() {
  const total = state.history.length;
  const phishing = state.history.filter((item) => item?.level === "Phishing").length;
  const safe = state.history.filter((item) => item?.level === "Safe").length;
  const latest = state.history[0]?.timestamp || "Awaiting check...";

  getEl("summaryTotal").textContent = total;
  getEl("summaryPhishing").textContent = phishing;
  getEl("summarySafe").textContent = safe;
  getEl("summaryLastChecked").textContent = latest;
}

// Figure out what to actually show based on search, filters, and sorting
function getVisibleItems() {
  let items = [...state.history];

  if (state.filter !== "All") {
    items = items.filter((item) => item?.level === state.filter);
  }

  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    items = items.filter((item) => (item?.url || "").toLowerCase().includes(term));
  }

  if (state.sortMode === "risk") {
    items.sort((a, b) => (b?.score || 0) - (a?.score || 0));
  } else {
    // Just keep them in the order they came in (newest first)
  }

  return items;
}

function updatePaginationControls(totalVisibleItems) {
  const totalPages = Math.ceil(totalVisibleItems / state.itemsPerPage) || 1;
  
  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }
  
  getEl("pageIndicator").textContent = `Page ${state.currentPage} of ${totalPages}`;
  getEl("prevPageBtn").disabled = state.currentPage <= 1;
  getEl("nextPageBtn").disabled = state.currentPage >= totalPages;
}

function applyViewState() {
  const allVisibleItems = getVisibleItems();
  updatePaginationControls(allVisibleItems.length);
  
  const pageItems = paginate(allVisibleItems, state.currentPage, state.itemsPerPage);
  
  updateSummary();
  render(pageItems, { 
    emptyMessage: state.history.length === 0 
      ? "Your analysis log is empty. Scan a suspicious URL above." 
      : "No matches found for the current search and filter settings." 
  });
}

function setBusy(isBusy) {
  const btn = getEl("checkBtn");
  const loader = getEl("checkLoader");
  const btnText = btn.querySelector(".btn-text");
  
  btn.disabled = isBusy;
  if (isBusy) {
    loader.classList.remove("hidden");
    btnText.textContent = "Analyzing";
  } else {
    loader.classList.add("hidden");
    btnText.textContent = "Analyze";
  }
}

function updateFeedback(msg, typeClass = "") {
  const feedback = getEl("feedback");
  feedback.textContent = msg;
  feedback.className = `feedback-message ${typeClass}`;
}

async function handleCheck() {
  const input = getEl("urlInput");
  const urlValue = input.value.trim();

  if (!urlValue) {
    updateFeedback("Please enter a valid URL.", "text-warning");
    return;
  }

  try {
    setBusy(true);
    updateFeedback("Running heuristic and backend analysis...", "");

    const result = await analyzeURL(urlValue);
    
    // Toss the new result right at the top of our log
    state.history.unshift(result);
    saveToStorage(result);
    // Bump the user back to the first page so they can see what just happened
    state.currentPage = 1;
    
    applyViewState();

    if (result.error) {
      updateFeedback("Analyzed locally. Backend was unreachable.", "text-warning");
    } else {
      updateFeedback(`Done! Result level: ${result.level}`, "text-success");
    }
  } catch (err) {
    updateFeedback(err.message, "text-danger");
  } finally {
    setBusy(false);
  }
}

// Handle switching between dark mode and light mode
function initTheme() {
  const btn = getEl("themeToggle");
  const html = document.documentElement;
  
  const storedTheme = localStorage.getItem("theme-preference") || "dark";
  html.setAttribute("data-theme", storedTheme);

  btn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme-preference", next);
  });
}

// Make the hamburger menu work on small screens
function initNav() {
  const navToggle = getEl("navToggle");
  const siteNav = getEl("siteNav");
  
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("is-open");
  });
}

// Trigger those cool fade-in animations when the user scrolls down
function initReveal() {
  const items = document.querySelectorAll(".reveal-on-scroll");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  items.forEach(el => observer.observe(el));
}

// Wire up all the buttons and inputs
function bindEvents() {
  getEl("checkBtn").addEventListener("click", handleCheck);

  getEl("urlInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCheck();
  });

  // Don't search on every single keystroke, wait a tiny bit first
  const handleSearch = debounce((e) => {
    state.searchTerm = e.target.value.trim();
    state.currentPage = 1;
    applyViewState();
  }, 300);

  getEl("searchInput").addEventListener("input", handleSearch);

  getEl("filterSelect").addEventListener("change", (e) => {
    state.filter = e.target.value;
    state.currentPage = 1;
    applyViewState();
  });

  const sortBtn = getEl("sortBtn");
  sortBtn.addEventListener("click", () => {
    state.sortMode = state.sortMode === "newest" ? "risk" : "newest";
    sortBtn.textContent = state.sortMode === "risk" ? "Sort: Highest Risk" : "Sort: Newest";
    applyViewState();
  });

  getEl("clearHistoryBtn").addEventListener("click", () => {
    state.history = [];
    localStorage.removeItem("history");
    updateFeedback("History cleared.");
    applyViewState();
  });

  // Hook up the next and previous page buttons
  getEl("prevPageBtn").addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      applyViewState();
    }
  });

  getEl("nextPageBtn").addEventListener("click", () => {
    state.currentPage++;
    applyViewState();
  });
}

function initializeApp() {
  const rawHistory = getFromStorage();
  state.history = Array.isArray(rawHistory) ? rawHistory : [];

  initTheme();
  initNav();
  initReveal();
  bindEvents();
  applyViewState();
}

document.addEventListener("DOMContentLoaded", initializeApp);
