import { checkPhishingAPI } from "./api.js";

// 🔧 Normalize + validate URL
function normalizeURL(url) {
  try {
    // Auto add https if missing
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return new URL(url).href;
  } catch {
    return null;
  }
}

// 🎯 Main analyzer
export async function analyzeURL(url) {
  const normalizedURL = normalizeURL(url);

  // ❌ Invalid URL handling
  if (!normalizedURL) {
    return {
      url,
      score: 0,
      level: "Invalid URL",
      apiFlag: false,
      timestamp: new Date().toLocaleString()
    };
  }

  let score = 0;

  // 🔍 Heuristic checks
  if (normalizedURL.length > 75) score += 2;
  if (normalizedURL.includes("@")) score += 3;
  if (normalizedURL.includes("-")) score += 1;
  if (!normalizedURL.startsWith("https")) score += 2;
  if (normalizedURL.split(".").length > 3) score += 2;

  let apiResult = false;

  // 🌐 API call (safe handling)
  try {
    apiResult = await checkPhishingAPI(normalizedURL);
  } catch (err) {
    console.error("API failed, fallback used:", err);
  }

  // 🔥 API weight
  if (apiResult) score += 5;

  return {
    url: normalizedURL,
    score,
    level: getRiskLevel(score),
    apiFlag: apiResult,
    timestamp: new Date().toLocaleString()
  };
}

// 🎯 Risk classification
export function getRiskLevel(score) {
  if (score <= 2) return "Safe";
  if (score <= 5) return "Suspicious";
  return "Phishing";
}