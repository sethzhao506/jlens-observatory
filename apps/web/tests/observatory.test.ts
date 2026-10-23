import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import * as cheerio from 'cheerio';
import { chromium, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { SITE } from '@aihot/site';
import type { Proposal } from '../../../modules/observatory/proposals.ts';
import { discussionForItem } from '../../../modules/observatory/research.ts';
import { FIXTURE_AT, fakeApi, feedItem, itemDetail, startWebServer, visit, type WebServer } from './web-server.ts';

const document: typeof import('../../../modules/observatory/data/observatory.json') = JSON.parse(readFileSync(new URL('../../../modules/observatory/data/observatory.json', import.meta.url), 'utf8'));
const storageKey = 'jlens-observatory:personal-proposals:v1';
const updateTitle = 'J-lens / Ouro：原文与技术讨论';
const discussionUrl = 'https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers';
const discussion = feedItem({ id: 'fixture-jlens-discussion', title: updateTitle, summary: 'LessWrong 上关于读出目标、证据与可比性的技术讨论。', source: { name: 'R-lens discussion (fixture)', platform: 'LessWrong', originalUrl: discussionUrl } });
// Synthetic X metadata exercises the existing post shape without claiming an active X collector.
const xUrl = 'https://x.com/fixture_jlens/status/2000000000000000000';
const xDiscussion = feedItem({
  id: 'fixture-jlens-x', title: 'J-lens X fixture', summary: 'A synthetic J-lens discussion for source-label verification.', channel: 'x',
  source: { name: 'Fixture Researcher', platform: 'X', originalUrl: xUrl },
  x: { authorName: 'Fixture Researcher', handle: 'fixture_jlens', avatarUrl: null, media: [], quoted: null },
});
const discussionDetail = itemDetail({ ...discussion, x: null, links: { original: discussionUrl }, readingMode: 'summary-only', body: null });
const unrelatedDetail = itemDetail({ id: 'fixture-unrelated', title: 'Unrelated local fixture', summary: 'An unrelated item does not load research discussion.', body: null });
const catalog: { items: Array<{ id: string; title: string; url: string; publishedAt: string | null; selected?: boolean }> } = JSON.parse(readFileSync(new URL('../../../industry/reading-list.json', import.meta.url), 'utf8'));
const catalogDetails = new Map(catalog.items.map((item) => [item.id, itemDetail({
  id: item.id, title: item.title, links: { original: item.url }, publishedAt: item.publishedAt,
  source: { name: 'Catalog detail fixture', originalUrl: item.url }, selected: item.selected ?? true, readingMode: 'summary-only', body: null,
})]));
const api = fakeApi((url) => {
  if (url.pathname === '/api/v1/observatory') return document;
  if (url.pathname === '/api/v1/research-discussions') return { ...discussionForItem(document.discussions, url.searchParams.get('item') ?? ''), checkedAt: document.discussions.checkedAt };
  if (url.pathname === `/api/site/items/${discussion.id}`) return discussionDetail;
  if (url.pathname === `/api/site/items/${unrelatedDetail.id}`) return unrelatedDetail;
  if (url.pathname.startsWith('/api/site/items/')) return catalogDetails.get(decodeURIComponent(url.pathname.slice('/api/site/items/'.length)));
  if (url.pathname === '/api/site/timeline') return {
    filters: { channel: 'all', category: null, tag: null },
    cards: [discussion, xDiscussion].map((item) => ({ key: item.id, anchorAt: FIXTURE_AT, item, group: null })),
    nextCursor: null, hot: null, dayCounts: { '2026-10-04': 2 },
  };
  if (url.pathname === '/api/site/pool') return {
    filters: { channel: 'all', category: null, tag: null, q: url.searchParams.get('q'), tab: 'time' },
    items: [discussion, xDiscussion], page: 1, pageCount: 1, total: 2, todayCount: 0, freshness: FIXTURE_AT,
  };
  if (url.pathname === '/api/site/hot') return { computedAt: FIXTURE_AT, windowHours: 48, entries: [] };
  if (url.pathname === '/api/site/topics') return { groups: [], topics: [] };
});

let web: WebServer;
let browser: Browser;
before(async () => {
  web = await startWebServer(api);
  try { browser = await chromium.launch({ channel: 'chromium' }); }
  catch (error) {
    // This Windows checkout has an older bundled-browser cache and an installed Chrome.
    if (!(error instanceof Error) || !error.message.includes("Executable doesn't exist")) throw error;
    browser = await chromium.launch({ channel: 'chrome' });
  }
});
after(async () => { await browser?.close(); await web?.stop(); });

async function localContext(options: Parameters<Browser['newContext']>[0] = {}): Promise<BrowserContext> {
  const context = await browser.newContext({ acceptDownloads: true, reducedMotion: 'reduce', ...options });
  context.setDefaultTimeout(5000);
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.origin === web.origin || ['blob:', 'data:'].includes(url.protocol) ? route.continue() : route.abort();
  });
  return context;
}

