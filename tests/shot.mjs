// usage: node tests/shot.mjs <url-path> <out.png> [w h]
import { chromium } from 'playwright-core'
const [, , path, out, w = 1400, h = 900] = process.argv
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
const logs = []
p.on('console', m => logs.push(m.type() + ': ' + m.text()))
p.on('pageerror', e => logs.push('pageerror: ' + e.message))
const t0 = Date.now()
await p.goto('http://localhost:5199/' + path, { waitUntil: 'load' })
await p.waitForFunction(() => document.title === 'READY' || window.__ready, null, { timeout: 30000 }).catch(() => logs.push('timeout waiting READY'))
if (process.env.SCROLL) { await p.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), process.env.SCROLL); await p.waitForTimeout(900); await p.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), process.env.SCROLL); await p.waitForTimeout(1600) }
if (process.env.TYPE) { for (const c of process.env.TYPE) { await p.keyboard.down(c); await p.waitForTimeout(120); await p.keyboard.up(c); await p.waitForTimeout(+(process.env.GAP || 300)) } }
if (process.env.EVAL) await p.evaluate(process.env.EVAL)
await p.waitForTimeout(+(process.env.WAIT || 600))
await p.screenshot({ path: out })
console.log('ms', Date.now() - t0)
console.log(logs.filter(l => !l.includes('GPU stall')).slice(0, 20).join('\n'))
await b.close()
