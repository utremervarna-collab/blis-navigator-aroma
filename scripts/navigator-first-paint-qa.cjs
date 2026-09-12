const { chromium } = require('playwright');

const origin = process.env.BLIS_QA_ORIGIN || 'http://127.0.0.1:10000';
const routes = {
  overview: '#overview .ovh-gauge svg',
  social: '#social #digitalBody .dv-radar-wrap .dv-radar-grid',
  market: '#market .pm-stage,#market .pm-canvas',
  competition: '#competition .vs-comp-axis',
  history: '#history .vs-history-board',
  hub: '#hub .n3-resource-card',
  calendar: '#calendar .n3-resource-card'
};

async function instrument(page) {
  await page.addInitScript((selectors) => {
    window.__paintFrames = [];
    function sample() {
      const root = document.documentElement;
      const active = document.querySelector('.page.active');
      const app = document.querySelector('.app');
      const id = active?.id || '';
      const visible = !!(app && active &&
        getComputedStyle(app).visibility !== 'hidden' &&
        getComputedStyle(active).visibility !== 'hidden' &&
        getComputedStyle(app).opacity !== '0' &&
        getComputedStyle(active).opacity !== '0');
      window.__paintFrames.push({
        t: Math.round(performance.now()), id, visible,
        pending: root.classList.contains('blis-route-pending'),
        final: root.dataset.navigatorVersion === '3.0-preserved-visuals-5plus2' &&
          document.querySelectorAll('#nav [data-n3-page]').length === 7 &&
          !!document.querySelector('.bch3-context-title') &&
          !!document.querySelector(selectors[id] || '___missing___')
      });
      if (window.__paintFrames.length > 2000) window.__paintFrames.shift();
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }, routes);
}

async function check(page, client, first, width) {
  const url = `${origin}/dashboard.html?client=${client}&page=${first}`;
  const response = await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30000});
  if (response.status() !== 200) throw new Error(`${url}: HTTP ${response.status()}`);
  await page.waitForFunction(() => document.documentElement.classList.contains('blis-dashboard-ready'), null, {timeout: 25000});
  await page.waitForTimeout(750);
  for (const id of Object.keys(routes)) {
    if (id !== first) {
      await page.locator(`#nav [data-n3-page="${id}"]`).click();
      await page.waitForFunction((wanted) =>
        document.querySelector('.page.active')?.id === wanted &&
        !document.documentElement.classList.contains('blis-route-pending'), id, {timeout: 15000});
      await page.waitForTimeout(750);
    }
    const state = await page.evaluate(() => ({
      client: document.body.dataset.client,
      frames: window.__paintFrames,
      error: document.documentElement.classList.contains('blis-dashboard-error')
    }));
    if (state.client !== client || state.error) throw new Error(`${client}/${id}/${width}: wrong client or loading error`);
    const bad = state.frames.find(frame => frame.visible && (!frame.final || frame.pending));
    if (bad) throw new Error(`${client}/${id}/${width}: intermediate frame ${JSON.stringify(bad)}`);
    if (!state.frames.some(frame => frame.visible && frame.id === id && frame.final))
      throw new Error(`${client}/${id}/${width}: no visible canonical frame`);
  }
  console.log(`FIRST_PAINT_OK ${client} ${first} ${width}`);
}

async function checkSlowBootstrap(browser) {
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  try {
    const page = await context.newPage();
    await instrument(page);
    await page.route('**/navigator-3-architecture-v1.js*', async route => {
      await new Promise(resolve => setTimeout(resolve, 17000));
      await route.continue();
    });
    const started = Date.now();
    // DOMContentLoaded waits for this intentionally delayed blocking script.
    // Observe the page from response commit so the 16-second sample is real.
    await page.goto(`${origin}/dashboard.html?client=aroma&page=overview`, {waitUntil: 'commit', timeout: 30000});
    await page.waitForTimeout(Math.max(0, 16000 - (Date.now() - started)));
    const pending = await page.evaluate(() => ({
      ready: document.documentElement.classList.contains('blis-dashboard-ready'),
      slow: document.documentElement.classList.contains('blis-dashboard-slow'),
      error: document.documentElement.classList.contains('blis-dashboard-error')
    }));
    if (pending.ready || !pending.slow || pending.error)
      throw new Error(`slow bootstrap showed a premature state: ${JSON.stringify(pending)}`);
    await page.waitForFunction(() => document.documentElement.classList.contains('blis-dashboard-ready'), null, {timeout: 60000});
    const state = await page.evaluate(() => ({
      frames: window.__paintFrames,
      slow: document.documentElement.classList.contains('blis-dashboard-slow'),
      active: document.querySelector('.page.active')?.id
    }));
    if (state.slow || state.active !== 'overview' || state.frames.some(frame => frame.visible && !frame.final))
      throw new Error('slow bootstrap did not recover cleanly');
    console.log('SLOW_BOOTSTRAP_OK aroma overview');
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({viewport: {width, height: 900}, deviceScaleFactor: 1});
      for (const [client, first] of [['aroma', 'overview'], ['mollox', 'social']]) {
        const page = await context.newPage();
        await instrument(page);
        await check(page, client, first, width);
        await page.close();
      }
      await context.close();
    }
    await checkSlowBootstrap(browser);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
