import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import type { IncidentStatus, IncidentType, Severity } from '../../types/incident';
import { INCIDENT_TYPES, SEVERITY_META, TYPE_META, isOpen } from '../../utils/incidentMeta';

export interface TopologyNode {
  id: number;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  type: IncidentType;
}

export interface ThreatSceneOptions {
  mode: 'live' | 'ambient';
  reducedMotion: boolean;
  interactive: boolean;
  onHover?: (node: TopologyNode | null, x: number, y: number) => void;
  onSelect?: (node: TopologyNode) => void;
}

export interface ThreatSceneHandle {
  setNodes: (nodes: TopologyNode[]) => void;
  dispose: () => void;
}

type Disposable = {dispose: () => void;};

const ACCENT = new THREE.Color('#36E2C4');
const LINE = new THREE.Color('#2C3441');
const FAINT = new THREE.Color('#68727F');
const INK = new THREE.Color('#C9D3E0');
const sevColor = (s: Severity) => new THREE.Color(SEVERITY_META[s].hex);
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = a + 0x6d2b79f5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Attack-surface topology: the organisation core sits at the center, one hub per
 * incident vector (type) orbits it, and each incident orbits its hub — colored by
 * severity, dimmed when resolved/closed, pulsing when critical and open.
 * Packets travel hub → core in proportion to open incidents on that vector.
 */
