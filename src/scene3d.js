// three.js stage: the Blender machine, materials, camera views, key presses, rotors, cords and the glowing current.
// Renders on demand only: a frame is drawn when something moves, so an idle page costs nothing.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { A, ROTORS } from './enigma.js'
import * as Lo from './layout.js'

const TAU = Math.PI * 2
export const b2t = ([x, y, z]) => new THREE.Vector3(x, z, -y)
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = t => 1 - (1 - t) ** 3
const clamp01 = t => Math.min(1, Math.max(0, t))

// camera views in Blender coordinates: [camera, target]
export const VIEWS = {
  hero: [[0.34, -0.66, 0.5], [0.0, -0.06, 0.055]],
  overview: [[0.3, -0.6, 0.48], [0.0, -0.05, 0.06]],
  keyboard: [[0.0, -0.4, 0.5], [0.0, -0.075, 0.1]],
  xray: [[0.34, -0.48, 0.38], [0.0, -0.04, 0.06]],
  plugboard: [[0.04, -0.6, 0.27], [0.0, -0.16, 0.07]],
  rotors: [[0.2, -0.16, 0.34], [-0.03, 0.075, 0.09]],
  explode: [[0.24, -0.3, 0.32], [-0.035, 0.075, 0.18]],
  wiring: [[-0.02, -0.26, 0.27], [-0.03, 0.075, 0.185]],
  stepping: [[0.0, -0.1, 0.26], [-0.025, 0.075, 0.1]],
  windows: [[0.03, -0.09, 0.3], [-0.025, 0.07, 0.115]],
  reflector: [[-0.3, 0.3, 0.32], [-0.05, 0.06, 0.07]],
  path: [[0.32, -0.52, 0.42], [0.0, -0.04, 0.07]],
}


function noiseNormal(size = 256, amp = 1.6, cells = 90) {
  // crinkle paint: random bumps baked to a small tiling normal map
  const h = new Float32Array(size * size)
  for (let k = 0; k < cells * 40; k++) {
    const cx = Math.random() * size, cy = Math.random() * size, r = 1.5 + Math.random() * 3, s = Math.random() - 0.5
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
      const d = (x * x + y * y) / (r * r)
      if (d > 1) continue
      const px = (Math.floor(cx + x) + size) % size, py = (Math.floor(cy + y) + size) % size
      h[py * size + px] += s * (1 - d)
    }
  }
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x
    const dx = h[y * size + (x + 1) % size] - h[y * size + (x - 1 + size) % size]
    const dy = h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x]
    const nx = -dx * amp, ny = -dy * amp, nz = 1, l = Math.hypot(nx, ny, nz)
    data[i * 4] = (nx / l * 0.5 + 0.5) * 255
    data[i * 4 + 1] = (ny / l * 0.5 + 0.5) * 255
    data[i * 4 + 2] = (nz / l * 0.5 + 0.5) * 255
    data[i * 4 + 3] = 255
  }
  const t = new THREE.DataTexture(data, size, size)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

