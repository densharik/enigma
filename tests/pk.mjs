import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5198/'); await p.waitForFunction(() => window.__ready)
await p.locator('#plugboard').scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
const st = () => p.$$eval('.w-plug .sock.pick', n => n.map(x => x.getAttribute('aria-label')))
await p.click('.w-plug .sock[aria-label=E]'); console.log('after 1', await st())
await p.click('.w-plug .sock[aria-label=E]'); console.log('after 2', await st())
await p.click('.w-plug .sock[aria-label=E]'); await p.click('.w-plug [data-a=reset]'); console.log('after reset', await st())
await b.close()
