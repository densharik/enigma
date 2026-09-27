import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const [w, h, dpr] = (process.env.VP || '1440x900x2').split('x').map(Number)
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr })
const t0 = Date.now()
await p.goto('http://localhost:5198/')
await p.waitForFunction(() => window.__ready, null, { timeout: 30000 })
console.log('ready ms', Date.now() - t0)
const res = await p.evaluate(async () => {
  const st = document.querySelector('#gl') && window
  const out = {}
  const measure = async (name, fn, ms = 2500) => {
    const times = []; let last = performance.now(); let run = true
    const loop = t => { times.push(t - last); last = t; if (run) requestAnimationFrame(loop) }
    requestAnimationFrame(loop); fn(); await new Promise(r => setTimeout(r, ms)); run = false
    times.sort((a, b) => a - b)
    out[name] = { frames: times.length, p50: +times[times.length >> 1].toFixed(1), p95: +times[Math.floor(times.length * 0.95)].toFixed(1) }
  }
  for (const id of ['circuit', 'rotors', 'path', 'sim']) {
    await measure(id, () => document.getElementById(id).scrollIntoView())
  }
  return out
})
console.log(JSON.stringify(res))
const info = await p.evaluate(() => { const r = document.querySelector('#gl'); return performance.getEntriesByType('resource').filter(e => /glb|webp|js$/.test(e.name)).map(e => [e.name.split('/').pop(), Math.round(e.duration)]) })
console.log(JSON.stringify(info))
await b.close()
