// render candidate camera views: node tests/views.mjs out.png 'cam;target;xray;cover' ...
import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5199/#stepping')
await p.waitForFunction(() => window.__m && window.__m.stage.spins)
await p.evaluate(() => document.getElementById('stepping').scrollIntoView()); await p.waitForTimeout(2500)
const [, , out, ...views] = process.argv
let i = 0
for (const v of views) {
  const [c, t, x, cov] = v.split(';')
  await p.evaluate(([c, t, x, cov]) => { const st = window.__m.stage; st.userMoved = true
    const V = { cam: [JSON.parse(c), JSON.parse(t)] }; Object.assign(window.__views ||= {}, V)
    st.constructor; st.setXray(+x, 0); st.setCover(!!+cov, 0)
    const b2t = ([x, y, z]) => [x, z, -y]; const pc = b2t(JSON.parse(c)), pt = b2t(JSON.parse(t))
    st.camera.position.set(...pc); st.controls.target.set(...pt); st.camera.lookAt(...pt); st.dirty = true }, [c, t, x, cov])
  await p.waitForTimeout(600)
  await p.locator('.stage').screenshot({ path: out.replace('.png', `_${i++}.png`) })
}
await b.close()
