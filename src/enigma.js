// Enigma I cipher engine: rotors I-V, reflectors A/B/C, ring settings, plugboard, double stepping.
// Positions and rings are 0..25. trace() returns every contact the current passes, in machine-fixed positions.
export const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const ROTORS = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV: { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V: { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
}
export const REFLECTORS = {
  A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
}
const idx = c => A.indexOf(c)
const mod = n => ((n % 26) + 26) % 26

export function parsePlugs(str) {
  const map = [...Array(26).keys()]
  for (const p of str.toUpperCase().split(/[^A-Z]+/).filter(Boolean)) {
    if (p.length !== 2) continue
    const a = idx(p[0]), b = idx(p[1])
    if (a === b || map[a] !== a || map[b] !== b) continue
    map[a] = b
    map[b] = a
  }
  return map
}

export function plugPairs(map) {
  const out = []
  map.forEach((b, a) => { if (b > a) out.push(A[a] + A[b]) })
  return out
}

export class Enigma {
  constructor({ rotors = ['I', 'II', 'III'], reflector = 'B', rings = [0, 0, 0], positions = [0, 0, 0], plugs = '' } = {}) {
    this.set({ rotors, reflector, rings, positions, plugs })
  }

  set({ rotors, reflector, rings, positions, plugs }) {
    if (rotors) {
      this.rotors = [...rotors]
      this.fwd = rotors.map(r => [...ROTORS[r].wiring].map(idx))
      this.back = this.fwd.map(w => { const b = []; w.forEach((o, i) => { b[o] = i }); return b })
      this.notch = rotors.map(r => idx(ROTORS[r].notch))
    }
    if (reflector) { this.reflector = reflector; this.ref = [...REFLECTORS[reflector]].map(idx) }
    if (rings) this.rings = [...rings]
    if (positions) this.pos = [...positions]
    if (plugs !== undefined) this.plug = Array.isArray(plugs) ? [...plugs] : parsePlugs(plugs)
  }

  state() {
    return { rotors: [...this.rotors], reflector: this.reflector, rings: [...this.rings], positions: [...this.pos], plugs: [...this.plug] }
  }

  // which rotors move on the next key press: [left, middle, right]
  willStep() {
    const [, m, r] = this.pos
    const midAtNotch = m === this.notch[1]
    return [midAtNotch, midAtNotch || r === this.notch[2], true]
  }

  step() {
    const s = this.willStep()
    s.forEach((on, i) => { if (on) this.pos[i] = mod(this.pos[i] + 1) })
    return s
  }

  // one rotor, machine-fixed contact c in -> contact out
  through(i, c, backward) {
    const sh = this.pos[i] - this.rings[i]
    const w = backward ? this.back[i] : this.fwd[i]
    return mod(w[mod(c + sh)] - sh)
  }

  // current path without stepping (for the positions the machine is in now)
  trace(key) {
    const k = typeof key === 'string' ? idx(key) : key
    const p = []
    let c = this.plug[k]
    p.push(['key', k], ['plug', c])
    for (const i of [2, 1, 0]) { c = this.through(i, c, false); p.push(['rotor' + i, c]) }
    c = this.ref[c]
    p.push(['ref', c])
    for (const i of [0, 1, 2]) { c = this.through(i, c, true); p.push(['rotor' + i + 'b', c]) }
    const out = this.plug[c]
    p.push(['plugb', out], ['lamp', out])
    return { out, path: p, contacts: p.map(x => x[1]) }
  }

  press(key) {
    const stepped = this.step()
    const t = this.trace(key)
    return { ...t, stepped, positions: [...this.pos], letter: A[t.out] }
  }

  encode(text) {
    let out = ''
    for (const ch of text.toUpperCase()) if (A.includes(ch)) out += A[this.press(ch).out]
    return out
  }
}

// keyspace factors, exact BigInt arithmetic
export function fact(n) { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r }
export function plugboardWays(pairs) {
  const n = BigInt(pairs)
  return fact(26) / (fact(26 - 2 * pairs) * fact(pairs) * 2n ** n)
}
export function rotorOrders(available, slots = 3) {
  let r = 1n
  for (let i = 0; i < slots; i++) r *= BigInt(available - i)
  return r
}