async function personalRecords(page: Page): Promise<Proposal[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), storageKey);
}

test('research pages keep the original site navigation and support English or Chinese inside that frame', async () => {
  for (const [suffix, lang, heading, navigation] of [
    ['', 'en', 'Follow the research from left to right.', ['Research graph', 'Try', 'Investigate', 'All updates']],
    ['?lang=zh', 'zh-CN', '从左到右，读懂研究怎样发展。', ['研究图谱', '小检查', '调查计划', '全部动态']],
  ] as const) {
    const response = await fetch(`${web.origin}/understand${suffix}`);
    assert.equal(response.status, 200, web.logs());
    const $ = cheerio.load(await response.text());
    assert.equal($('html').attr('lang'), SITE.locale);
    assert.equal($('main [lang]').first().attr('lang'), lang);
    assert.equal($('main h1').text(), heading);
    const nav = $(`nav[aria-label="${lang === 'en' ? 'Research tools' : '研究工具'}"]`);
    assert.deepEqual(nav.find('a').map((_i, element) => $(element).text()).get(), [...navigation]);
    for (const href of nav.find('a').map((_i, element) => $(element).attr('href')!).get()) {
      if (href !== '/all') assert.equal(new URL(href, web.origin).searchParams.get('lang'), lang === 'en' ? 'en' : 'zh');
    }
    const originalNav = $('nav[aria-label="主导航"]');
    for (const href of ['/', '/all', '/topics', '/explore']) assert.ok(originalNav.find(`a[href="${href}"]`).length, href);
    for (const href of ['/hot', '/daily', '/starred', '/understand']) assert.equal(originalNav.find(`a[href="${href}"]`).length, 0, href);
    assert.ok($(`main a[href="${document.sources[0].url}"]`).length);
  }
});

test('catalog core identifiers open the existing graph node and its source inspector', async () => {
  for (const entry of document.researchCatalog.filter((entry) => entry.coreSourceId)) {
    const source = document.sources.find((source) => source.id === entry.coreSourceId)!;
    const response = await fetch(`${web.origin}/explore?node=${encodeURIComponent(entry.id)}`);
    assert.equal(response.status, 200);
    const $ = cheerio.load(await response.text());
    assert.equal($('#obs-graph-inspector h2').first().text(), source.label[0], entry.id);
    const canonicalResponse = await fetch(`${web.origin}/explore?node=${encodeURIComponent(source.id)}`);
    assert.equal(canonicalResponse.status, 200);
    const canonical = cheerio.load(await canonicalResponse.text());
    const nodes = $('button').filter((_, button) => $(button).find('strong').text() === source.label[0]).length;
    const canonicalNodes = canonical('button').filter((_, button) => canonical(button).find('strong').text() === source.label[0]).length;
    assert.ok(canonicalNodes > 0);
    assert.equal(nodes, canonicalNodes, 'An alternate catalog ID does not duplicate the core node.');
  }
});

