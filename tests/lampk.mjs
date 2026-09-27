import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__m && window.__m.stage.spins); await p.waitForTimeout(1500)
await p.evaluate(() => { const st = window.__m.stage; st.camera.position.set(0.03, 0.25, 0.13); st.controls.target.set(0.03, 0.12, 0.03); st.camera.lookAt(0.03, 0.12, 0.03); st.dirty = true })
await p.keyboard.down('Q'); await p.waitForTimeout(500)
await p.locator('.stage').screenshot({ path: '/tmp/es/lampk.png' }); await b.close()
