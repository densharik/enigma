import '@fontsource-variable/source-serif-4/wght.css'
import '@fontsource-variable/source-serif-4/wght-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './style.css'
import { A } from './enigma.js'
import { Machine } from './machine.js'
import { ANCHORS } from './layout.js'
import { CHAPTERS, FIG_CAPTIONS, FOOTNOTES, UI } from './content.js'
import IMAGES from './images.json'
import { WIDGETS } from './widgets.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const store = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* private mode */ } },
}
const IMG = Object.fromEntries(IMAGES.map(i => [i.slug, i]))

// what the stage does in each chapter
const DIRECT = {
  intro: { view: 'hero' },
  parts: { view: 'overview', labels: ['keyboard', 'lamps', 'rotors', 'plugboard', 'battery'] },
  circuit: { view: 'xray', xray: 1, current: true },
  plugboard: { view: 'plugboard' },
  rotors: { view: 'explode', cover: 1, explode: 1, glass: 1, wiring: true },
  stepping: { view: 'stepping', cover: 1 },
  rings: { view: 'wiring', cover: 1, explode: 1, glass: 1, wiring: true },
  reflector: { view: 'reflector', xray: 1, glass: 1, current: true, labels: ['reflector', 'etw'] },
  path: { view: 'path', xray: 1, glass: 1, current: true },
  key: { view: 'overview' },
  break: { view: 'hero' },
  sim: { view: 'keyboard' },
}

let lang = store.get('lang') || ((navigator.language || 'ru').toLowerCase().startsWith('ru') ? 'ru' : 'en')
const m = new Machine()
const t = () => UI[lang]
let disposers = []
let fnOrder = []
let active = null

// ------------------------------------------------------------------ text
function renderText() {
  document.documentElement.lang = lang
  document.title = t().title
  $$('[data-t]').forEach(el => { el.textContent = t()[el.dataset.t] })
  if (matchMedia('(pointer: coarse)').matches) $('.hint').textContent = t().hintTouch
  const lb = $('.lang')
  lb.textContent = t().lang
  lb.setAttribute('aria-label', t().langLabel)

  disposers.forEach(d => d && d())
  disposers = []
  fnOrder = []
  const chapters = CHAPTERS[lang]
  $('.toc').innerHTML = chapters.filter(c => c.num).map(c => `<a href="#${c.id}" data-id="${c.id}"><span>${c.num}</span><em>${c.title}</em></a>`).join('')
  const box = $('.chapters')
  box.innerHTML = chapters.map(c => `<section class="chapter" id="${c.id}" data-id="${c.id}">
    ${c.num ? `<div class="ch-num">${c.num}<span>/ 11</span></div>` : `<div class="kicker">${c.kicker}</div>`}
    <h${c.num ? 2 : 1}>${c.title}</h${c.num ? 2 : 1}>
    <div class="body">${c.body}</div></section>`).join('')
  $$('[data-t]', box).forEach(el => { el.textContent = t()[el.dataset.t] })
  // footnotes numbered by first appearance
  $$('sup[data-fn]', box).forEach(s => {
    const id = s.dataset.fn
    if (!fnOrder.includes(id)) fnOrder.push(id)
    const n = fnOrder.indexOf(id) + 1
    s.innerHTML = `<button type="button" class="fn" aria-label="${t().footnote} ${n}">${n}</button>`
  })
  $$('figure[data-img]', box).forEach(f => {
    const im = IMG[f.dataset.img]
    if (!im) return
    const cap = FIG_CAPTIONS[im.slug]?.[lang] || (lang === 'ru' ? im.title_ru : im.title_en)
    f.innerHTML = `<img src="img/${im.slug}.webp" alt="${cap.replace(/"/g, '&quot;')}" width="${im.width}" height="${im.height}" style="aspect-ratio:${im.width}/${im.height}" loading="lazy" decoding="async">
      <figcaption>${cap} <a href="${im.source_page}" target="_blank" rel="noopener">${t().photo}: ${im.author}, ${im.license}</a></figcaption>`
  })
  $$('[data-widget]', box).forEach(el => {
    const w = WIDGETS[el.dataset.widget]
    if (w) disposers.push(w(el, { m, t, lang }))
  })
  $$('li[data-part]', box).forEach(li => {
    li.addEventListener('mouseenter', () => highlightLabel(li.dataset.part))
    li.addEventListener('mouseleave', () => highlightLabel(null))
    li.addEventListener('click', () => highlightLabel(li.dataset.part))
  })
  renderSources()
  renderTape()
  renderWindows()
  observe()
  if (active) { const a = active; active = null; activate(a) }
}

