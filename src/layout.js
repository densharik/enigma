// Machine geometry, ported from enigma-film/scripts/layout.py (Blender meters: x right, y back, z up).
// The current path is built from the same points the film used, so it runs along the real wires of the model.
import { A } from './enigma.js'

export const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML']
const KEY_DX = 0.027
export const AXIS_Y = 0.075, AXIS_Z = 0.062, R_CONTACT = 0.035
export const ROTOR_X = { REF: -0.085, L: -0.055, M: -0.025, R: 0.005, ETW: 0.033 }
const WR = 0.009
const PLUG_OUT = 0.014, FLAP_TOP = 0.0, CABLE_R = 0.0016
const Z_BUS_STUD = 0.067, Z_LINE = 0.0722, Z_LAMP_STUD = 0.0726, Z_BUSBAR = 0.0545, Z_LOOM = 0.025
const YB = -0.162, YB2 = -0.158
const EX = ROTOR_X.ETW + WR + 0.006
export const PLUS_WIRE = [[0.086, 0.0664, 0.088], [0.086, 0.047, 0.088], [0.086, 0.047, 0.05], [0.126, 0.047, 0.05], [0.126, -0.072, 0.05], [0.126, -0.072, Z_BUSBAR]]
export const MINUS_WIRE = [[0.13, -0.0078, 0.0975], [0.13, 0.03, 0.0975], [0.114, 0.03, 0.0975], [0.114, 0.0664, 0.0975], [0.114, 0.0664, 0.088]]
export const PAWL_SWING = -40 * Math.PI / 180
export const LEAF_ANG = Math.asin(0.005 / 0.017)
export const PF = -0.176

function grid(l) {
  for (let r = 0; r < 3; r++) {
    const i = ROWS[r].indexOf(l)
    if (i >= 0) return [r, (i - (ROWS[r].length - 1) / 2) * KEY_DX]
  }
}
export const keyPos = l => { const [r, x] = grid(l); return [x, -0.085 - r * 0.025, 0.12] }
export const lampPos = l => { const [r, x] = grid(l); return [x, -0.012 - r * 0.02, 0.12] }
export const socketPos = l => { const [r, x] = grid(l); return [x, -0.172, 0.075 - r * 0.02] }
export const plugRear = l => { const [x, , z] = socketPos(l); return [x, -0.176 - PLUG_OUT + 0.004, z - 0.0062] }
export const keyAngle = l => 0.005 / Math.abs(keyPos(l)[1] - 0.02)

const bez = (p0, p1, p2, p3, t) => p0.map((_, k) => { const u = 1 - t; return u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k] })

// a cord from plug a to plug b lying on the lowered flap; i = index of the pair, spreads cords apart
export function cablePoints(a, b, i, n = 40) {
  const reach = 0.05 + 0.014 * (i % 4) + 0.006 * Math.floor(i / 4)
  const pa = plugRear(a), pb = plugRear(b)
  const span = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2])
  const drop = 0.05 + 0.35 * span
  const p1 = [pa[0], pa[1] - reach, pa[2] - drop], p2 = [pb[0], pb[1] - reach, pb[2] - drop]
  const pts = []
  for (let k = 0; k <= n; k++) {
    const [x, y, z] = bez(pa, p1, p2, pb, k / n)
    pts.push([x, y, Math.max(z, FLAP_TOP + CABLE_R)])
  }
  return pts
}

export const contactPts = l => {
  const [x, y] = keyPos(l)
  return { front: [x, y - 0.002, Z_LINE], rear: [x, y + 0.015, Z_LINE], bus: [x, y - 0.002, Z_BUS_STUD], lampStud: [x, y - 0.002, Z_LAMP_STUD] }
}
const busbarY = l => keyPos(l)[1] + 0.013
const lampRailY = l => lampPos(l)[1] + 0.0042

export function keyWire(l) {
  const [x, y] = keyPos(l), sz = socketPos(l)[2]
  return [[x, y + 0.015, Z_LINE], [x, y + 0.02, Z_LINE], [x, y + 0.02, Z_LOOM], [x, YB, Z_LOOM], [x, YB, sz + 0.003], [x, -0.1705, sz + 0.003]]
}
export function lampWire(l) {
  const [x, y] = keyPos(l), [lx, ly] = lampPos(l)
  return [[x, y - 0.002, Z_LAMP_STUD + 0.001], [x + 0.004, y - 0.002, Z_LAMP_STUD + 0.001], [x + 0.004, y + 0.02, 0.091], [x + 0.004, ly, 0.091], [lx, ly, 0.091], [lx, ly, 0.097]]
}
export function etwContact(l) {
  const th = 2 * Math.PI * A.indexOf(l) / 26
  return [ROTOR_X.ETW + WR, AXIS_Y + R_CONTACT * Math.sin(th), AXIS_Z + R_CONTACT * Math.cos(th)]
}
export function etwWire(l) {
  const [x, , sz] = socketPos(l), [ex, ey, ez] = etwContact(l)
  const ax = EX + 0.0008 * (A.indexOf(l) % 6)
  return [[x, -0.1705, sz - 0.003], [x, YB2, sz - 0.003], [x, YB2, 0.012], [x, 0.03, 0.012], [ax, 0.03, 0.012], [ax, ey, 0.012], [ax, ey, ez], [ex, ey, ez]]
}
// contact n (machine-fixed position) on the right (side 0) or left (side 1) face of a wheel
export function ringPt(k, side, n) {
  const th = 2 * Math.PI * n / 26
  return [ROTOR_X[k] + (1 - 2 * side) * WR, AXIS_Y + R_CONTACT * Math.sin(th), AXIS_Z + R_CONTACT * Math.cos(th)]
}

