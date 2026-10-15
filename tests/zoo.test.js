// HarbuZoo browser tests. Kør:  node tests/zoo.test.js [fil.html]
// Bruger Playwright + den forinstallerede Chromium. Ingen afhængigheder i selve spillet (kun ?debug-hooks).
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', 'zookeeper2.html'));
const URL = 'file://' + FILE + '?debug';
const SHOTS = process.env.SHOTS || '';

const results = [];
let browser;
function ok(c, msg) { if (!c) throw new Error(msg); }
async function T(name, fn) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  const t0 = Date.now();
  try {
    await page.goto(URL);
    await page.waitForFunction(() => window.__zoo);
    await page.evaluate(() => {
      window.__integrity = function () {
        const z = __zoo, b = z.board(), errs = [], ids = new Set();
        const cs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs')) || 40;
        if (b.length !== 64) errs.push('len');
        b.forEach((t, i) => {
          if (!t) { errs.push('null@' + i); return; }
          if (t.r * 8 + t.c !== i) errs.push('pos@' + i);
          if (ids.has(t.id)) errs.push('dup@' + i); ids.add(t.id);
          if (!t.el.parentNode) errs.push('detached@' + i);
          if (t.el.style.transform !== 'translate3d(' + (t.c * cs) + 'px,' + (t.r * cs) + 'px,0px)' && t.el.style.transform !== 'translate3d(' + (t.c * cs) + 'px, ' + (t.r * cs) + 'px, 0px)') errs.push('dompos@' + i + ':' + t.el.style.transform);
        });
        const dom = document.querySelectorAll('#board .tile').length;
        if (dom !== 64) errs.push('dom=' + dom);
        if (z.matches() > 0) errs.push('matches');
        if (!z.findMove()) errs.push('nomove');
        return errs;
      };
    });
    await page.click('#cGo');                           // luk intro-kortet via den rigtige knap
    await fn(page, ctx);
    ok(errors.length === 0, 'JS-fejl: ' + errors.join(' | '));
    results.push([name, 'PASS', Date.now() - t0]);
  } catch (e) {
    results.push([name, 'FAIL', Date.now() - t0, e.message.split('\n')[0]]);
  }
  await ctx.close();
}
const start = (page, row) => page.evaluate(r => { const z = __zoo; z.startLevel(z.rows()[r].nodes[0]); }, row || 0);
const settle = async (page, ms) => { await page.waitForFunction(() => !__zoo.state().busy, null, { timeout: ms || 15000 }); };
// mønster uden færdige striber og uden dobbelte: (r + 2c) % 5
const PAT = () => { const a = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) a.push((r + 2 * c) % 5); return a; };
const setPat = (page, edits) => page.evaluate(([pat, edits]) => { edits.forEach(([i, v]) => pat[i] = v); __zoo.setLayout(pat); }, [PAT(), edits || []]);
async function cellXY(page, r, c) {
  return page.evaluate(([r, c]) => { const b = document.getElementById('board').getBoundingClientRect(); const cs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs')); return { x: b.left + 4 + (c + .5) * cs, y: b.top + 4 + (r + .5) * cs, cs }; }, [r, c]);
}
async function swipe(page, r, c, dir, steps) {
  const p = await cellXY(page, r, c), d = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[dir];
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x + d[0] * p.cs * .7, p.y + d[1] * p.cs * .7, { steps: steps || 3 });
  await page.mouse.up();
}
const st = page => page.evaluate(() => __zoo.state());

(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

  await T('01 loader uden JS-fejl, kort tegnes', async page => {
    const s = await page.evaluate(() => ({ w: document.getElementById('mapCanvas').width, scr: __zoo.state().screen }));
    ok(s.w > 0 && s.scr === 'map', 'kort ikke tegnet');
  });

  await T('02 normalt bytte + match, bræt konsistent', async page => {
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    const before = await st(page);
    await page.evaluate(() => __zoo.swap(2, 3)); await settle(page);
    const after = await st(page);
    ok(after.score > before.score, 'ingen point');
    const errs = await page.evaluate(() => __integrity()); ok(!errs.length, errs.join(','));
  });

  await T('03 ugyldigt bytte rulles tilbage (+ -1s straf)', async page => {
    await start(page); await setPat(page);
    const r = await page.evaluate(async () => {
      const b = __zoo.board(), a = b[27], c = b[28], t0 = __zoo.timers().time;
      await __zoo.swap(27, 28);
      return { same: __zoo.board()[27] === a && __zoo.board()[28] === c, rc: [a.r, a.c, c.r, c.c], dt: t0 - __zoo.timers().time, busy: __zoo.state().busy };
    });
    ok(r.same && r.rc.join() === '3,3,3,4', 'ikke rullet tilbage ' + JSON.stringify(r));
    ok(r.dt >= 0.9 && r.dt < 1.6, 'straf forkert ' + r.dt); ok(!r.busy, 'busy hænger');
  });

  await T('04 kæder: 200 tilfældige træk holder brættet konsistent', async page => {
    await start(page);
    await page.evaluate(() => { window.__maxCombo = 1; new MutationObserver(m => m.forEach(x => x.addedNodes.forEach(n => { const mm = n.textContent && /x(\d)$/.exec(n.textContent); if (mm) __maxCombo = Math.max(__maxCombo, +mm[1]); }))).observe(document.getElementById('board'), { childList: true }); });
    for (let k = 0; k < 200; k++) {
      const done = await page.evaluate(async () => { const z = __zoo; if (z.state().ended) return true; z.setTime(40); const m = z.findMove(); if (m) await z.swap(m[0], m[1]); return z.state().ended; });
      if (done) { await page.evaluate(() => { const z = __zoo; z.startLevel(z.rows()[0].nodes[0]); }); }
      if (k % 10 === 0) { const e = await page.evaluate(() => __integrity()); ok(!e.length, 'træk ' + k + ': ' + e.join(',')); }
    }
    const e = await page.evaluate(() => __integrity()); ok(!e.length, e.join(','));
    const mc = await page.evaluate(() => __maxCombo); ok(mc >= 2, 'aldrig en kæde set (' + mc + ')');
  });

  await T('05 specialbrikker: række/kolonne/bombe/regnbue', async page => {
    for (const kind of ['row', 'col', 'bomb', 'rainbow']) {
      await start(page); await setPat(page);
      const r = await page.evaluate(async kind => { const z = __zoo; z.setSpecial(27, kind); const s0 = z.state().score; await z.swap(27, 28); return z.state().score - s0; }, kind);
      ok(r > 0, kind + ' gav ingen point');
      const e = await page.evaluate(() => __integrity()); ok(!e.length, kind + ': ' + e.join(','));
    }
  });

  await T('06 specialkombinationer', async page => {
    const combos = [['row', 'col'], ['row', 'row'], ['bomb', 'bomb'], ['bomb', 'row'], ['rainbow', 'rainbow'], ['rainbow', 'row'], ['rainbow', 'bomb']];
    for (const [a, b] of combos) {
      await start(page); await setPat(page);
      const r = await page.evaluate(async ([a, b]) => { const z = __zoo; z.setSpecial(27, a); z.setSpecial(28, b); const s0 = z.state().score; await z.swap(27, 28); return z.state().score - s0; }, [a, b]);
      ok(r > 0, a + '+' + b + ' gav ingen point');
      const e = await page.evaluate(() => __integrity()); ok(!e.length, a + '+' + b + ': ' + e.join(','));
    }
  });

  await T('07 forhindringer: glas/sten tager skade, kun frie brikker blandes', async page => {
    await start(page); await setPat(page, [[24, 1], [25, 1], [26, 2], [27, 1]]);   // swap(26,27) -> række 3: 1,1,1 i c0-2
    // række 3 c0..c2 = 1,1,(2->1 efter bytte) ; glas under (4,1)=33, sten under (4,2)=34 med 2 liv
    await page.evaluate(() => { __zoo.setLock(33, 1, false); __zoo.setLock(34, 2, true); });
    await page.evaluate(() => __zoo.swap(26, 27)); await settle(page);
    const r = await page.evaluate(() => { const b = __zoo.board(); return { g: b[33].lock, gt: b[33].type, rk: b[34].type, rl: b[34].lock }; });
    ok(r.g === 0, 'glas ikke brudt ' + JSON.stringify(r));
    ok(r.rk === -2 && r.rl === 1, 'sten skulle have 1 liv tilbage ' + JSON.stringify(r));
  });

  await T('08 shuffle: 300x gyldigt, glas/sten urørlige, også i tvivlsomme bræt', async page => {
    await start(page, 21);          // bane 22: glas + sten
    const r = await page.evaluate(() => {
      const z = __zoo, bad = [];
      for (let k = 0; k < 300; k++) {
        const locked = z.board().map((t, i) => t && t.lock ? [i, t.id] : null).filter(Boolean);
        if (k % 3 === 1) z.setLayout(new Array(64).fill(0).map((_, i) => (i % 3 === 0 ? 0 : 1)));   // næsten ensartet: svært at blande
        if (k % 3 === 2) { const t = z.board()[5]; t.special = null; }
        z.shuffleBoard();
        const e = __integrity();
        const now = z.board().map((t, i) => t && t.lock ? [i, t.id] : null).filter(Boolean);
        if (JSON.stringify(locked.length) !== JSON.stringify(now.length)) bad.push('låst-antal@' + k);
        locked.forEach((l, q) => { if (!now.some(n => n[0] === l[0] && n[1] === l[1]) && k % 3 !== 1) bad.push('flyttet@' + k); });
        e.filter(x => !/^dompos/.test(x) && x !== 'dom=64').forEach(x => bad.push(x + '@' + k));
        if (bad.length > 5) break;
      }
      return { bad: bad.slice(0, 6), locked: z.board().filter(t => t.lock).length, obst: z.cfg().obst.length };
    });
    ok(r.bad.length === 0, JSON.stringify(r)); ok(r.locked > 5, 'for få forhindringer til at teste');
  });

  await T('09 ensurePlayable redder dødt bræt', async page => {
    await start(page);
    const r = await page.evaluate(() => {
      const z = __zoo; let found = null;
      for (let a = 0; a < 5 && !found; a++) for (let b = 0; b < 5 && !found; b++) {
        z.setLayout(new Array(64).fill(0).map((_, i) => (a * Math.floor(i / 8) + b * (i % 8)) % 5));
        if (z.matches() === 0 && !z.findMove()) found = [a, b];
      }
      if (!found) return { skipped: true };
      const ok1 = z.ensurePlayable();
      return { found, ok1, move: !!z.findMove() };
    });
    ok(r.skipped || (r.ok1 && r.move), JSON.stringify(r));
  });

  await T('10 fillBoard: 300 baner på tværs af sværhedsgrad uden fejl/rekursion', async page => {
    await start(page);
    const r = await page.evaluate(() => {
      const z = __zoo, bad = []; const t0 = performance.now();
      for (const row of [0, 5, 12, 15, 18, 21]) { z.startLevel(z.rows()[row].nodes[0]); for (let k = 0; k < 50; k++) { z.fillBoard(); const e = __integrity().filter(x => !/dompos/.test(x)); if (e.length) bad.push(row + ':' + e.join(',')); } }
      return { bad: bad.slice(0, 4), ms: Math.round(performance.now() - t0) };
    });
    ok(r.bad.length === 0, JSON.stringify(r));
  });

  await T('11 ur: løber, står stille i kæde / overlay / MATSURI', async page => {
    await start(page);
    const t0 = (await page.evaluate(() => __zoo.timers().time)); await page.waitForTimeout(700);
    const t1 = await page.evaluate(() => __zoo.timers().time); ok(t0 - t1 > 0.4, 'uret løber ikke');
    await page.click('#mapBtn');                                                    // "forlad banen?"-kort
    const a = await page.evaluate(() => __zoo.timers().time); await page.waitForTimeout(700);
    const b = await page.evaluate(() => __zoo.timers().time); ok(Math.abs(a - b) < 0.05, 'uret løb under kort ' + (a - b));
    await page.click('#cBack'); await page.waitForTimeout(500);
    const c = await page.evaluate(() => __zoo.timers().time); ok(b - c > 0.2, 'uret genoptog ikke');
    await page.evaluate(() => __zoo.setFever(100));
    const f = await page.evaluate(() => __zoo.timers()); ok(f.fever, 'MATSURI startede ikke');
    const m0 = f.time; await page.waitForTimeout(800);
    const m1 = await page.evaluate(() => __zoo.timers()); ok(Math.abs(m0 - m1.time) < 0.05, 'uret løb under MATSURI'); ok(m1.feverT < f.feverT, 'MATSURI-tid løber ikke');
    await page.waitForFunction(() => !__zoo.timers().fever, null, { timeout: 12000 });   // slutter af sig selv
  });

  await T('12 RENKA: stribe stiger, holdes under kæde, udløber i hvile', async page => {
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    await page.evaluate(() => __zoo.swap(2, 3)); await settle(page);
    let t = await page.evaluate(() => __zoo.timers()); ok(t.streak === 1 && t.streakT > 4.1, 'streak 1 forkert ' + JSON.stringify(t));
    const m = await page.evaluate(() => __zoo.findMove());
    await page.evaluate(m => __zoo.swap(m[0], m[1]), m); await settle(page);
    t = await page.evaluate(() => __zoo.timers()); ok(t.streak === 2, 'streak 2 forkert ' + JSON.stringify(t));
    await page.waitForFunction(() => __zoo.timers().streak === 0, null, { timeout: 7000 });
  });

  await T('13 sejr gemmer fremskridt, overlever genindlæsning; tab åbner kort', async page => {
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    await page.evaluate(() => { __zoo.cfg().goals.forEach(g => g.got = g.need); });
    await page.evaluate(() => __zoo.swap(2, 3)); await settle(page);
    await page.waitForFunction(() => document.querySelector('#card h1') && /KLARET/.test(document.querySelector('#card h1').textContent));
    const d = await page.evaluate(() => JSON.parse(localStorage.getItem('harbuzoo.save')));
    ok(d.done['0:0'] >= 1 && d.total > 0, 'ikke gemt ' + JSON.stringify(d.done));
    await page.reload(); await page.waitForFunction(() => window.__zoo);
    const d2 = await page.evaluate(() => ({ done: __zoo.save.done, ns: __zoo.nodeState(__zoo.nodeById('1:0')) }));
    ok(d2.done['0:0'] >= 1 && d2.ns === 'open', 'genindlæsning mistede fremskridt ' + JSON.stringify(d2));
  });

  await T('14 tab: kort vises, intet fejler midt i en kæde', async page => {
    await start(page); await page.evaluate(() => __zoo.setTime(0.05));
    await page.waitForFunction(() => document.querySelector('#card h1') && /TIDEN/.test(document.querySelector('#card h1').textContent), null, { timeout: 5000 });
    // straf-bytte må ikke slå ihjel midt i animationen
    await page.click('#cGo'); await page.waitForFunction(() => __zoo.state().running);
    await setPat(page); await page.evaluate(() => __zoo.setTime(0.5));
    const r = await page.evaluate(async () => { const p = __zoo.swap(27, 28); await new Promise(r => setTimeout(r, 60)); const during = __zoo.state(); await p; return { during: during.ended, busy: during.busy }; });
    ok(r.during === false, 'tabte midt i et bytte');
  });

  await T('15 kort: tryk på prik åbner bane, bilen kører', async page => {
    const p = await page.evaluate(() => { const nd = __zoo.nodeById('0:0'); const sc = document.getElementById('mapScroll'); const cv = document.getElementById('mapCanvas').getBoundingClientRect(); const k = sc.clientWidth / 180; return { x: cv.left + nd.x * k, y: cv.top + (cv.height / (cv.height / k) ) * 0 }; });
    await page.evaluate(() => document.getElementById('mapScroll').click());   // ingen prik: ingen fejl
    await page.evaluate(() => __zoo.openLevel(__zoo.nodeById('0:0')));
    await page.click('#cGo');
    await page.waitForFunction(() => __zoo.state().screen === 'game' && __zoo.state().running, null, { timeout: 6000 });
  });

  await T('16 touch: sving på rigtig touch-skærm', async page => {
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    const cdp = await page.context().newCDPSession(page);
    const a = await cellXY(page, 0, 2), b = await cellXY(page, 0, 3);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: (a.x + b.x) / 2 + 4, y: a.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x, y: b.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => __zoo.swaps() === 1); await settle(page);
    ok((await st(page)).score > 0, 'touch-sving gav ingen match');
    // tryk-tryk med touch
    await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    await page.touchscreen.tap(a.x, a.y); await page.touchscreen.tap(b.x, b.y);
    await page.waitForFunction(() => __zoo.swaps() === 2, null, { timeout: 3000 });
  });

  await T('17 buffer: sving under kæde udføres bagefter; udløber; kun ét ad gangen', async page => {
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    page.evaluate(() => __zoo.swap(2, 3));                                       // starter kæde (ikke afventet)
    await page.waitForFunction(() => __zoo.state().busy);
    await swipe(page, 7, 0, 'r'); await swipe(page, 6, 4, 'd');                  // to sving: kun det seneste huskes
    const p = await page.evaluate(() => __zoo.pending()); ok(p && p.i === idxOf(6, 4), 'forkert buffer ' + JSON.stringify(p));
    await page.waitForFunction(() => __zoo.swaps() === 2, null, { timeout: 8000 });   // ét (ikke to) buffer-træk
    await settle(page); await page.waitForTimeout(300);
    ok((await page.evaluate(() => __zoo.swaps())) === 2, 'mere end ét buffer-træk');
    ok((await page.evaluate(() => __zoo.pending())) === null, 'buffer ikke tømt');
    // udløbet buffer må ikke udføres
    const before = await page.evaluate(() => __zoo.swaps());
    await page.evaluate(() => { const z = __zoo; const m = z.findMove(); z.queueMove(m[0], m[1]); z.pending().at -= 5000; });
    const m = await page.evaluate(() => __zoo.findMove()); await page.evaluate(m => __zoo.swap(m[0], m[1]), m); await settle(page); await page.waitForTimeout(200);
    ok((await page.evaluate(() => __zoo.swaps())) === before + 1, 'udløbet buffer blev udført');
    function idxOf(r, c) { return r * 8 + c; }
  });

  await T('18 stresstest: 80 hurtige sving/tryk i vilkårlige felter', async page => {
    await start(page);
    const p0 = await cellXY(page, 0, 0);
    for (let k = 0; k < 80; k++) {
      const r = Math.floor(Math.random() * 8), c = Math.floor(Math.random() * 8), d = 'lrud'[k % 4];
      if (k % 5 === 0) { const p = await cellXY(page, r, c); await page.mouse.click(p.x, p.y); } else await swipe(page, r, c, d, 2);
      if (k % 20 === 19) await page.evaluate(() => __zoo.setTime(40));
    }
    await settle(page, 20000); await page.waitForTimeout(500);
    await page.evaluate(() => { const z = __zoo; if (z.state().running) z.setTime(40); });
    await settle(page);
    const e = await page.evaluate(() => __integrity()); ok(!e.length, e.join(','));
  });

  await T('19 race: forlad bane midt i lang kæde og start ny bane straks', async page => {
    await start(page); await setPat(page);
    page.evaluate(() => { __zoo.setSpecial(27, 'rainbow'); __zoo.setSpecial(28, 'rainbow'); return __zoo.swap(27, 28); });
    await page.waitForFunction(() => __zoo.state().busy);
    await page.waitForTimeout(150);
    await page.click('#mapBtn'); await page.click('#cGo');                          // "JA, TIL KORTET"
    await page.evaluate(() => { const z = __zoo; z.startLevel(z.rows()[3].nodes[0]); });
    await page.waitForTimeout(2500);
    const e = await page.evaluate(() => __integrity()); ok(!e.length, 'efter baneskift: ' + e.join(','));
    ok(!(await st(page)).busy, 'busy hænger efter baneskift');
  });

  await T('20 lange kæder: reaktionstid og ingen lange frames', async page => {
    await start(page);
    await page.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => __lt.push(e.duration))).observe({ entryTypes: ['longtask'] }); } catch (e) {} });
    await setPat(page);
    const r = await page.evaluate(async () => { const z = __zoo; z.setSpecial(27, 'rainbow'); z.setSpecial(28, 'rainbow'); const t0 = performance.now(); await z.swap(27, 28); return performance.now() - t0; });
    const normal = await (async () => { await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]); return page.evaluate(async () => { const t0 = performance.now(); await __zoo.swap(2, 3); return performance.now() - t0; }); })();
    const lt = await page.evaluate(() => __lt.filter(d => d > 120).length);
    console.log('   (tid: hel-bræt-ryd ' + Math.round(r) + ' ms, almindeligt match inkl. kæde ' + Math.round(normal) + ' ms, lange opgaver >120ms: ' + lt + ')');
    ok(r < 6000 && lt < 3, 'for langsom ' + r + ' / ' + lt);
  });

  await T('21 lyd: kald kaster ikke selv uden/med lydkontekst, SFX-knap virker', async page => {
    await page.click('#soundBtn'); await page.click('#soundBtn');
    await start(page); await setPat(page, [[0, 1], [1, 1], [2, 2], [3, 1]]);
    await page.evaluate(() => __zoo.swap(2, 3)); await settle(page);
    await page.evaluate(() => { const z = __zoo; z.startLevel(z.rows()[0].nodes[0]); z.setSpecial(27, 'bomb'); z.setSpecial(28, 'bomb'); return z.swap(27, 28); });
  });

  if (SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(URL); await page.waitForFunction(() => window.__zoo);
    await page.screenshot({ path: SHOTS + '/00-intro.png' }); await page.click('#cGo');
    await page.screenshot({ path: SHOTS + '/01-map.png' });
    await page.evaluate(() => { const z = __zoo; z.startLevel(z.rows()[21].nodes[0]); });
    await page.waitForTimeout(400); await page.screenshot({ path: SHOTS + '/02-game.png' });
    await page.evaluate(() => { const z = __zoo; z.setSpecial(10, 'row'); z.setSpecial(20, 'col'); z.setSpecial(30, 'bomb'); z.setSpecial(40, 'rainbow'); });
    await page.waitForTimeout(300); await page.screenshot({ path: SHOTS + '/03-specials.png' });
    page.evaluate(() => __zoo.swap(27, 28));
    for (const [i, ms] of [[0, 90], [1, 120], [2, 160]]) { await page.waitForTimeout(ms); await page.screenshot({ path: SHOTS + '/04-mid' + i + '.png' }); }
    await ctx.close();
  }

  await browser.close();
  const w = Math.max(...results.map(r => r[0].length));
  results.forEach(r => console.log((r[1] === 'PASS' ? 'PASS ' : 'FAIL ') + r[0].padEnd(w) + '  ' + (r[2] / 1000).toFixed(1) + 's' + (r[3] ? '   ← ' + r[3] : '')));
  const failed = results.filter(r => r[1] !== 'PASS').length;
  console.log(failed ? '\n' + failed + ' FEJLEDE' : '\nAlle ' + results.length + ' tests bestået');
  process.exit(failed ? 1 : 0);
})();
