import * as THREE from 'three';
import { labelTexture } from './textures.js';

export const CASE_DIMS = {
  budget: { L: 4.6, W: 2.05, H: 4.75, base: 1.35 },
  compact: { L: 4.0, W: 1.9, H: 4.2, base: 1.15 },
  mini: { L: 4.1, W: 2.0, H: 4.35, base: 1.15 },
  matxglass: { L: 4.2, W: 2.0, H: 4.5, base: 1.2 },
  cube: { L: 4.0, W: 2.45, H: 4.25, base: 1.1 },
  c6max: { L: 3.49, W: 2.02, H: 2.95, base: 0.58 },
  mesh: { L: 4.5, W: 2.1, H: 4.8, base: 1.4 },
  silent: { L: 4.8, W: 2.2, H: 4.9, base: 1.4 },
  tower: { L: 5.1, W: 2.35, H: 5.25, base: 1.5 },
  showcase: { L: 4.7, W: 2.3, H: 4.9, base: 1.5 },
  fishbowl: { L: 4.65, W: 2.45, H: 4.75, base: 1.4 },
  towerglass: { L: 5.15, W: 2.5, H: 5.4, base: 1.55 }
};

const FEET = 0.16;
const T = 0.04; // panel thickness

function finePerforationMaterial(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000';
  const spacing = 11;
  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      context.beginPath();
      context.arc(x, y, 2.1, 0, Math.PI * 2);
      context.fill();
    }
  }
  const perforation = new THREE.CanvasTexture(canvas);
  return new THREE.MeshStandardMaterial({
    color, metalness: 0.65, roughness: 0.52, alphaMap: perforation, alphaTest: 0.5,
    side: THREE.DoubleSide
  });
}

/**
 * Front of the case is +x, rear is -x, glass side faces +z.
 * Returns { group, dims, ...anchors used by the board and card builders }.
 */
