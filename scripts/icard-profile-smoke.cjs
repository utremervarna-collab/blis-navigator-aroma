const {chromium}=require('playwright');
const assert=(ok,m)=>{if(!ok)throw new Error(m)};
(async()=>{const browser=await chromium.launch({headless:true});const origin=process.env.ICARD_ORIGIN||'http://127.0.0.1:11000';
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
const ctx=await browser.newContext({viewport:{width,height},acceptDownloads:true});const page=await ctx.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
await ctx.addCookies([{name:'blis_top_rent_scope',value:'top-rent-a-car',url:origin}]);
async function nav(v){const b=page.locator('nav [data-view="'+v+'"]');if(!await b.isVisible())await page.locator('#mobileMenu').click();await b.click()}
await page.goto(origin+'/icard',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Общ изглед',exact:true}).waitFor();
assert(await page.locator('.signal').count()===3,'three overview signals');assert(await page.locator('.metric').count()===5,'five KPIs');
await page.screenshot({path:'/tmp/icard-'+name+'-overview.png',fullPage:true});
assert(await page.locator('[data-profile-page]').count()===11,'eleven real page sections');
assert(await page.locator('.radar-dot').count()>20,'source-backed overview radar');
await nav('digital');assert(new URL(page.url()).pathname==='/icard/digital','real radar route');
await page.locator('.radar-tabs [data-radar-group="companies"]').click();assert(await page.locator('.radar-result-list article').count()===9,'radar business direction');
await page.locator('#radarQuery').fill('TOP');assert(await page.locator('.radar-result-list article').count()===1,'radar search');
await page.screenshot({path:'/tmp/icard-'+name+'-radar.png',fullPage:true});
await nav('market');assert(await page.locator('.environment-stage .map-node').count()===15,'product-company environment nodes');
await page.locator('.map-node-index [data-map-node="company:top"]').click();assert((await page.locator('.map-detail').innerText()).includes('TOP Rent A Car'),'map source drilldown');
await page.locator('#mapProduct').selectOption('vending');assert(await page.locator('.environment-stage .map-node').count()>=2,'map product filter');
await page.locator('#mapZoomIn').click();assert((await page.locator('.environment-stage svg>g').getAttribute('transform')).includes('1.15'),'map zoom');
await page.locator('#mapMode').selectOption('competition');assert(await page.locator('.environment-stage .map-node').count()===4,'competitor map');
await page.locator('#mapMode').selectOption('trust');assert(await page.locator('.environment-stage .map-node').count()===5,'trust map');
await page.locator('#mapReset').click();await page.screenshot({path:'/tmp/icard-'+name+'-map.png',fullPage:true});
await nav('monitoring');assert(await page.locator('.observation').count()===24,'monitoring corpus');
await page.locator('#monitorType').selectOption('Отзив');assert(await page.locator('.observation').count()===8,'monitoring type filter');
await page.locator('#monitorPeriod').selectOption('30');assert(await page.locator('.observation').count()===3,'monitoring date filter');
await page.screenshot({path:'/tmp/icard-'+name+'-monitoring.png',fullPage:true});
await page.reload({waitUntil:'networkidle'});assert(new URL(page.url()).pathname==='/icard/monitoring','deep route reload');assert(await page.locator('#monitoringPage.active').count()===1,'real monitoring page');

await nav('prospects');assert(await page.locator('.prospect').count()===9,'nine companies');
await page.locator('#period').selectOption('30');assert(await page.locator('.prospect').count()===2,'precise event-date filter must exclude undated facts');
const download=page.waitForEvent('download');await page.locator('#export').click();const file=await download;const fs=require('fs');const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert(data.opportunities.length===2,'export must respect filters');
await page.locator('#resetFilters').click();await page.locator('#query').fill('TOP');assert(await page.locator('.prospect').count()===1,'company search');
await page.locator('[data-detail="top"]').first().click();await page.locator('dialog[open]').waitFor();assert((await page.locator('#detailContent').innerText()).includes('депозит'),'dossier qualifiers');await page.locator('#detailPrepare').click();assert(await page.locator('#prepare').inputValue()==='top','specific sales preparation');
await page.locator('#notes').fill('Проверка на интеграцията');await page.locator('#saveNotes').click();await page.reload({waitUntil:'networkidle'});assert(await page.locator('#notes').inputValue()==='Проверка на интеграцията','persisted scoped note');
await nav('trust');assert(await page.locator('.theme-node').count()===5,'five trust themes');await page.locator('[data-theme="Проверки и документи"]').click();assert(await page.locator('.review').count()===2,'theme drilldown');await page.locator('#trustPeriod').selectOption('30');assert(await page.locator('.review').count()===3,'dated sample filtering');
await nav('growth');await page.locator('[data-growth="partners"]').click();assert((await page.locator('main').innerText()).includes('CloudCart'),'growth map evidence');
await nav('competition');assert(await page.locator('table tbody tr').count()===4,'four scenario comparisons');
await nav('reports');assert(await page.locator('a[href="/icard/report"]').count()>0,'report available');
await nav('sources');assert(await page.locator('.source-item').count()>10,'source register');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');assert(errors.length===0,'browser errors: '+errors.join(';'));
await page.goto(origin+'/icard/report',{waitUntil:'networkidle'});assert((await page.locator('body').innerText()).includes('Къде iCard може'),'report content');await page.screenshot({path:'/tmp/icard-'+name+'-report.png',fullPage:true});
await ctx.close();}
await browser.close();console.log('ICARD_INTERACTIVE_QA_OK');})().catch(e=>{console.error(e);process.exit(1)});
