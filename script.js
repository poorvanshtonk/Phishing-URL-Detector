import { analyzeURL } from "./js/analyzer.js";
import { render } from "./js/ui.js";
import { getFromStorage, saveToStorage } from "./js/storage.js";

const state = {
  history: [],
  searchTerm: "",
  filter: "All",
  sortDescending: false
};

function getElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }

  return element;
}

function normalizeStoredHistory(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function applyViewState() {
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

  if (state.sortDescending) {
    items.sort((left, right) => {
      const leftScore = Number.isFinite(left?.score) ? left.score : -1;
      const rightScore = Number.isFinite(right?.score) ? right.score : -1;
      return rightScore - leftScore;
    });
  }

  render(items);
}

function setBusy(button, isBusy) {
  button.disabled = isBusy;
  button.textContent = isBusy ? "Checking..." : "Check";
}

function getNormalizedInputUrl(rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) {
    throw new Error("Enter a URL.");
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value) ? value : `https://${value}`;
  return new URL(withProtocol).href;
}

async function handleCheck() {
  const input = getElement("urlInput");
  const button = getElement("checkBtn");

  try {
    setBusy(button, true);

    const normalizedUrl = getNormalizedInputUrl(input.value);
    const result = await analyzeURL(normalizedUrl);

    state.history.unshift(result);
    saveToStorage(result);
    input.value = normalizedUrl;
    applyViewState();
  } catch (error) {
    console.error("URL analysis failed:", error);
    window.alert(error instanceof Error ? error.message : "Unable to analyze the URL.");
  } finally {
    setBusy(button, false);
  }
}

function bindEvents() {
  const checkBtn = getElement("checkBtn");
  const urlInput = getElement("urlInput");
  const searchInput = getElement("searchInput");
  const filterSelect = getElement("filterSelect");
  const sortBtn = getElement("sortBtn");

  checkBtn.addEventListener("click", async () => {
    await handleCheck();
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
    state.sortDescending = !state.sortDescending;
    sortBtn.textContent = state.sortDescending ? "Sorted by Risk" : "Sort by Risk";
    applyViewState();
  });
}

function initializeApp() {
  try {
    state.history = normalizeStoredHistory(getFromStorage());
    bindEvents();
    applyViewState();
  } catch (error) {
    console.error("App initialization failed:", error);
    window.alert("The app could not be initialized. Check the console for details.");
  }
}

initializeApp();
