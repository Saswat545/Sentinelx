const API = 'https://sentinelx-iz11.onrender.com';
const CACHE_TTL = 10 * 60 * 1000;

/**
 * The API only allows browser origins on its CORS list, and a chrome-extension
 * origin is not one of them. Fetches from the service worker are not subject to
 * CORS because the manifest holds a host permission for the API.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== 'sx:analyze') return undefined;

  analyze(message.input)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, status: 0, body: { error: String(error) } }));

  return true; // keep the message channel open for the async reply
});

async function analyze(input) {
  const key = `sx:${input.slice(0, 80)}`;

  try {
    const stored = await chrome.storage.session.get(key);
    const hit = stored?.[key];
    if (hit && Date.now() - hit.at < CACHE_TTL) return hit.payload;
  } catch (error) {
    // storage is best effort; a miss just means another request
  }

  const response = await fetch(`${API}/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input, chain: 'ETH' }),
  });

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    body = { error: `Unreadable response (${response.status})` };
  }

  const payload = { ok: response.ok, status: response.status, body };

  if (response.ok) {
    try {
      await chrome.storage.session.set({ [key]: { at: Date.now(), payload } });
    } catch (error) {
      // ignore quota errors
    }
  }

  return payload;
}
