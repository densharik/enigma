import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } })
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__ready); await p.waitForTimeout(1500)
await p.addStyleTag({ content: '.hud,.hint,.tape{display:none!important}' })
await p.locator('.stage').screenshot({ path: '/tmp/es/poster.png' }); await b.close()
