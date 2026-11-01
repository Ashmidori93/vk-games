/* Раскоп — интерфейс: канвас-сцена, управление удержанием, лавка, сохранения, SDK Яндекс Игр. */
(function () {
  'use strict';
  const L = window.MineLogic;
  const $ = (q) => document.querySelector(q);
  const W = L.W, H = L.H, NO = L.NO, NA = L.NA, T = L.T;
  const SAVE_KEY = 'dig-save-v1', SETTINGS_KEY = 'dig-settings-v1';

  const I18N = {
    ru: {
      title: 'Раскоп', depth: '{n} м', shop: 'Лавка', shopOnly: 'Лавка (на поверхности)', dyn: 'Динамит', scroll: 'Свиток',
      energy: 'Энергия', bag: 'Мешок', bagFull: 'Мешок полон!', hintStart: 'Зажми палец рядом с шахтёром — он поедет в ту сторону. Копай вниз, собирай руду, возвращайся наверх!', hintBack: 'Энергия на исходе — пора наверх!',
      tabUp: 'Улучшения', tabSup: 'Запасы', tabCol: 'Коллекция', lvl: 'Ур. {n}', maxed: 'Макс', buy: 'Купить', adFree: 'Бесплатно (реклама)',
      saleTitle: 'Добыча продана!', saleNone: 'Мешок пуст — копай глубже!', adDouble: 'Удвоить за рекламу', toShop: 'В лавку', go: 'Копать дальше', doubled: 'Награда удвоена!',
      stuckTitle: 'Энергия кончилась!', stuckText: 'Шахтёр выдохся. Как поступим?', stuckAd: 'Заправиться за рекламу (всё остаётся)', stuckScroll: 'Использовать свиток (всё остаётся)', stuckEvac: 'Эвакуация (потеряешь половину добычи)', stuckEvacNone: 'Эвакуация на поверхность',
      settings: 'Настройки', sound: 'Звук', effects: 'Эффекты', lang: 'Язык', langAuto: 'Авто', on: 'Вкл', off: 'Выкл', close: 'Закрыть', reset: 'Сбросить прогресс', confirm: 'Точно сбросить весь прогресс?', yes: 'Да, сбросить', no: 'Отмена',
      lbTitle: 'Рейтинг глубины', lbSub: 'Кто копнул глубже всех', lbLoading: 'Загрузка…', lbFail: 'Рейтинг сейчас недоступен', lbEmpty: 'Пока никого нет — стань первым!', lbAuth: 'Войти, чтобы попасть в рейтинг', lbAnon: 'Игрок', m: 'м',
      adUnavailable: 'Реклама сейчас недоступна', demoAd: 'Демо: награда за рекламу', bed: 'Дно мира! Дальше — коренная порода', newDepth: 'Рекорд: {n} м!', lava: 'Лава! −{n} энергии', chest: 'Сундук! +{n}', art: 'Артефакт: {n}!',
      dynD: 'Взрывает 3×3 вокруг шахтёра и подбирает руду. Сейчас: {n}', scrollD: 'Мгновенно переносит на поверхность, добыча остаётся. Сейчас: {n}', useDyn: 'Бросить динамит', useScroll: 'Читать свиток',
      upN: { drill: 'Бур', tank: 'Бак', bag: 'Рюкзак', lamp: 'Фонарь', heat: 'Теплозащита', engine: 'Двигатель' },
      upD: { drill: 'Копает быстрее: {a} → {b}', tank: 'Энергии в баке: {a} → {b}', bag: 'Мест в мешке: {a} → {b}', lamp: 'Радиус света: {a} → {b}', heat: 'Урон от лавы: −{a}% → −{b}%', engine: 'Меньше расход энергии и быстрее ход: −{a}% → −{b}%' },
      colTitle: 'Артефакты', colBonus: 'Найдено {n}/{m}: цена продажи +{p}%', colHidden: 'Глубже {n} м',
      biomes: ['Почва', 'Глина', 'Камень', 'Гранит', 'Кристальные пещеры', 'Лавовые недра', 'Руины древних', 'Ядро'],
      ores: ['Уголь', 'Медь', 'Железо', 'Серебро', 'Золото', 'Рубин', 'Изумруд', 'Алмаз', 'Звёздный кристалл'],
      arts: ['Трилобит', 'Зуб динозавра', 'Древний горшок', 'Бронзовый шлем', 'Янтарь с жуком', 'Каменная табличка', 'Золотая маска', 'Кристальный череп', 'Звёздный компас', 'Метеорит', 'Кость дракона', 'Сердце Земли'],
    },
    en: {
      title: 'Dig Deep', depth: '{n} m', shop: 'Shop', shopOnly: 'Shop (at surface)', dyn: 'Dynamite', scroll: 'Scroll',
      energy: 'Energy', bag: 'Bag', bagFull: 'Bag is full!', hintStart: 'Hold your finger near the miner — he drives that way. Dig down, collect ore, return to the surface!', hintBack: 'Running low on energy — head up!',
      tabUp: 'Upgrades', tabSup: 'Supplies', tabCol: 'Collection', lvl: 'Lv {n}', maxed: 'Max', buy: 'Buy', adFree: 'Free (ad)',
      saleTitle: 'Loot sold!', saleNone: 'Your bag is empty — dig deeper!', adDouble: 'Double it with an ad', toShop: 'To the shop', go: 'Keep digging', doubled: 'Reward doubled!',
      stuckTitle: 'Out of energy!', stuckText: 'The miner is exhausted. What now?', stuckAd: 'Refuel with an ad (keep everything)', stuckScroll: 'Use a scroll (keep everything)', stuckEvac: 'Evacuate (lose half the loot)', stuckEvacNone: 'Evacuate to the surface',
      settings: 'Settings', sound: 'Sound', effects: 'Effects', lang: 'Language', langAuto: 'Auto', on: 'On', off: 'Off', close: 'Close', reset: 'Reset progress', confirm: 'Really reset all progress?', yes: 'Yes, reset', no: 'Cancel',
      lbTitle: 'Depth ranking', lbSub: 'Who dug the deepest', lbLoading: 'Loading…', lbFail: 'Ranking is unavailable right now', lbEmpty: 'Nobody yet — be the first!', lbAuth: 'Sign in to join the ranking', lbAnon: 'Player', m: 'm',
      adUnavailable: 'Ad is unavailable right now', demoAd: 'Demo: ad reward', bed: 'World bottom! Bedrock below', newDepth: 'Record: {n} m!', lava: 'Lava! −{n} energy', chest: 'Chest! +{n}', art: 'Artifact: {n}!',
      dynD: 'Blasts 3×3 around the miner and grabs the ore. You have: {n}', scrollD: 'Instantly to the surface, loot stays. You have: {n}', useDyn: 'Throw dynamite', useScroll: 'Read scroll',
      upN: { drill: 'Drill', tank: 'Tank', bag: 'Backpack', lamp: 'Lamp', heat: 'Heat shield', engine: 'Engine' },
      upD: { drill: 'Digs faster: {a} → {b}', tank: 'Tank energy: {a} → {b}', bag: 'Bag slots: {a} → {b}', lamp: 'Light radius: {a} → {b}', heat: 'Lava damage: −{a}% → −{b}%', engine: 'Less energy use and faster moves: −{a}% → −{b}%' },
      colTitle: 'Artifacts', colBonus: 'Found {n}/{m}: sell price +{p}%', colHidden: 'Deeper than {n} m',
      biomes: ['Soil', 'Clay', 'Stone', 'Granite', 'Crystal Caves', 'Lava Depths', 'Ancient Ruins', 'The Core'],
      ores: ['Coal', 'Copper', 'Iron', 'Silver', 'Gold', 'Ruby', 'Emerald', 'Diamond', 'Star Crystal'],
      arts: ['Trilobite', 'Dinosaur Tooth', 'Ancient Pot', 'Bronze Helmet', 'Amber with Bug', 'Stone Tablet', 'Golden Mask', 'Crystal Skull', 'Star Compass', 'Meteorite', 'Dragon Bone', 'Heart of the Earth'],
    },
  };
  const ART_ICON = ['🐚', '🦷', '🏺', '🛡️', '🍯', '📜', '🎭', '💀', '🧭', '☄️', '🐉', '💎'];
  const ORE_COL = ['#2b2b33', '#e0803a', '#c9b3b3', '#e6ecff', '#ffd24a', '#ff4d6d', '#3ddc84', '#7ee8ff', '#d86cff'];
  const BAND = [['#8a5a34', '#a06c40', '#5e3a1c'], ['#7d5b45', '#946e55', '#52392a'], ['#6e6258', '#857a6e', '#443c35'], ['#5a5a66', '#6f6f7c', '#383842'],
    ['#4c5870', '#5f6d88', '#2f3748'], ['#6a4040', '#845252', '#3f2424'], ['#4a4f78', '#5f658f', '#2c3050'], ['#3a2a4a', '#4d3a62', '#21162d']];
  const bandOf = (r) => Math.min(BAND.length - 1, Math.floor(Math.max(0, r) / 25));

  let lang = 'ru';
  let settings = { sound: true, effects: true, lang: 'auto' };
  let state = L.create();
  let ysdk = null, player = null;
  let saveTimer = 0, adPlaying = false, apiPaused = false, gpOn = false, savedAt = 0;
  let audioCtx = null, toastTimer = 0;
  let keyDirs = [];

  const t = (k, p) => {
    let s = I18N[lang][k]; if (s === undefined) s = I18N.ru[k];
    if (typeof s === 'string' && p) s = s.replace(/\{(\w+)\}/g, (_, x) => (p[x] !== undefined ? p[x] : ''));
    return s;
  };
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const NAMES = () => I18N[lang];

  /* ---------- язык, настройки ---------- */
  function detectLang() {
    let l = '';
    try { if (ysdk && ysdk.environment && ysdk.environment.i18n) l = ysdk.environment.i18n.lang; } catch (e) { /* ignore */ }
    if (!l) l = navigator.language || 'en';
    l = String(l).toLowerCase().slice(0, 2);
    return ['ru', 'be', 'kk', 'uk', 'uz'].includes(l) ? 'ru' : 'en';
  }
  function pickLang() { lang = settings.lang === 'ru' || settings.lang === 'en' ? settings.lang : detectLang(); document.documentElement.lang = lang; document.title = t('title'); }
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (s && typeof s === 'object') settings = { sound: s.sound !== false, effects: s.effects !== false, lang: ['auto', 'ru', 'en'].includes(s.lang) ? s.lang : 'auto' };
    } catch (e) { /* ignore */ }
  }
  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } }

  /* ---------- сохранения ---------- */
  function serialize() {
    const s = state;
    return { v: 1, seed: s.seed, coins: s.coins, total: s.total, r: s.r, c: s.c, energy: s.energy, up: s.up, cargo: s.cargo, dyn: s.dyn, scroll: s.scroll, best: s.best, trips: s.trips, arts: s.arts,
      mined: L.packSet(s.mined), seen: L.packSet(s.seen), savedAt };
  }
  function normalize(d) {
    if (!d || typeof d !== 'object' || typeof d.seed !== 'number') return null;
    const s = L.create(d.seed);
    s.coins = Math.max(0, num(d.coins, 0)); s.total = Math.max(s.coins, num(d.total, 0));
    for (const k of Object.keys(L.UP)) s.up[k] = Math.min(L.UP[k].max, Math.max(0, Math.floor(num(d.up && d.up[k], 0))));
    for (let i = 0; i < NO; i++) s.cargo[i] = Math.max(0, Math.floor(num(d.cargo && d.cargo[i], 0)));
    for (let i = 0; i < NA; i++) s.arts[i] = !!(d.arts && d.arts[i]);
    s.dyn = Math.max(0, Math.floor(num(d.dyn, 0))); s.scroll = Math.max(0, Math.floor(num(d.scroll, 0)));
    s.best = Math.max(0, Math.floor(num(d.best, 0))); s.trips = Math.max(0, Math.floor(num(d.trips, 0)));
    s.mined = typeof d.mined === 'string' ? L.unpackSet(d.mined) : new Set();
    s.seen = typeof d.seen === 'string' ? L.unpackSet(d.seen) : new Set();
    s.r = Math.min(H - 2, Math.max(-1, Math.floor(num(d.r, -1)))); s.c = Math.min(W - 1, Math.max(0, Math.floor(num(d.c, 7))));
    if (L.cell(s, s.r, s.c) !== T.AIR) s.mined.add(L.key(s.r, s.c));
    // нельзя хранить больше, чем влезает в мешок
    let over = L.cargoCount(s) - L.bagMax(s.up.bag);
    for (let i = NO - 1; i >= 0 && over > 0; i--) { const x = Math.min(over, s.cargo[i]); s.cargo[i] -= x; over -= x; }
    s.energy = Math.min(L.tankMax(s.up.tank), Math.max(0, num(d.energy, L.tankMax(s.up.tank))));
    L.reveal(s);
    return { s, savedAt: num(d.savedAt, 0) };
  }
  function loadLocal() { try { const r = localStorage.getItem(SAVE_KEY); return r ? normalize(JSON.parse(r)) : null; } catch (e) { return null; } }
  async function loadCloud() {
    if (!ysdk) return null;
    try { player = await ysdk.getPlayer({ scopes: false }); const d = await player.getData(['state']); return d && d.state ? normalize(d.state) : null; } catch (e) { player = null; return null; }
  }
  function save() {
    savedAt = Date.now();
    const data = serialize();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
    if (player) { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { player.setData({ state: data }); } catch (e) { /* ignore */ } }, 4000); }
  }

  /* ---------- рейтинг ---------- */
  const LB = 'digdepth';
  async function lbApi() { if (ysdk && ysdk.leaderboards) return ysdk.leaderboards; if (ysdk && ysdk.getLeaderboards) return ysdk.getLeaderboards(); return null; }
  let lbSent = 0, lbLast = 0;
  async function lbSubmit(force) {
    const sc = state.best;
    if (!ysdk || sc <= lbSent || sc < 5) return;
    if (!force && Date.now() - lbLast < 60000) return;
    lbLast = Date.now();
    try {
      if (!ysdk.isAvailableMethod || !(await ysdk.isAvailableMethod('leaderboards.setScore'))) return;
      const lb = await lbApi(); if (!lb) return;
      await lb.setScore(LB, sc); lbSent = sc;
    } catch (e) { /* не авторизован или нет сети */ }
  }
  async function openLb() {
    $('#lb').hidden = false; syncGameplay();
    const box = $('#lb-list'); box.textContent = t('lbLoading'); $('#lb-auth').hidden = true;
    try {
      await lbSubmit(true);
      const lb = await lbApi(); if (!lb) throw new Error('no lb');
      let r;
      try { r = await lb.getEntries(LB, { quantityTop: 10, includeUser: true, quantityAround: 2 }); }
      catch (e1) {
        try { r = await lb.getEntries(LB, { quantityTop: 10 }); }
        catch (e2) { if (/404/.test(String(e2 && (e2.message || e2.code || e2.status)))) r = { entries: [] }; else throw e2; }
      }
      let list = (r && r.entries) || [];
      if (!list.length) { try { const me = await lb.getPlayerEntry(LB); if (me && me.rank) { list = [me]; r = { userRank: me.rank }; } } catch (e4) { /* нет записи */ } }
      box.textContent = '';
      if (!list.length) box.textContent = t('lbEmpty');
      list.forEach((e) => {
        const row = document.createElement('div'); row.className = 'lbr' + (r.userRank && e.rank === r.userRank ? ' me' : '');
        const rk = document.createElement('b'); rk.textContent = e.rank;
        const nm = document.createElement('span'); nm.textContent = (e.player && e.player.publicName) || t('lbAnon');
        const sc = document.createElement('i'); sc.textContent = (Number(e.score) || 0) + ' ' + t('m');
        row.append(rk, nm, sc); box.appendChild(row);
      });
      let lite = false;
      try { lite = !!(player && player.getMode && player.getMode() === 'lite'); } catch (e2) { /* ignore */ }
      $('#lb-auth').hidden = !(lite && ysdk.auth && ysdk.auth.openAuthDialog);
    } catch (e) { box.textContent = t('lbFail'); }
  }
  async function lbAuth() { try { await ysdk.auth.openAuthDialog(); player = await ysdk.getPlayer({ scopes: false }); save(); lbSent = 0; openLb(); } catch (e) { /* закрыл окно */ } }

  /* ---------- звук ---------- */
  function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
    if (audioCtx && audioCtx.state === 'suspended' && settings.sound && !adPlaying && !document.hidden) audioCtx.resume();
  }
  function pauseAudio(p) { if (!audioCtx) return; if (p) audioCtx.suspend(); else if (settings.sound && !adPlaying && !document.hidden) audioCtx.resume(); }
  function blip(freq, dur, delay, vol, type) {
    if (!settings.sound || adPlaying || !audioCtx || audioCtx.state !== 'running') return;
    const d = dur || 0.09, now = audioCtx.currentTime + (delay || 0);
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol || 0.1, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now + d + 0.02);
  }
  const sndDig = (hard) => blip(90 + Math.random() * 40 + hard * 2, 0.06, 0, 0.07, 'square');
  const sndOre = (k) => { blip(520 + k * 70, 0.09, 0, 0.1); blip(780 + k * 90, 0.12, 0.07, 0.08); };
  const sndSell = () => { blip(520, 0.08, 0, 0.1); blip(660, 0.08, 0.08, 0.1); blip(880, 0.14, 0.16, 0.1); blip(1100, 0.2, 0.26, 0.08); };
  const sndBuy = () => { blip(520, 0.07, 0, 0.1); blip(780, 0.1, 0.06, 0.1); };
  const sndBoom = () => { blip(70, 0.35, 0, 0.18, 'sawtooth'); blip(45, 0.45, 0.05, 0.16, 'square'); };
  const sndLava = () => { blip(160, 0.25, 0, 0.12, 'sawtooth'); blip(110, 0.3, 0.1, 0.1, 'sawtooth'); };
  const sndFail = () => { blip(300, 0.15, 0, 0.1, 'triangle'); blip(200, 0.25, 0.12, 0.1, 'triangle'); };

  /* ---------- реклама ---------- */
  function adCallbacks(onDone) {
    return {
      onOpen: () => { adPlaying = true; pauseAudio(true); syncGameplay(); },
      onClose: () => { adPlaying = false; pauseAudio(false); syncGameplay(); if (onDone) onDone(); },
      onError: () => { adPlaying = false; pauseAudio(false); syncGameplay(); },
    };
  }
  function showRewarded(onReward) {
    if (adPlaying) return;
    if (!ysdk) { adPlaying = true; syncGameplay(); toast(t('demoAd')); setTimeout(() => { adPlaying = false; syncGameplay(); onReward(); }, 900); return; }
    let rewarded = false;
    const cb = adCallbacks(() => { if (rewarded) onReward(); });
    const onError = cb.onError;
    cb.onError = () => { onError(); toast(t('adUnavailable')); };
    cb.onRewarded = () => { rewarded = true; };
    try { ysdk.adv.showRewardedVideo({ callbacks: cb }); } catch (e) { cb.onError(); }
  }

  /* ---------- GameplayAPI ---------- */
  const OVERLAYS = ['#shop', '#sale', '#stuck', '#settings', '#confirm', '#lb'];
  const overlayOpen = () => OVERLAYS.some((q) => !$(q).hidden);
  function syncGameplay() {
    const active = !apiPaused && !adPlaying && !document.hidden && !overlayOpen();
    if (active === gpOn) return;
    gpOn = active;
    try { const g = ysdk && ysdk.features && ysdk.features.GameplayAPI; if (g) { if (active) g.start(); else g.stop(); } } catch (e) { /* ignore */ }
  }
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('blur', () => { pauseAudio(true); syncGameplay(); clearInput(); });
  window.addEventListener('focus', () => { pauseAudio(false); syncGameplay(); });

  /* ---------- сцена ---------- */
  const cv = $('#cv'), ctx = cv.getContext('2d');
  const dark = document.createElement('canvas'), dctx = dark.getContext('2d');
  const LW = 360;                                  // логическая ширина; высота зависит от экрана
  let LH = 560, PX = 1, CS = 40, VW = 9, VH = 14, MY = 5;
  const cam = { x: 3, y: -5 }, vis = { x: 7, y: -1 };
  const parts = [], floats = [], flies = [], motes = [];
  let shake = 0, flash = 0, time = 0, driller = 0, bump = 0;

  /* --- кэш типов клеток --- */
  let gcache = new Int8Array(W * H).fill(-1), gseed = null;
  function ctype(r, c) {
    if (c < 0 || c >= W) return T.BED;
    if (r < 0) return T.AIR;
    if (r >= H) return T.BED;
    const k = r * W + c;
    if (state.mined.has(k)) return T.AIR;
    if (gseed !== state.seed) { gcache.fill(-1); gseed = state.seed; }
    let g = gcache[k];
    if (g < 0) g = gcache[k] = L.gen(state.seed, r, c);
    if (g === T.ART) { const i = L.artIndex(state, r, c); if (i >= 0 && state.arts[i]) return T.DIRT; }
    return g;
  }

  /* --- процедурные текстуры --- */
  const TS = 64;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  const BASE = ['#8f5e36', '#80574a', '#74695f', '#5e5e6e', '#4b5a7a', '#80474a', '#4f5586', '#41305a'];
  const dirtTiles = [], backTiles = [], oreTiles = [];
  function makeDirt(b, seed) {
    const c = mk(TS, TS), g = c.getContext('2d'), R = rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, TS); gr.addColorStop(0, shade(b, 0.12)); gr.addColorStop(1, shade(b, -0.14)); g.fillStyle = gr; g.fillRect(0, 0, TS, TS);
    for (let i = 0; i < 16; i++) { g.fillStyle = R() < 0.5 ? shade(b, 0.16) : shade(b, -0.22); g.globalAlpha = 0.16 + R() * 0.16; g.beginPath(); g.ellipse(R() * TS, R() * TS, 6 + R() * 12, 4 + R() * 8, R() * 3, 0, 6.283); g.fill(); }
    for (let i = 0; i < 110; i++) { g.fillStyle = R() < 0.5 ? shade(b, 0.35) : shade(b, -0.45); g.globalAlpha = 0.22 + R() * 0.3; const s = 1 + R() * 2.2; g.fillRect(R() * TS, R() * TS, s, s); }
    g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const x = 7 + R() * 50, y = 7 + R() * 50, rx = 3 + R() * 5, ry = 2.5 + R() * 4, a = R() * 3;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 1, y + 1.5, rx, ry, a, 0, 6.283); g.fill();
      const pg = g.createRadialGradient(x - rx * 0.3, y - ry * 0.4, 1, x, y, rx * 1.3); pg.addColorStop(0, shade(b, 0.4)); pg.addColorStop(1, shade(b, -0.28));
      g.fillStyle = pg; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, 6.283); g.fill();
    }
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i < 2; i++) { let x = R() * TS, y = R() * TS; g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (R() - 0.5) * 18; y += 4 + R() * 9; g.lineTo(x, y); } }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(0, 0, TS, 2); g.fillRect(0, 0, 2, TS);
    g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(0, TS - 2, TS, 2); g.fillRect(TS - 2, 0, 2, TS);
    return c;
  }
  function makeBack(seed) {
    const c = mk(TS, TS), g = c.getContext('2d'), R = rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, TS); gr.addColorStop(0, '#221a2e'); gr.addColorStop(1, '#17111f'); g.fillStyle = gr; g.fillRect(0, 0, TS, TS);
    for (let i = 0; i < 60; i++) { g.fillStyle = R() < 0.5 ? '#ffffff' : '#000000'; g.globalAlpha = 0.04 + R() * 0.05; const s = 1 + R() * 3; g.fillRect(R() * TS, R() * TS, s, s); }
    for (let i = 0; i < 3; i++) { g.globalAlpha = 0.12; g.fillStyle = '#000'; g.beginPath(); g.ellipse(R() * TS, R() * TS, 8 + R() * 8, 5 + R() * 5, R() * 3, 0, 6.283); g.fill(); }
    g.globalAlpha = 1; return c;
  }
  function blob(g, x, y, s, R, n) {
    g.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * 6.283, r = s * (0.72 + R() * 0.4); const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.85; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath();
  }
  function poly(g, pts) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); }
  function gem(g, k, x, y, s, R) {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 1, y + s * 0.8, s * 0.9, s * 0.35, 0, 0, 6.283); g.fill();
    const grad = (c0, c1) => { const q = g.createLinearGradient(x - s, y - s, x + s, y + s); q.addColorStop(0, c0); q.addColorStop(1, c1); return q; };
    g.lineJoin = 'round'; g.lineWidth = 1.2;
    switch (k) {
      case 0: blob(g, x, y, s, R, 7); g.fillStyle = grad('#5a5a6a', '#101016'); g.fill(); g.strokeStyle = '#000a'; g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.35, s * 0.28, s * 0.14, -0.6, 0, 6.283); g.fill(); break;
      case 1: blob(g, x, y, s, R, 8); g.fillStyle = grad('#ffc08a', '#b4501c'); g.fill(); g.strokeStyle = '#5a2208'; g.stroke(); g.fillStyle = '#5fd0a0'; g.globalAlpha = 0.6; g.fillRect(x + s * 0.2, y + s * 0.1, 2, 2); g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - s * 0.5, y - s * 0.5, s * 0.5, 1.6); break;
      case 2: blob(g, x, y, s, R, 6); g.fillStyle = grad('#e0cfcf', '#7c6565'); g.fill(); g.strokeStyle = '#3a2a2a'; g.stroke(); g.fillStyle = '#b4603a'; g.globalAlpha = 0.7; g.fillRect(x - 2, y + 1, 3, 2); g.globalAlpha = 1; break;
      case 3: poly(g, [[x - s, y], [x - s * 0.5, y - s * 0.9], [x + s * 0.6, y - s * 0.8], [x + s, y + s * 0.1], [x + s * 0.3, y + s * 0.9], [x - s * 0.7, y + s * 0.7]]); g.fillStyle = grad('#ffffff', '#8c9ab4'); g.fill(); g.strokeStyle = '#3c4660'; g.stroke(); g.strokeStyle = 'rgba(80,100,140,.55)'; g.beginPath(); g.moveTo(x - s * 0.5, y - s * 0.9); g.lineTo(x, y + s * 0.1); g.lineTo(x + s, y + s * 0.1); g.stroke(); break;
      case 4: blob(g, x, y, s * 1.05, R, 8); g.fillStyle = grad('#fff6b0', '#d08a00'); g.fill(); g.strokeStyle = '#6a4500'; g.stroke(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.35, s * 0.3, s * 0.14, -0.6, 0, 6.283); g.fill(); break;
      case 5: poly(g, [[x, y - s * 1.1], [x + s * 0.8, y - s * 0.4], [x + s * 0.8, y + s * 0.5], [x, y + s * 1.1], [x - s * 0.8, y + s * 0.5], [x - s * 0.8, y - s * 0.4]]); g.fillStyle = grad('#ff9ab0', '#a8102c'); g.fill(); g.strokeStyle = '#4a0612'; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(x, y - s * 1.1); g.lineTo(x, y + s * 1.1); g.moveTo(x - s * 0.8, y - s * 0.4); g.lineTo(x, y); g.lineTo(x + s * 0.8, y - s * 0.4); g.stroke(); break;
      case 6: poly(g, [[x - s * 0.5, y - s], [x + s * 0.5, y - s], [x + s, y - s * 0.4], [x + s, y + s * 0.4], [x + s * 0.5, y + s], [x - s * 0.5, y + s], [x - s, y + s * 0.4], [x - s, y - s * 0.4]]); g.fillStyle = grad('#9affc8', '#087a40'); g.fill(); g.strokeStyle = '#04361c'; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.strokeRect(x - s * 0.5, y - s * 0.5, s, s); break;
      case 7: poly(g, [[x - s, y - s * 0.3], [x - s * 0.5, y - s * 0.9], [x + s * 0.5, y - s * 0.9], [x + s, y - s * 0.3], [x, y + s * 1.1]]); g.fillStyle = grad('#ffffff', '#40c8f0'); g.fill(); g.strokeStyle = '#0a5a7a'; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(x - s, y - s * 0.3); g.lineTo(x + s, y - s * 0.3); g.moveTo(x - s * 0.5, y - s * 0.9); g.lineTo(x - s * 0.2, y - s * 0.3); g.lineTo(x, y + s * 1.1); g.moveTo(x + s * 0.5, y - s * 0.9); g.lineTo(x + s * 0.2, y - s * 0.3); g.lineTo(x, y + s * 1.1); g.stroke(); break;
      default: { const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 - 1.57, r = i % 2 ? s * 0.42 : s * 1.25; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } poly(g, pts); g.fillStyle = grad('#ffd6ff', '#8a1ec8'); g.fill(); g.strokeStyle = '#3a0a5a'; g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, s * 0.18, 0, 6.283); g.fill(); }
    }
  }
  function makeOre(k, seed) {
    const c = mk(TS, TS), g = c.getContext('2d'), R = rng(seed + k * 77);
    const n = k === 0 ? 5 : k < 3 ? 4 : 3;
    const spots = [[18, 18], [44, 20], [32, 34], [16, 46], [46, 46]];
    for (let i = 0; i < n; i++) { const p = spots[(i + (seed % 2) * 2) % spots.length]; gem(g, k, p[0] + (R() - 0.5) * 8, p[1] + (R() - 0.5) * 8, k === 0 ? 5.5 + R() * 2 : 6 + R() * 3, R); }
    return c;
  }
  let atlasReady = false;
  function buildAtlas() {
    for (let b = 0; b < BASE.length; b++) { dirtTiles[b] = []; for (let v = 0; v < 4; v++) dirtTiles[b].push(makeDirt(BASE[b], b * 31 + v * 7 + 1)); }
    for (let v = 0; v < 3; v++) backTiles.push(makeBack(v * 13 + 5));
    for (let k = 0; k < NO; k++) { oreTiles[k] = []; for (let v = 0; v < 4; v++) oreTiles[k].push(makeOre(k, v * 5 + 3)); }
    atlasReady = true;
  }

  function fitCanvas() {
    const st = $('#stage'), w = st.clientWidth, h = st.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; dark.width = pw; dark.height = ph; }
    PX = pw / LW; LH = ph / PX; VH = LH / CS; MY = Math.max(2.8, VH * 0.36);
  }
  window.addEventListener('resize', fitCanvas);

  function spawnChips(r, c, col, n) {
    if (!settings.effects) return;
    for (let i = 0; i < n; i++) parts.push({ x: (c + 0.5) * CS, y: (r + 0.5) * CS, vx: (Math.random() - 0.5) * 170, vy: -70 - Math.random() * 120, life: 0.5 + Math.random() * 0.35, t: 0, col, s: 2 + Math.random() * 3.2 });
  }
  function addFloat(txt, col, r, c, big) { floats.push({ x: (c + 0.5) * CS, y: r * CS, txt, col, t: 0, big }); if (floats.length > 12) floats.shift(); }
  function addFly(r, c, col) {
    if (!settings.effects) return;
    flies.push({ x: (c + 0.5 - cam.x) * CS, y: (r + 0.5 - cam.y) * CS, tx: 24, ty: LH - 6, t: 0, col, cx: (Math.random() - 0.5) * 80 });
    if (flies.length > 14) flies.shift();
  }

  function drawCell(r, c) {
    const x = c * CS, y = r * CS, ty = ctype(r, c), k = r * W + c;
    if (!state.seen.has(k)) { ctx.fillStyle = '#050409'; ctx.fillRect(x, y, CS + 0.5, CS + 0.5); return; }
    const v = (L.hash(r, c, 3, state.seed) * 4) | 0;
    if (ty === T.AIR) { ctx.drawImage(backTiles[v % 3], x, y, CS + 0.5, CS + 0.5); return; }
    ctx.drawImage(dirtTiles[bandOf(r)][v], x, y, CS + 0.5, CS + 0.5);
    if (ty >= T.ORE && ty < T.ORE + NO) ctx.drawImage(oreTiles[ty - T.ORE][(L.hash(r, c, 9, state.seed) * 4) | 0], x, y, CS + 0.5, CS + 0.5);
    else if (ty === T.CHEST) drawChest(x, y);
    else if (ty === T.ART) drawArt(x, y, r, c);
    else if (ty === T.LAVA) drawLava(x, y, r, c);
    // тени у краёв туннелей
    const sh = 7;
    const air = (rr, cc) => ctype(rr, cc) === T.AIR && state.seen.has(rr * W + cc);
    if (r > 0 && air(r - 1, c)) { const g = ctx.createLinearGradient(0, y, 0, y + sh); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, CS, sh); }
    if (air(r + 1, c)) { const g = ctx.createLinearGradient(0, y + CS, 0, y + CS - sh); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y + CS - sh, CS, sh); }
    if (c > 0 && air(r, c - 1)) { const g = ctx.createLinearGradient(x, 0, x + sh, 0); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, sh, CS); }
    if (air(r, c + 1)) { const g = ctx.createLinearGradient(x + CS, 0, x + CS - sh, 0); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x + CS - sh, y, sh, CS); }
    if (r === 0) {   // трава на верхней клетке
      const g = ctx.createLinearGradient(0, y, 0, y + 9); g.addColorStop(0, '#6fd45a'); g.addColorStop(1, '#3f9a3a'); ctx.fillStyle = g; ctx.fillRect(x, y, CS + 0.5, 8);
      ctx.fillStyle = '#58bb4c'; for (let i = 0; i < 6; i++) { const bx = x + 3 + i * 6.5; ctx.beginPath(); ctx.moveTo(bx, y + 8); ctx.lineTo(bx + 2, y + 11 + (i % 2) * 2); ctx.lineTo(bx + 4, y + 8); ctx.fill(); }
    }
  }
  function drawLava(x, y, r, c) {
    const p = (Math.sin(time * 2.4 + r * 1.7 + c * 2.3) + 1) / 2, q = (Math.sin(time * 3.1 + c * 1.3) + 1) / 2;
    const g = ctx.createLinearGradient(0, y, 0, y + CS); g.addColorStop(0, '#ffb020'); g.addColorStop(0.5, '#ff5a10'); g.addColorStop(1, '#a01806');
    ctx.fillStyle = g; ctx.fillRect(x, y, CS + 0.5, CS + 0.5);
    ctx.fillStyle = `rgba(255,240,150,${0.35 + p * 0.3})`;
    ctx.beginPath(); ctx.ellipse(x + 12 + p * 14, y + 13 + q * 8, 7, 3.5, 0, 0, 6.283); ctx.ellipse(x + 28 - q * 10, y + 28, 6, 3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(90,10,0,.5)'; ctx.fillRect(x, y + CS - 3, CS, 3);
  }
  function drawChest(x, y) {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + 20, y + 33, 15, 4, 0, 0, 6.283); ctx.fill();
    const b = ctx.createLinearGradient(0, y + 12, 0, y + 32); b.addColorStop(0, '#b07434'); b.addColorStop(1, '#6a3c14');
    ctx.fillStyle = b; ctx.strokeStyle = '#2c1606'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x + 6, y + 13, 28, 19, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c88a40'; ctx.beginPath(); ctx.roundRect(x + 6, y + 8, 28, 9, [6, 6, 0, 0]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd24a'; ctx.fillRect(x + 6, y + 16, 28, 3); ctx.fillRect(x + 17, y + 15, 6, 9); ctx.fillStyle = '#7a5200'; ctx.fillRect(x + 19, y + 18, 2, 3);
    const tw = (Math.sin(time * 5) + 1) / 2; ctx.fillStyle = `rgba(255,255,255,${0.4 + tw * 0.5})`; ctx.fillRect(x + 28, y + 9, 2, 2);
  }
  function drawArt(x, y, r, c) {
    const i = L.artIndex(state, r, c), tw = (Math.sin(time * 3 + i) + 1) / 2;
    const g = ctx.createRadialGradient(x + 20, y + 20, 2, x + 20, y + 20, 20); g.addColorStop(0, `rgba(255,240,170,${0.55 + tw * 0.3})`); g.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, CS, CS);
    ctx.font = '22px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ART_ICON[i] || '❓', x + 20, y + 21);
  }

  function drawSurface() {
    const top = -30 * CS, grassY = 0;
    const g = ctx.createLinearGradient(0, -9 * CS, 0, grassY);
    g.addColorStop(0, '#3a7ad0'); g.addColorStop(0.7, '#8cd0ff'); g.addColorStop(1, '#d6f0ff');
    ctx.fillStyle = g; ctx.fillRect(-4, top, W * CS + 8, -top);
    ctx.fillStyle = '#3a7ad0'; ctx.fillRect(-4, top, W * CS + 8, top * -1 - 9 * CS);
    ctx.fillStyle = g; ctx.fillRect(-4, -9 * CS, W * CS + 8, 9 * CS);
    const sx = 2.2 * CS, sy = -5.2 * CS;
    const sg = ctx.createRadialGradient(sx, sy, 6, sx, sy, 60); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.3, '#fff3b0'); sg.addColorStop(1, 'rgba(255,243,176,0)');
    ctx.fillStyle = sg; ctx.fillRect(sx - 60, sy - 60, 120, 120);
    for (let i = 0; i < 4; i++) {
      const cx = ((time * 6 + i * 170) % (W * CS + 120)) - 60, cy = -(3 + (i % 2) * 1.6) * CS;
      ctx.fillStyle = '#ffffffd0'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 6.283); ctx.arc(cx + 16, cy - 5, 17, 0, 6.283); ctx.arc(cx + 34, cy, 13, 0, 6.283); ctx.fill();
    }
    // дальние холмы
    ctx.fillStyle = '#6fb67a'; ctx.beginPath(); ctx.moveTo(0, 0); for (let x = 0; x <= W * CS; x += 16) ctx.lineTo(x, -34 - Math.sin(x / 90 + 1) * 14); ctx.lineTo(W * CS, 0); ctx.fill();
    ctx.fillStyle = '#4c9a5a'; ctx.beginPath(); ctx.moveTo(0, 0); for (let x = 0; x <= W * CS; x += 16) ctx.lineTo(x, -18 - Math.sin(x / 60) * 8); ctx.lineTo(W * CS, 0); ctx.fill();
    // деревья
    [[0.8, 1], [5.4, 0.8], [14, 1.1]].forEach(([tx, sc]) => {
      const x = tx * CS;
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 3 * sc, -26 * sc, 6 * sc, 26 * sc);
      ctx.fillStyle = '#2f8a3a'; ctx.beginPath(); ctx.arc(x, -34 * sc, 16 * sc, 0, 6.283); ctx.arc(x - 11 * sc, -26 * sc, 11 * sc, 0, 6.283); ctx.arc(x + 11 * sc, -26 * sc, 11 * sc, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#4cb04c'; ctx.beginPath(); ctx.arc(x - 4 * sc, -38 * sc, 8 * sc, 0, 6.283); ctx.fill();
    });
    // лавка
    const hx = 9 * CS + 4, hy = 0;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(hx - 6, hy - 4, 100, 5);
    const wall = ctx.createLinearGradient(0, hy - 56, 0, hy); wall.addColorStop(0, '#b0753c'); wall.addColorStop(1, '#7a4a24');
    ctx.fillStyle = wall; ctx.fillRect(hx, hy - 56, 84, 56);
    ctx.strokeStyle = '#4a2a10'; ctx.lineWidth = 1.5; ctx.strokeRect(hx, hy - 56, 84, 56);
    ctx.fillStyle = '#d4503a'; ctx.beginPath(); ctx.moveTo(hx - 10, hy - 56); ctx.lineTo(hx + 42, hy - 92); ctx.lineTo(hx + 94, hy - 56); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#7a2214'; ctx.stroke();
    ctx.fillStyle = '#ffd24a'; ctx.fillRect(hx + 28, hy - 38, 28, 38); ctx.fillStyle = '#4a2a10'; ctx.fillRect(hx + 32, hy - 34, 20, 34);
    ctx.fillStyle = '#ffe9a0'; ctx.fillRect(hx + 8, hy - 42, 14, 14); ctx.fillRect(hx + 62, hy - 42, 14, 14);
    ctx.fillStyle = '#fff'; ctx.font = '800 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t('shop').toUpperCase(), hx + 42, hy - 62);
    // копёр
    ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(3 * CS, 0); ctx.lineTo(3.5 * CS, -74); ctx.lineTo(4 * CS, 0); ctx.moveTo(3.2 * CS, -30); ctx.lineTo(3.8 * CS, -30); ctx.moveTo(3.1 * CS, -52); ctx.lineTo(3.9 * CS, -52); ctx.stroke();
    ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.arc(3.5 * CS, -76, 8, 0, 6.283); ctx.fill(); ctx.fillStyle = '#8a95a8'; ctx.beginPath(); ctx.arc(3.5 * CS, -76, 3, 0, 6.283); ctx.fill();
  }

  function drawMiner() {
    const px = (vis.x + 0.5) * CS, py = (vis.y + 0.5) * CS;
    const dir = state.lastDir || [0, 1];
    const moving = !!state.job, digging = moving && state.job.p.kind === 'dig';
    const bob = Math.sin(time * 10) * (moving ? 1.3 : 0.5);
    const tilt = moving ? dir[0] * 0.09 : 0;
    ctx.save(); ctx.translate(px, py + bob); ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 17, 15, 3.5, 0, 0, 6.283); ctx.fill();
    // гусеницы
    ctx.fillStyle = '#23232d'; ctx.beginPath(); ctx.roundRect(-16, 7, 32, 11, 5); ctx.fill();
    ctx.fillStyle = '#55556a'; for (let i = -3; i <= 3; i++) { const ox = ((driller * 12) % 5) * (moving ? 1 : 0); ctx.fillRect(i * 4.6 + ox - 1, 7.5, 2, 2); ctx.fillRect(i * 4.6 + ox - 1, 15.5, 2, 2); }
    ctx.fillStyle = '#8c8ca0'; [-9, 0, 9].forEach((wx) => { ctx.beginPath(); ctx.arc(wx, 12.5, 3.2, 0, 6.283); ctx.fill(); ctx.fillStyle = '#3a3a48'; ctx.beginPath(); ctx.arc(wx, 12.5, 1.2, 0, 6.283); ctx.fill(); ctx.fillStyle = '#8c8ca0'; });
    if (dir[1] < 0 && moving) { const f = ctx.createLinearGradient(0, 14, 0, 30); f.addColorStop(0, '#fff2a0'); f.addColorStop(0.5, '#ff9a20'); f.addColorStop(1, 'rgba(255,80,0,0)'); ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(-6, 15); ctx.lineTo(0, 22 + Math.random() * 9); ctx.lineTo(6, 15); ctx.fill(); }
    // корпус
    const bg = ctx.createLinearGradient(0, -12, 0, 12); bg.addColorStop(0, '#ffb25a'); bg.addColorStop(0.55, '#ee7420'); bg.addColorStop(1, '#b84a10');
    ctx.fillStyle = bg; ctx.strokeStyle = '#5a2608'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.roundRect(-14, -10, 28, 21, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-11, -8, 22, 2);
    ctx.fillStyle = '#2a2a2a'; for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#ffd23a' : '#2a2a2a'; ctx.fillRect(-12 + i * 5, 8, 5, 2.5); }
    // стекло и гном
    const gg = ctx.createRadialGradient(-2, -8, 1, 0, -4, 10); gg.addColorStop(0, '#f2fcff'); gg.addColorStop(1, '#6fb2e0');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, -3, 8.5, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4cfa8'; ctx.beginPath(); ctx.arc(0, -2, 5, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.moveTo(-4.4, 0); ctx.quadraticCurveTo(0, 9, 4.4, 0); ctx.quadraticCurveTo(0, 2.5, -4.4, 0); ctx.fill();
    const blink = (time % 3.2) > 3.05;
    ctx.fillStyle = '#222'; if (blink) { ctx.fillRect(-3, -3, 2, 0.8); ctx.fillRect(1, -3, 2, 0.8); } else { ctx.beginPath(); ctx.arc(-2, -3, 0.9, 0, 6.283); ctx.arc(2, -3, 0.9, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#7a5200'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -4.5, 5.6, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(0, -8.5, 1.9, 0, 6.283); ctx.fill();
    // антенна
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9, -9); ctx.lineTo(12, -17); ctx.stroke();
    ctx.fillStyle = (time * 2) % 1 < 0.5 ? '#ff4a3a' : '#7a1a14'; ctx.beginPath(); ctx.arc(12, -18, 2, 0, 6.283); ctx.fill();
    // бур
    ctx.save(); ctx.rotate(Math.atan2(dir[1], dir[0]));
    const wob = digging ? Math.sin(time * 80) * 1.1 : 0;
    ctx.translate(13 + wob, 1);
    ctx.fillStyle = '#6a6f7c'; ctx.fillRect(-3, -6, 5, 12);
    const dg = ctx.createLinearGradient(0, -9, 0, 9); dg.addColorStop(0, '#f2f4f8'); dg.addColorStop(0.5, '#aab2c0'); dg.addColorStop(1, '#6a7282');
    ctx.fillStyle = dg; ctx.strokeStyle = '#3a404c'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(2, -9); ctx.lineTo(19, 0); ctx.lineTo(2, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,70,90,.8)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { const o = 2 + ((i * 5.5 + driller * (digging ? 40 : 6)) % 16); const hh = 9 * (1 - (o - 2) / 17); ctx.beginPath(); ctx.moveTo(o, -hh); ctx.lineTo(o + 2, hh); ctx.stroke(); }
    ctx.restore();
    ctx.restore();
    if (digging && settings.effects && Math.random() < 0.5) { const p = state.job.p; parts.push({ x: (p.c + 0.5) * CS + (Math.random() - 0.5) * 18, y: (p.r + 0.5) * CS + (Math.random() - 0.5) * 18, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 60, life: 0.3, t: 0, col: Math.random() < 0.4 ? '#ffe08a' : '#cfc4b0', s: 1.5 + Math.random() * 2 }); }
  }

  function drawLight() {
    const R = L.lampR(state.up.lamp) * CS;
    const mx = (vis.x + 0.5 - cam.x) * CS * PX, my = (vis.y + 0.5 - cam.y) * CS * PX;
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.globalCompositeOperation = 'source-over'; dctx.clearRect(0, 0, dark.width, dark.height);
    dctx.fillStyle = 'rgba(3,2,8,0.8)'; dctx.fillRect(0, 0, dark.width, dark.height);
    dctx.globalCompositeOperation = 'destination-out';
    const flick = 1 + Math.sin(time * 7) * 0.015;
    const g = dctx.createRadialGradient(mx, my, 0, mx, my, R * PX * flick);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.5, 'rgba(0,0,0,0.92)'); g.addColorStop(0.8, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    dctx.fillStyle = g; dctx.beginPath(); dctx.arc(mx, my, R * PX * flick + 2, 0, 6.283); dctx.fill();
    // дневной свет у поверхности
    const gy = (0 - cam.y) * CS * PX;
    dctx.fillStyle = '#000'; if (gy > 0) dctx.fillRect(0, 0, dark.width, gy);
    const dl = dctx.createLinearGradient(0, gy, 0, gy + 3.2 * CS * PX); dl.addColorStop(0, 'rgba(0,0,0,1)'); dl.addColorStop(1, 'rgba(0,0,0,0)');
    dctx.fillStyle = dl; dctx.fillRect(0, gy, dark.width, 3.2 * CS * PX);
    // собственное свечение лавы и самоцветов
    const r0 = Math.max(0, Math.floor(cam.y) - 1), r1 = Math.min(H - 1, Math.ceil(cam.y + VH) + 1), c0 = Math.max(0, Math.floor(cam.x) - 1), c1 = Math.min(W - 1, Math.ceil(cam.x + VW) + 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (!state.seen.has(r * W + c)) continue;
      const ty = ctype(r, c); let rad = 0, a = 0;
      if (ty === T.LAVA) { rad = 2.1; a = 0.8; } else if (ty >= T.ORE + 3 && ty < T.ORE + NO) { rad = 1.1 + (ty - T.ORE - 3) * 0.12; a = 0.45; } else if (ty === T.ART) { rad = 1.4; a = 0.6; } else continue;
      const x = ((c + 0.5) - cam.x) * CS * PX, y = ((r + 0.5) - cam.y) * CS * PX, rr = rad * CS * PX;
      const lg = dctx.createRadialGradient(x, y, 0, x, y, rr); lg.addColorStop(0, `rgba(0,0,0,${a})`); lg.addColorStop(1, 'rgba(0,0,0,0)');
      dctx.fillStyle = lg; dctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(dark, 0, 0);
    ctx.setTransform(PX, 0, 0, PX, 0, 0);
    // тёплый цвет вокруг фонаря и свечение лавы поверх
    ctx.globalCompositeOperation = 'lighter';
    const wmx = mx / PX, wmy = my / PX;
    const wg = ctx.createRadialGradient(wmx, wmy, 2, wmx, wmy, R * 0.8); wg.addColorStop(0, 'rgba(255,200,110,0.22)'); wg.addColorStop(1, 'rgba(255,200,110,0)');
    ctx.fillStyle = wg; ctx.fillRect(wmx - R, wmy - R, R * 2, R * 2);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (ctype(r, c) !== T.LAVA || !state.seen.has(r * W + c)) continue;
      const x = ((c + 0.5) - cam.x) * CS, y = ((r + 0.5) - cam.y) * CS, rr = 2.2 * CS;
      const lg = ctx.createRadialGradient(x, y, 0, x, y, rr); lg.addColorStop(0, 'rgba(255,110,30,0.35)'); lg.addColorStop(1, 'rgba(255,110,30,0)');
      ctx.fillStyle = lg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function render(dt) {
    if (!atlasReady) return;
    time += dt;
    const sp = 1 - Math.pow(0.0001, dt);
    vis.x += (state.c - vis.x) * sp; vis.y += (state.r - vis.y) * sp;
    if (Math.abs(vis.x - state.c) < 0.004) vis.x = state.c; if (Math.abs(vis.y - state.r) < 0.004) vis.y = state.r;
    const camTx = Math.min(W - VW, Math.max(0, vis.x + 0.5 - VW / 2)), camTy = vis.y + 0.5 - MY;
    const cs = 1 - Math.pow(0.002, dt);
    cam.x += (camTx - cam.x) * cs; cam.y += (camTy - cam.y) * cs;
    if (state.job && state.job.p.kind === 'dig') driller += dt; else driller += dt * 0.2;

    ctx.setTransform(PX, 0, 0, PX, 0, 0);
    ctx.fillStyle = '#050409'; ctx.fillRect(0, 0, LW, LH);
    ctx.save();
    let sx = 0, sy = 0;
    if (shake > 0.2 && settings.effects) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; shake *= Math.pow(0.02, dt); } else shake = 0;
    ctx.translate(-cam.x * CS + sx, -cam.y * CS + sy);
    drawSurface();
    const r0 = Math.max(0, Math.floor(cam.y) - 1), r1 = Math.min(H - 1, Math.ceil(cam.y + VH) + 1);
    const c0 = Math.max(0, Math.floor(cam.x) - 1), c1 = Math.min(W - 1, Math.ceil(cam.x + VW) + 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) drawCell(r, c);
    if (state.job && state.job.p.kind === 'dig') {
      const p = state.job.p, f = Math.min(1, state.job.t / p.dur), x = p.c * CS, y = p.r * CS;
      ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
      if (f > 0.12) { ctx.moveTo(x + 20, y + 1); ctx.lineTo(x + 14, y + 14); ctx.lineTo(x + 22, y + 21); }
      if (f > 0.4) { ctx.moveTo(x + 2, y + 30); ctx.lineTo(x + 16, y + 24); ctx.lineTo(x + 11, y + 11); ctx.moveTo(x + 22, y + 21); ctx.lineTo(x + 30, y + 30); }
      if (f > 0.7) { ctx.moveTo(x + 38, y + 9); ctx.lineTo(x + 27, y + 19); ctx.lineTo(x + 35, y + 33); ctx.moveTo(x + 14, y + 14); ctx.lineTo(x + 4, y + 8); }
      ctx.stroke();
      ctx.fillStyle = `rgba(0,0,0,${(f * 0.25).toFixed(2)})`; ctx.fillRect(x, y, CS, CS);
    }
    ctx.fillStyle = '#050409'; ctx.fillRect(-80, -3000, 80, 9000); ctx.fillRect(W * CS, -3000, 80, 9000);
    drawMiner();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt; if (p.t > p.life) { parts.splice(i, 1); continue; }
      p.vy += 430 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    drawLight();
    // пылинки в луче фонаря
    if (state.r >= 0) {
      while (motes.length < 22) motes.push({ a: Math.random() * 6.283, d: Math.random(), s: 0.2 + Math.random() * 0.4 });
      const mx = (vis.x + 0.5 - cam.x) * CS, my = (vis.y + 0.5 - cam.y) * CS, R = L.lampR(state.up.lamp) * CS * 0.8;
      ctx.fillStyle = 'rgba(255,235,190,.5)';
      motes.forEach((m) => { m.a += dt * m.s * 0.6; const x = mx + Math.cos(m.a) * m.d * R, y = my + Math.sin(m.a * 1.3) * m.d * R * 0.8 - Math.sin(time * m.s + m.a) * 3; ctx.fillRect(x, y, 1.4, 1.4); });
    }
    // глубинная линейка слева
    ctx.font = '800 9px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (let r = Math.max(4, r0); r <= r1; r++) {
      if ((r + 1) % 5) continue;
      const y = (r + 0.5 - cam.y) * CS; if ((r + 1) % 10 === 0) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(11, y); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(r + 1, 13, y); ctx.fillStyle = '#fff'; ctx.fillText(r + 1, 13, y); }
      else { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(6, y); ctx.stroke(); }
    }
    // тексты над добычей
    ctx.save(); ctx.translate(-cam.x * CS, -cam.y * CS);
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i]; f.t += dt; if (f.t > 1.15) { floats.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, (1.15 - f.t) * 2); ctx.font = `800 ${f.big ? 17 : 13}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const yy = f.y - 6 - f.t * 36; ctx.lineWidth = 3.5; ctx.strokeStyle = '#000'; ctx.strokeText(f.txt, f.x, yy); ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, yy);
    }
    ctx.restore(); ctx.globalAlpha = 1;
    // летящие в мешок самоцветы
    for (let i = flies.length - 1; i >= 0; i--) {
      const f = flies[i]; f.t += dt * 1.8; if (f.t >= 1) { flies.splice(i, 1); bump = 1; continue; }
      const e = f.t * f.t, x = f.x + (f.tx - f.x) * e + Math.sin(f.t * 3.14) * f.cx, y = f.y + (f.ty - f.y) * e - Math.sin(f.t * 3.14) * 40;
      ctx.fillStyle = f.col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4.5, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4.5, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (bump > 0) { bump = Math.max(0, bump - dt * 4); $('#cbar').style.transform = `scale(${1 + bump * 0.05})`; }
    if (flash > 0.02) { ctx.fillStyle = `rgba(255,60,20,${(flash * 0.45).toFixed(2)})`; ctx.fillRect(0, 0, LW, LH); flash *= Math.pow(0.02, dt); }
    const lowE = state.energy / L.tankMax(state.up.tank);
    if (lowE < 0.2 && state.r >= 0) { const a = (0.18 + 0.12 * Math.sin(time * 6)) * (1 - lowE / 0.2); const vg = ctx.createRadialGradient(LW / 2, LH / 2, LH * 0.3, LW / 2, LH / 2, LH * 0.7); vg.addColorStop(0, 'rgba(255,30,30,0)'); vg.addColorStop(1, `rgba(255,30,30,${a.toFixed(2)})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, LW, LH); }
  }

  /* ---------- события ---------- */
  let lastBandToast = -1;
  function onEvents(evs) {
    for (const e of evs) {
      switch (e.type) {
        case 'dug': {
          const b = BAND[bandOf(e.r)]; spawnChips(e.r, e.c, b[1], 5); sndDig(L.hardness(e.r));
          if (settings.effects) shake = Math.max(shake, 1.2);
          break;
        }
        case 'ore': addFly(e.r, e.c, ORE_COL[e.ore]); addFloat('+' + NAMES().ores[e.ore], e.ore >= 3 ? ORE_COL[e.ore] : '#fff', e.r, e.c, e.ore >= 5); spawnChips(e.r, e.c, ORE_COL[e.ore], 6); sndOre(e.ore); if (e.ore >= 5 && settings.effects) shake = Math.max(shake, 4); break;
        case 'full': addFloat(t('bagFull'), '#ff8a7a', e.r, e.c, true); sndFail(); toast(t('bagFull')); break;
        case 'chest': addFloat('+' + L.fmt(e.gain), '#ffd24a', e.r, e.c, true); spawnChips(e.r, e.c, '#ffd24a', 12); sndSell(); toast(t('chest', { n: L.fmt(e.gain) })); break;
        case 'art': addFloat(ART_ICON[e.i], '#fff', e.r, e.c, true); spawnChips(e.r, e.c, '#fff0a0', 16); sndSell(); toast(t('art', { n: NAMES().arts[e.i] })); save(); break;
        case 'lava': flash = 1; shake = 10; sndLava(); addFloat('−' + Math.round(e.dmg), '#ff6a4a', e.r, e.c, true); toast(t('lava', { n: Math.round(e.dmg) })); break;
        case 'boom': spawnChips(e.r, e.c, '#ffb040', 5); if (e.t >= T.ORE && e.t < T.ORE + NO) addFloat('+' + NAMES().ores[e.t - T.ORE], '#fff', e.r, e.c); break;
        case 'best': if (e.depth % 10 === 0 && e.depth > 0) toast(t('newDepth', { n: e.depth })); break;
        case 'bed': toast(t('bed')); break;
        case 'bagfull': break;
        case 'exhausted': clearInput(); state.dir = null; openStuck(); break;
        case 'surface': clearInput(); state.dir = null; onSurface(e); break;
        default: break;
      }
    }
    if (evs.length) { updateHud(); }
  }
  function onSurface(e) {
    sndSell(); save(); lbSubmit(false);
    if (e.gain > 0) openSale(e); else { toast(t('saleNone')); }
  }
  let saleGain = 0, saleDoubled = false;
  function openSale(e) {
    saleGain = e.gain; saleDoubled = false;
    $('#sale-title').textContent = t('saleTitle');
    const box = $('#sale-items'); box.textContent = '';
    e.items.forEach((n, i) => {
      if (!n) return;
      const p = document.createElement('div'); p.className = 'pill';
      const dot = document.createElement('i'); dot.style.background = ORE_COL[i]; dot.style.boxShadow = '0 0 0 1px #fff6';
      p.append(dot, document.createTextNode(n + ' × ' + NAMES().ores[i])); box.appendChild(p);
    });
    $('#sale-gain').textContent = '+' + L.fmt(e.gain);
    $('#sale-x2').hidden = false;
    $('#sale-x2-t').textContent = t('adDouble') + ' (+' + L.fmt(e.gain) + ')';
    $('#sale-shop').textContent = t('toShop'); $('#sale-ok').textContent = t('go');
    $('#sale').hidden = false; syncGameplay();
  }
  function closeSale(toShop) {
    $('#sale').hidden = true; syncGameplay(); updateHud();
    if (toShop) openShop();
  }
  function openStuck() {
    $('#stuck-title').textContent = t('stuckTitle'); $('#stuck-text').textContent = t('stuckText');
    $('#stuck-ad').textContent = t('stuckAd');
    const sb = $('#stuck-scroll'); sb.hidden = state.scroll <= 0; sb.textContent = t('stuckScroll') + ' ×' + state.scroll;
    $('#stuck-evac').textContent = L.cargoCount(state) > 0 ? t('stuckEvac') : t('stuckEvacNone');
    $('#stuck').hidden = false; syncGameplay(); sndFail();
  }

  /* ---------- управление ---------- */
  const pointer = { down: false, x: 0, y: 0, axis: 1 };
  const KEYMAP = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] };
  const KEYCHAR = { a: 'KeyA', d: 'KeyD', w: 'KeyW', s: 'KeyS', ф: 'KeyA', в: 'KeyD', ц: 'KeyW', ы: 'KeyS' };
  const keyCode = (e) => (KEYMAP[e.code] ? e.code : KEYCHAR[String(e.key).toLowerCase()] || (KEYMAP[e.key] ? e.key : null));
  function clearInput() { pointer.down = false; keyDirs = []; applyInput(); }
  function pointerDir() {
    if (!pointer.down) return null;
    const mx = (vis.x + 0.5 - cam.x) * CS, my = (vis.y + 0.5 - cam.y) * CS;
    const dx = pointer.x - mx, dy = pointer.y - my, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 9 && ay < 9) return null;
    if (ax > ay * 1.3) pointer.axis = 0; else if (ay > ax * 1.3) pointer.axis = 1;
    return pointer.axis === 0 ? [dx > 0 ? 1 : -1, 0] : [0, dy > 0 ? 1 : -1];
  }
  function applyInput() {
    const d = pointerDir() || (keyDirs.length ? KEYMAP[keyDirs[keyDirs.length - 1]] : null);
    L.setDir(state, d ? d[0] : 0, d ? d[1] : 0);
  }
  function setPointer(e) {
    const rect = cv.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width * LW; pointer.y = (e.clientY - rect.top) / rect.height * LH;
  }
  function bindInput() {
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } window.focus(); ensureAudio(); setPointer(e); pointer.down = true; pointer.axis = 1; applyInput(); hideHint(); });
    cv.addEventListener('pointermove', (e) => { if (pointer.down) setPointer(e); });
    const up = () => { pointer.down = false; applyInput(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('lostpointercapture', up);
    window.addEventListener('keydown', (e) => {
      if (overlayOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'KeyQ') { useDynamite(); e.preventDefault(); return; }
      const k = keyCode(e); if (!k) return;
      e.preventDefault(); ensureAudio(); hideHint();
      keyDirs = keyDirs.filter((x) => x !== k); keyDirs.push(k); applyInput();
    });
    window.addEventListener('keyup', (e) => { const k = keyCode(e); if (!k) return; keyDirs = keyDirs.filter((x) => x !== k); applyInput(); });
  }
  function useDynamite() {
    ensureAudio();
    const ev = L.useDynamite(state);
    if (!ev) return;
    sndBoom(); if (settings.effects) shake = 14;
    onEvents(ev); updateHud(); save();
  }
  function useScroll() {
    ensureAudio();
    const ev = L.useScroll(state);
    if (!ev) return;
    clearInput(); sndSell(); onEvents(ev); updateHud(); save();
  }

  /* ---------- HUD ---------- */
  function setText(el, v) { if (el._v !== v) { el._v = v; el.textContent = v; } }
  function hideHint() { $('#hint').classList.remove('show'); }
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1900); }
  function updateHud() {
    const s = state, d = s.r + 1, tank = L.tankMax(s.up.tank), bag = L.bagMax(s.up.bag), n = L.cargoCount(s);
    setText($('#coins'), L.fmt(s.coins));
    setText($('#depth'), t('depth', { n: Math.max(0, d) }));
    setText($('#biome'), d > 0 ? NAMES().biomes[bandOf(s.r)] : '');
    $('#efill').style.width = (Math.max(0, s.energy) / tank * 100).toFixed(1) + '%';
    setText($('#etext'), Math.ceil(Math.max(0, s.energy)) + ' / ' + tank);
    $('#ebar').classList.toggle('low', s.energy / tank < 0.25);
    $('#cfill').style.width = (n / bag * 100).toFixed(1) + '%';
    setText($('#ctext'), n + ' / ' + bag + (n ? ' · ' + L.fmt(L.cargoValue(s)) : ''));
    $('#cbar').classList.toggle('full', n >= bag);
    setText($('#dyn-n'), '×' + s.dyn); setText($('#dyn-l'), t('dyn'));
    setText($('#scroll-n'), '×' + s.scroll); setText($('#scroll-l'), t('scroll'));
    $('#btn-dyn').disabled = s.dyn <= 0 || s.r < 0; $('#btn-scroll').disabled = s.scroll <= 0 || s.r < 0;
    const sb = $('#btn-shop'); sb.disabled = s.r >= 0; setText(sb, s.r >= 0 ? t('shopOnly') : t('shop'));
    sb.classList.toggle('pulse', s.r < 0 && affordable());
    const h = $('#hint');
    if (s.best < 2 && s.trips === 0 && !overlayOpen()) { setText(h, t('hintStart')); h.classList.add('show'); }
    else if (s.r >= 0 && s.energy / tank < 0.3 && s.r > 3) { setText(h, t('hintBack')); h.classList.add('show'); }
    else h.classList.remove('show');
  }
  function affordable() { return Object.keys(L.UP).some((k) => L.canBuy(state, k)); }

  /* ---------- лавка ---------- */
  let shopTab = 'up', shopRows = {};
  const UP_ICON = { drill: '⛏️', tank: '🔋', bag: '🎒', lamp: '🔦', heat: '🛡️', engine: '⚙️' };
  function upValues(k, lvl) {
    switch (k) {
      case 'drill': return L.drillPower(lvl).toFixed(1) + '×';
      case 'tank': return L.tankMax(lvl);
      case 'bag': return L.bagMax(lvl);
      case 'lamp': return L.lampR(lvl).toFixed(1);
      case 'heat': return Math.round((1 - L.heatMul(lvl)) * 100);
      default: return Math.round((1 - L.engineMul(lvl)) * 100);
    }
  }
  function makeItem(icon) {
    const el = document.createElement('div'); el.className = 'item';
    el.innerHTML = '<div class="ico"></div><div class="info"><div class="nm"><span></span><i></i></div><div class="ds"></div></div><button class="buy"><span></span><small></small></button>';
    el.querySelector('.ico').textContent = icon;
    return { el, nm: el.querySelector('.nm span'), lv: el.querySelector('.nm i'), ds: el.querySelector('.ds'), buy: el.querySelector('.buy'), bl: el.querySelector('.buy span'), bs: el.querySelector('.buy small') };
  }
  function buildShop() {
    const box = $('#shop-list'); box.textContent = ''; shopRows = {};
    if (shopTab === 'up') {
      Object.keys(L.UP).forEach((k) => {
        const r = makeItem(UP_ICON[k]); shopRows[k] = r; box.appendChild(r.el);
        r.buy.addEventListener('click', () => { ensureAudio(); if (L.buy(state, k)) { sndBuy(); updateHud(); updateShop(); save(); } });
      });
    } else if (shopTab === 'sup') {
      [['dyn', '🧨'], ['scroll', '📜']].forEach(([k, ic]) => {
        const r = makeItem(ic); shopRows[k] = r; box.appendChild(r.el);
        r.buy.addEventListener('click', () => { ensureAudio(); if (L.buyItem(state, k)) { sndBuy(); updateHud(); updateShop(); save(); } });
        const f = makeItem('🎁'); shopRows[k + 'F'] = f; f.buy.classList.add('ad'); box.appendChild(f.el);
        f.buy.addEventListener('click', () => { showRewarded(() => { state[k]++; sndBuy(); updateHud(); updateShop(); save(); }); });
      });
    } else {
      const note = document.createElement('div'); note.className = 'col-note'; box.appendChild(note); shopRows.note = note;
      const g = document.createElement('div'); g.className = 'col-grid'; box.appendChild(g); shopRows.cells = [];
      for (let i = 0; i < NA; i++) { const c = document.createElement('div'); c.className = 'col-cell'; c.innerHTML = '<b></b><span></span>'; g.appendChild(c); shopRows.cells.push(c); }
    }
    updateShop();
  }
  function updateShop() {
    if ($('#shop').hidden) return;
    const s = state;
    if (shopTab === 'up') {
      Object.keys(L.UP).forEach((k) => {
        const r = shopRows[k], lvl = s.up[k], mx = L.UP[k].max, maxed = lvl >= mx;
        setText(r.nm, NAMES().upN[k]); setText(r.lv, t('lvl', { n: lvl }) + '/' + mx);
        setText(r.ds, NAMES().upD[k].replace('{a}', upValues(k, lvl)).replace('{b}', maxed ? '—' : upValues(k, lvl + 1)));
        const cost = maxed ? 0 : L.upCost(k, lvl);
        setText(r.bl, maxed ? t('maxed') : L.fmt(cost)); setText(r.bs, maxed ? '' : t('buy'));
        r.buy.disabled = maxed || s.coins < cost;
      });
    } else if (shopTab === 'sup') {
      [['dyn', L.DYN_COST, 'dynD'], ['scroll', L.SCROLL_COST, 'scrollD']].forEach(([k, cost, dk]) => {
        const r = shopRows[k], f = shopRows[k + 'F'];
        setText(r.nm, k === 'dyn' ? t('dyn') : t('scroll')); setText(r.lv, ''); setText(r.ds, t(dk, { n: s[k] }));
        setText(r.bl, L.fmt(cost)); setText(r.bs, t('buy')); r.buy.disabled = s.coins < cost;
        setText(f.nm, (k === 'dyn' ? t('dyn') : t('scroll')) + ' +1'); setText(f.lv, ''); setText(f.ds, t('adFree')); setText(f.bl, '▶'); setText(f.bs, '');
      });
    } else {
      const n = L.artCount(s);
      setText(shopRows.note, t('colBonus', { n, m: NA, p: Math.round(L.ART_BONUS * n * 100) }));
      shopRows.cells.forEach((c, i) => {
        const got = s.arts[i], b = c.firstChild, sp = c.lastChild;
        setText(b, got ? ART_ICON[i] : '❔'); c.classList.toggle('art', true); c.classList.toggle('got', got);
        setText(sp, got ? NAMES().arts[i] : t('colHidden', { n: L.ART_ROWS[i] + 1 }));
      });
    }
  }
  function openShop() { if (state.r >= 0) return; $('#shop').hidden = false; syncGameplay(); buildShop(); }
  function closeShop() { $('#shop').hidden = true; syncGameplay(); updateHud(); }

  /* ---------- настройки и подтверждение ---------- */
  function renderStatic() {
    $('#shop-title').textContent = t('shop');
    document.querySelectorAll('[data-stab]').forEach((b) => { const k = b.dataset.stab; b.textContent = t(k === 'up' ? 'tabUp' : k === 'sup' ? 'tabSup' : 'tabCol'); b.classList.toggle('on', k === shopTab); });
    $('#set-title').textContent = t('settings'); $('#set-sound').textContent = t('sound'); $('#set-fx').textContent = t('effects'); $('#set-lang').textContent = t('lang');
    $('#lb-title').textContent = t('lbTitle'); $('#lb-sub').textContent = t('lbSub'); $('#lb-auth').textContent = t('lbAuth'); $('#lb-close').textContent = t('close');
    $('#reset').textContent = t('reset'); $('#set-close').textContent = t('close');
    document.querySelectorAll('[data-set]').forEach((b) => {
      const k = b.dataset.set;
      if (k === 'lang') b.textContent = settings.lang === 'auto' ? t('langAuto') : settings.lang.toUpperCase();
      else { b.textContent = settings[k] ? t('on') : t('off'); b.classList.toggle('on', settings[k]); }
    });
    document.title = t('title');
    ['#biome', '#depth', '#etext', '#ctext', '#dyn-l', '#scroll-l', '#btn-shop'].forEach((q) => { $(q)._v = undefined; });
    $('#btn-shop')._v = undefined;
  }
  let confirmYes = null;
  function askConfirm(text, yesLabel, onYes) {
    confirmYes = onYes; $('#confirm-text').textContent = text; $('#confirm-yes').textContent = yesLabel; $('#confirm-no').textContent = t('no');
    $('#confirm').hidden = false; syncGameplay();
  }
  function bindUI() {
    $('#btn-dyn').addEventListener('click', useDynamite);
    $('#btn-scroll').addEventListener('click', useScroll);
    $('#btn-shop').addEventListener('click', openShop);
    $('#shop-close').addEventListener('click', closeShop);
    document.querySelectorAll('[data-stab]').forEach((b) => b.addEventListener('click', () => {
      shopTab = b.dataset.stab; document.querySelectorAll('[data-stab]').forEach((x) => x.classList.toggle('on', x === b)); buildShop();
    }));
    $('#sale-ok').addEventListener('click', () => closeSale(false));
    $('#sale-shop').addEventListener('click', () => closeSale(true));
    $('#sale-x2').addEventListener('click', () => {
      if (saleDoubled) return;
      showRewarded(() => { saleDoubled = true; state.coins += saleGain; state.total += saleGain; $('#sale-x2').hidden = true; $('#sale-gain').textContent = '+' + L.fmt(saleGain * 2); toast(t('doubled')); sndSell(); updateHud(); save(); });
    });
    $('#stuck-ad').addEventListener('click', () => showRewarded(() => { L.rescueFull(state); $('#stuck').hidden = true; syncGameplay(); updateHud(); save(); }));
    $('#stuck-scroll').addEventListener('click', () => { $('#stuck').hidden = true; syncGameplay(); useScroll(); });
    $('#stuck-evac').addEventListener('click', () => { $('#stuck').hidden = true; syncGameplay(); const ev = L.evacuate(state); onEvents(ev); updateHud(); save(); });
    $('#settings-btn').addEventListener('click', () => { $('#settings').hidden = false; syncGameplay(); clearInput(); });
    $('#lb-btn').addEventListener('click', () => { clearInput(); openLb(); });
    $('#lb-close').addEventListener('click', () => { $('#lb').hidden = true; syncGameplay(); });
    $('#lb-auth').addEventListener('click', lbAuth);
    $('#set-close').addEventListener('click', () => { $('#settings').hidden = true; syncGameplay(); });
    document.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.set;
      if (k === 'lang') { settings.lang = settings.lang === 'auto' ? 'ru' : settings.lang === 'ru' ? 'en' : 'auto'; pickLang(); }
      else { settings[k] = !settings[k]; if (k === 'sound' && settings.sound) ensureAudio(); }
      saveSettings(); renderStatic(); updateHud();
    }));
    $('#reset').addEventListener('click', () => askConfirm(t('confirm'), t('yes'), () => {
      state = L.create(); vis.x = state.c; vis.y = state.r; parts.length = 0; floats.length = 0; $('#settings').hidden = true; lbSent = 0;
      save(); updateHud(); syncGameplay();
    }));
    $('#confirm-no').addEventListener('click', () => { $('#confirm').hidden = true; confirmYes = null; syncGameplay(); });
    $('#confirm-yes').addEventListener('click', () => { const f = confirmYes; confirmYes = null; $('#confirm').hidden = true; if (f) f(); syncGameplay(); });
    document.addEventListener('visibilitychange', () => { pauseAudio(document.hidden); syncGameplay(); if (document.hidden) { save(); clearInput(); } });
    window.addEventListener('pagehide', save);
    document.addEventListener('pointerdown', ensureAudio, { passive: true });
  }

  /* ---------- цикл ---------- */
  let last = 0, hudAcc = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    if (!overlayOpen() && !adPlaying) {
      if (pointer.down) applyInput();
      let left = dt;
      while (left > 0) { const h = Math.min(0.035, left); left -= h; const ev = L.step(state, h); if (ev.length) onEvents(ev); }
    }
    render(dt);
    hudAcc += dt;
    if (hudAcc > 0.12) { hudAcc = 0; updateHud(); updateShop(); }
    requestAnimationFrame(frame);
  }

  /* ---------- запуск ---------- */
  async function initYandex() {
    if (typeof YaGames === 'undefined') return;
    try {
      ysdk = await YaGames.init();
      if (ysdk.on) {
        ysdk.on('game_api_pause', () => { apiPaused = true; pauseAudio(true); syncGameplay(); });
        ysdk.on('game_api_resume', () => { apiPaused = false; pauseAudio(false); syncGameplay(); });
      }
    } catch (e) { ysdk = null; }
  }
  async function start() {
    loadSettings();
    await initYandex();
    pickLang();
    const local = loadLocal(), cloud = await loadCloud();
    let best = local;
    if (cloud && (!local || cloud.savedAt > local.savedAt)) best = cloud;
    if (best) { state = best.s; savedAt = best.savedAt; }
    buildAtlas(); fitCanvas();
    vis.x = state.c; vis.y = state.r; cam.x = Math.min(W - VW, Math.max(0, state.c + 0.5 - VW / 2)); cam.y = state.r + 0.5 - MY; bindInput(); bindUI(); renderStatic(); updateHud();
    setInterval(save, 15000);
    setInterval(() => lbSubmit(false), 30000);
    if (ysdk && (ysdk.leaderboards || ysdk.getLeaderboards)) $('#lb-btn').hidden = false;
    requestAnimationFrame(frame);
    try { if (ysdk && ysdk.features && ysdk.features.LoadingAPI) ysdk.features.LoadingAPI.ready(); } catch (e) { /* ignore */ }
    syncGameplay();
  }
  window.__dig = { get state() { return state; }, L, setState(s) { state = s; vis.x = s.c; vis.y = s.r; }, openShop, onEvents, updateHud, save };
  start();
})();
