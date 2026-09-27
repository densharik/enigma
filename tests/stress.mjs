// hammer the keyboard: fast overlapping typing, chords, a lost keyup (blur); then check nothing is stuck
import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:' + (process.env.PORT || 5199) + '/')
await p.waitForFunction(() => window.__m && window.__m.stage.spins)
const ok = (n, c, v) => console.log(c ? 'OK  ' : 'FAIL', n, v ?? '')
const state = () => p.evaluate(() => {
  const m = window.__m, st = m.stage
  const stuck = Object.entries(st.keys).filter(([, k]) => Math.abs(k.rotation.x) > 1e-4).map(([l]) => l)
  const leaves = Object.keys(st.keys).filter(l => Math.abs(st.nodes['KeyLeaf_' + l].rotation.x) > 1e-4)
  return { tape: m.tape.in.length, stuck, leaves, bar: st.barU, down: m.down, queue: m.queue.length, pos: m.e.pos.join(','), tweens: st.tweens.length }
})
const fps = () => p.evaluate(() => new Promise(r => { const t = []; let l = performance.now(); const f = n => { t.push(n - l); l = n; t.length < 90 ? requestAnimationFrame(f) : r(t.sort((a, b) => a - b)[85].toFixed(1)) }; requestAnimationFrame(f) }))

for (const chapter of ['intro', 'circuit']) {
  await p.evaluate(id => document.getElementById(id).scrollIntoView(), chapter); await p.waitForTimeout(1600)
  await p.evaluate(() => { window.__m.clearTape(); window.__m.configure({ positions: [0, 0, 0] }, { animate: 0 }) }); await p.waitForTimeout(3000)
  // 1. fast overlapping typing: next key goes down 25 ms before the previous goes up
  const word = 'THEQUICKBROWNFOXJUMPSOVERLAZYDOG'
  for (let i = 0; i < word.length; i++) {
    await p.keyboard.down(word[i]); await p.waitForTimeout(35)
    if (i) await p.keyboard.up(word[i - 1])
    await p.waitForTimeout(25)
  }
  await p.keyboard.up(word.at(-1))
  const f1 = fps()
  await p.waitForTimeout(3000)
  let s = await state()
  ok(`${chapter}: fast rollover, every letter typed`, s.tape === word.length, `${s.tape}/${word.length}`)
  ok(`${chapter}: frames p95 ms during typing`, true, await f1)
  // 2. chord: six keys down at once, then all up
  const before = s.tape
  for (const c of 'ASDFGH') await p.keyboard.down(c)
  await p.waitForTimeout(200)
  for (const c of 'ASDFGH') await p.keyboard.up(c)
  await p.waitForTimeout(2500)
  s = await state()
  ok(`${chapter}: chord of 6 -> one pressed + 2 waiting`, s.tape - before === 3, s.tape - before)
  // 3. key held while the window loses focus: keyup never arrives
  await p.keyboard.down('K'); await p.waitForTimeout(150)
  await p.evaluate(() => dispatchEvent(new Event('blur')))
  await p.waitForTimeout(1500)
  await p.keyboard.up('K')
  await p.keyboard.press('K'); await p.waitForTimeout(1500)
  s = await state()
  ok(`${chapter}: K works again after lost keyup`, s.tape - before === 5, s.tape - before)
  ok(`${chapter}: nothing stuck`, !s.stuck.length && !s.leaves.length && s.bar < 1e-3 && !s.down && !s.queue, JSON.stringify(s))
  // 4. engine and machine agree: rotor position = number of presses from AAA
  const n = s.tape
  const expect = await p.evaluate(async n => { const { Enigma } = await import('/src/enigma.js'); const e = new Enigma({ plugs: 'HX AV BS CG DL FU IN KM OW RZ' }); for (let i = 0; i < n; i++) e.press('A'); return e.pos.join(',') }, n)
  ok(`${chapter}: rotor position matches ${n} presses`, s.pos === expect, `${s.pos} vs ${expect}`)
}
ok('no page errors', !errs.length, errs.join('; '))
await b.close()
