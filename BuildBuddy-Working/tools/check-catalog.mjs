// Checks the BuildBuddy catalog and compatibility logic. Run with: node tools/check-catalog.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = await import(pathToFileURL(path.join(root, 'js/data.js')).href);
const logic = await import(pathToFileURL(path.join(root, 'js/logic.js')).href);
const { catalog, categories, categoryInfo, presets, presetInfo } = data;
const { evaluate, estimateGames, gamesSummary, specRows, RESOLUTIONS, totalPrice, money } = logic;

let problems = 0;
const fail = (msg) => { problems++; console.log(`FAIL  ${msg}`); };
const pass = (msg) => console.log(`ok    ${msg}`);

// 1. Categories line up
for (const cat of categories) {
  if (!catalog[cat]) fail(`catalog is missing category "${cat}"`);
  if (!categoryInfo[cat]) fail(`categoryInfo is missing "${cat}"`);
}
for (const key of Object.keys(catalog)) if (!categories.includes(key)) fail(`catalog has unknown category "${key}"`);
pass(`${categories.length} categories`);

// 2. Each category has at least 20 additional options beyond the original catalog.
const minimumCatalogSizes = {
  cpu: 48, cooler: 36, motherboard: 41, ram: 36, gpu: 52,
  storage: 36, psu: 36, case: 56, fans: 34, lighting: 36, os: 32
};
for (const [cat, minimum] of Object.entries(minimumCatalogSizes)) {
  if ((catalog[cat]?.length || 0) < minimum) fail(`${cat}: expected at least ${minimum} options, found ${catalog[cat]?.length || 0}`);
}
if (!catalog.gpu.some((gpu) => gpu.id === 'rx9060xt' && /RX 9060 XT/i.test(gpu.name))) fail('RX 9060 XT is missing');
if (!catalog.os.some((os) => os.id === 'win7') || !catalog.os.some((os) => os.id === 'win8') ||
    !catalog.os.some((os) => os.id === 'win81') || !catalog.os.some((os) => os.id === 'win10') ||
    !catalog.os.some((os) => os.id === 'win11')) fail('Windows 7 through 11 options are not all present');
if (catalog.os.filter((os) => os.family === 'Linux').length < 20) fail('fewer than 20 Linux distributions are present');
for (const id of ['bazzite', 'cachyos']) if (!catalog.os.some((os) => os.id === id)) fail(`${id} is missing from the OS catalog`);
if (Object.keys(presets).length < 13) fail('expected at least 10 additional build presets');
const linuxOs = catalog.os.filter((os) => os.family === 'Linux');
for (const os of linuxOs) {
  const presetId = `linux-${os.id}`;
  if (!presets[presetId]) fail(`${os.name}: missing Linux preset`);
  else if (presets[presetId].os !== os.id) fail(`${os.name}: Linux preset has the wrong OS`);
}
pass('every hardware category has 10+ further options; OS includes Windows 7–11 and 20+ Linux distros');

// 3. IDs are unique, prices are numbers, every part has copy and spec rows
const seenIds = new Map();
const counts = {};
for (const cat of categories) {
  counts[cat] = catalog[cat].length;
  for (const p of catalog[cat]) {
    if (seenIds.has(p.id)) fail(`duplicate id "${p.id}" in ${cat} and ${seenIds.get(p.id)}`);
    seenIds.set(p.id, cat);
    if (typeof p.price !== 'number' || p.price < 0) fail(`${p.id}: price must be a number of reais`);
    if (!p.name || !p.desc || !p.fit || !p.tag || !p.short) fail(`${p.id}: missing name, tag, short, desc or fit`);
    const rows = specRows(cat, p);
    if (!rows.length) fail(`${p.id}: no spec rows`);
    for (const [label, value] of rows) {
      if (value === undefined || value === null || /undefined|NaN/.test(String(value))) fail(`${p.id}: spec "${label}" is ${value}`);
    }
  }
}
const dedicatedGpus = catalog.gpu.filter((g) => g.id !== 'none').length;
pass(`${seenIds.size} options, ${dedicatedGpus} dedicated graphics cards, ${catalog.case.length} cases, no duplicate ids`);