test('the original news and discussion feeds remain primary and Research Updates aliases All', async () => {
  for (const path of ['/', '/all', '/hot']) {
    const response = await fetch(`${web.origin}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `${path}: ${web.logs()}`);
    const $ = cheerio.load(await response.text());
    assert.ok($('nav[aria-label="主导航"] a[href="/all"]').length);
    if (path !== '/hot') assert.ok($('main').text().includes(updateTitle));
  }
  for (const path of ['/daily', '/daily/2026-10-04', '/daily/archive', '/weekly', '/weekly/2026-W40', '/monthly', '/monthly/2026-10', '/starred']) {
    const response = await fetch(`${web.origin}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 302, `${path}: ${web.logs()}`);
    assert.equal(new URL(response.headers.get('location')!, web.origin).pathname, '/all', path);
  }
  const alias = await fetch(`${web.origin}/research-updates?q=Ouro&lang=zh`, { redirect: 'manual' });
  assert.equal(alias.status, 302);
  const target = new URL(alias.headers.get('location')!, web.origin);
  assert.equal(target.pathname, '/all');
  assert.equal(target.searchParams.get('q'), 'Ouro');
  assert.equal(target.searchParams.get('lang'), 'zh');
  const response = await fetch(target);
  const $ = cheerio.load(await response.text());
  assert.equal(response.status, 200, web.logs());
  assert.ok($('main').text().includes(updateTitle));
  assert.ok($('main').text().includes('LessWrong'));
  assert.ok($('nav[aria-label="主导航"] a[href="/explore"]').length);
  const legacy = await fetch(`${web.origin}/understand?lang=zh&node=ouro`, { redirect: 'manual' });
  assert.equal(legacy.status, 302);
  assert.equal(legacy.headers.get('location'), '/explore?lang=zh&node=ouro');
});

test('updates expose the original platform and source link while bookmark controls stay hidden', { timeout: 30000 }, async () => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await localContext({ viewport });
    try {
      await context.route(discussionUrl, (route) => route.fulfill({ contentType: 'text/html', body: '<title>Original-source navigation fixture</title>' }));
      const page = await context.newPage();
      await visit(page, `${web.origin}/all`);
      const card = page.locator(`article[data-item-id="${discussion.id}"]`);
      const source = card.getByRole('link', { name: /LessWrong.*R-lens discussion/ });
      await expect(source).toBeVisible();
      await expect(source).toHaveAttribute('href', discussionUrl);
      const xSource = page.locator(`article[data-item-id="${xDiscussion.id}"]`).getByRole('link', { name: /X.*Fixture Researcher/ });
      await expect(xSource).toBeVisible();
      await expect(xSource).toHaveAttribute('href', xUrl);
      if (viewport.width > 400) await expect(xSource).toContainText('@fixture_jlens');
      await expect(page.getByRole('button', { name: /^(取消收藏|已收藏|收藏)$/ })).toHaveCount(0);
      const [original] = await Promise.all([context.waitForEvent('page'), source.click()]);
      await expect(original).toHaveURL(discussionUrl);
      await expect(original).toHaveTitle('Original-source navigation fixture');
      await original.close();
      await page.getByRole('link', { name: updateTitle, exact: true }).click();
      await expect(page.getByRole('heading', { name: updateTitle, exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /LessWrong.*R-lens discussion/ }).first()).toHaveAttribute('href', discussionUrl);
      await expect(page.getByRole('button', { name: /^(取消收藏|已收藏|收藏)$/ })).toHaveCount(0);
      if (viewport.width < 400) {
        const tools = page.getByRole('navigation', { name: '阅读工具', exact: true });
        await expect(tools).toBeVisible();
        await expect(tools.getByRole('link', { name: '原文', exact: true })).toHaveAttribute('href', discussionUrl);
      }
    } finally { await context.close(); }
  }
});

