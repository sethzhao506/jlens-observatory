// Topic pages: which articles a topic takes, and their counts.
// Written before the code, from the ways it can go wrong:
// - a technical-direction topic takes a report that only names it in the title, or stops taking its
//   tags; a branch accepting several method tags misses one; overlapping branches leak unrelated tags;
// - withdrawn or not yet released articles appear in a list or a count;
// - an article or story page names a topic its reports do not belong to;
// - a topic without content has no page, or an unknown slug or a page past the end has one.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticle } from "@aihot/backend/publication/publish";
import { TOPICS, loadTopicPage, listTopicSummaries, topicsOfStory } from "@aihot/backend/publication/topics";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const OFFICIAL = `test-topics-official-${T}`;
const MEDIA = `test-topics-media-${T}`;
const app = await buildApp();

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, first_party, next_fetch_at) VALUES
    (${OFFICIAL}, 'Official', 'rss', 'T1', 'editorial', true, '2100-01-01'),
    (${MEDIA}, 'Media', 'rss', 'T2', 'editorial', false, '2100-01-01')`;
});
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

let n = 0;
interface Report {
  source?: string;
  at: Date;
  title: string;
  originalTitle?: string;
  subjects?: string[];
  tags?: string[];
  score?: number;
  selected?: boolean;
  fact?: number;
  category?: string;
}

/** A published report; `fact` links it to a fact before publishing, as grouping would. */
async function report(r: Report): Promise<string> {
  n += 1;
  const { articleId } = await upsertMaterial({
    sourceId: r.source ?? MEDIA, url: `https://example.com/topics-${T}-${n}`, title: r.originalTitle ?? r.title, bodyText: "body", bodyHtml: "<p>body</p>", bodyStatus: "ok", via: "fetch", publishedAt: r.at,
  });
  await sql`UPDATE articles SET discovered_at = ${r.at}, timeline_at = ${r.at}, grouped_at = now() WHERE id = ${articleId}`;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected, subjects, tags)
            VALUES (${articleId}, 1, 'rule', 'pass', ${r.category ?? "ai-models"}, ${r.title}, ${`摘要 ${n}`}, ${r.score ?? 80}, ${r.selected ?? true}, ${r.subjects ?? []}, ${[r.category === "ai-products" ? "产品更新" : r.category === "paper" ? "论文/研究" : r.category === "tip" ? "教程/实践" : r.category === "industry" ? "行业动态" : r.category === "opinion" ? "大佬观点" : "模型发布", ...(r.tags ?? [])]})`;
  if (r.fact) await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${r.fact}, ${articleId}, 'report')`;
  await publishArticle(articleId, { releasedAt: new Date(r.at.getTime() + 60_000) });
  return articleId;
}

async function story(title: string): Promise<{ id: number; publicId: string }> {
  const publicId = randomUUID();
  const [s] = await sql<{ id: number }[]>`INSERT INTO stories (public_id, title, first_report_at, latest_at) VALUES (${publicId}, ${title}, now(), now()) RETURNING id`;
  return { id: s!.id, publicId };
}

