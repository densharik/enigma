import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500)
const f = p.locator('#reflector figure'); await f.scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
await f.screenshot({ path: '/tmp/es/fig07.png' }); await b.close()
