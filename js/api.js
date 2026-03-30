const API_KEY = "";

export async function checkPhishingAPI(url) {
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

  const body = {
    client: {
      clientId: "phishing-detector",
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    // ✅ If API returns match
    if (data && data.matches) {
      return true;
    }

    // 🔥 FALLBACK LOGIC (IMPORTANT)
    // simulate detection if API fails
    if (
      url.includes("phishing") ||
      url.includes("fake") ||
      url.includes("login") ||
      url.includes("@")
    ) {
      return true;
    }

    return false;

  } catch (error) {
    console.error("API Error:", error);

    // 🔥 fallback if API fails completely
    if (
      url.includes("phishing") ||
      url.includes("fake") ||
      url.includes("login")
    ) {
      return true;
    }

    return false;
  }
}