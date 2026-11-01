/* Раскоп — логика: мир-сетка, копание, энергия, мешок, улучшения. UMD, тестируется в Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.MineLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const W = 15, H = 200;                 // ширина мира, число рядов (последний — коренная порода)
  const T = { AIR: 0, DIRT: 1, ORE: 2, LAVA: 20, CHEST: 21, ART: 22, BED: 30 };
  const ORES = [   // from — глубина, p — шанс клетки, v — цена
    { from: 1, p: 0.13, v: 5 }, { from: 6, p: 0.07, v: 14 }, { from: 18, p: 0.04, v: 22 }, { from: 32, p: 0.03, v: 55 },
    { from: 48, p: 0.022, v: 130 }, { from: 68, p: 0.016, v: 300 }, { from: 92, p: 0.012, v: 650 }, { from: 120, p: 0.008, v: 1400 }, { from: 155, p: 0.006, v: 3500 },
  ];
  const NO = ORES.length;
  const ART_ROWS = [11, 26, 40, 55, 70, 84, 99, 114, 130, 146, 162, 180];
  const NA = ART_ROWS.length;
  const ART_BONUS = 0.05;               // +5% к цене продажи за артефакт
  // улучшения: base — цена 1-го уровня, g — рост, max — максимум уровней
  const UP = {
    drill: { base: 50, g: 1.95, max: 14 },
    tank: { base: 45, g: 1.85, max: 14 },
    bag: { base: 40, g: 1.8, max: 12 },
    lamp: { base: 120, g: 2.6, max: 5 },
    heat: { base: 300, g: 2.2, max: 5 },
    engine: { base: 200, g: 2.1, max: 8 },
  };
  const DYN_COST = 150, SCROLL_COST = 450;

  function hash(a, b, c, seed) {
    let h = (seed | 0) ^ Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; h = Math.imul(h, 2246822519); h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  }
  const artCol = (seed, i) => Math.floor(hash(i, 5, 9, seed) * W);

  function gen(seed, r, c) {
    if (r >= H - 1) return T.BED;
    const d = r + 1;
    for (let i = 0; i < NA; i++) if (r === ART_ROWS[i] && c === artCol(seed, i)) return T.ART;
    if (r >= 3 && hash(r, c, 77, seed) < 0.04) return T.AIR;
    if (d >= 22 && hash(r, c, 88, seed) < 0.028) return T.LAVA;
    if (d >= 6 && hash(r, c, 99, seed) < 0.005) return T.CHEST;
    for (let k = NO - 1; k >= 0; k--) {
      if (d < ORES[k].from) continue;
      let p = ORES[k].p;
      if (hash(r >> 2, c >> 2, k + 200, seed) < 0.18) p *= 3.5;
      if (hash(r, c, k + 10, seed) < p) return T.ORE + k;
    }
    return T.DIRT;
  }
  const hardness = (r) => 1 + (r + 1) * 0.06;
  const drillPower = (l) => Math.pow(1.45, l);
  const tankMax = (l) => Math.round(100 * Math.pow(1.35, l));
  const bagMax = (l) => 10 + 6 * l;
  const lampR = (l) => 3.5 + 0.9 * l;
  const heatMul = (l) => Math.pow(0.7, l);
  const engineMul = (l) => Math.pow(0.9, l);

  function create(seed) {
    const s = {
      v: 1, seed: seed === undefined ? Math.floor(Math.random() * 1e9) : seed | 0,
      coins: 0, total: 0, r: -1, c: Math.floor(W / 2), energy: 100,
      up: { drill: 0, tank: 0, bag: 0, lamp: 0, heat: 0, engine: 0 },
      cargo: new Array(NO).fill(0), dyn: 0, scroll: 0, best: 0, trips: 0,
      arts: new Array(NA).fill(false), mined: new Set(), seen: new Set(),
      job: null, dir: null, stuck: false, lastDir: [0, 1], msgFull: 0,
    };
    s.energy = tankMax(0);
    reveal(s);
    return s;
  }
  const key = (r, c) => r * W + c;
  function cell(s, r, c) {
    if (c < 0 || c >= W) return T.BED;
    if (r < 0) return T.AIR;
    if (r >= H) return T.BED;
    if (s.mined.has(key(r, c))) return T.AIR;
    const t = gen(s.seed, r, c);
    if (t === T.ART) { const i = artIndex(s, r, c); if (i >= 0 && s.arts[i]) return T.DIRT; }
    return t;
  }
  function artIndex(s, r, c) { for (let i = 0; i < NA; i++) if (ART_ROWS[i] === r && artCol(s.seed, i) === c) return i; return -1; }
  function reveal(s) {
    const R = lampR(s.up.lamp), ri = Math.ceil(R);
    for (let dr = -ri; dr <= ri; dr++) for (let dc = -ri; dc <= ri; dc++) {
      if (dr * dr + dc * dc > R * R) continue;
      const r = s.r + dr, c = s.c + dc;
      if (r >= 0 && r < H && c >= 0 && c < W) s.seen.add(key(r, c));
    }
  }
  const cargoCount = (s) => s.cargo.reduce((a, b) => a + b, 0);
  const artCount = (s) => s.arts.reduce((a, b) => a + (b ? 1 : 0), 0);
  const sellMult = (s) => 1 + ART_BONUS * artCount(s);
  const cargoValue = (s) => Math.floor(s.cargo.reduce((a, n, i) => a + n * ORES[i].v, 0) * sellMult(s));
  const upCost = (kind, lvl) => Math.ceil(UP[kind].base * Math.pow(UP[kind].g, lvl));
  const moveCost = (s, solid, r) => (solid ? 1 + hardness(r) * 0.12 : 0.45) * engineMul(s.up.engine);
  const digTime = (s, r) => Math.max(0.06, 0.30 * hardness(r) / drillPower(s.up.drill));
  const moveTime = (s) => 0.085 * Math.pow(0.93, s.up.engine);

  function setDir(s, dx, dy) { s.dir = dx || dy ? [dx, dy] : null; }

  function plan(s, dx, dy) {
    const r = s.r + dy, c = s.c + dx;
    if (c < 0 || c >= W || r < -1) return { kind: 'none' };
    const t = cell(s, r, c);
    if (t === T.BED) return { kind: 'bed' };
    const solid = t !== T.AIR && t !== T.LAVA && r >= 0;
    const dur = solid ? digTime(s, r) : moveTime(s);
    return { kind: solid ? 'dig' : 'move', r, c, t, dx, dy, dur, cost: moveCost(s, solid, r) };
  }

  function sell(s) {
    const gain = cargoValue(s);
    const items = s.cargo.slice();
    s.coins += gain; s.total += gain; s.cargo.fill(0);
    return { gain, items };
  }
  function arrive(s, evs) {
    s.energy = tankMax(s.up.tank);
    s.stuck = false;
    const n = cargoCount(s);
    s.trips++;
    const sl = sell(s);
    evs.push({ type: 'surface', gain: sl.gain, items: sl.items, n });
  }

  function collect(s, t, r, c, evs) {
    if (t >= T.ORE && t < T.ORE + NO) {
      const k = t - T.ORE;
      if (cargoCount(s) < bagMax(s.up.bag)) { s.cargo[k]++; evs.push({ type: 'ore', ore: k, r, c }); }
      else evs.push({ type: 'full', ore: k, r, c });
    } else if (t === T.CHEST) {
      const gain = Math.round(40 + (r + 1) * 9 * (0.7 + hash(r, c, 55, s.seed) * 0.8));
      s.coins += gain; s.total += gain; evs.push({ type: 'chest', gain, r, c });
    } else if (t === T.ART) {
      const i = artIndex(s, r, c);
      if (i >= 0 && !s.arts[i]) { s.arts[i] = true; evs.push({ type: 'art', i, r, c }); }
    }
  }

  function finish(s, p, evs) {
    s.energy -= p.cost;
    if (p.kind === 'dig') { s.mined.add(key(p.r, p.c)); collect(s, p.t, p.r, p.c, evs); evs.push({ type: 'dug', r: p.r, c: p.c, t: p.t }); }
    else if (p.t === T.LAVA) {
      s.mined.add(key(p.r, p.c));
      const dmg = (10 + (p.r + 1) * 0.12) * heatMul(s.up.heat);
      s.energy = Math.max(0, s.energy - dmg);
      evs.push({ type: 'lava', dmg, r: p.r, c: p.c });
    }
    s.r = p.r; s.c = p.c; s.lastDir = [p.dx, p.dy];
    if (p.dy || p.dx) evs.push({ type: 'move', r: s.r, c: s.c });
    const d = s.r + 1;
    if (d > s.best) { s.best = d; evs.push({ type: 'best', depth: d }); }
    reveal(s);
    if (s.r < 0) arrive(s, evs);
  }

  function step(s, dt) {
    const evs = [];
    if (s.job && s.dir && (s.dir[0] !== s.job.p.dx || s.dir[1] !== s.job.p.dy)) s.job = null;   // смена направления отменяет начатое
    if (s.job) {
      s.job.t += dt;
      if (s.job.t >= s.job.p.dur) { const p = s.job.p; s.job = null; finish(s, p, evs); }
      return evs;
    }
    if (!s.dir || s.stuck) return evs;
    const p = plan(s, s.dir[0], s.dir[1]);
    if (p.kind === 'none') return evs;
    if (p.kind === 'bed') { if (!s.bedTold) { s.bedTold = true; evs.push({ type: 'bed' }); } return evs; }
    s.bedTold = false;
    if (s.energy < p.cost) { s.stuck = true; evs.push({ type: 'exhausted' }); return evs; }
    s.job = { p, t: 0 };
    s.lastDir = [p.dx, p.dy];
    if (p.kind === 'dig' && cargoCount(s) >= bagMax(s.up.bag) && p.t >= T.ORE && p.t < T.ORE + NO && s.msgFull <= 0) evs.push({ type: 'bagfull' });
    return evs;
  }

  // зависание: ничего не копаем и энергии на шаг не хватает (например, у самой лавы)
  function evacuate(s) {   // бесплатная эвакуация: теряем половину добычи
    for (let i = 0; i < NO; i++) s.cargo[i] = Math.floor(s.cargo[i] / 2);
    s.job = null; s.r = -1; s.dir = null; const evs = []; arrive(s, evs); reveal(s); return evs;
  }
  function rescueFull(s) { s.energy = tankMax(s.up.tank); s.stuck = false; }
  function useScroll(s) {
    if (s.scroll <= 0 || s.r < 0) return null;
    s.scroll--; s.job = null; s.r = -1; s.dir = null; const evs = []; arrive(s, evs); reveal(s); return evs;
  }
  function useDynamite(s) {
    if (s.dyn <= 0 || s.r < 0) return null;
    s.dyn--; const evs = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const r = s.r + dr, c = s.c + dc;
      if (r < 0 || c < 0 || c >= W) continue;
      const t = cell(s, r, c);
      if (t === T.BED || t === T.AIR) continue;
      s.mined.add(key(r, c));
      if (t !== T.LAVA) collect(s, t, r, c, evs);
      evs.push({ type: 'boom', r, c, t });
    }
    reveal(s); return evs;
  }
  function canBuy(s, kind) {
    const l = s.up[kind];
    return l < UP[kind].max && s.coins >= upCost(kind, l);
  }
  function buy(s, kind) {
    if (!UP[kind]) return false;
    const l = s.up[kind];
    if (l >= UP[kind].max) return false;
    const c = upCost(kind, l);
    if (s.coins < c) return false;
    s.coins -= c; s.up[kind]++;
    if (kind === 'tank') s.energy = Math.min(tankMax(s.up.tank), s.energy + (tankMax(s.up.tank) - tankMax(l)));
    reveal(s); return true;
  }
  function buyItem(s, what) {
    const c = what === 'dyn' ? DYN_COST : SCROLL_COST;
    if (s.coins < c) return false;
    s.coins -= c; s[what]++; return true;
  }

  // упаковка множеств в строку
  function packSet(set) {
    const n = W * H, bytes = new Uint8Array(Math.ceil(n / 8));
    set.forEach((k) => { if (k >= 0 && k < n) bytes[k >> 3] |= 1 << (k & 7); });
    let b = ''; for (let i = 0; i < bytes.length; i++) b += String.fromCharCode(bytes[i]);
    return (typeof btoa === 'function' ? btoa(b) : Buffer.from(b, 'binary').toString('base64'));
  }
  function unpackSet(str) {
    const set = new Set();
    try {
      const b = typeof atob === 'function' ? atob(str) : Buffer.from(str, 'base64').toString('binary');
      for (let i = 0; i < b.length; i++) { const v = b.charCodeAt(i); if (v) for (let j = 0; j < 8; j++) if (v & (1 << j)) set.add(i * 8 + j); }
    } catch (e) { /* пусто */ }
    return set;
  }
  function fmt(n) {
    n = Math.floor(n);
    if (n < 1e4) return String(n);
    const u = ['', 'K', 'M', 'B', 'T']; let i = 0, x = n;
    while (x >= 1000 && i < u.length - 1) { x /= 1000; i++; }
    return (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '') + u[i];
  }

  return { W, H, T, ORES, NO, NA, ART_ROWS, ART_BONUS, UP, DYN_COST, SCROLL_COST, hash, gen, cell, create, step, setDir, plan,
    hardness, drillPower, tankMax, bagMax, lampR, heatMul, engineMul, digTime, moveTime, moveCost, cargoCount, cargoValue, artCount, sellMult,
    upCost, canBuy, buy, buyItem, evacuate, rescueFull, useScroll, useDynamite, packSet, unpackSet, fmt, artIndex, reveal, key, sell };
});
