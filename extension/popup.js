const $ = (id) => document.getElementById(id);

const els = {
  status: $('status'),
  dot: $('dot'),
  detected: $('detected'),
  list: $('list'),
  source: $('source'),
  scanSource: $('scanSource'),
  manual: $('manual'),
  input: $('input'),
  result: $('result'),
};

const short = (value) => (value.length > 20 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value);
const isAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value.trim());
const isHash = (value) => /^0x[a-fA-F0-9]{64}$/.test(value.trim());

const CHAIN_NAMES = {
  ETH: 'Ethereum',
  BSC: 'BNB Chain',
  POLYGON: 'Polygon',
  ARB: 'Arbitrum',
  BASE: 'Base',
  OP: 'Optimism',
  AVAX: 'Avalanche',
};

/** The API takes the chain as a field, so read it off the explorer's host. */
function chainFor(url) {
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch (error) {
    return 'ETH';
  }
  if (/(^|\.)bscscan\.com$/i.test(host)) return 'BSC';
  if (/(^|\.)polygonscan\.com$/i.test(host)) return 'POLYGON';
  if (/(^|\.)arbiscan\.io$/i.test(host)) return 'ARB';
  if (/(^|\.)basescan\.org$/i.test(host)) return 'BASE';
  if (/(^|\.)optimistic\.etherscan\.io$/i.test(host)) return 'OP';
  if (/(^|\.)snowtrace\.io$/i.test(host) || /(^|\.)snowscan\.xyz$/i.test(host)) return 'AVAX';
  return 'ETH';
}

let currentChain = 'ETH';
let scanToken = 0;

const chainSelect = $('chain');

/* Every chain the backend routes (mirrors backend/feature_extractor.py).
   Auto-detection only covers the big explorers, so the dropdown is the
   reliable way to pick a newer chain. */
Object.assign(CHAIN_NAMES, {
  LINEA: 'Linea',
  SCROLL: 'Scroll',
  MANTLE: 'Mantle',
  BLAST: 'Blast',
  ZKSYNC: 'zkSync Era',
  CELO: 'Celo',
  GNOSIS: 'Gnosis',
  SONIC: 'Sonic',
  WORLD: 'World Chain',
  UNICHAIN: 'Unichain',
  BERACHAIN: 'Berachain',
  SEI: 'Sei',
  MONAD: 'Monad',
  HYPEREVM: 'HyperEVM',
  INK: 'Ink',
  SONEIUM: 'Soneium',
  ABSTRACT: 'Abstract',
  KATANA: 'Katana',
  PLASMA: 'Plasma',
  MEGAETH: 'MegaETH',
  STABLE: 'Stable',
  ROBINHOOD: 'Robinhood Chain',
  ARC: 'Arc',
  FRAXTAL: 'Fraxtal',
  TAIKO: 'Taiko',
  XDC: 'XDC Network',
  BTT: 'BitTorrent Chain',
  MEMECORE: 'Memecore',
  FANTOM: 'Fantom',
  CRONOS: 'Cronos',
  KAVA: 'Kava',
  METIS: 'Metis',
  MANTA: 'Manta Pacific',
  FUSE: 'Fuse',
  TELOS: 'Telos',
  MERLIN: 'Merlin Chain',
  ELYSIUM: 'Elysium',
  APECHAIN: 'ApeChain',
  FLOW: 'Flow EVM',
  INJECTIVE: 'Injective EVM',
  HEDERA: 'Hedera',
  PULSECHAIN: 'PulseChain',
});

if (chainSelect) {
  chainSelect.innerHTML = Object.entries(CHAIN_NAMES)
    .map(([code, name]) => `<option value="${code}">${name}</option>`)
    .join('');
}

function setChain(chain) {
  currentChain = CHAIN_NAMES[chain] ? chain : 'ETH';
  if (chainSelect.value !== currentChain) chainSelect.value = currentChain;
}

function status(text, state = 'idle') {
  els.status.textContent = text;
  els.dot.dataset.state = state;
}

