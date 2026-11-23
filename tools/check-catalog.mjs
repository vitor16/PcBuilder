// Checks the BuildBuddy catalog and compatibility logic. Run with: node tools/check-catalog.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { GPU_GAME_MEASUREMENTS, GPU_RASTER_HIERARCHY } from '../js/gpu-benchmarks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = await import(pathToFileURL(path.join(root, 'js/data.js')).href);
const logic = await import(pathToFileURL(path.join(root, 'js/logic.js')).href);
const priceFeedModule = await import(pathToFileURL(path.join(root, 'js/price-feed.js')).href);
const { catalog, categories, categoryInfo, games, presets, presetInfo } = data;
const { evaluate, estimateGames, estimateRayTracingGames, gamesSummary, specRows, RESOLUTIONS, totalPrice, money, estimateWatts } = logic;

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
  storage: 36, hdd: 12, psu: 36, case: 56, fans: 34, lighting: 36, os: 32
};
for (const [cat, minimum] of Object.entries(minimumCatalogSizes)) {
  if ((catalog[cat]?.length || 0) < minimum) fail(`${cat}: expected at least ${minimum} options, found ${catalog[cat]?.length || 0}`);
}
for (const cat of categories) {
  const minimum = cat === 'hdd' ? 12 : 20;
  if (catalog[cat].length < minimum) fail(`${cat}: expected at least ${minimum} options, found ${catalog[cat].length}`);
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
pass('every category has a useful catalog; OS includes Windows 7–11 and 20+ Linux distros');

// 3. IDs are unique, prices are numbers, every part has copy and spec rows
const seenIds = new Map();
const counts = {};
for (const cat of categories) {
  counts[cat] = catalog[cat].length;
  for (const p of catalog[cat]) {
    if (seenIds.has(p.id)) fail(`duplicate id "${p.id}" in ${cat} and ${seenIds.get(p.id)}`);
    seenIds.set(p.id, cat);
    if (p.price !== null && (typeof p.price !== 'number' || p.price < 0)) fail(`${p.id}: price must be non-negative or null when unavailable`);
    if (!p.name || !p.desc || !p.fit || !p.tag || !p.short) fail(`${p.id}: missing name, tag, short, desc or fit`);
    if (p.sourceUrl && !/^https:\/\/[^ ]+$/.test(p.sourceUrl)) fail(`${p.id}: invalid product source URL`);
    const rows = specRows(cat, p);
    if (!rows.length) fail(`${p.id}: no spec rows`);
    for (const [label, value] of rows) {
      if (value === undefined || value === null || /undefined|NaN/.test(String(value))) fail(`${p.id}: spec "${label}" is ${value}`);
    }
  }
}
const dedicatedGpus = catalog.gpu.filter((g) => g.id !== 'none').length;
pass(`${seenIds.size} options, ${dedicatedGpus} dedicated graphics cards, ${catalog.case.length} cases, no duplicate ids`);

const jonsboCases = catalog.case.filter((pcCase) => /JONSBO/i.test(pcCase.name));
for (const requiredId of ['jonsbo-c6', 'jonsbo-c6-max', 'jonsbo-q8', 'jonsbo-d31', 'jonsbo-d32', 'jonsbo-d41', 'jonsbo-z20', 'jonsbo-n2', 'jonsbo-tk3']) {
  if (!catalog.case.some((pcCase) => pcCase.id === requiredId)) fail(`missing JONSBO case "${requiredId}"`);
}
const jonsboNames = new Set(jonsboCases.map((pcCase) => pcCase.name));
if (jonsboNames.size !== jonsboCases.length) fail('JONSBO case names repeat themselves');
if (jonsboCases.length < 8) fail(`expected at least 8 JONSBO cases, found ${jonsboCases.length}`);
for (const pcCase of jonsboCases) {
  if (!(pcCase.maxCooler > 0) || !(pcCase.maxGpu > 0) || !pcCase.dimensions) {
    fail(`JONSBO case "${pcCase.id}" is missing real fit or dimension details`);
  }
}
pass(`${jonsboCases.length} unique JONSBO cases include C6 and Q8 with GPU/cooler clearance details`);

const b660Board = catalog.motherboard.find((board) => board.id === 'msi-pro-b660m-a-ddr4');
if (!b660Board || b660Board.socket !== 'LGA1700' || b660Board.ram !== 'DDR4' || b660Board.form !== 'mATX') {
  fail('MSI PRO B660M-A DDR4 is missing or has incorrect socket, memory or form-factor compatibility');
} else {
  for (const cpuId of ['i712700k', 'i712700', 'i512600k', 'i512400f']) {
    const cpu = catalog.cpu.find((part) => part.id === cpuId);
    if (!cpu) {
      fail(`${cpuId} is missing from the CPU catalog`);
      continue;
    }
    const report = evaluate({ cpu: cpuId, motherboard: b660Board.id, ram: 'research-corsair-vengeance-lpx-cmk16gx4m2b3200c16' });
    const compatibilityChecks = report.checks.filter((check) =>
      ['Processor fits the board', 'Memory type matches', 'Memory fits the slots'].includes(check.label)
    );
    if (compatibilityChecks.length !== 3 || compatibilityChecks.some((check) => !check.ok)) {
      fail(`${cpuId} or the selected DDR4 kit does not pass compatibility checks with the MSI B660M board`);
    }
  }
  pass('MSI B660M DDR4 board matches four available 12th Gen Intel CPU choices and DDR4 memory');
}
const i712700kSpecs = specRows('cpu', catalog.cpu.find((cpu) => cpu.id === 'i712700k'));
if (!i712700kSpecs.some(([label, value]) => label === 'Maximum Turbo Power' && value === '190 W')) {
  fail('i7-12700K does not show its published Maximum Turbo Power');
}
if (estimateWatts({ cpu: 'i712700k' }) !== 298) fail('peak draw estimate does not account for the i7-12700K Maximum Turbo Power');
if (evaluate({ cpu: 'i712700k', cooler: 'tower-4pipe' }).checks.find((check) => check.label === 'Cooler can handle the heat')?.ok !== false) {
  fail('cooler compatibility does not account for the i7-12700K Maximum Turbo Power');
}
pass('CPU power and cooler checks account for published maximum turbo power');

for (const cpu of catalog.cpu) if (!cpu.vendor || !cpu.generation) fail(`${cpu.id}: missing CPU vendor or generation metadata`);
for (const gpu of catalog.gpu) if (!gpu.vendor || !gpu.generation) fail(`${gpu.id}: missing GPU vendor or generation metadata`);
pass('every CPU and GPU has filterable vendor and generation metadata');

for (const [id, result] of Object.entries(GPU_RASTER_HIERARCHY.results)) {
  if (!catalog.gpu.some((gpu) => gpu.id === id)) fail(`${id}: benchmark result has no matching GPU`);
  if (!(result.averageFps > 0) || !(result.onePercentLowFps > 0) || result.onePercentLowFps > result.averageFps) {
    fail(`${id}: invalid 1080p benchmark values`);
  }
}
const benchmarkGpu = catalog.gpu.find((gpu) => gpu.id === 'rtx5070');
const benchmarkSpecs = specRows('gpu', benchmarkGpu);
if (!benchmarkSpecs.some(([label, value]) => label === 'Benchmark source' && value.href === GPU_RASTER_HIERARCHY.source.url)) {
  fail('measured GPU details do not link to their source');
}
for (const [gpuId, cpuResults] of Object.entries(GPU_RASTER_HIERARCHY.cpuScaling.results)) {
  if (!catalog.gpu.some((gpu) => gpu.id === gpuId)) fail(`${gpuId}: CPU-scaling data has no matching GPU`);
  for (const [cpuId, result] of Object.entries(cpuResults)) {
    if (!catalog.cpu.some((cpu) => cpu.id === cpuId)) fail(`${cpuId}: CPU-scaling data has no matching CPU`);
    if (!(result.averageFps > 0) || !(result.onePercentLowFps > 0) || result.onePercentLowFps > result.averageFps) {
      fail(`${gpuId}/${cpuId}: invalid CPU-scaling benchmark values`);
    }
  }
}
const highCpuBuild = { cpu: 'r79800x3d' };
const rtx5070Estimate = estimateGames({ ...highCpuBuild, gpu: 'rtx5070' }, '1080').find((game) => game.name === 'Cyberpunk 2077');
const rx9070xtEstimate = estimateGames({ ...highCpuBuild, gpu: 'rx9070xt' }, '1080').find((game) => game.name === 'Cyberpunk 2077');
const expectedGpuRatio = GPU_RASTER_HIERARCHY.results.rx9070xt.averageFps / GPU_RASTER_HIERARCHY.results.rtx5070.averageFps;
if (!rtx5070Estimate || !rx9070xtEstimate || Math.abs(rx9070xtEstimate.fps / rtx5070Estimate.fps - expectedGpuRatio) > 0.04) {
  fail('measured GPU hierarchy is not calibrating the game estimator');
} else pass('game GPU tiers calibrate to measured 19-game averages where available');
const cpuScalingExample = estimateGames({ cpu: 'r5500', gpu: 'rtx5070' }, '1080')[0];
if (cpuScalingExample.cpuBenchmark?.averageFps !== 93 || cpuScalingExample.cpuBenchmark?.onePercentLowFps !== 63) {
  fail('1080p game estimates do not expose the matching measured CPU/GPU aggregate');
} else if (estimateGames({ cpu: 'r5500', gpu: 'rtx5070' }, '1440')[0].cpuBenchmark) {
  fail('1080p CPU/GPU aggregate is incorrectly shown for a different resolution');
} else pass('CPU/GPU scaling uses exact measured pairings only at the tested resolution');
const directHogwarts = estimateGames({ cpu: 'r79800x3d', gpu: 'rtx5070' }, '1080').find((game) => game.name === 'Hogwarts Legacy');
if (directHogwarts?.fps !== 133 || directHogwarts.directBenchmark?.onePercentLowFps !== 76) {
  fail('direct Hogwarts Legacy benchmark is not used for its exact CPU/GPU/resolution setup');
} else if (estimateGames({ cpu: 'r79800x3d', gpu: 'rtx5070' }, '1440').find((game) => game.name === 'Hogwarts Legacy').directBenchmark) {
  fail('1080p direct game result is incorrectly reused at 1440p');
} else pass('direct game results are used only for the tested CPU/GPU/resolution tuple');
const directBattlefield = estimateGames({ cpu: 'r5500', gpu: 'rx9060xt8' }, '1080').find((game) => game.name === 'Battlefield 6');
if (directBattlefield?.fps !== 143 || directBattlefield.directBenchmark?.onePercentLowFps !== 111) {
  fail('direct Battlefield 6 benchmark is not used for its exact CPU/GPU/resolution setup');
} else pass('additional researched title includes direct measured CPU/GPU pair results');
for (const measurement of GPU_GAME_MEASUREMENTS) {
  if (!games.some((game) => game.name === measurement.game)) fail(`${measurement.game}: published game test is not listed in the planner`);
  if (!['raster', 'ray-tracing'].includes(measurement.mode)) fail(`${measurement.game}: invalid published graphics mode`);
  if (!measurement.source?.url || !measurement.chartUrl || !measurement.settings) fail(`${measurement.game}: missing source, chart or settings`);
  for (const [resolution, gpuResults] of Object.entries(measurement.resolutions)) {
    if (!['1440', '2160'].includes(resolution)) fail(`${measurement.game}: unexpected measured resolution ${resolution}`);
    for (const [gpuId, cpuResults] of Object.entries(gpuResults)) {
      if (!catalog.gpu.some((gpu) => gpu.id === gpuId)) fail(`${measurement.game}: benchmark GPU ${gpuId} is not in the catalog`);
      for (const [cpuId, result] of Object.entries(cpuResults)) {
        if (!catalog.cpu.some((cpu) => cpu.id === cpuId)) fail(`${measurement.game}: benchmark CPU ${cpuId} is not in the catalog`);
        if (!(result.averageFps > 0) || result.onePercentLowFps < 0 || result.onePercentLowFps > result.averageFps) {
          fail(`${measurement.game}: invalid direct FPS for ${resolution}p ${gpuId}/${cpuId}`);
        }
      }
    }
  }
}
const direct007 = estimateGames({ cpu: 'r79800x3d', gpu: 'rx9070xt' }, '1440').find((game) => game.name === '007 First Light');
if (direct007?.fps !== 102 || direct007.directBenchmark?.onePercentLowFps !== 84 || direct007.directBenchmark?.resolution !== '1440p') {
  fail('direct 007 First Light result is not used for its exact 1440p CPU/GPU setup');
} else pass('direct 1440p/4K raster results are restricted to published CPU/GPU/settings');
const directRT = estimateRayTracingGames({ cpu: 'r79800x3d', gpu: 'rx9070xt' }, '2160').find((game) => game.name === 'DOOM: The Dark Ages');
if (directRT?.fps !== 9 || directRT.directBenchmark?.onePercentLowFps !== 5) {
  fail('direct 4K path-tracing result is not used for its exact CPU/GPU setup');
} else if (estimateRayTracingGames({ cpu: 'r5500', gpu: 'rx9070xt' }, '1440').some((game) => game.fps !== null)) {
  fail('ray-tracing result was invented for an untested CPU/GPU pair');
} else pass('measured ray tracing is shown only for exact tested CPU/GPU/resolution combinations');
const directSpiderMan = estimateRayTracingGames({ cpu: 'r79800x3d', gpu: 'rtx5060ti' }, '1440').find((game) => game.name === 'Spider-Man 2');
if (directSpiderMan?.fps !== 42 || directSpiderMan.directBenchmark?.onePercentLowFps !== 24) {
  fail('direct RTX 5060 Ti ray-tracing results do not map to the catalog GPU');
} else pass('second published GPU comparison resolves to the correct catalog card');

// Price imports must be explicitly attributable to KaBuM! and link to its domain.
const validPrice = {
  schemaVersion: 2, retailer: 'KaBuM!', checkedAt: '2026-11-10', currency: 'BRL',
  prices: [{ id: catalog.cpu[0].id, price: 999, source: 'KaBuM!', url: 'https://www.kabum.com.br/produto/1', availability: 'in_stock' }]
};
const generatedPriceTemplate = priceFeedModule.makePriceTemplate();
if (generatedPriceTemplate.schemaVersion !== 2 || generatedPriceTemplate.retailer !== 'KaBuM!') {
  fail('generated price template does not identify the KaBuM! schema');
}
try {
  priceFeedModule.validatePriceFeed(validPrice, seenIds);
  pass('KaBuM price imports validate');
} catch (error) {
  fail(`valid KaBuM price import was rejected: ${error.message}`);
}
for (const [label, invalid] of [
  ['different retailer', { ...validPrice, retailer: 'Other store' }],
  ['non-KaBuM URL', { ...validPrice, prices: [{ ...validPrice.prices[0], url: 'https://example.com/product/1' }] }]
]) {
  try {
    priceFeedModule.validatePriceFeed(invalid, seenIds);
    fail(`price import accepted a ${label}`);
  } catch {
    pass(`price import rejects ${label}`);
  }
}

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
const optionalHdds = catalog.hdd.filter((drive) => drive.id !== 'no-hdd');
if (!catalog.hdd.some((drive) => drive.id === 'no-hdd')) fail('optional HDD category has no SSD-only choice');
if (specRows('hdd', catalog.hdd.find((drive) => drive.id === 'no-hdd'))[0]?.[1] !== 'None') {
  fail('SSD-only HDD option displays fake drive specifications');
}
if (optionalHdds.length < 11 || optionalHdds.some((drive) => !drive.interface.includes('HDD'))) {
  fail('optional HDD category is missing hard-drive choices or includes a non-HDD');
}
const optionalHddBuild = { ...presets.esports, hdd: optionalHdds[0]?.id };
if (evaluate(optionalHddBuild).incomplete || evaluate(optionalHddBuild).errors.length) {
  fail('adding an optional HDD makes a complete preset incomplete or incompatible');
}
if (totalPrice(optionalHddBuild) !== totalPrice(presets.esports) + (optionalHdds[0]?.price || 0)) {
  fail('optional HDD price is not included in the build total');
}
if (!specRows('hdd', optionalHdds[0]).some(([label]) => label === 'Form factor')) {
  fail('optional HDD does not expose its 3D form factor');
}
pass(`${optionalHdds.length} optional HDD choices are visible, priced and compatible alongside an SSD`);

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

for (const partial of [{}, { cpu: 'r5600' }, { cpu: 'r5600', gpu: 'none' }]) {
  try {
    evaluate(partial);
    estimateGames(partial, '1080');
  } catch (error) {
    fail(`partial build ${JSON.stringify(partial)} threw: ${error.message}`);
  }
}
if (!evaluate({}).incomplete) fail('an empty build should be marked incomplete');
if (estimateGames({}).some((game) => game.fps !== null)) fail('an empty build should not show game FPS estimates');
pass('empty and partial builds render compatibility and game-planner states safely');

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
