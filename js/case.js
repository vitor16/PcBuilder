import * as THREE from 'three';

export const CASE_DIMS = {
  budget: { L: 4.6, W: 2.05, H: 4.75, base: 1.35 },
  compact: { L: 4.0, W: 1.9, H: 4.2, base: 1.15 },
  mini: { L: 4.1, W: 2.0, H: 4.35, base: 1.15 },
  matxglass: { L: 4.2, W: 2.0, H: 4.5, base: 1.2 },
  cube: { L: 4.0, W: 2.45, H: 4.25, base: 1.1 },
  mesh: { L: 4.5, W: 2.1, H: 4.8, base: 1.4 },
  silent: { L: 4.8, W: 2.2, H: 4.9, base: 1.4 },
  tower: { L: 5.1, W: 2.35, H: 5.25, base: 1.5 },
  showcase: { L: 4.7, W: 2.3, H: 4.9, base: 1.5 },
  fishbowl: { L: 4.65, W: 2.45, H: 4.75, base: 1.4 },
  towerglass: { L: 5.15, W: 2.5, H: 5.4, base: 1.55 }
};

const FEET = 0.16;
const T = 0.04; // panel thickness

/**
 * Front of the case is +x, rear is -x, glass side faces +z.
 * Returns { group, dims, ...anchors used by the board and card builders }.
 */
