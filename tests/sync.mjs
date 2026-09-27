// capture the 3D current and the diagram at several moments of one key press
import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__m && window.__m.stage.spins)
for (let i = 0; i < 2; i++) { await p.evaluate(() => document.querySelector('[data-widget=diagram]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1500) }
await p.waitForTimeout(4000)   // let the chapter demo finish
await p.keyboard.down('K'); const t0 = Date.now()
for (const ms of [400, 1000, 1700, 2600, 4000]) {
  await p.waitForTimeout(ms - (Date.now() - t0))
  await p.screenshot({ path: `/tmp/es/sync_${ms}.png` })
}
await p.keyboard.up('K')
console.log(errs.join('\n') || 'no errors')
await b.close()
