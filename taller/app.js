(function () {
  'use strict';
  const SB = 'https://udingbqooecgfjqpxpbl.supabase.co';
  const KEY = 'sb_publishable_kv-OaceZaIkT6dV_VH1S7w_CwiKNFHr';
  const MAX = 5;
  const QUESTION = '¿Qué podríamos hacer juntas?';
  const EMOJIS = ['🌸', '🌷', '🌻', '🍀', '🦋', '🐝', '🦊', '🐱', '🦉', '🐬', '🍓', '🍋', '🍒', '🥐', '🎨', '🎻', '📚', '🎧', '⭐', '🌙', '🔥', '🌈', '💃', '🚲'];

  // Conceptos para elegir, por familias. Cada familia tiene su color de hilo.
  const FAMILIES = [
    ['personas', 'Personas', ['Comunidad', 'Cuidado', 'Familia', 'Mujeres', 'Infancia', 'Mayores']],
    ['bienestar', 'Bienestar', ['Salud', 'Bienestar', 'Deporte', 'Alimentación', 'Crecimiento personal', 'Acompañamiento']],
    ['creatividad', 'Creatividad', ['Arte', 'Diseño', 'Artesanía', 'Moda', 'Música', 'Cultura']],
    ['territorio', 'Territorio', ['Sostenibilidad', 'Naturaleza', 'Rural', 'Turismo', 'Tradición', 'Local']],
    ['conocimiento', 'Conocimiento', ['Educación', 'Formación', 'Tecnología', 'Innovación', 'Comunicación', 'Digital']],
    ['proposito', 'Propósito', ['Impacto social', 'Inclusión', 'Igualdad', 'Emprendimiento', 'Colaboración', 'Confianza']]
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app'), toastEl = $('#toast');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const first = s => String(s).trim().split(' ')[0];
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  const CONCEPT = {};   // clave normalizada -> { label, fam }
  FAMILIES.forEach(f => f[2].forEach(l => { CONCEPT[norm(l)] = { label: l, fam: f[0] }; }));
  const famOf = k => (CONCEPT[k] ? CONCEPT[k].fam : 'propia');

  /* ---------- Estado ---------- */
  const LS = 'hilos-v1';
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  let me = { token: uuid(), name: '', project: '', words: [], sent: false, id: null, emoji: '' };
  try { const s = JSON.parse(localStorage.getItem(LS) || 'null'); if (s && s.token) me = Object.assign(me, s); } catch (e) { /* sin almacenamiento */ }
  if (!me.emoji) me.emoji = EMOJIS[hash(me.token) % EMOJIS.length];
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(me)); } catch (e) { /* sin almacenamiento */ } };

  let state = { phase: 'palabras', participants: [] };
  let lastJson = '', online = true, step = me.sent ? 'listo' : 'hola', tab = 'mias', draft = me.words.slice();
  let pin = '';
  try { pin = sessionStorage.getItem('hilos-pin') || ''; } catch (e) { /* sin almacenamiento */ }
  const seen = {};   // hilos y nudos ya dibujados en la pantalla grande, para animar solo los nuevos

  /* ---------- Servidor ---------- */
  async function rpc(fn, body) {
    const r = await fetch(SB + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) { let m = ''; try { m = (await r.json()).message || ''; } catch (e) { /* sin cuerpo */ } throw new Error(m || 'error'); }
    return r.json();
  }
  async function refresh(force) {
    try {
      const s = await rpc('tl_state');
      const j = JSON.stringify(s);
      const changed = j !== lastJson || !online;
      online = true; lastJson = j; state = s;
      // Si la anfitriona vació la sesión, esta participante vuelve al principio.
      let back = false;
      if (me.sent && me.id && !state.participants.some(p => p.id === me.id)) { me.sent = false; me.id = null; save(); if (step === 'listo') { step = 'hola'; back = true; } }
      if (force || back || (changed && isLive())) render();
    } catch (e) {
      if (online) { online = false; if (isLive()) render(); }
    }
  }
  const route = () => (location.hash.replace(/^#\/?/, '').split('?')[0] || '');
  const isLive = () => route() !== '' || step === 'listo';   // vistas que se redibujan solas

  /* ---------- Cálculos ---------- */
  function analyse() {
    const ps = state.participants.map(p => {
      const keys = [], labels = {};
      p.words.forEach(w => { const k = norm(w); if (k && keys.indexOf(k) < 0) { keys.push(k); labels[k] = w; } });
      return { id: p.id, name: p.name, project: p.project, keys: keys, labels: labels, hue: hash(p.id) % 6, emoji: p.emoji || '', ini: (first(p.name).charAt(0) || '?').toUpperCase() };
    });
    const by = {};
    ps.forEach(p => p.keys.forEach(k => {
      if (!by[k]) by[k] = { k: k, label: CONCEPT[k] ? CONCEPT[k].label : cap(p.labels[k].toLowerCase()), fam: famOf(k), who: [] };
      by[k].who.push(p);
    }));
    const label = {};
    const words = Object.keys(by).map(k => { by[k].n = by[k].who.length; label[k] = by[k].label; return by[k]; })
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, 'es'));
    const unused = Object.keys(CONCEPT).filter(k => !by[k]).map(k => CONCEPT[k].label);
    return { ps: ps, words: words, label: label, unused: unused };
  }
  function affinity(a, b) {
    const shared = a.keys.filter(k => b.keys.indexOf(k) >= 0);
    const fa = {}, near = [];
    a.keys.forEach(k => { if (shared.indexOf(k) < 0 && CONCEPT[k]) fa[CONCEPT[k].fam] = k; });
    b.keys.forEach(k => {
      if (shared.indexOf(k) < 0 && CONCEPT[k] && fa[CONCEPT[k].fam] && !near.some(n => n.fam === CONCEPT[k].fam)) {
        near.push({ fam: CONCEPT[k].fam, mine: fa[CONCEPT[k].fam], theirs: k });
      }
    });
    return { shared: shared, near: near, score: shared.length * 3 + Math.min(near.length, 2) };
  }
  function matchesFor(a, ps) {
    return ps.filter(p => p.id !== a.id).map(p => Object.assign({ p: p }, affinity(a, p)))
      .sort((x, y) => y.score - x.score || (x.p.id < y.p.id ? -1 : 1)).slice(0, 3);
  }

  /* ---------- Piezas ---------- */
  const THREADS = '<svg class="threads" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">'
    + '<path class="t1" d="M-10 20C70 20 90 100 170 96S260 20 330 34"/>'
    + '<path class="t2" d="M-10 96C60 100 110 18 180 22S270 96 330 84"/>'
    + '<path class="t3" d="M-10 60C80 30 120 86 200 58S280 40 330 62"/></svg>';

  const avatar = (p, cls) => '<span class="av a' + p.hue + (p.emoji ? ' em ' : ' ') + (cls || '') + '" aria-hidden="true">' + esc(p.emoji || p.ini) + '</span>';
  // Las animaciones de entrada solo se lanzan cuando cambia la vista, no en cada actualización.
  let lastAnim = '';
  const anim = key => { const a = key !== lastAnim; lastAnim = key; return a ? ' anim' : ''; };
  const person = p => '<span class="pp' + (p.id === me.id ? ' yo' : '') + '">' + avatar(p) + esc(p.id === me.id ? 'Tú' : first(p.name)) + '</span>';
  const pills = (keys, an) => keys.map(k => '<span class="pill f-' + famOf(k) + '">' + esc(an.label[k] || k) + '</span>').join('');
  // Lo que une al grupo: cada palabra compartida es un nudo con las personas a las que une.
  function knots(an) {
    const sh = an.words.filter(w => w.n > 1), solo = an.words.filter(w => w.n === 1);
    let h = '';
    if (sh.length) {
      h += '<div class="knots">' + sh.map(w => '<div class="knot f-' + w.fam + '"><span class="kw">' + esc(w.label) + '</span><div class="kp">' + w.who.map(person).join('') + '</div></div>').join('') + '</div>';
    } else if (an.ps.length) {
      h += '<p class="empty">Todavía no hay palabras compartidas. Llegarán en cuanto entren más proyectos.</p>';
    }
    if (solo.length) {
      h += '<h2 class="sub">Lo que solo una trae</h2><p class="lead small">Hilos únicos, que nadie más aporta al grupo.</p><div class="solos">'
        + solo.map(w => '<span class="solo f-' + w.fam + '">' + esc(w.label) + '<i>' + esc(first(w.who[0].name)) + '</i></span>').join('') + '</div>';
    }
    return h;
  }
  function qrSvg(url) {
    try { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
    catch (e) { return ''; }
  }
  const joinUrl = () => location.origin + location.pathname;
  const shortUrl = () => joinUrl().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const plural = n => n + (n === 1 ? ' proyecto' : ' proyectos');
  const offline = () => (online ? '' : '<p class="off">Sin conexión. Se actualizará sola cuando vuelva.</p>');

  /* ---------- Participante ---------- */
  function viewHola() {
    app.innerHTML = '<main class="wrap hola">' + THREADS
      + '<h1>Hilos</h1><p class="lead">Cada proyecto es un hilo. Vamos a descubrir con cuáles se entrelaza el tuyo.</p>'
      + '<form id="f" novalidate><div class="field"><span id="el">Elige tu dibujo</span><div class="emojis" role="radiogroup" aria-labelledby="el">'
      + EMOJIS.map(e => '<button type="button" role="radio" aria-checked="' + (e === me.emoji) + '" data-e="' + e + '">' + e + '</button>').join('') + '</div></div>'
      + '<label class="field"><span>¿Cómo te llamas?</span><input class="input" id="n" maxlength="40" autocomplete="given-name" value="' + esc(me.name) + '"></label>'
      + '<label class="field"><span>¿Cómo se llama tu proyecto?</span><input class="input" id="p" maxlength="60" autocomplete="off" value="' + esc(me.project) + '"></label>'
      + '<p class="err" id="e" hidden></p><button class="btn" type="submit">Elegir mis palabras</button></form></main>';
    app.querySelectorAll('[data-e]').forEach(b => b.onclick = () => {
      me.emoji = b.dataset.e; save(); buzz();
      app.querySelectorAll('[data-e]').forEach(x => x.setAttribute('aria-checked', x === b));
    });
    $('#f').onsubmit = ev => {
      ev.preventDefault();
      const n = $('#n').value.trim(), p = $('#p').value.trim();
      if (!n || !p) { const e = $('#e'); e.hidden = false; e.textContent = 'Escribe tu nombre y el de tu proyecto para continuar.'; return; }
      me.name = n; me.project = p; save(); step = 'palabras'; render(); window.scrollTo(0, 0);
    };
  }
  function viewPalabras() {
    const dk = draft.map(norm);
    let h = '<main class="wrap pick"><header class="picktop"><p class="proj"><span class="av em">' + esc(me.emoji) + '</span>' + esc(me.project) + '</p>'
      + '<h1>¿Qué 5 palabras lo cuentan mejor?</h1>'
      + '<div class="slots" aria-live="polite">';
    for (let i = 0; i < MAX; i++) {
      h += draft[i] ? '<button class="slot full f-' + famOf(dk[i]) + '" data-rm="' + i + '" aria-label="Quitar ' + esc(draft[i]) + '">' + esc(draft[i]) + '<i>×</i></button>'
        : '<span class="slot"></span>';
    }
    h += '</div></header>';
    FAMILIES.forEach(f => {
      h += '<section class="fam f-' + f[0] + '"><h2>' + f[1] + '</h2><div class="chips">' + f[2].map(l => {
        const on = dk.indexOf(norm(l)) >= 0;
        return '<button class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-w="' + esc(l) + '">' + esc(l) + '</button>';
      }).join('') + '</div></section>';
    });
    h += '<section class="fam f-propia"><h2>¿Falta la tuya?</h2><form id="own" class="own"><input class="input" id="ow" maxlength="28" placeholder="Escribe una palabra" autocomplete="off" autocapitalize="sentences"><button class="btn small" type="submit">Añadir</button></form></section>'
      + '<p class="err" id="e" hidden></p>'
      + '<div class="dock"><button class="btn" id="send"' + (draft.length === MAX ? '' : ' disabled') + '>'
      + (draft.length === MAX ? 'Enviar mis 5 palabras' : 'Te ' + (MAX - draft.length === 1 ? 'falta 1 palabra' : 'faltan ' + (MAX - draft.length) + ' palabras')) + '</button>'
      + '<button class="linkbtn" id="back">Cambiar nombre o proyecto</button></div></main>';
    const y = window.scrollY; app.innerHTML = h; window.scrollTo(0, y);
    app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => toggle(b.dataset.w));
    app.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { draft.splice(+b.dataset.rm, 1); viewPalabras(); });
    $('#own').onsubmit = ev => {
      ev.preventDefault();
      let w = $('#ow').value.replace(/\s+/g, ' ').trim(); if (!w) return;
      const k = norm(w); if (!k) return;
      if (CONCEPT[k]) w = CONCEPT[k].label; else w = cap(w.toLowerCase());
      toggle(w, true);
    };
    $('#back').onclick = () => { step = 'hola'; render(); };
    $('#send').onclick = send;
  }
  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* sin vibración */ } };
  function toggle(w, addOnly) {
    const k = norm(w), i = draft.map(norm).indexOf(k);
    if (i >= 0) { if (addOnly) return toast('Esa palabra ya la tienes.'); draft.splice(i, 1); }
    else if (draft.length >= MAX) return toast('Ya tienes 5. Quita una para cambiarla.');
    else draft.push(w);
    buzz(); viewPalabras();
  }
  async function send() {
    const b = $('#send'); b.disabled = true; b.textContent = 'Enviando…';
    try {
      me.id = await rpc('tl_join_emoji', { p_token: me.token, p_name: me.name, p_project: me.project, p_words: draft, p_emoji: me.emoji });
      me.words = draft.slice(); me.sent = true; save(); step = 'listo'; tab = 'mias';
      await refresh(true); window.scrollTo(0, 0);
    } catch (e) {
      const el = $('#e'); el.hidden = false;
      el.textContent = 'No se han podido enviar. Comprueba la conexión y pulsa de nuevo.';
      b.disabled = false; b.textContent = 'Enviar mis 5 palabras';
    }
  }
  function viewListo() {
    const an = analyse();
    const mine = an.ps.filter(p => p.id === me.id)[0];
    const waiting = state.phase !== 'afinidades' || !mine;
    let h = '<main class="wrap listo' + anim(waiting ? 'espera' : 'af-' + tab) + '">' + offline();
    if (waiting) {
      const others = an.ps.filter(p => p.id !== me.id);
      h += '<div class="hero">' + THREADS + (mine ? avatar(mine, 'xl') : '') + '</div><h1>Tu hilo ya está en el telar</h1>'
        + '<div class="mine">' + (mine ? pills(mine.keys, an) : '') + '</div>'
        + '<p class="lead">En cuanto estéis todas, verás con quién se entrelaza.</p>'
        + '<h2 class="sub">' + (others.length ? 'Ya estáis ' + an.ps.length : 'Eres la primera en llegar') + '</h2>'
        + '<div class="crowd">' + an.ps.map(person).join('') + '</div>'
        + '<button class="linkbtn" id="edit">Cambiar mis palabras</button>';
    } else {
      h += '<nav class="tabs" role="tablist">' + [['mias', 'Mis hilos'], ['grupo', 'Nos une'], ['todas', 'Todas']].map(t =>
        '<button role="tab" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</nav>';
      if (tab === 'mias') {
        const ms = matchesFor(mine, an.ps);
        h += '<h1>Tu proyecto se entrelaza con estos</h1><p class="lead">Acércate a ellas y preguntaos: <strong>' + QUESTION + '</strong></p>';
        h += ms.length ? ms.map(m => card(mine, m, an)).join('') : '<p class="empty">Aún eres la única. En cuanto entre alguien más aparecerá aquí.</p>';
        h += '<button class="linkbtn" id="edit">Cambiar mis palabras</button>';
      } else if (tab === 'grupo') {
        h += '<h1>Lo que nos une</h1><p class="lead">Cada palabra es un nudo que junta a varias de nosotras.</p>' + knots(an);
      } else {
        h += '<h1>Estamos ' + an.ps.length + '</h1><p class="lead">Todos los proyectos del grupo, para seguir en contacto.</p><ul class="dir">' + an.ps.map(p =>
          '<li' + (p.id === me.id ? ' class="me"' : '') + '>' + avatar(p, 'lg') + '<div><strong>' + esc(p.project) + '</strong><span>de ' + esc(p.name) + (p.id === me.id ? ' (tú)' : '') + '</span><div class="row">' + pills(p.keys, an) + '</div></div></li>').join('') + '</ul>';
      }
    }
    app.innerHTML = h + '</main>';
    app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); window.scrollTo(0, 0); });
    const e = $('#edit'); if (e) e.onclick = () => { draft = me.words.slice(); step = 'palabras'; render(); window.scrollTo(0, 0); };
  }
  // Una afinidad: dos personas unidas por un hilo por cada palabra que comparten.
  function card(mine, m, an) {
    let ths, why;
    if (m.shared.length) {
      ths = m.shared.map(k => '<div class="th f-' + famOf(k) + '"><span>' + esc(an.label[k]) + '</span></div>').join('');
      why = m.shared.length === 1 ? 'Os une 1 hilo' : 'Os unen ' + m.shared.length + ' hilos';
    } else if (m.near.length) {
      ths = m.near.map(n => '<div class="th near f-' + n.fam + '"><span>' + esc(an.label[n.mine]) + ' y ' + esc(an.label[n.theirs]) + '</span></div>').join('');
      why = 'Vais por caminos vecinos';
    } else {
      ths = '<div class="th none f-propia"><span>por estrenar</span></div>';
      why = 'Un hilo por estrenar: no compartís palabras, y justo por eso puede salir algo que ninguna espera.';
    }
    return '<article class="match"><div class="tie"><div class="end">' + avatar(mine, 'lg') + '<small>Tú</small></div><div class="ths">' + ths + '</div><div class="end">' + avatar(m.p, 'lg') + '<small>' + esc(first(m.p.name)) + '</small></div></div>'
      + '<h2>' + esc(m.p.project) + '</h2><p class="who">de ' + esc(m.p.name) + '</p><p class="why">' + why + '</p></article>';
  }

  /* ---------- Pantalla grande ---------- */
  function viewPantalla() {
    const an = analyse(), af = state.phase === 'afinidades', wide = window.innerWidth > 760;
    let side = '<aside class="join">' + THREADS + '<h1>Hilos</h1>';
    if (!af) side += '<div class="qr">' + qrSvg(joinUrl()) + '</div><p class="how">Apunta con la cámara del móvil</p><p class="url">' + esc(shortUrl()) + '</p>';
    else {
      // Los cinco nudos más fuertes, cada uno con todas las personas a las que une.
      const top = an.words.filter(w => w.n > 1).slice(0, 5);
      side += '<h3 class="kt">Nudos más fuertes</h3>' + (top.length
        ? '<ol class="strong' + anim('nudos') + '">' + top.map(w => '<li class="f-' + w.fam + '"><div class="sw"><strong>' + esc(w.label) + '</strong><span>une a ' + w.n + '</span></div><div class="sp">'
          + w.who.map(p => '<span class="sc">' + avatar(p) + '<i>' + esc(first(p.name)) + '</i></span>').join('') + '</div></li>').join('') + '</ol>'
        : '<p class="none">Todavía no hay palabras compartidas.</p>');
    }
    side += '<p class="count"><b>' + an.ps.length + '</b> ' + (an.ps.length === 1 ? 'proyecto en el telar' : 'proyectos en el telar') + '</p></aside>';
    app.innerHTML = '<main class="screen' + (af ? ' af' : '') + '">' + side + '<section class="stage">' + offline()
      + '<div class="sh"><h2>' + (af ? 'Lazos que nos unen' : 'Así se va tejiendo el grupo') + '</h2>' + (af ? '<p class="ask">' + QUESTION + '</p>' : '') + '</div>'
      + (an.ps.length ? (wide ? '<div class="loom" id="loom"></div>' : knots(an)) : '<p class="empty">En cuanto alguien envíe sus palabras, aquí empezará el tejido.</p>')
      + '</section></main>';
    if (wide) { fitSide(); drawLoom(an); }
  }
  // Encoge la columna de nudos hasta que quepa entera; si no basta, deja solo los dibujos, sin nombres.
  function fitSide() {
    const el = $('.join'), ol = $('.strong'); if (!el || !ol) return;
    const over = () => el.scrollHeight > el.clientHeight + 1;
    const shrink = () => { let k = 1; el.style.setProperty('--ks', k); while (k > .7 && over()) { k -= .05; el.style.setProperty('--ks', k.toFixed(2)); } };
    shrink();
    if (over()) { ol.classList.add('tight'); shrink(); }
  }
  // El telar: proyectos a los lados, palabras en el centro como nudos, y un hilo de cada proyecto a cada una de sus palabras.
  let ctx;
  function measure(t, fs) {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '700 ' + fs + 'px "Bricolage Grotesque", Figtree, system-ui, sans-serif';
    return ctx.measureText(t).width;
  }
  function drawLoom(an) {
    const el = $('#loom'); if (!el) return;
    const W = el.clientWidth, H = el.clientHeight, n = an.ps.length;
    if (!n || W < 300 || H < 200) return;
    const nL = Math.ceil(n / 2), gap = Math.min(92, (H - 16) / nL);
    const r = Math.max(8, Math.min(22, gap * .34)), fsL = Math.max(11, Math.min(19, gap * .36));
    const labW = Math.min(W * .17, 250), xL = labW + r + 12, xR = W - labW - r - 12;
    const pos = {};
    an.ps.forEach((p, i) => {
      const side = i % 2, cnt = side ? Math.floor(n / 2) : nL;
      pos[p.id] = { x: side ? xR : xL, y: H / 2 + (Math.floor(i / 2) - (cnt - 1) / 2) * gap, side: side };
    });
    const max = an.words[0].n, m0 = xL + r + 26, m1 = xR - r - 26, cx = (m0 + m1) / 2;
    const base = Math.max(13, Math.min(20, H / 46)), extra = Math.min(H / 12, 70);
    // Tamaño de cada palabra según cuántas la comparten; luego se encoge todo hasta que el conjunto quepa holgado.
    const size = sc => an.words.map(w => {
      const t = max > 1 ? Math.sqrt((w.n - 1) / (max - 1)) : 0, fs = w.n > 1 ? Math.max(15, (base * 1.25 + t * extra) * sc) : Math.max(13, base * Math.max(sc, .8));
      return { w: w, fs: fs, bw: measure(w.label, fs) + fs * 1.3, bh: fs * 1.75 };
    });
    let sc = 1, ks = size(sc);
    for (let i = 0; i < 12; i++) {
      const area = ks.reduce((a, k) => a + (k.bw + 12) * (k.bh + 8), 0), widest = Math.max.apply(null, ks.map(k => k.bw));
      if (area <= (m1 - m0) * H * .34 && widest <= (m1 - m0) * .62) break;
      sc *= .88; ks = size(sc);
    }
    ks.forEach(k => {
      let sx = 0, sy = 0; k.w.who.forEach(p => { sx += pos[p.id].x; sy += pos[p.id].y; }); sx /= k.w.n; sy /= k.w.n;
      const pull = k.w.n > 1 ? .62 + (hash(k.w.k) % 4) * .09 : .2 + (hash(k.w.k) % 5) * .1;
      k.x = sx + (cx - sx) * pull; k.y = sy + ((hash(k.w.k) % 7) - 3) * 2;
    });
    for (let it = 0; it < 700; it++) {
      let moved = false;
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        const a = ks[i], b = ks[j], dx = b.x - a.x, dy = b.y - a.y;
        const ox = (a.bw + b.bw) / 2 + 10 - Math.abs(dx), oy = (a.bh + b.bh) / 2 + 5 - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          moved = true;
          if (oy <= ox) { const s = (dy < 0 || (dy === 0 && (i + j) % 2) ? -1 : 1) * oy / 2; a.y -= s; b.y += s; }
          else { const s = (dx < 0 ? -1 : 1) * ox / 2; a.x -= s; b.x += s; }
        }
      }
      ks.forEach(k => {
        k.x = Math.max(m0 + k.bw / 2, Math.min(m1 - k.bw / 2, k.x));
        k.y = Math.max(k.bh / 2 + 2, Math.min(H - k.bh / 2 - 2, k.y));
      });
      if (!moved) break;
    }
    let th = '', kn = '', nd = '', d = 0;
    ks.forEach(k => {
      k.w.who.forEach(p => {
        const q = pos[p.id], sx = q.x + (q.side ? -r : r), ex = k.x + (q.side ? k.bw / 2 : -k.bw / 2), mx = (ex - sx) * .5;
        const id = p.id + '|' + k.w.k, fresh = !seen[id]; seen[id] = 1;
        th += '<path pathLength="1" class="t f-' + k.w.fam + (k.w.n > 1 ? ' sh' : '') + (fresh ? ' fresh' : '') + '"' + (fresh ? ' style="animation-delay:' + (Math.min(d++, 40) * 30) + 'ms"' : '')
          + ' d="M' + sx.toFixed(1) + ' ' + q.y.toFixed(1) + 'C' + (sx + mx).toFixed(1) + ' ' + q.y.toFixed(1) + ' ' + (ex - mx).toFixed(1) + ' ' + k.y.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + k.y.toFixed(1) + '"/>';
      });
      const id = 'k|' + k.w.k + '|' + (k.w.n > 1), fresh = !seen[id]; seen[id] = 1;
      kn += '<g class="k f-' + k.w.fam + (k.w.n > 1 ? ' sh' : '') + (fresh ? ' fresh' : '') + '"><rect x="' + (k.x - k.bw / 2).toFixed(1) + '" y="' + (k.y - k.bh / 2).toFixed(1) + '" width="' + k.bw.toFixed(1) + '" height="' + k.bh.toFixed(1) + '" rx="' + (k.bh / 2).toFixed(1) + '"/>'
        + '<text x="' + k.x.toFixed(1) + '" y="' + k.y.toFixed(1) + '" font-size="' + k.fs.toFixed(1) + '">' + esc(k.w.label) + '</text></g>';
    });
    const two = gap >= 46;
    an.ps.forEach(p => {
      const q = pos[p.id], tx = q.side ? q.x + r + 10 : q.x - r - 10;
      let pr = p.project; while (pr.length > 4 && measure(pr, fsL) > labW - 6) pr = pr.slice(0, -2).trim() + '…';
      nd += '<g class="n a' + p.hue + (p.emoji ? ' em' : '') + '"><circle cx="' + q.x + '" cy="' + q.y.toFixed(1) + '" r="' + r.toFixed(1) + '"/><text class="ni" x="' + q.x + '" y="' + q.y.toFixed(1) + '" font-size="' + (r * (p.emoji ? 1.15 : .95)).toFixed(1) + '">' + esc(p.emoji || p.ini) + '</text>'
        + '<text class="np" text-anchor="' + (q.side ? 'start' : 'end') + '" x="' + tx.toFixed(1) + '" y="' + (q.y - (two ? fsL * .32 : 0)).toFixed(1) + '" font-size="' + fsL.toFixed(1) + '">' + esc(pr) + '</text>'
        + (two ? '<text class="nn" text-anchor="' + (q.side ? 'start' : 'end') + '" x="' + tx.toFixed(1) + '" y="' + (q.y + fsL * .78).toFixed(1) + '" font-size="' + (fsL * .78).toFixed(1) + '">' + esc(first(p.name)) + '</text>' : '') + '</g>';
    });
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Proyectos unidos por las palabras que comparten">' + th + kn + nd + '</svg>';
  }

  /* ---------- Control de la anfitriona ---------- */
  function viewControl() {
    if (!pin) {
      app.innerHTML = '<main class="wrap hola"><h1 class="h1s">Control</h1><p class="lead">Escribe el código de la anfitriona.</p>'
        + '<form id="f"><input class="input pin" id="pi" inputmode="numeric" maxlength="8" autocomplete="off"><p class="err" id="e" hidden></p><button class="btn">Entrar</button></form></main>';
      $('#f').onsubmit = async ev => {
        ev.preventDefault(); const v = $('#pi').value.trim(), e = $('#e');
        try {
          if (await rpc('tl_check_pin', { p_pin: v })) { pin = v; try { sessionStorage.setItem('hilos-pin', v); } catch (x) { /* sin almacenamiento */ } render(); }
          else { e.hidden = false; e.textContent = 'Ese código no es correcto.'; }
        } catch (x) { e.hidden = false; e.textContent = 'No hay conexión. Inténtalo de nuevo.'; }
      };
      return;
    }
    const an = analyse(), af = state.phase === 'afinidades';
    let h = '<main class="wrap control">' + offline() + '<h1>Control del taller</h1>'
      + '<p class="count"><b>' + an.ps.length + '</b> ' + (an.ps.length === 1 ? 'proyecto ha' : 'proyectos han') + ' enviado sus palabras</p>'
      + '<p class="phase">Ahora: <strong>' + (af ? 'cada una ve con quién se entrelaza' : 'están eligiendo palabras') + '</strong></p>'
      + '<button class="btn" id="ph">' + (af ? 'Volver a elegir palabras' : 'Mostrar con quién se entrelaza cada una') + '</button>'
      + '<a class="btn ghost" href="#/pantalla" target="_blank" rel="noopener">Abrir la pantalla grande</a>'
      + '<details class="planb" id="d1"><summary>Sin proyector: enseñar el código desde aquí</summary><div class="qr">' + qrSvg(joinUrl()) + '</div><p class="url">' + esc(shortUrl()) + '</p></details>'
      + '<h2 class="sub">Lo que une al grupo</h2>' + (an.ps.length ? knots(an) : '<p class="empty">Nadie ha entrado todavía.</p>')
      + (an.ps.length && an.unused.length ? '<details class="planb" id="d2"><summary>Conceptos que nadie ha elegido</summary><p class="unused">' + an.unused.map(esc).join(', ') + '</p></details>' : '')
      + '<h2 class="sub">Participantes</h2>' + (an.ps.length ? '<ul class="dir">' + an.ps.map(p =>
        '<li>' + avatar(p, 'lg') + '<div><strong>' + esc(p.project) + '</strong><span>de ' + esc(p.name) + '</span><div class="row">' + pills(p.keys, an) + '</div><button class="linkbtn danger" data-del="' + p.id + '">Quitar</button></div></li>').join('') + '</ul>' : '<p class="empty">Nadie ha entrado todavía.</p>')
      + '<button class="linkbtn danger" id="reset">Vaciar todo y empezar de cero</button></main>';
    const y = window.scrollY, o1 = $('#d1') && $('#d1').open, o2 = $('#d2') && $('#d2').open;
    app.innerHTML = h; window.scrollTo(0, y); if (o1) $('#d1').open = true; if (o2 && $('#d2')) $('#d2').open = true;
    const act = async (fn, body) => {
      try { const ok = await rpc(fn, Object.assign({ p_pin: pin }, body)); if (!ok) { pin = ''; toast('El código ya no es válido.'); } await refresh(true); }
      catch (e) { toast('No hay conexión. Inténtalo de nuevo.'); }
    };
    $('#ph').onclick = () => act('tl_set_phase', { p_phase: af ? 'palabras' : 'afinidades' });
    $('#reset').onclick = () => { if (confirm('Se borrarán todos los proyectos y palabras. ¿Vaciar todo?')) act('tl_reset', {}); };
    app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('¿Quitar este proyecto?')) act('tl_remove', { p_id: b.dataset.del }); });
  }

  /* ---------- Arranque ---------- */
  let toastT;
  function toast(m) { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 2600); }
  function render() {
    const r = route();
    document.body.className = r === 'pantalla' ? 'is-screen' : '';
    if (r === 'pantalla') return viewPantalla();
    if (r === 'pilu' || r === 'control') return viewControl();
    if (step === 'listo') return viewListo();
    if (step === 'palabras') return viewPalabras();
    viewHola();
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  let rz;
  window.addEventListener('resize', () => { if (route() === 'pantalla') { clearTimeout(rz); rz = setTimeout(render, 150); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (route() === 'pantalla') render(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  render();
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 3000);
})();
