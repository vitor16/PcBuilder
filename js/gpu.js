import * as THREE from 'three';
import { labelTexture } from './textures.js';

/**
 * Graphics card, modelled at real-world proportions (1 unit = 10 cm).
 * Local axes: x = length (rear bracket at x = 0, front at x = len), y = height (backplate faces up),
 * z = depth across the board (the glass side is +z, where the edge connector and logo face the viewer).
 *
 * Visible from the default angled view: the backplate (top), the power connector and logo panel (glass side).
 * Hidden under the shroud: the fans, heatsink fins and PCB, all modelled so the card reads correctly from any angle.
 */
export function buildGpu(kit, gpu, board) {
  if (!gpu || gpu.id === 'none') return null;
  const { mats, box, cyl, tag, createFan } = kit;

  const len = gpu.length / 100;                       // card length
  const triple = gpu.kind === 'triple';
  const fanCount = triple ? 3 : 2;
  const T = triple ? 0.6 : 0.46;                      // shroud height (3-slot vs 2-slot cards)
  const D = triple ? 1.34 : 1.16;                     // depth across the board
  const fanDia = triple ? 0.96 : 0.9;
  const shroudTop = -0.035;                           // underside of the backplate/PCB
  const shroudBottom = -T + 0.035;

  const accentHex = gpu.color || 0x35e0ff;
  const accentMat = new THREE.MeshStandardMaterial({ color: accentHex, metalness: 0.35, roughness: 0.3, emissive: accentHex, emissiveIntensity: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.55, metalness: 0.25 });
  const brushedMat = mats.aluminiumDark;
  const shroudMat = mats.plasticLight;
  const shroudDarkMat = new THREE.MeshStandardMaterial({ color: 0x101419, roughness: 0.5, metalness: 0.2 });
  const goldMat = mats.gold;

  const g = new THREE.Group();

  /* ---------- Backplate (faces up, visible from above) ---------- */
  // carbon base plate
  box(g, len, 0.03, D, mats.carbon, len / 2, 0.015, D / 2, { r: 0.01 });
  // brushed aluminium insert with an inset rim
  box(g, len * 0.7, 0.016, D * 0.56, brushedMat, len * 0.45, 0.038, D * 0.52, { r: 0.03, cast: false });
  box(g, len * 0.7 + 0.06, 0.006, D * 0.6 + 0.06, shroudDarkMat, len * 0.45, 0.03, D * 0.52, { cast: false });
  // six long vent slots through the insert
  for (let i = 0; i < 6; i++) {
    const x = 0.55 + i * ((len * 0.7 - 0.9) / 5);
    box(g, 0.42, 0.01, 0.07, darkMat, x, 0.049, D * 0.3, { cast: false, r: 0.02 });
    box(g, 0.42, 0.01, 0.07, darkMat, x, 0.049, D * 0.74, { cast: false, r: 0.02 });
  }
  // accent light strips running the length of the card
  box(g, len * 0.88, 0.012, 0.035, accentMat, len * 0.5, 0.05, D * 0.12, { cast: false });
  box(g, len * 0.88, 0.012, 0.035, accentMat, len * 0.5, 0.05, D * 0.88, { cast: false });
  // glowing logo bar at the front of the insert
  box(g, len * 0.26, 0.012, 0.09, mats.glow, len * 0.8, 0.052, D * 0.5, { cast: false, r: 0.02 });
  // screw heads around the perimeter of the backplate
  for (const x of [0.16, len * 0.45, len - 0.22]) {
    for (const z of [0.1, D - 0.1]) cyl(g, 0.034, 0.034, 0.018, mats.silver, x, 0.04, z, 'y', 14);
  }
  // raised model plaque on the backplate
  const badgeTitle = gpu.name.replace(/^(NVIDIA GeForce|AMD Radeon|Intel Arc)\s*/i, '');
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(len * 0.34, 1.1), 0.22), new THREE.MeshStandardMaterial({
    map: labelTexture(badgeTitle, `${gpu.vram} GB ${gpu.mem} · ${gpu.vendor || ''}`, `#${Number(accentHex).toString(16).padStart(6, '0')}`, 512, 160),
    roughness: 0.45,
    emissive: accentHex,
    emissiveIntensity: 0.06
  }));
  plaque.rotation.x = -Math.PI / 2;
  plaque.position.set(len * 0.2, 0.052, D * 0.5);
  g.add(plaque);

  /* ---------- Printed circuit board and components (under the shroud) ---------- */
  box(g, len - 0.3, 0.016, D - 0.1, mats.pcbGpu, len / 2 - 0.1, -0.03, D / 2);
  // GPU die with a heat-spreader, surrounded by memory packages
  box(g, 0.9, 0.02, 0.9, goldMat, len * 0.5, -0.05, D * 0.5, { cast: false });
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const rx = 0.82, rz = 0.66;
    box(g, 0.2, 0.024, 0.14, darkMat, len * 0.5 + Math.cos(ang) * rx, -0.055, D * 0.5 + Math.sin(ang) * rz, { cast: false });
  }
  // power-stage capacitors near the rear of the PCB
  for (let i = 0; i < 4; i++) cyl(g, 0.045, 0.045, 0.1, mats.silver, 0.5 + i * 0.12, -0.11, D * 0.22, 'y', 14);

  /* ---------- Shroud ---------- */
  // main shell, with a slightly sculpted, narrower front section
  box(g, len - 0.1, T - 0.07, D - 0.06, shroudMat, len / 2 - 0.02, -T / 2, D / 2, { r: 0.04 });
  box(g, 0.34, T - 0.12, D - 0.14, shroudDarkMat, len - 0.2, -T / 2, D / 2, { r: 0.03 });
  // raised panel lines on the shroud underside
  for (let i = 0; i < 4; i++) box(g, len * 0.6, 0.012, 0.02, mats.steelLight, len * 0.42, shroudBottom - 0.006, D * (0.18 + i * 0.22), { cast: false });

  /* ---------- Glass-side edge (faces the viewer) ---------- */
  // steel edge frame
  box(g, len - 0.14, T - 0.1, 0.03, mats.steelLight, len / 2, -T / 2 - 0.01, D, { r: 0.012 });
  // horizontal louvres along the edge
  const slitCount = Math.max(6, Math.floor((len - 1.1) / 0.1));
  for (let i = 0; i < slitCount; i++) {
    box(g, 0.035, T * 0.5, 0.012, mats.rubber, 0.6 + i * 0.1, -T / 2, D + 0.018, { cast: false });
  }
  // accent trim on the top and bottom of the edge
  box(g, len - 0.2, 0.012, 0.016, accentMat, len / 2, -0.03, D + 0.01, { cast: false });
  box(g, len - 0.2, 0.012, 0.016, accentMat, len / 2, -T + 0.04, D + 0.01, { cast: false });
  // glowing logo strip
  box(g, len * 0.42, 0.034, 0.012, mats.glow, len * 0.6, -T / 2 + 0.02, D + 0.01, { cast: false, r: 0.012 });
  // model badge on the edge
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(len * 0.36, 0.95), 0.15), new THREE.MeshStandardMaterial({
    map: labelTexture(badgeTitle, `${gpu.vram} GB ${gpu.mem}`, `#${Number(accentHex).toString(16).padStart(6, '0')}`, 512, 96),
    roughness: 0.5,
    emissive: accentHex,
    emissiveIntensity: 0.08
  }));
  badge.position.set(len * 0.24, -T * 0.78, D + 0.028);
  g.add(badge);

  /* ---------- Fans (underside) with recessed rings ---------- */
  for (let i = 0; i < fanCount; i++) {
    const fx = (len - 0.4) * ((i + 0.5) / fanCount) + 0.2;
    // dark recess ring that sits in the shroud
    cyl(g, fanDia * 0.5 + 0.03, fanDia * 0.5 + 0.03, 0.02, darkMat, fx, shroudBottom + 0.005, D / 2, 'y', 48);
    const f = createFan(fanDia, { rgb: false, blades: 11 });
    f.position.set(fx, shroudBottom - 0.04, D / 2);
    f.rotation.x = Math.PI / 2; // face downward
    g.add(f);
  }

  /* ---------- Heatsink fins (inside the shroud, behind the fans) ---------- */
  const finCount = 14;
  for (let i = 0; i < finCount; i++) {
    box(g, 0.02, T - 0.16, D - 0.2, mats.aluminium, 1.0 + i * 0.07, -T / 2 - 0.01, D / 2, { cast: false });
  }

  /* ---------- Edge connector tab (PCIe gold fingers) ---------- */
  box(g, 0.9, 0.03, 0.14, goldMat, 0.5, -0.03, 0.04, { cast: false });
  for (let i = 0; i < 14; i++) box(g, 0.045, 0.02, 0.1, goldMat, 0.2 + i * 0.05, -0.03, 0.04, { cast: false });

  /* ---------- Rear I/O bracket with real port openings ---------- */
  box(g, 0.025, T + 0.16, 1.22, mats.silver, -0.012, -T / 2 + 0.02, 0.61, { cast: false });
  // three DisplayPort and one HDMI opening
  const ports = [
    { w: 0.2, h: 0.1, z: 0.22 }, { w: 0.2, h: 0.1, z: 0.46 }, { w: 0.2, h: 0.1, z: 0.7 }, { w: 0.2, h: 0.07, z: 0.96 }
  ];
  for (const p of ports) {
    box(g, 0.05, p.h, p.w, darkMat, -0.02, -T * 0.42, p.z, { cast: false });
    box(g, 0.02, p.h * 0.5, p.w * 0.6, mats.plasticLight, -0.035, -T * 0.42, p.z, { cast: false });
  }
  // vent holes in the bracket
  for (let i = 0; i < 4; i++) box(g, 0.03, 0.04, 0.05, darkMat, -0.02, -T * 0.82, 0.3 + i * 0.2, { cast: false });

  /* ---------- Power connector on the glass side ---------- */
  const plugX = len - 0.55;
  const plugY = -0.12;
  const hpwr = /12V|12VHPWR|2x6/i.test(gpu.powerConnector || '') || (!gpu.powerConnector && gpu.watts >= 300);
  const plugCount = hpwr ? 1 : (gpu.watts >= 150 ? 2 : 1);
  for (let c = 0; c < plugCount; c++) {
    const x = plugX - c * 0.42;
    const w = hpwr ? 0.42 : 0.34;
    // housing
    box(g, w, 0.2, 0.14, mats.plasticLight, x, plugY, D + 0.05, { r: 0.012 });
    // pins: 2 rows of contacts
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < (hpwr ? 6 : 4); i++) {
        box(g, 0.028, 0.028, 0.012, goldMat, x - w / 2 + 0.05 + i * (w - 0.1) / (hpwr ? 5 : 3), plugY + 0.05 - row * 0.1, D + 0.13, { cast: false });
      }
    }
    // latch
    box(g, w * 0.7, 0.025, 0.018, mats.aluminiumDark, x, plugY + 0.11, D + 0.05, { cast: false });
  }
  // status LED
  box(g, 0.1, 0.02, 0.02, mats.glowSoft, plugX + 0.3, plugY, D + 0.02, { cast: false });

  tag(g, 'gpu');
  g.userData.plugCount = plugCount;
  g.userData.watts = gpu.watts;

  // Align the card's edge connector with the centre of the board's first x16 slot.
  g.position.set(board.slot16.x - 0.5, board.slot16.y + 0.03, board.slot16.z - 0.04);
  g.userData.plug = new THREE.Vector3(plugX, plugY, D + 0.14).add(g.position);
  g.userData.end = len;
  return g;
}

