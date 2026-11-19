import { catalog, categories, games } from './data.js';
import { GPU_GAME_MEASUREMENTS, GPU_RASTER_HIERARCHY } from './gpu-benchmarks.js';

export const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export const getPart = (selected, cat) => catalog[cat].find((p) => p.id === selected[cat]);

export const totalPrice = (selected) =>
  categories.reduce((sum, cat) => sum + (getPart(selected, cat)?.price || 0), 0);

/** Peak draw estimate for the whole system, in watts. */
export function estimateWatts(selected) {
  const cpu = getPart(selected, 'cpu');
  const gpu = getPart(selected, 'gpu');
  const base = 60; // motherboard, memory, drives and fans
  return Math.round((cpu?.maxTurboPower ?? cpu?.tdp ?? 0) * 1.25 + (gpu?.watts || 0) + base);
}

const formLabel = (form) => (form === 'mATX' ? 'micro-ATX' : form === 'ITX' ? 'Mini-ITX' : form);
const yesNo = (v) => (v ? 'Yes' : 'No');
const COOLER_TYPE = { stock: 'Boxed cooler', tower: 'Tower cooler', dual: 'Dual-tower cooler', aio: 'Liquid cooler' };
const LIGHT_MODE = { off: 'Off', solid: 'Steady color', rainbow: 'Slow color cycle' };

/**
 * Checks the build and explains every result in plain words.
 * Returns { errors, warnings, checks, draw }.
 *   errors   = the build will not work or will not fit
 *   warnings = it will work, but deserves a second look
 *   checks   = every rule with its pass/fail state, shown in the checklist
 */
