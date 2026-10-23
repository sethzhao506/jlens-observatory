export interface ResearchEntry {
  id: string;
  itemId: string;
  workId: string | null;
  label: string[];
  title: string[];
  brief: string[];
  limitation: string[];
  kind: "paper" | "blog" | "code";
  branchIds: string[];
  author: string | null;
  url: string;
  sourceUrl: string;
  publishedAt: string | null;
  version: string | null;
  versionUpdatedAt: string | null;
  checkedAt: string | null;
  locator: string;
  coreSourceId: string | null;
  directCitation: { targetId: string; proofUrl: string; locator: string } | null;
  relatedPublications: Array<{ url: string; title?: string; publishedAt: string | null; kind: string }>;
}

export interface DiscussionNote {
  id: string;
  platform: string;
  postId: string;
  postTitle: string;
  postUrl: string;
  commentId: string;
  originalUrl: string;
  parentCommentId: string | null;
  parentCommentUrl: string | null;
  author: { displayName: string; slug: string | null };
  postedAt: string | null;
  baseScore: number | null;
  voteCount: number | null;
  checkedAt: string;
  readingListIds: string[];
  relatedItemIds: string[];
  graphSourceIds: string[];
  viewpointType: string;
  summary: string[];
  limitation: string[];
  reviewStatus: string;
  humanReviewedAt: string | null;
  scientificStatus: string;
  relationType: string;
}

export interface DiscussionPost {
  postId: string;
  originalUrl: string;
  title: string;
  readingListIds: string[];
  checkedAt: string;
  status: string;
  reportedCommentCount: number | null;
  retrievedCommentCount: number;
  countsReconciled: boolean;
  selectedNoteIds: string[];
  selectionStatus: string;
}

export interface DiscussionDocument {
  checkedAt: string;
  selectionPolicy: string[];
  posts: DiscussionPost[];
  notes: DiscussionNote[];
}

interface ResearchIdentifiers {
  sources: Array<{ id: string; url: string }>;
  researchCatalog: ResearchEntry[];
  discussions: { notes: DiscussionNote[] };
}

/** Catalog records and imported comments may be alternate identifiers for an existing core node. */
export function researchNodeId(document: ResearchIdentifiers, id: string): string {
  const entry = document.researchCatalog.find((entry) => entry.id === id);
  if (entry?.coreSourceId) return entry.coreSourceId;
  const note = document.discussions.notes.find((note) => note.id === id);
  return note ? document.sources.find((source) => source.url === note.originalUrl)?.id ?? id : id;
}

export function discussionForItem(document: DiscussionDocument, itemId: string) {
  const posts = document.posts.filter((post) => post.readingListIds.includes(itemId));
  // Only comments on this material appear below it. Editorial cross-links stay in the graph.
  const notes = document.notes.filter((note) => note.readingListIds.includes(itemId));
  return { itemId, posts, notes, status: posts.length ? "checked_snapshot" : "not_checked", selectionPolicy: document.selectionPolicy };
}