/** PSU cables as sleeved tubes from the case cut-outs to each plug. */
export function buildCables(kit, anchors, board, gpuGroup, cpu, cooler, storage) {
  const { mats, tag } = kit;
  const { dims, trayZ } = anchors;
  const group = new THREE.Group();
  const y0 = 0; // everything is in case-body coordinates
  const Lh = dims.L / 2, base = dims.base, H = dims.H;
  const tz = trayZ + 0.02;
  const sleeve = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.8, metalness: 0 });

  const tube = (pts, r = 0.055) => {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), sleeve);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  const bundle = (pts, count = 3, spacing = 0.035, r = 0.018) => {
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spacing;
      tube(pts.map((p) => p.clone().add(v(0, 0, offset))), r);
    }
  };
  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  // 24-pin motherboard power, shown as a multi-conductor sleeved bundle.
  const p24 = board.plug24.clone(); p24.y += y0;
  bundle([
    v(p24.x, p24.y, p24.z + 0.1),
    v(p24.x + 0.22, p24.y - 0.12, p24.z + 0.14),
    v(Lh - 1.0, base + 0.5, tz + 0.25),
    v(Lh - 1.15, base + 0.55, tz)
  ], 5, 0.028, 0.022);

  // CPU EPS 8-pin cable, split into separate visible conductors.
  const pc = board.plugCpu.clone(); pc.y += y0;
  bundle([
    v(pc.x, pc.y, pc.z),
    v(pc.x - 0.25, pc.y + 0.12, pc.z + 0.06),
    v(-Lh + 1.2, anchors.boardTop - 0.05, tz + 0.2),
    v(-Lh + 0.9, anchors.boardTop, tz)
  ], 4, 0.032, 0.024);

  // GPU power cable: 8-pin doubles or 12V-2x6 single connector.
  if (gpuGroup) {
    const p = gpuGroup.userData.plug.clone(); p.y += y0;
    const gpuCableCount = gpuGroup.userData.plugCount || 1;
    for (let i = 0; i < gpuCableCount; i++) {
      bundle([
        v(p.x - i * 0.12, p.y, p.z),
        v(p.x + 0.16 - i * 0.12, p.y - 0.16, p.z + 0.08),
        v(Lh - 0.8 - i * 0.08, base + 0.8, tz + 0.5),
        v(Lh - 1.15 - i * 0.08, base + 1.75, tz)
      ], 3, 0.032, 0.024);
    }
  }

  // Cooler PWM lead and optional pump/ARGB lead.
  tube([
    v(board.cpuWorld.x, board.cpuWorld.y, board.cpuWorld.z + 0.42),
    v(board.cpuWorld.x - 0.45, board.cpuWorld.y - 0.2, board.cpuWorld.z + 0.5),
    v(-Lh + 0.75, anchors.boardTop - 0.8, tz + 0.12)
  ], 0.018);
  tube([
    v(board.cpuWorld.x + 0.08, board.cpuWorld.y, board.cpuWorld.z + 0.44),
    v(board.cpuWorld.x - 0.38, board.cpuWorld.y + 0.05, board.cpuWorld.z + 0.55),
    v(-Lh + 0.55, anchors.boardTop - 1.05, tz + 0.12)
  ], 0.018);

  // Front-panel USB-A/USB-C, audio and power-switch harness.
  bundle([
    v(Lh - 0.45, H - 0.08, tz),
    v(Lh - 0.65, H - 0.12, tz + 0.18),
    v(Lh - 0.95, anchors.boardTop - 0.75, tz + 0.22),
    v(board.xR - 0.4, anchors.boardTop - 1.25, tz)
  ], 3, 0.025, 0.014);

  // SATA power/data leads for a visible 2.5-inch or 3.5-inch drive.
  const formFactor = storage?.formFactor || '';
  if (formFactor && formFactor !== 'M.2 2280') {
    bundle([
      v(Lh - 1.3, base + 1.1, tz),
      v(Lh - 1.05, base + 0.9, tz + 0.1),
      v(board.xR - 0.55, base + 1.1, tz + 0.18)
    ], 3, 0.028, 0.018);
  }

  // Three visible fan PWM leads daisy-chained back to the board/fan hub.
  for (let i = 0; i < 3; i++) {
    tube([
      v(Lh - 0.25 - i * 0.08, base + 0.95 + i * 0.55, dims.W / 2 - 0.1),
      v(Lh - 0.55 - i * 0.06, base + 0.75 + i * 0.45, tz + 0.18),
      v(board.xR - 0.15, base + 0.6 + i * 0.18, tz)
    ], 0.014);
  }
  tag(group, 'psu');
  return group;
}
