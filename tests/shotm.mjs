import { chromium } from 'playwright-core'
const [, , out, scroll = '', lang = 'ru', type = ''] = process.argv
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: +(process.env.W || 390), height: +(process.env.H || 844) }, deviceScaleFactor: 2, isMobile: !process.env.W, hasTouch: !process.env.W, locale: lang })
await ctx.addInitScript(l => { try { localStorage.setItem('lang', l) } catch {} }, lang)
const p = await ctx.newPage()
p.on('pageerror', e => console.log('pageerror', e.message))
await p.goto('http://localhost:5199/')
await p.waitForFunction(() => window.__ready, null, { timeout: 30000 })
if (scroll) for (let i = 0; i < 2; i++) { await p.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), scroll); await p.waitForTimeout(1000) }
for (const c of type) { await p.keyboard.press(c); await p.waitForTimeout(350) }
await p.waitForTimeout(1200)
await p.screenshot({ path: out })
await b.close()
