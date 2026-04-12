export function render(data, options = {}) {
  const container = document.getElementById("results");
  if (!container) return;
  
  const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
  const emptyMessage = options.emptyMessage || "No results found.";

  container.replaceChildren();

  if (safeData.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    
    emptyState.innerHTML = `
      <h3 class="empty-title">No results to show</h3>
      <p class="empty-desc">${emptyMessage}</p>
    `;
    
    container.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();

  safeData.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("result-card", item.level || "Unknown");

    const host = new URL(item.url).hostname || "Unknown Host";
    const riskIndicatorClass = item.level || "Unknown";

    let apiBadgeHtml = item.apiFlag 
      ? `<span class="api-badge flagged">Backend match found</span>` 
      : `<span class="api-badge">No backend match</span>`;

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="card-host">${host}</div>
          <div class="card-url">${item.url}</div>
        </div>
        <div class="risk-indicator ${riskIndicatorClass}">${item.level}</div>
      </div>
      <div class="card-signal-row">
         <div class="score-box">
            <span class="risk-label">Risk Score</span>
            <strong class="risk-score">${item.score}</strong>
         </div>
         ${apiBadgeHtml}
      </div>
      <div class="card-footer">
        <span>${item.timestamp || "Unknown Time"}</span>
        <span>Heuristic & API Analyzed</span>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