export function evaluate(selected) {
  const cpu = getPart(selected, 'cpu');
  const cooler = getPart(selected, 'cooler');
  const board = getPart(selected, 'motherboard');
  const ram = getPart(selected, 'ram');
  const gpu = getPart(selected, 'gpu');
  const psu = getPart(selected, 'psu');
  const pcCase = getPart(selected, 'case');
  const fans = getPart(selected, 'fans');
  const storage = getPart(selected, 'storage');

  const errors = [];
  const warnings = [];
  const checks = [];

  const rule = ({ label, ok, good, bad, severity = 'error', fix = null }) => {
    checks.push({ label, ok, severity, fixCat: fix, detail: ok ? good : bad });
    if (!ok) (severity === 'error' ? errors : warnings).push({ text: bad, fixCat: fix });
  };

  const hasGpu = Boolean(gpu && gpu.id !== 'none');
  const draw = estimateWatts(selected);
  const recommendedPsu = Math.ceil((draw * 1.3) / 50) * 50;

  if (cpu && board) rule({
    label: 'Processor fits the board',
    ok: cpu.socket === board.socket,
    good: `Both use the ${cpu.socket} socket`,
    bad: `${cpu.name} uses ${cpu.socket}, but this board uses ${board.socket}. Pick a matching chip or board.`,
    fix: 'motherboard'
  });

  if (board && ram) {
    rule({
      label: 'Memory type matches',
      ok: board.ram === ram.type,
      good: `${ram.type} memory works with this board`,
      bad: `This board takes ${board.ram} memory, but the kit is ${ram.type}. The sticks will not fit the slots.`,
      fix: 'ram'
    });
    rule({
      label: 'Memory fits the slots',
      ok: ram.sticks <= board.slots,
      good: `${ram.sticks} sticks fit in ${board.slots} slots`,
      bad: `The kit has ${ram.sticks} sticks, but this board only has ${board.slots} slots. Choose a kit with fewer sticks or a board with more slots.`,
      fix: 'ram'
    });
  }
  if (ram) rule({
    label: 'Enough memory',
    ok: ram.capacity >= 16,
    good: `${ram.capacity} GB is enough for modern games`,
    bad: `${ram.capacity} GB is light for modern games. 16 GB is the minimum, and 32 GB is more comfortable.`,
    severity: 'warn',
    fix: 'ram'
  });
  if (cpu && gpu) rule({
    label: 'Something shows the picture',
    ok: hasGpu || cpu.igpu,
    good: hasGpu ? `${gpu.name} will drive the screen` : `${cpu.name} has built-in graphics`,
    bad: `${cpu.name} has no built-in graphics, so the screen will stay blank without a graphics card.`,
    fix: 'gpu'
  });
  if (board && pcCase) rule({
    label: 'Board fits the case',
    ok: pcCase.forms.includes(board.form),
    good: `A ${formLabel(board.form)} board fits this case`,
    bad: `A ${formLabel(board.form)} board does not fit the ${pcCase.name}. This case takes ${pcCase.forms.map(formLabel).join(' or ')}.`,
    fix: 'case'
  });
  if (gpu && pcCase) rule({
    label: 'Graphics card fits the case',
    ok: !hasGpu || gpu.length <= pcCase.maxGpu,
    good: hasGpu ? `The ${gpu.length} mm card fits, with room to spare` : 'No graphics card to fit',
    bad: `The card is ${gpu.length} mm long, but this case takes up to ${pcCase.maxGpu} mm.`,
    fix: 'gpu'
  });
  if (cooler && cpu) rule({
    label: 'Cooler works with the processor',
    ok: cooler.sockets.includes(cpu.socket),
    good: `Works with ${cpu.socket}`,
    bad: `This cooler does not list support for ${cpu.socket}.`,
    fix: 'cooler'
  });
  const isLiquid = cooler?.kind === 'aio';
  if (cooler && pcCase) rule({
    label: 'Cooler fits the case',
    ok: isLiquid ? pcCase.radiators.includes(cooler.radiator) : cooler.height <= pcCase.maxCooler,
    good: isLiquid
      ? `The case has room for a ${cooler.radiator} mm radiator`
      : `At ${cooler.height} mm tall, it clears the ${pcCase.maxCooler} mm limit`,
    bad: isLiquid
      ? `This case cannot mount a ${cooler.radiator} mm radiator.`
      : `This cooler is ${cooler.height} mm tall, but this case allows up to ${pcCase.maxCooler} mm.`,
    fix: 'cooler'
  });
  if (cooler && cpu) rule({
    label: 'Processor has a cooler',
    ok: !(cooler.needsBox && !cpu.boxCooler),
    good: cooler.needsBox ? 'The boxed cooler ships with this chip' : 'Your chosen cooler covers this chip',
    bad: `${cpu.name} does not come with a cooler. Choose a separate cooler.`,
    fix: 'cooler'
  });
  if (psu && (cpu || gpu)) rule({
    label: 'Power supply has room',
    ok: psu.watts >= draw * 1.15,
    good: `${psu.watts} W covers the build’s estimated ${draw} W with room to spare`,
    bad: `This build can draw about ${draw} W at peak, and a ${psu.watts} W supply leaves little room. Aim for ${recommendedPsu} W or more.`,
    severity: 'warn',
    fix: 'psu'
  });
  if (psu && gpu) rule({
    label: 'Power supply meets the card’s needs',
    ok: !hasGpu || psu.watts >= gpu.minPsu,
    good: 'Meets the card maker’s minimum',
    bad: `${gpu.name} needs at least ${gpu.minPsu} W from the power supply. Choose a stronger one.`,
    severity: 'warn',
    fix: 'psu'
  });
  if (cooler && cpu) rule({
    label: 'Cooler can handle the heat',
    ok: cooler.capacity >= (cpu.maxTurboPower ?? cpu.tdp) * 1.1,
    good: `Handles about ${cpu.maxTurboPower ?? cpu.tdp} W at peak`,
    bad: `${cpu.name} can draw up to about ${cpu.maxTurboPower ?? cpu.tdp} W at peak. This cooler is rated for about ${cooler.capacity} W, so it may run hot and loud.`,
    severity: 'warn',
    fix: 'cooler'
  });
  if (fans && cooler && pcCase) rule({
    label: 'Top fans have room',
    ok: !(fans.extra > 0 && isLiquid && cooler.radiator >= 240 && ['compact', 'mini', 'cube'].includes(pcCase.style)),
    good: 'The top fans clear the cooler',
    bad: 'The top fans would clash with the radiator in this small case. Pick different fans or a smaller cooler.',
    severity: 'warn',
    fix: 'fans'
  });

  if (cpu?.id === 'r5600g' && board?.id === 'a520m') {
    rule({
      label: 'Board BIOS version',
      ok: false,
      bad: 'Some A520 boards need a BIOS update before they run Ryzen 5000G chips. Check the board’s BIOS version before you buy.',
      severity: 'warn',
      fix: 'motherboard'
    });
  }

  if (storage?.gen4 && board?.id === 'a520m') {
    rule({
      label: 'Drive speed on this board',
      ok: false,
      bad: 'This PCIe 4.0 drive works on this board, but it will run at PCIe 3.0 speed.',
      severity: 'warn',
      fix: 'storage'
    });
  }

  const incomplete = categories.some((category) => !getPart(selected, category));
  return { errors, warnings, checks, draw, incomplete };
}

