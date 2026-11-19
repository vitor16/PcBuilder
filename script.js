import { categoryInfo, categories, catalog, presets, presetInfo } from './js/data.js';
import {
  money, getPart, totalPrice, estimateWatts, evaluate, estimateGames, estimateRayTracingGames, gamesSummary,
  quickSpecs, specRows, FPS_TARGET
} from './js/logic.js';
import { clearPriceFeed, loadPriceFeed, makePriceTemplate, savePriceFeed, validatePriceFeed } from './js/price-feed.js';

// The 3D preview loads Three.js from a CDN. It is imported in init3D() so the parts list still works if that fails.
let THREE = null;
let OrbitControls = null;
let RoomEnvironment = null;
let createKit = null;
let buildCase = null;
let buildBoard = null;
let buildStorage = null;
let buildGpu = null;
let buildCables = null;

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const renderSpecValue = (value) => {
  if (value && typeof value === 'object' && typeof value.text === 'string' && typeof value.href === 'string') {
    return `<a href="${escapeHTML(value.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(value.text)}</a>`;
  }
  return escapeHTML(value);
};
const colorHex = (number) => `#${Number(number || 0x35e0ff).toString(16).padStart(6, '0').slice(-6)}`;
const STARTING_BUDGET = 4500;
const THEME_STORAGE_KEY = 'buildbuddy.theme.v1';
const allParts = Object.values(catalog).flat();
const knownIds = new Set(allParts.map((p) => p.id));
const originalPrices = new Map(allParts.map((p) => [p.id, p.price]));
let importedFeed = loadPriceFeed(knownIds);
let priceMeta = new Map();

function applyFeed(feed) {
  for (const part of allParts) part.price = originalPrices.get(part.id);
  priceMeta = new Map();
  if (feed) {
    for (const item of feed.prices) {
      const part = allParts.find((p) => p.id === item.id);
      if (part) {
        part.price = item.price;
        priceMeta.set(item.id, item);
      }
    }
  }
  importedFeed = feed;
}
applyFeed(importedFeed);

let selected = { ...presets.esports };
let activePreset = 'esports';
let activeCategory = 'cpu';
let resolution = '1080';
let graphicsMode = 'raster';
const openDetails = new Set();
let toastTimer;
let scene, camera, renderer, controls, kit, pcRoot, modelParts = {}, raycaster, pointer, clock, resizeObserver, environmentTarget;
let fanMultiplier = 1;
let exploded = 0;
let lightingOn = true;
let showGlass = true;
let showCase = true;
let currentView = 'home';

