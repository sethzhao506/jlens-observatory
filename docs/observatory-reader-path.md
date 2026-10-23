# J-lens Observatory: reader path

Local development, 2026-10-22 (America/Los_Angeles). The original AIHOT layout and colors are retained. The research graph is the main research entry, alongside the existing discussion feed and research tools inside that layout.

## Navigation and implementation

| Entry | Final behavior |
|---|---|
| `/`, `/all`, `/topics` | Selected research discussions, all updates, topics and search remain the main content entries. Source history is retained. |
| `/hot`, `/daily`, `/starred` | Removed from navigation. Hidden report pages, including weekly/monthly/archive, and bookmarks redirect to `/all`; old hot URLs remain readable for compatibility. The original records and machine interfaces are retained. |
| `/explore` | The sole research sidebar entry, with bilingual node briefs and direct original-source links, an expandable catalog and discussion viewpoints; one research tab on phones. |
| `/understand` | The separate guide entry is removed. Returns 302 to `/explore` with query parameters preserved; the browser inherits an existing fragment. Historical bilingual guide assets are retained without a separate page. |
| `/try`, `/investigate` | Linked from research evidence and the existing More tools. |
| `/research-updates` | Redirects to `/all`, preserving query parameters; it is not a separate reader feed. |
| `/evidence`, `/branches/:branch` | Alternate ways into the research graph. |

Research pages default to English and support `?lang=zh`; research links preserve the selection. The original framework navigation and utility interface remain Chinese. The phone tab bar has Selected, Research and More. Bookmark buttons are removed from feeds, item details and phone reader tools; existing local bookmarks are preserved. There is no separate Observatory homepage, global header, footer or color theme.

`modules/observatory/` reuses the framework's existing module registration and site shell. No module-home or shell-replacement framework hooks remain. The framework read interface exposes the curated research document through `packages/backend/src/publication/modules.ts`; SSR reads it over HTTP. The module supplies `/api/v1/observatory` and the material-scoped `/api/v1/research-discussions?item=ID` HTTP endpoint through that publication boundary. No new database tables or paid request path are introduced.

## Complete example

`/explore` → node brief and original source → technical viewpoints and the bounded claim in `/explore?view=evidence&node=ouro-target` → reported curve → `/try` → `/investigate` → browser-local versions and JSON/Markdown export → hypothesis graph.

The graph starts with seven core sources and retains five research branches. It can expand a 36-material index and 12 technical viewpoints. Briefs sit in graph nodes and link directly to original sources; the historical long guide is not a separate reader entry. Typed links distinguish citations, method adaptation, evaluation, challenges, editorial associations, evidence support and actual hypothesis revisions. Source publication, version update, first discovery, machine inspection and human review are separate fields; missing records remain visible.

The graph reads from left to right. Column placement is an editorial reading order, not proof of chronological or scientific inheritance. Exact relationship directions and source locators remain inspectable. Secondary relations, detailed source records, the full evidence card and history limitations are available on demand; the first view emphasizes the research path. The three branches with coverage gaps remain accessible without taking over the main view. News, discussions and original site navigation are retained.

The Ouro check recomputes reported aggregates. It neither runs a model nor produces a confidence interval from missing sample-level data. Scores from incompatible estimator families cannot be combined. Personal proposals remain unreviewed and unrun, save immutable browser-local snapshots with actual parents, and export sources, evidence and ancestry. They do not publish into shared reviewed content or grant compute resources. Imported prototype history is distinguished from personal versions and experimental results.

See [research-provenance.md](research-provenance.md) for reused materials, source versions and scientific boundaries.

## Sources and research updates

`industry/sources.json` contains 40 records: 36 manual external attributions, two paused LessWrong RSS drafts and two paused X searches. The catalog now has 36 materials (34 dated and two legacy entries without publication dates), after the earlier ten citing papers and six author reports, then six additional arXiv papers in this pass. The U-Space paper and its LessWrong explanation are linked as the same work. New materials are not automatically selected. Attribution records are not continuous subscriptions. The user chose to skip X; no X credential request or collection activation is part of this work. Automatic collection, model calls, pushes and IndexNow remain off. The separate manual public-comment inspection writes local candidates only.

The all-updates page links to the graph's collapsed `/explore#search-coverage` section using the existing `root.Top` slot. It exposes actual search scope, the unknown worldwide citation count, checked references and legacy undated entries. See [the earlier citation audit](citation-search-2026-10-22.md) and [the current literature audit](graph-literature-audit-2026-10-22.md). The current 28 source-located citation/method records yield 27 additional catalog relations after normalization removes one duplicate. All remain machine-inspected and pending human review, without Observatory replication. No citation is promoted automatically to evidence support.