export function createThreatScene(container: HTMLElement, labelLayer: HTMLElement, opts: ThreatSceneOptions): ThreatSceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x06080b, 10, 24);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const camHome = opts.mode === 'live' ? new THREE.Vector3(0, 4.2, 11.5) : new THREE.Vector3(0, 1.4, 10.5);
  camera.position.copy(camHome);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.enableZoom = opts.mode === 'live';
  controls.minDistance = 7;
  controls.maxDistance = 16;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.85;
  controls.enabled = opts.interactive;

  const disposables: Disposable[] = [];
  const track = <T extends Disposable,>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const root = new THREE.Group();
  scene.add(root);

  // Organisation core
  const coreGeo = track(new THREE.IcosahedronGeometry(0.85, 1));
  const core = new THREE.Group();
  core.add(new THREE.Mesh(coreGeo, track(new THREE.MeshBasicMaterial({ color: 0x08130f, transparent: true, opacity: 0.92 }))));
  core.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(coreGeo)), track(new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.6 }))));
  const coreInner = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.3, 0)), track(new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true })));
  core.add(coreInner);
  root.add(core);

  [0, 0.9].forEach((tilt, i) => {
    const ring = new THREE.Mesh(
      track(new THREE.RingGeometry(1.3 + i * 0.25, 1.312 + i * 0.25, 128)),
      track(new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 - i * 0.08, side: THREE.DoubleSide }))
    );
    ring.rotation.x = Math.PI / 2 + tilt;
    root.add(ring);
  });

  const grid = new THREE.PolarGridHelper(8.5, 16, 6, 96, 0x1c222c, 0x1c222c);
  grid.position.y = -2.7;
  const gridMat = grid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.7;
  track(grid.geometry);
  track(gridMat);
  scene.add(grid);

  // Dynamic content
  const dynamic = new THREE.Group();
  root.add(dynamic);
  let dyn: Disposable[] = [];
  const dtrack = <T extends Disposable,>(x: T): T => {
    dyn.push(x);
    return x;
  };
  let pickables: THREE.Mesh[] = [];
  let pulses: {mesh: THREE.Mesh;phase: number;}[] = [];
  let packets: {mesh: THREE.Mesh;from: THREE.Vector3;to: THREE.Vector3;t: number;speed: number;}[] = [];
  let orbits: {group: THREE.Group;speed: number;}[] = [];
  let labels: {el: HTMLElement;obj: THREE.Object3D;}[] = [];

  function clearDynamic() {
    dynamic.clear();
    dyn.forEach((d) => d.dispose());
    dyn = [];
    pickables = [];
    pulses = [];
    packets = [];
    orbits = [];
    labels.forEach((l) => l.el.remove());
    labels = [];
  }

  function addLabel(obj: THREE.Object3D, code: string, meta: string, hot: boolean) {
    const el = document.createElement('div');
    el.className = 'pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded border border-line bg-base/80 px-1.5 py-0.5 font-mono text-[10px] leading-none will-change-transform';
    const a = document.createElement('span');
    a.className = hot ? 'text-ink' : 'text-faint';
    a.textContent = code;
    const b = document.createElement('span');
    b.className = 'ml-1.5 text-faint';
    b.textContent = meta;
    el.append(a, b);
    labelLayer.appendChild(el);
    labels.push({ el, obj });
  }

  function buildLive(nodes: TopologyNode[]) {
    clearDynamic();
    const packetGeo = dtrack(new THREE.SphereGeometry(0.04, 8, 8));
    INCIDENT_TYPES.forEach((type, i) => {
      const angle = i / INCIDENT_TYPES.length * Math.PI * 2 + 0.3;
      const hubPos = new THREE.Vector3(Math.cos(angle) * 4.2, i % 2 === 0 ? 0.55 : -0.55, Math.sin(angle) * 4.2);
      const items = nodes.filter((n) => n.type === type);
      const open = items.filter((n) => isOpen(n.status));
      const top = open.reduce<Severity | null>(
        (acc, n) => !acc || SEVERITY_META[n.severity].rank > SEVERITY_META[acc].rank ? n.severity : acc,
        null
      );
      const hubColor = top ? sevColor(top) : FAINT;

      const hub = new THREE.Group();
      hub.position.copy(hubPos);
      dynamic.add(hub);
      hub.add(
        new THREE.Mesh(
          dtrack(new THREE.OctahedronGeometry(0.18 + Math.min(open.length, 6) * 0.03, 0)),
          dtrack(new THREE.MeshBasicMaterial({ color: hubColor, wireframe: true }))
        )
      );
      dynamic.add(
        new THREE.Line(
          dtrack(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), hubPos])),
          dtrack(new THREE.LineBasicMaterial({ color: open.length ? hubColor : LINE, transparent: true, opacity: open.length ? 0.4 : 0.6 }))
        )
      );
      addLabel(hub, TYPE_META[type].code, `${open.length}/${items.length}`, open.length > 0);

      const orbit = new THREE.Group();
      orbit.rotation.x = i % 2 ? 0.35 : -0.35;
      hub.add(orbit);
      orbits.push({ group: orbit, speed: 0.12 + i % 3 * 0.05 });

      items.forEach((n, j) => {
        const a = j / Math.max(items.length, 1) * Math.PI * 2;
        const rr = 0.62 + j % 3 * 0.17;
        const size = 0.05 + SEVERITY_META[n.severity].rank * 0.022;
        const nOpen = isOpen(n.status);
        const mesh = new THREE.Mesh(
          dtrack(new THREE.SphereGeometry(size, 16, 16)),
          dtrack(new THREE.MeshBasicMaterial({ color: sevColor(n.severity), transparent: true, opacity: nOpen ? 1 : 0.25 }))
        );
        mesh.position.set(Math.cos(a) * rr, Math.sin(a * 2) * 0.1, Math.sin(a) * rr);
        mesh.userData.node = n;
        orbit.add(mesh);
        pickables.push(mesh);
        orbit.add(
          new THREE.Line(
            dtrack(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), mesh.position.clone()])),
            dtrack(new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.7 }))
          )
        );
        if (nOpen && n.severity === 'CRITICAL') {
          const ring = new THREE.Mesh(
            dtrack(new THREE.RingGeometry(size * 1.5, size * 1.75, 32)),
            dtrack(new THREE.MeshBasicMaterial({ color: sevColor('CRITICAL'), transparent: true, opacity: 0.8, side: THREE.DoubleSide }))
          );
          ring.position.copy(mesh.position);
          orbit.add(ring);
          pulses.push({ mesh: ring, phase: j * 0.37 });
        }
      });

      const packetMat = dtrack(new THREE.MeshBasicMaterial({ color: hubColor }));
      const count = Math.min(open.length, 4);
      for (let k = 0; k < count; k++) {
        const p = new THREE.Mesh(packetGeo, packetMat);
        dynamic.add(p);
        packets.push({ mesh: p, from: hubPos.clone(), to: new THREE.Vector3(), t: k / Math.max(count, 1), speed: 0.16 + 0.04 * k });
      }
    });
  }

  function buildAmbient() {
    clearDynamic();
    const rand = seeded(7);
    const N = 120;
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - i / (N - 1) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * golden;
      pts.push(new THREE.Vector3(Math.cos(th) * rad, y * 0.7, Math.sin(th) * rad).multiplyScalar(4.4 * (0.82 + rand() * 0.32)));
    }
    dynamic.add(
      new THREE.Points(
        dtrack(new THREE.BufferGeometry().setFromPoints(pts)),
        dtrack(new THREE.PointsMaterial({ color: INK, size: 0.06, transparent: true, opacity: 0.75, sizeAttenuation: true }))
      )
    );
    const seg: THREE.Vector3[] = [];
    pts.forEach((p, i) => {
      const nearest = pts.
      map((q, j) => ({ j, d: p.distanceToSquared(q) })).
      filter((x) => x.j !== i).
      sort((a, b) => a.d - b.d).
      slice(0, 2);
      nearest.forEach((n) => seg.push(p, pts[n.j]));
    });
    dynamic.add(
      new THREE.LineSegments(
        dtrack(new THREE.BufferGeometry().setFromPoints(seg)),
        dtrack(new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.8 }))
      )
    );
    const threatSev: Severity[] = ['CRITICAL', 'HIGH', 'HIGH', 'MEDIUM', 'CRITICAL', 'MEDIUM'];
    const packetGeo = dtrack(new THREE.SphereGeometry(0.04, 8, 8));
    threatSev.forEach((sev, k) => {
      const p = pts[Math.floor(rand() * N)];
      const color = sevColor(sev);
      const node = new THREE.Mesh(dtrack(new THREE.SphereGeometry(0.1, 16, 16)), dtrack(new THREE.MeshBasicMaterial({ color })));
      node.position.copy(p);
      dynamic.add(node);
      const ring = new THREE.Mesh(
        dtrack(new THREE.RingGeometry(0.16, 0.19, 32)),
        dtrack(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide }))
      );
      ring.position.copy(p);
      dynamic.add(ring);
      pulses.push({ mesh: ring, phase: k * 0.21 });
      dynamic.add(
        new THREE.Line(
          dtrack(new THREE.BufferGeometry().setFromPoints([p, new THREE.Vector3()])),
          dtrack(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 }))
        )
      );
      const pm = new THREE.Mesh(packetGeo, dtrack(new THREE.MeshBasicMaterial({ color })));
      dynamic.add(pm);
      packets.push({ mesh: pm, from: p.clone(), to: new THREE.Vector3(), t: rand(), speed: 0.12 + rand() * 0.1 });
    });
  }

  // Interaction
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerInside = false;
  let pointerPos = { x: 0, y: 0 };
  let hovered: THREE.Mesh | null = null;
  let downAt: {x: number;y: number;} | null = null;

  const onMove = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    pointerInside = true;
  };
  const onLeave = () => {
    pointerInside = false;
  };
  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 5 && hovered) {
      opts.onSelect?.(hovered.userData.node as TopologyNode);
    }
    downAt = null;
  };
  if (opts.interactive) {
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
  }

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  });
  io.observe(container);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const motion = !opts.reducedMotion;
  let raf = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) {
      clock.getDelta();
      return;
    }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (motion) {
      if (!hovered) root.rotation.y += dt * 0.055;
      core.rotation.y += dt * 0.22;
      core.rotation.x += dt * 0.07;
      coreInner.rotation.y -= dt * 0.6;
      orbits.forEach((o) => o.group.rotation.y += dt * o.speed);
    }
    pulses.forEach((p) => {
      const phase = (t * 0.7 + p.phase) % 1;
      const s = motion ? 1 + phase * 1.6 : 1.4;
      p.mesh.scale.setScalar(s);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = motion ? 0.85 * (1 - phase) : 0.6;
      p.mesh.lookAt(camera.position);
    });
    packets.forEach((p) => {
      p.mesh.visible = motion;
      if (!motion) return;
      p.t = (p.t + dt * p.speed) % 1;
      p.mesh.position.lerpVectors(p.from, p.to, easeInOut(p.t));
    });
    controls.update();

    if (opts.interactive && pickables.length) {
      let next: THREE.Mesh | null = null;
      if (pointerInside) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickables, false)[0];
        next = hit ? hit.object as THREE.Mesh : null;
      }
      if (next !== hovered) {
        hovered?.scale.setScalar(1);
        hovered = next;
        hovered?.scale.setScalar(1.7);
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
        opts.onHover?.(hovered ? hovered.userData.node as TopologyNode : null, pointerPos.x, pointerPos.y);
      }
    }

    renderer.render(scene, camera);

    const w = container.clientWidth;
    const h = container.clientHeight;
    labels.forEach((l) => {
      l.obj.getWorldPosition(tmp);
      const dist = camera.position.distanceTo(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      l.el.style.transform = `translate(${x}px, ${y - 22}px) translate(-50%, -50%)`;
      l.el.style.opacity = tmp.z > 1 ? '0' : String(Math.max(0.3, Math.min(1, 1.6 - (dist - 7) / 8)));
    });
  };

  if (opts.mode === 'ambient') buildAmbient();

  if (motion) {
    camera.position.set(camHome.x, camHome.y + 5, camHome.z + 10);
    gsap.to(camera.position, { x: camHome.x, y: camHome.y, z: camHome.z, duration: 2.6, ease: 'expo.out' });
    root.scale.setScalar(0.72);
    gsap.to(root.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'expo.out' });
  }
  tick();

  return {
    setNodes(nodes) {
      if (opts.mode === 'live') buildLive(nodes);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(root.scale);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      clearDynamic();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}