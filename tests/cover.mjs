import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5199/'); await p.waitForFunction(() => window.__m && window.__m.stage.spins)
for (const [id, out] of [['rotors', 'cov_rotors'], ['stepping', 'cov_step']]) {
  for (let i = 0; i < 2; i++) { await p.evaluate(id => document.getElementById(id).scrollIntoView(), id); await p.waitForTimeout(1300) }
  await p.waitForTimeout(800)
  // side look so the cover angle is obvious
  if (id === 'rotors') await p.evaluate(() => { const st = window.__m.stage; st.userMoved = true; st.camera.position.set(0.55, 0.25, 0.05); st.controls.target.set(0, 0.1, -0.03); st.camera.lookAt(0, 0.1, -0.03); st.dirty = true })
  await p.waitForTimeout(500)
  await p.locator('.stage').screenshot({ path: `/tmp/es/${out}.png` })
}
await b.close()
