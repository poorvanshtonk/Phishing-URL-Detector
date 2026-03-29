export function render(data) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="opacity:0.7;">No results found</p>`;
    return;
  }

  data.forEach(item => {
    const div = document.createElement("div");

    let className = "";
    if (item.level === "Safe") className = "safe";
    else if (item.level === "Suspicious") className = "suspicious";
    else if (item.level === "Phishing") className = "phishing";

    div.classList.add(className);

    // 🔥 SAFE URL rendering
    const safeURL = document.createElement("span");
    safeURL.textContent = item.url;

    const content = document.createElement("div");

    content.innerHTML = `
      <p><strong></strong></p>
      <p>Score: ${item.score}</p>
      <p>Status: ${item.level}</p>
      <p style="font-size:12px; opacity:0.7;">
        ${item.timestamp || ""}
      </p>
    `;

    // Inject URL safely
    content.querySelector("strong").appendChild(safeURL);

    div.appendChild(content);
    container.appendChild(div);
  });
}