/** Plain-language details for a part. The first three rows are the quick summary on each card. */
export function specRows(cat, p) {
  if (!p) return [];
  switch (cat) {
    case 'cpu':
      return [
        ['Vendor', p.vendor],
        ['Generation', p.generation],
        ['Cores and threads', `${p.cores} cores, ${p.threads} threads`],
        ['Socket', p.socket],
        ['Base speed', `${p.base} GHz`],
        ['Boost speed', `${p.boost} GHz`],
        ['Cache', `${p.cache} MB`],
        ['Processor base power / TDP', `${p.tdp} W`],
        ...(p.maxTurboPower ? [['Maximum Turbo Power', `${p.maxTurboPower} W`]] : []),
        ['Memory', p.memory],
        ['Built-in graphics', yesNo(p.igpu)],
        ['Cooler in the box', yesNo(p.boxCooler)],
        ...(p.igpuScore ? [['Integrated graphics planning score', p.igpuScore]] : [])
      ];
    case 'cooler':
      return [
        ['Type', COOLER_TYPE[p.kind]],
        ['Size', p.kind === 'aio' ? `${p.radiator} mm radiator` : `${p.height} mm tall`],
        ['Handles about', `${p.capacity} W of heat`],
        ['Sockets', p.sockets.join(', ')],
        ...(p.fanCount ? [['Fans', `${p.fanCount} × ${p.fanSize} mm`]] : []),
        ...(p.fanSpeed ? [['Fan speed', p.fanSpeed]] : []),
        ...(p.noise ? [['Maximum noise class', p.noise]] : []),
        ...(p.bearing ? [['Fan bearing', p.bearing]] : []),
        ...(p.heatpipeCount ? [['Heat pipes', `${p.heatpipeCount} direct-contact pipes`]] : []),
        ...(p.ramClearance ? [['Memory clearance', p.ramClearance]] : []),
        ...(p.radiatorThickness ? [['Radiator thickness', p.radiatorThickness]] : []),
        ...(p.tubeLength ? [['Tube routing', p.tubeLength]] : []),
        ...(p.pumpPower ? [['Pump connection', p.pumpPower]] : []),
        ...(p.lighting ? [['Lighting / finish', p.lighting]] : [])
      ];
    case 'motherboard':
      return [
        ['Socket', p.socket],
        ['Memory', p.ram],
        ['Board size', formLabel(p.form)],
        ['Memory slots', `${p.slots}`],
        ['M.2 drive slots', `${p.m2}`],
        ['Wi-Fi', p.wifi ? (p.wifiType || 'Yes') : 'No'],
        ['Rear USB ports', p.usbRear || 'Port count and speed vary by board revision; check its rear I/O'],
        ['Front USB headers', p.usbFront || 'Check the board headers against the case front-panel cables'],
        ...(p.pcie ? [['Expansion', p.pcie]] : []),
        ...(p.lan ? [['Wired networking', p.lan]] : [])
      ];
    case 'ram':
      return [
        ['Capacity', `${p.capacity} GB in ${p.sticks} sticks`],
        ['Type', p.type],
        ['Speed', `${p.speed} MT/s`],
        ['Latency', `CL${p.cl}`],
        ...(p.voltage ? [['Voltage', p.voltage]] : []),
        ...(p.profile ? [['Memory profile', p.profile]] : [])
      ];
    case 'gpu':
      if (p.id === 'none') return [['Graphics', 'Uses the processor’s built-in graphics'], ['Generation', p.generation]];
      const hierarchyResult = GPU_RASTER_HIERARCHY.results[p.id];
      return [
        ['Vendor', p.vendor],
        ['Generation', p.generation],
        ['Video memory', `${p.vram} GB ${p.mem}`],
        ['Card length', `${p.length} mm`],
        ['Typical power', `about ${p.watts} W`],
        ['Suggested power supply', `${p.minPsu} W or more`],
        ['Cooler style', p.kind === 'triple' ? 'Three fans' : 'Two fans'],
        ['Slot width', p.slotWidth || (p.kind === 'triple' ? '3-slot' : '2-slot')],
        ['Fan layout', p.fanLayout || (p.kind === 'triple' ? '3 fans' : '2 fans')],
        ['Outputs', p.outputs || 'Check the card listing'],
        ...(p.bus ? [['Memory bus', p.bus]] : []),
        ...(p.memoryBandwidth ? [['Memory bandwidth', p.memoryBandwidth]] : []),
        ...(p.pcie ? [['PCI Express interface', p.pcie]] : []),
        ...(p.streamProcessors ? [['Stream processors', `${p.streamProcessors}`]] : []),
        ...(p.boostClockMhz ? [['Boost clock', `${p.boostClockMhz} MHz`]] : []),
        ...(p.powerConnector ? [['Power connector', p.powerConnector]] : []),
        ...(hierarchyResult ? [
          ['Measured 1080p raster average', `${hierarchyResult.averageFps.toFixed(1)} fps · 19-game geometric mean`],
          ['Measured 1080p 1% low', `${hierarchyResult.onePercentLowFps} fps · 19-game geometric mean`],
          ['Benchmark scope', 'Published test result, not a per-game score or a custom-build result'],
          ['Benchmark source', {
            text: `${GPU_RASTER_HIERARCHY.source.title} (updated ${GPU_RASTER_HIERARCHY.source.updated})`,
            href: GPU_RASTER_HIERARCHY.source.url
          }]
        ] : [
          ['Benchmark coverage', 'Not included in this 19-game 1080p hierarchy; game FPS remains a model estimate']
        ])
      ];
    case 'storage':
      return [
        ['Capacity', p.capacity >= 1000 ? `${p.capacity / 1000} TB` : `${p.capacity} GB`],
        ['Interface', p.interface],
        ['Read speed', `up to ${p.read} MB/s`],
        ['PCIe 4.0', yesNo(p.gen4)],
        ...(p.formFactor ? [['Form factor', p.formFactor]] : []),
        ...(p.dimensions ? [['Size', p.dimensions]] : []),
        ...(p.write ? [['Write performance', p.write]] : []),
        ...(p.endurance ? [['Endurance note', p.endurance]] : [])
      ];
    case 'psu':
      return [
        ['Output', `${p.watts} W`],
        ['Efficiency', `80 PLUS ${p.efficiency}`],
        ['Size (W × H × L)', p.dimensions || 'Check the unit'],
        ['Fan', p.fanMm ? `${p.fanMm} mm` : 'Check the unit'],
        ['Protections', p.protections || 'Check the unit'],
        ['Cables', p.modular ? 'Detachable' : 'Fixed'],
        ...(p.standard ? [['ATX standard', p.standard]] : []),
        ...(p.gpuCables ? [['Graphics-card cables', p.gpuCables]] : []),
        ...(p.warranty ? [['Warranty', p.warranty]] : [])
      ];
    case 'case':
      return [
        ['Board sizes', p.forms.map(formLabel).join(' or ')],
        ['External dimensions (H × W × D)', p.dimensions || 'Check the exact case listing'],
        ['Longest graphics card', `${p.maxGpu} mm`],
        ['Tallest air cooler', `${p.maxCooler} mm`],
        ['Radiators', p.radiators.map((r) => `${r} mm`).join(', ')],
        ['Radiator positions', p.radiatorPositions],
        ['Fans included', `${p.fans}`],
        ['Included fan layout', p.includedFanLayout],
        ['Fan mounts', p.fanMounts],
        ['Dust filters', p.filters],
        ['Drive bays', p.driveBays],
        ['Expansion slots', `${p.expansionSlots}`],
        ['Chassis and panels', p.materials],
        ['Cable routing', p.cableSpace],
        ['Front USB and audio', p.frontUsb || 'Check the exact case model; front I/O varies'],
        ['Finish', p.finish === 'light' ? 'Light' : 'Dark']
      ];
    case 'fans':
      if (!p.count) return [['Fans', 'Whatever your case includes']];
      return [
        ['Count', `${p.count} × ${p.size} mm`],
        ['Placement', p.placement],
        ['Lighting', p.rgb ? 'ARGB lighting' : 'None'],
        ...(p.control ? [['Fan control', p.control]] : [])
      ];
    case 'lighting':
      return [
        ['Effect', p.effect || LIGHT_MODE[p.mode]],
        ...(p.zones ? [['Coverage', p.zones]] : [])
      ];
    case 'os':
      return [
        ['Family', p.family],
        ['Intended use', p.purpose],
        ['Support / compatibility', p.supportNote],
        ['Performance data', 'This OS selection does not apply an FPS adjustment; comparable measured OS benchmarks are not available here.'],
        ['License and installation', 'Not included; install and license separately']
      ];
    default:
      return [];
  }
}

