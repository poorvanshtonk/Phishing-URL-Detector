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

function getSafeUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getRiskClass(level) {
  if (level === "Safe") return "safe";
  if (level === "Suspicious") return "suspicious";
  if (level === "Phishing") return "phishing";
  return "unknown";
}

function getAssessmentCopy(item) {
  if (item?.level === "Phishing") {
    return "Strong phishing indicators were detected. Treat this destination as unsafe until verified manually.";
  }

  if (item?.level === "Suspicious") {
    return "Some risk signals are present. Inspect the sender, domain, and destination before proceeding.";
  }

  if (item?.level === "Safe") {
    return "No major phishing signals were detected in this pass, but sensitive actions still deserve caution.";
  }

  return "This result could not be classified confidently.";
}

function getBackendLabel(item) {
  if (item?.apiFlag) {
    return {
      text: "Matched backend phishing signal",
      className: "backend-indicator flagged"
    };
  }

  if (typeof item?.error === "string" && item.error.trim()) {
    return {
      text: "Backend unavailable during this check",
      className: "backend-indicator warning"
    };
  }

  return {
    text: "No backend phishing match found",
    className: "backend-indicator"
  };
}

function buildCardHeader(item, parsedUrl) {
  const top = document.createElement("div");
  top.className = "card-top";

  const hostWrap = document.createElement("div");
  const host = createTextElement("strong", parsedUrl?.hostname ?? "Invalid URL", "card-host");
  const url = createTextElement("p", parsedUrl?.href ?? "Invalid URL", "card-url");

  hostWrap.append(host, url);

  const badge = createTextElement("span", item?.level ?? "Unknown", `risk-badge ${getRiskClass(item?.level ?? null)}`);

  top.append(hostWrap, badge);
  return top;
}

function buildCardSignals(item) {
  const signalRow = document.createElement("div");
  signalRow.className = "card-signal-row";

  const scoreWrap = document.createElement("div");
  const score = Number.isFinite(item?.score) ? String(item.score) : "-";

  scoreWrap.innerHTML = `<span class="risk-label">Risk score</span><strong class="risk-score">${score}</strong>`;

  const backendInfo = getBackendLabel(item);
  const backend = createTextElement("span", backendInfo.text, backendInfo.className);

  signalRow.append(scoreWrap, backend);
  return signalRow;
}

function buildAssessment(item) {
  return createTextElement("p", getAssessmentCopy(item), "card-url");
}

function buildCardFooter(item) {
  const footer = document.createElement("div");
  footer.className = "card-footer";

  const timestamp = typeof item?.timestamp === "string" && item.timestamp.trim()
    ? item.timestamp
    : "Unknown time";

  const apiState = item?.apiFlag ? "Backend match" : "Heuristic assessment";

  footer.append(
    createTextElement("span", timestamp, "card-meta"),
    createTextElement("span", apiState, "card-meta")
  );

  return footer;
}

function buildResultCard(item) {
  const card = document.createElement("article");
  card.classList.add("result-card", getRiskClass(item?.level ?? null));

  const parsedUrl = getSafeUrl(item?.url);

  card.append(
    buildCardHeader(item, parsedUrl),
    buildCardSignals(item),
    buildAssessment(item)
  );

  if (typeof item?.error === "string" && item.error.trim()) {
    card.appendChild(createTextElement("div", item.error, "card-alert"));
  }

  card.appendChild(buildCardFooter(item));
  return card;
}

function buildEmptyState(message) {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";

  wrapper.append(
    createTextElement("h3", "No results to show"),
    createTextElement("p", message, "empty-copy"),
    createTextElement("p", "Run a URL check or loosen the current search and filter settings.", "empty-caption")
  );

  return wrapper;
}

export function render(data, options = {}) {
  const container = getContainer();
  const safeData = asArray(data);
  const emptyMessage = typeof options.emptyMessage === "string" && options.emptyMessage.trim()
    ? options.emptyMessage
    : "No results found.";

  container.replaceChildren();

  if (safeData.length === 0) {
    container.appendChild(buildEmptyState(emptyMessage));
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
    fragment.appendChild(buildEmptyState(emptyMessage));
  }

  container.appendChild(fragment);
}
