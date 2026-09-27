import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
await p.goto('http://localhost:5199/'); await p.waitForTimeout(1500)
console.log(await p.evaluate(() => { const w = document.documentElement.clientWidth; return [w, document.documentElement.scrollWidth, [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 8).map(e => e.parentElement.className + '>' + e.textContent.slice(0,20))] }))
await b.close()