async function fact(storyId: number | null, title: string): Promise<number> {
  const [f] = await sql<{ id: number }[]>`INSERT INTO facts (public_id, story_id, title) VALUES (${`f-${T}-${randomUUID()}`}, ${storyId}, ${title}) RETURNING id`;
  return f!.id;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const ids = (items: Array<{ id: string }>) => items.map((i) => i.id);
const page = async (slug: string, p = 1) => {
  const data = await loadTopicPage(slug, p, new Date());
  assert.ok(data, `${slug} page ${p}`);
  return data;
};
/** Every article of a topic, over all its pages. */
async function members(slug: string): Promise<string[]> {
  const first = await page(slug);
  const out = ids(first.items);
  for (let p = 2; p <= first.pageCount; p++) out.push(...ids((await page(slug, p)).items));
  return out;
}

test("research topics take their tags rather than incidental title or company mentions", async () => {
  const about = await report({ at: hoursAgo(30), title: `J-lens 方法比较 ${T}`, tags: ["J-lens"], category: "paper" });
  const related = await report({ at: hoursAgo(31), title: `R-lens 比较设置 ${T}`, tags: ["R-lens"], category: "paper" });
  const shared = await report({ at: hoursAgo(32), title: `读出方法比较 ${T}`, tags: ["J-lens", "R-lens"], category: "paper" });
  const caseStudy = await report({ at: hoursAgo(33), title: `Ouro 出口设置 ${T}`, tags: ["Ouro", "looped LM"], category: "paper" });
  const architecture = await report({ at: hoursAgo(34), title: `循环模型设置 ${T}`, tags: ["looped LM"], category: "paper" });
  const company = await report({ at: hoursAgo(35), title: `J-lens 被新闻提到 ${T}`, subjects: ["openai"], category: "paper" });
  const original = await report({ at: hoursAgo(36), title: `其他研究 ${T}`, originalTitle: `J-lens and Ouro mentioned ${T}`, category: "paper" });
  const causal = await report({ at: hoursAgo(37), title: `干预实验 ${T}`, tags: ["因果证据"], category: "paper" });

  const jlens = await members("j-lens");
  for (const id of [about, shared]) assert.ok(jlens.includes(id), "the method tag is included");
  for (const id of [related, caseStudy, company, original]) assert.ok(!jlens.includes(id), "other tags and title mentions do not imply membership");
  const readout = await members("readout-methods");
  for (const id of [about, related, shared]) assert.ok(readout.includes(id), "a branch accepts each of its method tags");
  for (const id of [caseStudy, architecture, causal]) assert.ok(!readout.includes(id), "a different branch stays separate");
  const modelArchitecture = await members("model-architecture");
  for (const id of [caseStudy, architecture]) assert.ok(modelArchitecture.includes(id), "the architecture branch accepts case and architecture tags");
  assert.ok(!(await members("ouro")).includes(architecture), "the broad architecture tag does not identify the Ouro case");
  assert.ok((await members("causal-evidence")).includes(causal), "another research direction takes its tag");

  // The article page names the topics it belongs to.
  const topicsOf = async (id: string) => {
    const res = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
    return (JSON.parse(res.body) as { topics: Array<{ slug: string }> }).topics.map((t) => t.slug);
  };
  assert.deepEqual(await topicsOf(about), ["j-lens", "readout-methods", "papers"]);
  assert.deepEqual(await topicsOf(caseStudy), ["ouro", "model-architecture", "papers"]);
  assert.deepEqual(await topicsOf(company), ["papers"]);
  assert.deepEqual(await topicsOf(causal), ["causal-evidence", "papers"]);
});

test("a story page names the topics of its reports", async () => {
  const launch = await story(`J-lens 比较设置更新 ${T}`);
  await report({ source: OFFICIAL, at: hoursAgo(26), title: `J-lens 比较设置更新 ${T}`, tags: ["J-lens"], category: "paper", fact: await fact(launch.id, "更新比较设置") });
  assert.deepEqual(await topicsOfStory(launch.id), [{ slug: "j-lens", name: "J-lens" }, { slug: "readout-methods", name: "Readout methods" }, { slug: "papers", name: "Papers & reports" }]);
});

test("withdrawn articles stay out of lists and counts", async () => {
  const kept = await report({ at: hoursAgo(5), title: `J-space 研究更新 ${T}`, tags: ["J-space"], category: "paper" });
  const withdrawn = await report({ at: hoursAgo(4), title: `J-space 撤回的消息 ${T}`, tags: ["J-space"], category: "paper" });
  await sql`UPDATE publications SET visibility = 'withdrawn' WHERE article_id = ${withdrawn}`;

  const data = await page("j-space");
  assert.deepEqual(ids(data.items), [kept]);
  assert.equal(data.topic.total, 1);
  const summary = (await listTopicSummaries()).topics.find((t) => t.slug === "j-space")!;
  assert.equal(summary.latest?.title, `J-space 研究更新 ${T}`, "the index shows the newest public article");
});

test("every topic has a page; unknown topics and pages past the end have none", async () => {
  const empty = await page("code");
  assert.equal(empty.topic.indexable, false, "a topic without content is not indexed");
  assert.deepEqual(empty.items, []);
  assert.equal(await loadTopicPage("not-a-topic", 1, new Date()), null);
  assert.equal(await loadTopicPage("code", 2, new Date()), null);
  const index = await app.inject({ method: "GET", url: "/api/site/topics" });
  const body = JSON.parse(index.body) as { groups: Array<{ key: string }>; topics: Array<{ slug: string }> };
  assert.deepEqual(body.groups.map((g) => g.key), ["field", "genre"]);
  assert.deepEqual(body.topics.map((t) => t.slug).sort(), TOPICS.map((t) => t.slug).sort(), "the index lists every topic");
});