/**
 * Runs inside the page. Must stay self-contained: Chrome serialises this
 * function and evaluates it in the tab, so it cannot close over this file.
 */
function collectCandidates() {
  const text = document.body ? document.body.innerText || '' : '';
  const addresses = [];
  const seen = new Set();
  const re = /0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/g;
  let match;

  while ((match = re.exec(text)) !== null && addresses.length < 8) {
    const address = match[0].toLowerCase();
    if (seen.has(address)) continue;
    seen.add(address);
    const before = text.slice(Math.max(0, match.index - 48), match.index).replace(/\s+/g, ' ').trim();
    addresses.push({ address, context: before.slice(-46) });
  }

  const hashes = Array.from(new Set(text.match(/0x[a-fA-F0-9]{64}/g) || [])).slice(0, 3);

  const codeBlocks = Array.from(document.querySelectorAll('pre, code, textarea'))
    .map((node) => node.textContent || '')
    .filter((content) => /pragma\s+solidity/i.test(content) && content.length > 80);

  return {
    addresses,
    hashes,
    code: codeBlocks[0] ? codeBlocks[0].trim().slice(0, 200000) : null,
    selection: String(window.getSelection() || '').trim(),
    title: document.title,
    url: location.href,
  };
}

function addItem(address, context) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'item';

  const addr = document.createElement('span');
  addr.className = 'addr';
  addr.textContent = short(address);

  const ctx = document.createElement('span');
  ctx.className = 'ctx';
  ctx.textContent = context || 'on page';

  button.append(addr, ctx);
  button.addEventListener('click', () => void scan(address));
  els.list.append(button);
}

function renderResult(data, address) {
  const tone = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low', SAFE: 'safe' }[
    data.verdict
  ] || 'medium';

  els.result.replaceChildren();
  els.result.hidden = false;
  els.result.dataset.tone = tone;

  const row = document.createElement('div');
  row.className = 'score-row';

  const score = document.createElement('div');
  score.className = 'score';
  score.textContent = String(data.risk_score);
  const unit = document.createElement('span');
  unit.className = 'unit';
  unit.textContent = '/100';
  score.append(unit);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const chip = document.createElement('span');
  chip.className = `chip ${tone}`;
  chip.textContent = data.verdict || 'UNKNOWN';
  const label = document.createElement('p');
  label.className = 'vlabel';
  label.textContent = data.verdict_label || '';
  meta.append(chip, label);

  row.append(score, meta);
  els.result.append(row);

  const basis = document.createElement('p');
  basis.className = 'basis';
  const parts = [];
  if (typeof data.rule_score === 'number') parts.push(`rules ${data.rule_score}`);
  if (typeof data.ai_score === 'number') parts.push(`model ${data.ai_score}`);
  if (typeof data.confidence === 'number') parts.push(`${Math.round(data.confidence * 100)}% confidence`);

  basis.textContent = parts.length
    ? parts.join(' · ')
    : data.model_used
      ? 'Basis: model score with SHAP attribution'
      : 'Basis: policy rule, the model did not run';
  els.result.append(basis);

  if (data.status && data.status !== 'VERIFIED') {
    const note = document.createElement('p');
    note.className = 'basis';
    note.textContent =
      data.status === 'PROXY_RESOLVED'
        ? 'Scored on the implementation behind the proxy.'
        : data.status === 'BYTECODE_ONLY'
          ? 'Source is unverified; scored from bytecode alone.'
          : 'Not enough evidence for a confident verdict.';
    els.result.append(note);
  }

  if (Array.isArray(data.flags) && data.flags.length > 0) {
    const list = document.createElement('ul');
    list.className = 'flags';
    data.flags.slice(0, 5).forEach((flag) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = flag.name;
      const severity = document.createElement('em');
      severity.className = String(flag.severity || '').toLowerCase();
      severity.textContent = flag.severity || '';
      item.append(name, severity);
      list.append(item);
    });
    els.result.append(list);
  }

  if (address) {
    const line = document.createElement('p');
    line.className = 'addr-line';
    line.textContent = `${address} · ${CHAIN_NAMES[currentChain] || currentChain}`;
    els.result.append(line);
  }

  status('', 'done');
}

