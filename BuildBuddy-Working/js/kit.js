import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as TX from './textures.js';

/**
 * One shared set of materials and helpers. Units: 1 = 10 cm.
 * Glow materials are registered so lighting can change them all at once.
 */
export function createKit() {
  const brushed = TX.brushedBump();
  const grain = TX.grainBump();
  const carbon = TX.carbonWeave();
  const perf = TX.perforationAlpha();

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const mats = {
    steel: std({ color: 0x26303a, metalness: 0.62, roughness: 0.48, bumpMap: grain, bumpScale: 0.6 }),
    steelLight: std({ color: 0x3e4852, metalness: 0.62, roughness: 0.44, bumpMap: grain, bumpScale: 0.5 }),
    steelWhite: std({ color: 0xc3cdd5, metalness: 0.35, roughness: 0.48, bumpMap: grain, bumpScale: 0.35 }),
    steelWhiteLight: std({ color: 0xe4e9ed, metalness: 0.3, roughness: 0.42, bumpMap: grain, bumpScale: 0.25 }),
    trayInner: std({ color: 0x0c0f13, metalness: 0.6, roughness: 0.6, bumpMap: grain, bumpScale: 0.5 }),
    aluminium: std({ color: 0x9aa4ad, metalness: 1, roughness: 0.32, bumpMap: brushed, bumpScale: 0.8 }),
    aluminiumDark: std({ color: 0x4a535c, metalness: 0.82, roughness: 0.4, bumpMap: brushed, bumpScale: 0.8 }),
    heatsink: std({ color: 0x303840, metalness: 0.78, roughness: 0.4, bumpMap: brushed, bumpScale: 0.7 }),
    copper: std({ color: 0xb87333, metalness: 1, roughness: 0.28 }),
    plastic: std({ color: 0x0b0d10, metalness: 0.1, roughness: 0.55 }),
    plasticLight: std({ color: 0x1b2026, metalness: 0.15, roughness: 0.5 }),
    rubber: std({ color: 0x08090b, metalness: 0, roughness: 0.9 }),
    gold: std({ color: 0xd4af37, metalness: 1, roughness: 0.25 }),
    silver: std({ color: 0xc9d1d8, metalness: 1, roughness: 0.2 }),
    carbon: std({ color: 0xffffff, map: carbon, metalness: 0.4, roughness: 0.45 }),
    cable: std({ color: 0x0a0b0d, metalness: 0, roughness: 0.75 }),
    pcb: std({ color: 0xffffff, map: TX.pcbTexture(), roughness: 0.55, metalness: 0.25 }),
    pcbGpu: std({ color: 0xffffff, map: TX.pcbTexture({ base: '#0d1a14', trace: '#1c3a2e', seed: 11 }), roughness: 0.55, metalness: 0.25 }),
    vent: std({ color: 0x090b0e, metalness: 0.7, roughness: 0.5, alphaMap: perf, alphaTest: 0.5, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc4e5f1, transparent: true, opacity: 0.1, roughness: 0.1, metalness: 0.02,
      clearcoat: 0.95, clearcoatRoughness: 0.06, envMapIntensity: 0.65,
      side: THREE.FrontSide, depthWrite: false
    }),
    fanFrame: std({ color: 0x0f1317, metalness: 0.3, roughness: 0.5 }),
    fanBlade: std({ color: 0x1a2027, metalness: 0.2, roughness: 0.45, side: THREE.DoubleSide }),
    screw: std({ color: 0x8c949b, metalness: 1, roughness: 0.3 })
  };

  // glowing materials respond to the lighting choice
  const glowMats = [];
  const glow = (intensity = 2.2) => {
    const m = std({ color: 0x111111, emissive: 0xffffff, emissiveIntensity: intensity, metalness: 0, roughness: 0.4 });
    m.userData.baseIntensity = intensity;
    glowMats.push(m);
    return m;
  };
  mats.glow = glow(2.4);
  mats.glowSoft = glow(1.3);
  mats.glowRing = glow(2.0);
  const sharedMaterials = new Set(Object.values(mats));
  const sharedTextures = new Set();
  for (const material of sharedMaterials) {
    for (const value of Object.values(material)) {
      if (value?.isTexture) sharedTextures.add(value);
    }
  }

  const lights = []; // point lights tinted by lighting
  const state = { mode: 'cyan', color: new THREE.Color(0x35e0ff), on: true };
  const tmp = new THREE.Color();

  function applyColor(color, on) {
    for (const m of glowMats) {
      m.emissive.copy(color);
      m.color.copy(color).multiplyScalar(0.12);
      m.emissiveIntensity = on ? m.userData.baseIntensity : 0;
    }
    for (const l of lights) { l.color.copy(color); l.intensity = on ? l.userData.base : 0; }
  }

  function setLighting(mode, hex, on = true) {
    state.mode = mode; state.on = on && mode !== 'off';
    state.color.set(hex);
    applyColor(state.color, state.on);
  }

  function tick(time) {
    if (state.mode === 'rainbow' && state.on) {
      tmp.setHSL((time * 0.08) % 1, 0.9, 0.55);
      applyColor(tmp, true);
    }
  }

  function addLight(light, base) {
    light.userData.base = base; lights.push(light); return light;
  }

  const rounded = (w, h, d, r = 0.02, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));

  function box(parent, w, h, d, mat, x = 0, y = 0, z = 0, opts = {}) {
    const geo = opts.r ? rounded(w, h, d, opts.r) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false; m.receiveShadow = opts.receive !== false;
    parent.add(m);
    return m;
  }

  function cyl(parent, rTop, rBot, h, mat, x = 0, y = 0, z = 0, axis = 'y', seg = 24) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
    m.position.set(x, y, z);
    if (axis === 'z') m.rotation.x = Math.PI / 2;
    if (axis === 'x') m.rotation.z = Math.PI / 2;
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function screw(parent, x, y, z, r = 0.025) {
    const s = cyl(parent, r, r, 0.02, mats.screw, x, y, z, 'z', 10);
    s.castShadow = false;
    return s;
  }

  /** Mark everything below `obj` so clicking it in 3D selects that category. */
  function tag(obj, category) {
    obj.traverse((o) => { o.userData.category = category; });
    return obj;
  }

  /* ---------- Fan ---------- */
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0.075, -0.02);
  bladeShape.bezierCurveTo(0.2, -0.1, 0.38, -0.06, 0.465, 0.03);
  bladeShape.bezierCurveTo(0.47, 0.11, 0.36, 0.2, 0.2, 0.17);
  bladeShape.bezierCurveTo(0.12, 0.15, 0.085, 0.09, 0.075, -0.02);
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.012, bevelEnabled: false });

  const frameShape = new THREE.Shape();
  const half = 0.5;
  const cr = 0.07;
  frameShape.moveTo(-half + cr, -half);
  frameShape.lineTo(half - cr, -half); frameShape.quadraticCurveTo(half, -half, half, -half + cr);
  frameShape.lineTo(half, half - cr); frameShape.quadraticCurveTo(half, half, half - cr, half);
  frameShape.lineTo(-half + cr, half); frameShape.quadraticCurveTo(-half, half, -half, half - cr);
  frameShape.lineTo(-half, -half + cr); frameShape.quadraticCurveTo(-half, -half, -half + cr, -half);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.47, 0, Math.PI * 2, true);
  frameShape.holes.push(hole);
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  frameGeo.translate(0, 0, -0.1);
  const ringGeo = new THREE.TorusGeometry(0.455, 0.018, 8, 48);
  const hubGeo = new THREE.CylinderGeometry(0.1, 0.11, 0.08, 28);
  const hubCapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.012, 28);
  const spokeGeo = new THREE.BoxGeometry(0.4, 0.03, 0.03);
  const sharedGeometries = new Set([bladeGeo, frameGeo, ringGeo, hubGeo, hubCapGeo, spokeGeo]);

  const fans = [];
  /**
   * diameter in kit units (1.2 = 120 mm). Faces +z. rgb adds a glowing ring.
   */
  function createFan(diameter = 1.2, { rgb = true, blades = 9, spin = true } = {}) {
    const fan = new THREE.Group();
    const frame = new THREE.Mesh(frameGeo, mats.fanFrame);
    frame.castShadow = true; frame.receiveShadow = true;
    fan.add(frame);
    if (rgb) {
      const ring = new THREE.Mesh(ringGeo, mats.glowRing); ring.position.z = 0.06; fan.add(ring);
    }
    const rotor = new THREE.Group();
    for (let i = 0; i < blades; i++) {
      const b = new THREE.Mesh(bladeGeo, mats.fanBlade);
      b.rotation.z = (i / blades) * Math.PI * 2;
      b.rotation.x = 0; // keep flat then pitch the pivot
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / blades) * Math.PI * 2;
      b.rotation.z = 0; b.rotation.x = 0.55; // pitch around the radial axis
      pivot.add(b);
      rotor.add(pivot);
    }
    const hub = new THREE.Mesh(hubGeo, mats.plasticLight); hub.rotation.x = Math.PI / 2; rotor.add(hub);
    const cap = new THREE.Mesh(hubCapGeo, rgb ? mats.glow : mats.plasticLight); cap.rotation.x = Math.PI / 2; cap.position.z = 0.045; rotor.add(cap);
    fan.add(rotor);
    // struts behind the rotor
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(spokeGeo, mats.fanFrame); s.rotation.z = (i / 3) * Math.PI; s.position.z = -0.08; fan.add(s);
    }
    fan.scale.setScalar(diameter);
    fan.userData.rotor = rotor;
    fan.userData.speed = spin ? 1 : 0;
    fan.userData.phase = Math.random() * 6.28;
    fans.push(fan);
    return fan;
  }

  function resetFans() { fans.length = 0; lights.length = 0; }

  function tickFans(dt, multiplier) {
    for (const f of fans) {
      if (f.userData.speed) f.userData.rotor.rotation.z -= dt * multiplier * 9;
    }
  }

  return { mats, box, cyl, screw, tag, createFan, rounded, setLighting, tick, addLight, resetFans, tickFans, state, glowMats, sharedGeometries, sharedMaterials, sharedTextures };
}
