console.log("✅ Fake Review Detector (Gemini) script loaded on", window.location.hostname);

const apiKey = ""; // 🔑 Replace with your Gemini API key
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

function getReviewSelector() {
    const host = window.location.hostname;

    if (host.includes("amazon")) return '[data-hook="review-body"] span'; // added span
    if (host.includes("flipkart")) return '.col.EPCmJX > div:first-child';
    if (host.includes("walmart")) return '.review-text';
    if (host.includes("ebay")) return '.ebay-review-section';
    if (host.includes("myntra")) return '.Review-module__comment--DdG8Y';
    
    return null;
}


async function analyzeReview(reviewText) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "analyzeReview", text: reviewText },
      (response) => {
        const resultText = response.result || "";

        const fakeMatch = resultText.match(/Fake Percentage:\s*(\d+)%/);
        const realMatch = resultText.match(/Real Percentage:\s*(\d+)%/);

        resolve({
          fakePercentage: fakeMatch ? fakeMatch[1] : "N/A",
          realPercentage: realMatch ? realMatch[1] : "N/A"
        });
      }
    );
  });
}


function tagReviewElement(review, result) {
    const existing = review.querySelector(".fake-review-tag");
    if (existing) existing.remove();

    const tag = document.createElement("div");
    tag.className = "fake-review-tag";

    // Progress bar instead of squares
    const bar = `
        <div style="margin-top: 5px; width: 100%; background: #eee; border-radius: 6px; overflow: hidden; height: 14px;">
            <div style="width: ${result.realPercentage}%; background: green; height: 100%; float: left;"></div>
            <div style="width: ${result.fakePercentage}%; background: red; height: 100%; float: left;"></div>
        </div>
    `;

    tag.innerHTML = `
        <div style="font-weight: bold; font-size: 13px;">
            ✅ Real: ${result.realPercentage}% | 🛑 Fake: ${result.fakePercentage}%<br>
            ${bar}
        </div>
    `;

    review.appendChild(tag);
}

async function tagReviews() {
    const selector = getReviewSelector();
    if (!selector) return;
    const reviews = document.querySelectorAll(selector);

    for (const review of reviews) {
        if (!review.dataset.analyzed) {
            review.dataset.analyzed = "true";
            const text = review.innerText.trim();
            if (text.length > 10) {
                const result = await analyzeReview(text);
                tagReviewElement(review, result);
            }
        }
    }
}

function observeAndTag() {
    const debounce = (func, delay) => {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), delay);
        };
    };

    const observer = new MutationObserver(debounce(tagReviews, 500));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", debounce(tagReviews, 500));
    tagReviews();
}

observeAndTag();
