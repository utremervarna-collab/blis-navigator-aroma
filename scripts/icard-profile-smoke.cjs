const {chromium}=require('playwright');
const assert=(ok,m)=>{if(!ok)throw new Error(m)};
(async()=>{const browser=await chromium.launch({headless:true});const origin=process.env.ICARD_ORIGIN||'http://127.0.0.1:11000';
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
const ctx=await browser.newContext({viewport:{width,height},acceptDownloads:true});const page=await ctx.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
await ctx.addCookies([{name:'blis_top_rent_scope',value:'top-rent-a-car',url:origin}]);
await page.goto(origin+'/icard',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Общ изглед',exact:true}).waitFor();
assert(await page.locator('.signal').count()===3,'three overview signals');assert(await page.locator('.metric').count()===5,'five KPIs');
await page.screenshot({path:'/tmp/icard-'+name+'-overview.png',fullPage:true});
await page.locator('nav [data-view="prospects"]').click();assert(await page.locator('.prospect').count()===9,'nine companies');
await page.locator('#period').selectOption('30');assert(await page.locator('.prospect').count()===2,'precise event-date filter must exclude undated facts');
const download=page.waitForEvent('download');await page.locator('#export').click();const file=await download;const fs=require('fs');const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert(data.opportunities.length===2,'export must respect filters');
await page.locator('#resetFilters').click();await page.locator('#query').fill('TOP');assert(await page.locator('.prospect').count()===1,'company search');
await page.locator('[data-detail="top"]').first().click();await page.locator('dialog[open]').waitFor();assert((await page.locator('#detailContent').innerText()).includes('депозит'),'dossier qualifiers');await page.locator('#detailPrepare').click();assert(await page.locator('#prepare').inputValue()==='top','specific sales preparation');
await page.locator('#notes').fill('Проверка на интеграцията');await page.locator('#saveNotes').click();await page.reload({waitUntil:'networkidle'});assert(await page.locator('#notes').inputValue()==='Проверка на интеграцията','persisted scoped note');
await page.locator('nav [data-view="trust"]').click();assert(await page.locator('.theme-node').count()===5,'five trust themes');await page.locator('[data-theme="Проверки и документи"]').click();assert(await page.locator('.review').count()===2,'theme drilldown');await page.locator('#trustPeriod').selectOption('30');assert(await page.locator('.review').count()===3,'dated sample filtering');
await page.locator('nav [data-view="growth"]').click();await page.locator('[data-growth="partners"]').click();assert((await page.locator('main').innerText()).includes('CloudCart'),'growth map evidence');
await page.locator('nav [data-view="competition"]').click();assert(await page.locator('table tbody tr').count()===4,'four scenario comparisons');
await page.locator('nav [data-view="reports"]').click();assert(await page.locator('a[href="/icard/report"]').count()>0,'report available');
await page.locator('nav [data-view="sources"]').click();assert(await page.locator('.source-item').count()>10,'source register');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');assert(errors.length===0,'browser errors: '+errors.join(';'));
await page.goto(origin+'/icard/report',{waitUntil:'networkidle'});assert((await page.locator('body').innerText()).includes('Къде iCard може'),'report content');await page.screenshot({path:'/tmp/icard-'+name+'-report.png',fullPage:true});
await ctx.close();}
await browser.close();console.log('ICARD_INTERACTIVE_QA_OK');})().catch(e=>{console.error(e);process.exit(1)});
