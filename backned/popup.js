document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyze-btn");

  if (analyzeButton) {
    analyzeButton.addEventListener("click", () => {
      const review = document.getElementById("review").value;
      const resultDiv = document.getElementById("result");

      if (!review) {
        resultDiv.innerHTML = "Please enter a review.";
        return;
      }

      chrome.runtime.sendMessage(
        { action: "analyzeReview", text: review },
        (response) => {
          if (!response || !response.result) {
            resultDiv.innerHTML = `<p style="color:red;">❌ No response from background.js</p>`;
            return;
          }

          const resultText = response.result;

          const fakeMatch = resultText.match(/Fake Percentage:\s*(\d+)%/i);
          const realMatch = resultText.match(/Real Percentage:\s*(\d+)%/i);

          const fake = fakeMatch ? fakeMatch[1] : "N/A";
          const real = realMatch ? realMatch[1] : "N/A";

          resultDiv.innerHTML = `
            <p>🛑 <strong>Fake:</strong> ${fake}%</p>
            <p>✅ <strong>Real:</strong> ${real}%</p>
          `;
        }
      );
    });
  }
});
