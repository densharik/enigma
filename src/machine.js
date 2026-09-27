// One machine for the whole page: the cipher engine, the 3D stage and every widget listen to it.
// Input goes through one queue, like the real keyboard: one key at a time. A key pressed while another is down
// waits for its turn, so fast typing with overlapping keys keeps every letter. Mashing: a fourth key held at the
// same time is ignored.
import { A, Enigma, plugPairs } from './enigma.js'
import { currentPath } from './layout.js'

const HOLD = 110          // shortest visible key travel, ms
const GAP = 40            // pause between two queued presses
const MAX_HELD = 3        // keys held at the same time; more is mashing, not typing
const MAX_QUEUE = 24

export class Machine {
  constructor() {
    this.e = new Enigma({ plugs: 'HX AV BS CG DL FU IN KM OW RZ' })
    this.listeners = new Set()
    this.stage = null
    this.showCurrent = false
    this.current = null      // { l, t0, auto } the key whose press is running
    this.queue = []
    this.phys = new Set()    // keys physically held (keyboard, touch)
    this.timer = 0
    this.lastPress = 0
    this.tape = { in: '', out: '' }
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  emit(type, data) { for (const fn of this.listeners) fn(type, data, this) }

  get pairs() { return plugPairs(this.e.plug) }
  get down() { return this.current ? this.current.l : null }

  // change any settings; rotors turn in 3D. Waiting presses belong to the old settings, so they are dropped.
  configure(s, { animate = 300 } = {}) {
    this.queue = []
    clearTimeout(this.pathTimer)
    const pairsBefore = this.pairs.join(' ')
    this.e.set(s)
    if (this.stage && this.stage.spins) {
      this.stage.setRotors(this.e.pos, this.e.rings, this.e.rotors, animate)
      if (this.pairs.join(' ') !== pairsBefore) this.stage.setCords(this.pairs)
      // the old current belongs to the old settings
      this.stage.clearPath()
      if (!this.current) this.stage.lamp(null, false)
    }
    this.emit('config', this.e.state())
  }

  syncStage() {
    const st = this.stage
    st.setRotors(this.e.pos, this.e.rings, this.e.rotors, 0)
    st.setCords(this.pairs)
  }

  // ---------------------------------------------------------------- input
  keyDown(l) {
    l = l.toUpperCase()
    if (!A.includes(l) || this.phys.has(l)) return
    if (this.phys.size >= MAX_HELD || this.queue.length >= MAX_QUEUE) { this.emit('blocked', { key: l }); return }
    this.phys.add(l)
    if (!this.current && !this.queue.length && !this.timer) return this.start({ l, auto: false })
    this.queue.push({ l, auto: false })
  }

  keyUp(l) {
    l = l.toUpperCase()
    this.phys.delete(l)
    if (this.current && this.current.l === l && !this.current.auto) this.scheduleEnd()
  }

  // lost focus: keyup events will never come, so let go of everything
  releaseAll() {
    this.phys.clear()
    this.queue = this.queue.filter(q => q.auto)
    if (this.current && !this.current.auto) this.scheduleEnd()
  }

  // a click, a widget button or a program: press and let go by itself, never dropped
  tap(l) {
    l = l.toUpperCase()
    if (!A.includes(l)) return
    if (!this.current && !this.queue.length && !this.timer) this.start({ l, auto: true })
    else this.queue.push({ l, auto: true })
  }

  start(item) {
    this.current = { ...item, t0: performance.now() }
    this.fire(item.l)
    // a queued key that was already let go, or a tap, ends by itself
    if (item.auto || !this.phys.has(item.l)) this.scheduleEnd()
  }

  scheduleEnd() {
    const c = this.current
    if (!c || c.ending) return
    c.ending = true
    // a long queue plays faster, so the machine catches up with a fast typist
    const busy = this.queue.length > 0
    const hold = c.auto && !busy ? (this.showCurrent ? 700 : 300) : this.queue.length > 2 ? 50 : HOLD
    const wait = Math.max(0, c.t0 + hold - performance.now())
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.end(), wait)
  }

  end() {
    const c = this.current
    this.current = null
    if (c) {
      if (this.stage && this.stage.spins) {
        this.stage.release(c.l)
        if (!this.showCurrent) this.stage.lamp(null, false)
      }
      this.emit('release', { key: c.l })
    }
    this.timer = setTimeout(() => {
      this.timer = 0
      const next = this.queue.shift()
      if (next) this.start(next)
    }, this.queue.length > 2 ? 15 : this.queue.length ? GAP : 0)
  }

  // ---------------------------------------------------------------- one key press: engine, 3D, widgets
  fire(letter) {
    const now = performance.now()
    const fast = now - this.lastPress < 260 || this.queue.length > 0
    this.lastPress = now
    const r = this.e.press(letter)
    this.tape.in += letter
    this.tape.out += r.letter
    const st = this.stage
    // the diagram follows the 3D current step by step only when the current is animated
    r.animated = !!(st && st.spins && this.showCurrent && !fast)
    if (st && st.spins) {
      st.press(letter, r.positions, this.e.rings, fast ? 80 : 170)
      clearTimeout(this.pathTimer)
      if (this.showCurrent) {
        const segs = currentPath(r.contacts, this.e.plug, this.pairs)
        if (fast) {
          // typing fast: no animation, and only the last letter's path is built once the keys go quiet
          st.clearPath()
          st.lamp(r.letter, true)
          this.pathTimer = setTimeout(() => st.showPath(segs, { speed: 100 }), 140)
        } else {
          st.lamp(null, false)
          st.showPath(segs).then(done => { if (done) st.lamp(r.letter, true) })
        }
      } else st.lamp(r.letter, true)
    }
    this.emit('press', { key: letter, ...r })
    return r
  }

  clearTape() {
    this.tape = { in: '', out: '' }
    this.emit('tape', this.tape)
  }
}