async function scan(input) {
  const value = (input || '').trim();

  if (isHash(value)) {
    status(
      'That is a 64-character transaction or pool hash, not a contract address. Copy the token contract instead.',
      'warn',
    );
    return;
  }

  const looksLikeSource = /pragma\s+solidity|contract\s+\w+/i.test(value);
  if (!isAddress(value) && !looksLikeSource) {
    status('Paste a 42-character contract address (0x plus 40 characters) or Solidity source.', 'warn');
    return;
  }

  const token = ++scanToken;
  status('Scanning…', 'busy');
  els.result.hidden = true;

  // The free server sleeps between visits, so the first check can queue behind
  // a cold start. Say that instead of leaving the popup looking frozen.
  const slow = setTimeout(() => {
    if (token === scanToken) {
      status('Waking the scanner. The free server sleeps between visits, so a first check can take a minute.', 'busy');
    }
  }, 4000);

  let response;
  try {
    response = await chrome.runtime.sendMessage({ type: 'sx:analyze', input: value, chain: currentChain });
  } catch (error) {
    clearTimeout(slow);
    status('Could not reach the background worker. Reopen the popup.', 'warn');
    return;
  }

  clearTimeout(slow);
  if (token !== scanToken) return;

  if (!response) {
    status('No response from the background worker. Reopen the popup.', 'warn');
    return;
  }

  if (response.status === 0) {
    status(response.body?.error || 'Could not reach the scanner. Try again in a moment.', 'warn');
    return;
  }

  if (!response.ok) {
    if (response.status === 429) {
      const wait = response.body?.retry_after;
      status(
        wait
          ? `Rate limited by the API. Try again in ${wait}s.`
          : 'Rate limited by the API. Try again in a minute.',
        'warn',
      );
      return;
    }
    status(response.body?.error || response.body?.detail || `Scan failed (${response.status}).`, 'warn');
    return;
  }

  renderResult(response.body, isAddress(value) ? value : null);
}

async function init() {
  els.manual.addEventListener('submit', (event) => {
    event.preventDefault();
    void scan(els.input.value);
  });

  chainSelect.addEventListener('change', () => setChain(chainSelect.value));

  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (error) {
    status('Cannot read the active tab.', 'warn');
    return;
  }

  if (!tab || !/^https?:/i.test(tab.url || '')) {
    status('Open a regular web page, then click the icon again.', 'warn');
    return;
  }

  setChain(chainFor(tab.url));

  let page;
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectCandidates,
    });
    page = injection?.result;
  } catch (error) {
    status('This page blocks extension scripts. Paste an address below instead.', 'warn');
    return;
  }

  if (!page) {
    status('Nothing detected on this page. Paste an address below.', 'warn');
    return;
  }

  const selection = (page.selection || '').trim();

  if (isHash(selection)) {
    status('The selected text is a 64-character hash, not a contract address.', 'warn');
  } else if (isAddress(selection)) {
    status('Scanning the selected address…', 'busy');
    void scan(selection);
  }

  if (page.addresses.length > 0) {
    els.detected.hidden = false;
    page.addresses.forEach((item) => addItem(item.address, item.context));
    if (!isAddress(selection)) {
      status(
        `${page.addresses.length} address${page.addresses.length === 1 ? '' : 'es'} found on ${CHAIN_NAMES[currentChain]}. Pick one, or paste below.`,
      );
    }
  } else if (!isAddress(selection)) {
    status('No contract address found here. Paste one below.', 'warn');
  }

  if (page.code) {
    els.source.hidden = false;
    els.scanSource.addEventListener('click', () => void scan(page.code));
  } else if (!page.addresses.length && !isAddress(selection)) {
    const note = document.createElement('p');
    note.className = 'status';
    note.textContent = page.hashes.length
      ? 'Only 64-character pool or transaction hashes were found, which are not contracts.'
      : '';
    if (note.textContent) els.status.after(note);
  }
}

void init();
