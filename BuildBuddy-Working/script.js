import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { categoryInfo, categories, catalog, presets } from './js/data.js';
import { money, getPart, totalPrice, estimateWatts, evaluate, estimateGames, resolutionLabel } from './js/logic.js';
import { createKit } from './js/kit.js';
import { buildCase } from './js/case.js';
import { buildBoard } from './js/board.js';
import { buildGpu, buildCables } from './js/gpu.js';
import { clearPriceFeed, loadPriceFeed, makePriceTemplate, savePriceFeed, validatePriceFeed } from './js/price-feed.js';

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const colorHex = (number) => `#${Number(number || 0x35e0ff).toString(16).padStart(6, '0').slice(-6)}`;
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
let activeCategory = 'cpu';
let toastTimer;
let scene, camera, renderer, controls, kit, pcRoot, modelParts = {}, raycaster, pointer, clock, resizeObserver, environmentTarget;
let fanMultiplier = 1;
let exploded = 0;
let lightingOn = true;
let showGlass = true;
let currentView = 'home';

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2700);
}

function currentParts() {
  return Object.fromEntries(categories.map((cat) => [cat, getPart(selected, cat)]));
}

function compatibleCandidate(category, candidate) {
  const proposed = { ...selected, [category]: candidate.id };
  const before = new Set(evaluate(selected).errors.map((e) => e.text));
  return evaluate(proposed).errors.every((e) => before.has(e.text));
}

function renderTabs() {
  $('tabs').innerHTML = categories.map((cat, index) => {
    const info = categoryInfo[cat];
    const chosen = Boolean(getPart(selected, cat));
    return `<button class="tab ${activeCategory === cat ? 'active' : ''} ${chosen ? 'chosen' : ''}" role="tab" aria-selected="${activeCategory === cat}" data-category="${cat}" type="button"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHTML(info.short)}<i>${chosen ? '✓' : '·'}</i></button>`;
  }).join('');
}

function renderParts() {
  const info = categoryInfo[activeCategory];
  $('stepTitle').textContent = `Choose ${info.label.toLowerCase()}`;
  $('stepSub').textContent = `${info.step} · ${info.note}`;
  $('stepIndex').textContent = `${String(categories.indexOf(activeCategory) + 1).padStart(2, '0')} / ${categories.length}`;
  $('learnTitle').textContent = info.title;
  $('learnText').textContent = info.text;
  $('learnFit').textContent = info.note;

  const query = $('partSearch').value.trim().toLowerCase();
  let items = [...catalog[activeCategory]];
  if ($('fitOnly').checked) items = items.filter((part) => compatibleCandidate(activeCategory, part));
  if (query) items = items.filter((part) => `${part.name} ${part.short || ''} ${part.tag || ''} ${part.desc || ''}`.toLowerCase().includes(query));
  if ($('sortBy').value === 'low') items.sort((a, b) => a.price - b.price);
  if ($('sortBy').value === 'high') items.sort((a, b) => b.price - a.price);

  $('parts').innerHTML = items.map((part) => {
    const isSelected = selected[activeCategory] === part.id;
    const source = priceMeta.get(part.id);
    const priceLabel = source ? `Verified · ${escapeHTML(source.source)}` : 'Reference estimate';
    const stock = source ? `<span class="stock ${source.availability}">${source.availability === 'in_stock' ? 'In stock' : source.availability === 'out_of_stock' ? 'Out of stock' : 'Stock unknown'}</span>` : '';
    return `<article class="part-card ${isSelected ? 'selected' : ''}">
      <button class="part-select" type="button" data-part="${escapeHTML(part.id)}" aria-pressed="${isSelected}">
        <span class="part-card-top"><span class="part-type">${escapeHTML(info.label)}</span>${isSelected ? '<span class="selected-check">✓</span>' : ''}</span>
        <strong class="part-name">${escapeHTML(part.name)}</strong>
        <span class="part-desc">${escapeHTML(part.desc || part.short || '')}</span>
        <span class="part-meta">${escapeHTML(part.short || part.tag || '')}</span>
        <span class="part-bottom"><strong class="part-price">${money(part.price)}</strong><span class="part-tag">${priceLabel}</span></span>
        ${stock}
      </button>
      ${source ? `<a class="offer-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">View retailer offer ↗</a>` : ''}
    </article>`;
  }).join('') || '<div class="empty-state">No parts match this search. Try another name or turn off the fit filter.</div>';
}