function renderSources() {
  const fns = fnOrder.map((id, i) => {
    const f = FOOTNOTES[id]
    return `<li id="fn-${id}"><span class="n">${i + 1}</span><p>${f[lang]} ${f.src.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${l}</a>`).join(' ')}</p></li>`
  }).join('')
  const imgs = IMAGES.map(i => `<li><a href="${i.source_page}" target="_blank" rel="noopener">${lang === 'ru' ? i.title_ru : i.title_en}</a>, ${i.author}, <a href="${i.license_url}" target="_blank" rel="noopener">${i.license}</a></li>`).join('')
  const about = lang === 'ru'
    ? 'Модель построена в Blender скриптами по фотографиям и схемам настоящей Энигмы I, упрощена для браузера. Шифр считается тем же алгоритмом, что и в машине, и проверен на настоящей радиограмме 1941 года. Фотографии с Wikimedia Commons, под свободными лицензиями.'
    : 'The model was built in Blender with scripts from photos and circuit diagrams of a real Enigma I, simplified for the browser. The cipher runs the same algorithm as the machine and is checked against a real 1941 radio message. Photos are from Wikimedia Commons under free licences.'
  $('.sources').innerHTML = `<div class="src-inner"><h2>${t().sources}</h2><p class="about">${about}</p>
    <ol class="fnlist">${fns}</ol><h3>${lang === 'ru' ? 'Изображения' : 'Images'}</h3><ul class="imglist">${imgs}</ul></div>`
}

// ------------------------------------------------------------------ footnote popover
const pop = $('.pop')
document.addEventListener('click', e => {
  const b = e.target.closest('button.fn')
  if (b) {
    const id = b.closest('sup').dataset.fn
    const f = FOOTNOTES[id]
    const n = fnOrder.indexOf(id) + 1
    const im = f.img && IMG[f.img]
    pop.innerHTML = `<div class="pop-head"><span>${t().footnote} ${n}</span><button type="button" class="pop-x" aria-label="${t().close}">&times;</button></div>
      ${im ? `<img src="img/${im.slug}.webp" alt="" loading="lazy">` : ''}
      <p>${f[lang]}</p>
      <div class="pop-src">${f.src.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${l}</a>`).join('')}</div>
      ${im ? `<div class="pop-credit">${t().photo}: <a href="${im.source_page}" target="_blank" rel="noopener">${im.author}, ${im.license}</a></div>` : ''}`
    pop.hidden = false
    const r = b.getBoundingClientRect()
    const w = Math.min(360, innerWidth - 24)
    pop.style.width = w + 'px'
    if (innerWidth < 760) { pop.classList.add('sheet'); pop.style.left = pop.style.top = '' } else {
      pop.classList.remove('sheet')
      pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left - w / 2)) + 'px'
      const h = pop.offsetHeight
      pop.style.top = (r.bottom + h + 16 < innerHeight ? r.bottom + 8 : Math.max(12, r.top - h - 8)) + 'px'
    }
    return
  }
  if (e.target.closest('.pop-x') || (!e.target.closest('.pop') && !pop.hidden)) pop.hidden = true
})
addEventListener('scroll', () => { if (!pop.hidden && !pop.classList.contains('sheet')) pop.hidden = true }, { passive: true })

