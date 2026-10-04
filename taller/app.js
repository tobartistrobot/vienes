(function () {
  'use strict';
  const SB = 'https://udingbqooecgfjqpxpbl.supabase.co';
  const KEY = 'sb_publishable_kv-OaceZaIkT6dV_VH1S7w_CwiKNFHr';
  const MAX = 5;
  const QUESTION = '¿Qué podríamos hacer juntas?';

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
  let me = { token: uuid(), name: '', project: '', words: [], sent: false, id: null };
  try { const s = JSON.parse(localStorage.getItem(LS) || 'null'); if (s && s.token) me = Object.assign(me, s); } catch (e) { /* sin almacenamiento */ }
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(me)); } catch (e) { /* sin almacenamiento */ } };

  let state = { phase: 'palabras', participants: [] };
  let lastJson = '', online = true, step = me.sent ? 'listo' : 'hola', tab = 'mias', draft = me.words.slice();
  let pin = '';
  try { pin = sessionStorage.getItem('hilos-pin') || ''; } catch (e) { /* sin almacenamiento */ }

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
      return { id: p.id, name: p.name, project: p.project, keys: keys, labels: labels };
    });
    const count = {}, label = {};
    ps.forEach(p => p.keys.forEach(k => {
      count[k] = (count[k] || 0) + 1;
      if (!label[k]) label[k] = CONCEPT[k] ? CONCEPT[k].label : cap(p.labels[k].toLowerCase());
    }));
    const words = Object.keys(count).map(k => ({ k: k, label: label[k], n: count[k], fam: famOf(k) }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, 'es'));
    const unused = Object.keys(CONCEPT).filter(k => !count[k]).map(k => CONCEPT[k].label);
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
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

  /* ---------- Piezas ---------- */
  const THREADS = '<svg class="threads" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">'
    + '<path class="t1" d="M-10 20C70 20 90 100 170 96S260 20 330 34"/>'
    + '<path class="t2" d="M-10 96C60 100 110 18 180 22S270 96 330 84"/>'
    + '<path class="t3" d="M-10 60C80 30 120 86 200 58S280 40 330 62"/></svg>';

  function cloud(an, big) {
    if (!an.words.length) return '<p class="empty">Las palabras aparecerán aquí en cuanto alguien envíe las suyas.</p>';
    const max = an.words[0].n;
    const items = an.words.slice().sort((a, b) => hash(a.k) - hash(b.k)).map(w => {
      const t = max > 1 ? Math.sqrt((w.n - 1) / (max - 1)) : 0;
      return '<span class="cw f-' + w.fam + '" style="--s:' + t.toFixed(3) + '">' + esc(w.label)
        + (w.n > 1 ? '<sup>' + w.n + '</sup>' : '') + '</span>';
    }).join('');
    return '<div class="cloud' + (big ? ' big' : '') + '">' + items + '</div>';
  }
  function insights(an) {
    if (!an.ps.length) return '';
    const top = an.words.filter(w => w.n > 1).slice(0, 6);
    const solo = an.words.filter(w => w.n === 1).map(w => w.label);
    let h = '<div class="ins">';
    h += '<section><h3>Lo que más nos une</h3>' + (top.length ? '<ol class="bars">' + top.map(w =>
      '<li class="f-' + w.fam + '"><span class="bl">' + esc(w.label) + '</span><span class="bar" style="--w:' + (w.n / top[0].n * 100).toFixed(0) + '%"></span><span class="bn">' + w.n + '</span></li>').join('') + '</ol>'
      : '<p class="muted">Todavía no hay palabras repetidas.</p>') + '</section>';
    h += '<section><h3>Solo una lo eligió</h3><p class="list">' + (solo.length ? solo.map(esc).join(', ') : 'Ninguna palabra única por ahora.') + '</p>';
    if (an.unused.length) h += '<h3>Nadie lo eligió</h3><p class="list muted">' + an.unused.map(esc).join(', ') + '</p>';
    return h + '</section></div>';
  }
  function chips(keys, an, cls) {
    return keys.map(k => '<span class="chip on f-' + famOf(k) + ' ' + (cls || '') + '">' + esc(an.label[k] || k) + '</span>').join('');
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
      + '<h1>Hilos</h1><p class="lead">Cinco palabras por proyecto, para descubrir qué nos une.</p>'
      + '<form id="f" novalidate><label class="field"><span>Tu nombre</span><input class="input" id="n" maxlength="40" autocomplete="given-name" value="' + esc(me.name) + '"></label>'
      + '<label class="field"><span>El nombre de tu proyecto</span><input class="input" id="p" maxlength="60" autocomplete="off" value="' + esc(me.project) + '"></label>'
      + '<p class="err" id="e" hidden></p><button class="btn" type="submit">Elegir mis palabras</button></form></main>';
    $('#f').onsubmit = ev => {
      ev.preventDefault();
      const n = $('#n').value.trim(), p = $('#p').value.trim();
      if (!n || !p) { const e = $('#e'); e.hidden = false; e.textContent = 'Escribe tu nombre y el de tu proyecto para continuar.'; return; }
      me.name = n; me.project = p; save(); step = 'palabras'; render(); window.scrollTo(0, 0);
    };
  }
  function viewPalabras() {
    const dk = draft.map(norm);
    let h = '<main class="wrap pick"><header class="picktop"><p class="proj">' + esc(me.project) + '</p>'
      + '<h1>Elige las 5 palabras que mejor lo representan</h1>'
      + '<div class="slots" aria-live="polite">';
    for (let i = 0; i < MAX; i++) {
      h += draft[i] ? '<button class="slot full f-' + famOf(dk[i]) + '" data-rm="' + i + '" aria-label="Quitar ' + esc(draft[i]) + '">' + esc(draft[i]) + '<i>×</i></button>'
        : '<span class="slot">' + (i + 1) + '</span>';
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
  function toggle(w, addOnly) {
    const k = norm(w), i = draft.map(norm).indexOf(k);
    if (i >= 0) { if (addOnly) return toast('Esa palabra ya la tienes.'); draft.splice(i, 1); }
    else if (draft.length >= MAX) return toast('Ya tienes 5. Quita una para cambiarla.');
    else draft.push(w);
    viewPalabras();
  }
  async function send() {
    const b = $('#send'); b.disabled = true; b.textContent = 'Enviando…';
    try {
      me.id = await rpc('tl_join', { p_token: me.token, p_name: me.name, p_project: me.project, p_words: draft });
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
    let h = '<main class="wrap listo">' + offline();
    if (state.phase !== 'afinidades' || !mine) {
      h += '<h1>Tus palabras ya están en el telar</h1><p class="lead">' + plural(an.ps.length) + ' hasta ahora. En cuanto estéis todas, verás con quién compartes hilos.</p>'
        + '<div class="mine">' + (mine ? chips(mine.keys, an) : '') + '</div>' + cloud(an)
        + '<button class="linkbtn" id="edit">Cambiar mis palabras</button>';
    } else {
      h += '<nav class="tabs" role="tablist">' + [['mias', 'Mis hilos'], ['grupo', 'El grupo'], ['todas', 'Todas']].map(t =>
        '<button role="tab" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</nav>';
      if (tab === 'mias') {
        const ms = matchesFor(mine, an.ps);
        h += '<h1>Estos proyectos tiran de tus mismos hilos</h1><p class="lead">Levántate, búscalas y preguntaos: <strong>' + QUESTION + '</strong></p>';
        h += ms.length ? ms.map(m => card(m, an)).join('') : '<p class="empty">Aún eres la única. En cuanto entre alguien más aparecerá aquí.</p>';
        h += '<button class="linkbtn" id="edit">Cambiar mis palabras</button>';
      } else if (tab === 'grupo') {
        h += '<h1>Lo que mueve al grupo</h1>' + cloud(an) + insights(an);
      } else {
        h += '<h1>' + cap(plural(an.ps.length)) + '</h1><ul class="dir">' + an.ps.map(p =>
          '<li' + (p.id === me.id ? ' class="me"' : '') + '><strong>' + esc(p.project) + '</strong><span>' + esc(p.name) + '</span><div>' + chips(p.keys, an, 'mini') + '</div></li>').join('') + '</ul>';
      }
    }
    app.innerHTML = h + '</main>';
    app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); window.scrollTo(0, 0); });
    const e = $('#edit'); if (e) e.onclick = () => { draft = me.words.slice(); step = 'palabras'; render(); window.scrollTo(0, 0); };
  }
  function card(m, an) {
    let why;
    if (m.shared.length) why = '<p class="why">' + (m.shared.length === 1 ? 'Compartís 1 palabra' : 'Compartís ' + m.shared.length + ' palabras') + '</p><div class="shared">' + chips(m.shared, an) + '</div>';
    else if (m.near.length) why = '<p class="why">Vais en la misma dirección</p><div class="shared">' + m.near.map(n =>
      '<span class="pair f-' + n.fam + '">' + esc(an.label[n.mine]) + ' <i>y</i> ' + esc(an.label[n.theirs]) + '</span>').join('') + '</div>';
    else why = '<p class="why">Conexión inesperada</p><p class="muted">No compartís palabras, y por eso mismo puede salir algo que ninguna esperaba.</p>';
    return '<article class="match"><h2>' + esc(m.p.project) + '</h2><p class="who">Busca a ' + esc(m.p.name) + '</p>' + why + '</article>';
  }

  /* ---------- Pantalla grande ---------- */
  function viewPantalla() {
    const an = analyse(), af = state.phase === 'afinidades';
    let side = '<aside class="join">' + THREADS + '<h1>Hilos</h1>';
    if (!af) side += '<div class="qr">' + qrSvg(joinUrl()) + '</div><p class="how">Apunta con la cámara del móvil</p><p class="url">' + esc(shortUrl()) + '</p>';
    side += '<p class="count"><b>' + an.ps.length + '</b> ' + (an.ps.length === 1 ? 'proyecto' : 'proyectos') + '</p>';
    if (af) {
      const pairs = [];
      an.ps.forEach((a, i) => an.ps.slice(i + 1).forEach(b => { const x = affinity(a, b); if (x.shared.length > 1) pairs.push({ a: a, b: b, x: x }); }));
      pairs.sort((p, q) => q.x.score - p.x.score);
      side += '<h3>Los hilos más fuertes</h3>' + (pairs.length ? '<ul class="pairs">' + pairs.slice(0, 4).map(p =>
        '<li><strong>' + esc(p.a.project) + '</strong> y <strong>' + esc(p.b.project) + '</strong><span>' + p.x.shared.map(k => esc(an.label[k])).join(', ') + '</span></li>').join('') + '</ul>'
        : '<p class="muted">Mirad vuestro móvil para ver vuestros proyectos afines.</p>');
      side += '<p class="ask">' + QUESTION + '</p>';
    }
    side += '</aside>';
    app.innerHTML = '<main class="screen' + (af ? ' af' : '') + '">' + side + '<section class="stage">' + offline()
      + '<h2>' + (af ? 'Lo que mueve al grupo' : 'Las palabras de nuestros proyectos') + '</h2>' + cloud(an, true) + (af ? insights(an) : '') + '</section></main>';
    fit();
  }
  // Encoge la nube hasta que todo quepa en la pantalla, sin barras de desplazamiento.
  function fit() {
    const cl = $('.cloud.big'), st = $('.stage');
    if (!cl || window.innerWidth <= 760) return;
    let k = 1; cl.style.setProperty('--k', k);
    while (k > .28 && st.scrollHeight > st.clientHeight + 1) { k -= .04; cl.style.setProperty('--k', k.toFixed(2)); }
  }

  /* ---------- Control de la anfitriona ---------- */
  function viewControl() {
    if (!pin) {
      app.innerHTML = '<main class="wrap hola"><h1>Control</h1><p class="lead">Escribe el código de la anfitriona.</p>'
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
      + '<p class="phase">Ahora: <strong>' + (af ? 'cada una ve sus proyectos afines' : 'están eligiendo palabras') + '</strong></p>'
      + '<button class="btn" id="ph">' + (af ? 'Volver a elegir palabras' : 'Mostrar los proyectos afines') + '</button>'
      + '<a class="btn ghost" href="#/pantalla" target="_blank" rel="noopener">Abrir la pantalla grande</a>'
      + '<details class="planb"><summary>Sin proyector: enseñar el código desde aquí</summary><div class="qr">' + qrSvg(joinUrl()) + '</div><p class="url">' + esc(shortUrl()) + '</p></details>'
      + '<h2>Palabras del grupo</h2>' + cloud(an) + (af ? insights(an) : '')
      + '<h2>Participantes</h2>' + (an.ps.length ? '<ul class="dir">' + an.ps.map(p =>
        '<li><strong>' + esc(p.project) + '</strong><span>' + esc(p.name) + '</span><div>' + chips(p.keys, an, 'mini') + '</div><button class="linkbtn danger" data-del="' + p.id + '">Quitar</button></li>').join('') + '</ul>' : '<p class="empty">Nadie ha entrado todavía.</p>')
      + '<button class="linkbtn danger" id="reset">Vaciar todo y empezar de cero</button></main>';
    const y = window.scrollY, open = $('.planb') && $('.planb').open; app.innerHTML = h; window.scrollTo(0, y); if (open) $('.planb').open = true;
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
  window.addEventListener('resize', () => { if (route() === 'pantalla') render(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  render();
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 3000);
})();