function renderProgress() {
  const count = categories.filter((cat) => Boolean(getPart(selected, cat))).length;
  $('progressText').textContent = `${count} of ${categories.length} categories selected`;
  $('progressFill').style.width = `${(count / categories.length) * 100}%`;
  $('stepHint').textContent = count === categories.length ? 'Your parts list is complete' : 'Keep choosing your parts';
  $('buildState').textContent = count === categories.length ? 'BUILD SELECTED' : 'PARTS TO CHOOSE';
  $('completionTag').textContent = `${count} / ${categories.length} PARTS`;
}

function renderSummary() {
  const total = totalPrice(selected);
  const budget = Number($('budget').value);
  const watts = estimateWatts(selected);
  $('totalPrice').textContent = money(total);
  $('wattOut').textContent = `${watts} W`;
  $('budgetOut').textContent = money(budget);
  const pct = Math.min(100, (total / budget) * 100);
  $('budgetFill').style.width = `${pct}%`;
  $('budgetFill').classList.toggle('over', total > budget);
  $('budgetNote').textContent = total > budget ? `${money(total - budget)} over your budget. Try a different graphics card or processor.` : `${money(budget - total)} left in your budget.`;
  $('list').innerHTML = categories.map((cat) => {
    const part = getPart(selected, cat);
    return `<div class="summary-item"><span>${escapeHTML(categoryInfo[cat].label)}</span><strong title="${escapeHTML(part?.name || 'Not selected')}">${escapeHTML(part?.name || 'Not selected')}</strong><small>${part ? money(part.price) : '—'}</small></div>`;
  }).join('');
}

function renderCompatibility() {
  const report = evaluate(selected);
  const hasErrors = report.errors.length > 0;
  const hasWarnings = report.warnings.length > 0;
  $('status').className = `status ${hasErrors ? 'bad' : hasWarnings ? 'warn' : 'good'}`;
  $('status').innerHTML = `<strong>${hasErrors ? `${report.errors.length} issue${report.errors.length > 1 ? 's' : ''} to fix` : hasWarnings ? 'Build fits, with notes' : 'Everything looks compatible'}</strong><span>${hasErrors ? 'Fix these before buying the parts.' : hasWarnings ? 'Review the notes before you order.' : 'The current selections pass the listed fit checks.'}</span>`;
  $('compatLabel').textContent = hasErrors ? 'ACTION NEEDED' : hasWarnings ? 'REVIEW NOTES' : 'CHECKS PASSED';
  $('checks').innerHTML = report.checks.map((item) => `<li class="check-row ${item.ok ? 'pass' : item.severity === 'warn' ? 'warning' : 'fail'}"><span class="check-icon">${item.ok ? '✓' : item.severity === 'warn' ? '!' : '×'}</span><span><strong>${escapeHTML(item.label)}</strong><small>${item.ok ? 'Looks good' : escapeHTML(item.detail)}</small></span></li>`).join('');
}

function renderGames() {
  const results = estimateGames(selected);
  $('gameNote').textContent = `${resolutionLabel(selected)}. Estimates assume typical settings for each game.`;
  $('games').innerHTML = results.map((game) => {
    if (game.na) return `<article class="game-card"><div><strong>${escapeHTML(game.name)}</strong><small>${escapeHTML(game.type)}</small></div><b class="fps na">—</b><small class="fps-label">Add a graphics card</small></article>`;
    return `<article class="game-card"><div><strong>${escapeHTML(game.name)}</strong><small>${escapeHTML(game.type)}</small></div><b class="fps">${game.low}–${game.high}</b><small class="fps-label">approx. FPS</small></article>`;
  }).join('');
}