// ------------------------------------------------------------------ stage, tape, rotor windows, labels
const stageEl = $('.stage')
let stage = null
function renderTape() {
  const g = s => s.slice(-60).replace(/(.{5})/g, '$1 ').trim()
  $('.tape .in').textContent = g(m.tape.in)
  $('.tape .out').textContent = g(m.tape.out)
  $('.tape').classList.toggle('empty', !m.tape.in)
}

function renderWindows() {
  const w = $('.windows')
  const s = m.e
  w.innerHTML = [0, 1, 2].map(i => `<div class="win" data-i="${i}">
    <button type="button" class="w-up" aria-label="+">&#9650;</button>
    <span class="w-l">${A[s.pos[i]]}</span>
    <span class="w-r">${s.rotors[i]}</span>
    <button type="button" class="w-dn" aria-label="-">&#9660;</button></div>`).join('')
}
$('.windows').addEventListener('click', e => {
  const b = e.target.closest('button')
  if (!b) return
  const i = +b.closest('.win').dataset.i
  const pos = [...m.e.pos]
  pos[i] = (pos[i] + (b.classList.contains('w-up') ? 1 : 25)) % 26
  m.configure({ positions: pos }, { animate: 260 })
})

const labelsEl = $('.labels')
let labelSet = []
function setLabels(list) {
  labelSet = list || []
  const names = lang === 'ru'
    ? { keyboard: 'Клавиатура', lamps: 'Лампы', rotors: 'Роторы', plugboard: 'Коммутационная панель', battery: 'Батарея 4,5 В', reflector: 'Отражатель', etw: 'Входное колесо', windows: 'Окна' }
    : { keyboard: 'Keyboard', lamps: 'Lamps', rotors: 'Rotors', plugboard: 'Plugboard', battery: 'Battery 4.5 V', reflector: 'Reflector', etw: 'Entry wheel', windows: 'Windows' }
  labelsEl.innerHTML = labelSet.map(k => `<div class="lbl" data-k="${k}"><i></i><span>${names[k]}</span></div>`).join('')
  placeLabels()
}
function placeLabels() {
  if (!stage || !labelSet.length) return
  for (const el of labelsEl.children) {
    const p = stage.project(ANCHORS[el.dataset.k])
    el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`
    el.classList.toggle('left', p.x > stageEl.clientWidth * 0.62)
  }
}
function highlightLabel(k) {
  for (const el of labelsEl.children) el.classList.toggle('on', el.dataset.k === k)
  labelsEl.classList.toggle('dim', !!k)
}

m.on((type) => {
  if (type === 'press' || type === 'tape') renderTape()
  if (type === 'press' || type === 'config') renderWindows()
  if (type === 'press') $('.hint').classList.add('gone')
})
// on-screen keyboard for touch screens, where the 3D keys are too small for a finger
const vk = $('.vkbd')
vk.innerHTML = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'].map(r => `<div>${[...r].map(l => `<button type="button" data-l="${l}">${l}</button>`).join('')}</div>`).join('')
// several fingers at once: each pointer remembers its own letter
const touches = new Map()
vk.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-l]')
  if (!b) return
  e.preventDefault()
  touches.set(e.pointerId, b.dataset.l)
  m.keyDown(b.dataset.l)
})
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) {
  vk.addEventListener(ev, e => { const l = touches.get(e.pointerId); if (l) { touches.delete(e.pointerId); m.keyUp(l) } })
}
$('.kbd-toggle').addEventListener('click', () => { vk.hidden = !vk.hidden; stageEl.classList.toggle('kbd', !vk.hidden) })
m.on((type, d) => {
  if (type === 'press') vk.querySelectorAll('button').forEach(b => { b.classList.toggle('in', b.dataset.l === d.key); b.classList.toggle('out', b.dataset.l === d.letter) })
})
$('.tape-clear').addEventListener('click', () => m.clearTape())
$('.reset-view').addEventListener('click', () => { if (stage && active) { stage.setView(DIRECT[active].view, 900); stageEl.classList.remove('moved') } })

async function boot() {
  const probe = document.createElement('canvas')
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { stageEl.classList.add('nogl'); return }
  const { Stage } = await import('./scene3d.js')
  stage = new Stage($('#gl'), {
    onReady: () => {
      m.stage = stage
      m.syncStage()
      stageEl.classList.add('ready')
      if (active) { const a = active; active = null; activate(a) }
      window.__ready = true
      window.__m = m
    },
    onKey: l => m.tap(l),
    onThumb: (k, d) => {
      const i = 'LMR'.indexOf(k), pos = [...m.e.pos]
      pos[i] = (pos[i] + d + 26) % 26
      m.configure({ positions: pos }, { animate: 260 })
    },
  })
  stage.onFrame = placeLabels
  // the button to go back to the chapter's view only makes sense once the user has turned the machine
  stage.controls.addEventListener('start', () => stageEl.classList.add('moved'))
  stage.onPathProgress = (i, u) => m.emit('pathprog', { i, u })
  new IntersectionObserver(([e]) => { stage.visible = e.isIntersecting; stage.dirty = true }).observe(stageEl)
}

// ------------------------------------------------------------------ chapters drive the stage
function activate(id) {
  if (id === active) return
  active = id
  $$('.toc a').forEach(a => a.classList.toggle('on', a.dataset.id === id))
  $$('.chapter').forEach(s => s.classList.toggle('active', s.dataset.id === id))
  const ch = CHAPTERS[lang].find(c => c.id === id)
  $('.now').textContent = ch && ch.num ? `${ch.num} / 11` : ''
  const d = DIRECT[id]
  setLabels(d.labels)
  if (!stage || !stage.spins) return
  stage.userMoved = false
  stageEl.classList.remove('moved')
  stage.setView(d.view)
  stage.setXray(d.xray || 0)
  stage.setCover(!!d.cover)
  stage.setExplode(d.explode || 0)
  stage.setGlass(d.glass || 0)
  stage.showWiring(d.wiring ? 'R' : null, m.e.rotors[2])
  m.showCurrent = !!d.current
  if (!d.current) { stage.clearPath(); stage.lamp(null, false) }
  stageEl.dataset.chapter = id
  // show the current once by itself, so the chapter is not a still picture
  clearTimeout(demoTimer)
  if (d.current && !demoed.has(id)) {
    demoed.add(id)
    demoTimer = setTimeout(() => { if (active === id && !m.down) m.tap('H') }, 1400)
  }
}
const demoed = new Set()
let demoTimer

let io
function observe() {
  io && io.disconnect()
  io = new IntersectionObserver(entries => {
    const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (vis.length) activate(vis[0].target.dataset.id)
  }, { rootMargin: '-45% 0px -54% 0px' })
  $$('.chapter').forEach(s => io.observe(s))
}

// ------------------------------------------------------------------ physical keyboard
// the typed Latin letter; with a non-Latin layout (Russian) fall back to the key position
const letterOf = e => (/^[a-z]$/i.test(e.key) ? e.key.toUpperCase() : (e.code.match(/^Key([A-Z])$/) || [])[1])
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return
  const l = letterOf(e)
  if (!l) return
  e.preventDefault()
  if (!e.repeat) m.keyDown(l)
})
addEventListener('keyup', e => { const l = letterOf(e); if (l) m.keyUp(l) })
addEventListener('blur', () => m.releaseAll())
document.addEventListener('visibilitychange', () => { if (document.hidden) m.releaseAll() })

// mashing several keys: say once that the machine takes one key at a time
let toastTimer
m.on(type => {
  if (type !== 'blocked') return
  const h = $('.hint')
  h.textContent = t().oneKey
  h.classList.remove('gone')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => h.classList.add('gone'), 1800)
})

$('.lang').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru'
  store.set('lang', lang)
  renderText()
})

renderText()
activate('intro')
boot()