// 4. Presets reference real parts and have labels
for (const [name, preset] of Object.entries(presets)) {
  for (const cat of categories) {
    if (!preset[cat]) fail(`preset "${name}" has no ${cat}`);
    else if (!catalog[cat].some((p) => p.id === preset[cat])) fail(`preset "${name}": ${cat} "${preset[cat]}" is not in the catalog`);
  }
  if (!presetInfo[name]) fail(`presetInfo is missing "${name}"`);
}
pass(`${Object.keys(presets).length} presets reference real parts`);

for (const part of catalog.case) {
  for (const field of ['materials', 'filters', 'driveBays', 'fanMounts', 'includedFanLayout', 'frontUsb', 'dimensions', 'radiatorPositions', 'cableSpace']) {
    if (!part[field]) fail(`case "${part.id}" is missing detail "${field}"`);
  }
}
pass('every case has chassis, airflow, filter, drive-mount and front-I/O details');

for (const part of catalog.storage) {
  const rows = specRows('storage', part);
  if (!rows.some(([label]) => label === 'Form factor')) fail(`storage "${part.id}" has no 3D form factor`);
}
pass('every SSD, NVMe and hard drive declares a visible 3D form factor');

// 5. Every case style has a 3D entry in case.js
const caseSource = readFileSync(path.join(root, 'js/case.js'), 'utf8');
const dimKeys = [...caseSource.matchAll(/^\s{2}(\w+): \{ L:/gm)].map((m) => m[1]);
for (const p of catalog.case) if (!dimKeys.includes(p.style)) fail(`case "${p.id}" uses style "${p.style}" with no CASE_DIMS entry`);
pass(`every case style has a CASE_DIMS entry (${dimKeys.length} styles)`);

// 6. Presets pass the compatibility rules with no errors
for (const [name, preset] of Object.entries(presets)) {
  const report = evaluate(preset);
  if (report.errors.length) fail(`preset "${name}" has errors: ${report.errors.map((e) => e.text).join(' | ')}`);
  else pass(`preset "${name}": no errors, ${report.warnings.length} note(s), total ${money(totalPrice(preset))}, peak draw ${report.draw} W`);
}
const osBaseline = estimateGames({ ...presets.esports, os: 'win11' }, '1080');
for (const os of catalog.os) {
  const osEstimate = estimateGames({ ...presets.esports, os: os.id }, '1080');
  if (osEstimate.some((game, index) => game.fps !== osBaseline[index].fps)) {
    fail(`${os.id}: OS selection changes FPS without comparable measured OS data`);
  }
}
pass('OS selection does not invent an FPS adjustment without benchmark data');

// 7. Each single-part swap evaluates without throwing
let swaps = 0;
for (const cat of categories) {
  for (const part of catalog[cat]) {
    try { evaluate({ ...presets.creator, [cat]: part.id }); swaps++; } catch (e) { fail(`evaluate threw for "${part.id}": ${e.message}`); }
  }
}
pass(`${swaps} single-part swaps evaluate without errors`);

// 8. Game estimates are sensible at every resolution
for (const [name, preset] of Object.entries(presets)) {
  for (const res of RESOLUTIONS) {
    const results = estimateGames(preset, res.id);
    for (const g of results) if (g.fps === null || !Number.isFinite(g.fps) || g.fps < 5) fail(`${name} ${res.label}: bad fps for ${g.name}`);
    if (name === 'esports' && res.id === '1080') console.log(`      ${gamesSummary(results, res.id)}`);
  }
}
const noGpu = estimateGames({ ...presets.esports, gpu: 'none', cpu: 'r5600' }, '1080');
if (!noGpu.every((g) => g.fps === null)) fail('a build with no graphics should return no fps values');
else pass('a build with no graphics returns no fps values');

console.log(problems ? `\n${problems} problem(s) found` : '\nAll catalog checks passed.');
process.exit(problems ? 1 : 0);
