(function () {
  'use strict';
  const SB = 'https://udingbqooecgfjqpxpbl.supabase.co';
  const KEY = 'sb_publishable_kv-OaceZaIkT6dV_VH1S7w_CwiKNFHr';
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app'), sheetEl = $('#sheet'), matchEl = $('#match'), toastEl = $('#toast');
  const PL = window.PLACES, PBY = {};
  PL.forEach(p => { PBY[p.id] = p; });
  const CATC = { cultura: '#6B3FA0', gastro: '#C2560C', natura: '#2E7D4F', bienestar: '#2463A6', compras: '#C0272D' };
  function inCat(p, c) { return c === 'todo' || p.c === c || p.c2 === c; }
  const CATS = window.CATS, CATN = {};
  CATS.forEach(c => { CATN[c[0]] = c[1]; });
  const DAYS = window.DAYS, DAYKEYS = Object.keys(DAYS);
  const EMOJIS = ['🌸', '🌷', '🌻', '🍀', '🦋', '🐝', '🦊', '🐱', '🦉', '🐬', '🍓', '🍋', '🍒', '🥐', '🎨', '🎻', '📚', '🎧', '⭐', '🌙', '🔥', '🌈', '💃', '🚲'];
  const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const DOWL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const VOTE = { 0: ['no', 'No quiero ir'], 1: ['meh', 'No me importaría'], 2: ['love', 'Me encantaría'] };
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M15 8.6a4 4 0 1 0 0 6.8M7.5 11h5M7.5 13.5h5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/></svg>',
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="13" height="16" rx="1"/><path d="M3.5 7v13.5h11"/></svg>',
    both: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c1-4 4-6 7.5-6s6.500 2 7.500 6"/></svg>',
    no: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    meh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V20H4.500V11zM7 11l4-7c1.500 0 2.500 1 2.500 2.500V10h4.500c1.200 0 2 1 1.800 2.200l-1.200 6C18.900 19.300 18 20 17 20H7"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>',
    love: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21c-5.500-4.200-9-7.400-9-11.500C3 6.500 5.200 4.500 7.800 4.500c1.700 0 3.300.9 4.200 2.400.9-1.500 2.500-2.400 4.200-2.400C18.800 4.500 21 6.500 21 9.500c0 4.100-3.500 7.300-9 11.500z"/></svg>'
  };

  /* ---------- almacenamiento ---------- */
  const mem = {};
  const store = {
    get(k) { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch (e) { /* sin almacenamiento */ } return k in mem ? mem[k] : null; },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
    del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* sin almacenamiento */ } }
  };

  const S = {
    token: store.get('vm_token'), me: null, users: {}, votes: {}, mine: {}, props: [], loaded: false,
    tab: 'deck', cat: 'todo', seg: 'sitios', voteF: { 1: false, 2: false }, clashF: false, edit: null, skipped: [], meetSeg: 'todas', last: null, confirmCancel: null, drag: false
  };
  let IMG = {};
  try { IMG = JSON.parse(store.get('vm_img_v1') || '{}') || {}; } catch (e) { IMG = {}; }

  const linkCode = (new URLSearchParams(location.search).get('c') || '').trim();
  const G = { step: 'in', name: '', pin: '', code: linkCode || store.get('vm_code') || '', askCode: !linkCode, err: '', busy: false };
  const F = { pid: null, sel: 0, hour: null, note: '', busy: false };

  /* ---------- utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function dparts(s) { const a = s.split('-').map(Number); return { d: a[2], dow: new Date(Date.UTC(a[0], a[1] - 1, a[2])).getUTCDay() }; }
  function dayShort(s) { const p = dparts(s); return DOW[p.dow].charAt(0).toUpperCase() + DOW[p.dow].slice(1) + ' ' + p.d; }
  function dayLong(s) { const p = dparts(s); return DOWL[p.dow] + ' ' + p.d + ' de octubre'; }
  function today() { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); }
  function mins(t) { const a = t.split(':').map(Number); return a[0] * 60 + a[1]; }
  function listNames(arr, max) {
    const n = arr.map(u => u.id === S.me ? 'tú' : u.name);
    if (n.length <= max) return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : (n[0] || '');
    return n.slice(0, max).join(', ') + ' y ' + (n.length - max) + ' más';
  }
  function av(u, cls) { if (!u) return ''; return '<span class="av c' + (hash(u.id) % 6) + (cls ? ' ' + cls : '') + '" title="' + esc(u.name) + '">' + esc(u.emoji) + '</span>'; }
  function stack(ids, max) {
    const us = ids.map(id => S.users[id]).filter(Boolean);
    return us.slice(0, max).map(u => av(u)).join('') + (us.length > max ? '<span class="more">+' + (us.length - max) + '</span>' : '');
  }
  function voters(pid, v) {
    const m = S.votes[pid] || {};
    return Object.keys(m).filter(id => m[id] === v && S.users[id]).map(id => S.users[id])
      .sort((a, b) => (a.id === S.me ? -1 : b.id === S.me ? 1 : a.name.localeCompare(b.name, 'es')));
  }
  function photo(p, small) {
    const src = IMG[p.id];
    const ph = '<div class="ph"><span>' + p.e + '</span></div>';
    if (small) return '<div class="thumb"><div class="ph">' + p.e + '</div>' + (src ? '<img src="' + esc(src) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div>';
    return ph + (src ? '<img src="' + esc(src) + '" alt="" draggable="false" onerror="this.remove()">' : '');
  }
  function whenDays(p) { const seen = []; (p.when || []).forEach(w => { if (seen.indexOf(w[0]) < 0) seen.push(w[0]); }); return seen; }
  function whenText(p) {
    const d = whenDays(p);
    if (!d.length) return '';
    if (d.length > 4) return 'Varias fechas del ' + dparts(d[0]).d + ' al ' + dparts(d[d.length - 1]).d;
    const n = d.map(x => { const q = dparts(x); return 'DLMXJVS'.charAt(q.dow) + ' ' + q.d; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0];
  }
  function mapsUrl(p) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.q || p.n); }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { toastEl.hidden = true; }, 3200);
  }

  /* ---------- servidor ---------- */
  async function rpc(fn, args) {
    const r = await fetch(SB + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify(args)
    });
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }
  async function load() {
    const d = await rpc('vm_state', { p_token: S.token });
    if (d.error) { signOutLocal(); return false; }
    S.me = d.me; S.users = {}; S.votes = {}; S.mine = {};
    d.users.forEach(u => { S.users[u.id] = u; });
    d.votes.forEach(v => {
      if (!PBY[v[1]]) return;
      if (v[0] === S.me) S.mine[v[1]] = v[2];
      if (v[2] > 0) { (S.votes[v[1]] = S.votes[v[1]] || {})[v[0]] = v[2]; }
    });
    S.props = d.proposals.filter(m => PBY[m.p]);
    S.loaded = true;
    return true;
  }
  function signOutLocal() {
    store.del('vm_token'); S.token = null; S.loaded = false; S.me = null; G.step = 'in'; G.pin = ''; G.err = ''; G.busy = false;
    closeSheet(); matchEl.hidden = true;
  }
  async function refresh(soft) {
    try { const ok = await load(); if (!ok) { render(); return; } } catch (e) { if (!soft) toast('Sin conexión. Se reintentará sola.'); return; }
    if (soft) softRender(); else render();
  }
  async function loadImages() {
    const need = PL.filter(p => p.w && !(p.id in IMG));
    if (!need.length) return;
    for (let i = 0; i < need.length; i += 40) {
      const batch = need.slice(i, i + 40);
      try {
        const u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=900&pilimit=50&titles=' +
          encodeURIComponent(batch.map(p => p.w).join('|'));
        const j = await (await fetch(u)).json();
        const norm = {}, red = {}, by = {};
        (j.query.normalized || []).forEach(n => { norm[n.from] = n.to; });
        (j.query.redirects || []).forEach(n => { red[n.from] = n.to; });
        Object.keys(j.query.pages || {}).forEach(k => { const pg = j.query.pages[k]; if (pg.thumbnail) by[pg.title] = pg.thumbnail.source; });
        batch.forEach(p => { let t = p.w; t = norm[t] || t; t = red[t] || t; IMG[p.id] = by[t] || ''; });
      } catch (e) { /* se reintenta en la próxima visita */ }
    }
    store.set('vm_img_v1', JSON.stringify(IMG));
    softRender();
  }

  /* ---------- entrada ---------- */
  const ERR = {
    name: 'Escribe tu nombre (entre 2 y 24 letras).',
    pin_format: 'El PIN son 4 cifras.',
    locked: 'Demasiados intentos con ese nombre. Espera 10 minutos y vuelve a probar.',
    full: 'El grupo ya está completo.'
  };
  function renderGate() {
    const newStep = G.step === 'new';
    app.innerHTML = '<div class="gate"><div class="checker"></div><div class="wrap gate-in">' +
      '<h1>¿Vienes?</h1><p class="lead">Vota los sitios de Viena que te apetecen y mira quién quiere ir contigo.</p>' +
      (G.err ? '<div class="err" role="alert">' + esc(G.err) + '</div>' : '') +
      '<form id="gate" novalidate>' +
      (newStep
        ? '<div class="newbox"><h2>¿Es tu primera vez?</h2><p>No hay ninguna cuenta con el nombre «' + esc(G.name.trim()) + '». La creamos ahora con el PIN que has escrito.</p>' +
          (G.askCode ? '<label class="field"><span>Código del grupo</span><input class="input" id="g-code" autocomplete="off" autocapitalize="characters" value="' + esc(G.code) + '"><small>Está en el mensaje de invitación.</small></label>' : '') +
          '<button class="btn" ' + (G.busy ? 'disabled' : '') + '>' + (G.busy ? 'Creando…' : 'Crear mi cuenta') + '</button></div>' +
          '<button type="button" class="linkbtn" data-act="gate-back">Ya tenía cuenta: corregir el nombre</button>'
        : '<label class="field"><span>Tu nombre</span><input class="input" id="g-name" autocomplete="name" maxlength="24" value="' + esc(G.name) + '"><small>Si tu nombre se repite en el grupo, añade el apellido.</small></label>' +
          '<label class="field"><span>PIN de 4 cifras</span><input class="input pin" id="g-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" value="' + esc(G.pin) + '"><small>Si es tu primera vez, elige el que quieras y recuérdalo.</small></label>' +
          '<button class="btn" ' + (G.busy ? 'disabled' : '') + '>' + (G.busy ? 'Entrando…' : 'Entrar') + '</button>') +
      '</form></div></div>';
  }
  async function enter() {
    const newStep = G.step === 'new';
    if (!newStep) { G.name = $('#g-name').value; G.pin = $('#g-pin').value.trim(); }
    else if (G.askCode) G.code = $('#g-code').value.trim();
    if (G.name.trim().length < 2) { G.err = ERR.name; renderGate(); return; }
    if (!/^[0-9]{4}$/.test(G.pin)) { G.err = ERR.pin_format; renderGate(); return; }
    G.busy = true; G.err = ''; renderGate();
    try {
      const r = await rpc('vm_enter', {
        p_name: G.name, p_pin: G.pin, p_code: newStep ? G.code : null,
        p_emoji: newStep ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null
      });
      if (r.token) {
        S.token = r.token; store.set('vm_token', r.token);
        if (newStep && G.code) store.set('vm_code', G.code);
        G.busy = false; G.pin = '';
        await boot(r.new);
        return;
      }
      if (r.error === 'code') {
        if (newStep) { G.askCode = true; G.err = 'Ese código del grupo no es correcto. Está en el mensaje de invitación.'; }
        else G.step = 'new';
      } else if (r.error === 'pin_wrong') {
        G.err = 'Ese no es el PIN de «' + G.name.trim() + '». Si otra compañera ya usa ese nombre, añade tu apellido.';
      } else G.err = ERR[r.error] || 'No se ha podido entrar. Inténtalo otra vez.';
    } catch (e) { G.err = 'No hay conexión. Comprueba internet e inténtalo otra vez.'; }
    G.busy = false; renderGate();
  }

  /* ---------- armazón ---------- */
  function pendingMeets() {
    const t = today();
    return S.props.filter(m => m.day >= t && m.att.indexOf(S.me) < 0 && S.mine[m.p] > 0).length;
  }
  function render() {
    if (!S.token) { renderGate(); return; }
    if (!S.loaded) { app.innerHTML = '<div class="spin">Cargando…</div>'; return; }
    const me = S.users[S.me];
    const body = S.tab === 'deck' ? viewDeck() : S.tab === 'match' ? viewMatch() : S.tab === 'meet' ? viewMeet() : viewMe();
    const pend = pendingMeets();
    const tab = (id, icon, label, badge) => '<button class="tab" data-act="tab" data-id="' + id + '"' + (S.tab === id ? ' aria-current="page"' : '') + '>' + icon + '<span>' + label + '</span>' + (badge ? '<span class="badge">' + badge + '</span>' : '') + '</button>';
    app.innerHTML = '<div class="wrap"><header class="top"><div class="brand">¿Vienes?</div>' +
      (body.left ? '<span class="left">' + 'Quedan ' + body.left + ' de ' + body.total + '</span>' : '') +
      '<button class="me-chip" data-act="tab" data-id="me" aria-label="Tu perfil">' + esc(me ? me.name : '') + av(me) + '</button></header></div>' +
      '<main class="wrap' + (body.bar ? ' has-votebar' : '') + '">' + body.html + '</main>' + (body.bar || '') +
      '<nav class="tabs" aria-label="Secciones"><div class="tabs-in">' +
      tab('deck', ICON.cards, 'Descubrir') + tab('match', ICON.both, 'Coincidencias') + tab('meet', ICON.cal, 'Quedadas', pend) + tab('me', ICON.me, 'Mi cuenta') +
      '</div></nav>';
    if (S.tab === 'deck') { fitDeck(); bindDrag(); }
  }
  // La ficha ocupa justo el hueco entre los filtros y los botones: la foto se encoge y no hay que hacer scroll.
  function fitDeck() {
    const d = $('.deck'), bar = $('.votebar'), main = $('main'), tabs = $('.tabs');
    if (!d || !bar || !main || !tabs) return;
    d.classList.remove('fit'); d.style.height = ''; main.style.paddingBottom = '';
    const top = d.getBoundingClientRect().top + window.scrollY;
    const avail = window.innerHeight - top - bar.offsetHeight - tabs.offsetHeight - 8;
    if (avail >= 300) {
      d.classList.add('fit'); d.style.height = Math.min(avail, 680) + 'px';
      main.style.paddingBottom = (bar.offsetHeight + tabs.offsetHeight) + 'px';
    }
  }
  function softRender() {
    if (S.drag || !S.token) return;
    const a = document.activeElement;
    if (a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)) return;
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  /* ---------- fichas ---------- */
  function facts(p, short) {
    const li = (ic, t) => t ? '<li>' + ICON[ic] + '<span>' + t + '</span></li>' : '';
    return '<ul class="facts">' +
      li('cal', p.when ? esc(whenText(p)) : '') + li('clock', esc(p.h) + (p.h2 ? '<br>' + esc(p.h2) : '')) + li('euro', esc(p.pr)) +
      li('pin', p.where ? esc(p.where) : p.dist ? 'A ' + esc(p.dist) + ' del hotel' : '') + (short ? '' : li('time', esc(p.dur)) + li('tip', esc(p.tip))) + '</ul>';
  }
  function links(p, more) {
    return '<div class="links"><a href="' + esc(mapsUrl(p)) + '" target="_blank" rel="noopener">Ver en el mapa</a>' +
      '<a href="' + esc(webUrl(p)) + '" target="_blank" rel="noopener">Web y entradas</a>' +
      (more ? '<button data-act="open" data-id="' + p.id + '">Ficha completa</button>' : '') + '</div>';
  }
  function webUrl(p) { return p.url || 'https://www.google.com/search?q=' + encodeURIComponent(p.q || p.n); }
  function tag2(p) { return p.when ? '<span class="tag dated">Con fecha fija</span>' : p.ex ? '<span class="tag dated">Excursión</span>' : ''; }
  function deckFacts(p) {
    const hor = [p.when ? whenText(p) : '', p.h].filter(Boolean).join('. ');
    return '<ul class="facts">' +
      (hor ? '<li>' + ICON.clock + '<span>' + esc(hor) + (p.h2 ? '<br>' + esc(p.h2) : '') + '</span></li>' : '') +
      (p.pr ? '<li>' + ICON.euro + '<span class="cl2">' + esc(p.pr) + '</span></li>' : '') +
      '<li class="loc">' + ICON.pin + '<span>' + (p.where ? esc(p.where) : 'A ' + esc(p.dist) + ' del hotel') +
      ' <a href="' + esc(mapsUrl(p)) + '" target="_blank" rel="noopener">Ver en el mapa</a></span></li></ul>';
  }
  function cardHTML(p, behind) {
    return '<article class="card' + (behind ? ' behind' : '') + '"' + (behind ? ' aria-hidden="true"' : ' id="topcard" data-id="' + p.id + '"') + '>' +
      '<div class="photo">' + photo(p) + '<span class="tags"><span class="tag c-' + p.c + '">' + CATN[p.c] + '</span>' + (p.c2 ? '<span class="tag c-' + p.c2 + '">' + CATN[p.c2] + '</span>' : '') + '</span>' + tag2(p) +
      (behind ? '' : (S.last ? '<button class="pbtn left" data-act="undo"><b>←</b> Deshacer voto</button>' : '') +
        '<button class="pbtn right" data-act="skip" data-id="' + p.id + '">Pasar al siguiente <b>→</b></button>') + '</div>' +
      '<div class="stripe" style="background:' + (p.c2 ? 'linear-gradient(90deg,' + CATC[p.c] + ' 50%,' + CATC[p.c2] + ' 50%)' : CATC[p.c]) + '"></div>' +
      (behind ? '' : '<span class="stamp yes">Me encantaría</span><span class="stamp nope">No quiero ir</span>') +
      '<div class="card-body"><h2>' + esc(p.n) + '</h2><p class="desc">' + esc(p.d) + '</p>' + deckFacts(p) +
      (behind ? '' : '<div class="cbtns"><button class="cbtn" data-act="open" data-id="' + p.id + '">' + ICON.eye + 'Ficha completa</button>' +
        '<a class="cbtn" href="' + esc(webUrl(p)) + '" target="_blank" rel="noopener">' + ICON.ticket + 'Web y entradas</a></div>') +
      '</div></article>';
  }
  function deckList() {
    const l = PL.filter(p => inCat(p, S.cat) && !(p.id in S.mine));
    return l.filter(p => S.skipped.indexOf(p.id) < 0).concat(S.skipped.map(id => l.filter(p => p.id === id)[0]).filter(Boolean));
  }
  function voteButtons(cur, act) {
    return '<div class="votes">' + [0, 1, 2].map(v =>
      '<button class="vote ' + VOTE[v][0] + '" data-act="' + act + '" data-v="' + v + '"' + (cur === undefined ? '' : ' aria-pressed="' + (cur === v) + '"') + '>' + ICON[VOTE[v][0]] + '<span>' + VOTE[v][1] + '</span></button>').join('') + '</div>';
  }
  function viewDeck() {
    const list = deckList(), left = PL.filter(p => !(p.id in S.mine)).length;
    const chips = '<div class="chips" role="group" aria-label="Tipo de plan">' + CATS.map(c =>
      '<button class="chip' + (c[0] === 'todo' ? '' : ' c-' + c[0]) + '" data-act="cat" data-id="' + c[0] + '" aria-pressed="' + (S.cat === c[0]) + '">' + c[1] + '</button>').join('') + '</div>';
    const undo = S.last ? '<button class="linkbtn" data-act="undo">Deshacer el último voto</button>' : '<span></span>';
    if (!list.length) {
      const all = left === 0;
      return { html: chips + '<div class="empty"><h2>' + (all ? 'Has votado todas las fichas' : 'No quedan fichas de este tipo') + '</h2><p>' +
        (all ? 'Mira ahora con quién coincides y proponed día y hora.' : 'Te quedan ' + left + ' en otras categorías.') + '</p>' +
        (all ? '<button class="btn" data-act="tab" data-id="match">Ver coincidencias</button>' : '<button class="btn" data-act="cat" data-id="todo">Ver todas las fichas</button>') +
        '</div><div class="deck-meta">' + undo + '</div>' };
    }
    return {
      html: chips + '<div class="deck">' + (list[1] ? cardHTML(list[1], true) : '') + cardHTML(list[0]) +
        '</div>',
      left: list.length, total: PL.filter(p => inCat(p, S.cat)).length,
      bar: '<div class="votebar"><div class="wrap">' + voteButtons(undefined, 'vote') + '</div></div>'
    };
  }
  function setLocal(pid, v) {
    if (v === null) { delete S.mine[pid]; if (S.votes[pid]) delete S.votes[pid][S.me]; return; }
    S.mine[pid] = v; S.votes[pid] = S.votes[pid] || {};
    if (v > 0) S.votes[pid][S.me] = v; else delete S.votes[pid][S.me];
  }
  async function vote(pid, v, fromDeck) {
    const prev = pid in S.mine ? S.mine[pid] : null;
    if (prev === v) return;
    setLocal(pid, v);
    if (fromDeck) S.last = { pid: pid, prev: prev };
    render();
    if (!sheetEl.hidden && F.pid === pid) renderPlace();
    if (v === 2) {
      const others = voters(pid, 2).filter(u => u.id !== S.me);
      if (others.length) announceMatch(pid, others, fromDeck);
    }
    try { const r = await rpc('vm_vote', { p_token: S.token, p_place: pid, p_vote: v }); if (r.error) throw new Error(r.error); }
    catch (e) { setLocal(pid, prev); toast('No se ha guardado el voto. Comprueba la conexión.'); render(); if (!sheetEl.hidden && F.pid === pid) renderPlace(); }
  }
  let flying = false;
  function flyVote(v) {
    const card = $('#topcard');
    if (!card || flying) return;
    flying = true;
    const pid = card.dataset.id;
    card.classList.remove('back'); card.classList.add('fly');
    card.style.transform = v === 0 ? 'translateX(-120%) rotate(-14deg)' : v === 2 ? 'translateX(120%) rotate(14deg)' : 'translateY(-30px) scale(.92)';
    card.style.opacity = '0';
    setTimeout(() => { flying = false; vote(pid, v, true); window.scrollTo(0, 0); }, reduced ? 0 : 250);
  }
  function bindDrag() {
    const card = $('#topcard');
    if (!card) return;
    let sx = 0, sy = 0, dx = 0, on = false, id = null;
    const yes = $('.stamp.yes', card), nope = $('.stamp.nope', card);
    const reset = () => { on = false; S.drag = false; card.classList.add('back'); card.style.transform = ''; yes.style.opacity = 0; nope.style.opacity = 0; };
    card.addEventListener('pointerdown', e => {
      if (flying || e.target.closest('a,button')) return;
      sx = e.clientX; sy = e.clientY; dx = 0; id = e.pointerId; on = false;
    });
    card.addEventListener('pointermove', e => {
      if (id !== e.pointerId) return;
      dx = e.clientX - sx;
      if (!on) {
        if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
        on = true; S.drag = true; card.classList.remove('back');
        try { card.setPointerCapture(id); } catch (err) { /* sin captura */ }
      }
      card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 20) + 'deg)';
      yes.style.opacity = Math.max(0, Math.min(1, dx / 90));
      nope.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    const end = e => {
      if (id !== e.pointerId) return;
      id = null;
      if (!on) return;
      S.drag = false; on = false;
      if (e.type === 'pointerup' && Math.abs(dx) > 90) flyVote(dx > 0 ? 2 : 0); else reset();
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }
  function announceMatch(pid, others, big) {
    const p = PBY[pid], names = listNames(others, 3);
    const seen = Number(store.get('vm_match_seen') || 0);
    const txt = 'A ' + names + ' también ' + (others.length > 1 ? 'les' : 'le') + ' encantaría';
    if (!big || seen >= 3) { toast(txt + ' ir.'); return; }
    store.set('vm_match_seen', String(seen + 1));
    matchEl.innerHTML = '<div class="checker"></div><div class="wrap match-in"><h2>¡Coincidís!</h2><div class="after" style="display:grid;gap:18px">' +
      '<div class="stack">' + stack(others.map(u => u.id), 6) + '</div>' +
      '<p>' + esc(txt) + ' ir a <b>' + esc(p.n) + '</b>.</p>' +
      '<div style="display:grid;gap:10px"><button class="btn" data-act="match-propose" data-id="' + pid + '">Proponer día y hora</button>' +
      '<button class="btn ghost" data-act="match-close">Seguir votando</button></div></div></div>';
    matchEl.hidden = false;
  }

  /* ---------- coincidencias ---------- */
  function viewMatch() {
    const seg = '<div class="seg" role="group"><button data-act="seg" data-id="sitios" aria-pressed="' + (S.seg === 'sitios') + '">Sitios</button>' +
      '<button data-act="seg" data-id="gente" aria-pressed="' + (S.seg === 'gente') + '">Compañeras</button></div>';
    return { html: seg + (S.seg === 'sitios' ? matchPlaces() : matchPeople()) };
  }
  function matchPlaces() {
    let rows = PL.map(p => ({ p: p, love: voters(p.id, 2), meh: voters(p.id, 1) })).filter(r => r.love.length + r.meh.length > 0);
    if (S.voteF[1] || S.voteF[2]) rows = rows.filter(r => S.voteF[S.mine[r.p.id]]);
    const ov = overlaps();
    rows.sort((a, b) => (b.love.length - a.love.length) || (b.meh.length - a.meh.length));
    const head = '<h1 class="h-sec">Dónde quiere ir el grupo</h1><p class="sub">De más a menos apoyos. Los «no quiero ir» son privados: solo los ve quien los marca.</p>' +
      '<div class="chips wrapc" role="group" aria-label="Filtrar por mi voto"><button class="chip f-love" data-act="votef" data-v="2" aria-pressed="' + S.voteF[2] + '">' + ICON.love + 'Me encantaría</button>' +
      '<button class="chip f-meh" data-act="votef" data-v="1" aria-pressed="' + S.voteF[1] + '">' + ICON.meh + 'No me importaría</button>' +
      '<button class="chip f-clash" data-act="clashf" aria-pressed="' + S.clashF + '">' + ICON.cal + 'Se solapan' + (ov.length ? ' (' + ov.length + ')' : '') + '</button></div>';
    if (S.clashF) {
      if (!ov.length) return head + '<div class="empty"><h2>Ningún plan se te solapa</h2><p>Tus quedadas y los planes con fecha fija que has marcado no coinciden en día y hora.</p></div>';
      return head + '<p class="sub">Planes tuyos que coinciden el mismo día con menos de dos horas de margen.</p>' + ov.map(o =>
        '<div class="meet"><h3>' + dayLong(o.day) + '</h3><ul class="clash">' + o.items.map(i =>
          '<li><b>' + esc(i.hour) + '</b><button data-act="open" data-id="' + i.p.id + '">' + esc(i.p.n) + '</button><span class="by">' + i.kind + '</span></li>').join('') +
        '</ul><p class="by">' + o.why + '</p></div>').join('');
    }
    if (!rows.length) {
      return head + '<div class="empty"><h2>' + (S.voteF[1] || S.voteF[2] ? 'No tienes ningún sitio con ese voto' : 'Todavía no hay votos') + '</h2><p>Empieza por las fichas: en cuanto haya votos, aquí verás quién quiere ir a cada sitio.</p><button class="btn" data-act="tab" data-id="deck">Ir a las fichas</button></div>';
    }
    return head + '<div class="rows">' + rows.map(r => {
      const mv = S.mine[r.p.id], n = S.props.filter(m => m.p === r.p.id && m.day >= today()).length;
      return '<button class="row" data-act="open" data-id="' + r.p.id + '">' + photo(r.p, true) + '<div class="row-body"><h3>' + esc(r.p.n) +
        (mv !== undefined ? '<span class="mine ' + VOTE[mv][0] + '">Tú: ' + VOTE[mv][1].toLowerCase() + '</span>' : '') + '</h3>' +
        '<div class="counts"><span><i class="dot love"></i><b>' + r.love.length + '</b> les encantaría</span><span><i class="dot meh"></i><b>' + r.meh.length + '</b> no les importaría</span>' +
        (n ? '<span><b>' + n + '</b> ' + (n === 1 ? 'quedada' : 'quedadas') + '</span>' : '') + '</div>' +
        '<div class="stack">' + stack(r.love.concat(r.meh).map(u => u.id), 8) + '</div><span class="go">Ver quién va y proponer día</span></div></button>';
    }).join('') + '</div>';
  }
  function sharedWith(uid) {
    const both = [], strong = [];
    PL.forEach(p => {
      const a = S.mine[p.id], b = (S.votes[p.id] || {})[uid];
      if (a > 0 && b > 0) { both.push(p); if (a === 2 && b === 2) strong.push(p); }
    });
    return { both: both, strong: strong };
  }
  function matchPeople() {
    const others = Object.keys(S.users).filter(id => id !== S.me).map(id => { const s = sharedWith(id); return { u: S.users[id], both: s.both, strong: s.strong }; });
    others.sort((a, b) => (b.strong.length - a.strong.length) || (b.both.length - a.both.length) || a.u.name.localeCompare(b.u.name, 'es'));
    const head = '<h1 class="h-sec">Con quién coincides más</h1><p class="sub">Compañeras que quieren ir a los mismos sitios que tú.</p>';
    if (!others.length) return head + '<div class="empty"><h2>Aún no ha entrado nadie más</h2><p>Comparte el enlace con el grupo: lo tienes en «Mi cuenta».</p><button class="btn" data-act="tab" data-id="me">Ir a Mi cuenta</button></div>';
    return head + '<div class="rows">' + others.map(o =>
      '<button class="person" data-act="person" data-id="' + o.u.id + '">' + av(o.u, 'lg') + '<div><h3>' + esc(o.u.name) + '</h3><p>' +
      (o.both.length ? 'Coincidís en ' + o.both.length + (o.both.length === 1 ? ' sitio' : ' sitios') + (o.strong.length ? '; ' + o.strong.length + (o.strong.length === 1 ? ' os encanta' : ' os encantan') + ' a las dos' : '') : 'Todavía sin coincidencias') +
      '</p></div></button>').join('') + '</div>';
  }

  /* ---------- quedadas ---------- */
  function eventLabel(p, day, hour) {
    const w = (p.when || []).filter(x => x[0] === day && x[2]);
    if (!w.length) return '';
    const exact = w.filter(x => x[1] === hour)[0] || w[0];
    return exact[2];
  }
  function meetHTML(m, inSheet) {
    const p = PBY[m.p], going = m.att.indexOf(S.me) >= 0, by = S.users[m.by], ev = eventLabel(p, m.day, m.hour);
    const people = m.att.map(id => S.users[id]).filter(Boolean).sort((a, b) => (a.id === S.me ? -1 : b.id === S.me ? 1 : 0));
    return '<div class="meet"><div class="meet-top"><div class="hour">' + esc(m.hour) + '</div><div>' +
      (inSheet ? '<h3>' + dayLong(m.day) + '</h3>' : '<h3><button data-act="open" data-id="' + p.id + '" style="text-align:left;font-weight:700;text-decoration:underline;text-underline-offset:3px">' + esc(p.n) + '</button></h3>') +
      (ev ? '<div class="by">' + esc(ev) + '</div>' : '') + (m.note ? '<p class="note">' + esc(m.note) + '</p>' : '') +
      '<div class="by">La propone ' + esc(by ? (by.id === S.me ? 'tú' : by.name) : 'una compañera') + '</div></div></div>' +
      '<div class="stack">' + stack(people.map(u => u.id), 8) + '</div>' +
      '<div class="by">' + (people.length ? (people.length === 1 && people[0].id === S.me ? 'De momento vas solo tú' : (people.length === 1 ? 'Va ' : 'Van ') + esc(listNames(people, 5))) : 'Todavía no va nadie') + '</div>' +
      '<div class="meet-actions">' + (going ? '<button class="btn small leave" data-act="leave" data-id="' + m.id + '">Ya no voy</button>' : '<button class="btn small join" data-act="join" data-id="' + m.id + '">Me apunto</button>') +
      (m.by === S.me ? '<button class="linkbtn" style="font-size:14px" data-act="cancel" data-id="' + m.id + '">' + (S.confirmCancel === m.id ? 'Toca otra vez para cancelarla' : 'Cancelar la quedada') + '</button>' : '') +
      '</div></div>';
  }
  // Quedadas mías el mismo día con menos de dos horas entre una y otra.
  function clashes() {
    const t = today(), mine = S.props.filter(m => m.day >= t && m.att.indexOf(S.me) >= 0).sort((a, b) => (a.day + a.hour).localeCompare(b.day + b.hour)), out = [];
    for (let i = 1; i < mine.length; i++) {
      const a = mine[i - 1], b = mine[i];
      if (a.day === b.day && mins(b.hour) - mins(a.hour) < 120) out.push([a, b]);
    }
    return out;
  }
  // Planes míos que coinciden en día y hora: quedadas a las que voy y planes de un solo día con hora fija que he marcado.
  function overlaps() {
    const t = today(), out = [], items = [];
    S.props.filter(m => m.day >= t && m.att.indexOf(S.me) >= 0).forEach(m => items.push({ day: m.day, hour: m.hour, p: PBY[m.p], q: true, kind: 'Quedada' }));
    PL.forEach(p => {
      if (!(S.mine[p.id] > 0) || !p.when || whenDays(p).length !== 1 || !p.when[0][1] || p.when[0][0] < t) return;
      const w = p.when[0], free = (DAYS[w[0]] || {}).free;
      if (items.some(i => i.q && i.p.id === p.id && i.day === w[0])) return;
      const it = { day: w[0], hour: w[1], p: p, q: false, kind: 'Plan con fecha fija' };
      items.push(it);
      if (free && mins(w[1]) < mins(free)) out.push({ day: w[0], items: [it], why: 'Empieza antes de que termine el programa de ese día, que acaba a las ' + free + '.' });
    });
    items.sort((a, b) => (a.day + a.hour).localeCompare(b.day + b.hour));
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1], b = items[i];
      if (a.day === b.day && a.p.id !== b.p.id && mins(b.hour) - mins(a.hour) < 120) out.push({ day: a.day, items: [a, b],
        why: a.q && b.q ? 'Son dos quedadas a las que te has apuntado.' : 'La quedada coincide con un plan con fecha fija que has marcado.' });
    }
    return out.sort((a, b) => a.day.localeCompare(b.day));
  }
  function viewMeet() {
    const t = today();
    let list = S.props.slice();
    if (S.meetSeg === 'mias') list = list.filter(m => m.att.indexOf(S.me) >= 0);
    const up = list.filter(m => m.day >= t), past = list.filter(m => m.day < t);
    const seg = '<div class="seg" role="group"><button data-act="meetseg" data-id="todas" aria-pressed="' + (S.meetSeg === 'todas') + '">Todas</button>' +
      '<button data-act="meetseg" data-id="mias" aria-pressed="' + (S.meetSeg === 'mias') + '">A las que voy</button></div>';
    const byDay = arr => { const g = {}; arr.forEach(m => { (g[m.day] = g[m.day] || []).push(m); }); return Object.keys(g).sort().map(d => ({ d: d, ms: g[d].sort((a, b) => a.hour.localeCompare(b.hour)) })); };
    const dayBlock = g => '<section class="day"><div class="day-h"><h2>' + dayLong(g.d) + '</h2>' + (g.d === t ? '<span class="today">Hoy</span>' : '') + '</div>' +
      g.ms.map(m => meetHTML(m)).join('') + '</section>';
    const cl = clashes();
    let html = seg + '<h1 class="h-sec">Quedadas</h1><p class="sub">Una quedada es un día y una hora para ir juntas a un sitio. Apúntate a las de tus compañeras o propón la tuya.</p>' +
      '<button class="btn" style="margin:0 0 14px" data-act="pick">Proponer una quedada</button>' +
      (cl.length ? '<div class="warn" style="margin-bottom:14px" role="alert"><b>Ojo, se te solapan quedadas:</b>' + cl.map(c =>
        '<br>' + dayLong(c[0].day) + ': ' + esc(PBY[c[0].p].n) + ' a las ' + esc(c[0].hour) + ' y ' + esc(PBY[c[1].p].n) + ' a las ' + esc(c[1].hour) + '.').join('') + '</div>' : '');
    if (!up.length) {
      html += '<div class="empty"><h2>' + (S.meetSeg === 'mias' ? 'Todavía no vas a ninguna quedada' : 'Nadie ha propuesto una quedada todavía') + '</h2><p>' +
        (S.meetSeg === 'mias' ? 'Mira en «Todas» si hay alguna que te apetezca y pulsa «Me apunto», o propón tú una con el botón amarillo.' : 'Sé la primera: pulsa «Proponer una quedada», elige el sitio y pon día y hora.') + '</p></div>';
    } else html += byDay(up).map(dayBlock).join('');
    if (past.length) html += '<details><summary>Quedadas pasadas (' + past.length + ')</summary>' + byDay(past).map(dayBlock).join('') + '</details>';
    return { html: html };
  }
  // Elegir sitio para una quedada nueva: primero los que me apetecen.
  function renderPick() {
    S.person = null; F.pid = null;
    const row = p => { const n = voters(p.id, 2).length + voters(p.id, 1).length; return '<li><button data-act="open" data-form="1" data-id="' + p.id + '"><span>' + esc(p.n) + '</span><span class="quiet">' + (n === 1 ? 'Quiere ir 1' : 'Quieren ir ' + n) + '</span></button></li>'; };
    const byN = (a, b) => (voters(b.id, 2).length + voters(b.id, 1).length) - (voters(a.id, 2).length + voters(a.id, 1).length);
    const love = PL.filter(p => S.mine[p.id] === 2).sort(byN), meh = PL.filter(p => S.mine[p.id] === 1).sort(byN);
    openSheet('<div class="pad" style="padding-top:56px"><h2>¿A qué sitio queréis ir?</h2><p class="quiet">Elige el sitio y después pondrás el día y la hora.</p>' +
      (love.length + meh.length ? (love.length ? '<h3>Los que te encantarían</h3><ul class="mylist">' + love.map(row).join('') + '</ul>' : '') +
        (meh.length ? '<h3>Los que no te importaría</h3><ul class="mylist">' + meh.map(row).join('') + '</ul>' : '')
        : '<p class="quiet" style="margin-top:14px">Todavía no has marcado ningún sitio que te apetezca. Vota primero algunas fichas.</p><button class="btn" style="margin-top:14px" data-act="tab" data-id="deck">Ir a las fichas</button>') + '</div>');
  }

  /* ---------- hoja de sitio ---------- */
  function openSheet(html) {
    sheetEl.innerHTML = '<div class="sheet-in" role="dialog" aria-modal="true"><div class="sheet-bar"><button class="x" data-act="close" aria-label="Cerrar">×</button></div>' + html + '</div>';
    sheetEl.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeSheet() { instPop = false; sheetEl.hidden = true; sheetEl.innerHTML = ''; document.body.style.overflow = ''; F.pid = null; S.person = null; }
  function dayOptions(p) {
    const t = today();
    if (p.when) return p.when.filter(w => w[0] >= t && DAYS[w[0]]).map(w => ({ d: w[0], t: w[1], l: w[2] }));
    return DAYKEYS.filter(d => d >= t).map(d => ({ d: d, t: null, l: null }));
  }
  function timeOptions(o) {
    const from = Math.min(mins(DAYS[o.d].free), o.t ? mins(o.t) - 60 : 9999), out = [];
    for (let m = Math.max(from, 7 * 60); m <= 23 * 60; m += 30) out.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    if (o.t && out.indexOf(o.t) < 0) { out.push(o.t); out.sort(); }
    return out;
  }
  function defaultHour(o) { return o.t || (DAYS[o.d].free === '08:00' ? '10:00' : DAYS[o.d].free); }
  // Otros sitios a menos de un kilómetro en línea recta, agrupados por categoría.
  function metres(a, b) {
    const r = x => x * Math.PI / 180, dp = r(b[0] - a[0]), dl = r(b[1] - a[1]);
    const x = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 12742000 * Math.asin(Math.sqrt(x));
  }
  function nearHTML(p) {
    if (!p.ll) return '';
    const near = PL.filter(o => o.id !== p.id && o.ll).map(o => ({ p: o, m: metres(p.ll, o.ll) })).filter(o => o.m <= 1000).sort((a, b) => a.m - b.m);
    if (!near.length) return '';
    return '<h3>Otros sitios cerca</h3><div class="near">' + CATS.filter(c => c[0] !== 'todo').map(c => {
      const l = near.filter(o => o.p.c === c[0]).slice(0, 4);
      return l.length ? '<div><span class="ntag c-' + c[0] + '">' + c[1] + '</span><ul class="mylist">' + l.map(o =>
        '<li><button data-act="open" data-id="' + o.p.id + '"><span>' + esc(o.p.n) + '</span><span class="quiet">a ' + (o.m < 95 ? 'un paso' : Math.round(o.m / 50) * 50 + ' m') + '</span></button></li>').join('') + '</ul></div>' : '';
    }).join('') + '</div>';
  }
  function openPlace(pid, focusForm) {
    F.pid = pid; F.sel = 0; F.note = ''; F.busy = false;
    const opts = dayOptions(PBY[pid]);
    F.hour = opts.length ? defaultHour(opts[0]) : null;
    S.person = null;
    renderPlace();
    if (focusForm) { const f = $('#propose'); if (f) f.scrollIntoView({ block: 'start' }); }
    else { const si = $('.sheet-in', sheetEl); if (si) si.scrollTop = 0; }
  }
  function renderPlace() {
    const p = PBY[F.pid];
    if (!p) return;
    const keep = $('.sheet-in', sheetEl), y = keep ? keep.scrollTop : 0;
    const noteEl = $('#f-note'); if (noteEl) F.note = noteEl.value;
    const love = voters(p.id, 2), meh = voters(p.id, 1), mv = S.mine[p.id];
    const pills = arr => arr.map(u => '<span class="pill">' + av(u) + esc(u.id === S.me ? 'Tú' : u.name) + '</span>').join('');
    const meets = S.props.filter(m => m.p === p.id && m.day >= today()).sort((a, b) => (a.day + a.hour).localeCompare(b.day + b.hour));
    const opts = dayOptions(p);
    let form;
    if (!opts.length) form = '<p class="quiet">Este plan ya ha pasado.</p>';
    else {
      if (F.sel >= opts.length) F.sel = 0;
      const o = opts[F.sel], free = DAYS[o.d].free, times = timeOptions(o);
      if (times.indexOf(F.hour) < 0) F.hour = defaultHour(o);
      let warn = '';
      if (o.t && mins(o.t) < mins(free)) warn = 'Ese día el programa no termina hasta las ' + free + ', así que no da tiempo a llegar.';
      else if (o.t && mins(o.t) - mins(free) < 45 && free !== '08:00') warn = 'Va muy justo: ese día el programa termina a las ' + free + '.';
      form = '<form class="form" id="propose"><div><span class="lab">Día</span><div class="daychips">' + opts.map((x, i) =>
        '<button type="button" class="daychip" data-act="fday" data-i="' + i + '" aria-pressed="' + (i === F.sel) + '">' + dayShort(x.d) + (x.t ? ', ' + x.t : '') + (x.l ? '<small>' + esc(x.l) + '</small>' : '') + '</button>').join('') + '</div></div>' +
        '<p class="quiet">' + esc(DAYS[o.d].prog) + (free === '08:00' ? '.' : '. Libre desde las ' + free + '.') + (p.h && !p.when ? ' Horario del sitio: ' + esc(p.h + (p.h2 ? '. ' + p.h2 : '')) + '.' : '') + '</p>' +
        (warn ? '<div class="warn">' + esc(warn) + '</div>' : '') +
        '<div><label for="f-hour">Hora para quedar</label><select class="input" id="f-hour">' + times.map(t => '<option' + (t === F.hour ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
        '<div><label for="f-note">Punto de encuentro o nota (opcional)</label><input class="input" id="f-note" maxlength="160" placeholder="En el hall del hotel" value="' + esc(F.note) + '"></div>' +
        '<button class="btn join" ' + (F.busy ? 'disabled' : '') + '>' + (F.busy ? 'Guardando…' : 'Proponer quedada') + '</button></form>';
    }
    openSheet('<div class="photo">' + photo(p) + '<span class="tags"><span class="tag c-' + p.c + '">' + CATN[p.c] + '</span>' + (p.c2 ? '<span class="tag c-' + p.c2 + '">' + CATN[p.c2] + '</span>' : '') + '</span>' + tag2(p) + '</div><div class="checker"></div>' +
      '<div class="pad"><h2>' + esc(p.n) + '</h2><p class="desc">' + esc(p.d) + '</p>' + facts(p) + links(p) +
      '<h3>Tu voto</h3>' + voteButtons(mv === undefined ? -1 : mv, 'svote') +
      '<h3>Quién quiere ir</h3>' + (love.length + meh.length ? '<div class="who">' +
        (love.length ? '<div><p class="quiet"><i class="dot love"></i>Les encantaría (' + love.length + ')</p><div class="who-line">' + pills(love) + '</div></div>' : '') +
        (meh.length ? '<div><p class="quiet"><i class="dot meh"></i>No les importaría (' + meh.length + ')</p><div class="who-line">' + pills(meh) + '</div></div>' : '') + '</div>'
        : '<p class="quiet">Nadie ha dicho todavía que quiere ir.</p>') +
      (meets.length ? '<h3>Quedadas para este sitio</h3>' + meets.map(m => meetHTML(m, true)).join('') : '') +
      '<h3>' + (meets.length ? 'Proponer otro día' : 'Proponer día y hora') + '</h3>' + form + nearHTML(p) + '</div>');
    $('.sheet-in', sheetEl).scrollTop = y;
  }
  function renderPerson(uid) {
    const u = S.users[uid];
    if (!u) return;
    S.person = uid; F.pid = null;
    const s = sharedWith(uid), rest = s.both.filter(p => s.strong.indexOf(p) < 0);
    const li = arr => '<ul class="mylist">' + arr.map(p => '<li><button data-act="open" data-id="' + p.id + '"><span>' + esc(p.n) + '</span><span class="quiet">Abrir</span></button></li>').join('') + '</ul>';
    openSheet('<div class="pad" style="padding-top:56px"><div class="profile">' + av(u, 'lg') + '<b>' + esc(u.name) + '</b></div>' +
      (s.both.length ? (s.strong.length ? '<h3>Os encantaría a las dos</h3>' + li(s.strong) : '') + (rest.length ? '<h3>A las dos os apetece</h3>' + li(rest) : '')
        : '<p class="quiet">Todavía no coincidís en ningún sitio. Cuantas más fichas votéis, más fácil será.</p>') + '</div>');
  }
  async function propose() {
    const p = PBY[F.pid], o = dayOptions(p)[F.sel];
    if (!o || F.busy) return;
    F.hour = $('#f-hour').value; F.note = $('#f-note').value;
    F.busy = true; renderPlace();
    try {
      const r = await rpc('vm_propose', { p_token: S.token, p_place: p.id, p_day: o.d, p_hour: F.hour, p_note: F.note });
      if (r.error) throw new Error(r.error);
      F.note = ''; F.busy = false;
      await load(); render(); renderPlace(); toast(clashes().length ? 'Quedada propuesta. Ojo: se te solapa con otra del mismo día.' : 'Quedada propuesta para el ' + dayLong(o.d).toLowerCase() + '.');
    } catch (e) {
      F.busy = false; renderPlace();
      toast(e.message === 'limit' ? 'Has propuesto ya muchas quedadas. Cancela alguna antes.' : 'No se ha guardado. Comprueba la conexión.');
    }
  }
  async function meetAct(fn, args, okMsg) {
    try {
      const r = await rpc(fn, Object.assign({ p_token: S.token }, args));
      if (r.error === 'gone') toast('Esa quedada se ha cancelado.'); else if (r.error) throw new Error(r.error); else if (okMsg) toast(okMsg);
      await load();
    } catch (e) { toast('No se ha guardado. Comprueba la conexión.'); }
    render(); if (!sheetEl.hidden && F.pid) renderPlace();
    if (okMsg && fn !== 'vm_cancel' && args.p_join !== false && clashes().length) toast('Ojo: esa quedada se te solapa con otra del mismo día.');
  }

  /* ---------- yo ---------- */
  function viewMe() {
    const me = S.users[S.me] || { name: '', emoji: '🌸', id: 'x' };
    const cnt = [0, 0, 0]; Object.keys(S.mine).forEach(k => { cnt[S.mine[k]]++; });
    const done = cnt[0] + cnt[1] + cnt[2], tot = PL.length, pct = n => (n / tot * 100).toFixed(1) + '%';
    const group = v => {
      const arr = PL.filter(p => S.mine[p.id] === v);
      return arr.length ? '<details' + (v === 2 ? ' open' : '') + '><summary><i class="dot ' + VOTE[v][0] + '"></i>' + VOTE[v][1] + ' (' + arr.length + ')</summary><ul class="mylist">' +
        arr.map(p => '<li><button data-act="open" data-id="' + p.id + '"><span>' + esc(p.n) + '</span><span class="quiet">Cambiar</span></button></li>').join('') + '</ul></details>' : '';
    };
    const sched = window.AGENDA.map(a => '<h3 class="sched-day">' + dayLong(a[0]) + (a[0] === today() ? ' <span class="today">Hoy</span>' : '') + '</h3><table class="sched">' +
      a[1].map(r => '<tr' + (r[2] ? ' class="free"' : '') + '><th>' + esc(r[0]) + '</th><td>' + r[1].split('\n').map((l, i) => i ? '<span class="ln">' + esc(l) + '</span>' : esc(l)).join('') + '</td></tr>').join('') + '</table>').join('');
    return { html:
      '<h1 class="h-sec">Mi cuenta</h1><p class="sub">Tu nombre, tus votos y el horario del programa.</p>' +
      '<div class="panel">' + (S.edit ?
        '<form id="profile" class="pf" novalidate><label for="p-name">Tu nombre</label><input id="p-name" type="text" maxlength="24" autocomplete="off" value="' + esc(S.edit.name) + '">' +
        '<small>Si lo cambias, la próxima vez entrarás con el nombre nuevo y el mismo PIN.</small>' +
        '<label>Tu icono</label><div class="emojis">' +
        EMOJIS.map(e => '<button type="button" data-act="emoji" data-id="' + e + '" aria-pressed="' + (S.edit.emoji === e) + '" aria-label="Icono ' + e + '">' + e + '</button>').join('') + '</div>' +
        (S.edit.err ? '<div class="warn" role="alert">' + esc(S.edit.err) + '</div>' : '') +
        '<div class="pf-actions"><button class="btn small" type="submit"' + (S.edit.busy ? ' disabled' : '') + '>Guardar</button><button class="btn small ghost" type="button" data-act="edit-cancel">Cancelar</button></div></form>'
        : '<div class="profile">' + av(me, 'lg') + '<b>' + esc(me.name) + '</b><button class="pen" data-act="edit" aria-label="Editar nombre e icono">' + ICON.pen + '</button></div>') + '</div>' +
      '<div class="panel"><h2>Tus votos</h2><p>Has votado ' + done + ' de ' + tot + ' fichas.</p><div class="bar"><i class="love" style="width:' + pct(cnt[2]) + '"></i><i class="meh" style="width:' + pct(cnt[1]) + '"></i><i class="no" style="width:' + pct(cnt[0]) + '"></i></div>' +
      (done ? group(2) + group(1) + group(0) : '') + (done < tot ? '<button class="btn" style="margin-top:12px" data-act="tab" data-id="deck">Seguir votando</button>' : '') + '</div>' +
      installHTML() +
      '<div class="panel"><h2>Invitar a una compañera</h2><p style="margin-bottom:12px">Pásale este enlace por el grupo. Cada una entra con su nombre y un PIN.</p><button class="btn ghost" data-act="copy">Copiar el enlace</button></div>' +
      '<div class="panel"><h2>Horario del programa</h2><p>Esta es la agenda definitiva del programa. La app propone los planes para las horas libres.</p>' + sched + '</div>' +
      '<button class="btn ghost" data-act="logout">Cerrar sesión</button>' +
      '<p class="credit">Precios y horarios revisados el 1 de octubre de 2026: confírmalos antes de ir. Fotos de <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>, a través de Wikipedia.</p>' };
  }
  async function saveProfile() {
    const u = S.users[S.me], E = S.edit;
    if (!u || !E || E.busy) return;
    E.name = $('#p-name').value.replace(/\s+/g, ' ').trim(); E.err = '';
    if (E.name.length < 2) { E.err = 'Escribe un nombre de al menos 2 letras.'; render(); return; }
    E.busy = true; render();
    try {
      if (E.name !== u.name) {
        const r = await rpc('vm_rename', { p_token: S.token, p_name: E.name });
        if (r.error) { E.busy = false; E.err = r.error === 'taken' ? 'Ese nombre ya lo usa otra compañera. Añade tu apellido.' : r.error === 'name' ? 'El nombre tiene que tener entre 2 y 24 letras.' : 'No se ha podido guardar. Inténtalo otra vez.'; render(); return; }
        u.name = r.name || E.name;
      }
      if (E.emoji !== u.emoji) { await rpc('vm_emoji', { p_token: S.token, p_emoji: E.emoji }); u.emoji = E.emoji; }
      S.edit = null; render(); toast('Guardado.');
    } catch (e) { E.busy = false; E.err = 'No hay conexión. Inténtalo otra vez.'; render(); }
  }
  // Instalación como app: botón directo donde el navegador lo permite, instrucciones donde no.
  let installEvt = null;
  const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  function installHTML() {
    if (standalone()) return '';
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return '<div class="panel"><h2>Instalar la app</h2>' + (installEvt
      ? '<p style="margin-bottom:12px">Ponla en la pantalla de inicio del móvil, con su icono, y ábrela como cualquier otra app.</p><button class="btn" data-act="install">Instalar ¿Vienes?</button>'
      : ios ? '<p>En iPhone, con Safari o Chrome: toca el botón <b>Compartir</b> (el cuadrado con la flecha) y elige <b>«Añadir a pantalla de inicio»</b>. La primera vez tendrás que entrar otra vez con tu nombre y tu PIN.</p>'
        : '<p>En Android, con Chrome: abre el menú <b>⋮</b> de arriba a la derecha y elige <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.</p>') + '</div>';
  }
  // Ventana emergente para instalar: sale una vez por dispositivo, ya con la cuenta creada.
  let instPop = false, instAfterIntro = false;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function installPop(force) {
    if (standalone() || !S.token || !S.loaded) return;
    if (!force) {
      if (store.get('vm_inst') || !sheetEl.hidden || !matchEl.hidden) return;
      if (!installEvt && !isIOS() && !/Android/.test(navigator.userAgent)) return;
    }
    instPop = true; store.set('vm_inst', '1');
    openSheet('<div class="pad instpop" style="padding-top:56px"><img src="icon-192.png" alt="" width="72" height="72"><h2>Instala ¿Vienes? en tu móvil</h2>' +
      '<p class="quiet">Tendrás la app en la pantalla de inicio, con su icono, y se abrirá a pantalla completa.</p>' +
      (installEvt ? '<button class="btn" data-act="install">Instalar la app</button>'
        : isIOS() ? '<ol><li>Toca el botón <b>Compartir</b>, el cuadrado con la flecha hacia arriba. En Safari está abajo; en Chrome, arriba junto a la dirección.</li><li>Elige <b>«Añadir a pantalla de inicio»</b>.</li><li>Abre la app desde el icono nuevo y entra con tu nombre y tu PIN.</li></ol>'
          : '<ol><li>Abre el menú <b>⋮</b> de Chrome, arriba a la derecha.</li><li>Elige <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.</li></ol>') +
      '<button class="btn ghost" data-act="close">Ahora no</button><p class="quiet" style="font-size:13px">Podrás instalarla más tarde desde «Mi cuenta».</p></div>');
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); installEvt = e;
    if (instPop && !sheetEl.hidden) installPop(true); else installPop();
    if (S.token && S.loaded && S.tab === 'me' && !S.edit) render();
  });
  window.addEventListener('appinstalled', () => { installEvt = null; if (instPop) closeSheet(); toast('App instalada.'); if (S.token && S.loaded && S.tab === 'me' && !S.edit) render(); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  function inviteUrl() {
    const c = store.get('vm_code') || linkCode;
    return location.origin + location.pathname + (c ? '?c=' + encodeURIComponent(c) : '');
  }
  function intro() {
    openSheet('<div class="pad" style="padding-top:56px"><h2>Así funciona</h2><ol style="padding-left:20px;display:grid;gap:10px;margin:12px 0 20px">' +
      '<li><b>Vota las fichas.</b> En cada sitio di si no quieres ir, si no te importaría o si te encantaría.</li>' +
      '<li><b>Mira las coincidencias.</b> Verás quién quiere ir a cada sitio. Tus «no quiero ir» no los ve nadie.</li>' +
      '<li><b>Quedad.</b> Abre un sitio, propón día y hora y las demás se apuntan con un toque.</li></ol>' +
      '<button class="btn" data-act="close">Empezar a votar</button></div>');
  }

  /* ---------- eventos ---------- */
  document.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'gate') enter();
    else if (e.target.id === 'propose') propose();
    else if (e.target.id === 'profile') saveProfile();
  });
  document.addEventListener('change', e => { if (e.target.id === 'f-hour') F.hour = e.target.value; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!matchEl.hidden) matchEl.hidden = true; else if (!sheetEl.hidden) closeSheet(); } });
  document.addEventListener('click', e => {
    if (e.target === sheetEl) { closeSheet(); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, id = b.dataset.id;
    if (act !== 'cancel' && S.confirmCancel) S.confirmCancel = null;
    switch (act) {
      case 'gate-back': G.step = 'in'; G.err = ''; renderGate(); break;
      case 'tab': closeSheet(); S.tab = id; S.edit = null; render(); window.scrollTo(0, 0); break;
      case 'cat': S.cat = id; render(); break;
      case 'vote': flyVote(Number(b.dataset.v)); break;
      case 'svote': vote(F.pid, Number(b.dataset.v), false); break;
      case 'skip': S.skipped = S.skipped.filter(x => x !== id); S.skipped.push(id); render(); break;
      case 'undo': if (S.last) { const l = S.last; S.last = null; vote(l.pid, l.prev, false); } break;
      case 'seg': S.seg = id; render(); break;
      case 'meetseg': S.meetSeg = id; render(); break;
      case 'votef': S.voteF[b.dataset.v] = !S.voteF[b.dataset.v]; S.clashF = false; render(); break;
      case 'clashf': S.clashF = !S.clashF; S.voteF = { 1: false, 2: false }; render(); break;
      case 'open': openPlace(id, !!b.dataset.form); break;
      case 'pick': renderPick(); break;
      case 'person': renderPerson(id); break;
      case 'close': closeSheet(); if (instAfterIntro) { instAfterIntro = false; installPop(); } break;
      case 'fday': { const n = $('#f-note'); if (n) F.note = n.value; F.sel = Number(b.dataset.i); F.hour = defaultHour(dayOptions(PBY[F.pid])[F.sel]); renderPlace(); break; }
      case 'join': meetAct('vm_join', { p_proposal: id, p_join: true }, 'Te has apuntado.'); break;
      case 'leave': meetAct('vm_join', { p_proposal: id, p_join: false }, 'Ya no vas a esa quedada.'); break;
      case 'cancel':
        if (S.confirmCancel === id) { S.confirmCancel = null; meetAct('vm_cancel', { p_proposal: id }, 'Quedada cancelada.'); }
        else { S.confirmCancel = id; render(); if (!sheetEl.hidden && F.pid) renderPlace(); }
        break;
      case 'match-close': matchEl.hidden = true; break;
      case 'match-propose': matchEl.hidden = true; openPlace(id, true); break;
      case 'emoji': if (S.edit) { const n = $('#p-name'); if (n) S.edit.name = n.value; S.edit.emoji = id; render(); } break;
      case 'edit': { const u = S.users[S.me]; if (u) { S.edit = { name: u.name, emoji: u.emoji, err: '', busy: false }; render(); const n = $('#p-name'); if (n) n.focus(); } break; }
      case 'edit-cancel': S.edit = null; render(); break;
      case 'install': if (installEvt) { const ev = installEvt; installEvt = null; if (instPop) closeSheet(); ev.prompt(); if (ev.userChoice) ev.userChoice.then(() => render(), () => render()); } break;
      case 'copy': {
        const url = inviteUrl();
        const done = () => toast('Enlace copiado. Pégalo en el grupo.');
        if (navigator.share) navigator.share({ title: '¿Vienes? Planes en Viena', text: 'Vota los sitios de Viena que te apetecen y mira quién quiere ir contigo.', url: url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => toast(url));
        else toast(url);
        break;
      }
      case 'logout': { const t = S.token; signOutLocal(); render(); rpc('vm_logout', { p_token: t }).catch(() => {}); break; }
    }
  });
  window.addEventListener('resize', () => { if (S.token && S.loaded && S.tab === 'deck' && !S.drag) fitDeck(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.token && S.loaded) refresh(true); });
  setInterval(() => { if (document.visibilityState === 'visible' && S.token && S.loaded && sheetEl.hidden && matchEl.hidden) refresh(true); }, 25000);

  async function boot(isNew) {
    render();
    if (!S.token) return;
    try { const ok = await load(); render(); if (ok && isNew) { instAfterIntro = true; intro(); } else if (ok) installPop(); }
    catch (e) { app.innerHTML = '<div class="wrap"><div class="empty" style="margin-top:40px"><h2>Sin conexión</h2><p>No se han podido cargar los datos. Comprueba internet.</p><button class="btn" onclick="location.reload()">Reintentar</button></div></div>'; return; }
    loadImages();
  }
  if (linkCode) store.set('vm_code', linkCode);
  boot(false);
})();
