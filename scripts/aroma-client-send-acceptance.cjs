const { chromium } = require('playwright');

const origin = process.env.BLIS_QA_ORIGIN || 'http://127.0.0.1:10000';
const competitors = ['Alteya Organics', 'Biofresh', 'Agiva'];
const fail = message => { throw new Error(message); };

(async () => {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, serviceWorkers: 'block'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error' && !/favicon|Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(m.text()))
      errors.push(`CONSOLE ${m.text()}`);
  });

  try {
    const response = await page.goto(`${origin}/dashboard.html?client=aroma&page=overview`, {waitUntil: 'domcontentloaded', timeout: 30000});
    if (!response || response.status() !== 200) fail(`Aroma overview HTTP ${response?.status()}`);
    await page.waitForFunction(() => document.documentElement.classList.contains('blis-dashboard-ready') && document.body.dataset.client === 'aroma', null, {timeout: 45000});
    await page.waitForFunction(() => document.body.dataset.aromaEmptyMeasurements === 'clean', null, {timeout: 15000});
    await page.waitForTimeout(800);

    const overview = await page.evaluate(() => {
      const root = document.getElementById('overview');
      const text = (root?.innerText || '').replace(/\s+/g, ' ').trim();
      const rows = [...(root?.querySelectorAll('.aroma-measured-panel .amp-item') || [])].map(x => x.innerText.replace(/\s+/g, ' ').trim());
      return {
        text,
        rows,
        clean: document.body.dataset.aromaEmptyMeasurements,
        sentinel: /__BLIS_EMPTY__|__EMPTY__/i.test(text),
        technical: /Post\s*\d+\s*(Published|Url|Text|Link|Title)/i.test(text)
      };
    });
    if (overview.clean !== 'clean' || overview.sentinel || overview.technical)
      fail(`Aroma overview technical placeholders remain: ${JSON.stringify(overview)}`);
    console.log('AROMA_OVERVIEW_PLACEHOLDER_CLEAN_OK');

    const dossierData = await page.evaluate(expected => {
      const db = window.BLISCompetitorDossiersV2;
      const profiles = Array.isArray(db?.profiles) ? db.profiles : [];
      return expected.map(name => {
        const p = profiles.find(x => String(x?.name || '').toLowerCase() === name.toLowerCase() && Array.isArray(x?.clients) && x.clients.includes('aroma'));
        return p ? {name: p.name, official: p.official, facts: p.facts?.length || 0, sources: p.sources?.length || 0, verifiedAt: p.verifiedAt} : null;
      });
    }, competitors);
    if (dossierData.some(x => !x || !/^https?:\/\//i.test(x.official || '') || x.facts < 3 || x.sources < 2 || x.verifiedAt !== '14.09.2026'))
      fail(`Aroma dossier data incomplete: ${JSON.stringify(dossierData)}`);
    console.log('AROMA_DOSSIER_DATA_OK', JSON.stringify(dossierData));

    await page.locator('#nav [data-n3-page="competition"]').click();
    await page.waitForFunction(() => document.querySelector('.page.active')?.id === 'competition' && !document.documentElement.classList.contains('blis-route-pending'), null, {timeout: 20000});
    await page.waitForFunction(() => document.documentElement.dataset.aromaCompetitorDossiers === 'verified-v3' && window.BLISCompetitorDossierV2 && document.querySelectorAll('#competition [data-n3c2-open]').length >= 3, null, {timeout: 12000});

    for (const name of competitors) {
      const found = await page.evaluate(wanted => [...document.querySelectorAll('#competition [data-n3c2-open]')].some(b => b.dataset.n3c2Open === wanted), name);
      if (!found) fail(`Missing dossier button for ${name}`);
      await page.evaluate(wanted => [...document.querySelectorAll('#competition [data-n3c2-open]')].find(b => b.dataset.n3c2Open === wanted)?.click(), name);
      await page.waitForFunction(wanted => document.getElementById('n3c2Drawer')?.classList.contains('open') && document.querySelector('[data-n3c2-title]')?.textContent.trim() === wanted, name, {timeout: 8000});
      const drawer = await page.evaluate(() => ({
        title: document.querySelector('[data-n3c2-title]')?.textContent.trim(),
        text: document.querySelector('[data-n3c2-body]')?.innerText.replace(/\s+/g, ' ').trim() || '',
        sources: [...document.querySelectorAll('#n3c2Drawer .n3c2-source')].map(a => a.href),
        official: document.querySelector('#n3c2Drawer .n3c2-link')?.href || '',
        verified: document.querySelector('#n3c2Drawer .n3c2-verified')?.textContent.trim() || ''
      }));
      if (drawer.title !== name || !drawer.text.includes('Проверим публичен профил') || drawer.sources.length < 2 || !drawer.sources.every(u => /^https?:\/\//i.test(u)) || !/^https?:\/\//i.test(drawer.official) || !drawer.verified.includes('14.09.2026'))
        fail(`Dossier drawer failed for ${name}: ${JSON.stringify(drawer)}`);
      await page.evaluate(() => window.BLISCompetitorDossierV2.close());
    }
    console.log('AROMA_DOSSIER_DRAWERS_OK');

    if (errors.length) fail(`Runtime errors: ${errors.join(' | ')}`);
    console.log('AROMA_CLIENT_SEND_ACCEPTANCE_OK');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