export const quickSpecs = (cat, p) => specRows(cat, p).slice(0, 3);

/* ---------- Game performance ---------- */

export const RESOLUTIONS = [
  { id: '1080', label: '1080p', factor: 1 },
  { id: '1440', label: '1440p', factor: 0.6 },
  { id: '2160', label: '4K', factor: 0.3 }
];

export const FPS_TARGET = 60;

/** Turns a frame rate into a plain-language verdict. */
export function fpsVerdict(fps) {
  if (fps === null) return { label: 'Not available', tone: 'none' };
  if (fps >= 120) return { label: 'Very smooth', tone: 'great' };
  if (fps >= 60) return { label: 'Smooth', tone: 'good' };
  if (fps >= 40) return { label: 'Playable', tone: 'ok' };
  if (fps >= 25) return { label: 'Rough', tone: 'low' };
  return { label: 'Struggles', tone: 'bad' };
}

/**
 * Game-specific planning estimates use a GPU tier, game weight, resolution factor and CPU cap.
 * Measured 19-game GPU averages calibrate the tier where available; they are not per-game results.
 */
export function estimateGames(selected, resolutionId = '1080') {
  const cpu = getPart(selected, 'cpu');
  const gpu = getPart(selected, 'gpu');
  const res = RESOLUTIONS.find((r) => r.id === resolutionId) || RESOLUTIONS[0];
  if (!cpu || !gpu) {
    const note = !cpu
      ? 'Choose a processor and graphics option to estimate frame rates.'
      : 'Choose a graphics card or select no graphics card to estimate frame rates.';
    return games.map((g) => ({ ...g, fps: null, verdict: fpsVerdict(null), integrated: false, note }));
  }
  const integrated = !gpu || gpu.id === 'none';
  const hierarchyResult = GPU_RASTER_HIERARCHY.results[gpu.id];
  const hierarchyReference = GPU_RASTER_HIERARCHY.results[GPU_RASTER_HIERARCHY.referenceGpu];
  const referenceGpu = getPart({ gpu: GPU_RASTER_HIERARCHY.referenceGpu }, 'gpu');
  const level = integrated
    ? (cpu.igpu ? cpu.igpuScore : 0)
    : hierarchyResult && hierarchyReference && referenceGpu
      ? referenceGpu.score * hierarchyResult.averageFps / hierarchyReference.averageFps
      : gpu.score;
  const defaultCpuAdjustment = 1 + (cpu.cpuScore - 1) * 0.55;
  const measuredPair = resolutionId === '1080' ? GPU_RASTER_HIERARCHY.cpuScaling.results[gpu.id]?.[cpu.id] : null;
  const referencePair = GPU_RASTER_HIERARCHY.cpuScaling.results[gpu.id]?.[GPU_RASTER_HIERARCHY.cpuScaling.referenceCpu];
  const referenceCpu = getPart({ cpu: GPU_RASTER_HIERARCHY.cpuScaling.referenceCpu }, 'cpu');
  const referenceCpuAdjustment = referenceCpu ? 1 + (referenceCpu.cpuScore - 1) * 0.55 : 1;
  const cpuAdj = measuredPair && referencePair
    ? measuredPair.averageFps / referencePair.averageFps * referenceCpuAdjustment
    : defaultCpuAdjustment;
  const cpuBenchmark = measuredPair ? {
    ...measuredPair,
    source: GPU_RASTER_HIERARCHY.cpuScaling.source,
    gpuName: gpu.name,
    cpuName: cpu.name
  } : null;

  return games.map((g) => {
    if (!level) return { ...g, fps: null, verdict: fpsVerdict(null), integrated, cpuBenchmark };
    const bound = level * g.rate * res.factor * cpuAdj;
    const capped = Math.min(bound, g.cap * cpu.cpuScore);
    const gameMeasurement = GPU_RASTER_HIERARCHY.cpuScaling.gameMeasurements[g.name];
    const directMeasurement = resolutionId === '1080' ? gameMeasurement?.results[gpu.id]?.[cpu.id] : null;
    const publishedTest = GPU_GAME_MEASUREMENTS.find((measurement) =>
      measurement.game === g.name && measurement.mode === 'raster'
    );
    const publishedMeasurement = publishedTest?.resolutions[resolutionId]?.[gpu.id]?.[cpu.id];
    const exactMeasurement = directMeasurement || publishedMeasurement;
    const fps = exactMeasurement?.averageFps ?? Math.max(5, Math.round(capped / 5) * 5);
    const directBenchmark = exactMeasurement ? {
      ...exactMeasurement,
      source: directMeasurement ? GPU_RASTER_HIERARCHY.cpuScaling.source : publishedTest.source,
      chartUrl: directMeasurement ? null : publishedTest.chartUrl,
      resolution: directMeasurement ? '1080p' : `${resolutionId}p`,
      settings: directMeasurement ? gameMeasurement.settings : publishedTest.settings,
      gpuBoard: directMeasurement ? null : publishedTest.source.gpuBoards[gpu.id]
    } : null;
    return { ...g, fps, integrated, verdict: fpsVerdict(fps), cpuBenchmark, directBenchmark };
  });
}

