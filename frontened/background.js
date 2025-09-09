chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeReview") {
    console.log("📩 Received review text:", message.text);

    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDnsQ97GDjefpBAf9gfeO69UsMpso-ILP8`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this review and respond ONLY in this format:\nFake Percentage: XX%\nReal Percentage: YY%\n\nReview: ${message.text}`
                }
              ]
            }
          ]
        })
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Gemini raw response:", data);

        const resultText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("📤 Parsed result:", resultText);

        sendResponse({ result: resultText });
      })
      .catch((err) => {
        console.error("❌ Gemini API error:", err);
        sendResponse({ result: `Error: ${err.message}` });
      });

    return true; // keep channel open
  }
});
