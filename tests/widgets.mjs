import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
await p.goto('http://localhost:5198/')
await p.waitForFunction(() => window.__ready)
for (const w of (process.argv[2] || 'rotor,stepping,rings,reflector,diagram,keyspace,crib,sim').split(',')) {
  const el = p.locator(`[data-widget=${w}]`)
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500)
  if (w === 'diagram') { await p.keyboard.press('H'); await p.waitForTimeout(1500) }
  await el.screenshot({ path: `/tmp/es/w_${w}.png` })
}
await b.close()