/** Returns only ray-tracing measurements for the exact published CPU/GPU/resolution setup. */
export function estimateRayTracingGames(selected, resolutionId = '1080') {
  const cpu = getPart(selected, 'cpu');
  const gpu = getPart(selected, 'gpu');
  if (!cpu || !gpu || gpu.id === 'none') {
    const note = !cpu || !gpu
      ? 'Choose a processor and graphics card to look up measured ray-tracing results.'
      : 'Ray-tracing results require a dedicated graphics card.';
    return [{ name: 'Measured ray-tracing results', genre: 'Published tests', fps: null, verdict: fpsVerdict(null), note }];
  }

  const measurements = GPU_GAME_MEASUREMENTS.filter((measurement) => measurement.mode === 'ray-tracing')
    .map((measurement) => {
      const result = measurement.resolutions[resolutionId]?.[gpu.id]?.[cpu.id];
      if (!result) return null;
      return {
        name: measurement.game,
        genre: 'Ray tracing · direct test',
        fps: result.averageFps,
        verdict: fpsVerdict(result.averageFps),
        directBenchmark: {
          ...result,
          source: measurement.source,
          chartUrl: measurement.chartUrl,
          resolution: `${resolutionId}p`,
          settings: measurement.settings,
          gpuBoard: measurement.source.gpuBoards[gpu.id]
        }
      };
    })
    .filter(Boolean);

  if (measurements.length) return measurements;
  return [{
    name: 'No matching ray-tracing test',
    genre: 'Published measurements only',
    fps: null,
    verdict: fpsVerdict(null),
    note: `No direct ray-tracing result is published for ${cpu.name} + ${gpu.name} at ${resolutionId === '2160' ? '4K' : `${resolutionId}p`}. No RT FPS estimate is shown.`
  }];
}

