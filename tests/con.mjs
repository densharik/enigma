import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__ready)
for (let i = 0; i < 2; i++) { await p.evaluate(() => document.querySelector('[data-widget=reflector] .btn').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1000) }
await p.click('[data-a=test]'); await p.waitForTimeout(1200)
await p.locator('.w-ref').screenshot({ path: '/tmp/es/con_mid.png' })
await p.waitForTimeout(3500)
await p.locator('.w-ref').screenshot({ path: '/tmp/es/con_end.png' })
console.log((await p.textContent('.w-ref .res')).replace(/\s+/g, ' '))
await b.close()
