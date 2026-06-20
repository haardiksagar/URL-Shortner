import "./styles.css";

/**
 * Vite proxies /api requests to Spring Boot during development.
 * These globals can still override the URLs in other deployments.
 */
const API_BASE_URL = window.TRIMLY_API_BASE_URL ?? "";

const API_ENDPOINT = `${API_BASE_URL}/api/urls`;
const IS_VITE_DEV = import.meta.env.DEV;
const REDIRECT_BASE_URL = window.TRIMLY_REDIRECT_BASE_URL
  ?? (IS_VITE_DEV ? "http://localhost:8080" : API_BASE_URL || window.location.origin);
const HISTORY_KEY = "trimly.recentLinks";
const MAX_HISTORY_ITEMS = 5;

const form = document.querySelector("#shorten-form");
const input = document.querySelector("#url-input");
const urlField = document.querySelector(".url-field");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const resultCard = document.querySelector("#result-card");
const shortUrlAnchor = document.querySelector("#short-url");
const copyButton = document.querySelector("#copy-button");
const openButton = document.querySelector("#open-button");
const recentSection = document.querySelector("#recent-links");
const recentList = document.querySelector("#recent-list");
const clearHistoryButton = document.querySelector("#clear-history");

let currentShortUrl = "";

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("loading", isLoading);
  submitButton.querySelector(".button-label").textContent = isLoading ? "Creating link…" : "Shorten link";
}

function showMessage(message = "") {
  formMessage.textContent = message;
  urlField.classList.toggle("invalid", Boolean(message));
}

function buildShortUrl(token) {
  return `${REDIRECT_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(token)}`;
}

async function parseError(response) {
  try {
    const data = await response.json();
    return data.message || data.error || `Request failed (${response.status})`;
  } catch {
    return `Could not shorten this link (${response.status}).`;
  }
}

async function copyText(text, button, successLabel = "Copied!") {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  const label = button.querySelector("span");
  if (!label) return;
  const previous = label.textContent;
  label.textContent = successLabel;
  window.setTimeout(() => { label.textContent = previous; }, 1600);
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(item) {
  const links = loadHistory().filter((link) => link.shortUrl !== item.shortUrl);
  links.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(links.slice(0, MAX_HISTORY_ITEMS)));
  renderHistory();
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function renderHistory() {
  const links = loadHistory();
  recentSection.hidden = links.length === 0;
  recentList.innerHTML = links.map((link, index) => `
    <article class="recent-item">
      <div class="recent-original">
        <span>Original</span>
        <p title="${escapeHtml(link.originalUrl)}">${escapeHtml(link.originalUrl)}</p>
      </div>
      <div class="recent-short">
        <span>Short link</span>
        <a href="${escapeHtml(link.shortUrl)}" target="_blank" rel="noopener">${escapeHtml(link.shortUrl)}</a>
      </div>
      <button class="mini-copy" type="button" data-copy-index="${index}" aria-label="Copy short link" title="Copy short link">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </article>
  `).join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage();
  resultCard.hidden = true;

  const originalUrl = normalizeUrl(input.value);
  input.value = originalUrl;

  if (!isValidHttpUrl(originalUrl)) {
    showMessage("Enter a valid web address, such as https://example.com.");
    input.focus();
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: originalUrl })
    });

    if (!response.ok) throw new Error(await parseError(response));

    const data = await response.json();
    if (!data.shortToken) throw new Error("The server response did not include a short token.");

    currentShortUrl = buildShortUrl(data.shortToken);
    shortUrlAnchor.href = currentShortUrl;
    shortUrlAnchor.textContent = currentShortUrl;
    resultCard.hidden = false;
    saveToHistory({ originalUrl, shortUrl: currentShortUrl, createdAt: Date.now() });
  } catch (error) {
    const offlineHint = error instanceof TypeError
      ? "Could not reach the backend. Make sure it is running and CORS is enabled."
      : error.message;
    showMessage(offlineHint || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
});

input.addEventListener("input", () => showMessage());
copyButton.addEventListener("click", () => copyText(currentShortUrl, copyButton));
openButton.addEventListener("click", () => window.open(currentShortUrl, "_blank", "noopener"));

recentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy-index]");
  if (!button) return;
  const link = loadHistory()[Number(button.dataset.copyIndex)];
  if (link) copyText(link.shortUrl, button);
});

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

renderHistory();
