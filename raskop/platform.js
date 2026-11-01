/* Переходник площадок: даёт игре объект YaGames (та часть API Яндекс Игр, которой пользуются наши игры)
   поверх VK Bridge (ВКонтакте) или FAPI (Одноклассники). Код игр при этом не меняется.
   Площадка определяется по параметрам запуска в адресе. Без них YaGames не создаётся — игра идёт в демо-режиме. */
(function () {
  'use strict';

  const q = new URLSearchParams(location.search);
  const platform = q.has('vk_app_id') ? 'vk'
    : (q.has('api_server') && q.has('apiconnection')) ? 'ok'
    : '';
  window.GAME_PLATFORM = platform;
  if (!platform) return;

  const VK_BRIDGE_SRC = 'vk-bridge.js';
  const OK_FAPI_SRC = 'https://api.ok.ru/js/fapi5.js';
  const AD_TIMEOUT = 90000;   // страховка: если площадка не ответила, через 1,5 мин считаем рекламу закрытой
  const CHUNK = 1000;         // VK Storage: значение до 4096 байт, режем JSON на куски по 1000 символов

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Не загрузился ' + src));
      document.head.appendChild(s);
    });
  }

  /* ---------- отладка: ?ad_debug=1 выводит запросы к площадке прямо на экран ---------- */
  const DEBUG = q.get('ad_debug') === '1';
  let debugBox = null;
  function debug(text) {
    if (!DEBUG) return;
    if (!debugBox) {
      debugBox = document.createElement('pre');
      debugBox.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:99999;max-width:96vw;max-height:40vh;overflow:auto;'
        + 'margin:0;padding:6px;font:11px/1.3 monospace;color:#0f0;background:rgba(0,0,0,.8);white-space:pre-wrap;pointer-events:none;';
      (document.body || document.documentElement).appendChild(debugBox);
    }
    const t = new Date().toTimeString().slice(0, 8);
    debugBox.textContent = (debugBox.textContent + t + ' ' + text + '\n').split('\n').slice(-15).join('\n');
  }
  const short = (v) => { try { return JSON.stringify(v).slice(0, 200); } catch (e) { return String(v); } };

  /* ---------- события паузы ---------- */
  const listeners = {};
  function on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); }
  function emit(name) { (listeners[name] || []).forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); }

  /* ---------- реклама: общий порядок колбэков как в Яндексе ---------- */
  // show() возвращает Promise: 'rewarded' | 'closed' | 'error'.
  function runAd(show, callbacks, isReward) {
    const cb = callbacks || {};
    let finished = false;
    const finish = (outcome) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (outcome === 'error') { if (cb.onError) cb.onError(); return; }
      if (outcome === 'rewarded' && isReward && cb.onRewarded) cb.onRewarded();
      if (cb.onClose) cb.onClose(outcome === 'rewarded' || !isReward);
    };
    const timer = setTimeout(() => finish('closed'), AD_TIMEOUT);
    if (cb.onOpen) cb.onOpen();
    Promise.resolve().then(show).then(finish, () => finish('error'));
  }

  function baseSdk(lang) {
    return {
      environment: { i18n: { lang: lang || '' } },
      features: {
        LoadingAPI: { ready() {} },
        GameplayAPI: { start() {}, stop() {} },
      },
      on,
    };
  }

  /* ---------- ВКонтакте ---------- */
  async function initVk() {
    if (!window.vkBridge) await loadScript(VK_BRIDGE_SRC);
    const vk = window.vkBridge;
    // Все вызовы, кроме хранилища, в режиме отладки пишутся на экран вместе с ответом VK
    const bridge = {
      send(method, params) {
        const logged = method !== 'VKWebAppStorageGet' && method !== 'VKWebAppStorageSet';
        if (logged) debug('→ ' + method + ' ' + short(params || {}));
        return vk.send(method, params).then(
          (r) => { if (logged) debug('← ' + method + ' ' + short(r)); return r; },
          (e) => { debug('✕ ' + method + ' ' + short(e)); throw e; });
      },
      subscribe: (fn) => vk.subscribe(fn),
    };
    await bridge.send('VKWebAppInit');
    debug('платформа ' + (q.get('vk_platform') || '?') + ', клиент ' + (q.get('vk_client') || 'vk'));

    vk.subscribe((e) => {
      const type = e && e.detail && e.detail.type;
      if (type === 'VKWebAppViewHide') emit('game_api_pause');
      if (type === 'VKWebAppViewRestore') emit('game_api_resume');
    });

    // VK советует подгружать рекламу заранее и повторять проверку по таймеру,
    // пока материалы не придут: загрузка может сорваться из-за сети
    const ready = { reward: false, interstitial: false };
    const preload = (format) => bridge.send('VKWebAppCheckNativeAds', { ad_format: format })
      .then((r) => { ready[format] = !!(r && r.result); }, () => { ready[format] = false; });
    preload('reward');
    preload('interstitial');
    setInterval(() => {
      if (!ready.reward) preload('reward');
      if (!ready.interstitial) preload('interstitial');
    }, 30000);

    const showAd = (format) => bridge.send('VKWebAppShowNativeAds', { ad_format: format })
      .then((r) => {
        ready[format] = false;
        preload(format);
        if (!r || !r.result) return 'error';
        return format === 'reward' ? 'rewarded' : 'closed';
      }, (e) => { ready[format] = false; preload(format); throw e; });

    const storageGet = (keys) => bridge.send('VKWebAppStorageGet', { keys })
      .then((r) => {
        const out = {};
        ((r && r.keys) || []).forEach((k) => { out[k.key] = k.value; });
        return out;
      });
    const storageSet = (key, value) => bridge.send('VKWebAppStorageSet', { key, value });

    const player = {
      getMode: () => 'full',
      isAuthorized: () => true,
      getUniqueID: () => q.get('vk_user_id') || '',
      getName: () => '',
      // Ключ k хранится кусками: k_n — число кусков, k_0, k_1… — сами куски JSON
      async getData(keys) {
        const names = keys || [];
        const counts = await storageGet(names.map((k) => k + '_n'));
        const parts = [];
        names.forEach((k) => {
          const n = parseInt(counts[k + '_n'], 10) || 0;
          for (let i = 0; i < n; i++) parts.push(k + '_' + i);
        });
        const chunks = parts.length ? await storageGet(parts) : {};
        const out = {};
        names.forEach((k) => {
          const n = parseInt(counts[k + '_n'], 10) || 0;
          if (!n) return;
          let s = '';
          for (let i = 0; i < n; i++) s += chunks[k + '_' + i] || '';
          try { out[k] = JSON.parse(s); } catch (e) { /* повреждённые данные — пропускаем */ }
        });
        return out;
      },
      async setData(data) {
        for (const k of Object.keys(data || {})) {
          const s = JSON.stringify(data[k]);
          const n = Math.max(1, Math.ceil(s.length / CHUNK));
          for (let i = 0; i < n; i++) await storageSet(k + '_' + i, s.slice(i * CHUNK, (i + 1) * CHUNK));
          await storageSet(k + '_n', String(n));   // счётчик пишем последним, чтобы не читать недописанное
        }
        return true;
      },
    };

    const sdk = baseSdk(q.get('vk_language'));
    sdk.adv = {
      showFullscreenAdv: ({ callbacks } = {}) => runAd(() => showAd('interstitial'), callbacks, false),
      showRewardedVideo: ({ callbacks } = {}) => runAd(() => showAd('reward'), callbacks, true),
    };
    sdk.getPlayer = async () => player;
    return sdk;
  }

  /* ---------- Одноклассники ---------- */
  async function initOk() {
    if (!window.FAPI) await loadScript(OK_FAPI_SRC);
    await new Promise((resolve, reject) => {
      const p = window.FAPI.Util.getRequestParameters();
      window.FAPI.init(p.api_server, p.apiconnection, resolve, reject);
    });

    // FAPI отвечает в глобальную функцию API_callback(method, result, data)
    const waiting = {};
    window.API_callback = (method, result, data) => {
      const fn = waiting[method];
      if (fn) fn(result, data);
    };
    const call = (method, run, decide) => new Promise((resolve) => {
      waiting[method] = (result, data) => {
        const v = decide(result, data);
        if (v === undefined) return;   // промежуточный ответ, ждём дальше
        delete waiting[method];
        resolve(v);
      };
      try { run(); } catch (e) { delete waiting[method]; resolve('error'); }
    });

    let rewardReady = false;
    const preload = () => call('loadAd', () => window.FAPI.UI.loadAd(),
      (result) => { rewardReady = result === 'ok'; return rewardReady; });
    preload();

    const showInterstitial = () => call('showAd', () => window.FAPI.UI.showAd(), (result, data) => {
      if (result !== 'ok') return 'error';
      return data === 'ad_shown' ? 'closed' : undefined;   // 'ready' / 'ad_prepared' — ещё показывается
    });
    const showReward = async () => {
      if (!rewardReady && !(await preload())) return 'error';
      rewardReady = false;
      const r = await call('showLoadedAd', () => window.FAPI.UI.showLoadedAd(), (result, data) => {
        if (result === 'ok') return 'rewarded';
        return data === 'skip' ? 'closed' : 'error';   // пропустил — без награды, но и без «реклама недоступна»
      });
      preload();
      return r;
    };

    const sdk = baseSdk('');
    sdk.adv = {
      showFullscreenAdv: ({ callbacks } = {}) => runAd(showInterstitial, callbacks, false),
      showRewardedVideo: ({ callbacks } = {}) => runAd(showReward, callbacks, true),
    };
    // Облачных сохранений на OK нет: getPlayer отказывает, игра хранит прогресс в localStorage
    sdk.getPlayer = () => Promise.reject(new Error('no cloud saves on OK'));
    return sdk;
  }

  // Если площадка молчит, игра не должна висеть на загрузке: через 8 с уходит в демо-режим
  const INIT_TIMEOUT = 8000;
  window.YaGames = {
    init: () => Promise.race([
      (platform === 'vk' ? initVk : initOk)(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('platform init timeout')), INIT_TIMEOUT)),
    ]),
  };
})();
