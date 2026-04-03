function asArray(data) {
  return Array.isArray(data) ? data.filter(Boolean) : [];
}

function getContainer() {
  const container = document.getElementById("results");

  if (!container) {
    throw new Error('Missing "#results" container.');
  }

  return container;
}

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text ?? "";
  return element;
}

function getSafeUrlLabel(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return "Invalid URL";
  }

  try {
    return new URL(value).href;
  } catch {
    return "Invalid URL";
  }
}

function getRiskClass(level) {
  if (level === "Safe") return "safe";
  if (level === "Suspicious") return "suspicious";
  if (level === "Phishing") return "phishing";
  return "unknown";
}

function buildResultCard(item) {
  const card = document.createElement("div");
  card.classList.add("result-card", getRiskClass(item.level ?? null));

  const urlRow = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = getSafeUrlLabel(item.url);
  urlRow.appendChild(strong);

  const score = Number.isFinite(item.score) ? item.score : "-";
  const status = typeof item.level === "string" && item.level.trim() ? item.level : "Unknown";
  const timestamp = typeof item.timestamp === "string" ? item.timestamp : "";

  const scoreRow = createTextElement("p", `Score: ${score}`);
  const statusRow = createTextElement("p", `Status: ${status}`);
  const timeRow = createTextElement("p", timestamp, "timestamp");

  timeRow.style.fontSize = "12px";
  timeRow.style.opacity = "0.7";

  card.append(urlRow, scoreRow, statusRow, timeRow);
  return card;
}

export function render(data) {
  const container = getContainer();
  const safeData = asArray(data);

  container.replaceChildren();

  if (safeData.length === 0) {
    container.appendChild(createTextElement("p", "No results found"));
    return;
  }

  const fragment = document.createDocumentFragment();

  safeData.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    fragment.appendChild(buildResultCard(item));
  });

  if (!fragment.childNodes.length) {
    fragment.appendChild(createTextElement("p", "No results found"));
  }

  container.appendChild(fragment);
}
