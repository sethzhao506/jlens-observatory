// Import the site's already-published reading index through the existing material and publication paths.
// No collection, model request, score generation or full-text republication is involved.
import { readFileSync } from "node:fs";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { publishArticle } from "@aihot/backend/publication/publish";
import { contentChain, overrideFields } from "@aihot/backend/admin/content";

interface ReadingItem {
  id: string; sourceId: string; url: string; originalTitle: string; title: string; author: string;
  publishedAt: string | null; category: string; tags: string[]; summary: string; reason: string;
  selected?: boolean;
  discovery?: { relation: string; rootWork: string; locator: string; proofUrl: string; inspectedOn: string };
  workId?: string;
  version?: string;
  versionUpdatedAt?: string | null;
  relatedPublications?: Array<{ url: string; title: string; publishedAt: string | null; kind: string }>;
}

const { items } = JSON.parse(readFileSync(new URL("../industry/reading-list.json", import.meta.url), "utf8")) as { items: ReadingItem[] };
try {
  for (const item of items) {
    const result = await upsertMaterial({
      id: item.id, sourceId: item.sourceId, url: item.url, title: item.originalTitle, author: item.author,
      language: "en", publishedAt: item.publishedAt ? new Date(item.publishedAt.length === 10 ? `${item.publishedAt}T00:00:00Z` : item.publishedAt) : null,
      sourceUpdatedAt: item.versionUpdatedAt ? new Date(item.versionUpdatedAt) : null,
      publicationTime: item.publishedAt, excerpt: item.summary, bodyStatus: "none", via: "import",
      backfill: "reading-index-import", raw: { origin: item.discovery ? "primary-source-reading-index" : "existing-jlens-guide", independentReplication: false,
        ...(item.discovery ? { discovery: item.discovery, workId: item.workId ?? null, version: item.version ?? null,
          versionUpdatedAt: item.versionUpdatedAt ?? null, relatedPublications: item.relatedPublications ?? [] } : {}) },
    });
    if (!result.created) {
      console.log(`kept existing ${result.articleId}`);
      continue;
    }
    await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, tags, title_zh, summary_zh, selected, output)
      VALUES (${result.articleId}, 1, 'replay', 'pass', ${item.category}, ${item.tags}, ${item.title}, ${item.summary}, false,
        ${sql.json({ origin: item.discovery ? "primary-source-reading-index" : "existing-jlens-guide", scope: "reading_index", independentReplication: false,
          ...(item.discovery ? { discovery: item.discovery } : {}) })})`;
    const importedAt = new Date();
    await publishArticle(result.articleId, { releasedAt: importedAt });
    const chain = await contentChain(result.articleId);
    await overrideFields(result.articleId, {
      fields: { selected: item.selected === true, score: null, reason: item.reason },
      version: chain?.override?.version ?? 0, reason: item.selected === true
        ? "人工选录为精选的研究阅读资料；不生成模型评分。"
        : "扩展相关研究资料索引；不自动进入精选，不生成模型评分。",
    }, "reading-index-import");
    console.log(`imported ${result.articleId}`);
  }
} finally {
  await closeDb();
}
