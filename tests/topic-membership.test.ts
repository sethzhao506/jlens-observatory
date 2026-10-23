// Failure cases: a single-topic count disagrees with the membership list; a null company pattern
// still depends on titles; a title match bypasses required tags; one subject differs from several;
// an original-title or case-insensitive match is lost; a company name matches inside another word;
// non-selected, withdrawn and unreleased reports change the selected list or pool count incorrectly.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { findTopic, loadTopicPage, topicMembership, type Topic } from "@aihot/backend/publication/topics";

after(closeDb);

test("topic lists and pool counts share the exact membership predicate", async () => {
  const prefix = `membership-${tag()}`;
  const at = new Date("2026-01-01T00:00:00Z");
  const now = new Date(+at + 1000);
  // Company matching remains an engine behavior even though this site's directory uses research tags.
  const companies: Topic[] = [{ slug: "code", entityId: "anthropic" }, { slug: "opinions", entityId: "meta" }].map(({ slug, entityId }): Topic => ({
    ...findTopic(slug)!, name: entityId, group: "company", entityId,
    tags: [`entity:${entityId}`], pattern: `(?<![A-Za-z])${entityId}(?![A-Za-z])`, aliases: [],
  }));
  const directions = ["j-lens", "readout-methods", "j-space"].map(slug => findTopic(slug)!);
  const cases = [
    { title: "", original: null, tags: ["J-lens"], topics: ["j-lens", "readout-methods"] },
    { title: "Anthropic J-lens", original: null, tags: [], topics: [] },
    { title: "Readout comparison", original: null, tags: ["R-lens"], topics: ["readout-methods"] },
    { title: "Vocabulary controls", original: null, tags: ["J-space"], topics: ["j-space"] },
    { title: "", original: null, tags: ["entity:anthropic"], topics: ["code"] },
    { title: "Unrelated", original: null, tags: ["entity:anthropic", "entity:openai"], topics: [] },
    { title: "Unrelated", original: "ANTHROPIC launches a model", tags: ["entity:anthropic", "entity:openai"], topics: ["code"] },
    { title: "Metadata", original: null, tags: ["entity:meta", "entity:openai"], topics: [] },
    { title: "发布Meta的新模型", original: null, tags: ["entity:meta", "entity:openai"], topics: ["opinions"] },
    { title: "Unselected", original: null, tags: ["J-lens", "entity:anthropic"], topics: ["j-lens", "readout-methods", "code"], selected: false },
    { title: "Withdrawn", original: null, tags: ["J-lens", "entity:anthropic"], topics: ["j-lens", "readout-methods", "code"], visibility: "withdrawn" },
    { title: "Future", original: null, tags: ["J-lens", "entity:anthropic"], topics: ["j-lens", "readout-methods", "code"], future: true },
  ];
  await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${prefix}, ${prefix}, 'rss', 'T1')`;
  for (const [i, row] of cases.entries()) {
    const id = `${prefix}-${i}`;
    await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
      VALUES (${id}, ${prefix}, ${id}, ${`https://example.org/${id}`}, ${row.title}, ${at}, ${at})`;
    await sql`INSERT INTO publications (article_id, source_id, title, original_title, url, discovered_at, timeline_at,
      sort_at, visible_after, selected, eligible, visibility, channel, tags)
      VALUES (${id}, ${prefix}, ${row.title}, ${row.original}, ${`https://example.org/${id}`}, ${at}, ${at},
        ${at}, ${row.future ? new Date(+now + 1) : at}, ${row.selected ?? true}, true, ${row.visibility ?? "public"}, 'news', ${row.tags})`;
  }
  const topics = [...companies, ...directions];
  const membership = new Map((await sql<{ id: string; topics: string[] }[]>`
    SELECT p.article_id AS id, ${topicMembership(topics)} AS topics FROM publications p WHERE p.source_id = ${prefix}`)
    .map(row => [row.id, row.topics]));
  for (const [i, row] of cases.entries()) assert.deepEqual(new Set(membership.get(`${prefix}-${i}`)), new Set(row.topics));
  for (const topic of directions) {
    const page = await loadTopicPage(topic.slug, 1, now);
    assert.ok(page);
    const visible = cases.map((row, i) => ({ ...row, id: `${prefix}-${i}` }))
      .filter(row => row.topics.includes(topic.slug) && !row.visibility && !row.future);
    assert.equal(page.topic.poolTotal, visible.length, `${topic.slug} pool`);
    assert.deepEqual(page.items.map(row => row.id).sort(), visible.filter(row => row.selected !== false).map(row => row.id).sort(), `${topic.slug} selected`);
  }
});