export function buildCase(kit, pcCase, fanPack) {
  const { mats, box, cyl, screw, tag, createFan } = kit;
  const d = CASE_DIMS[pcCase.style];
  const { L, W, H, base } = d;
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = FEET;
  group.add(body);

  const style = pcCase.style;
  const showcase = ['showcase', 'fishbowl', 'towerglass', 'matxglass'].includes(style);
  const hasPerfFront = !showcase && style !== 'silent';
  const caseSteel = pcCase.finish === 'light' ? mats.steelWhite : mats.steel;
  const caseSteelLight = pcCase.finish === 'light' ? mats.steelWhiteLight : mats.steelLight;

  /* ---- chassis ---- */
  // floor
  box(body, L, T, W, caseSteel, 0, T / 2, 0, { r: 0.015 });
  // tray (motherboard side)
  const trayZ = -W / 2 + T / 2;
  box(body, L, H, T, mats.trayInner, 0, H / 2, trayZ);
  // roof frame (leave the middle open or perforated)
  if (showcase) {
    box(body, L, T, W, caseSteel, 0, H - T / 2, 0, { r: 0.015 });
  } else {
    // solid rails and a perforated centre so roof fans can breathe
    box(body, L, T, 0.18, caseSteel, 0, H - T / 2, -W / 2 + 0.09);
    box(body, L, T, 0.18, caseSteel, 0, H - T / 2, W / 2 - 0.09);
    const roofVent = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.1, W - 0.4), mats.vent);
    roofVent.rotation.x = -Math.PI / 2; roofVent.position.set(0, H - T / 2, 0); body.add(roofVent);
  }
  // rear panel (x = -L/2)
  box(body, T, H, W, caseSteel, -L / 2 + T / 2, H / 2, 0);
  // front panel (x = +L/2)
  if (hasPerfFront) {
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.12, H - 0.2), mats.vent);
    fp.rotation.y = Math.PI / 2; fp.position.set(L / 2 - 0.06, H / 2, 0); body.add(fp);
    // front bezel frame
    box(body, 0.1, 0.1, W, caseSteelLight, L / 2 - 0.05, H - 0.05, 0, { r: 0.02 });
    box(body, 0.1, 0.1, W, caseSteelLight, L / 2 - 0.05, 0.05, 0, { r: 0.02 });
    box(body, 0.1, H, 0.07, caseSteelLight, L / 2 - 0.05, H / 2, W / 2 - 0.035);
    box(body, 0.1, H, 0.07, caseSteelLight, L / 2 - 0.05, H / 2, -W / 2 + 0.035);
  } else if (showcase) {
    // showcase: glass front panel
    const fg = new THREE.Mesh(new THREE.BoxGeometry(0.03, H - 0.1, W - 0.1), mats.glass);
    fg.userData.isGlass = true;
    fg.position.set(L / 2 - 0.02, H / 2, 0); body.add(fg);
    box(body, 0.1, 0.07, W, mats.aluminiumDark, L / 2 - 0.04, H - 0.04, 0);
    box(body, 0.1, 0.07, W, mats.aluminiumDark, L / 2 - 0.04, 0.05, 0);
    box(body, 0.1, H, 0.09, mats.aluminiumDark, L / 2 - 0.04, H / 2, W / 2 - 0.045);
    box(body, 0.1, H, 0.09, mats.aluminiumDark, L / 2 - 0.04, H / 2, -W / 2 + 0.045);
  } else {
    box(body, 0.07, H - 0.1, W - 0.1, mats.steel, L / 2 - 0.035, H / 2, 0, { r: 0.025 });
    for (let i = 0; i < 7; i++) {
      box(body, 0.012, 0.025, W - 0.4, mats.aluminiumDark, L / 2 + 0.004, H * 0.35 + i * 0.08, 0, { cast: false });
    }
  }
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(group, 0.42, FEET, 0.22, mats.rubber, sx * (L / 2 - 0.45), FEET / 2, sz * (W / 2 - 0.25), { r: 0.04 });
  }

  /* ---- glass side panel (+z) ---- */
  const glassZ = W / 2 - 0.01;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(L - 0.12, H - 0.1, 0.03), mats.glass);
  glass.position.set(0, H / 2, glassZ); glass.userData.isGlass = true;
  body.add(glass);
  // aluminium frame strips and corner screws
  const frameMat = showcase ? mats.aluminiumDark : caseSteelLight;
  box(body, L - 0.06, 0.06, 0.05, frameMat, 0, 0.05, W / 2 - 0.015);
  box(body, L - 0.06, 0.06, 0.05, frameMat, 0, H - 0.05, W / 2 - 0.015);
  box(body, 0.06, H - 0.1, 0.05, frameMat, -L / 2 + 0.06, H / 2, W / 2 - 0.015);
  box(body, 0.06, H - 0.1, 0.05, frameMat, L / 2 - 0.06, H / 2, W / 2 - 0.015);
  for (const [sx, sy] of [[-1, 0.12], [1, 0.12], [-1, H - 0.12], [1, H - 0.12]]) {
    const s = cyl(body, 0.028, 0.028, 0.03, mats.silver, sx * (L / 2 - 0.13), sy, W / 2 + 0.02, 'z', 12);
    s.castShadow = false;
  }

  /* ---- top I/O and power button on the front/top edge ---- */
  const io = new THREE.Group();
  box(io, 0.5, 0.045, 0.34, mats.plasticLight, 0, 0, 0, { r: 0.01 });
  cyl(io, 0.04, 0.04, 0.03, mats.silver, -0.12, 0.03, 0.02, 'y', 18);
  cyl(io, 0.035, 0.035, 0.012, mats.glowSoft, -0.12, 0.048, 0.02, 'y', 18);
  box(io, 0.1, 0.025, 0.04, mats.plastic, 0.07, 0.03, -0.07);
  box(io, 0.1, 0.025, 0.04, mats.plastic, 0.07, 0.03, 0.04);
  io.position.set(L / 2 - 0.4, H + 0.025, W / 2 - 0.32);
  body.add(io);

  /* ---- rear: PCI brackets, IO shield cut-out, PSU hole ---- */
  const boardTop = H - 0.28;
  const rearX = -L / 2 - 0.005;
  const rearPlate = box(body, 0.012, 0.64, 1.6, mats.trayInner, rearX, boardTop - 0.5, -W / 2 + 1.2, { receive: false });
  rearPlate.castShadow = false;
  for (let i = 0; i < 7; i++) {
    box(body, 0.015, 0.03, 0.17, mats.silver, rearX - 0.005, boardTop - 1.35 - i * 0.2, W / 2 - 0.65, { cast: false });
  }
  // PSU rear grille
  box(body, 0.012, 0.9 * Math.min(1, base / 1.4), 1.5, mats.vent, rearX, base / 2, 0, { cast: false });

  /* ---- PSU shroud / basement cover ---- */
  const shroud = new THREE.Group();
  const shW = showcase ? L - 1.35 : L - 1.2;
  const shX = -L / 2 + 0.06 + shW / 2;
  box(shroud, shW, 0.045, W - 0.1, mats.aluminiumDark, shX, base, 0, { r: 0.012 }); // top
  const front = box(shroud, shW, base - 0.04, 0.045, mats.steelLight, shX, base / 2, W / 2 - 0.1, { r: 0.012 }); // glass-facing wall
  front.userData.shroudFront = true;
  box(shroud, 0.045, base - 0.04, W - 0.1, mats.steelLight, shX + shW / 2, base / 2, 0); // front end
  // lit strip along the top of the glass-facing wall
  box(shroud, shW - 0.3, 0.018, 0.02, mats.glow, shX, base - 0.12, W / 2 - 0.07, { cast: false });
  // vent slots on the shroud top
  for (let i = 0; i < 9; i++) box(shroud, 0.025, 0.006, 0.5, mats.plastic, shX - shW / 2 + 0.5 + i * 0.1, base + 0.025, 0.2, { cast: false });
  // PSU watt label plate
  box(shroud, 0.5, 0.2, 0.01, mats.plasticLight, shX + shW / 2 - 0.5, base / 2, W / 2 - 0.067, { cast: false });
  tag(shroud, 'psu');
  body.add(shroud);

  /* ---- cable grommets on the tray (dark cut-outs) ---- */
  const trayFaceZ = -W / 2 + T + 0.002;
  for (const [x, y, w, h] of [
    [L / 2 - 1.15, base + 0.55, 0.3, 0.55],
    [L / 2 - 1.15, base + 1.75, 0.3, 0.55],
    [-L / 2 + 0.9, H - 0.35, 0.8, 0.14]
  ]) {
    const cut = box(body, w, h, 0.004, mats.rubber, x, y, trayFaceZ, { cast: false });
    cut.userData.cutout = true;
  }

  /* ---- fans ---- */
  const slots = [];
  const rearFan = { x: -L / 2 + 0.17, y: boardTop - 0.6, rotY: Math.PI / 2, d: 1.2, owner: 'case' };
  slots.push(rearFan);
  const pack = fanPack && fanPack.id !== 'included' ? fanPack : null;
  const packRgb = pack ? pack.rgb : false;
  if (showcase) {
    const intakeCount = Math.min(4, Math.max(3, pcCase.fans - 4));
    for (let i = 0; i < intakeCount; i++) {
      const gap = (H - base - 1.2) / Math.max(1, intakeCount - 1);
      slots.push({ x: L / 2 - 0.75, y: base + 0.6 + i * gap, z: W / 2 - 0.3, rotY: 0, d: 1.2, owner: pack ? 'fans' : 'case', rgb: pack ? packRgb : true });
    }
    const roofCount = Math.max(0, pcCase.fans - 1 - intakeCount);
    for (let i = 0; i < roofCount; i++) {
      const x = (i - (roofCount - 1) / 2) * 1.25;
      slots.push({ x, y: H - 0.17, z: 0, rotX: -Math.PI / 2, d: 1.4, owner: 'case', rgb: true });
    }
  } else {
    const nFront = ['compact', 'mini', 'cube'].includes(style) ? 2 : 3;
    for (let i = 0; i < nFront; i++) {
      const gap = (H - base - 0.25) / nFront;
      slots.push({ x: L / 2 - 0.2, y: base + gap * (i + 0.5) + 0.1, z: 0, rotY: -Math.PI / 2, d: 1.2, owner: pack ? 'fans' : 'case', rgb: pack ? packRgb : false });
    }
    const requestedTopFans = Math.max(pcCase.fans - 1 - nFront, fanPack && fanPack.extra > 0 ? 2 : 0);
    for (let i = 0; i < requestedTopFans; i++) {
      const x = (i - (requestedTopFans - 1) / 2) * 1.25;
      slots.push({ x, y: H - 0.17, z: 0, rotX: -Math.PI / 2, d: 1.4, owner: fanPack && fanPack.extra > 0 ? 'fans' : 'case', rgb: false });
    }
  }
  const fanObjs = [];
  for (const s of slots) {
    const fan = createFan(s.d, { rgb: s.rgb ?? false });
    fan.position.set(s.x, s.y, s.z ?? 0);
    if (s.rotY) fan.rotation.y = s.rotY;
    if (s.rotX) fan.rotation.x = s.rotX;
    tag(fan, s.owner);
    body.add(fan);
    fanObjs.push(fan);
  }

  return {
    group, body, dims: d, feet: FEET, boardTop, boardX0: -L / 2 + 0.4,
    trayZ: -W / 2 + T, glassZ: W / 2, shroudTopY: base, fanCount: slots.length, rearFanY: rearFan.y,
    frontX: L / 2 - (showcase ? 1.2 : 0.38), isShowcase: showcase
  };
}
