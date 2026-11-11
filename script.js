import { categoryInfo, categories, catalog, presets, presetInfo } from './js/data.js';
import {
  money, getPart, totalPrice, estimateWatts, evaluate, estimateGames, gamesSummary,
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
const colorHex = (number) => `#${Number(number || 0x35e0ff).toString(16).padStart(6, '0').slice(-6)}`;
const STARTING_BUDGET = 4500;
const THEME_STORAGE_KEY = 'buildbuddy.theme.v1';
const allParts = Object.values(catalog).flat();
const knownIds = new Set(allParts.map((p) => p.id));
const originalPrices = new Map(allParts.map((p) => [p.id, p.price]));
let importedFeed = loadPriceFeed(knownIds);
let priceMeta = new Map();

function applyFeed(feed) {
  for (const part of allParts) part.price = originalPrices.get(part.id) ?? part.price;
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
const openDetails = new Set();
let toastTimer;
let scene, camera, renderer, controls, kit, pcRoot, modelParts = {}, raycaster, pointer, clock, resizeObserver, environmentTarget;
let fanMultiplier = 1;
let exploded = 0;
let lightingOn = true;
let showGlass = true;
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
  $('presets').innerHTML = Object.entries(presetInfo).map(([name, info]) => {
    const isActive = activePreset === name;
    return `<button class="preset${isActive ? ' is-active' : ''}" type="button" data-preset="${escapeHTML(name)}" aria-pressed="${isActive}">
      <span class="preset-label">${escapeHTML(info.label)}</span>
      <span class="preset-blurb">${escapeHTML(info.blurb)}</span>
      <span class="preset-total">${money(totalPrice(presets[name]))}</span>
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
  const quick = quickSpecs(cat, part).map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('');
  const full = specRows(cat, part).map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('');
  const priceText = part.price === 0 ? 'No extra cost' : money(part.price);
  const priceSource = source ? `Verified from ${escapeHTML(source.source)}` : 'Reference price';
  const stock = source ? `<span class="stock stock-${escapeHTML(source.availability)}">${stockLabel(source.availability)}</span>` : '';
  const offer = source ? `<a class="offer-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">View offer</a>` : '';

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
  if ($('fitOnly').checked) items = items.filter((part) => compatibleCandidate(activeCategory, part));
  if (query) items = items.filter((part) => `${part.name} ${part.short} ${part.tag || ''} ${part.desc}`.toLowerCase().includes(query));
  const sort = $('sortBy').value;
  if (sort === 'low') items.sort((a, b) => a.price - b.price);
  if (sort === 'high') items.sort((a, b) => b.price - a.price);

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
  const budget = Number($('budget').value);
  const diff = budget - total;
  $('totalPrice').textContent = money(total);
  $('wattOut').textContent = `about ${estimateWatts(selected)} W`;
  $('budgetOut').textContent = money(budget);
  $('budgetFill').style.width = `${Math.min(100, (total / budget) * 100)}%`;
  $('budgetFill').classList.toggle('is-over', total > budget);
  $('budgetNote').textContent = diff < 0
    ? `${money(-diff)} over budget. A cheaper graphics card or processor would close the gap.`
    : diff === 0 ? 'Exactly on budget.' : `${money(diff)} left to spend.`;
  $('list').innerHTML = categories.map((cat) => {
    const part = getPart(selected, cat);
    const price = part ? (part.price ? money(part.price) : 'Included') : '';
    return `<li><span class="sum-cat">${escapeHTML(categoryInfo[cat].label)}</span><span class="sum-name">${escapeHTML(part?.name || 'Not chosen yet')}</span><span class="sum-price">${escapeHTML(price)}</span></li>`;
  }).join('');
}

function renderCompatibility() {
  const report = evaluate(selected);
  const errors = report.errors.length;
  const warnings = report.warnings.length;
  const tone = errors ? 'bad' : warnings ? 'warn' : 'good';
  $('status').className = `status status-${tone}`;
  $('statusTitle').textContent = errors
    ? `${errors} thing${errors > 1 ? 's' : ''} to fix`
    : warnings ? 'Fits, with a few notes' : 'Everything fits together';
  $('statusText').textContent = errors
    ? 'Fix these before you buy anything.'
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
      <p class="game-note">Needs a graphics card</p>
    </li>`;
  }
  const width = Math.min(100, (game.fps / 144) * 100).toFixed(1);
  const target = ((FPS_TARGET / 144) * 100).toFixed(1);
  return `<li class="game-row">
    <div class="game-info"><strong>${escapeHTML(game.name)}</strong><span>${escapeHTML(game.genre)}</span></div>
    <div class="game-bar" aria-hidden="true">
      <span class="game-fill tone-${game.verdict.tone}" style="width: ${width}%"></span>
      <span class="game-target" style="left: ${target}%"></span>
    </div>
    <div class="game-value">
      <strong>about ${game.fps} fps</strong>
      <span class="verdict tone-${game.verdict.tone}">${game.verdict.label}</span>
    </div>
  </li>`;
}

function renderGames() {
  const results = estimateGames(selected, resolution);
  $('gamesSummary').textContent = gamesSummary(results, resolution);
  $('games').innerHTML = results.map(gameRow).join('');
  document.querySelectorAll('[data-res]').forEach((button) => {
    const on = button.dataset.res === resolution;
    button.classList.toggle('is-active', on);
    button.setAttribute('aria-pressed', String(on));
  });
}

function renderPriceStatus() {
  $('priceResetBtn').hidden = !importedFeed;
  if (!importedFeed) {
    $('priceStatus').textContent = 'Prices are reference estimates typed in by hand. Import a verified price file to replace them.';
    return;
  }
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${importedFeed.checkedAt}T00:00:00Z`));
  const count = importedFeed.prices.length;
  $('priceStatus').textContent = `${count} verified price${count === 1 ? '' : 's'} imported, checked ${date}. Other parts keep their reference prices.`;
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

function copyBuild() {
  const rows = categories.map((cat) => {
    const part = getPart(selected, cat);
    return `${categoryInfo[cat].label}: ${part?.name || 'Not chosen'} (${part ? money(part.price) : '-'})`;
  });
  const content = `BuildBuddy parts list\n\n${rows.join('\n')}\n\nTotal: ${money(totalPrice(selected))}\nEstimated peak draw: about ${estimateWatts(selected)} W\n\nPrices are reference estimates unless marked as verified. Frame rates are planning estimates, not benchmark results.`;
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
    savePriceFeed(feed);
    applyFeed(feed);
    renderAll();
    showToast(`Imported ${feed.prices.length} verified prices.`);
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
  clearPriceFeed(); applyFeed(null); renderAll(); showToast('Restored the reference prices.');
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
    renderer.toneMappingExposure = 1.2;
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
    controls.minDistance = 4.5;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.49;
    scene.add(new THREE.HemisphereLight(0xd8efff, 0x465668, 2.3));
    scene.add(new THREE.AmbientLight(0xb7d2e8, 0.65));
    const key = new THREE.DirectionalLight(0xe4f2ff, 3.2);
    key.position.set(4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0002; key.shadow.normalBias = 0.035; key.shadow.radius = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb4dcf5, 1.8);
    rim.position.set(-4, 5, -3); scene.add(rim);
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
    setStageTip('Drag to turn · scroll to zoom · click a part to open its step');
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
    const anchors = buildCase(kit, parts.case, parts.fans);
    modelParts.case = anchors.group;
    pcRoot.add(anchors.group);
    const board = buildBoard(kit, anchors, { ...parts, board: parts.motherboard });
    modelParts.board = board.group;
    modelParts.board.userData.baseZ = board.group.position.z;
    pcRoot.add(board.group);
    const storage = buildStorage(kit, parts.storage, anchors);
    modelParts.storage = storage;
    if (storage) pcRoot.add(storage);
    const gpu = buildGpu(kit, parts.gpu, anchors, board);
    modelParts.gpu = gpu;
    if (gpu) { gpu.userData.baseZ = gpu.position.z; pcRoot.add(gpu); }
    const cables = buildCables(kit, anchors, board, gpu, parts.cpu);
    modelParts.cables = cables;
    pcRoot.add(cables);
    modelParts.glass = [];
    pcRoot.traverse((object) => {
      if (object.isMesh && object.userData.isGlass) modelParts.glass.push(object);
      if (object.isMesh && object.userData.isGlass) {
        object.castShadow = false;
        object.receiveShadow = false;
      }
    });
    const light = new THREE.PointLight(parts.lighting.color || 0x35e0ff, 3.2, 6.5);
    light.position.set(1.2, 2.5, 1.1); pcRoot.add(light); kit.addLight(light, 3.2);
    const interiorFill = new THREE.PointLight(0xffedcf, 13, 8, 1.7);
    interiorFill.position.set(-0.2, 2.7, 1.25); pcRoot.add(interiorFill);
    const lowerFill = new THREE.PointLight(0xc0e5ff, 6, 7, 1.8);
    lowerFill.position.set(-1.25, 1.35, 0.55); pcRoot.add(lowerFill);
    const boardFill = new THREE.PointLight(0xffffff, 8, 5, 1.6);
    boardFill.position.set(-0.2, 3.1, 2.1); pcRoot.add(boardFill);
    kit.setLighting(parts.lighting.mode, colorHex(parts.lighting.color), lightingOn);
    update3DControls();
    setStageTip('Drag to turn · scroll to zoom · click a part to open its step');
    $('fanHud').textContent = `${anchors.fanCount + (parts.gpu.id === 'none' ? 0 : (parts.gpu.kind === 'triple' ? 3 : 2))} fans, animated`;
    $('caseHud').textContent = parts.case.name;
  } catch (error) {
    console.error('3D rebuild failed:', error);
    setStageTip(`The 3D model could not be built: ${error?.message || 'unknown error'}. Try another part or build.`, true);
  }
}

function update3DControls() {
  if (!kit) return;
  const lighting = getPart(selected, 'lighting');
  kit.setLighting(lighting.mode, colorHex(lighting.color), lightingOn);
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
  const button = event.target.closest('[data-preset]'); if (button) setPreset(button.dataset.preset);
});
$('resolutions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-res]');
  if (!button) return;
  resolution = button.dataset.res;
  renderGames();
});
$('fitOnly').addEventListener('change', renderParts);
$('sortBy').addEventListener('change', renderParts);
$('partSearch').addEventListener('input', renderParts);
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