Public comment inspection covered 16 posts and 30 comments, selecting 12 concrete viewpoints. Actual author, score/voteCount, publication/collection dates, original permalink and reply parent are retained. The same note ID appears in its original material's details and in the graph. Comments on supplementary threads retain their actual parent post; editorial cross-links do not make them comments on the linked J-lens article. Neel Nanda's WorkspaceBench reply is a scope clarification, not causal validation. See [the discussion audit](graph-discussion-audit-2026-10-22.md).

A small lazy `itemPage` extension follows the existing module-loading pattern and reads `/api/v1/research-discussions?item=ID` over HTTP and shows the relevant inspected snapshot. Not checked, checked without selected viewpoints, source failures and endpoint failures are visible rather than replaced with invented commentary.

The existing feeds and discussions remain prominent. Their metadata identifies the hosting platform (such as LessWrong, X, GitHub or arXiv), preserves source attribution, and links to the original. Platform classification uses the actual original URL host and is not a quality or verification label. This is an additive first-party site projection; the public v1 schema is unchanged. Category descriptions, topic tags and prompts focus on J-lens, readout methods and looped LM/Ouro; generic marketing, finance and personnel news are outside the intended collection scope. Category IDs, scoring dimensions, weights and thresholds are preserved. Existing research records and correction history are retained.

`REPORTS.enabled=false` separately disables automatic daily/weekly/monthly composition and missing-edition alerts. On worker startup, the existing retired-schedule cleanup removes the old composition queue and waiting jobs while retaining report and job history. The upstream sample launch announcement was removed rather than presenting it as an Observatory publication record.

The public AISafetyHot Hub was cloned for inspection, at the commit recorded in `aisafetyhot-reference-plan.md`. It contains public archives and external Agent/MCP documentation, not the website template or crawler implementation. Only its source-attribution convention is adapted; no noncommercial content, branding or assets were copied.

`/api/v1/research-updates` provides candidate editorial associations for relevant public materials in its seven-day window; it does not replace the original feeds or confirm scientific relationships. A successful fetch, a citation, evidence support and independent verification remain distinct.

## Verification and next steps

Current narrow checks: the manual collector fetched WorkspaceBench twice, retaining one post and two distinct stable comment IDs, preserving the previous actual snapshot and making zero model calls. Module type checking passed after adding the collector. This update passed full typecheck, the web build, 21 module checks and ten browser acceptance checks. The latter cover progressive catalog expansion, paper source/relationship inspection, real Neel Nanda and parent-comment context, bilingual controls, visible 503 failures with retry, unknown versus checked-without-selection states, and the Try/proposal export path. Desktop and phone viewports had no whole-page overflow. Additional live-site checks confirmed 36 materials, 34 dated updates and 12 viewpoints; all six new papers remain non-selected without model scores. The legacy guide redirects with query/hash intact, the selected discussion node is visible, and page errors were zero. Public-page and machine-output smoke checks passed except the documented local development-login 302 versus 200 expectation.

The following are **historical validation results from earlier site revisions**, not acceptance of this final update:

After the citation expansion, typecheck/build, 16 module checks and six browser checks passed. That earlier live-data snapshot confirmed 30 catalogued materials, 28 dated updates and the original 12 selected items. All 16 additions remain non-selected, repeat imports add no duplicates, ten citing-paper detail pages resolve, and the U-Space companion points to the existing paper identity. No worldwide citation total or automatic-collection success is inferred from these counts.

After source attribution and tracking-navigation changes, build/typecheck and five browser acceptance checks passed. These cover LessWrong and synthetic-X attribution, original links, the three-tab phone layout, hidden bookmark controls, report URL redirects and the complete research/proposal path. The live site was checked on nine desktop/phone pages without page errors or whole-page overflow. Publication regression (25), report scheduling/alerts (19), and page metadata (10) checks also passed.

Build and typecheck passed, as did 16 module tests, 51 targeted backend tests and four browser checks for the restored original layout. After the left-to-right graph update, typecheck/build and all four browser checks passed again, including collapsed relationships, the original citation directions, grouped relationship selection and proposal exports. Read-only checks of the live English/Chinese graph, evidence path and phone list found no page errors or whole-page horizontal overflow. The full native Windows suites have not all passed: observed limits include SIGTERM child processes, `pg_dump`/`tar`/OpenSSL prerequisites and browser cache availability. Earlier prototype or superseded-layout results do not establish acceptance of the final site.

Next: human-review the graph briefs, source-located relations and selected technical viewpoints, then inspect the experimental artifacts linked from comment reports. Expand candidate snapshots through `node modules/observatory/scripts/collect-discussions.ts --item jlens-bench --out .data/discussion-candidates.json`. This manual command only accepts listed LessWrong post URLs and writes ignored local candidates/raw responses with stable IDs and a real previous snapshot; it does not publish, call models or create a schedule. WorkspaceBench deduplication has already been checked twice. A real reference reproduction still needs pinned data/environment, expected outputs, tolerances and resources before testing the new hypothesis. Actual reviewed history is required before time-point comparisons or replay.
