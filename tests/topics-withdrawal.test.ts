// A withdrawn report leaves the topic pages at once, though the topic index behind them
// is kept for a minute. Its own file: the index is cached per process, and this needs it cold.
// The way it can go wrong: the page's or the index page's latest headline still shows the title from
// the cached index after the withdrawal. Corrections can also leave an old headline or keep a report in
// a research direction it no longer belongs to; check them before cache expiry.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticle } from "@aihot/backend/publication/publish";
import { listTopicSummaries, loadTopicPage } from "@aihot/backend/publication/topics";
import { overrideFields } from "@aihot/backend/admin/content";

const T = tag();
const SOURCE = `test-topics-withdrawal-${T}`;
let older: string;
let newer: string;
let corrected: string;

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, next_fetch_at) VALUES (${SOURCE}, 'Media', 'rss', 'T2', 'editorial', '2100-01-01')`;
  older = await report(1, 3);
  newer = await report(2, 1);
  corrected = await report(3, 2, "J-space");
  // All scenarios share this one cold index, then exercise the cache without waiting a minute.
  await loadTopicPage("ouro", 1);
});
after(async () => {
  await stopBoss();
  await closeDb();
});

async function report(n: number, hoursAgo: number, topicTag = "Ouro"): Promise<string> {
  const at = new Date(Date.now() - hoursAgo * 3600_000);
  const { articleId } = await upsertMaterial({
    sourceId: SOURCE, url: `https://example.com/withdrawal-${T}-${n}`, title: `${topicTag} report ${n}`, bodyText: "body", bodyHtml: "<p>body</p>", bodyStatus: "ok", via: "fetch", publishedAt: at,
  });
  await sql`UPDATE articles SET discovered_at = ${at}, timeline_at = ${at}, grouped_at = now() WHERE id = ${articleId}`;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected, subjects, tags)
            VALUES (${articleId}, 1, 'rule', 'pass', 'paper', ${`${topicTag} 消息 ${n}`}, '摘要', 80, true, ${[]}, ${['论文/研究', topicTag]})`;
  await publishArticle(articleId, { releasedAt: new Date(at.getTime() + 60_000) });
  return articleId;
}

test("a withdrawn report leaves the topic page and the index while the topic index is still cached", async () => {
  // Both are read into the cached index.
  const before = await loadTopicPage("ouro", 1);
  assert.ok(before?.items.some((i) => i.id === newer));
  assert.equal((await listTopicSummaries()).topics.find((t) => t.slug === "ouro")?.latest?.title, `Ouro 消息 2`);

  await sql`UPDATE publications SET visibility = 'withdrawn' WHERE article_id = ${newer}`;
  const page = await loadTopicPage("ouro", 1);
  assert.equal(page?.topic.latest?.title, `Ouro 消息 1`, "the page's last update");
  assert.equal((await listTopicSummaries()).topics.find((t) => t.slug === "ouro")?.latest?.title, `Ouro 消息 1`, "the index page's headline");
  assert.deepEqual(page?.items.map((i) => i.id), [older], "the list (rows were always checked again)");
});

test("a correction refreshes named content and its topic membership before the index expires", async () => {
  const title = `J-space 更正后的研究消息 ${T}`;
  await overrideFields(corrected, { fields: { title }, version: 0, reason: "更正标题" }, "test-topics");
  const retitled = await loadTopicPage("j-space", 1);
  assert.equal(retitled?.items[0]?.title, title, "the list");
  assert.equal(retitled?.topic.latest?.title, title, "the page headline");
  assert.equal((await listTopicSummaries()).topics.find((t) => t.slug === "j-space")?.latest?.title, title, "the directory headline");

  await overrideFields(corrected, { fields: { category: "tip" }, version: 1, reason: "实际是教程" }, "test-topics");
  const reclassified = await loadTopicPage("j-space", 1);
  assert.equal(reclassified?.items[0]?.id, corrected, "it remains a selected report");

  await overrideFields(corrected, { fields: { tags: ["教程/实践", "因果证据"] }, version: 2, reason: "更正研究方向" }, "test-topics");
  const moved = await loadTopicPage("j-space", 1);
  assert.deepEqual(moved?.items, [], "the old topic list drops it");
  assert.equal(moved?.topic.latest, null, "the old topic headline drops it");
  assert.equal((await listTopicSummaries()).topics.find((t) => t.slug === "j-space")?.latest, null, "the directory drops the old membership");
  assert.equal((await loadTopicPage("causal-evidence", 1, new Date()))?.items[0]?.id, corrected, "the corrected membership is retained");
});
