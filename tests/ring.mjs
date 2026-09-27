import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__m && window.__m.stage.spins)
for (let i = 0; i < 2; i++) { await p.evaluate(() => document.querySelector('[data-widget=rings]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1200) }
const outs = []
for (const v of [0, 5]) { await p.locator('.w-ring input').fill(String(v)); await p.waitForTimeout(900); outs.push(await p.textContent('.ring-out')); await p.screenshot({ path: `/tmp/es/ring_${v}.png` }) }
console.log(outs.map(o => o.replace(/\s+/g, ' ').slice(0, 90)).join('\n'))
await b.close()
