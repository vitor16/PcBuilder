import { catalog, categories, games } from './data.js';

export const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export const getPart = (selected, cat) => catalog[cat].find((p) => p.id === selected[cat]);

export const totalPrice = (selected) =>
  categories.reduce((sum, cat) => sum + (getPart(selected, cat)?.price || 0), 0);

/** Estimated peak draw of the whole system in watts. */
export function estimateWatts(selected) {
  const cpu = getPart(selected, 'cpu');
  const gpu = getPart(selected, 'gpu');
  const base = 60; // board, RAM, drives, fans
  return Math.round((cpu?.tdp || 0) * 1.25 + (gpu?.watts || 0) + base);
}

/**
 * Returns { errors, warnings, checks }.
 * errors   = the build will not work or cannot be assembled
 * warnings = it can work but deserves attention
 * checks   = every rule with a pass/fail state, shown in the checklist
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
  const add = (ok, label, detail, severity = 'error', fixCat = null) => {
    checks.push({ ok, label, detail, severity, fixCat });
    if (!ok) (severity === 'error' ? errors : warnings).push({ text: detail, fixCat });
  };

  add(cpu.socket === board.socket, 'CPU fits motherboard',
    `${cpu.name} needs a ${cpu.socket} socket, but this board is ${board.socket}. Pick a matching CPU or board.`, 'error', 'motherboard');

  add(board.ram === ram.type, 'Memory type matches',
    `This board uses ${board.ram}, but the memory kit is ${ram.type}. They do not fit the same slots.`, 'error', 'ram');

  add(ram.sticks <= board.slots, 'Enough memory slots',
    `${ram.name} uses ${ram.sticks} slots, but this board only has ${board.slots}.`, 'error', 'ram');

  add(!(gpu.id === 'none' && !cpu.igpu), 'Something shows an image',
    `${cpu.name} has no built-in graphics. Add a graphics card or choose a CPU with built-in graphics.`, 'error', 'gpu');

  add(pcCase.forms.includes(board.form), 'Motherboard fits case',
    `This ${board.form} board does not fit the ${pcCase.name}. The case supports ${pcCase.forms.join(' and ')}.`, 'error', 'case');

  add(gpu.id === 'none' || gpu.length <= pcCase.maxGpu, 'Graphics card fits case',
    `This card is about ${gpu.length} mm long, but the case is listed for up to ${pcCase.maxGpu} mm.`, 'error', 'gpu');

  add(cooler.sockets.includes(cpu.socket), 'Cooler fits socket',
    `This cooler does not list support for ${cpu.socket}.`, 'error', 'cooler');

  if (cooler.kind === 'aio') {
    add(pcCase.radiators.includes(cooler.radiator), 'Radiator fits case',
      `The ${pcCase.name} cannot mount a ${cooler.radiator} mm radiator.`, 'error', 'cooler');
  } else {
    add(cooler.height <= pcCase.maxCooler, 'Cooler height fits case',
      `This cooler is ${cooler.height} mm tall, but the case allows ${pcCase.maxCooler} mm.`, 'error', 'cooler');
  }

  add(!(cooler.needsBox && !cpu.boxCooler), 'CPU includes a cooler',
    `${cpu.name} does not come with a cooler. Choose a separate cooler.`, 'error', 'cooler');

  const draw = estimateWatts(selected);
  add(psu.watts >= draw * 1.15, 'Power supply has headroom',
    `This build can draw about ${draw} W. A ${psu.watts} W supply leaves little headroom. Aim for ${Math.ceil(draw * 1.3 / 50) * 50} W or more.`, 'warn', 'psu');

  add(gpu.id === 'none' || psu.watts >= gpu.minPsu, 'Meets graphics card power guidance',
    `The graphics card maker suggests at least ${gpu.minPsu} W. Choose a stronger power supply.`, 'warn', 'psu');

  add(cooler.capacity >= cpu.tdp * 1.1, 'Cooler matches CPU heat',
    `${cpu.name} produces about ${cpu.tdp} W of heat. This cooler is rated for roughly ${cooler.capacity} W, so it may run hot and loud.`, 'warn', 'cooler');

  add(!(fans.extra > 0 && cooler.kind === 'aio' && cooler.rad >= 240 && ['compact', 'mini', 'cube'].includes(pcCase.style)), 'Top fans have room',
    'The top fans would clash with the radiator in this case. Choose different fans or cooler.', 'warn', 'fans');

  if (cpu.id === 'r5600g' && board.id === 'a520m') {
    add(false, 'BIOS note',
      'Some A520 boards need a BIOS update for Ryzen 5000G processors. Check the board revision before buying.', 'warn', 'motherboard');
  }

  if (storage.gen4 && board.id === 'a520m') {
    add(false, 'Drive speed note',
      'This PCIe 4.0 drive will work on this board but may run at PCIe 3.0 speed on the board’s M.2 slot.', 'warn', 'storage');
  }

  return { errors, warnings, checks, draw };
}

/** Rough planning FPS ranges for each game. */
export function estimateGames(selected) {
  const cpu = getPart(selected, 'cpu');
  const gpu = getPart(selected, 'gpu');
  const integrated = !gpu || gpu.id === 'none';
  let score = integrated
    ? (cpu.id === 'r5600g' ? 1.3 : cpu.id === 'r7600' ? 0.72 : cpu.id === 'r77700x' ? 0.75 : cpu.id === 'i713700k' ? 0.8 : 0)
    : gpu.score;
  const factor = cpu.cpuScore;
  return games.map((g) => {
    const raw = score * (integrated ? factor : 1 + (factor - 1) * 0.55) * g.rate;
    if (!raw) return { ...g, na: true };
    const low = Math.max(5, Math.round((raw * (integrated ? 0.78 : 0.86)) / 5) * 5);
    const high = Math.max(low + 5, Math.round((raw * (integrated ? 1.2 : 1.14)) / 5) * 5);
    return { ...g, low, high, integrated };
  });
}

export function resolutionLabel(selected) {
  const gpu = getPart(selected, 'gpu');
  if (gpu.id === 'none') return 'Integrated graphics · lower settings, lighter games';
  if (gpu.score >= 11) return '4K planning estimates · settings vary by game';
  if (gpu.score >= 7) return '1440p planning estimates · settings vary by game';
  return '1080p planning estimates · settings vary by game';
}
