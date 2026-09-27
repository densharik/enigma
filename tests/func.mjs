import { chromium } from 'playwright-core'
const exe = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => { try { localStorage.setItem('lang', 'ru') } catch {} })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:5198/')
await p.waitForFunction(() => window.__ready)
const ok = (n, c, v) => console.log(c ? 'OK  ' : 'FAIL', n, v ?? '')
// plugboard: reset, then connect Q-W
await p.locator('#plugboard').scrollIntoViewIfNeeded()
await p.click('.w-plug [data-a=reset]')
await p.click('.w-plug .sock[aria-label=Q]'); await p.click('.w-plug .sock[aria-label=W]')
ok('plug pair', (await p.textContent('.w-plug .w-note')).trim() === 'QW', await p.textContent('.w-plug .w-note'))
// footnote
await p.click('#plugboard sup button.fn')
ok('popover', await p.isVisible('.pop'), (await p.textContent('.pop p')).slice(0, 40))
await p.keyboard.press('Escape'); await p.mouse.click(300, 300)
// stepping double step
await p.locator('#stepping').scrollIntoViewIfNeeded()
await p.click('.w-step [data-a=double]')
await p.waitForTimeout(4200)
const log = await p.$$eval('.w-step .log li', ls => ls.map(l => l.textContent))
ok('double step log', log.join('|').includes('AEW') && log.join('|').includes('BFX'), log.join(' | '))
// sim barbarossa
await p.locator('#sim').scrollIntoViewIfNeeded()
await p.click('.w-sim [data-p=barbarossa]')
const out = await p.textContent('.w-sim .out')
ok('barbarossa', out.replace(/ /g, '').startsWith('AUFKLXABTEILUNGXVONXKURTINOWA'), out.slice(0, 40))
await p.click('.w-sim [data-a=swap]')
ok('swap back', (await p.textContent('.w-sim .out')).replace(/ /g, '').startsWith('EDPUDNRGYS'))
// typing into textarea animates the machine
await p.click('.w-sim [data-p=demo]')
ok('demo', (await p.textContent('.w-sim .out')).trim() === 'JIWOQ', await p.textContent('.w-sim .out'))
// crib
await p.locator('#break').scrollIntoViewIfNeeded()
ok('crib summary', /осталось/.test(await p.textContent('.w-crib .sum')), await p.textContent('.w-crib .sum'))
// keyspace default
ok('keyspace', (await p.textContent('.w-keys .total b')).replace(/\s/g, '') === '158962555217826360000', await p.textContent('.w-keys .total b'))
// review scenarios: plugboard pick highlight clears
await p.locator('#plugboard').scrollIntoViewIfNeeded()
await p.click('.w-plug [data-a=reset]')
await p.click('.w-plug .sock[aria-label=E]')
const picked = await p.$$eval('.w-plug .sock.pick', n => n.map(x => x.getAttribute('aria-label')).join(''))
await p.click('.w-plug .sock[aria-label=E]')
const after = await p.$$eval('.w-plug .sock.pick', n => n.map(x => x.getAttribute('aria-label')).join(''))
ok('pick highlight cleared', picked === 'E' && after === '', `${picked} -> ${after}`)
// sim: change the machine elsewhere, then type in the sim: lamp letter must equal the sim output
await p.click('.w-plug [data-a=rand]')
await p.locator('#sim').scrollIntoViewIfNeeded()
await p.fill('.w-sim textarea', 'HELL'); await p.waitForTimeout(300)
await p.locator('#plugboard').scrollIntoViewIfNeeded(); await p.click('.w-plug [data-a=rand]')
await p.locator('#sim').scrollIntoViewIfNeeded()
await p.click('.w-sim textarea'); await p.keyboard.press('End'); await p.keyboard.type('O'); await p.waitForTimeout(900)
const simOut = (await p.textContent('.w-sim .out')).replace(/ /g, '')
const lampOut = await p.evaluate(() => window.__m.tape.out.at(-1))
ok('sim and machine agree after outside change', simOut.at(-1) === lampOut, `${simOut.at(-1)} vs ${lampOut}`)
// sim: choosing a rotor that is already used on the left swaps them
await p.selectOption('.w-sim [data-s=rot][data-i="0"]', 'I'); await p.selectOption('.w-sim [data-s=rot][data-i="1"]', 'II'); await p.selectOption('.w-sim [data-s=rot][data-i="2"]', 'III')
await p.selectOption('.w-sim [data-s=rot][data-i="2"]', 'I')
const rots = await p.$$eval('.w-sim [data-s=rot]', s => s.map(x => x.value).join(' '))
ok('rotor swap', rots === 'III II I', rots)
// language switch keeps working and keeps the sim text
await p.fill('.w-sim textarea', 'ENIGMA')
await p.click('.lang')
ok('lang en', (await p.textContent('#intro h1')).trim() === 'Enigma')
ok('sim text kept', (await p.inputValue('.w-sim textarea')) === 'ENIGMA', await p.inputValue('.w-sim textarea'))
ok('no page errors', errs.length === 0, errs.join('; '))
await b.close()
