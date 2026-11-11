const STORAGE_KEY = 'buildbuddy.priceFeed.v1';

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validatePriceFeed(raw, knownIds) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('The file must contain a JSON object.');
  if (raw.schemaVersion !== 1) throw new Error('Unsupported file format. Expected schemaVersion 1.');
  if (raw.currency !== 'BRL') throw new Error('The price file must use BRL currency.');
  if (!validDate(raw.checkedAt)) throw new Error('checkedAt must be a valid date in YYYY-MM-DD format.');
  if (!Array.isArray(raw.prices)) throw new Error('The prices field must be an array.');

  const seen = new Set();
  const prices = raw.prices.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Price entry ${index + 1} is not an object.`);
    if (typeof item.id !== 'string' || !knownIds.has(item.id)) throw new Error(`Unknown catalog item ID in entry ${index + 1}: ${String(item.id)}.`);
    if (seen.has(item.id)) throw new Error(`Duplicate item ID: ${item.id}.`);
    seen.add(item.id);
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) throw new Error(`Invalid BRL price for ${item.id}.`);
    if (typeof item.source !== 'string' || !item.source.trim()) throw new Error(`Missing retailer/source for ${item.id}.`);
    let url;
    try { url = new URL(item.url); } catch { throw new Error(`Invalid product URL for ${item.id}.`); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Product URL for ${item.id} must use HTTP or HTTPS.`);
    if (!['in_stock', 'out_of_stock', 'unknown'].includes(item.availability)) throw new Error(`Invalid availability for ${item.id}.`);
    return { id: item.id, price: item.price, source: item.source.trim(), url: url.href, availability: item.availability };
  });

  return { schemaVersion: 1, checkedAt: raw.checkedAt, currency: 'BRL', prices };
}

export function loadPriceFeed(knownIds) {
  try {
    const raw = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) || 'null');
    return raw ? validatePriceFeed(raw, knownIds) : null;
  } catch {
    // Storage can be unavailable on file previews, private windows, or restricted origins.
    return null;
  }
}

export function savePriceFeed(feed) {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
    return true;
  } catch {
    return false;
  }
}

export function clearPriceFeed() {
  try {
    globalThis.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function makePriceTemplate() {
  return {
    schemaVersion: 1,
    checkedAt: new Date().toISOString().slice(0, 10),
    currency: 'BRL',
    prices: []
  };
}
