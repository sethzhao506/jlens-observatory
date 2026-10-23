// Manual public-source inspection only: no worker jobs, models, database writes or publication.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface ReadingItem { id: string; url: string }
interface Author { _id: string; displayName: string; slug: string }
interface SourceComment {
  _id: string; postId: string; parentCommentId: string | null; userId: string | null;
  postedAt: string | null; baseScore: number | null; voteCount: number | null;
  htmlBody: string | null; user: Author | null;
}
interface SourcePost {
  _id: string; title: string; slug: string; postedAt: string | null;
  baseScore: number | null; voteCount: number | null; commentCount: number; user: Author | null;
}
interface CandidateComment {
  id: string; commentId: string; postId: string; parentCommentId: string | null;
  author: Author | null; postedAt: string | null; baseScore: number | null; voteCount: number | null;
  originalUrl: string; checkedAt: string; contentHash: string; reviewStatus: "unreviewed_candidate";
}
interface CandidatePost {
  postId: string; readingListIds: string[]; originalUrl: string; checkedAt: string;
  status: "ok" | "partial" | "failed"; error: string | null; title: string | null;
  author: Author | null; postedAt: string | null; baseScore: number | null; voteCount: number | null;
  reportedCommentCount: number | null; retrievedCommentCount: number; rawResponseFile: string;
  comments: CandidateComment[];
}
interface Snapshot {
  schemaVersion: 1; checkedAt: string; endpoint: string; sorting: string;
  publicationStatus: "unreviewed_local_candidates"; modelCalls: 0; posts: CandidatePost[];
}

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dataRoot = resolve(root, ".data");
const endpoint = "https://www.lesswrong.com/graphql";
const args = process.argv.slice(2);
let itemId: string | null = null;
let output = ".data/discussion-candidates.json";
for (let index = 0; index < args.length; index++) {
  const flag = args[index];
  if (flag === "--help") {
    console.log("node modules/observatory/scripts/collect-discussions.ts [--item READING_LIST_ID] [--out .data/candidates.json]\nReads public LessWrong comments only for already-listed post URLs. Saves local unreviewed candidates and raw responses; does not publish or call models.");
    process.exit(0);
  }
  if ((flag !== "--item" && flag !== "--out") || !args[index + 1] || args[index + 1].startsWith("--")) {
    throw new Error(`Unknown or incomplete argument: ${flag}`);
  }
  if (flag === "--item") itemId = args[++index];
  else output = args[++index];
}
const outputPath = resolve(root, output);
const outputRelative = relative(dataRoot, outputPath);
if (!outputRelative || outputRelative.startsWith("..") || isAbsolute(outputRelative) || !outputPath.endsWith(".json")) {
  throw new Error("--out must be a JSON file inside this repository's ignored .data directory.");
}
const { items } = JSON.parse(await readFile(new URL("../../../industry/reading-list.json", import.meta.url), "utf8")) as { items: ReadingItem[] };
if (itemId && !items.some(item => item.id === itemId)) throw new Error(`Unknown reading-list item: ${itemId}`);
const targets = new Map<string, { readingListIds: string[]; originalUrl: string }>();
for (const item of items) {
  const url = new URL(item.url);
  const match = /^\/posts\/([A-Za-z0-9]+)(?:\/|$)/.exec(url.pathname);
  if (url.protocol !== "https:" || !["lesswrong.com", "www.lesswrong.com"].includes(url.hostname) || !match) continue;
  const postId = match[1];
  const target = targets.get(postId) ?? { readingListIds: [], originalUrl: `https://www.lesswrong.com${url.pathname}` };
  target.readingListIds.push(item.id);
  targets.set(postId, target);
}
const selected = [...targets].filter(([, target]) => !itemId || target.readingListIds.includes(itemId));
if (!selected.length) throw new Error("No matching LessWrong post URL in the reading list.");

