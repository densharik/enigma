// load the built site from a sub-folder like GitHub Pages, check for failed requests, make the link preview image
import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const url = process.argv[2] || 'http://localhost:5197/enigma/'
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
const bad = [], errs = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
p.on('requestfailed', r => bad.push('failed ' + r.url()))
p.on('pageerror', e => errs.push(e.message))
await p.goto(url); await p.waitForFunction(() => window.__ready, null, { timeout: 30000 }); await p.waitForTimeout(1500)
await p.addStyleTag({ content: '.hint{display:none!important}' })
if (process.argv[3]) await p.screenshot({ path: process.argv[3], type: 'jpeg', quality: 86 })
for (let i = 0; i < 3; i++) { await p.evaluate(() => document.getElementById('sim').scrollIntoView()); await p.waitForTimeout(700) }
console.log('bad requests:', bad.length ? bad.join('\n') : 'none'); console.log('page errors:', errs.length ? errs.join('\n') : 'none')
await b.close()