/** One sentence that explains the results in plain words. */
export function gamesSummary(results, resolutionId = '1080') {
  const res = RESOLUTIONS.find((r) => r.id === resolutionId) || RESOLUTIONS[0];
  const playable = results.filter((g) => g.fps !== null);
  if (!playable.length) {
    if (results[0]?.note) return results[0].note;
    return 'This build has no graphics. Add a graphics card, or pick a processor with built-in graphics, to see game estimates.';
  }
  const smooth = playable.filter((g) => g.fps >= FPS_TARGET).length;
  const hardest = playable.reduce((a, b) => (b.fps < a.fps ? b : a));
  const hardestNote = hardest.directBenchmark
    ? `${hardest.name} measured ${hardest.fps} fps on average in this exact CPU/GPU test.`
    : `${hardest.name} is the most demanding, at about ${hardest.fps} fps.`;

  if (smooth === playable.length) {
    return `At ${res.label}, all ${playable.length} games reach ${FPS_TARGET} fps or more. ${hardestNote}`;
  }
  if (smooth === 0) {
    return `At ${res.label}, none of these games reach ${FPS_TARGET} fps. Try a lower resolution or a stronger graphics card. ${hardestNote}`;
  }
  return `At ${res.label}, ${smooth} of ${playable.length} games reach ${FPS_TARGET} fps. ${hardestNote}`;
}
