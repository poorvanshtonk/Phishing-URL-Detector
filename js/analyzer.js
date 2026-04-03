const BACKEND_ENDPOINT = "http://localhost:3000/check";

function normalizeURL(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).href;
  } catch {
    return null;
  }
}

function countHostnameParts(url) {
  try {
    return new URL(url).hostname.split(".").filter(Boolean).length;
  } catch {
    return 0;
  }
}

async function checkPhishingBackend(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL passed to backend analysis.");
  }

  const response = await fetch(BACKEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: parsedUrl.href })
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Backend returned invalid JSON: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return Boolean(payload?.matches);
}

function getHeuristicScore(url) {
  const parsedUrl = new URL(url);
  let score = 0;

  if (url.length > 75) score += 2;
  if (parsedUrl.username || parsedUrl.password || url.includes("@")) score += 3;
  if (parsedUrl.hostname.includes("-")) score += 1;
  if (parsedUrl.protocol !== "https:") score += 2;
  if (countHostnameParts(url) > 3) score += 2;

  return score;
}

function buildResult(url, score, apiFlag, error = null) {
  const result = {
    url,
    score,
    level: getRiskLevel(score),
    apiFlag,
    timestamp: new Date().toLocaleString()
  };

  if (error) {
    result.error = error;
  }

  return result;
}

export async function analyzeURL(url) {
  const normalizedURL = normalizeURL(url);

  if (!normalizedURL) {
    return {
      url: typeof url === "string" ? url : "",
      score: 0,
      level: "Invalid URL",
      apiFlag: false,
      timestamp: new Date().toLocaleString(),
      error: "The provided URL is invalid."
    };
  }

  let score = getHeuristicScore(normalizedURL);
  let apiFlag = false;
  let apiError = null;

  try {
    apiFlag = await checkPhishingBackend(normalizedURL);
  } catch (error) {
    apiError = error instanceof Error ? error.message : "Backend check failed.";
    console.error("Backend analysis failed:", error);
  }

  if (apiFlag) {
    score += 5;
  }

  return buildResult(normalizedURL, score, apiFlag, apiError);
}

export function getRiskLevel(score) {
  if (!Number.isFinite(score)) return "Unknown";
  if (score <= 2) return "Safe";
  if (score <= 5) return "Suspicious";
  return "Phishing";
}
