// Interactive widgets placed inside the chapters. Each one takes (el, { m, t, lang }) and returns a disposer.
import { A, Enigma, REFLECTORS, ROTORS, parsePlugs, plugPairs, plugboardWays, rotorOrders } from './enigma.js'
import { ROWS } from './layout.js'

const NS = 'http://www.w3.org/2000/svg'
const svg = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag)
  for (const k in attrs) e.setAttribute(k, attrs[k])
  if (parent) parent.appendChild(e)
  return e
}
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild }
const mod = n => ((n % 26) + 26) % 26
const TYPES = Object.keys(ROTORS)
const pad = n => String(n + 1).padStart(2, '0')

// ------------------------------------------------------------------ plugboard
function plugboard(el, { m, t }) {
  const W = 520, H = 230
  el.className = 'widget w-plug'
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="pb" role="group"></svg>
    <div class="w-row"><span class="w-stat"></span><span class="w-grow"></span>
    <button type="button" class="btn" data-a="rand">${t().random}</button><button type="button" class="btn ghost" data-a="reset">${t().reset}</button></div>
    <p class="w-note"></p>`
  const s = el.querySelector('svg')
  const pos = {}
  ROWS.forEach((row, r) => [...row].forEach((l, i) => { pos[l] = [W / 2 + (i - (row.length - 1) / 2) * 54, 34 + r * 58] }))
  const cables = svg('g', { class: 'cables' }, s)
  const nodes = {}
  for (const l of A) {
    const [x, y] = pos[l]
    const g = svg('g', { class: 'sock', transform: `translate(${x},${y})`, tabindex: 0, role: 'button', 'aria-label': l }, s)
    svg('text', { x: 0, y: -15, class: 'sl' }, g).textContent = l
    svg('rect', { x: -13, y: -9, width: 26, height: 30, rx: 3, class: 'plate' }, g)
    svg('circle', { cx: 0, cy: 0, r: 3.6, class: 'hole' }, g)
    svg('circle', { cx: 0, cy: 11, r: 2.6, class: 'hole' }, g)
    nodes[l] = g
  }
  let pick = null
  const draw = () => {
    const pairs = m.pairs
    cables.innerHTML = ''
    for (const l of A) nodes[l].classList.toggle('plugged', m.e.plug[A.indexOf(l)] !== A.indexOf(l))
    pairs.forEach(p => {
      const [x1, y1] = pos[p[0]], [x2, y2] = pos[p[1]]
      const d = Math.hypot(x2 - x1, y2 - y1)
      const cy = Math.max(y1, y2) + 34 + d * 0.18
      svg('path', { d: `M${x1},${y1 + 22} C${x1},${cy} ${x2},${cy} ${x2},${y2 + 22}`, class: 'cable', 'data-p': p }, cables)
    })
    el.querySelector('.w-stat').textContent = t().pairsCount(pairs.length)
    el.querySelector('.w-note').textContent = pairs.length ? pairs.join('  ') : ''
    for (const l of A) nodes[l].classList.toggle('pick', l === pick)
  }
  const setPairs = pairs => m.configure({ plugs: pairs.join(' ') })
  const click = l => {
    const i = A.indexOf(l)
    const pairs = m.pairs
    if (m.e.plug[i] !== i) { setPairs(pairs.filter(p => !p.includes(l))); pick = null; return }
    if (!pick) { pick = l; draw(); return }
    if (pick === l) { pick = null; draw(); return }
    if (pairs.length >= 13) return
    nodes[pick].classList.remove('pick')
    setPairs([...pairs, pick + l])
    pick = null
  }
  s.addEventListener('click', e => { const g = e.target.closest('.sock'); if (g) click(g.getAttribute('aria-label')) })
  s.addEventListener('keydown', e => { const g = e.target.closest('.sock'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); click(g.getAttribute('aria-label')) } })
  el.querySelector('[data-a=rand]').onclick = () => {
    const l = [...A].sort(() => Math.random() - 0.5)
    setPairs(Array.from({ length: 10 }, (_, i) => l[2 * i] + l[2 * i + 1]))
  }
  el.querySelector('[data-a=reset]').onclick = () => { pick = null; setPairs([]) }
  const off = m.on((type, d) => {
    if (type === 'config') draw()
    if (type === 'press') {
      for (const l of A) nodes[l].classList.remove('hot', 'hot2')
      nodes[d.key].classList.add('hot')
      nodes[A[d.contacts[1]]].classList.add('hot')
      nodes[A[d.out]].classList.add('hot2')
      nodes[A[d.contacts[9]]].classList.add('hot2')
    }
  })
  draw()
  return off
}

// ------------------------------------------------------------------ one rotor's wiring (the machine's right rotor)
function rotor(el, { m, t }) {
  el.className = 'widget w-rotor'
  el.innerHTML = `<div class="w-row"><div class="tabs" role="tablist">${TYPES.map(r => `<button type="button" role="tab" data-r="${r}">${r}</button>`).join('')}</div>
    <span class="w-grow"></span><span class="w-lbl">${t().position}</span>
    <button type="button" class="btn sq" data-d="-1" aria-label="-1">&minus;</button><b class="w-pos"></b><button type="button" class="btn sq" data-d="1" aria-label="+1">+</button></div>
    <svg viewBox="0 0 520 460" class="rw"></svg><p class="w-note">${t().wiringHint}</p>`
  const s = el.querySelector('svg')
  const XR = 380, XL = 140, Y = i => 30 + i * 16
  svg('text', { x: XR + 22, y: 12, class: 'cap mid' }, s).textContent = t().rotorIn
  svg('text', { x: XL - 22, y: 12, class: 'cap mid' }, s).textContent = t().rotorOut
  const wires = svg('g', {}, s)
  const labs = svg('g', {}, s)
  const rl = [], ll = [], wl = []
  for (let i = 0; i < 26; i++) {
    const a = svg('text', { x: XR + 22, y: Y(i) + 4, class: 'rl', 'data-i': i }, labs); a.textContent = A[i]; rl.push(a)
    const b = svg('text', { x: XL - 22, y: Y(i) + 4, class: 'rl end', 'data-o': i }, labs); b.textContent = A[i]; ll.push(b)
    svg('circle', { cx: XR, cy: Y(i), r: 3, class: 'ct' }, labs)
    svg('circle', { cx: XL, cy: Y(i), r: 3, class: 'ct' }, labs)
  }
  svg('rect', { x: XL + 6, y: 20, width: XR - XL - 12, height: 26 * 16 + 4, rx: 6, class: 'core' }, s).parentNode.insertBefore(s.lastChild, wires)
  const draw = () => {
    wires.innerHTML = ''
    wl.length = 0
    for (let i = 0; i < 26; i++) {
      const o = m.e.through(2, i, false)
      const p = svg('path', { d: `M${XR},${Y(i)} C${XR - 90},${Y(i)} ${XL + 90},${Y(o)} ${XL},${Y(o)}`, class: 'wire', 'data-i': i, 'data-o': o }, wires)
      wl.push(p)
    }
    el.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', b.dataset.r === m.e.rotors[2]))
    el.querySelector('.w-pos').textContent = A[m.e.pos[2]]
  }
  let hi = -1
  const hover = i => {
    hi = i
    wl.forEach((p, k) => p.classList.toggle('on', k === i))
    rl.forEach((p, k) => p.classList.toggle('on', k === i))
    const o = i >= 0 ? m.e.through(2, i, false) : -1
    ll.forEach((p, k) => p.classList.toggle('on', k === o))
    const st = m.stage
    if (st && st.highlightWire) st.highlightWire(i >= 0 ? mod(i + m.e.pos[2] - m.e.rings[2]) : -1)
  }
  s.addEventListener('pointerover', e => { const x = e.target.closest('[data-i]'); if (x) hover(+x.dataset.i) })
  s.addEventListener('pointerleave', () => hover(-1))
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    const rs = [...m.e.rotors], r = b.dataset.r, j = rs.indexOf(r)
    if (j === 2) return
    if (j >= 0) rs[j] = rs[2]
    rs[2] = r
    m.configure({ rotors: rs })
    if (m.stage && m.stage.showWiring && m.stage.state.wiring) m.stage.showWiring('R', r)
  })
  el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
    const pos = [...m.e.pos]
    pos[2] = mod(pos[2] + +b.dataset.d)
    m.configure({ positions: pos }, { animate: 260 })
  })
  const off = m.on(type => { if (type === 'config' || type === 'press') { draw(); if (hi >= 0) hover(hi) } })
  draw()
  return off
}

// ------------------------------------------------------------------ stepping odometer
function stepping(el, { m, t }) {
  el.className = 'widget w-step'
  el.innerHTML = `<div class="odo"></div><p class="w-next"></p>
    <div class="w-row"><button type="button" class="btn" data-a="press">${t().press}</button><button type="button" class="btn" data-a="double">${t().doubleStep}</button><span class="w-grow"></span><button type="button" class="btn ghost" data-a="reset">AAA</button></div>
    <ol class="log" aria-label="${t().stepsLog}"></ol>`
  const odo = el.querySelector('.odo'), log = el.querySelector('.log')
  let prev = null
  const draw = (stepped) => {
    const e = m.e
    const will = e.willStep()
    odo.innerHTML = [0, 1, 2].map(i => `<div class="cell ${stepped && stepped[i] ? 'moved' : ''} ${will[i] ? 'will' : ''}">
      <span class="nm">${t().rotorNames[i]}</span><span class="big">${A[e.pos[i]]}</span>
      <span class="sm">${e.rotors[i]} &middot; ${t().turnover} ${ROTORS[e.rotors[i]].notch}</span></div>`).join('')
    const names = will.map((w, i) => w ? t().rotorNames[i] : null).filter(Boolean).reverse()
    el.querySelector('.w-next').textContent = `${t().willStep}: ${names.join(` ${t().and} `)}.`
  }
  const off = m.on((type, d) => {
    if (type === 'press') {
      const now = d.positions.map(p => A[p]).join('')
      const li = document.createElement('li')
      const moved = d.stepped.map((s, i) => s ? t().rotorNames[i] : null).filter(Boolean).reverse().join(', ')
      li.innerHTML = `<b>${prev || '...'}</b><i></i><b>${now}</b><span>${moved}</span>`
      if (d.stepped[0]) li.classList.add('dbl')
      log.prepend(li)
      while (log.children.length > 6) log.lastChild.remove()
      prev = now
      draw(d.stepped)
    }
    if (type === 'config') { prev = m.e.pos.map(p => A[p]).join(''); draw() }
  })
  el.querySelector('[data-a=press]').onclick = () => { prev = m.e.pos.map(p => A[p]).join(''); m.tap('A') }
  let timer = []
  el.querySelector('[data-a=double]').onclick = () => {
    timer.forEach(clearTimeout)
    m.configure({ rotors: ['I', 'II', 'III'], rings: [0, 0, 0], positions: [0, 3, 20] }, { animate: 500 })
    log.innerHTML = ''
    prev = 'ADU'
    timer = [1, 2, 3].map(k => setTimeout(() => m.tap('A'), 400 + k * 1100))
  }
  el.querySelector('[data-a=reset]').onclick = () => { timer.forEach(clearTimeout); log.innerHTML = ''; m.configure({ positions: [0, 0, 0] }, { animate: 500 }) }
  prev = m.e.pos.map(p => A[p]).join('')
  draw()
  return () => { off(); timer.forEach(clearTimeout) }
}

// ------------------------------------------------------------------ ring setting of the right rotor
function rings(el, { m, t }) {
  el.className = 'widget w-ring'
  el.innerHTML = `<p class="w-lead"></p>
    <div class="w-row"><span class="w-lbl">${t().ring}</span><input type="range" min="0" max="25" step="1" aria-label="${t().ring}"><b class="w-pos"></b></div>
    <div class="strip"><span class="sr-l">${t().ringLetters}</span><div class="sr top"></div><span class="sr-l">${t().ringWires}</span><div class="sr bot"></div><div class="win-mark"></div></div>
    <div class="ring-out"></div>`
  const inp = el.querySelector('input')
  const draw = () => {
    const e = m.e, p = e.pos[2], r = e.rings[2]
    inp.value = r
    el.querySelector('.w-lead').textContent = t().ringLead(A[p])
    el.querySelector('.w-pos').textContent = `${pad(r)} ${A[r]}`
    const cells = k => Array.from({ length: 13 }, (_, j) => mod(p + j - 6)).map(k)
    el.querySelector('.top').innerHTML = cells(i => `<span class="${i === p ? 'c' : ''}">${A[i]}</span>`).join('')
    el.querySelector('.bot').innerHTML = cells(i => `<span class="${i === p ? 'c' : ''}">${pad(mod(i - r))}</span>`).join('')
    // same letter in the window, but the current comes out elsewhere: that is the whole point of the ring
    const rotorOut = A[e.through(2, 0, false)]
    const machineOut = A[new Enigma(e.state()).trace('A').out]
    el.querySelector('.ring-out').innerHTML = `<div><span>${t().ringRotor}</span><b>A <i></i> ${rotorOut}</b></div>
      <div><span>${t().ringMachine}</span><b>A <i></i> ${machineOut}</b></div>
      <p class="w-note">${t().ringNote(A[p], pad(r), r)}</p>`
  }
  inp.oninput = () => { const rs = [...m.e.rings]; rs[2] = +inp.value; m.configure({ rings: rs }, { animate: 200 }) }
  const off = m.on(type => { if (type === 'config' || type === 'press') draw() })
  draw()
  return off
}

// ------------------------------------------------------------------ reflector pairs on a circle
function reflector(el, { m, t, lang }) {
  el.className = 'widget w-ref'
  el.innerHTML = `<div class="w-row"><span class="w-lbl">${t().reflector}</span><div class="tabs">${Object.keys(REFLECTORS).map(r => `<button type="button" data-r="${r}">UKW ${r}</button>`).join('')}</div></div>
    <svg viewBox="0 0 360 360" class="rc"></svg>
    <div class="w-row"><button type="button" class="btn" data-a="test">${t().testSelf}</button></div><pre class="con" hidden></pre><div class="res"></div>`
  const s = el.querySelector('svg')
  const C = 180, R = 150
  const pt = (i, r = R) => { const a = (i / 26) * Math.PI * 2 - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)] }
  const chords = svg('g', {}, s)
  const labs = svg('g', {}, s)
  const lt = []
  for (let i = 0; i < 26; i++) {
    const [x, y] = pt(i, R + 16)
    const tx = svg('text', { x, y: y + 4, class: 'rl mid', 'data-i': i }, labs); tx.textContent = A[i]; lt.push(tx)
    const [cx, cy] = pt(i)
    svg('circle', { cx, cy, r: 3, class: 'ct' }, labs)
  }
  const draw = () => {
    chords.innerHTML = ''
    const w = REFLECTORS[m.e.reflector]
    for (let i = 0; i < 26; i++) {
      const o = A.indexOf(w[i])
      if (o < i) continue
      const [x1, y1] = pt(i), [x2, y2] = pt(o)
      const k = 0.35
      svg('path', { d: `M${x1},${y1} Q${C + (x1 + x2 - 2 * C) * k},${C + (y1 + y2 - 2 * C) * k} ${x2},${y2}`, class: 'wire', 'data-a': i, 'data-b': o }, chords)
    }
    el.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', b.dataset.r === m.e.reflector))
  }
  s.addEventListener('pointerover', e => {
    const x = e.target.closest('[data-i]')
    if (!x) return
    const i = +x.dataset.i, o = A.indexOf(REFLECTORS[m.e.reflector][i])
    chords.querySelectorAll('path').forEach(p => p.classList.toggle('on', +p.dataset.a === Math.min(i, o) && +p.dataset.b === Math.max(i, o)))
    lt.forEach((l, k) => l.classList.toggle('on', k === i || k === o))
  })
  s.addEventListener('pointerleave', () => { chords.querySelectorAll('.on').forEach(p => p.classList.remove('on')); lt.forEach(l => l.classList.remove('on')) })
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => m.configure({ reflector: b.dataset.r }))
  // a live run like a console: Enigma letters stream by, next to a plain random cipher for comparison
  let raf = 0
  el.querySelector('[data-a=test]').onclick = () => {
    cancelAnimationFrame(raf)
    const e = new Enigma(m.e.state())
    // the first letters go slowly enough to read, then the run speeds up and ends in about five seconds
    const N = 10000, t0 = performance.now()
    const target = sec => Math.min(N, Math.round(sec < 1.5 ? 24 * sec / 1.5 : 24 + (N - 24) * ((sec - 1.5) / 3.5) ** 2))
    let i = 0, same = 0, rnd = 0
    const con = el.querySelector('.con')
    const res = el.querySelector('.res')
    con.hidden = false
    const lines = []
    const step = () => {
      const goal = target((performance.now() - t0) / 1000)
      for (; i < goal; i++) {
        const key = (Math.random() * 26) | 0
        const r = e.press(key)
        const hit = r.out === key
        if (hit) same++
        if (((Math.random() * 26) | 0) === key) rnd++
        lines.push(`<span class="${hit ? 'hit' : ''}">${String(i + 1).padStart(5, '0')}  ${r.positions.map(p => A[p]).join('')}  ${A[key]} -&gt; ${A[r.out]}  ${hit ? t().conSame : t().conOk}</span>`)
      }
      if (lines.length > 11) lines.splice(0, lines.length - 11)
      con.innerHTML = lines.join('')
      res.innerHTML = `<div class="cnt"><span>${t().conTyped}</span><b>${i.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}</b></div>
        <div class="cnt good"><span>${t().conEnigma}</span><b>${same}</b></div>
        <div class="cnt"><span>${t().conRandom}</span><b>${rnd}</b></div>`
      if (i < N) raf = requestAnimationFrame(step)
      else res.insertAdjacentHTML('beforeend', `<p class="w-note">${t().selfResult(N, same, rnd)}</p>`)
    }
    step()
  }
  const off = m.on(type => { if (type === 'config') draw() })
  draw()
  return () => { off(); cancelAnimationFrame(raf) }
}

// ------------------------------------------------------------------ the unrolled circuit
function diagram(el, { m, t }) {
  el.className = 'widget w-diag'
  const W = 540, RH = 15, TOP = 30, H = TOP + 26 * RH + 26
  // columns right to left like the machine: keys, plugboard, entry wheel, rotors R M L, reflector
  const X = { key: 510, plugR: 470, plugL: 420, etwR: 405, etwL: 385, R0: 370, R1: 290, M0: 275, M1: 195, L0: 180, L1: 100, ref: 85 }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="dg"></svg><div class="chain"></div>`
  const s = el.querySelector('svg')
  const Y = i => TOP + i * RH + RH / 2
  const heads = [['key', 510], ['plug', 445], ['etw', 395], ['R', 330], ['M', 235], ['L', 140], ['ref', 60]]
  heads.forEach(([, x], i) => { svg('text', { x, y: 14, class: 'cap mid' }, s).textContent = t().diagramCols[i] })
  const bg = svg('g', {}, s)
  const base = svg('g', { class: 'base' }, s)
  const path = svg('g', {}, s)
  const keys = svg('g', {}, s)
  for (const [a, b] of [[X.plugL, X.plugR], [X.R1, X.R0], [X.M1, X.M0], [X.L1, X.L0]]) svg('rect', { x: a - 4, y: TOP - 4, width: b - a + 8, height: 26 * RH + 8, rx: 5, class: 'blk' }, bg)
  svg('rect', { x: X.ref - 44, y: TOP - 4, width: 48, height: 26 * RH + 8, rx: 5, class: 'blk' }, bg)
  const keyT = []
  for (let i = 0; i < 26; i++) {
    const tx = svg('text', { x: X.key + 8, y: Y(i) + 4, class: 'rl key', 'data-k': A[i] }, keys)
    tx.textContent = A[i]
    keyT.push(tx)
  }
  const winT = ['R', 'M', 'L'].map((k, j) => svg('text', { x: [330, 235, 140][j], y: H - 6, class: 'cap mid win' }, s))
  let last = null
  const curve = (x1, y1, x2, y2) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`
  const drawBase = () => {
    base.innerHTML = ''
    const e = m.e
    let d = ''
    for (let i = 0; i < 26; i++) {
      d += curve(X.plugR, Y(i), X.plugL, Y(e.plug[i]))
      d += `M${X.etwR},${Y(i)}H${X.etwL}`
      d += curve(X.R0, Y(i), X.R1, Y(e.through(2, i)))
      d += curve(X.M0, Y(i), X.M1, Y(e.through(1, i)))
      d += curve(X.L0, Y(i), X.L1, Y(e.through(0, i)))
      const o = e.ref[i]
      if (o > i) d += `M${X.ref},${Y(i)} C${X.ref - 30 - (o - i)},${Y(i)} ${X.ref - 30 - (o - i)},${Y(o)} ${X.ref},${Y(o)}`
      d += `M${X.key},${Y(i)}H${X.plugR}M${X.plugL},${Y(i)}H${X.etwR}M${X.etwL},${Y(i)}H${X.R0}M${X.R1},${Y(i)}H${X.M0}M${X.M1},${Y(i)}H${X.L0}M${X.L1},${Y(i)}H${X.ref}`
    }
    svg('path', { d, class: 'bw' }, base)
    ;['R', 'M', 'L'].forEach((k, j) => { winT[j].textContent = `${e.rotors[2 - j]} : ${A[e.pos[2 - j]]}` })
  }
  // the route is cut into the same five pieces as the 3D current (in, rotors, reflector, rotors back, out),
  // so the line on the diagram grows exactly while the current runs through that part of the machine
  let pieces = [], chainEls = [], keyIn = -1, keyOut = -1
  const REVEAL = [[1, 0], [1, 0.6], [2, 0.35], [2, 0.65], [2, 0.95], [3, 0.5], [4, 0.1], [4, 0.4], [4, 0.7], [5, 0.3], [5, 1]]
  const progress = (seg, u) => {
    for (const pc of pieces) {
      const v = seg > pc.seg ? 1 : seg === pc.seg ? u : 0
      for (const e of pc.els) e.style.strokeDashoffset = pc.L * (1 - v)
    }
    chainEls.forEach((e, i) => { const [sg, uu] = REVEAL[i]; e.classList.toggle('on', seg > sg || (seg === sg && u >= uu)) })
    keyT.forEach((k, i) => { k.classList.toggle('in', i === keyIn && seg >= 1); k.classList.toggle('out', i === keyOut && (seg > 5 || (seg === 5 && u >= 1))) })
  }
  const drawPath = (c, key, out, animated) => {
    path.innerHTML = ''
    pieces = []
    keyIn = key
    keyOut = out
    if (!c) { chainEls = []; el.querySelector('.chain').innerHTML = ''; progress(0, 0); return }
    const [k, p1, r1, m1, l1, rf, l2, m2, r2, p2, lamp] = c
    const o = Math.abs(rf - l1)
    // one continuous path per piece (no inner M), so the dash reveal runs along it in one go
    const cc = (x1, y1, x2, y2) => ` C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`
    const parts = [
      [1, 'pf', `M${X.key},${Y(k)}H${X.plugR}` + cc(X.plugR, Y(k), X.plugL, Y(p1)) + `H${X.R0}`],
      [2, 'pf', `M${X.R0},${Y(p1)}` + cc(X.R0, Y(p1), X.R1, Y(r1)) + `H${X.M0}` + cc(X.M0, Y(r1), X.M1, Y(m1)) + `H${X.L0}` + cc(X.L0, Y(m1), X.L1, Y(l1)) + `H${X.ref}`],
      [3, 'pb', `M${X.ref},${Y(l1)} C${X.ref - 30 - o},${Y(l1)} ${X.ref - 30 - o},${Y(rf)} ${X.ref},${Y(rf)}`],
      [4, 'pb', `M${X.ref},${Y(rf)}H${X.L1}` + cc(X.L1, Y(rf), X.L0, Y(l2)) + `H${X.M1}` + cc(X.M1, Y(l2), X.M0, Y(m2)) + `H${X.R1}` + cc(X.R1, Y(m2), X.R0, Y(r2))],
      [5, 'pb', `M${X.R0},${Y(r2)}H${X.plugL}` + cc(X.plugL, Y(r2), X.plugR, Y(lamp)) + `H${X.key}`],
    ]
    for (const [seg, cls, d] of parts) {
      const glow = svg('path', { d, class: cls + ' glow' }, path)
      const line = svg('path', { d, class: cls }, path)
      const L = line.getTotalLength() + 1
      for (const e of [glow, line]) e.style.strokeDasharray = `${L} ${L}`
      pieces.push({ seg, L, els: [glow, line] })
    }
    const labels = t().chainLabels
    const ch = el.querySelector('.chain')
    ch.innerHTML = c.map((x, i) => `<span class="${i < 5 ? 'f' : i > 5 ? 'b' : 'r'}"><b>${A[x]}</b><i>${labels[i]}</i></span>`).join('')
    chainEls = [...ch.children]
    if (animated) progress(0, 0)
    else progress(9, 1)
  }
  keys.addEventListener('click', e => { const x = e.target.closest('[data-k]'); if (x) m.tap(x.dataset.k) })
  const off = m.on((type, d) => {
    if (type === 'press') { drawBase(); last = d; drawPath(d.contacts, A.indexOf(d.key), d.out, d.animated) }
    if (type === 'pathprog' && last) progress(d.i, d.u)
    if (type === 'config') { drawBase(); drawPath(null) }
  })
  drawBase()
  if (!last) {
    const e = new Enigma(m.e.state())
    const r = e.trace('H')
    drawPath(r.contacts, 7, r.out, false)
  }
  return off
}

// ------------------------------------------------------------------ keyspace
function keyspace(el, { t, lang }) {
  el.className = 'widget w-keys'
  el.innerHTML = `<div class="w-grid">
    <label>${t().kRotorsAvail}<select data-k="n"><option value="3">3 (I-III, 1930)</option><option value="5" selected>5 (I-V, 1938)</option><option value="8">8 (M3, ${lang === 'ru' ? 'флот' : 'navy'})</option></select></label>
    <label>${t().kPlugPairs} <b class="pp"></b><input type="range" min="0" max="13" value="10" data-k="p"></label>
    <label class="chk"><input type="checkbox" data-k="r"> ${t().kRings}</label></div>
    <table class="factors"></table><div class="total"></div><p class="w-note time"></p>`
  const q = s => el.querySelector(s)
  const fmt = b => b.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')
  const sci = b => { const s = b.toString(); const e = s.length - 1; const m = (Number(s.slice(0, 4)) / 1000).toFixed(2); return lang === 'ru' ? `${m.replace('.', ',')} × 10<sup>${e}</sup>` : `${m} × 10<sup>${e}</sup>` }
  const draw = () => {
    const n = +q('[data-k=n]').value, p = +q('[data-k=p]').value, r = q('[data-k=r]').checked
    q('.pp').textContent = p
    const f = [[t().factorOrders, rotorOrders(n)], [t().factorStarts, 17576n], ...(r ? [[t().factorRings, 676n]] : []), [t().factorPlugs, plugboardWays(p)]]
    const total = f.reduce((a, [, v]) => a * v, 1n)
    q('.factors').innerHTML = f.map(([k, v], i) => `<tr><td>${i ? '&times;' : ''}</td><td>${k}</td><td class="num">${fmt(v)}</td></tr>`).join('')
    const bits = Math.log2(Number(total))
    q('.total').innerHTML = `<span>${t().keyspaceTotal}</span><b>${fmt(total)}</b><em>&asymp; ${sci(total)} &middot; ${bits.toFixed(1).replace('.', lang === 'ru' ? ',' : '.')} ${t().bits}</em>`
    const years = Number(total) / 1e9 / 31557600
    const y = years > 1e6 ? sci(BigInt(Math.round(years))) : fmt(BigInt(Math.max(0, Math.round(years))))
    q('.time').innerHTML = `${t().kSpeed}: <b>${y} ${t().years}</b>. ${t().ageUniverse}.`.replace('</b>. ', '</b>.<br>')
  }
  el.querySelectorAll('[data-k]').forEach(i => { i.oninput = draw })
  draw()
  return null
}

// ------------------------------------------------------------------ crib dragging
function crib(el, { t, lang }) {
  const plain = 'ANXGESCHWADERXEINSXWETTERVORHERSAGEXBISKAYAXNEBELXSICHTXZWEIXKILOMETER'
  const CR = 'WETTERVORHERSAGE'
  const e = new Enigma({ rotors: ['III', 'I', 'V'], rings: [4, 11, 19], positions: [16, 3, 8], plugs: 'AQ BX CZ DS EP FL GM HT IR KO' })
  const ct = e.encode(plain)
  const N = ct.length - CR.length + 1
  const truth = plain.indexOf(CR)
  const ok = Array.from({ length: N }, (_, o) => [...CR].every((c, i) => ct[o + i] !== c))
  el.className = 'widget w-crib'
  el.innerHTML = `<div class="ct"></div><div class="map" role="group"></div>
    <div class="w-row"><span class="w-lbl">${t().cribPos}</span><input type="range" min="0" max="${N - 1}" value="3"><b class="w-pos"></b></div>
    <p class="w-note st"></p><p class="w-note sum"></p>`
  const map = el.querySelector('.map')
  map.innerHTML = ok.map((v, o) => `<button type="button" class="${v ? 'ok' : 'bad'}${o === truth ? ' truth' : ''}" data-o="${o}" aria-label="${o}"></button>`).join('')
  const inp = el.querySelector('input')
  const draw = () => {
    const o = +inp.value
    const a = Math.max(0, Math.min(ct.length - 26, o - 5))
    let top = '', bot = ''
    for (let i = a; i < Math.min(ct.length, a + 26); i++) {
      const c = i - o >= 0 && i - o < CR.length ? CR[i - o] : ''
      const clash = c && c === ct[i]
      top += `<span class="${clash ? 'x' : c ? 'u' : ''}">${ct[i]}</span>`
      bot += `<span class="${clash ? 'x' : ''}">${c || '&nbsp;'}</span>`
    }
    el.querySelector('.ct').innerHTML = `<div class="r1">${top}</div><div class="r2">${bot}</div>`
    el.querySelector('.w-pos').textContent = o
    el.querySelector('.st').textContent = ok[o] ? t().cribOk : t().cribBad
    el.querySelector('.st').className = 'w-note st ' + (ok[o] ? 'good' : 'bad')
    map.querySelectorAll('button').forEach((b, k) => b.classList.toggle('cur', k === o))
  }
  el.querySelector('.sum').textContent = t().cribSummary(ok.filter(Boolean).length, N)
  map.onclick = ev => { const b = ev.target.closest('[data-o]'); if (b) { inp.value = b.dataset.o; draw() } }
  inp.oninput = draw
  draw()
  void lang
  return null
}

// ------------------------------------------------------------------ full simulator
const PRESETS = {
  demo: { rotors: ['I', 'II', 'III'], reflector: 'B', rings: [0, 0, 0], positions: [0, 1, 19], plugs: 'HX AV BS CG DL FU IN KM OW RZ', text: 'HELLO' },
  barbarossa: {
    rotors: ['II', 'IV', 'V'], reflector: 'B', rings: [1, 20, 11], positions: [1, 11, 0], plugs: 'AV BS CG DL FU HZ IN KM OW RX',
    text: 'EDPUD NRGYS ZRCXN UYTPO MRMBO FKTBZ REZKM LXLVE FGUEY SIOZV EQMIK UBPMM YLKLT TDEIS MDICA GYKUA CTCDO MOHWX MUUIA UBSTS LRNBZ SZWNR FXWFY SSXJZ VIJHI DISHP RKLKA YUPAD TXQSP INQMA TLPIF SVKDA SCTAC DPBOP VHJK',
  },
}
// the simulator's text and key survive a language switch (the widget is rebuilt then)
let simSaved = null
function sim(el, { m, t }) {
  el.className = 'widget w-sim'
  const opt = (arr, v) => arr.map((x, i) => `<option value="${i}" ${i === v ? 'selected' : ''}>${x}</option>`).join('')
  el.innerHTML = `<div class="w-row presets"><button type="button" class="btn ghost" data-p="demo">${t().presetDemo}</button><button type="button" class="btn ghost" data-p="barbarossa">${t().presetBarbarossa}</button></div>
    <div class="set">
      <label>${t().reflector}<select data-s="ref">${Object.keys(REFLECTORS).map(r => `<option>${r}</option>`).join('')}</select></label>
      <fieldset><legend>${t().rotors}</legend>${[0, 1, 2].map(i => `<select data-s="rot" data-i="${i}">${TYPES.map(r => `<option>${r}</option>`).join('')}</select>`).join('')}</fieldset>
      <fieldset><legend>${t().rings}</legend>${[0, 1, 2].map(i => `<select data-s="ring" data-i="${i}">${opt(A.split('').map((l, k) => `${pad(k)} ${l}`), 0)}</select>`).join('')}</fieldset>
      <fieldset><legend>${t().positions}</legend>${[0, 1, 2].map(i => `<select data-s="pos" data-i="${i}">${opt(A.split(''), 0)}</select>`).join('')}</fieldset>
      <label class="wide">${t().plugboard} <b class="pc"></b><input data-s="plugs" spellcheck="false" autocomplete="off" placeholder="AV BS CG"></label>
    </div>
    <label class="ta">${t().input}<textarea rows="3" spellcheck="false" autocapitalize="characters"></textarea></label>
    <div class="outbox"><div class="ob-h"><span>${t().output}</span><span class="w-grow"></span><button type="button" class="btn ghost sm" data-a="copy">${t().copy}</button><button type="button" class="btn sm" data-a="swap">${t().swap}</button></div><div class="out"></div></div>
    <p class="w-note share"><a href="#" data-a="share">${t().share}</a></p>`
  const q = s => el.querySelector(s)
  const ta = q('textarea')
  let start = { rotors: ['I', 'II', 'III'], reflector: 'B', rings: [0, 0, 0], positions: [0, 0, 0], plugs: '' }
  let prevText = ''
  const readForm = () => {
    const rot = [...el.querySelectorAll('[data-s=rot]')].map(s => s.value)
    const plug = parsePlugs(q('[data-s=plugs]').value)
    return { rotors: rot, reflector: q('[data-s=ref]').value, rings: [...el.querySelectorAll('[data-s=ring]')].map(s => +s.value),
      positions: [...el.querySelectorAll('[data-s=pos]')].map(s => +s.value), plugs: plugPairs(plug).join(' ') }
  }
  const writeForm = s => {
    q('[data-s=ref]').value = s.reflector
    el.querySelectorAll('[data-s=rot]').forEach((x, i) => { x.value = s.rotors[i] })
    el.querySelectorAll('[data-s=ring]').forEach((x, i) => { x.value = s.rings[i] })
    el.querySelectorAll('[data-s=pos]').forEach((x, i) => { x.value = s.positions[i] })
    q('[data-s=plugs]').value = s.plugs
    q('.pc').textContent = t().pairsCount(s.plugs.split(' ').filter(Boolean).length)
  }
  const clean = s => s.toUpperCase().replace(/[^A-Z]/g, '')
  const run = () => {
    const e = new Enigma(start)
    const out = e.encode(ta.value)
    q('.out').textContent = out.replace(/(.{5})/g, '$1 ').trim()
    return { out, e }
  }
  const save = () => { simSaved = { start, text: ta.value } }
  // the machine may have been changed elsewhere on the page (plugboard, arrows, 3D keys): put it back where
  // the simulator expects it before the next letter, so the lamp and the output always agree
  const syncMachine = () => {
    const pending = m.queue.length
    const exp = new Enigma(start)
    exp.encode(prevText.slice(0, Math.max(0, prevText.length - pending)))
    const a = exp.state(), b = m.e.state()
    if (JSON.stringify(a) !== JSON.stringify(b)) m.configure({ ...start, positions: exp.pos }, { animate: 0 })
  }
  const apply = ev => {
    let s = readForm()
    // a rotor can only be used once: the rotor that was in the changed slot moves to where the chosen one was
    const rs = [...start.rotors]
    const tg = ev && ev.target
    if (tg && tg.dataset.s === 'rot') {
      const i = +tg.dataset.i, want = tg.value, j = rs.indexOf(want)
      if (j >= 0 && j !== i) rs[j] = rs[i]
      rs[i] = want
    }
    start = { ...s, rotors: rs }
    writeForm(start)
    const { e } = run()
    m.configure({ ...start, positions: e.pos })
    prevText = clean(ta.value)
    save()
  }
  el.querySelector('.set').addEventListener('change', apply)
  q('[data-s=plugs]').addEventListener('input', () => { q('.pc').textContent = t().pairsCount(plugPairs(parsePlugs(q('[data-s=plugs]').value)).length) })
  ta.addEventListener('input', () => {
    const now = clean(ta.value)
    run()
    if (now.length === prevText.length + 1 && now.startsWith(prevText)) { syncMachine(); m.tap(now[now.length - 1]) }
    else { const e = new Enigma(start); e.encode(now); m.configure({ ...start, positions: e.pos }, { animate: 200 }) }
    prevText = now
    save()
  })
  el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
    const p = PRESETS[b.dataset.p]
    start = { rotors: p.rotors, reflector: p.reflector, rings: p.rings, positions: p.positions, plugs: p.plugs }
    writeForm(start)
    ta.value = p.text
    const { e } = run()
    m.configure({ ...start, positions: e.pos }, { animate: 500 })
    prevText = clean(ta.value)
    save()
  })
  q('[data-a=swap]').onclick = () => {
    ta.value = q('.out').textContent
    run()
    const e = new Enigma(start); e.encode(ta.value)
    m.configure({ ...start, positions: e.pos }, { animate: 500 })
    prevText = clean(ta.value)
    save()
  }
  q('[data-a=copy]').onclick = async ev => {
    try { await navigator.clipboard.writeText(q('.out').textContent); ev.target.textContent = t().copied } catch { /* clipboard blocked */ }
    setTimeout(() => { ev.target.textContent = t().copy }, 1400)
  }
  q('[data-a=share]').onclick = ev => {
    ev.preventDefault()
    const s = start
    const hash = `#sim=${s.reflector}-${s.rotors.join('.')}-${s.rings.map(r => A[r]).join('')}-${s.positions.map(r => A[r]).join('')}-${s.plugs.replace(/ /g, '')}-${clean(ta.value)}`
    history.replaceState(null, '', hash)
    navigator.clipboard?.writeText(location.href).catch(() => {})
    ev.target.textContent = t().copied
  }
  const fromHash = () => {
    const mt = location.hash.match(/^#sim=([ABC])-([IV.]+)-([A-Z]{3})-([A-Z]{3})-([A-Z]*)-([A-Z]*)$/)
    if (!mt) return false
    const rotors = mt[2].split('.')
    if (rotors.length !== 3 || !rotors.every(r => ROTORS[r])) return false
    start = { reflector: mt[1], rotors, rings: [...mt[3]].map(c => A.indexOf(c)), positions: [...mt[4]].map(c => A.indexOf(c)), plugs: (mt[5].match(/../g) || []).join(' ') }
    ta.value = mt[6]
    return true
  }
  if (simSaved) { start = simSaved.start; ta.value = simSaved.text }
  else if (fromHash()) {
    const e = new Enigma(start); e.encode(ta.value)
    m.configure({ ...start, positions: e.pos }, { animate: 0 })
  } else start = { ...m.e.state(), plugs: m.pairs.join(' ') }
  writeForm(start)
  run()
  prevText = clean(ta.value)
  save()
  return null
}

export const WIDGETS = { plugboard, rotor, stepping, rings, reflector, diagram, keyspace, crib, sim }