function renderPriceStatus() {
  const reset = $('priceResetBtn');
  reset.hidden = !importedFeed;
  if (!importedFeed) {
    $('priceStatus').textContent = 'Using built-in reference estimates. No verified price file has been imported yet.';
    return;
  }
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${importedFeed.checkedAt}T00:00:00Z`));
  $('priceStatus').textContent = `${importedFeed.prices.length} verified item price${importedFeed.prices.length === 1 ? '' : 's'} imported · checked ${date}. Parts not listed in the file still use reference estimates.`;
}

function renderAll() {
  renderTabs(); renderParts(); renderProgress(); renderSummary(); renderCompatibility(); renderGames(); renderPriceStatus();
  $('prevBtn').disabled = categories.indexOf(activeCategory) === 0;
  $('nextBtn').textContent = categories.indexOf(activeCategory) === categories.length - 1 ? 'Back to first part ↺' : 'Next part →';
}

function selectCategory(cat) {
  if (!categories.includes(cat)) return;
  activeCategory = cat;
  renderTabs(); renderParts();
  document.querySelector('.builder-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectPart(id) {
  const part = catalog[activeCategory].find((p) => p.id === id);
  if (!part) return;
  selected[activeCategory] = id;
  renderAll();
  rebuild3D();
}

function setPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  selected = { ...preset };
  document.querySelectorAll('[data-preset]').forEach((button) => button.classList.toggle('selected', button.dataset.preset === name));
  renderAll(); rebuild3D();
  showToast('Starting build loaded. You can change any part.');
}

function copyBuild() {
  const rows = categories.map((cat) => `${categoryInfo[cat].label}: ${getPart(selected, cat)?.name || 'Not selected'} — ${money(getPart(selected, cat)?.price || 0)}`);
  const content = `BUILDBUDDY PC BUILD\n${rows.join('\n')}\n\nEstimated total: ${money(totalPrice(selected))}\nEstimated peak draw: ${estimateWatts(selected)} W\n\nVerified-price entries are based on the imported price file. Other prices are reference estimates. FPS figures are planning estimates, not benchmark guarantees.`;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(content).then(() => showToast('Parts list copied.')).catch(() => fallbackCopy(content));
  else fallbackCopy(content);
}
function fallbackCopy(content) {
  const area = document.createElement('textarea'); area.value = content; document.body.appendChild(area); area.select();
  try { document.execCommand('copy'); showToast('Parts list copied.'); } catch { showToast('Could not copy automatically.'); }
  area.remove();
}

// ---------- Monthly verified-price feed ----------
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
  clearPriceFeed(); applyFeed(null); renderAll(); showToast('Restored the built-in reference estimates.');
});

// ---------- 3D PC builder ----------
function init3D() {
  const canvas = $('pcCanvas');
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(6.6, 4.9, 7.0);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
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
    scene.add(new THREE.HemisphereLight(0xd8efff, 0x344354, 2.0));
    scene.add(new THREE.AmbientLight(0x9fbad1, 0.45));
    const key = new THREE.DirectionalLight(0xe4f2ff, 2.8);
    key.position.set(4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0002; key.shadow.normalBias = 0.035; key.shadow.radius = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fc8e8, 1.5);
    rim.position.set(-4, 5, -3); scene.add(rim);
    const fill = new THREE.PointLight(0x35e0ff, 6, 10); fill.position.set(-3, 2.8, 3); scene.add(fill);
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
    $('stageTip').textContent = 'Drag to rotate · scroll to zoom · click a component to edit';
    $('stageTip').classList.remove('error');
    resize3D();
    rebuild3D();
    animate3D();
  } catch (error) {
    console.error(error);
    $('stageTip').textContent = `3D preview could not start: ${error?.message || 'WebGL is unavailable'}. The parts builder still works.`;
    $('stageTip').classList.add('error');
  }
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
    const light = new THREE.PointLight(parts.lighting.color || 0x35e0ff, 2.7, 5.8);
    light.position.set(1.2, 2.5, 1.1); pcRoot.add(light); kit.addLight(light, 2.7);
    const interiorFill = new THREE.PointLight(0xd9efff, 8, 7, 2);
    interiorFill.position.set(-0.2, 2.7, 1.25); pcRoot.add(interiorFill);
    const lowerFill = new THREE.PointLight(0x9bcaff, 4, 6, 2);
    lowerFill.position.set(-1.25, 1.35, 0.55); pcRoot.add(lowerFill);
    kit.setLighting(parts.lighting.mode, colorHex(parts.lighting.color), lightingOn);
    update3DControls();
    $('stageTip').textContent = 'Drag to rotate · scroll to zoom · click a component to edit';
    $('stageTip').classList.remove('error');
    $('fanHud').textContent = `${anchors.fanCount + (parts.gpu.id === 'none' ? 0 : (parts.gpu.kind === 'triple' ? 3 : 2))} FANS · ANIMATED`;
    $('caseHud').textContent = parts.case.name.toUpperCase();
  } catch (error) {
    console.error('3D rebuild failed:', error);
    $('stageTip').textContent = `3D model build failed: ${error?.message || 'unknown model error'}. Try another part or preset.`;
    $('stageTip').classList.add('error');
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
  $('hoverName').textContent = categoryInfo[hit.object.userData.category]?.label || 'Component';
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
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('on', button.dataset.view === view));
}

// ---------- UI events ----------
$('tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]'); if (button) selectCategory(button.dataset.category);
});
$('parts').addEventListener('click', (event) => {
  const button = event.target.closest('[data-part]'); if (button) selectPart(button.dataset.part);
});
document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => setPreset(button.dataset.preset)));
$('fitOnly').addEventListener('change', renderParts);
$('sortBy').addEventListener('change', renderParts);
$('partSearch').addEventListener('input', renderParts);
$('prevBtn').addEventListener('click', () => selectCategory(categories[Math.max(0, categories.indexOf(activeCategory) - 1)]));
$('nextBtn').addEventListener('click', () => selectCategory(categories[(categories.indexOf(activeCategory) + 1) % categories.length]));
$('budget').addEventListener('input', renderSummary);
$('shareBtn').addEventListener('click', copyBuild);
$('shareBtn2').addEventListener('click', copyBuild);
$('resetBtn').addEventListener('click', () => { setPreset('starter'); $('budget').value = 4500; renderSummary(); });
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => setCamera(button.dataset.view)));
$('glassToggle').addEventListener('change', (event) => { showGlass = event.target.checked; update3DControls(); });
$('lightToggle').addEventListener('change', (event) => { lightingOn = event.target.checked; update3DControls(); });
$('fanSpeed').addEventListener('input', (event) => {
  const value = Number(event.target.value); fanMultiplier = [0, 0.6, 1, 1.7][value];
  $('fanOut').textContent = ['Stopped', 'Quiet', 'Normal', 'Turbo'][value];
});
$('explode').addEventListener('input', (event) => { exploded = Number(event.target.value); $('explodeOut').textContent = exploded === 0 ? 'Off' : `${exploded}%`; update3DControls(); });
$('shotBtn').addEventListener('click', () => {
  if (!renderer) return showToast('3D preview is unavailable.');
  renderer.render(scene, camera);
  const link = document.createElement('a'); link.download = 'buildbuddy-pc-preview.png'; link.href = renderer.domElement.toDataURL('image/png'); link.click();
});

renderAll();
init3D();