function radialAlpha(size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gr.addColorStop(0, '#fff')
  gr.addColorStop(0.45, '#bbb')
  gr.addColorStop(1, '#000')
  g.fillStyle = gr
  g.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

export class Stage {
  constructor(canvas, { onReady, onKey, onThumb } = {}) {
    this.canvas = canvas
    this.onKey = onKey
    this.onThumb = onThumb
    this.tweens = []
    this.dirty = true
    this.state = { xray: 0, cover: 0, explode: 0, glass: 0, wiring: null }
    this.held = {}
    this.barU = 0
    const lowEnd = matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4
    this.maxDpr = lowEnd ? 1.25 : 1.75
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    r.setPixelRatio(Math.min(devicePixelRatio, this.maxDpr))
    r.toneMapping = THREE.AgXToneMapping
    r.toneMappingExposure = 1.15
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFShadowMap
    r.shadowMap.autoUpdate = false
    const sc = this.scene = new THREE.Scene()
    sc.background = new THREE.Color('#141311')
    const pm = new THREE.PMREMGenerator(r)
    sc.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    sc.environmentIntensity = 0.55
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.01, 20)
    this.setView('hero', 0)
    const c = this.controls = new OrbitControls(this.camera, canvas)
    c.enableDamping = true
    c.dampingFactor = 0.12
    c.enablePan = false
    c.minDistance = 0.18
    c.maxDistance = 1.4
    c.maxPolarAngle = Math.PI * 0.49
    c.enableZoom = false
    c.addEventListener('change', () => { this.dirty = true })
    c.target.copy(this.target)
    this.userMoved = false
    c.addEventListener('start', () => { this.userMoved = true })
    this.lights()
    this.ground()
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.bindPointer()
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement)
    this.resize()
    this.load().then(() => onReady && onReady())
    this.loop = this.loop.bind(this)
    requestAnimationFrame(this.loop)
    this.frameTimes = []
  }

  lights() {
    const key = new THREE.DirectionalLight('#ffe2bf', 2.6)
    key.position.copy(b2t([0.55, -0.55, 0.9]))
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    const s = key.shadow.camera
    s.left = s.bottom = -0.45
    s.right = s.top = 0.45
    s.near = 0.3
    s.far = 2.5
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.01
    key.shadow.radius = 4
    this.scene.add(key, key.target)
    const fill = new THREE.DirectionalLight('#b9cbe6', 0.5)
    fill.position.copy(b2t([-0.8, -0.4, 0.35]))
    const rim = new THREE.DirectionalLight('#ffffff', 1.1)
    rim.position.copy(b2t([-0.3, 0.9, 0.6]))
    this.scene.add(fill, rim)
  }

  ground() {
    const tl = new THREE.TextureLoader()
    const map = tl.load('tex/desk_diff.webp', () => { this.dirty = true })
    map.colorSpace = THREE.SRGBColorSpace
    const nor = tl.load('tex/desk_nor.webp')
    for (const t of [map, nor]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 2.2) }
    const m = new THREE.MeshStandardMaterial({ map, normalMap: nor, roughness: 0.7, color: '#4a4039' })
    const g = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), m)
    this.scene.fog = new THREE.Fog('#141311', 1.0, 2.2)
    g.rotation.x = -Math.PI / 2
    g.position.set(0, -0.0125, 0.05)
    g.receiveShadow = true
    this.scene.add(g)
  }

  materials() {
    const tl = new THREE.TextureLoader()
    const tex = (f, srgb) => {
      const t = tl.load(f, () => { this.dirty = true })
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    const crinkle = noiseNormal()
    crinkle.repeat.set(9, 9)
    const oak = { map: tex('tex/oak_diff.webp', true), normalMap: tex('tex/oak_nor.webp'), roughnessMap: tex('tex/oak_rough.webp') }
    const S = THREE.MeshStandardMaterial, P = THREE.MeshPhysicalMaterial
    return {
      wood: () => new S({ ...oak, color: '#6b5a4a', roughness: 1, normalScale: new THREE.Vector2(0.6, 0.6) }),
      black_paint: () => new S({ color: '#121212', roughness: 0.62, metalness: 0.15, normalMap: crinkle, normalScale: new THREE.Vector2(0.55, 0.55) }),
      body_floor: () => new S({ color: '#0c0c0d', roughness: 0.7 }),
      bakelite: () => new P({ color: '#070707', roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      nickel: () => new S({ color: '#d4d3cc', metalness: 1, roughness: 0.28 }),
      box_metal: () => new S({ color: '#c9c7bf', metalness: 1, roughness: 0.34 }),
      brass: () => new S({ color: '#d6ad63', metalness: 1, roughness: 0.34 }),
      rotor_brass: () => new S({ color: '#d6ad63', metalness: 1, roughness: 0.32 }),
      rotor_nickel: () => new S({ color: '#d4d3cc', metalness: 1, roughness: 0.28 }),
      rotor_hub: () => new S({ color: '#d4d3cc', metalness: 1, roughness: 0.24 }),
      rotor_alu: () => new S({ color: '#bfc3c8', metalness: 1, roughness: 0.4 }),
      rotor_bakelite: () => new P({ color: '#0b0b0b', roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
      ratchet_r: () => new S({ color: '#d4d3cc', metalness: 1, roughness: 0.28 }),
      step_mech: () => new S({ color: '#d4d3cc', metalness: 1, roughness: 0.3 }),
      ring_letter: () => new S({ color: '#141210', roughness: 0.5 }),
      letter_white: () => new S({ color: '#e9e5d8', roughness: 0.45 }),
      letter_dark: () => new S({ color: '#161513', roughness: 0.45 }),
      key_cap: () => new P({ color: '#e2dccb', roughness: 0.32, clearcoat: 0.4 }),
      lamp_letter: () => new S({ color: '#8d8a82', roughness: 0.5 }),
      lamp_board: () => new S({ color: '#4a3220', roughness: 0.65 }),
      contact_block: () => new S({ color: '#3b2616', roughness: 0.6 }),
      socket_hole: () => new S({ color: '#030303', roughness: 0.9 }),
      stamp: () => new S({ color: '#2a170b', roughness: 0.85 }),
      wire_insul: () => new S({ color: '#6e2a17', roughness: 0.8 }),
      wire_black: () => new S({ color: '#141414', roughness: 0.8 }),
      wire_red: () => new S({ color: '#8a1c12', roughness: 0.7 }),
      battery_jacket: () => new S({ color: '#7d3a24', roughness: 0.75 }),
      battery_top: () => new S({ color: '#2a2520', roughness: 0.6 }),
      battery_compartment: () => new S({ color: '#161617', roughness: 0.6 }),
      bulb_glass: () => new P({ color: '#fffaf0', roughness: 0.05, transmission: 0, transparent: true, opacity: 0.35, depthWrite: false }),
      ref_red: () => new S({ color: '#9b1b12', roughness: 0.5 }),
    }
  }

  async load() {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.loadAsync('models/enigma.glb')
    const root = this.root = gltf.scene
    const lib = this.materials()
    const cache = {}
    const N = this.nodes = {}
    this.fadeable = { case: [], body: [], rotorGlass: [] }
    root.traverse(o => {
      N[o.name] = o
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      const base = o.material.name.replace(/\.\d+$/, '')
      let key = base
      if (/^Alpha_.*part__rotor_brass/.test(o.name)) key = 'alpha_ring'
      if (base.startsWith('lamp_') && base.length === 6) {
        o.material = new THREE.MeshStandardMaterial({ color: '#191715', roughness: 0.35, emissive: '#ff9a2e', emissiveIntensity: 0 })
        return
      }
      if (key === 'alpha_ring') cache[key] ||= new THREE.MeshStandardMaterial({ color: '#e6dcc4', roughness: 0.45 })
      else if (lib[key]) cache[key] ||= lib[key]()
      const mat = cache[key] || o.material
      // fading groups get their own material copies so the rest of the machine stays solid
      const grp = o.name.includes('case__') ? 'case' : o.name.includes('body__') || o.name.startsWith('RotorCoverHinge__') ? 'body'
        : /^Spin_.*(rotor_bakelite|rotor_alu|ratchet_r|rotor_nickel)$/.test(o.name) || /^Alpha_.*part__/.test(o.name) || /^Base_(REF|ETW)__part/.test(o.name) ? 'rotorGlass' : null
      if (grp) {
        o.material = mat.clone()
        o.material.userData.opacity0 = mat.opacity
        this.fadeable[grp].push(o)
      } else o.material = mat
      if (base === 'bulb_glass') o.castShadow = false
    })
    this.scene.add(root)
    this.keys = {}
    this.lamps = {}
    for (const l of A) {
      this.keys[l] = N['Key_' + l]
      this.lamps[l] = N['Lamp_' + l]
      // every lamp letter gets its own material: the bulb lights the stencilled letter, not the parts around it
      const tx = N['LampTxt_' + l]
      tx.material = new THREE.MeshStandardMaterial({ color: '#8d8a82', roughness: 0.5, emissive: '#ffb347', emissiveIntensity: 0 })
      tx.castShadow = false
      this.lampTxt = this.lampTxt || {}
      this.lampTxt[l] = tx
      this.keys[l].userData.letter = l
    }
    this.spins = { L: N.Spin_L, M: N.Spin_M, R: N.Spin_R }
    this.alphas = { L: N.Alpha_L, M: N.Alpha_M, R: N.Alpha_R }
    this.bases = {}
    for (const k of ['REF', 'L', 'M', 'R', 'ETW']) { this.bases[k] = N['Base_' + k]; this.bases[k].userData.p0 = this.bases[k].position.clone() }
    this.stepBar = N.StepBar
    this.stepLink = N.StepLink
    this.stepY = [this.stepBar.position.y, this.stepLink.position.y]
    this.rocker = N.PawlRocker
    this.coverHinge = N.RotorCoverHinge
    this.notches = {}
    for (const k of ['L', 'M', 'R']) {
      const n = new THREE.Mesh(new THREE.BoxGeometry(0.0084, 0.0024, 0.0046), new THREE.MeshStandardMaterial({ color: '#070606', roughness: 0.9 }))
      this.alphas[k].add(n)
      this.notches[k] = n
    }
    this.cordGroup = new THREE.Group()
    this.scene.add(this.cordGroup)
    this.pathGroup = new THREE.Group()
    this.scene.add(this.pathGroup)
    this.wiringGroup = new THREE.Group()
    this.keyTargets = []
    for (const l of A) this.keys[l].traverse(o => { if (o.isMesh) { o.userData.letter = l; this.keyTargets.push(o) } })
    this.thumbTargets = []
    for (const k of ['L', 'M', 'R']) this.spins[k].traverse(o => { if (o.isMesh && /Thumb|rotor_alu/.test(o.name)) { o.userData.rotor = k; this.thumbTargets.push(o) } })
    this.shadowsDirty()
    this.dirty = true
  }

  shadowsDirty() { this.renderer.shadowMap.needsUpdate = true; this.dirty = true }

  resize() {
    const el = this.canvas.parentElement
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // keep the machine in frame on tall (mobile) screens
    // constant horizontal field of view (about 38 deg), so narrow stages pull back instead of cropping
    const hf = Math.tan((38 * Math.PI) / 360)
    this.camera.fov = Math.min(64, Math.max(24, (Math.atan(hf / (w / h)) * 360) / Math.PI))
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  // ---------------------------------------------------------------- tweens and loop
  tween(dur, fn, { easing = ease, key, shadow = true } = {}) {
    // a new tween on the same key replaces the old one; the old promise still resolves, so nothing waits forever
    if (key) this.tweens = this.tweens.filter(t => { if (t.key !== key) return true; t.res(); return false })
    return new Promise(res => {
      if (dur <= 0) { fn(1); this.dirty = true; res(); return }
      this.tweens.push({ t0: performance.now(), dur, fn, easing, res, key, shadow })
      this.dirty = true
    })
  }

  loop(now) {
    requestAnimationFrame(this.loop)
    if (this.tweens.length) {
      // the camera flight and the glowing current change no shadows, so the shadow map is not redrawn for them
      if (this.tweens.some(t => t.shadow)) this.shadowsDirty()
      else this.dirty = true
      this.tweens = this.tweens.filter(t => {
        const u = clamp01((now - t.t0) / t.dur)
        t.fn(t.easing(u))
        if (u >= 1) { t.res(); return false }
        return true
      })
    }
    if (this.controls.update()) this.dirty = true
    if (!this.dirty || !this.visible) return
    this.dirty = false
    const t0 = performance.now()
    this.renderer.render(this.scene, this.camera)
    this.onFrame && this.onFrame()
    this.adapt(performance.now() - t0)
  }

  adapt(ms) {
    // drop the pixel ratio once if frames get slow (CPU-side submit time is a rough proxy)
    this.frameTimes.push(ms)
    if (this.frameTimes.length < 30) return
    const avg = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length
    this.frameTimes = []
    if (avg > 14 && this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(1)
      this.resize()
    }
  }

  // ---------------------------------------------------------------- camera
  setView(name, dur = 1400) {
    const [c, t] = VIEWS[name]
    const pc = b2t(c), pt = b2t(t)
    if (!this.target) { this.target = pt.clone(); this.camera.position.copy(pc); this.camera.lookAt(pt); return Promise.resolve() }
    const c0 = this.camera.position.clone(), t0 = this.controls.target.clone()
    this.view = name
    return this.tween(dur, u => {
      this.camera.position.lerpVectors(c0, pc, u)
      this.controls.target.lerpVectors(t0, pt, u)
      this.camera.lookAt(this.controls.target)
    }, { key: 'cam', shadow: false })
  }

  project(bpos) {
    const v = b2t(bpos).project(this.camera)
    const el = this.canvas
    return { x: (v.x * 0.5 + 0.5) * el.clientWidth, y: (-v.y * 0.5 + 0.5) * el.clientHeight, behind: v.z > 1 }
  }

  // ---------------------------------------------------------------- states
  fade(list, value) {
    for (const o of list) {
      const m = o.material
      const op = 1 - value * 0.94
      m.transparent = op < 0.999
      m.opacity = op
      m.depthWrite = op > 0.5
      o.castShadow = op > 0.5
      m.needsUpdate = true
    }
  }

  setXray(v, dur = 900) {
    const v0 = this.state.xray
    this.state.xray = v
    return this.tween(dur, u => { const x = v0 + (v - v0) * u; this.fade(this.fadeable.case, x); this.fade(this.fadeable.body, x) }, { key: 'xray' })
  }

  setGlass(v, dur = 700) {
    const v0 = this.state.glass
    this.state.glass = v
    return this.tween(dur, u => this.fade(this.fadeable.rotorGlass, (v0 + (v - v0) * u) * 0.92), { key: 'glass' })
  }

  setCover(open, dur = 900) {
    const a0 = this.coverHinge.rotation.x, a1 = open ? (-95 * Math.PI) / 180 : 0 // front edge lifts, the hinge is at the back
    this.state.cover = open ? 1 : 0
    return this.tween(dur, u => { this.coverHinge.rotation.x = a0 + (a1 - a0) * u }, { key: 'cover' })
  }

  setExplode(v, dur = 1300) {
    const e0 = this.state.explode
    this.state.explode = v
    const order = ['REF', 'L', 'M', 'R', 'ETW']
    return this.tween(dur, u => {
      const e = e0 + (v - e0) * u
      order.forEach((k, i) => {
        const b = this.bases[k], p0 = b.userData.p0
        const lift = clamp01(e * 1.6 - i * 0.08)
        b.position.set(p0.x + (p0.x + 0.025) * 1.1 * clamp01(e * 1.4 - 0.3), p0.y + 0.13 * easeOut(lift), p0.z)
      })
    }, { key: 'explode' })
  }

  // rotor positions / rings: window letter = pos; the core turns by pos - ring, the alphabet ring by ring
  setRotors(pos, rings, types, dur = 0) {
    const ks = ['L', 'M', 'R']
    const from = ks.map(k => [this.spins[k].rotation.x, this.alphas[k].rotation.x])
    const to = ks.map((k, i) => {
      const cur = from[i][0]
      let target = (TAU * (pos[i] - rings[i])) / 26
      // shortest way round, and a forward step always turns forward
      target = cur + ((((target - cur) % TAU) + TAU + Math.PI) % TAU) - Math.PI
      return [target, (TAU * rings[i]) / 26]
    })
    if (types) ks.forEach((k, i) => this.placeNotch(k, ROTORS[types[i]].notch))
    return this.tween(dur, u => ks.forEach((k, i) => {
      this.spins[k].rotation.x = from[i][0] + (to[i][0] - from[i][0]) * u
      this.alphas[k].rotation.x = from[i][1] + (to[i][1] - from[i][1]) * u
    }), { key: 'rotors', easing: easeOut })
  }

  placeNotch(k, letter) {
    // the notch sits under the pawl (about 195 deg round from the window) when its letter shows in the window
    const th = (195.3 * Math.PI) / 180 + (TAU * A.indexOf(letter)) / 26
    const y = 0.0527 * Math.sin(th), z = 0.0527 * Math.cos(th)
    const n = this.notches[k]
    n.position.copy(new THREE.Vector3(-0.004, z, -y))
    n.rotation.set(-th, 0, 0)
  }

  // ---------------------------------------------------------------- key press
  // each key has its own tween, the step bar and pawls another, so a fast second key never freezes the first
  press(letter, positions, rings, dur = 170) {
    const key = this.keys[letter]
    const ang = Lo.keyAngle(letter)
    const a0 = key.rotation.x
    this.held[letter] = true
    this.tween(dur, u => { key.rotation.x = a0 + (ang - a0) * u }, { key: 'key' + letter, easing: easeOut })
    const b0 = this.barU
    this.tween(dur, u => this.setBar(b0 + (1 - b0) * u), { key: 'bar', easing: easeOut })
    this.setRotors(positions, rings, null, dur * 1.2)
    // the line leaf closes at the bottom of the travel, unless the key was already let go
    const leaf = this.nodes['KeyLeaf_' + letter]
    if (leaf) setTimeout(() => { if (this.held[letter]) this.tween(60, u => { leaf.rotation.x = Lo.LEAF_ANG * u }, { key: 'leaf' + letter }) }, dur)
  }

  setBar(u) {
    this.barU = u
    this.stepBar.position.y = this.stepY[0] - 0.004 * u
    this.stepLink.position.y = this.stepY[1] - 0.004 * u
    this.rocker.rotation.x = Lo.PAWL_SWING * u
  }

  release(letter, dur = 200) {
    const key = this.keys[letter]
    const leaf = this.nodes['KeyLeaf_' + letter]
    this.held[letter] = false
    const a0 = key.rotation.x, l0 = leaf ? leaf.rotation.x : 0
    if (leaf) this.tween(60, u => { leaf.rotation.x = l0 * (1 - u) }, { key: 'leaf' + letter })
    const b0 = this.barU
    this.tween(dur, u => this.setBar(b0 * (1 - u)), { key: 'bar', easing: easeOut })
    return this.tween(dur, u => { key.rotation.x = a0 * (1 - u) }, { key: 'key' + letter, easing: easeOut })
  }

  lamp(letter, on) {
    for (const l of A) {
      const lit = on && l === letter
      const tx = this.lampTxt[l].material, win = this.lamps[l].material
      tx.emissiveIntensity = lit ? 6 : 0
      tx.color.set(lit ? '#ffd9a0' : '#8d8a82')
      win.emissiveIntensity = lit ? 0.12 : 0
    }
    this.dirty = true
  }

  // ---------------------------------------------------------------- cords (plugboard pairs)
  setCords(pairs) {
    const mats = new Set()
    this.cordGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) mats.add(o.material) })
    mats.forEach(m => m.dispose())
    this.cordGroup.clear()
    const cordM = new THREE.MeshStandardMaterial({ color: '#1a1714', roughness: 0.85 })
    const plugM = new THREE.MeshPhysicalMaterial({ color: '#0a0a0a', roughness: 0.3, clearcoat: 0.5 })
    const plugG = new THREE.BoxGeometry(0.008, 0.0124, 0.0128)
    pairs.forEach((p, i) => {
      const pts = Lo.cablePoints(p[0], p[1], i).map(b2t)
      const curve = new THREE.CatmullRomCurve3(pts)
      const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.0016, 8, false), cordM)
      m.castShadow = true
      this.cordGroup.add(m)
      for (const l of p) {
        const [x, , z] = Lo.socketPos(l)
        const pl = new THREE.Mesh(plugG, plugM)
        pl.position.copy(b2t([x, Lo.PF - 0.0012 - 0.0064, z]))
        pl.castShadow = true
        this.cordGroup.add(pl)
      }
    })
    this.shadowsDirty()
  }

  // ---------------------------------------------------------------- current path
  clearPath() {
    this.pathToken = null
    const mats = new Set()
    this.pathGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) mats.add(o.material) })
    mats.forEach(m => m.dispose())
    this.pathGroup.clear()
    this.dirty = true
  }

  async showPath(segments, { speed = 1, glass = true } = {}) {
    this.clearPath()
    const fwd = new THREE.MeshBasicMaterial({ color: '#ffa53a', toneMapped: false })
    const back = new THREE.MeshBasicMaterial({ color: '#4aa8ff', toneMapped: false })
    const haloF = new THREE.MeshBasicMaterial({ color: '#ff8a1e', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    const haloB = new THREE.MeshBasicMaterial({ color: '#2f8cff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    const token = (this.pathToken = {})
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.0024, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3dc', toneMapped: false }))
    this.pathGroup.add(head)
    for (const [si, s] of segments.entries()) {
      const cp = new THREE.CurvePath()
      const pts = s.pts.map(b2t)
      for (let i = 0; i < pts.length - 1; i++) if (pts[i].distanceTo(pts[i + 1]) > 1e-6) cp.add(new THREE.LineCurve3(pts[i], pts[i + 1]))
      const len = cp.getLength()
      const n = Math.max(8, Math.round(len / 0.002))
      const core = new THREE.Mesh(new THREE.TubeGeometry(cp, n, 0.0011, 6, false), s.dir ? back : fwd)
      const halo = new THREE.Mesh(new THREE.TubeGeometry(cp, n, 0.003, 8, false), s.dir ? haloB : haloF)
      core.renderOrder = halo.renderOrder = 5
      this.pathGroup.add(core, halo)
      const cc = core.geometry.index.count, hc = halo.geometry.index.count
      core.geometry.setDrawRange(0, 0)
      halo.geometry.setDrawRange(0, 0)
      const dur = speed > 50 ? 0 : (110 + len * 950) / speed
      await this.tween(dur, u => {
        if (token !== this.pathToken) return
        core.geometry.setDrawRange(0, Math.floor((cc * u) / 6) * 6)
        halo.geometry.setDrawRange(0, Math.floor((hc * u) / 6) * 6)
        head.position.copy(cp.getPointAt(Math.min(1, u)))
        this.onPathProgress && this.onPathProgress(si, u)
      }, { easing: t => t, key: 'path', shadow: false })
      if (token !== this.pathToken) return false
    }
    head.visible = false
    this.dirty = true
    return true
  }

  // ---------------------------------------------------------------- rotor internal wiring (26 wires in the core)
  showWiring(k, type) {
    if (this.wiringGroup.parent) this.wiringGroup.parent.remove(this.wiringGroup)
    this.wiringGroup.traverse(o => { if (o.geometry) o.geometry.dispose() })
    this.wiringGroup.clear()
    this.state.wiring = k ? { k, type } : null
    if (!k) { this.dirty = true; return }
    const w = [...ROTORS[type].wiring].map(c => A.indexOf(c))
    const mat = new THREE.MeshBasicMaterial({ color: '#e0b25c', toneMapped: false })
    const hl = new THREE.MeshBasicMaterial({ color: '#ffa53a', toneMapped: false })
    const pt = (x, i, r) => { const th = (TAU * i) / 26; return new THREE.Vector3(x, r * Math.cos(th), -r * Math.sin(th)) }
    this.wireMeshes = []
    for (let i = 0; i < 26; i++) {
      const o = w[i]
      let d = o - i
      if (d > 13) d -= 26
      if (d < -13) d += 26
      const mid = i + d / 2
      const curve = new THREE.CubicBezierCurve3(pt(0.0085, i, 0.035), pt(0.003, i + d * 0.15, 0.024 - Math.abs(d) * 0.0006), pt(-0.003, i + d * 0.85, 0.024 - Math.abs(d) * 0.0006), pt(-0.0085, o, 0.035))
      void mid
      const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.00045, 5, false), mat)
      m.userData.i = i
      this.wireMeshes.push(m)
      this.wiringGroup.add(m)
    }
    this.wiringGroup.userData.hl = hl
    this.wiringGroup.userData.base = mat
    this.spins[k].add(this.wiringGroup)
    this.dirty = true
  }

  highlightWire(i) {
    if (!this.wireMeshes) return
    for (const m of this.wireMeshes) m.material = m.userData.i === i ? this.wiringGroup.userData.hl : this.wiringGroup.userData.base
    this.dirty = true
  }

  // ---------------------------------------------------------------- pointer: click keys and thumbwheels
  bindPointer() {
    const el = this.canvas
    let down = null
    const pick = (e, list) => {
      const r = el.getBoundingClientRect()
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      this.raycaster.setFromCamera(this.pointer, this.camera)
      return this.raycaster.intersectObjects(list, false)[0]
    }
    el.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY] })
    el.addEventListener('pointerup', e => {
      if (!down || !this.keyTargets) return
      const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6
      down = null
      if (moved) return
      const hk = pick(e, this.keyTargets)
      if (hk && this.onKey) { this.onKey(hk.object.userData.letter); return }
      const ht = pick(e, this.thumbTargets)
      if (ht && this.onThumb) {
        // upper half of the wheel (towards the operator) turns it forward
        const local = this.spins[ht.object.userData.rotor].parent.worldToLocal(ht.point.clone())
        this.onThumb(ht.object.userData.rotor, local.z < 0 ? 1 : -1)
      }
    })
    el.addEventListener('pointermove', e => {
      if (!this.keyTargets || e.buttons) return
      const h = pick(e, this.keyTargets) || pick(e, this.thumbTargets)
      el.style.cursor = h ? 'pointer' : 'grab'
    })
  }
}