function getInitialTheme() {
  try {
    const savedTheme = globalThis.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (error) {
    console.warn('The saved theme preference could not be read.', error);
  }
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

function setTheme(theme, save = false) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  const button = $('themeToggle');
  button.textContent = isDark ? 'Light theme' : 'Dark theme';
  button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  button.setAttribute('aria-pressed', String(isDark));

  if (!save) return;
  try {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('The theme preference could not be saved.', error);
    showToast('Theme changed for this visit, but the preference could not be saved.');
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2700);
}

function currentParts() {
  return Object.fromEntries(categories.map((cat) => [cat, getPart(selected, cat)]));
}

/** True when choosing this part adds no new compatibility errors. */
function compatibleCandidate(category, candidate) {
  const proposed = { ...selected, [category]: candidate.id };
  const before = new Set(evaluate(selected).errors.map((e) => e.text));
  return evaluate(proposed).errors.every((e) => before.has(e.text));
}

const stockLabel = (availability) => ({
  in_stock: 'In stock',
  out_of_stock: 'Out of stock'
}[availability] || 'Stock unknown');

function renderPresets() {
  const scratch = `<button class="preset preset-scratch${activePreset === 'scratch' ? ' is-active' : ''}" type="button" data-preset="scratch" aria-pressed="${activePreset === 'scratch'}">
    <span class="preset-label">Build from scratch</span>
    <span class="preset-blurb">Start with no parts selected and choose each component yourself.</span>
    <span class="preset-total">Empty build</span>
  </button>`;
  $('presets').innerHTML = scratch + Object.entries(presetInfo).map(([name, info]) => {
    const isActive = activePreset === name;
    const missing = missingPriceCount(presets[name]);
    return `<button class="preset${isActive ? ' is-active' : ''}" type="button" data-preset="${escapeHTML(name)}" aria-pressed="${isActive}">
      <span class="preset-label">${escapeHTML(info.label)}</span>
      <span class="preset-blurb">${escapeHTML(info.blurb)}</span>
      <span class="preset-total">${missing ? `${missing} prices missing` : `~${money(totalPrice(presets[name]))}`}</span>
    </button>`;
  }).join('');
}

function renderTabs() {
  $('tabs').innerHTML = categories.map((cat, index) => {
    const info = categoryInfo[cat];
    const chosen = Boolean(getPart(selected, cat));
    const active = activeCategory === cat;
    return `<button class="tab${active ? ' is-active' : ''}${chosen ? ' is-chosen' : ''}" role="tab" aria-selected="${active}" data-category="${cat}" type="button" title="${chosen ? 'Chosen' : 'Not chosen yet'}">
      <span class="tab-number">${index + 1}</span>
      <span class="tab-label">${escapeHTML(info.short)}</span>
      <span class="tab-dot" aria-hidden="true"></span>
    </button>`;
  }).join('');
}

function partCard(part, cat) {
  const isChosen = selected[cat] === part.id;
  const source = priceMeta.get(part.id);
  const referencePrice = originalPrices.get(part.id);
  const hasReferencePrice = Number.isFinite(referencePrice);
  const quick = quickSpecs(cat, part).map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('');
  const full = specRows(cat, part).map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${renderSpecValue(value)}</dd></div>`).join('');
  const priceText = source ? money(part.price) : hasReferencePrice
    ? referencePrice > 0 ? `~${money(referencePrice)}` : 'No extra cost'
    : 'Price unavailable';
  const priceSource = source ? `Checked on KaBuM ${escapeHTML(importedFeed.checkedAt)}` : hasReferencePrice
    ? referencePrice > 0 ? 'Catalog estimate · verify current offer' : 'Free, included or visual-only'
    : 'No catalog price';
  const stock = source ? `<span class="stock stock-${escapeHTML(source.availability)}">${stockLabel(source.availability)}</span>` : '';
  const offerUrl = source?.url || `https://www.kabum.com.br/busca/${encodeURIComponent(part.name)}`;
  const offer = `<a class="offer-link" href="${escapeHTML(offerUrl)}" target="_blank" rel="noopener noreferrer">${source ? 'View KaBuM offer' : 'Search on KaBuM'}</a>`;

  return `<article class="part-card${isChosen ? ' is-chosen' : ''}">
    <div class="part-top">
      <div class="part-title">
        ${part.tag ? `<p class="part-tag">${escapeHTML(part.tag)}</p>` : ''}
        <h3 class="part-name">${escapeHTML(part.name)}</h3>
        <p class="part-short">${escapeHTML(part.short)}</p>
      </div>
      <p class="part-price">${escapeHTML(priceText)}</p>
    </div>
    <dl class="quick-specs">${quick}</dl>
    <details class="part-more" data-detail="${escapeHTML(part.id)}"${openDetails.has(part.id) ? ' open' : ''}>
      <summary>More details</summary>
      <p>${escapeHTML(part.desc)}</p>
      <p><strong>Good for:</strong> ${escapeHTML(part.fit)}</p>
      ${part.watch ? `<p class="part-watch"><strong>Keep in mind:</strong> ${escapeHTML(part.watch)}</p>` : ''}
      <dl class="full-specs">${full}</dl>
      ${part.sourceUrl ? `<a class="offer-link" href="${escapeHTML(part.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official product information</a>` : ''}
      ${offer}
    </details>
    <div class="part-foot">
      <div class="part-source">
        <span>${priceSource}</span>
        ${stock}
      </div>
      <button class="choose-btn" type="button" data-part="${escapeHTML(part.id)}" aria-pressed="${isChosen}">${isChosen ? 'Chosen' : 'Choose this'}</button>
    </div>
  </article>`;
}

function renderParts() {
  const info = categoryInfo[activeCategory];
  const index = categories.indexOf(activeCategory);
  $('stepIndex').textContent = `Step ${index + 1} of ${categories.length}`;
  $('stepTitle').textContent = info.label;
  $('stepText').textContent = info.text;
  $('stepTip').textContent = info.note;
  $('prevBtn').disabled = index === 0;
  $('nextBtn').textContent = index === categories.length - 1 ? 'Back to the start' : 'Next part →';

  const query = $('partSearch').value.trim().toLowerCase();
  let items = [...catalog[activeCategory]];
  const isCpu = activeCategory === 'cpu';
  const isGpu = activeCategory === 'gpu';
  $('cpuVendorFilterWrap').hidden = !isCpu;
  $('cpuGenerationFilterWrap').hidden = !isCpu;
  $('gpuVendorFilterWrap').hidden = !isGpu;
  $('gpuGenerationFilterWrap').hidden = !isGpu;
  if (isCpu || isGpu) {
    const vendor = $(isCpu ? 'cpuVendorFilter' : 'gpuVendorFilter').value;
    const select = $(isCpu ? 'cpuGenerationFilter' : 'gpuGenerationFilter');
    const priorValue = select.value;
    const vendorItems = items.filter((part) => !vendor || part.vendor === vendor);
    const generations = [...new Set(vendorItems.map((part) => part.generation))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const label = isCpu ? 'All CPU generations' : 'All GPU generations';
    select.innerHTML = `<option value="">${label}</option>${generations.map((generation) => `<option value="${escapeHTML(generation)}">${escapeHTML(generation)}</option>`).join('')}`;
    if (generations.includes(priorValue)) select.value = priorValue;
    const generation = select.value;
    items = items.filter((part) => (!vendor || part.vendor === vendor) && (!generation || part.generation === generation));
  }
  if ($('fitOnly').checked) items = items.filter((part) => compatibleCandidate(activeCategory, part));
  if (query) items = items.filter((part) => `${part.name} ${part.short} ${part.tag || ''} ${part.desc} ${part.vendor || ''} ${part.generation || ''}`.toLowerCase().includes(query));
  const sort = $('sortBy').value;
  if (sort === 'low') items.sort((a, b) =>
    (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity)
  );
  if (sort === 'high') items.sort((a, b) =>
    (Number.isFinite(b.price) ? b.price : -Infinity) - (Number.isFinite(a.price) ? a.price : -Infinity)
  );

  $('parts').innerHTML = items.length
    ? items.map((part) => partCard(part, activeCategory)).join('')
    : '<p class="empty-state">No parts match this search. Try a different word, or turn off “Only show parts that fit”.</p>';
}

function renderProgress() {
  const count = categories.filter((cat) => Boolean(getPart(selected, cat))).length;
  $('progressText').textContent = count === categories.length ? 'Every part is chosen' : `${count} of ${categories.length} parts chosen`;
  $('progressFill').style.width = `${(count / categories.length) * 100}%`;
}

function renderSummary() {
  const total = totalPrice(selected);
  const missing = missingPriceCount(selected);
  const unselected = categories.length - categories.filter((cat) => Boolean(getPart(selected, cat))).length;
  const budget = Number($('budget').value);
  const diff = budget - total;
  $('totalPrice').textContent = missing ? `Partial · ${money(total)}` : `~${money(total)}`;
  $('wattOut').textContent = `about ${estimateWatts(selected)} W`;
  $('budgetOut').textContent = money(budget);
  $('budgetFill').style.width = `${Math.min(100, (total / budget) * 100)}%`;
  $('budgetFill').classList.toggle('is-over', total > budget);
  $('budgetNote').textContent = unselected
    ? `${unselected} part${unselected === 1 ? ' is' : 's are'} not selected yet; totals are incomplete.${missing ? ` ${missing} selected item${missing === 1 ? ' has' : 's have'} no catalog price.` : ''}`
    : missing
    ? `${missing} selected item${missing === 1 ? ' has' : 's have'} no price; this total and budget comparison are partial.`
    : diff < 0
    ? `About ${money(-diff)} over budget. A cheaper graphics card or processor would close the gap.`
    : diff === 0 ? 'About exactly on budget.' : `About ${money(diff)} left to spend.`;
  $('list').innerHTML = categories.map((cat) => {
    const part = getPart(selected, cat);
    const referencePrice = part ? originalPrices.get(part.id) : undefined;
    const price = !part ? ''
      : priceMeta.has(part.id) ? money(part.price)
        : Number.isFinite(referencePrice) ? referencePrice > 0 ? `~${money(referencePrice)}` : 'Free / included'
          : 'No price';
    return `<li><span class="sum-cat">${escapeHTML(categoryInfo[cat].label)}</span><span class="sum-name">${escapeHTML(part?.name || 'Not chosen yet')}</span><span class="sum-price">${escapeHTML(price)}</span></li>`;
  }).join('');
}

function missingPriceCount(build) {
  return categories.reduce((count, cat) => {
    const part = getPart(build, cat);
    return count + (part && !Number.isFinite(part.price) ? 1 : 0);
  }, 0);
}

function renderCompatibility() {
  const report = evaluate(selected);
  const errors = report.errors.length;
  const warnings = report.warnings.length;
  const tone = errors ? 'bad' : warnings || report.incomplete ? 'warn' : 'good';
  $('status').className = `status status-${tone}`;
  $('statusTitle').textContent = errors
    ? `${errors} thing${errors > 1 ? 's' : ''} to fix`
    : report.incomplete ? 'Build in progress' : warnings ? 'Fits, with a few notes' : 'Everything fits together';
  $('statusText').textContent = errors
    ? 'Fix these before you buy anything.'
    : report.incomplete ? 'Choose the remaining parts to complete the compatibility checks.'
      : warnings ? 'Read the notes below before you order.' : 'Every check below passes for these parts.';
  $('checks').innerHTML = report.checks.map((item) => {
    const state = item.ok ? 'pass' : item.severity === 'warn' ? 'warn' : 'fix';
    const badge = item.ok ? 'Pass' : item.severity === 'warn' ? 'Check' : 'Fix';
    const jump = !item.ok && item.fixCat
      ? `<button class="link-btn" type="button" data-category="${item.fixCat}">Change ${escapeHTML(categoryInfo[item.fixCat].short)}</button>`
      : '';
    return `<li class="check ${state}">
      <span class="badge">${badge}</span>
      <div class="check-body">
        <strong>${escapeHTML(item.label)}</strong>
        <p>${escapeHTML(item.detail)}</p>
        ${jump}
      </div>
    </li>`;
  }).join('');
}

function gameRow(game) {
  if (game.fps === null) {
    return `<li class="game-row is-empty">
      <div class="game-info"><strong>${escapeHTML(game.name)}</strong><span>${escapeHTML(game.genre)}</span></div>
      <p class="game-note">${escapeHTML(game.note || 'Needs a graphics card')}</p>
    </li>`;
  }
  const width = Math.min(100, (game.fps / 144) * 100).toFixed(1);
  const target = ((FPS_TARGET / 144) * 100).toFixed(1);
  const measuredLabel = game.directBenchmark
    ? `${game.directBenchmark.resolution} · ${game.directBenchmark.settings.replace(/^In-game benchmark · /, '')}`
    : '';
  const sourceLink = game.directBenchmark
    ? `<a href="${escapeHTML(game.directBenchmark.chartUrl || game.directBenchmark.source.url)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : '';
  return `<li class="game-row">
    <div class="game-info"><strong>${escapeHTML(game.name)}</strong><span>${escapeHTML(game.genre)}</span></div>
    <div class="game-bar" aria-hidden="true">
      <span class="game-fill tone-${game.verdict.tone}" style="width: ${width}%"></span>
      <span class="game-target" style="left: ${target}%"></span>
    </div>
    <div class="game-value">
      <strong>${game.directBenchmark ? `${game.fps} fps average` : `about ${game.fps} fps`}</strong>
      <span class="verdict tone-${game.verdict.tone}">${game.directBenchmark
        ? `${escapeHTML(game.verdict.label)} · ${escapeHTML(measuredLabel)} · 1% low ${game.directBenchmark.onePercentLowFps} fps`
        : game.verdict.label}</span>
      ${sourceLink}
    </div>
  </li>`;
}

function renderGames() {
  const results = graphicsMode === 'ray-tracing'
    ? estimateRayTracingGames(selected, resolution)
    : estimateGames(selected, resolution);
  $('gamesSummary').textContent = gamesSummary(results, resolution);
  const benchmarkNote = $('gamesBenchmarkNote');
  const benchmark = results[0]?.cpuBenchmark;
  const rayTracingBenchmark = results.find((game) => game.directBenchmark)?.directBenchmark;
  benchmarkNote.hidden = graphicsMode !== 'ray-tracing' && !benchmark;
  benchmarkNote.innerHTML = graphicsMode === 'ray-tracing'
    ? `Only directly published results for the selected CPU, GPU and resolution are shown; settings vary by game. No matching result means no RT FPS is available. Upscaling and frame generation are not included.${rayTracingBenchmark
      ? ` Test system: ${escapeHTML(rayTracingBenchmark.source.testSystem)}; tested card: ${escapeHTML(rayTracingBenchmark.gpuBoard)}. <a href="${escapeHTML(rayTracingBenchmark.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(rayTracingBenchmark.source.title)}</a>.`
      : ''}`
    : benchmark
      ? `Reference ${escapeHTML(benchmark.source.test)} for ${escapeHTML(benchmark.cpuName)} + ${escapeHTML(benchmark.gpuName)}: ${benchmark.averageFps} fps average and ${benchmark.onePercentLowFps} fps 1% low. This aggregate is used to adjust the 1080p estimate; it is not a result for each listed game. <a href="${escapeHTML(benchmark.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(benchmark.source.title)}</a>.`
      : '';
  $('games').innerHTML = results.map(gameRow).join('');
  document.querySelectorAll('[data-res]').forEach((button) => {
    const on = button.dataset.res === resolution;
    button.classList.toggle('is-active', on);
    button.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('[data-graphics-mode]').forEach((button) => {
    const on = button.dataset.graphicsMode === graphicsMode;
    button.classList.toggle('is-active', on);
    button.setAttribute('aria-pressed', String(on));
  });
}

function renderPriceStatus() {
  $('priceResetBtn').hidden = !importedFeed;
  if (!importedFeed) {
    $('priceStatus').textContent = 'Catalog prices are planning estimates, not live offers. Import a checked KaBuM! price file to replace estimates with retailer-verified prices.';
    return;
  }
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${importedFeed.checkedAt}T00:00:00Z`));
  const count = importedFeed.prices.length;
  $('priceStatus').textContent = `${count} KaBuM price${count === 1 ? '' : 's'} imported, checked ${date}. Imported prices replace estimates for those items; all other listed prices are estimates, not live.`;
}

function renderAll() {
  renderPresets(); renderTabs(); renderParts(); renderProgress(); renderSummary();
  renderCompatibility(); renderGames(); renderPriceStatus();
}

function selectCategory(cat) {
  if (!categories.includes(cat)) return;
  activeCategory = cat;
  renderTabs(); renderParts();
  document.querySelector('.builder-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stepBy(offset) {
  const index = categories.indexOf(activeCategory);
  const next = (index + offset + categories.length) % categories.length;
  selectCategory(categories[next]);
}

function selectPart(id) {
  const part = catalog[activeCategory].find((p) => p.id === id);
  if (!part) return;
  selected[activeCategory] = id;
  activePreset = null;
  renderAll();
  rebuild3D();
}

function setPreset(name) {
  if (!presets[name]) return;
  selected = { ...presets[name] };
  activePreset = name;
  renderAll();
  rebuild3D();
  showToast('Build loaded. Change any part you like.');
}

function setScratchBuild() {
  selected = Object.fromEntries(categories.map((category) => [category, '']));
  activePreset = 'scratch';
  activeCategory = 'cpu';
  $('partSearch').value = '';
  $('cpuVendorFilter').value = '';
  $('cpuGenerationFilter').value = '';
  $('gpuVendorFilter').value = '';
  $('gpuGenerationFilter').value = '';
  $('sortBy').value = 'default';
  renderAll();
  rebuild3D();
  document.querySelector('.builder-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Empty build started. Choose each part to continue.');
}

function copyBuild() {
  const rows = categories.map((cat) => {
    const part = getPart(selected, cat);
    const referencePrice = part ? originalPrices.get(part.id) : undefined;
    const price = !part ? '-'
      : priceMeta.has(part.id) ? money(part.price)
        : Number.isFinite(referencePrice) ? referencePrice > 0 ? `~${money(referencePrice)}` : 'Free / included'
          : 'No price';
    return `${categoryInfo[cat].label}: ${part?.name || 'Not chosen'} (${price})`;
  });
  const missing = missingPriceCount(selected);
  const unselected = categories.filter((cat) => !getPart(selected, cat)).length;
  const totalLabel = unselected
    ? `Build incomplete: ${unselected} parts not selected`
    : missing ? `Partial total: ${money(totalPrice(selected))} (${missing} prices missing)` : `Estimated total: ~${money(totalPrice(selected))}`;
  const content = `BuildBuddy parts list\n\n${rows.join('\n')}\n\n${totalLabel}\nEstimated peak draw: about ${estimateWatts(selected)} W\n\nCatalog prices marked with ~ are planning estimates, not live offers. Imported KaBuM! prices are checked retailer listings. The game planner labels published results for exact tested setups; all other frame rates are model estimates.`;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(content).then(() => showToast('Parts list copied.')).catch(() => fallbackCopy(content));
  else fallbackCopy(content);
}
function fallbackCopy(content) {
  const area = document.createElement('textarea'); area.value = content; document.body.appendChild(area); area.select();
  try { document.execCommand('copy'); showToast('Parts list copied.'); } catch { showToast('Could not copy automatically.'); }
  area.remove();
}

// ---------- Verified price file ----------
function importPriceFeedFile(file) {
  if (!file) return;
  file.text().then((content) => {
    const raw = JSON.parse(content);
    const feed = validatePriceFeed(raw, knownIds);
    const saved = savePriceFeed(feed);
    applyFeed(feed);
    renderAll();
    showToast(saved
      ? `Imported ${feed.prices.length} KaBuM prices.`
      : 'KaBuM prices loaded for this visit, but could not be saved in this browser.');
  }).catch((error) => showToast(error?.message || 'Could not read the price file.'));
}
function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

$('priceImportBtn').addEventListener('click', () => $('priceImportInput').click());
$('priceImportInput').addEventListener('change', (event) => {
  importPriceFeedFile(event.target.files?.[0]);
  event.target.value = '';
});
$('priceTemplateBtn').addEventListener('click', () => downloadJson('buildbuddy-price-update-template.json', makePriceTemplate()));
$('priceResetBtn').addEventListener('click', () => {
  clearPriceFeed(); applyFeed(null); renderAll(); showToast('Cleared imported KaBuM prices.');
});

// ---------- 3D PC builder ----------
async function init3D() {
  const canvas = $('pcCanvas');
  setStageTip('Loading the 3D preview…');
  try {
    const [three, orbit, room, kitModule, caseModule, boardModule, gpuModule] = await Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/environments/RoomEnvironment.js'),
      import('./js/kit.js'),
      import('./js/case.js'),
      import('./js/board.js'),
      import('./js/gpu.js')
    ]);
    THREE = three;
    OrbitControls = orbit.OrbitControls;
    RoomEnvironment = room.RoomEnvironment;
    createKit = kitModule.createKit;
    buildCase = caseModule.buildCase;
    buildBoard = boardModule.buildBoard;
    buildStorage = boardModule.buildStorage;
    buildGpu = gpuModule.buildGpu;
    buildCables = gpuModule.buildCables;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(6.6, 4.9, 7.0);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentScene = new RoomEnvironment();
    environmentTarget = pmremGenerator.fromScene(environmentScene, 0.04);
    scene.environment = environmentTarget.texture;
    environmentScene.dispose();
    pmremGenerator.dispose();
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 2.4, 0);
    controls.minDistance = 3.2;
    controls.maxDistance = 20;
    controls.minPolarAngle = Math.PI * 0.04;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.enablePan = true;
    scene.add(new THREE.HemisphereLight(0xe4f2ff, 0x566474, 2.6));
    scene.add(new THREE.AmbientLight(0xd0e2f0, 0.85));
    const key = new THREE.DirectionalLight(0xe4f2ff, 3.2);
    key.position.set(4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0002; key.shadow.normalBias = 0.035; key.shadow.radius = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb4dcf5, 1.8);
    rim.position.set(-4, 5, -3); scene.add(rim);
    const frontFill = new THREE.DirectionalLight(0xffefdc, 2.0);
    frontFill.position.set(1, 3, 8); scene.add(frontFill);
    const fill = new THREE.PointLight(0x8ddcff, 8, 12); fill.position.set(-3, 2.8, 3); scene.add(fill);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.5, 64), new THREE.MeshStandardMaterial({ color: 0x101b26, roughness: 0.7, metalness: 0.15 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.04; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(9, 30, 0x294357, 0x1c2d3c); grid.position.y = -0.025; grid.material.transparent = true; grid.material.opacity = 0.22; scene.add(grid);
    kit = createKit();
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2(); clock = new THREE.Clock();
    canvas.addEventListener('pointerdown', onCanvasPick);
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize3D);
      resizeObserver.observe($('stage'));
    } else {
      window.addEventListener('resize', resize3D);
    }
    setStageTip('Drag to turn · right-drag to pan · scroll to zoom · click a part to open its step');
    resize3D();
    rebuild3D();
    animate3D();
  } catch (error) {
    console.error(error);
    setStageTip('The 3D preview could not start. It needs an internet connection and WebGL. The parts list still works.', true);
  }
}

function setStageTip(message, isError = false) {
  $('stageTip').textContent = message;
  $('stageTip').classList.toggle('is-error', isError);
}

function resize3D() {
  if (!renderer || !camera) return;
  const rect = $('stage').getBoundingClientRect();
  const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height; camera.updateProjectionMatrix();
}

function disposeGroup(group) {
  if (!group) return;
  const materials = new Set();
  const textures = new Set();
  group.traverse((object) => {
    if (object.geometry && !kit.sharedGeometries.has(object.geometry)) object.geometry.dispose();
    for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
      if (!material || kit.sharedMaterials.has(material)) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && !kit.sharedTextures.has(value)) textures.add(value);
      }
    }
  });
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
}

function rebuild3D() {
  if (!scene || !kit) return;
  if (pcRoot) { scene.remove(pcRoot); disposeGroup(pcRoot); }
  kit.resetFans();
  pcRoot = new THREE.Group();
  scene.add(pcRoot);
  const parts = currentParts();
  try {
    const previewCase = parts.case || getPart({ case: 'mesh' }, 'case');
    const previewFans = parts.fans || getPart({ fans: 'included' }, 'fans');
    const previewLighting = parts.lighting || getPart({ lighting: 'off' }, 'lighting');
    const anchors = buildCase(kit, previewCase, previewFans, parts.psu);
    modelParts.case = anchors.group;
    pcRoot.add(anchors.group);
    modelParts.board = null;
    modelParts.storage = null;
    modelParts.gpu = null;
    modelParts.cables = null;
    const hasBoardComponents = [parts.cpu, parts.cooler, parts.motherboard, parts.ram, parts.storage].every(Boolean);
    if (hasBoardComponents) {
      const board = buildBoard(kit, anchors, { ...parts, board: parts.motherboard });
      modelParts.board = board.group;
      modelParts.board.userData.baseZ = board.group.position.z;
      pcRoot.add(board.group);
      const storage = buildStorage(kit, parts.storage, anchors);
      modelParts.storage = storage;
      if (storage) pcRoot.add(storage);
      const gpu = buildGpu(kit, parts.gpu, board);
      modelParts.gpu = gpu;
      if (gpu) { gpu.userData.baseZ = gpu.position.z; pcRoot.add(gpu); }
      const cables = buildCables(kit, anchors, board, gpu, parts.cpu, parts.cooler, parts.storage);
      modelParts.cables = cables;
      pcRoot.add(cables);
    }
    modelParts.glass = [];
    pcRoot.traverse((object) => {
      if (object.isMesh && object.userData.isGlass) modelParts.glass.push(object);
      if (object.isMesh && object.userData.isGlass) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
    const light = new THREE.PointLight(previewLighting.color || 0x35e0ff, 3.2, 6.5);
    light.position.set(1.2, 2.5, 1.1); pcRoot.add(light); kit.addLight(light, 3.2);
    const interiorFill = new THREE.PointLight(0xffedcf, 17, 8, 1.7);
    interiorFill.position.set(-0.2, 2.7, 1.25); pcRoot.add(interiorFill);
    const lowerFill = new THREE.PointLight(0xc0e5ff, 9, 7, 1.8);
    lowerFill.position.set(-1.25, 1.35, 0.55); pcRoot.add(lowerFill);
    const boardFill = new THREE.PointLight(0xffffff, 10, 5, 1.6);
    boardFill.position.set(-0.2, 3.1, 2.1); pcRoot.add(boardFill);
    kit.setLighting(previewLighting.mode, colorHex(previewLighting.color), lightingOn);
    update3DControls();
    setStageTip(hasBoardComponents
      ? 'Drag to turn · right-drag to pan · scroll to zoom · click a part to open its step'
      : 'Choose a CPU, cooler, motherboard, RAM and storage to preview the interior.');
    const gpuFans = !parts.gpu || parts.gpu.id === 'none' ? 0 : parts.gpu.kind === 'triple' ? 3 : 2;
    $('fanHud').textContent = `${anchors.fanCount + gpuFans} fans, animated`;
    $('caseHud').textContent = parts.case ? parts.case.name : `Preview case · ${previewCase.name}`;
  } catch (error) {
    console.error('3D rebuild failed:', error);
    setStageTip(`The 3D model could not be built: ${error?.message || 'unknown error'}. Try another part or build.`, true);
  }
}

function update3DControls() {
  if (!kit) return;
  const lighting = getPart(selected, 'lighting') || getPart({ lighting: 'off' }, 'lighting');
  kit.setLighting(lighting.mode, colorHex(lighting.color), lightingOn);
  if (modelParts.case) modelParts.case.visible = showCase;
  for (const mesh of (modelParts.glass || [])) { mesh.visible = showGlass; }
  if (modelParts.board) modelParts.board.position.z = (modelParts.board.userData.baseZ ?? modelParts.board.position.z) - exploded * 0.006;
  if (modelParts.gpu) modelParts.gpu.position.z = (modelParts.gpu.userData.baseZ ?? modelParts.gpu.position.z) + exploded * 0.012;
}

function animate3D() {
  requestAnimationFrame(animate3D);
  if (!renderer || !scene || !camera) return;
  const delta = Math.min(clock.getDelta(), 0.05);
  kit?.tick(clock.elapsedTime);
  kit?.tickFans(delta, fanMultiplier);
  controls?.update();
  renderer.render(scene, camera);
}

function onCanvasPick(event) {
  if (!renderer || !camera || !pcRoot) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(pcRoot, true);
  const hit = hits.find((item) => item.object.userData.category);
  if (!hit) return;
  selectCategory(hit.object.userData.category);
  $('hoverName').textContent = categoryInfo[hit.object.userData.category]?.label || 'Part';
  $('hoverName').hidden = false;
  setTimeout(() => { $('hoverName').hidden = true; }, 1400);
}

function setCamera(view) {
  if (!camera || !controls) { showToast('The 3D camera is unavailable in this browser.'); return; }
  const positions = {
    home: [6.6, 4.9, 7.0], side: [0.0, 2.8, 8.4], front: [8.5, 2.8, 0.1], top: [0.1, 10.5, 0.2]
  };
  const target = new THREE.Vector3(0, 2.35, 0);
  const targetPosition = new THREE.Vector3(...positions[view]);
  camera.position.copy(targetPosition); controls.target.copy(target); controls.update(); currentView = view;
  document.querySelectorAll('[data-view]').forEach((button) => {
    const on = button.dataset.view === view;
    button.classList.toggle('is-active', on);
    button.setAttribute('aria-pressed', String(on));
  });
}

// ---------- UI events ----------
$('tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]'); if (button) selectCategory(button.dataset.category);
});
$('checks').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]'); if (button) selectCategory(button.dataset.category);
});
$('parts').addEventListener('click', (event) => {
  const button = event.target.closest('[data-part]'); if (button) selectPart(button.dataset.part);
});
// Remember which "More details" panels are open, so they stay open after a re-render.
$('parts').addEventListener('toggle', (event) => {
  const id = event.target.dataset?.detail;
  if (!id) return;
  if (event.target.open) openDetails.add(id); else openDetails.delete(id);
}, true);
$('presets').addEventListener('click', (event) => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  if (button.dataset.preset === 'scratch') setScratchBuild();
  else setPreset(button.dataset.preset);
});
$('resolutions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-res]');
  if (!button) return;
  resolution = button.dataset.res;
  renderGames();
});
$('graphicsModes').addEventListener('click', (event) => {
  const button = event.target.closest('[data-graphics-mode]');
  if (!button) return;
  graphicsMode = button.dataset.graphicsMode;
  renderGames();
});
$('fitOnly').addEventListener('change', renderParts);
$('sortBy').addEventListener('change', renderParts);
$('partSearch').addEventListener('input', renderParts);
$('cpuVendorFilter').addEventListener('change', renderParts);
$('cpuGenerationFilter').addEventListener('change', renderParts);
$('gpuVendorFilter').addEventListener('change', renderParts);
$('gpuGenerationFilter').addEventListener('change', renderParts);
$('prevBtn').addEventListener('click', () => stepBy(-1));
$('nextBtn').addEventListener('click', () => stepBy(1));
$('budget').addEventListener('input', renderSummary);
$('shareBtn').addEventListener('click', copyBuild);
$('shareBtn2').addEventListener('click', copyBuild);
$('themeToggle').addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme, true);
});
$('resetBtn').addEventListener('click', () => { setPreset('starter'); $('budget').value = STARTING_BUDGET; renderSummary(); });
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => setCamera(button.dataset.view)));
$('glassToggle').addEventListener('change', (event) => { showGlass = event.target.checked; update3DControls(); });
$('caseToggle').addEventListener('change', (event) => { showCase = event.target.checked; update3DControls(); });
$('lightToggle').addEventListener('change', (event) => { lightingOn = event.target.checked; update3DControls(); });
$('fanSpeed').addEventListener('input', (event) => {
  const value = Number(event.target.value);
  fanMultiplier = [0, 0.6, 1, 1.7][value];
  $('fanOut').textContent = ['Stopped', 'Quiet', 'Normal', 'Turbo'][value];
});
$('explode').addEventListener('input', (event) => {
  exploded = Number(event.target.value);
  $('explodeOut').textContent = exploded === 0 ? 'Off' : `${exploded}%`;
  update3DControls();
});
$('shotBtn').addEventListener('click', () => {
  if (!renderer) return showToast('The 3D preview is unavailable.');
  renderer.render(scene, camera);
  const link = document.createElement('a'); link.download = 'buildbuddy-pc-preview.png'; link.href = renderer.domElement.toDataURL('image/png'); link.click();
});

setTheme(getInitialTheme());
renderAll();
init3D();
