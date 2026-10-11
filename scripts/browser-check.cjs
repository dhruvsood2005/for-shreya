const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
let activeBrowser;

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  activeBrowser = browser;
  const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror',error=>errors.push(error.message));
  await fs.mkdir('artifacts',{recursive:true});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.envelope-card').count(),15);
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  for (const id of await page.locator('.envelope-card').evaluateAll(cards=>cards.map(card=>card.dataset.id))) {
    await page.locator(`[data-id="${id}"]`).click();
    assert.ok(await page.locator('#letter-dialog').evaluate(node=>node.open));
    assert.ok((await page.locator('#letter-body').innerText()).length > 150);
    await page.keyboard.press('Escape');
    await page.waitForFunction(id=>document.activeElement?.dataset.id===id,id);
    assert.equal(await page.locator('#letter-dialog').evaluate(node=>node.open),false);
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.id),id);
  }
  assert.match(await page.locator('#opened-count').innerText(),/15 of 15/);
  for (const category of ['comfort','us','smile']) {
    await page.locator(`[data-filter="${category}"]`).click();
    const count=await page.locator('.envelope-card').count();
    assert.ok(count>0&&count<15);
  }
  await page.locator('[data-filter="all"]').click();
  await page.locator('#studio-toggle').click();
  assert.ok(await page.locator('#studio-panel').isVisible());
  await page.locator('[data-id="missme"]').click();
  await page.locator('#edit-letter').click();
  const edited='A personal message for Shreya.\n\n<script>window.testInjection=true</script>';
  await page.locator('#edit-body').fill(edited);
  await page.locator('#letter-editor button[type="submit"]').click();
  assert.ok(await page.locator('#dialog-status').isVisible());
  assert.equal(await page.locator('#letter-body').innerText(),edited);
  assert.equal(await page.evaluate(()=>window.testInjection),undefined);
  await page.keyboard.press('Escape');
  await page.reload();
  await page.locator('[data-id="missme"]').click();
  assert.equal(await page.locator('#letter-body').innerText(),edited);
  await page.keyboard.press('Escape');
  await page.locator('#studio-toggle').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#export-drafts').click();
  const download=await downloadPromise;
  await download.saveAs('artifacts/test-export.json');
  const exported=JSON.parse(await fs.readFile('artifacts/test-export.json','utf8'));
  assert.equal(exported.letters.length,15);
  assert.equal(exported.letters[0].body,edited);
  await page.locator('#import-drafts').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('not a recognised'));
  assert.match(await page.locator('#toast').innerText(),/not a recognised/);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#import-drafts').setInputFiles(path.resolve('artifacts/test-export.json'));
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Imported all 15'));
  assert.match(await page.locator('#toast').innerText(),/Imported all 15/);
  const largeExport={...exported,letters:exported.letters.map(letter=>({...letter,body:'愛'.repeat(12000)}))};
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#import-drafts').setInputFiles({name:'unicode-export.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(largeExport))});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('shreya-open-when-drafts-v1')).missme.length===12000);
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.locator('[data-id="howmuchiloveyou"]').click();
  await page.screenshot({path:'artifacts/letter-desktop.png'});
  await page.keyboard.press('Escape');
  for (const width of [320,390,768]) {
    await page.setViewportSize({width,height:844});
    await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
    const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert.ok(sizes.scroll<=sizes.width,`Horizontal overflow at ${width}: ${sizes.scroll}`);
    await page.screenshot({path:`artifacts/mobile-${width}.png`,fullPage:true});
    await page.locator('[data-id="missme"]').click();
    await page.screenshot({path:`artifacts/letter-${width}.png`});
    assert.ok(await page.locator('#close-dialog').isVisible());
    await page.locator('#close-dialog').click();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all 15 letters, Escape/focus, 3 filters, opened progress, draft persistence, text safety, export/import, 320/390/768px layouts, no browser errors.');
  await browser.close();
})().catch(async error=>{console.error(error);await activeBrowser?.close();process.exit(1)});
