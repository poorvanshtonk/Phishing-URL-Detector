export async function checkPhishingAPI(url) {
  try {
    const res = await fetch("http://localhost:3000/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    console.log("Backend API RESPONSE:", data);

    
    if (data && data.matches) {
      return true;
    }


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
    console.error("Backend API Error:", error);

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