/** Segments of the current for one key press, in Blender coordinates.
 *  c = trace().contacts: [key, plug, R, M, L, ref, Lb, Mb, Rb, plugb, lamp]; plug = plug map; pairs = list of 'AB'. */
export function currentPath(c, plug, pairs) {
  const L = i => A[i]
  const [k, p1, r1, m1, l1, rf, l2, m2, r2, p2, lamp] = c
  const key = L(k), out = L(lamp)
  const ct = contactPts(key), cl = contactPts(out)
  const pairIndex = (a, b) => pairs.findIndex(p => p.includes(a) && p.includes(b))
  const [xk] = keyPos(key)
  const ybk = busbarY(key)
  const battery = [...PLUS_WIRE, [0.126, ybk, Z_BUSBAR], [xk, ybk, Z_BUSBAR], [xk, ybk, 0.066], [ct.bus[0], ct.bus[1], 0.066], ct.bus]
  const sk = socketPos(key)
  let toEntry = [ct.bus, ct.rear, ...keyWire(key).slice(1)]
  if (plug[k] !== k) {
    const cp = cablePoints(key, L(p1), pairIndex(key, L(p1)))
    toEntry = [...toEntry, plugRear(key), ...cp, plugRear(L(p1)), ...etwWire(L(p1))]
  } else {
    toEntry = [...toEntry, [sk[0], -0.1775, sk[2] + 0.003], [sk[0], -0.1775, sk[2] - 0.003], ...etwWire(key)]
  }
  const ra = ringPt('REF', 0, l1), rb = ringPt('REF', 0, rf)
  const refMid = [(ra[0] + rb[0]) / 2 - 0.003, (ra[1] + rb[1]) / 2, (ra[2] + rb[2]) / 2]
  const rotorsFwd = [ringPt('ETW', 0, p1), ringPt('ETW', 1, p1), ringPt('R', 0, p1), ringPt('R', 1, r1), ringPt('M', 0, r1), ringPt('M', 1, m1),
    ringPt('L', 0, m1), ringPt('L', 1, l1), ra]
  const rotorsBack = [rb, ringPt('L', 1, rf), ringPt('L', 0, l2), ringPt('M', 1, l2), ringPt('M', 0, m2), ringPt('R', 1, m2), ringPt('R', 0, r2),
    ringPt('ETW', 1, r2), ringPt('ETW', 0, r2)]
  const so = socketPos(out), [lx, ly] = lampPos(out)
  let back = [...etwWire(L(p2))].reverse()
  if (plug[p2] !== p2) {
    const cp = cablePoints(out, L(p2), pairIndex(out, L(p2))).reverse()
    back = [...back, plugRear(L(p2)), ...cp, plugRear(out)]
  } else {
    back = [...back, [so[0], -0.1775, so[2] - 0.003], [so[0], -0.1775, so[2] + 0.003]]
  }
  back = [...back, ...[...keyWire(out)].reverse(), cl.front, cl.lampStud, ...lampWire(out).slice(1), [lx, ly, 0.106]]
  const yrj = lampRailY(out)
  const ret = [[lx, ly, 0.106], [lx, ly, 0.099], [lx, yrj, 0.0975], [0.13, yrj, 0.0975], ...MINUS_WIRE]
  return [
    { name: 'battery', pts: battery, dir: 0 },
    { name: 'entry', pts: toEntry, dir: 0 },
    { name: 'rotors', pts: rotorsFwd, dir: 0 },
    { name: 'reflector', pts: [ra, refMid, rb], dir: 1 },
    { name: 'rotorsBack', pts: rotorsBack, dir: 1 },
    { name: 'lamp', pts: back, dir: 1 },
    { name: 'return', pts: ret, dir: 1 },
  ]
}

// where the HTML labels point (Blender coords)
export const ANCHORS = {
  keyboard: [-0.0945, -0.11, 0.143], lamps: [0.0945, -0.032, 0.1216], rotors: [-0.0515, 0.075, 0.126],
  plugboard: [-0.128, -0.179, 0.06], battery: [0.1, 0.067, 0.1205], reflector: [-0.085, 0.075, 0.11],
  etw: [0.033, 0.075, 0.105], windows: [-0.028, 0.075, 0.121],
}