export function buildCase(kit, pcCase, fanPack, psu, cooler = null) {
  const { mats, box, cyl, screw, tag, createFan } = kit;
  const isC6Max = pcCase.id === 'jonsbo-c6-max';
  const d = isC6Max ? CASE_DIMS.c6max : CASE_DIMS[pcCase.style];
  const { L, W, H, base } = d;
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = FEET;
  group.add(body);

  const style = pcCase.style;
  const showcase = ['showcase', 'fishbowl', 'towerglass', 'matxglass'].includes(style);
  const caseDescription = `${pcCase.name} ${pcCase.materials || ''} ${pcCase.includedFanLayout || ''}`.toLowerCase();
  const frontMesh = /mesh front|front mesh|perforated.*front|front.*perforated|ventilated front|front intake/.test(caseDescription);
  const glassFront = showcase && !frontMesh;
  const hasPerfFront = !glassFront && style !== 'silent';
  const caseSteel = isC6Max
    ? mats.steel.clone()
    : pcCase.finish === 'light' ? mats.steelWhite : mats.steel;
  const caseSteelLight = isC6Max
    ? caseSteel.clone()
    : pcCase.finish === 'light' ? mats.steelWhiteLight : mats.steelLight;
  if (isC6Max) {
    caseSteel.color.set(0x202327);
    caseSteel.metalness = 0.32;
    caseSteel.roughness = 0.64;
    caseSteelLight.color.set(0x2b2f33);
    caseSteelLight.metalness = 0.3;
    caseSteelLight.roughness = 0.58;
  }
  const fineMesh = isC6Max ? finePerforationMaterial(0x25292e) : null;

  /* ---- chassis ---- */
  // floor
  box(body, L, T, W, caseSteel, 0, T / 2, 0, { r: 0.015 });
  // tray (motherboard side)
  const trayZ = -W / 2 + T / 2;
  box(body, L, H, T, mats.trayInner, 0, H / 2, trayZ);
  // roof frame (leave the middle open or perforated)
  if (glassFront) {
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
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.12, H - 0.2), fineMesh || mats.vent);
    fp.rotation.y = Math.PI / 2; fp.position.set(L / 2 - 0.06, H / 2, 0); body.add(fp);
    // front bezel frame
    box(body, 0.1, 0.1, W, caseSteelLight, L / 2 - 0.05, H - 0.05, 0, { r: 0.02 });
    box(body, 0.1, 0.1, W, caseSteelLight, L / 2 - 0.05, 0.05, 0, { r: 0.02 });
    box(body, 0.1, H, 0.07, caseSteelLight, L / 2 - 0.05, H / 2, W / 2 - 0.035);
    box(body, 0.1, H, 0.07, caseSteelLight, L / 2 - 0.05, H / 2, -W / 2 + 0.035);
  } else if (glassFront) {
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
    const x = sx * (L / 2 - (isC6Max ? 0.3 : 0.45));
    const z = sz * (W / 2 - (isC6Max ? 0.24 : 0.25));
    if (isC6Max) {
      cyl(group, 0.14, 0.14, FEET, mats.silver, x, FEET / 2, z, 'y', 20);
      cyl(group, 0.12, 0.12, 0.025, mats.rubber, x, 0.012, z, 'y', 20);
    } else {
      box(group, 0.42, FEET, 0.22, mats.rubber, x, FEET / 2, z, { r: 0.04 });
    }
  }

  /* ---- glass side panel (+z) ---- */
  const glassZ = W / 2 - 0.01;
  if (isC6Max) {
    const windowW = L * 0.6;
    const windowH = H * 0.66;
    const windowX = -L / 2 + 0.12 + windowW / 2;
    const windowY = H * 0.54;
    const panelZ = W / 2 + 0.012;
    const frameMat = caseSteelLight;
    const window = new THREE.Mesh(new THREE.BoxGeometry(windowW, windowH, 0.025), mats.glass);
    window.position.set(windowX, windowY, panelZ);
    window.userData.isGlass = true;
    body.add(window);
    box(body, windowW + 0.08, 0.055, 0.06, frameMat, windowX, windowY + windowH / 2 + 0.035, panelZ);
    box(body, windowW + 0.08, 0.055, 0.06, frameMat, windowX, windowY - windowH / 2 - 0.035, panelZ);
    box(body, 0.055, windowH, 0.06, frameMat, windowX - windowW / 2 - 0.035, windowY, panelZ);
    box(body, 0.055, windowH, 0.06, frameMat, windowX + windowW / 2 + 0.035, windowY, panelZ);

    const meshX = windowX + windowW / 2 + 0.08;
    const meshW = L / 2 - 0.1 - meshX;
    const sideMesh = new THREE.Mesh(new THREE.PlaneGeometry(meshW, H - 0.28), fineMesh);
    sideMesh.position.set(meshX + meshW / 2, H / 2, panelZ);
    body.add(sideMesh);
    box(body, L - 0.1, 0.1, 0.08, caseSteelLight, 0, H - 0.05, panelZ);
    box(body, L - 0.1, 0.1, 0.08, caseSteelLight, 0, 0.05, panelZ);

    // Reinforced corners and exposed panel fasteners match the C6 MAX's rugged frame.
    for (const sx of [-1, 1]) for (const sy of [0.16, H - 0.16]) {
      const corner = box(body, 0.22, 0.26, 0.09, caseSteelLight, sx * (L / 2 - 0.11), sy, panelZ + 0.025, { r: 0.025 });
      corner.rotation.z = sx * (sy < H / 2 ? -1 : 1) * 0.12;
      const bolt = cyl(body, 0.035, 0.035, 0.025, mats.silver, sx * (L / 2 - 0.11), sy, panelZ + 0.08, 'z', 12);
      bolt.castShadow = false;
    }
    box(body, 0.06, H - 0.2, 0.1, frameMat, L / 2 - 0.025, H / 2, W / 2 - 0.04);

    // Raised carry handle on the top deck.
    for (const z of [-W * 0.3, W * 0.3]) {
      box(body, 0.32, 0.08, 0.16, mats.plasticLight, -L * 0.22, H + 0.025, z, { r: 0.025 });
    }
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-L * 0.22, H + 0.04, -W * 0.3),
      new THREE.Vector3(-L * 0.22, H + 0.25, -W * 0.3),
      new THREE.Vector3(-L * 0.22, H + 0.31, 0),
      new THREE.Vector3(-L * 0.22, H + 0.25, W * 0.3),
      new THREE.Vector3(-L * 0.22, H + 0.04, W * 0.3)
    ]);
    body.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 24, 0.045, 8, false), mats.plasticLight));

    // Compact front-panel connections sit low on the mesh face.
    const ioX = L / 2 + 0.012;
    cyl(body, 0.045, 0.045, 0.025, mats.silver, ioX, 0.16, -0.38, 'x', 18).castShadow = false;
    cyl(body, 0.028, 0.028, 0.025, mats.plastic, ioX, 0.16, 0.4, 'x', 18).castShadow = false;
    box(body, 0.025, 0.09, 0.16, mats.plasticLight, ioX, 0.16, -0.14, { r: 0.012 });
    box(body, 0.025, 0.09, 0.16, mats.plasticLight, ioX, 0.16, 0.12, { r: 0.012 });
    box(body, 0.012, 0.045, 0.1, mats.aluminiumDark, ioX + 0.014, 0.16, 0.12, { cast: false });
    for (const sx of [-1, 1]) for (const sy of [0.16, H - 0.16]) {
      cyl(body, 0.035, 0.035, 0.025, mats.silver, ioX + 0.02, sy, sx * (W / 2 - 0.14), 'x', 12).castShadow = false;
    }
  } else {
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
  }

  /* ---- top I/O and power button on the front/top edge ---- */
  if (!isC6Max) {
    const io = new THREE.Group();
    box(io, 0.5, 0.045, 0.34, mats.plasticLight, 0, 0, 0, { r: 0.01 });
    cyl(io, 0.04, 0.04, 0.03, mats.silver, -0.12, 0.03, 0.02, 'y', 18);
    cyl(io, 0.035, 0.035, 0.012, mats.glowSoft, -0.12, 0.048, 0.02, 'y', 18);
    box(io, 0.1, 0.025, 0.04, mats.plastic, 0.07, 0.03, -0.07);
    box(io, 0.1, 0.025, 0.04, mats.plastic, 0.07, 0.03, 0.04);
    io.position.set(L / 2 - 0.4, H + 0.025, W / 2 - 0.32);
    body.add(io);
  }

  /* ---- rear: PCI brackets, IO shield cut-out, PSU hole ---- */
  const boardTop = H - 0.28;
  const rearX = -L / 2 - 0.005;
  const rearPlate = box(body, 0.012, 0.64, 1.6, mats.trayInner, rearX, boardTop - 0.5, -W / 2 + 1.2, { receive: false });
  rearPlate.castShadow = false;
  const expansionSlotCount = isC6Max ? 4 : 7;
  for (let i = 0; i < expansionSlotCount; i++) {
    const slotY = boardTop - 1.35 - i * (isC6Max ? 0.14 : 0.2);
    box(body, 0.015, 0.03, 0.17, mats.silver, rearX - 0.005, slotY, W / 2 - 0.65, { cast: false });
  }
  // PSU rear grille
  box(body, 0.012, 0.9 * Math.min(1, base / 1.4), 1.5, mats.vent, rearX, base / 2, 0, { cast: false });

  /* ---- PSU shroud / basement cover ---- */
  const shroud = new THREE.Group();
  // The PSU chamber is sized from the chosen unit's real length (mm → units) plus room for cables.
  const psuLen = (psu?.lengthMm ?? 160) / 100;
  const shW = Math.min(showcase ? L - 1.35 : L - 1.2, Math.max(2.6, psuLen + 0.8));
  const shX = -L / 2 + 0.06 + shW / 2;
  const psuX = -L / 2 + 0.08 + psuLen / 2;
  const psuLength = psu?.lengthMm ? psuLen : 1.6;
  if (psu) {
    const psuGroup = new THREE.Group();
    const psuShell = box(psuGroup, psuLength, 0.82, 1.48, mats.plastic, 0, 0, 0, { r: 0.035 });
    psuShell.material = mats.plastic.clone();
    psuShell.material.color.set(pcCase.finish === 'light' ? 0x30343a : 0x101317);
    box(psuGroup, psuLength * 0.72, 0.018, 1.22, mats.aluminiumDark, 0.02, 0.415, 0, { r: 0.025 });
    const fanX = -psuLength * 0.08;
    cyl(psuGroup, 0.48, 0.48, 0.018, mats.plasticLight, fanX, -0.425, 0, 'y', 48);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      box(psuGroup, 0.018, 0.012, 0.82, mats.aluminiumDark,
        fanX + Math.cos(angle) * 0.21, -0.439, Math.sin(angle) * 0.21,
        { cast: false }).rotation.y = angle;
    }
    cyl(psuGroup, 0.07, 0.07, 0.02, mats.aluminiumDark, fanX, -0.442, 0, 'y', 24);
    for (const [x, z] of [[-0.58, -0.58], [0.58, -0.58], [-0.58, 0.58], [0.58, 0.58]]) {
      cyl(psuGroup, 0.025, 0.025, 0.012, mats.silver, x, -0.442, z, 'y', 10);
    }
    for (const z of [-0.22, 0, 0.22]) {
      box(psuGroup, 0.045, 0.16, 0.1, mats.plasticLight, -psuLength / 2 - 0.012, 0.08, z, { r: 0.01 });
    }
    box(psuGroup, 0.04, 0.14, 0.12, mats.plasticLight, -psuLength / 2 - 0.014, -0.12, -0.28, { r: 0.01 });
    box(psuGroup, 0.035, 0.07, 0.07, mats.glowSoft, -psuLength / 2 - 0.04, -0.12, 0.28, { r: 0.01, cast: false });
    psuGroup.position.set(psuX, base / 2, 0);
    tag(psuGroup, 'psu');
    body.add(psuGroup);
  }

  box(shroud, shW, 0.045, W - 0.1, mats.aluminiumDark, shX, base, 0, { r: 0.012 }); // top
  const front = box(shroud, shW, base - 0.04, 0.045, isC6Max ? caseSteel : mats.steelLight, shX, base / 2, W / 2 - 0.1, { r: 0.012 }); // glass-facing wall
  front.userData.shroudFront = true;
  box(shroud, 0.045, base - 0.04, W - 0.1, mats.steelLight, shX + shW / 2, base / 2, 0); // front end
  if (!isC6Max) {
    // lit strip along the top of the glass-facing wall
    box(shroud, shW - 0.3, 0.018, 0.02, mats.glow, shX, base - 0.12, W / 2 - 0.07, { cast: false });
    // vent slots on the shroud top
    for (let i = 0; i < 9; i++) box(shroud, 0.025, 0.006, 0.5, mats.plastic, shX - shW / 2 + 0.5 + i * 0.1, base + 0.025, 0.2, { cast: false });
    // PSU watt label plate
    box(shroud, 0.5, 0.2, 0.01, mats.plasticLight, shX + shW / 2 - 0.5, base / 2, W / 2 - 0.067, { cast: false });
    const psuLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.16), new THREE.MeshStandardMaterial({
      map: labelTexture(psu ? `${psu.watts} W POWER` : 'POWER SUPPLY', psu?.standard || 'ATX', '#dce4e9', 256, 96),
      roughness: 0.65
    }));
    psuLabel.position.set(shX + shW / 2 - 0.5, base / 2, W / 2 - 0.061);
    shroud.add(psuLabel);
  }
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
  const caseFanSize = Number(pcCase.includedFanLayout?.match(/\b(92|120|140)\s*mm/i)?.[1] || 120);
  const caseFanDiameter = caseFanSize / 100;
  const rearFan = { x: -L / 2 + 0.17, y: boardTop - 0.6, rotY: Math.PI / 2, d: caseFanDiameter, owner: 'case' };
  const pack = fanPack && fanPack.id !== 'included' ? fanPack : null;
  const packRgb = pack ? pack.rgb : false;
  const topRadiator = cooler?.kind === 'aio' && cooler.radiator;
  if (isC6Max) {
    slots.push(rearFan);
    if (!topRadiator) for (const x of [-0.62, 0.62]) {
      slots.push({ x, y: H - 0.17, z: 0, rotX: -Math.PI / 2, d: caseFanDiameter, owner: pack ? 'fans' : 'case', rgb: packRgb });
    }
    slots.push({ x: 0, y: 0.13, z: 0, rotX: Math.PI / 2, d: 1.2, owner: pack && pack.extra > 0 ? 'fans' : 'case', rgb: packRgb });
  } else {
    slots.push(rearFan);
  }
  if (!isC6Max && showcase && !frontMesh) {
    const intakeCount = Math.min(4, Math.max(0, pcCase.fans - 1));
    for (let i = 0; i < intakeCount; i++) {
      const gap = (H - base - 1.2) / Math.max(1, intakeCount - 1);
      slots.push({ x: L / 2 - 0.75, y: base + 0.6 + i * gap, z: W / 2 - 0.3, rotY: 0, d: caseFanDiameter, owner: pack ? 'fans' : 'case', rgb: pack ? packRgb : true });
    }
    const roofCount = topRadiator ? 0 : Math.max(0, pcCase.fans - 1 - intakeCount);
    for (let i = 0; i < roofCount; i++) {
      const x = (i - (roofCount - 1) / 2) * 1.25;
      slots.push({ x, y: H - 0.17, z: 0, rotX: -Math.PI / 2, d: caseFanDiameter, owner: 'case', rgb: true });
    }
  } else if (!isC6Max) {
    const nFront = Math.min(['compact', 'mini', 'cube'].includes(style) ? 2 : 3, Math.max(0, pcCase.fans - 1));
    for (let i = 0; i < nFront; i++) {
      const gap = (H - base - 0.25) / nFront;
      slots.push({ x: L / 2 - 0.2, y: base + gap * (i + 0.5) + 0.1, z: 0, rotY: -Math.PI / 2, d: caseFanDiameter, owner: pack ? 'fans' : 'case', rgb: pack ? packRgb : false });
    }
    const requestedTopFans = topRadiator ? 0 : Math.max(pcCase.fans - 1 - nFront, fanPack && fanPack.extra > 0 ? 2 : 0);
    for (let i = 0; i < requestedTopFans; i++) {
      const x = (i - (requestedTopFans - 1) / 2) * 1.25;
      slots.push({ x, y: H - 0.17, z: 0, rotX: -Math.PI / 2, d: caseFanDiameter, owner: fanPack && fanPack.extra > 0 ? 'fans' : 'case', rgb: false });
    }
  }
  const fanObjs = [];
  const radiatorPorts = [];
  const radiatorFanSize = topRadiator && cooler.radiator % 140 === 0 ? 140 : 120;
  const radiatorFanCount = topRadiator ? Math.max(1, Math.round(cooler.radiator / radiatorFanSize)) : 0;
  if (radiatorFanCount) {
    const radiatorLength = cooler.radiator / 100;
    const radiatorY = H - 0.36;
    const radiator = box(body, radiatorLength, 0.18, 1.2, mats.aluminiumDark, 0, radiatorY, 0, { r: 0.025 });
    tag(radiator, 'cooler');
    box(body, radiatorLength * 0.88, 0.05, 0.95, mats.aluminium, 0, radiatorY - 0.1, 0, { cast: false });
    const finCount = Math.max(12, Math.round(cooler.radiator / 12));
    for (let i = 0; i < finCount; i++) {
      const x = -radiatorLength * 0.42 + i * (radiatorLength * 0.84) / Math.max(1, finCount - 1);
      box(body, 0.012, 0.1, 0.88, mats.aluminiumDark, x, radiatorY - 0.12, 0, { cast: false });
    }
    for (const z of [-0.3, 0.3]) {
      const port = new THREE.Vector3(radiatorLength / 2 - 0.04, radiatorY + FEET, z);
      cyl(body, 0.055, 0.055, 0.13, mats.plasticLight, port.x, radiatorY, z, 'x', 16);
      cyl(body, 0.032, 0.032, 0.14, mats.aluminiumDark, port.x + 0.06, radiatorY, z, 'x', 12);
      port.x += 0.12;
      radiatorPorts.push(port);
    }
    for (let i = 0; i < radiatorFanCount; i++) {
      const x = (i - (radiatorFanCount - 1) / 2) * radiatorFanSize / 100;
      const fan = createFan(radiatorFanSize / 100, { rgb: false, blades: 9 });
      fan.position.set(x, H - 0.17, 0);
      fan.rotation.x = -Math.PI / 2;
      tag(fan, 'cooler');
      body.add(fan);
      fanObjs.push(fan);
    }
  }
  for (const s of slots) {
    const fan = createFan(s.d, { rgb: s.rgb ?? false });
    fan.position.set(s.x, s.y, s.z ?? 0);
    if (s.rotY) fan.rotation.y = s.rotY;
    if (s.rotX) fan.rotation.x = s.rotX;
    tag(fan, s.owner);
    body.add(fan);
    fanObjs.push(fan);
  }

  const driveX = isC6Max
    ? L / 2 - 0.8
    : L / 2 - (showcase ? 2.4 : 1.8);
  return {
    group, body, dims: d, feet: FEET, boardTop: boardTop + FEET, boardX0: -L / 2 + 0.06,
    trayZ: -W / 2 + T, glassZ: W / 2, shroudTopY: base + FEET,     fanCount: slots.length + radiatorFanCount, rearFanY: rearFan.y + FEET,
    frontX: driveX, isShowcase: showcase,
    driveMount: { x: driveX, y: base + FEET, z: W / 2 - 0.25 },
    psuCableExit: psu ? new THREE.Vector3(
      psuX + psuLength / 2 - 0.12,
      base / 2 + FEET + 0.08,
      -W / 2 + T + 0.1
    ) : null,
    radiatorPorts
  };
}
