import { analyzeURL } from "./js/analyzer.js";
import { saveToStorage, getFromStorage } from "./js/storage.js";
import { render } from "./js/ui.js";

let history = getFromStorage();

// Initial render
render(history);

// Handle Check Button (UPDATED ✅)
document.getElementById("checkBtn").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value.trim();

  if (!url) return alert("Enter a URL");

  // ⏳ Show loading state
  render([{ url: "Checking...", score: "-", level: "Loading" }]);

  try {
    const result = await analyzeURL(url);

    history.push(result);
    saveToStorage(result);

    render(history);

  } catch (error) {
    console.error(error);
    alert("Error analyzing URL");
    render(history);
  }
});


// 🔍 SEARCH (HOF - correct)
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = history.filter(item =>
    item.url.toLowerCase().includes(value)
  );

  render(filtered);
});


// 🎯 FILTER (HOF)
document.getElementById("filterSelect").addEventListener("change", (e) => {
  const value = e.target.value;

  if (value === "All") return render(history);

  const filtered = history.filter(item => item.level === value);
  render(filtered);
});


// 🔽 SORT (HOF)
document.getElementById("sortBtn").addEventListener("click", () => {
  const sorted = [...history].sort((a, b) => b.score - a.score);
  render(sorted);
});