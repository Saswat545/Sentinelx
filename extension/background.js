const API = 'https://sentinelx-iz11.onrender.com';
const CACHE_TTL = 10 * 60 * 1000;

// Render's free instance stops when idle, and a cold wake was measured at over
// a minute. Give the request room to outlast that instead of failing early.
const REQUEST_TIMEOUT = 90 * 1000;

const CHAINS = new Set(['ETH', 'BSC', 'POLYGON', 'ARB', 'BASE', 'OP', 'AVAX']);

/**
 * The API only allows browser origins on its CORS list, and a chrome-extension
 * origin is not one of them. Fetches from the service worker are not subject to
 * CORS because the manifest holds a host permission for the API.
 *
 * `chain` travels with the request because the same address format is used on
 * every EVM chain; the popup derives it from the explorer's hostname.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== 'sx:analyze') return undefined;

  analyze(message.input, message.chain)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, status: 0, body: { error: String(error) } }));

  return true; // keep the message channel open for the async reply
});

function normalizeChain(chain) {
  const value = String(chain || 'ETH').toUpperCase();
  return CHAINS.has(value) ? value : 'ETH';
}

async function analyze(input, chain) {
  const network = normalizeChain(chain);
  const key = `sx:${network}:${input.slice(0, 80)}`;

  try {
    const stored = await chrome.storage.session.get(key);
    const hit = stored?.[key];
    if (hit && Date.now() - hit.at < CACHE_TTL) return hit.payload;
  } catch (error) {
    // storage is best effort; a miss just means another request
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response;
  try {
    response = await fetch(`${API}/analyze`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input, chain: network }),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      body: {
        error: timedOut
          ? `No answer after ${REQUEST_TIMEOUT / 1000}s. The server may still be waking, so try again in a moment.`
          : 'Could not reach the scanner. Check your connection and try again.',
      },
    };
  } finally {
    clearTimeout(timer);
  }

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
