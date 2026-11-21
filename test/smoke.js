// Smoke test: node test/smoke.js [url]. Serves the site itself when no URL is given.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, () => resolve(srv));
  });
}

const long = 'The wind carries sand across the plain and every step costs water. '.repeat(80);
let failures = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) failures++; };

(async () => {
  const srv = process.argv[2] ? null : await serve();
  const url = process.argv[2] || `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(url);
  await page.waitForTimeout(800);
  check(page.url().endsWith('#design'), 'first visit opens on Design');
  await page.goto(url + '#library');
  await page.waitForSelector('.tile');
  check((await page.locator('.tile').count()) >= 1, 'library shows the sample mission');

  // new mission from the template
  await page.click('#newMission');
  await page.waitForSelector('#editor:not([hidden]) .part');
  check((await page.locator('.part').count()) === 3, 'new mission has 3 template parts');
  await page.fill('#detailsForm input >> nth=0', 'Smoke test mission');
  await page.fill('#detailsForm input >> nth=2', '99');
  const ta = page.locator('.part >> nth=0').locator('textarea >> nth=0');
  await ta.fill('Short **briefing** with {green} and {water}.');
  const fits = await page.locator('.part >> nth=0').locator('.fit.ok').waitFor({ timeout: 5000 }).then(() => true, () => false);
  check(fits, 'short part reports it fits');

  await ta.fill(long);
  const over = await page.locator('.part >> nth=0').locator('.fit.over').waitFor({ timeout: 5000 }).then(() => true, () => false);
  check(over, 'long part reports overflow');
  await ta.fill('Back to a short briefing. Read **{mission} - Part 2**.');

  // art upload and picture block
  await page.click('#artPanel summary');
  await page.setInputFiles('#art-front', path.join(__dirname, 'fixtures/art.jpg'));
  await page.waitForSelector('#artForm img.thumb');
  check(true, 'front art uploads');
  const part2 = page.locator('.part >> nth=1');
  await part2.locator('.add-row select').selectOption('image');
  await part2.locator('.add-row button').click();
  await page.locator('.part >> nth=1').locator('input[type=file]').setInputFiles(path.join(__dirname, 'fixtures/map.png'));
  await page.waitForSelector('.part >> nth=1 >> img.thumb');
  check(true, 'picture block uploads');

  // add part, back side preview
  await page.click('#addPart');
  check((await page.locator('.part').count()) === 4, 'add part works');
  await page.click('#preview .seg button[data-side=back]');
  await page.waitForTimeout(500);
  const w = await page.$eval('#previewCanvas', c => c.width / c.height);
  check(w > 1.6 && w < 1.8, 'back preview is landscape 120 x 70');
  await page.waitForTimeout(800);

  // export and re-import
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportOne')]);
  const file = await dl.path();
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  check(json.format === 'uos-missions' && json.missions[0].parts.length === 4, 'export holds the mission and its parts');
  check(String(json.missions[0].art.front).startsWith('data:image'), 'export includes the art');
  await page.click('.tabs a[data-tab=library]');
  await page.waitForSelector('.tile');
  const before = await page.locator('.tile').count();
  await page.setInputFiles('#importFile', file);
  await page.waitForFunction(n => document.querySelectorAll('.tile').length === n + 1, before);
  check(true, 'import adds a copy');

  // print
  await page.click('.tabs a[data-tab=print]');
  await page.waitForSelector('#printList input');
  await page.click('#printAll');
  const [pdf] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#makePdf')]);
  const buf = fs.readFileSync(await pdf.path());
  if (process.env.KEEP_PDF) fs.writeFileSync(process.env.KEEP_PDF, buf);
  const pages = (buf.toString('latin1').match(/\/Type \/Page[^s]/g) || []).length;
  check(buf.slice(0, 4).toString() === '%PDF' && pages >= 4, `PDF builds (${pages} pages, ${Math.round(buf.length / 1024)} KB)`);

  // survivor log
  await page.click('.tabs a[data-tab=sheet]');
  await page.waitForTimeout(800);
  await page.click('#sheetOptions .seg button >> nth=1');
  const [sheet] = await Promise.all([page.waitForEvent('download'), page.click('#sheetPdf')]);
  check(fs.readFileSync(await sheet.path()).slice(0, 4).toString() === '%PDF' && sheet.suggestedFilename() === 'survivor-log-de.pdf', 'German survivor log PDF builds');

  // mission index
  await page.click('.tabs a[data-tab=index]');
  await page.waitForSelector('#indexList .mcard');
  check((await page.locator('#indexList .mcard').count()) === 14, 'mission index lists 14 missions');
  await page.locator('#indexFilters select').nth(2).selectOption('comp');
  check((await page.locator('#indexList .mcard').count()) === 4, 'competitive filter shows 4');
  await page.locator('#indexFilters select').nth(0).selectOption('1');
  check((await page.locator('#indexList .mcard').count()) === 3, 'easy and competitive shows 3');

  // design
  await page.click('.tabs a[data-tab=design]');
  await page.waitForSelector('#sparkOut dd');
  await page.click('#sparkUse');
  await page.waitForSelector('#editor:not([hidden])');
  check((await page.inputValue('#notesField')).startsWith('Spark'), 'spark starts a mission with notes');

  // faq
  await page.click('.tabs a[data-tab=faq]');
  await page.fill('#faqSearch', 'karma');
  await page.waitForTimeout(400);
  const hits = await page.locator('#faqList details.qa').count();
  check(hits >= 2 && hits < 20, `FAQ search filters (${hits} hits for karma)`);
  await page.goto(url + '#faq/hero-item');
  await page.waitForTimeout(600);
  check(await page.evaluate(() => document.getElementById('faq-hero-item')?.open === true), 'FAQ deep link opens the answer');

  // help panel and old guide links
  await page.goto(url + '#guide');
  await page.waitForTimeout(900);
  check(await page.evaluate(() => document.getElementById('helpPanel').open === true), 'old Guide link opens the editor Help panel');
  check((await page.locator('.tabs a').count()) === 7, 'menu has 7 tabs');

  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.tabs a[data-tab=library]');
  await page.click('.tile .btn.primary >> nth=0');
  await page.waitForSelector('#previewOpen');
  await page.click('#previewOpen');
  check(await page.isVisible('#previewCanvas'), 'mobile preview opens');
  await page.click('#previewClose');

  check(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  if (srv) srv.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
