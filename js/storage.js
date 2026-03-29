export function saveToStorage(data) {
  const existing = JSON.parse(localStorage.getItem("history")) || [];
  existing.push(data);
  localStorage.setItem("history", JSON.stringify(existing));
}

export function getFromStorage() {
  return JSON.parse(localStorage.getItem("history")) || [];
}