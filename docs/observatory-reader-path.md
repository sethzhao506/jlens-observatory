# J-lens Observatory: reader path

Local development, 2026-10-22 (America/Los_Angeles). The original AIHOT layout and colors are retained. The reader navigation now focuses on continuously updated research discussions, with research tools inside that existing layout.

## Navigation and implementation

| Entry | Final behavior |
|---|---|
| `/`, `/all`, `/topics` | Selected research discussions, all updates, topics and search remain the main content entries. Source history is retained. |
| `/hot`, `/daily`, `/starred` | Removed from navigation. Hidden report pages, including weekly/monthly/archive, and bookmarks redirect to `/all`; old hot URLs remain readable for compatibility. The original records and machine interfaces are retained. |
| `/understand`, `/explore` | Added under the research sidebar group, with one research tab on phones. |
| `/try`, `/investigate` | Linked from research evidence and the existing More tools. |
| `/research-updates` | Redirects to `/all`, preserving query parameters; it is not a separate reader feed. |
| `/evidence`, `/branches/:branch` | Alternate ways into the research graph. |

Research pages default to English and support `?lang=zh`; research links preserve the selection. The original framework navigation and utility interface remain Chinese. The phone tab bar has Selected, Research and More. Bookmark buttons are removed from feeds, item details and phone reader tools; existing local bookmarks are preserved. There is no separate Observatory homepage, global header, footer or color theme.

`modules/observatory/` reuses the framework's existing module registration and site shell. No module-home or shell-replacement framework hooks remain. The only added framework read interface exposes the curated static research document through `packages/backend/src/publication/modules.ts`; SSR reads it over HTTP. No new database tables or paid request path are introduced.

## Complete example

`/understand` → `/explore?view=evidence&node=ouro-target` → pinned original source and reported curve → `/try` → `/investigate` → browser-local versions and JSON/Markdown export → hypothesis graph.

The graph starts with seven core sources and retains five research branches. Typed links distinguish citations, method adaptation, evaluation, challenges, editorial associations, evidence support and actual hypothesis revisions. Source publication, version update, first discovery, machine inspection and human review are separate fields; missing records remain visible.

The graph reads from left to right. Column placement is an editorial reading order, not proof of chronological or scientific inheritance. Exact relationship directions and source locators remain inspectable. Secondary relations, detailed source records, the full evidence card and history limitations are available on demand; the first view emphasizes the research path. The three branches with coverage gaps remain accessible without taking over the main view. News, discussions and original site navigation are retained.

The Ouro check recomputes reported aggregates. It neither runs a model nor produces a confidence interval from missing sample-level data. Scores from incompatible estimator families cannot be combined. Personal proposals remain unreviewed and unrun, save immutable browser-local snapshots with actual parents, and export sources, evidence and ancestry. They do not publish into shared reviewed content or grant compute resources. Imported prototype history is distinguished from personal versions and experimental results.

See [research-provenance.md](research-provenance.md) for reused materials, source versions and scientific boundaries.

## Sources and research updates

`industry/sources.json` contains 34 records: 30 manual external attributions, two paused LessWrong RSS drafts and two paused X searches. The reading catalog now has 30 materials (28 dated, two with unknown publication dates), after adding ten directly citing papers and six author reports. The U-Space paper and its LessWrong explanation are linked as the same work. New materials are not automatically selected. Attribution records are not continuous subscriptions. The user chose to skip X; no X credential request or collection activation is part of this work. Collection, model calls, pushes and IndexNow remain off.

The all-updates page now links to the guide's collapsed `#search-coverage` section using the module's existing `root.Top` slot. This exposes the actual search scope, unknown worldwide citation count, the ten checked references and undated material links. No new API, framework slot or graph relation is introduced. See `citation-search-2026-10-22.md` for the source audit.

The existing feeds and discussions remain prominent. Their metadata identifies the hosting platform (such as LessWrong, X, GitHub or arXiv), preserves source attribution, and links to the original. Platform classification uses the actual original URL host and is not a quality or verification label. This is an additive first-party site projection; the public v1 schema is unchanged. Category descriptions, topic tags and prompts focus on J-lens, readout methods and looped LM/Ouro; generic marketing, finance and personnel news are outside the intended collection scope. Category IDs, scoring dimensions, weights and thresholds are preserved. Existing research records and correction history are retained.

`REPORTS.enabled=false` separately disables automatic daily/weekly/monthly composition and missing-edition alerts. On worker startup, the existing retired-schedule cleanup removes the old composition queue and waiting jobs while retaining report and job history. The upstream sample launch announcement was removed rather than presenting it as an Observatory publication record.

The public AISafetyHot Hub was cloned for inspection, at the commit recorded in `aisafetyhot-reference-plan.md`. It contains public archives and external Agent/MCP documentation, not the website template or crawler implementation. Only its source-attribution convention is adapted; no noncommercial content, branding or assets were copied.

`/api/v1/research-updates` provides candidate editorial associations for relevant public materials in its seven-day window; it does not replace the original feeds or confirm scientific relationships. A successful fetch, a citation, evidence support and independent verification remain distinct.

## Verification and next steps

After the citation expansion, typecheck/build, 16 module checks and six browser checks passed. Live data confirms 30 catalogued materials, 28 dated updates and the original 12 selected items. All 16 additions remain non-selected, repeat imports add no duplicates, ten citing-paper detail pages resolve, and the U-Space companion points to the existing paper identity. No worldwide citation total or automatic-collection success is inferred from these counts.

After source attribution and tracking-navigation changes, build/typecheck and five browser acceptance checks passed. These cover LessWrong and synthetic-X attribution, original links, the three-tab phone layout, hidden bookmark controls, report URL redirects and the complete research/proposal path. The live site was checked on nine desktop/phone pages without page errors or whole-page overflow. Publication regression (25), report scheduling/alerts (19), and page metadata (10) checks also passed.

Build and typecheck passed, as did 16 module tests, 51 targeted backend tests and four browser checks for the restored original layout. After the left-to-right graph update, typecheck/build and all four browser checks passed again, including collapsed relationships, the original citation directions, grouped relationship selection and proposal exports. Read-only checks of the live English/Chinese graph, evidence path and phone list found no page errors or whole-page horizontal overflow. The full native Windows suites have not all passed: observed limits include SIGTERM child processes, `pg_dump`/`tar`/OpenSSL prerequisites and browser cache availability. Earlier prototype or superseded-layout results do not establish acceptance of the final site.

Next: review the first claim and relations, manually preview a small source batch and verify deduplication twice. A real reference reproduction still needs pinned data/environment, expected outputs, tolerances and resources before testing the new hypothesis. Actual reviewed history is required before time-point comparisons or replay.