let previous: Snapshot | null = null;
try { previous = JSON.parse(await readFile(outputPath, "utf8")) as Snapshot; }
catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
const posts = new Map((previous?.posts ?? []).map(post => [post.postId, post]));
const rawDirectory = outputPath.slice(0, -5) + ".raw";
await mkdir(rawDirectory, { recursive: true });
let failed = false;
for (const [postId, target] of selected) {
  const checkedAt = new Date().toISOString();
  const query = `{post(input:{selector:{_id:"${postId}"}}){result{_id title slug postedAt baseScore voteCount commentCount user{_id displayName slug}}} comments(input:{terms:{view:"postCommentsTop",postId:"${postId}",limit:1000}}){results{_id postId parentCommentId userId postedAt baseScore voteCount htmlBody user{_id displayName slug}}}}`;
  const rawPath = resolve(rawDirectory, `${postId}.json`);
  const candidate: CandidatePost = {
    postId, ...target, checkedAt, status: "failed", error: null, title: null,
    author: null, postedAt: null, baseScore: null, voteCount: null,
    reportedCommentCount: null, retrievedCommentCount: 0,
    rawResponseFile: relative(root, rawPath).replaceAll("\\", "/"), comments: [],
  };
  let responseText: string | null = null;
  let httpStatus: number | null = null;
  try {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "content-type": "application/json", "user-agent": "J-lens-Observatory-local-research/1.0" },
      body: JSON.stringify({ query }), signal: AbortSignal.timeout(30_000),
    });
    httpStatus = response.status;
    responseText = await response.text();
    if (!response.ok) throw new Error(`LessWrong returned HTTP ${response.status}`);
    const body = JSON.parse(responseText) as {
      errors?: Array<{ message: string }>;
      data?: { post?: { result: SourcePost | null }; comments?: { results: SourceComment[] } };
    };
    if (body.errors?.length) throw new Error(body.errors.map(error => error.message).join("; "));
    const post = body.data?.post?.result;
    const comments = body.data?.comments?.results;
    if (post?._id !== postId || !Array.isArray(comments) || comments.some(comment => comment.postId !== postId)) {
      throw new Error("Missing or mismatched post/comment identity in the source response.");
    }
    candidate.originalUrl = `https://www.lesswrong.com/posts/${postId}/${post.slug}`;
    candidate.title = post.title;
    candidate.author = post.user;
    candidate.postedAt = post.postedAt;
    candidate.baseScore = post.baseScore;
    candidate.voteCount = post.voteCount;
    candidate.reportedCommentCount = post.commentCount;
    candidate.comments = [...new Map(comments.map(comment => [comment._id, {
      id: `lw-comment-${comment._id}`, commentId: comment._id, postId,
      parentCommentId: comment.parentCommentId, author: comment.user, postedAt: comment.postedAt,
      baseScore: comment.baseScore, voteCount: comment.voteCount,
      originalUrl: `${candidate.originalUrl}?commentId=${comment._id}`, checkedAt,
      contentHash: createHash("sha256").update(comment.htmlBody ?? "").digest("hex"),
      reviewStatus: "unreviewed_candidate" as const,
    }])).values()];
    candidate.retrievedCommentCount = candidate.comments.length;
    candidate.status = candidate.retrievedCommentCount === post.commentCount ? "ok" : "partial";
    if (candidate.status === "partial") candidate.error = "Returned comments do not reconcile with the source post's commentCount; do not assume complete coverage.";
  } catch (error) {
    candidate.error = error instanceof Error ? error.message : String(error);
  }
  failed ||= candidate.status !== "ok";
  // These are real consecutive snapshots, not reconstructed publication history.
  try { await copyFile(rawPath, rawPath + ".previous.json"); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  await writeFile(rawPath, JSON.stringify({ endpoint, query, checkedAt, httpStatus, responseText, error: candidate.error }, null, 2) + "\n");
  posts.set(postId, candidate);
  console.log(`${postId}: ${candidate.status}; ${candidate.retrievedCommentCount} comments; ${candidate.error ?? "unreviewed candidates only"}`);
}
const snapshot: Snapshot = {
  schemaVersion: 1, checkedAt: new Date().toISOString(), endpoint, sorting: "postCommentsTop; limit 1000 per post; no score threshold",
  publicationStatus: "unreviewed_local_candidates", modelCalls: 0, posts: [...posts.values()],
};
await mkdir(dirname(outputPath), { recursive: true });
if (previous) await copyFile(outputPath, outputPath + ".previous.json");
await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Saved ${snapshot.posts.length} distinct posts to ${relative(root, outputPath)}; no public content was changed.`);
if (failed) process.exitCode = 1;
