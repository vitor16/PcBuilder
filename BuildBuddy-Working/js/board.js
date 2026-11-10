import * as THREE from 'three';
import { labelTexture } from './textures.js';

const BW = 2.44; // board width (x), 244 mm
const BOARD_STANDOFF = 0.1;

/**
 * Builds the motherboard with everything that sits on it: CPU, cooler, RAM, M.2 drive.
 * Board-local axes: x toward the front, y up, z toward the viewer.
 */
export function buildBoard(kit, anchors, parts) {
  const { mats, box, cyl, tag, createFan, rounded } = kit;
  const { board, cpu, cooler, ram, storage } = parts;
  const BH = board.form === 'ATX' ? 3.05 : 2.44;
  const yT = BH / 2, xL = -BW / 2, xR = BW / 2;

  const root = new THREE.Group();
  root.position.set(anchors.boardX0 + BW / 2, anchors.boardTop - BH / 2, anchors.trayZ + BOARD_STANDOFF);

  const bg = new THREE.Group(); // motherboard-owned
  root.add(bg);

  // standoffs behind the board
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0], [0, 1]]) {
    cyl(root, 0.03, 0.03, BOARD_STANDOFF, mats.gold, sx * (BW / 2 - 0.12), sy * (BH / 2 - 0.12), -BOARD_STANDOFF / 2, 'z', 10);
  }

  // PCB
  const pcb = box(bg, BW, BH, 0.017, mats.pcb, 0, 0, 0);
  pcb.material = mats.pcb;

  /* ---- rear I/O ---- */
  box(bg, 0.42, 1.18, 0.2, mats.aluminiumDark, xL + 0.21, yT - 0.68, 0.11, { r: 0.012 });
  box(bg, 0.34, 0.2, 0.04, mats.glowSoft, xL + 0.22, yT - 0.3, 0.23, { cast: false });
  const ports = [
    [0.42, 0x2d5bff], [0.3, 0x2d5bff], [0.18, 0x111111], [0.06, 0x111111], [-0.06, 0x111111],
    [-0.18, 0x2d5bff], [-0.3, 0x2d5bff], [-0.42, 0x111111]
  ];
  ports.forEach(([dy, c], i) => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.2 });
    box(bg, 0.06, 0.1, 0.12, m, xL - 0.015, yT - 0.68 + dy * 1.2, 0.1, { cast: false });
  });
  box(bg, 0.07, 0.16, 0.14, mats.silver, xL - 0.015, yT - 1.2, 0.1, { cast: false });
  if (board.wifi) {
    for (const dy of [0, 0.12]) cyl(bg, 0.02, 0.02, 0.06, mats.gold, xL + 0.02, yT - 0.15 - dy * 0.1, 0.05, 'x', 10);
  }

  /* ---- VRM heatsinks ---- */
  const cx = -0.12, cy = yT - 1.0;
  const big = board.form === 'ATX' || board.m2 >= 3;
  const vrm = (w, h, x, y) => {
    const g = new THREE.Group();
    box(g, w, h, 0.17, mats.heatsink, 0, 0, 0.09, { r: 0.018 });
    const horiz = w > h;
    const fins = Math.floor((horiz ? w : h) / 0.07);
    for (let i = 0; i < fins; i++) {
      const off = -((horiz ? w : h) / 2) + 0.05 + i * 0.07;
      if (horiz) box(g, 0.02, h * 0.92, 0.04, mats.aluminiumDark, off, 0, 0.19, { cast: false });
      else box(g, w * 0.92, 0.02, 0.04, mats.aluminiumDark, 0, off, 0.19, { cast: false });
    }
    g.position.set(x, y, 0); bg.add(g);
  };
  vrm(0.34, big ? 1.12 : 0.9, xL + 0.62, cy - 0.02);
  vrm(big ? 1.2 : 0.95, 0.3, cx + 0.12, yT - 0.2);

  /* ---- chipset heatsink with printed name ---- */
  const chipY = -BH / 2 + (board.form === 'ATX' ? 0.75 : 0.62);
  const chipset = new THREE.Group();
  box(chipset, 0.52, 0.52, 0.12, mats.heatsink, 0, 0, 0.07, { r: 0.02 });
  const nameTex = labelTexture(board.name.split(' ')[0], board.socket + ' ' + board.ram, '#35e0ff', 256, 128);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.5 }));
  plate.position.z = 0.135; chipset.add(plate);
  chipset.position.set(0.55, chipY, 0); bg.add(chipset);

  /* ---- PCIe slots ---- */
  const y16 = yT - 1.45;
  const slotYs = board.form === 'ATX' ? [[y16, 0.9], [y16 - 0.4, 0.25], [y16 - 0.62, 0.9], [y16 - 1.0, 0.25], [y16 - 1.22, 0.9]] : [[y16, 0.9], [y16 - 0.5, 0.25], [y16 - 0.72, 0.9]];
  slotYs.forEach(([sy, len]) => {
    box(bg, len, 0.09, 0.1, mats.plasticLight, xL + 0.3 + len / 2, sy, 0.06, { r: 0.012 });
    box(bg, len - 0.1, 0.02, 0.105, mats.gold, xL + 0.3 + len / 2, sy, 0.065, { cast: false });
  });

  /* ---- M.2 slots (first slot carries the selected SSD) ---- */
  const m2y = yT - 1.28, m2x = cx + 0.05;
  const ssd = new THREE.Group();
  if (storage.gen4) {
    box(ssd, 0.84, 0.25, 0.1, mats.heatsink, 0, 0, 0.09, { r: 0.015 });
    for (let i = 0; i < 9; i++) box(ssd, 0.02, 0.22, 0.03, mats.aluminiumDark, -0.36 + i * 0.09, 0, 0.16, { cast: false });
  } else {
    box(ssd, 0.8, 0.22, 0.012, new THREE.MeshStandardMaterial({ color: 0x143018, roughness: 0.55 }), 0, 0, 0.03);
    for (let i = 0; i < 4; i++) box(ssd, 0.11, 0.1, 0.012, mats.plastic, -0.28 + i * 0.16, 0, 0.044, { cast: false });
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshStandardMaterial({ map: labelTexture('NVMe', `${storage.capacity >= 1000 ? storage.capacity / 1000 + ' TB' : storage.capacity + ' GB'}`, '#8b9cff', 256, 128), roughness: 0.5 }));
    lab.position.set(0.15, 0, 0.052); ssd.add(lab);
  }
  ssd.position.set(m2x, m2y, 0.01);
  tag(ssd, 'storage'); root.add(ssd);
  // slot screws and covers for extra M.2 positions
  if (board.m2 >= 2) box(bg, 0.8, 0.2, 0.05, mats.aluminiumDark, m2x, -0.95, 0.05, { r: 0.012 });

  /* ---- power connectors and small parts ---- */
  box(bg, 0.1, 0.62, 0.17, mats.plasticLight, xR - 0.07, 0.15, 0.1, { r: 0.01 });   // 24-pin
  box(bg, 0.42, 0.1, 0.15, mats.plasticLight, xL + 0.75, yT - 0.07, 0.09, { r: 0.01 }); // 8-pin CPU
  cyl(bg, 0.07, 0.07, 0.016, mats.silver, 0.25, -BH / 2 + 0.3, 0.02, 'z', 20); // battery
  for (let i = 0; i < 8; i++) {
    cyl(bg, 0.03, 0.03, 0.09, mats.plastic, xL + 0.42 + (i % 2) * 0.09, yT - 0.35 - i * 0.12, 0.05, 'z', 10);
    cyl(bg, 0.018, 0.018, 0.012, mats.silver, xL + 0.42 + (i % 2) * 0.09, yT - 0.35 - i * 0.12, 0.1, 'z', 10);
  }
  for (let i = 0; i < 6; i++) box(bg, 0.07, 0.05, 0.05, mats.plasticLight, xR - 0.6 + i * 0.09, -BH / 2 + 0.07, 0.03, { cast: false }); // headers
  for (let i = 0; i < 8; i++) {
    const x = xR - 0.34 + (i % 2) * 0.12;
    const y = cy - 0.55 + Math.floor(i / 2) * 0.16;
    cyl(bg, 0.042, 0.042, 0.045, mats.aluminiumDark, x, y, 0.125, 'z', 12);
    cyl(bg, 0.025, 0.025, 0.012, mats.silver, x, y, 0.153, 'z', 12);
  }
  for (let i = 0; i < 5; i++) {
    box(bg, 0.26, 0.012, 0.008, mats.aluminiumDark, xR - 0.45 - i * 0.04, -BH / 2 + 0.24 + i * 0.07, 0.018, { cast: false });
  }
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0.0]]) {
    cyl(bg, 0.028, 0.028, 0.012, mats.screw, sx * (BW / 2 - 0.12), sy * (BH / 2 - 0.12), 0.02, 'z', 12);
  }
  tag(bg, 'motherboard');

  /* ---- CPU in the socket ---- */
  const cpuG = new THREE.Group();
  box(cpuG, 0.56, 0.56, 0.05, mats.plasticLight, 0, 0, 0.03);
  box(cpuG, 0.4, 0.4, 0.04, mats.silver, 0, 0, 0.075, { r: 0.015 });
  box(cpuG, 0.27, 0.27, 0.012, mats.aluminium, 0, 0, 0.1, { r: 0.01 });
  cpuG.position.set(cx, cy, 0.0);
  tag(cpuG, 'cpu'); root.add(cpuG);

  /* ---- RAM ---- */
  const ramG = new THREE.Group();
  const slotX0 = 0.34, pitch = 0.1, ramH = 1.3;
  const filled = board.slots === 2 ? [0, 1] : ram.sticks === 4 ? [0, 1, 2, 3] : [1, 3];
  const stickIdx = ram.sticks === 4 || board.slots === 2 ? filled : [1, 3];
  for (let i = 0; i < board.slots; i++) {
    const sx = slotX0 + i * pitch;
    box(ramG, 0.085, ramH + 0.04, 0.09, mats.plastic, sx, cy - 0.05, 0.055);
    box(ramG, 0.05, 0.04, 0.1, mats.silver, sx, cy - 0.05 + ramH / 2 + 0.01, 0.06, { cast: false });
  }
  const used = Math.min(ram.sticks, board.slots);
  const usedIdx = used === board.slots ? [...Array(board.slots).keys()] : stickIdx.slice(0, used);
  for (const i of usedIdx) {
    const sx = slotX0 + i * pitch;
    const stick = new THREE.Group();
    box(stick, 0.08, ramH - 0.02, 0.28, mats.heatsink, 0, 0, 0.14 + 0.1, { r: 0.012 });
    box(stick, 0.07, ramH - 0.18, 0.045, mats.glow, 0, 0.0, 0.14 + 0.1 + 0.15, { cast: false });
    box(stick, 0.084, ramH - 0.02, 0.012, mats.aluminiumDark, 0, 0, 0.14 + 0.1 + 0.13, { cast: false });
    stick.position.set(sx, cy - 0.05, 0.0);
    ramG.add(stick);
  }
  tag(ramG, 'ram'); root.add(ramG);

  /* ---- CPU cooler ---- */
  const coolG = new THREE.Group();
  coolG.position.set(cx, cy, 0.1);
  const aio = cooler.kind === 'aio';

  if (cooler.kind === 'stock') {
    // aluminium fin drum with a spinning fan on top
    cyl(coolG, 0.4, 0.34, 0.34, mats.aluminium, 0, 0, 0.2, 'z', 36);
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      box(coolG, 0.14, 0.012, 0.3, mats.aluminiumDark, Math.cos(a) * 0.37, Math.sin(a) * 0.37, 0.22, { cast: false }).rotation.z = a;
    }
    cyl(coolG, 0.45, 0.45, 0.025, mats.plasticLight, 0, 0, 0.4, 'z', 36);
    const f = createFan(0.78, { rgb: false });
    f.position.set(0, 0, 0.52); coolG.add(f);
  } else if (cooler.kind === 'tower' || cooler.kind === 'dual') {
    const dual = cooler.kind === 'dual';
    const top = Math.min(cooler.height / 100, 1.7);
    const bottom = 0.38;
    const stacks = dual ? [-0.32, 0.36] : [-0.03];
    const sw = dual ? 0.34 : 0.5;
    // base plate and copper heat pipes
    box(coolG, 0.5, 0.5, 0.06, mats.copper, 0, 0, 0.05);
    for (let i = 0; i < (dual ? 6 : 4); i++) {
      const py = -0.3 + (i / ((dual ? 6 : 4) - 1)) * 0.6;
      cyl(coolG, 0.026, 0.026, top - 0.05, mats.copper, stacks[0] + (dual ? (i % 2 ? 0.0 : 0.0) : 0), py, (top + 0.05) / 2, 'z', 10);
    }
    stacks.forEach((sx) => {
      const fins = 30;
      const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(sw, 1.05, 0.012), mats.aluminium, fins);
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < fins; i++) {
        m4.makeTranslation(sx, 0, bottom + (i / (fins - 1)) * (top - bottom));
        inst.setMatrixAt(i, m4);
      }
      inst.castShadow = true; inst.receiveShadow = true;
      coolG.add(inst);
      box(coolG, sw + 0.02, 1.08, 0.035, mats.aluminiumDark, sx, 0, top + 0.015, { r: 0.012 }); // top cap
      box(coolG, sw - 0.1, 0.2, 0.012, mats.glowSoft, sx, 0, top + 0.04, { cast: false });
      box(coolG, 0.05, 1.05, top - bottom, mats.aluminiumDark, sx - sw / 2 - 0.01, 0, (top + bottom) / 2, { cast: false });
    });
    const fanZ = (top + bottom) / 2;
    const f1 = createFan(1.2, { rgb: false });
    f1.rotation.y = Math.PI / 2;
    f1.position.set(stacks[stacks.length - 1] + sw / 2 + 0.14, 0, fanZ); coolG.add(f1);
    if (dual) {
      const f2 = createFan(1.2, { rgb: false });
      f2.rotation.y = Math.PI / 2;
      f2.position.set((stacks[0] + stacks[1]) / 2, 0, fanZ); coolG.add(f2);
    }
  } else if (aio) {
    const blk = new THREE.Group();
    cyl(blk, 0.34, 0.36, 0.3, mats.heatsink, 0, 0, 0.18, 'z', 40);
    cyl(blk, 0.3, 0.3, 0.02, mats.glass, 0, 0, 0.345, 'z', 40);
    cyl(blk, 0.27, 0.27, 0.012, mats.plastic, 0, 0, 0.335, 'z', 40);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 8, 48), mats.glowRing);
    ring.position.z = 0.35; blk.add(ring);
    cyl(blk, 0.1, 0.1, 0.012, mats.glow, 0, 0, 0.352, 'z', 24);
    box(blk, 0.58, 0.58, 0.06, mats.copper, 0, 0, 0.03, { cast: false });
    coolG.add(blk);
  }
  tag(coolG, 'cooler'); root.add(coolG);

  const world = (x, y, z) => new THREE.Vector3(x, y, z).add(root.position);
  return {
    group: root, BH, BW, parts: { bg, cpuG, ramG, coolG, ssd },
    cpuWorld: world(cx, cy, 0.1),
    slot16: world(xL + 0.3, y16, 0.12),
    yTopWorld: anchors.boardTop,
    cx, cy, xR, xL, yT,
    plugCpu: world(xL + 0.75, yT - 0.07, 0.17),
    plug24: world(xR - 0.07, 0.15, 0.19)
  };
}