test('readers can inspect bounded search coverage, original citation references, companions, and undated materials', { timeout: 45000 }, async () => {
  assert.equal(document.searchCoverage.catalogEntries, 36);
  assert.equal(document.searchCoverage.datedEntries, 34);
  assert.equal(document.searchCoverage.newDirectCitingRecords.length, 18);
  assert.equal(document.searchCoverage.newDirectCitingWorks, 6);
  assert.equal(document.searchCoverage.undated.length, 2);
  const context = await localContext({ viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    const coverage = page.locator('#search-coverage');
    await visit(page, `${web.origin}/explore`);
    await expect(coverage.locator(':scope > summary')).toHaveText('Search coverage and remaining gaps');
    await expect(coverage.getByText('Unknown; no exhaustive citation search completed', { exact: true })).toBeHidden();
    await visit(page, `${web.origin}/all`);
    const entry = page.getByRole('link', { name: '查看检索范围', exact: true });
    await expect(entry).toHaveAttribute('href', '/explore#search-coverage');
    await entry.click();
    await expect(coverage.getByText('Catalogued materials', { exact: true })).toBeVisible();
    await expect(coverage.getByText(`${document.searchCoverage.catalogEntries}, including ${document.searchCoverage.datedEntries} with known original dates`, { exact: true })).toBeVisible();
    await expect(coverage.getByText(`${document.searchCoverage.newDirectCitingWorks} (not a total citation count)`, { exact: true })).toBeVisible();
    await expect(coverage.getByText('Unknown; no exhaustive citation search completed', { exact: true })).toBeVisible();
    const citations = coverage.locator('details').filter({ has: page.locator('summary').filter({ hasText: /^Directly citing papers checked in this pass/ }) });
    await citations.locator(':scope > summary').click();
    await expect(citations.getByText('Direct citations are located in the original references. Citation alone does not establish support, independent verification, or agreement.', { exact: true })).toBeVisible();
    for (const record of document.searchCoverage.newDirectCitingRecords) {
      const row = citations.locator('li').filter({ has: page.getByRole('link', { name: record.title, exact: true }) });
      await expect(row.getByRole('link', { name: record.title, exact: true })).toHaveAttribute('href', `/items/${record.id}`);
      await expect(row.getByRole('link', { name: /^Original references/ })).toHaveAttribute('href', record.url);
      assert.equal((await fetch(`${web.origin}/items/${record.id}`)).status, 200, record.id);
    }
    const companions = coverage.locator('details').filter({ has: page.locator('summary').filter({ hasText: 'Author introductions to the same works' }) });
    await companions.locator(':scope > summary').click();
    await expect(companions.getByText('These posts and their corresponding papers are alternate entries to the same research, not additional works or independent support.', { exact: true })).toBeVisible();
    const companion = document.searchCoverage.companionPosts[0];
    await expect(companions.locator(`a[href="${companion.url}"]`)).toHaveCount(1);
    const uSpace = document.searchCoverage.newDirectCitingRecords.find((record) => record.url.includes('2610.09087'))!;
    const correspondingPaper = companions.locator(`a[href="/items/${uSpace.id}"]`);
    await expect(correspondingPaper).toHaveAttribute('href', `/items/${uSpace.id}`);
    await correspondingPaper.click();
    await expect(page.getByRole('heading', { name: catalog.items.find((item) => item.id === uSpace.id)!.title, exact: true })).toBeVisible();
    await page.goBack();
    await expect(coverage.getByText('Catalogued, original date unverified', { exact: true })).toBeVisible();
    await expect(coverage.getByText('These materials remain readable. Their collection dates are not substituted for publication dates in the updates timeline.', { exact: true })).toBeVisible();
    for (const undated of document.searchCoverage.undated) {
      const title = Array.isArray(undated.title) ? undated.title[0] : undated.title;
      await coverage.getByRole('link', { name: title, exact: true }).click();
      await expect(page.getByRole('heading', { name: catalog.items.find((item) => item.id === undated.id)!.title, exact: true })).toBeVisible();
      await page.goBack();
    }
    await page.getByRole('link', { name: '切换为中文', exact: true }).click();
    await expect(coverage.locator(':scope > summary')).toHaveText('检索覆盖范围与尚未覆盖的资料');
    await expect(coverage.getByText(`${document.searchCoverage.catalogEntries} 条，其中 ${document.searchCoverage.datedEntries} 条有已知原始日期`, { exact: true })).toBeVisible();
    await expect(coverage.getByText(`${document.searchCoverage.newDirectCitingWorks} 篇（不是总引用数）`, { exact: true })).toBeVisible();
    await expect(coverage.getByText('未知；尚未完成完整引用检索', { exact: true })).toBeVisible();
    await visit(page, `${web.origin}/understand?lang=zh`);
    await expect(coverage.getByText('未知；尚未完成完整引用检索', { exact: true })).toBeHidden();
    await visit(page, `${web.origin}/understand?lang=zh#search-coverage`);
    await expect(coverage.getByText('未知；尚未完成完整引用检索', { exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test('a reader follows evidence into a small check, saves real proposal revisions, and exports original sources', { timeout: 60000 }, async () => {
  const context = await localContext({ viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await visit(page, web.origin);
    await expect(page.getByRole('link', { name: updateTitle, exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '精选', exact: true })).toBeVisible();
    await page.screenshot({ path: '.data/observatory-home.png', fullPage: true });
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '研究图谱', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Follow the research from left to right.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^SOURCE / })).toHaveCount(document.sources.length);
    await expect(page.getByText('Read from left to right →', { exact: true })).toBeVisible();
    await expect(page.getByText('Columns and pale dashed paths show an editorial reading order, not chronology or established research ancestry.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Show source relationships/ })).toHaveAttribute('aria-pressed', 'false');
    const connections = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: /^All relationships and sources/ }) });
    await expect(connections.getByRole('button', { name: /Direct citation.*R-lens → J-lens/ })).toBeHidden();
    await page.screenshot({ path: '.data/observatory-graph.png', fullPage: true });
    await expect(page.getByRole('button', { name: 'Research development', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^Show source relationships/ }).click();
    await expect(page.getByRole('button', { name: 'Hide source relationships', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^R-lens → J-lens:/ }).click();
    await expect(page.getByText('3 relationships between these sources', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Method adaptation', exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('edge')).toBe(document.relations.find((entry) => entry.source === 'rlens' && entry.kind === 'method')!.id);
    await page.getByRole('button', { name: 'Hide source relationships', exact: true }).click();
    await connections.locator('summary').click();
    await connections.getByRole('button', { name: /Direct citation.*R-lens → J-lens/ }).click();
    await expect(page.getByText('RELATION INSPECTOR', { exact: true })).toBeVisible();
    await expect(page.getByText('Directed · source to target', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the relationship basis' })).toHaveAttribute('href', document.relations.find((entry) => entry.source === 'rlens' && entry.kind === 'citation')!.proof_url!);
    await page.getByRole('button', { name: 'Evidence & judgments', exact: true }).click();
    await expect(page.getByText('SCIENTIFIC CLAIM · SCOPED', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supporting evidence', exact: true })).toBeHidden();
    await page.locator('summary').filter({ hasText: 'Full evidence card: support, conditions, and limits' }).click();
    await expect(page.getByRole('heading', { name: 'Supporting evidence', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Verification script (not run here)' })).toHaveAttribute('href', document.evidence[0].codeUrl);
    await page.getByRole('button', { name: 'Hypothesis evolution', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Hypothesis evolution', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('UNRUN PROPOSAL', { exact: true }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Evidence & judgments', exact: true }).click();
    await page.getByRole('link', { name: 'Check its reported aggregates', exact: true }).click();
    await page.getByRole('button', { name: 'Calculate first-to-last change' }).click();
    await expect(page.getByText('34.17 - (22.6) = 11.57', { exact: true })).toBeVisible();
    await expect(page.getByText('Confidence interval: unavailable. Sample-level data for this calculation are not bundled.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Check comparability of the two series' }).click();
    await expect(page.getByText('Direct numeric combination is not justified', { exact: true })).toBeVisible();
    await expect(page.getByText('quantity, estimator_family', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Take this evidence into an investigation' }).click();
    await expect(page.getByRole('heading', { name: 'Turn an observation into a discriminating test.' })).toBeVisible();
    await page.getByRole('button', { name: 'Save the first version' }).click();
    await expect(page.getByRole('status')).toContainText('An immutable version was saved');
    const [first] = await personalRecords(page);
    assert.ok(first);
    assert.deepEqual(first.parent_ids, []);
    const firstSnapshot = JSON.stringify(first);
    const revisedClaim = `${first.snapshot.claim}\nPrespecify a held-out residual-effect threshold before inspecting outcomes.`;
    await page.getByLabel(/^Scoped candidate claim/).fill(revisedClaim);
    const revisionReason = 'Require a prespecified held-out threshold to distinguish a residual effect from noise.';
    await page.getByLabel('What changed in this revision, and why?', { exact: true }).fill(revisionReason);
    await page.getByRole('button', { name: 'Save a new revision' }).click();
    await expect.poll(async () => (await personalRecords(page)).length).toBe(2);
    const records = await personalRecords(page), second = records[1];
    assert.equal(JSON.stringify(records[0]), firstSnapshot);
    assert.deepEqual(second.parent_ids, [first.id]);
    assert.equal(second.reason, revisionReason);
    assert.equal(second.execution_status, 'not_run');
    assert.equal(second.status, 'proposed_not_run');
    assert.equal(second.snapshot.claim, revisedClaim);

    const [download] = await Promise.all([
      page.waitForEvent('download'), page.getByRole('button', { name: /^Export JSON/ }).click(),
    ]);
    const jsonFile = await download.path();
    assert.ok(jsonFile);
    const packet = JSON.parse(await readFile(jsonFile, 'utf8'));
    assert.deepEqual(packet.history.map((record: Proposal) => record.id), [first.id, second.id]);
    assert.equal(packet.selected_hypothesis.id, second.id);
    assert.equal(packet.model_experiment_run, false);
    assert.equal(packet.independently_validated, false);
    assert.ok(packet.sources.some((source: { url: string }) => source.url === document.sources.find((source) => source.id === 'ouro')!.url));
    assert.deepEqual(packet.selected_hypothesis.snapshot.evidence_ids, document.hypothesisTemplate.evidenceIds);
    const [markdownDownload] = await Promise.all([
      page.waitForEvent('download'), page.getByRole('button', { name: /^Export Markdown/ }).click(),
    ]);
    const markdownFile = await markdownDownload.path();
    assert.ok(markdownFile);
    const markdown = await readFile(markdownFile, 'utf8');
    for (const value of [first.id, second.id, revisionReason, 'https://github.com/VykosMolt/JLens-Ouro', 'Null result:', 'Inconclusive:', 'proposed, not run']) assert.ok(markdown.includes(value), value);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Saved personal versions', exact: true })).toBeVisible();
    assert.deepEqual((await personalRecords(page)).map(({ id }) => id), [first.id, second.id]);
    await page.getByRole('link', { name: 'See the revision graph' }).click();
    await expect(page.getByRole('button', { name: /PERSONAL Personal version 1/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /PERSONAL Personal version 2/ })).toBeVisible();
    await page.locator('summary').filter({ hasText: /^All relationships and sources/ }).click();
    await page.getByRole('button', { name: /Actual revision.*Personal version 1 → Personal version 2/ }).click();
    await expect(page.getByText('RELATION INSPECTOR', { exact: true })).toBeVisible();
    await expect(page.getByText(revisionReason, { exact: true }).last()).toBeVisible();
    await expect(page.getByText(`parent_ids: ${first.id}`, { exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test('a phone can use the readable graph path and switch language without losing its selection', { timeout: 30000 }, async () => {
  const context = await localContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await visit(page, `${web.origin}/explore?node=ouro`);
    await expect(page.locator('main [lang]').first()).toHaveAttribute('lang', 'en');
    const bottom = page.getByRole('navigation', { name: '底部导航', exact: true });
    await expect(bottom).toBeVisible();
    for (const label of ['精选', '研究']) await expect(bottom.getByRole('link', { name: label, exact: true })).toBeVisible();
    await expect(bottom.getByRole('link')).toHaveCount(3);
    for (const label of ['热点', '日报', '收藏']) await expect(bottom.getByRole('link', { name: label, exact: true })).toHaveCount(0);
    await expect(bottom.getByRole('link', { name: /^我的/ })).toHaveAttribute('href', '/more');
    await expect(bottom.getByRole('link', { name: '研究', exact: true })).toHaveCount(1);
    await expect(bottom.getByRole('link', { name: '研究', exact: true })).toHaveAttribute('href', '/explore');
    await expect(page.getByRole('button', { name: 'Selected', exact: true })).toBeVisible();
    await expect(page.getByText('READING PATH / SELECT TO INSPECT', { exact: true })).toBeVisible();
    const path = page.getByRole('button', { name: /^0\d / });
    await expect(path).toHaveCount(document.sources.length);
    await page.getByRole('button', { name: /^\d{2} Own-exit comparison/ }).click();
    await expect(page.getByRole('heading', { name: 'Own-exit comparison', exact: true })).toBeVisible();
    await page.getByRole('link', { name: '切换为中文', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', SITE.locale);
    await expect(page.locator('main [lang]').first()).toHaveAttribute('lang', 'zh-CN');
    assert.equal(new URL(page.url()).searchParams.get('node'), 'ouro');
    await expect(bottom.getByRole('link', { name: '精选', exact: true })).toBeVisible();
    await expect(page.getByText('可读路径 / 点击展开', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: '查看它支持的主张' }).click();
    await expect(page.getByText('科学主张 · 有范围', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: '检查对应的汇总值' }).click();
    await page.getByRole('button', { name: '计算首末差值' }).click();
    await expect(page.getByText('34.17 - (22.6) = 11.57', { exact: true })).toBeVisible();
    assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.locator('header[data-phone-bar]').getByRole('button').first().click();
    await expect.poll(() => new URL(page.url()).pathname).toBe('/explore');
    await expect(page.getByText('科学主张 · 有范围', { exact: true })).toBeVisible();
    assert.deepEqual(await personalRecords(page), [], 'A separate phone browser context has no desktop proposal history.');
    await bottom.getByRole('link', { name: /^我的/ }).click();
    await expect(page.getByRole('heading', { name: '工具与入口', exact: true })).toBeVisible();
    for (const href of ['/starred', '/hot', '/daily']) await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(0);
  } finally { await context.close(); }
});

test('the paper index expands gradually, filters Foreword, and connects its source and citation to the graph', { timeout: 45000 }, async () => {
  const entry = document.researchCatalog.find((material) => material.id === 'jlens-foreword')!;
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await localContext({ viewport });
    try {
      const page = await context.newPage();
      await visit(page, `${web.origin}/explore`);
      const library = page.getByRole('region', { name: 'Papers, blogs, and discussion index', exact: true });
      await expect(library.getByRole('article')).toHaveCount(6);
      await library.getByRole('button', { name: /^Show more/ }).click();
      await expect(library.getByRole('article')).toHaveCount(18);
      await library.getByRole('combobox', { name: /^Material type/ }).selectOption('paper');
      await library.getByLabel('Search title, author, or viewpoint', { exact: true }).fill('Foreword');
      const row = library.getByRole('article');
      await expect(row).toHaveCount(1);
      await expect(row.getByRole('button', { name: entry.title[0], exact: true })).toBeVisible();
      await expect(row.getByRole('link', { name: 'Source ↗', exact: true })).toHaveAttribute('href', entry.sourceUrl);
      await row.getByRole('button', { name: 'Show in graph', exact: true }).click();
      await expect.poll(() => new URL(page.url()).searchParams.get('node')).toBe(entry.id);
      const inspector = page.locator('#obs-graph-inspector');
      await expect(inspector.getByRole('heading', { name: 'Foreword', exact: true })).toBeVisible();
      const sourceLink = inspector.getByRole('link', { name: 'Source ↗', exact: true });
      await expect(sourceLink).toHaveAttribute('href', entry.sourceUrl);
      await expect(inspector.getByText(entry.limitation[0], { exact: true })).toBeVisible();
      const connections = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: /^All relationships and sources/ }) });
      await connections.locator(':scope > summary').click();
      await connections.getByRole('button', { name: /Direct citation.*Foreword → J-lens/ }).click();
      await expect(inspector.getByText('RELATION INSPECTOR', { exact: true })).toBeVisible();
      await expect(inspector.getByRole('link', { name: /^Open the relationship basis/ })).toHaveAttribute('href', entry.directCitation!.proofUrl);
      await expect(inspector.getByText(entry.directCitation!.locator, { exact: true })).toBeVisible();
      assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= window.innerWidth + 1), `graph and catalog overflow at ${viewport.width}px`);
      await page.screenshot({ path: `.data/observatory-catalog-${viewport.width}.png`, fullPage: true });
    } finally { await context.close(); }
  }
});

test('discussion viewpoints keep Neel Nanda’s source, reply context, votes, and unreviewed graph relations', { timeout: 45000 }, async () => {
  const note = document.discussions.notes.find((entry) => entry.id === 'lw-comment-s5dLELdceTzSPPD37')!;
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await localContext({ viewport });
    try {
      const page = await context.newPage();
      await visit(page, `${web.origin}/items/jlens-bench`);
      const section = page.getByRole('region', { name: /^(Discussion viewpoints|讨论观点)$/ });
      await expect(section.getByText(note.summary[0], { exact: true })).toBeVisible();
      const row = section.getByRole('listitem').filter({ has: page.getByText(note.summary[0], { exact: true }) });
      await expect(row.getByText('Neel Nanda', { exact: true })).toBeVisible();
      await expect(row.getByText(`Source score: ${note.baseScore}`, { exact: true })).toBeVisible();
      await expect(row.getByText(`Vote count: ${note.voteCount}`, { exact: true })).toBeVisible();
      await expect(row.locator(`time[datetime="${note.postedAt}"]`)).toHaveCount(1);
      await expect(row.locator(`time[datetime="${note.checkedAt}"]`)).toHaveCount(1);
      await expect(row.getByText('Human review pending', { exact: true })).toBeVisible();
      await expect(row.getByRole('link', { name: /^Original comment/ })).toHaveAttribute('href', note.originalUrl);
      await expect(row.getByRole('link', { name: /^Source post/ })).toHaveAttribute('href', note.postUrl);
      await expect(row.getByRole('link', { name: /^Parent comment/ })).toHaveAttribute('href', note.parentCommentUrl!);
      await section.getByRole('button', { name: '讨论切换为中文', exact: true }).click();
      await expect(section).toHaveAttribute('lang', 'zh-CN');
      await expect(section.getByText(note.summary[1], { exact: true })).toBeVisible();
      await section.getByRole('button', { name: 'Switch discussion to English', exact: true }).click();
      await row.getByRole('link', { name: /^View in graph/ }).click();
      await expect.poll(() => new URL(page.url()).searchParams.get('node')).toBe(note.id);
      const inspector = page.locator('#obs-graph-inspector');
      await expect(inspector.getByText('DISCUSSION VIEWPOINT · NOT A RESULT', { exact: true })).toBeVisible();
      await expect(inspector.getByText(note.summary[0], { exact: true })).toBeVisible();
      await expect(inspector.getByRole('link', { name: /^Original comment/ })).toHaveAttribute('href', note.originalUrl);
      const connections = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: /^All relationships and sources/ }) });
      await connections.locator(':scope > summary').click();
      const commentRelation = connections.getByRole('button', { name: /Comments on.*Neel Nanda → WorkspaceBench/ });
      await expect(commentRelation).toBeVisible();
      const replyRelation = connections.getByRole('button', { name: /Replies to.*Neel Nanda → Burny/ });
      await expect(replyRelation).toBeVisible();
      await replyRelation.click();
      await expect(inspector.getByText(`parentCommentId=${note.parentCommentId}`, { exact: true })).toBeVisible();
      await expect(inspector.getByRole('link', { name: /^Open the relationship basis/ })).toHaveAttribute('href', note.originalUrl);
      assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= window.innerWidth + 1), `discussion graph overflow at ${viewport.width}px`);
      await page.screenshot({ path: `.data/observatory-discussion-${viewport.width}.png`, fullPage: true });
    } finally { await context.close(); }
  }
});

test('discussion loading failures remain visible and retry without inventing an empty source discussion', { timeout: 30000 }, async () => {
  const context = await localContext({ viewport: { width: 1440, height: 1000 } });
  try {
    let attempts = 0;
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    await context.route('**/api/v1/research-discussions?item=jlens-bench', async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await held;
        return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'temporarily_unavailable' }) });
      }
      return route.fallback();
    });
    const page = await context.newPage();
    await visit(page, `${web.origin}/items/jlens-bench`);
    const section = page.getByRole('region', { name: 'Discussion viewpoints', exact: true });
    await expect(section.getByRole('status')).toHaveText('Loading discussion records…');
    release();
    await expect(section.getByRole('alert')).toContainText('Discussion records could not load. This does not mean the source has no comments.');
    await expect(section.getByText(/no viewpoints were selected/)).toHaveCount(0);
    await section.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(section.getByText('Neel Nanda', { exact: true })).toBeVisible();
    assert.equal(attempts, 2);
    const checkedEmpty = document.discussions.posts.find((post) => !post.selectedNoteIds.length && post.status === 'ok' && post.readingListIds.some((id) => catalogDetails.has(id)))!;
    await visit(page, `${web.origin}/items/${checkedEmpty.readingListIds.find((id) => catalogDetails.has(id))}`);
    await expect(page.getByText('Source discussion was checked; no viewpoints were selected in this pass. Other useful viewpoints may remain.', { exact: true })).toBeVisible();
    await visit(page, `${web.origin}/items/${discussion.id}`);
    await expect(page.getByText('Discussion on this material has not been checked. Absence of a record does not establish absence of comments or disagreement.', { exact: true })).toBeVisible();
    let unrelatedRequests = 0;
    page.on('request', (request) => { if (new URL(request.url()).pathname === '/api/v1/research-discussions') unrelatedRequests += 1; });
    await visit(page, `${web.origin}/items/${unrelatedDetail.id}`);
    await expect(page.getByRole('region', { name: 'Discussion viewpoints', exact: true })).toHaveCount(0);
    assert.equal(unrelatedRequests, 0);
  } finally { await context.close(); }
});
