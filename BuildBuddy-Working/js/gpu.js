import * as THREE from 'three';

/**
 * Graphics card. The PCB lies flat, perpendicular to the motherboard.
 * Local axes: x = length (rear to front), y = thickness (fans point down), z = depth from the board.
 * What you see through the glass is the long top edge with the logo strip and power plug.
 */
export function buildGpu(kit, gpu, anchors, board) {
  if (!gpu || gpu.id === 'none') return null;
  const { mats, box, cyl, tag, createFan, screw } = kit;

  const len = gpu.length / 100;
  const triple = gpu.kind === 'triple';
  const T = triple ? 0.56 : 0.41;
  const D = triple ? 1.32 : 1.14;
  const nFans = triple ? 3 : 2;
  const accent = new THREE.MeshStandardMaterial({ color: gpu.color || 0x35e0ff, metalness: 0.3, roughness: 0.4, emissive: gpu.color || 0x35e0ff, emissiveIntensity: 0.15 });

  const g = new THREE.Group();

  // backplate (faces up in the case)
  box(g, len, 0.022, D, mats.carbon, len / 2, 0.01, D / 2, { r: 0.008 });
  box(g, len * 0.66, 0.014, D * 0.52, mats.aluminiumDark, len * 0.52, 0.03, D * 0.52, { r: 0.025, cast: false });
  box(g, len * 0.48, 0.008, 0.025, accent, len * 0.46, 0.041, D * 0.52, { cast: false });
  box(g, len * 0.18, 0.008, D * 0.36, mats.aluminium, len * 0.82, 0.041, D * 0.52, { cast: false });
  for (const x of [0.12, len - 0.12]) {
    for (const z of [0.14, D - 0.14]) cyl(g, 0.028, 0.028, 0.018, mats.silver, x, 0.043, z, 'y', 12);
  }
  // PCB between
  box(g, len - 0.3, 0.016, D - 0.1, mats.pcbGpu, len / 2 - 0.1, -0.03, D / 2);
  // main shroud
  box(g, len - 0.05, T - 0.07, D - 0.05, mats.plasticLight, len / 2 + 0.025, -T / 2 - 0.0, D / 2 + 0.0, { r: 0.035 });
  // outer edge strip you actually see through the glass
  box(g, len - 0.12, T - 0.1, 0.03, mats.steelLight, len / 2, -T / 2 - 0.01, D, { r: 0.012 });
  // vent slits on the edge
  for (let i = 0; i < Math.floor((len - 0.9) / 0.1); i++) {
    box(g, 0.035, T * 0.55, 0.012, mats.rubber, 0.55 + i * 0.1, -T / 2, D + 0.018, { cast: false });
  }
  // glowing logo strip and accent trim
  box(g, len * 0.38, 0.032, 0.012, mats.glow, len * 0.62, -0.035, D + 0.01, { cast: false });
  box(g, len - 0.15, 0.012, 0.016, accent, len / 2, -T + 0.03, D + 0.01, { cast: false });
  box(g, len * 0.2, 0.018, 0.012, accent, len * 0.28, 0.0, D + 0.012, { cast: false });
  // fans on the underside
  const fd = triple ? 0.96 : 0.9;
  for (let i = 0; i < nFans; i++) {
    const f = createFan(fd, { rgb: false, blades: 11 });
    const fx = (len - 0.3) * ((i + 0.5) / nFans) + 0.15;
    f.position.set(fx, -T + 0.06, D / 2 + 0.02);
    f.rotation.x = Math.PI / 2; // face downward
    g.add(f);
  }
  // heatsink fins visible at the front end
  for (let i = 0; i < 10; i++) box(g, 0.02, T - 0.13, D - 0.15, mats.aluminium, len - 0.18 + i * 0.012 - 0.12, -T / 2 - 0.01, D / 2, { cast: false });
  // PCIe edge connector tab
  box(g, 0.9, 0.03, 0.14, mats.gold, 0.5, -0.03, 0.04, { cast: false });
  // rear I/O bracket with ports
  box(g, 0.025, T + 0.16, 1.2, mats.silver, -0.012, -T / 2 + 0.02, 0.6, { cast: false });
  for (let i = 0; i < 3; i++) box(g, 0.04, 0.07, 0.2, mats.rubber, 0.0, -T * 0.35, 0.28 + i * 0.28, { cast: false });
  box(g, 0.04, 0.07, 0.2, mats.rubber, 0.0, -T * 0.65, 0.4, { cast: false });
  // power plug near the front edge
  const plugX = len - 0.55;
  box(g, 0.34, 0.17, 0.12, mats.plasticLight, plugX, -0.1, D - 0.04, { r: 0.012 });
  box(g, 0.29, 0.025, 0.018, mats.aluminiumDark, plugX, -0.005, D + 0.035, { cast: false });
  for (let i = 0; i < 6; i++) box(g, 0.035, 0.05, 0.012, mats.gold, plugX - 0.12 + i * 0.048, -0.1, D + 0.025, { cast: false });
  tag(g, 'gpu');

  // placement: top of the first x16 slot
  g.position.set(anchors.boardX0 + 0.04, board.slot16.y + 0.07, board.group.position.z + 0.01);
  g.userData.plug = new THREE.Vector3(plugX, -0.1, D + 0.02).add(g.position);
  g.userData.end = len;
  return g;
}

/** PSU cables as sleeved tubes from the case cut-outs to each plug. */
export function buildCables(kit, anchors, board, gpuGroup, cpu) {
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
  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  // 24-pin: front edge of the board to the lower cut-out
  const p24 = board.plug24.clone(); p24.y += y0;
  tube([v(p24.x, p24.y, p24.z + 0.1), v(p24.x + 0.2, p24.y - 0.1, p24.z + 0.1), v(Lh - 1.0, base + 0.5, tz + 0.25), v(Lh - 1.15, base + 0.55, tz)], 0.12);
  // 8-pin CPU power: top rear cut-out
  const pc = board.plugCpu.clone(); pc.y += y0;
  tube([v(pc.x, pc.y, pc.z), v(pc.x - 0.25, pc.y + 0.1, pc.z + 0.05), v(-Lh + 1.2, anchors.boardTop - 0.05, tz + 0.2), v(-Lh + 0.9, anchors.boardTop - 0.0, tz)], 0.07);
  // GPU power
  if (gpuGroup) {
    const p = gpuGroup.userData.plug.clone(); p.y += y0;
    tube([v(p.x, p.y, p.z), v(p.x + 0.2, p.y - 0.15, p.z + 0.05), v(Lh - 0.8, base + 0.8, tz + 0.5), v(Lh - 1.15, base + 1.75, tz)], 0.07);
  }
  tag(group, 'psu');
  return group;
}
