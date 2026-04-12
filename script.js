import { analyzeURL } from "./js/analyzer.js";
import { render } from "./js/ui.js";
import { getFromStorage, saveToStorage } from "./js/storage.js";

const state = {
  history: [],
  searchTerm: "",
  filter: "All",
  sortMode: "newest"
};

const THEME_STORAGE_KEY = "theme-preference";

function getElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }

  return element;
}

function normalizeStoredHistory(value) {
  const history = Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
  return history.reverse();
}

function formatVisibleFilter() {
  if (state.filter === "All") {
    return state.searchTerm ? "Search results" : "All results";
  }

  return state.filter;
}

function updateFeedback(message, type = "") {
  const feedback = getElement("feedback");
  feedback.textContent = message;
  feedback.className = `feedback ${type}`.trim();
}

function updateSummary(visibleItems) {
  const total = state.history.length;
  const phishing = state.history.filter((item) => item?.level === "Phishing").length;
  const safe = state.history.filter((item) => item?.level === "Safe").length;
  const latestTimestamp = state.history[0]?.timestamp || "No checks yet";

  getElement("summaryTotal").textContent = String(total);
  getElement("summaryPhishing").textContent = String(phishing);
  getElement("summarySafe").textContent = String(safe);
  getElement("summaryLastChecked").textContent = latestTimestamp;
  getElement("historyCount").textContent = String(visibleItems.length);
  getElement("activeFilterLabel").textContent = formatVisibleFilter();
}

function getEmptyMessage() {
  if (state.history.length === 0) {
    return "Your analysis history is empty. Start by checking a suspicious link above.";
  }

  return "Nothing matches the current search and filter settings.";
}

function getVisibleItems() {
  let items = [...state.history];

  if (state.filter !== "All") {
    items = items.filter((item) => item?.level === state.filter);
  }

  if (state.searchTerm) {
    const needle = state.searchTerm.toLowerCase();
    items = items.filter((item) => {
      const url = typeof item?.url === "string" ? item.url.toLowerCase() : "";
      return url.includes(needle);
    });
  }

  if (state.sortMode === "risk") {
    items.sort((left, right) => {
      const leftScore = Number.isFinite(left?.score) ? left.score : -1;
      const rightScore = Number.isFinite(right?.score) ? right.score : -1;
      return rightScore - leftScore;
    });
  }

  return items;
}

function applyViewState() {
  const items = getVisibleItems();
  updateSummary(items);
  render(items, { emptyMessage: getEmptyMessage() });
}

function setBusy(button, isBusy) {
  button.disabled = isBusy;
  button.textContent = isBusy ? "Analyzing..." : "Analyze URL";
}

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeButton(theme) {
  const label = document.getElementById("themeToggleLabel");
  const toggle = document.getElementById("themeToggle");

  if (!label || !toggle) {
    return;
  }

  const nextMode = theme === "dark" ? "Light mode" : "Dark mode";
  label.textContent = nextMode;
  toggle.setAttribute("aria-label", `Switch to ${nextMode.toLowerCase()}`);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateThemeButton(theme);
}

function initializeTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const initialTheme = getPreferredTheme();

  applyTheme(initialTheme);

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function initializeNavigation() {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const nextExpanded = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(nextExpanded));
    siteNav.classList.toggle("is-open", nextExpanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

function initializeRevealAnimations() {
  const revealables = Array.from(document.querySelectorAll(".reveal-on-scroll"));

  if (!revealables.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealables.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  revealables.forEach((element) => observer.observe(element));
}

function getNormalizedInputUrl(rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) {
    throw new Error("Enter a URL to inspect.");
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).href;
}

async function handleCheck() {
  const input = getElement("urlInput");
  const button = getElement("checkBtn");

  try {
    setBusy(button, true);
    updateFeedback("Running phishing checks against the submitted URL...");

    const normalizedUrl = getNormalizedInputUrl(input.value);
    const result = await analyzeURL(normalizedUrl);

    state.history.unshift(result);
    saveToStorage(result);
    input.value = normalizedUrl;
    applyViewState();

    if (result.error) {
      updateFeedback("URL analyzed, but the backend check was unavailable. Showing heuristic result.", "warning");
      return;
    }

    updateFeedback(`Analysis complete. Result: ${result.level}.`, "success");
  } catch (error) {
    console.error("URL analysis failed:", error);
    updateFeedback(error instanceof Error ? error.message : "Unable to analyze the URL.", "warning");
  } finally {
    setBusy(button, false);
  }
}

function handleClearHistory() {
  state.history = [];
  localStorage.removeItem("history");
  updateFeedback("Local history cleared.");
  applyViewState();
}

function bindEvents() {
  const checkBtn = getElement("checkBtn");
  const clearHistoryBtn = getElement("clearHistoryBtn");
  const urlInput = getElement("urlInput");
  const searchInput = getElement("searchInput");
  const filterSelect = getElement("filterSelect");
  const sortBtn = getElement("sortBtn");

  checkBtn.addEventListener("click", async () => {
    await handleCheck();
  });

  clearHistoryBtn.addEventListener("click", () => {
    handleClearHistory();
  });

  urlInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleCheck();
    }
  });

  searchInput.addEventListener("input", (event) => {
    state.searchTerm = typeof event.target?.value === "string" ? event.target.value.trim() : "";
    applyViewState();
  });

  filterSelect.addEventListener("change", (event) => {
    state.filter = typeof event.target?.value === "string" ? event.target.value : "All";
    applyViewState();
  });

  sortBtn.addEventListener("click", () => {
    state.sortMode = state.sortMode === "newest" ? "risk" : "newest";
    sortBtn.textContent = state.sortMode === "risk" ? "Sort: Highest risk" : "Sort: Newest";
    applyViewState();
  });
}

function initializeApp() {
  try {
    state.history = normalizeStoredHistory(getFromStorage());
    initializeTheme();
    initializeNavigation();
    initializeRevealAnimations();
    bindEvents();
    applyViewState();
  } catch (error) {
    console.error("App initialization failed:", error);
    updateFeedback("The app could not be initialized. Check the console for details.", "warning");
  }
}

initializeApp();
