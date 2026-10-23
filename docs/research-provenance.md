# J-lens reader-path research provenance

This record describes the initial Research Observatory dataset, not an independent replication. The public file is `modules/observatory/data/observatory.json`. Machine inspection occurred on 22 October 2026 in the user's America/Los_Angeles time zone; exact UTC inspection times are retained in the dataset. No human review is recorded.

## Reused material

The read-only `sethzhao506.github.io` personal-site checkout was available alongside this repository. The following relevant assets were inspected and reused:

- `_guide_sources/jlens/README.md`, `AGENTS.md`, `about-guide.md` and `agent-design.md`: scope, scientific boundaries and the existing workflow.
- `guides/jlens/article.md`, `article.zh.md`, `evidence.json` and `evidence.zh.json`: bilingual explanation and source descriptions.
- `guides/jlens/relations-data.json`, `roadmap-data.json` and `roadmap-design-notes.md`: five branches and the distinction between scholarly relationships and editorial reading routes.
- `guides/jlens/discovery-data.json`, `discovery-core.js` and `ouro-hypothesis-example.json`: two aggregate series, deterministic arithmetic, comparability rejection, proposal structure and actual saved revision ancestry.
- The previously shelved `.data/phase1-wip/modules/observatory/data/observatory.json`: initial seven-source extraction. Its descriptions were checked and its overly broad guide introduction replaced with a shorter route. The original bilingual long guide remains in `guideLong` as an inherited asset; the separate reader guide entry is now removed. The graph contains short bilingual briefs with direct source links.

`PROJECT_CONTEXT.md` and `LIGHTWEIGHT_PLAN.md` were not found by exact filename searches including hidden files in this repository, the personal-site repository and their workspace parent directory (excluding dependencies and Git internals). The requested exact path `lesswrong/agent-design.md` was also not found; both accessible `jlens/agent-design.md` copies were read instead. No inaccessible file is represented as reviewed.

Source asset hashes in `provenance.files` identify the imported local bytes. They do not certify source entailment, experimental correctness or a successful reproduction. Previous prototype test reports are historical records, not tests of the current website.

`modules/observatory/data/updates.json` supplies editorial English/Chinese titles and summaries for the reading catalog. It began with 13 curated records, then added the GPT-2 report and the source-checked citation expansion, bringing the catalog to 30; the current six arXiv additions bring it to 36. Thirty-four have dates in the reading feed, while two legacy catalog entries remain undated. The graph begins with seven curated core sources and expands the catalog on demand; it is not a complete bibliography. New summaries paraphrase original sources and retain their limitations; translation does not promote an update to a scientifically reviewed claim. The earlier search and deduplication audit is [citation-search-2026-10-22.md](citation-search-2026-10-22.md); the current source/version checks and index limitations are in [graph-literature-audit-2026-10-22.md](graph-literature-audit-2026-10-22.md).

## Current primary-source inspection

The seven core source IDs are `jlens`, `rlens`, `jpp`, `layer_metric`, `looped`, `ouro` and `bench`. The first two research branches receive the initial focus. Causal evidence, monitoring and the meaning of J-space retain explicit incomplete-coverage states.

| Source | Inspected original | Scope of the check |
|---|---|---|
| J-lens | [Transformer Circuits article](https://transformer-circuits.pub/2026/workspace/) | Publication date, introduction and method description. |
| R-lens | [Original LessWrong post](https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers) | Backward-pass change, evaluation and explicit link to J-lens. |
| J++ Lens | [Original LessWrong post](https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace) | References to J-lens and R-lens, adopted LRP component, WorkspaceBench reference in Appendix B. |
| Layer fidelity | [StellaAthena comment](https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers?commentId=tx8tp7PwFNcP4BvPh) | Comment text raising the layer-fidelity metric objection. This pass recovered its exact `postedAt`, `2026-08-10T22:12:37.403Z`, through the public API; the discussion snapshot records that source time separately from collection time and the legacy catalog entry. |
| Looped models | [arXiv v1 HTML](https://arxiv.org/html/2609.01924v1) | Abstract, introduction, virtual-unrolling description and explicit Gurnee et al. citation. |
| Ouro report | [Pinned README](https://github.com/VykosMolt/JLens-Ouro/blob/a47fad18d91df4cebbed9259700d2cc32a841558/README.md) | Reported means, checkpoint, estimator-family distinction and limitations; verification source inspected separately. |
| WorkspaceBench | [Original LessWrong post](https://www.lesswrong.com/posts/Zeg2JztbdhguL48uH/workspacebench-evaluating-interpretability-methods-for-the) | Evaluation size, intended scope, shortcut limitations and links to readout methods. |

`machineInspectedAt`, `inspectionScope` and `reviewStatus` express these checks. `humanReviewedAt` remains null. The expanded research catalog preserves the same boundary: six newly selected arXiv papers and the 28 source-located relationship records are machine-inspected, not human-reviewed or independently replicated. Normalization removes one duplicate relationship, leaving 27 additional catalog relations. Exact original versions and locators are recorded in the literature audit. Reading a real source does not establish that all its claims are correct. The dataset retains source-reported status and does not label any of these results independently replicated by the Observatory.

## Technical discussion snapshots

A targeted public LessWrong GraphQL inspection retrieved 30 comments across 16 posts and selected 12 substantive viewpoints. Exact post/comment IDs, parent comments, account display names/slugs, source dates, source `baseScore`/`voteCount`, collection times and original permalinks are retained. Missing fields stay null. Short English/Chinese summaries are editorial paraphrases; full raw responses remain local under ignored `.data/`. The same note IDs are used in material details and graph discussion nodes.

Neel Nanda’s WorkspaceBench reply explains the benchmark’s exclusion of less method-agnostic intervention tests; this is an author scope statement rather than causal evidence. Other comments supply methodological questions, proposed diagnostics or scoped author reports. Scores and researcher prominence are discovery cues, not scientific quality labels. Supplementary threads without reading-list identities keep their real post contexts; related-item links are editorial only. See [the discussion audit](graph-discussion-audit-2026-10-22.md).

The manual collector stores candidates and raw responses, updating stable IDs while preserving the immediately previous real snapshot. Two WorkspaceBench runs returned one post and two distinct comments without duplication. This is actual collection history only; it does not create historical judgments, authorize automatic publication, call a model or establish independent verification. X collection remains deferred.

## Ouro numerical snapshot

The GitHub branch API returned research branch `jlens-ouro` at commit **`a47fad18d91df4cebbed9259700d2cc32a841558`**, committed **2026-09-20T18:04:31Z**. Evidence and curve links use that immutable commit. This commit time is a source-version time, not the report's publication date or our first discovery date; those remain null when unknown.

The pinned README identifies the base checkpoint as `ByteDance/Ouro-2.6B`, revision **`1ed04250da1a9936042725d302e81c8fa2ab5abd`**. The Observatory has not downloaded or executed that checkpoint. Model identity is transcribed from the source, not independently verified against model bytes.

Two series are preserved:

| Series ID | Reported passes 1, 2, 3 | Quantity and estimator |
|---|---|---|
| `ouro-own-final` | 22.60, 26.50, 34.17 percentage points | Own-exit minus final-target excess hit@10; initial-study own/final family. |
| `ouro-fit01-final` | −6.50, −8.64, −11.14 percentage points | Final-target excess hit@10 level; frozen confirmation fit01. |

The same confirmation cohort contains 160 questions, 80 distinct intermediate concepts and 28 dependency groups. Distinct concepts are not labeled statistically independent. Both early-pass analyses are post-confirmation; the initial prospective late-pass result is a separate source claim.

The [pinned verification source](https://github.com/VykosMolt/JLens-Ouro/blob/a47fad18d91df4cebbed9259700d2cc32a841558/research/closeout_2026-09-11/local_exit/confirmation_2026-09-12/verify_own_exit_family.py) selects zero-based block offsets 25 through 36, corresponding to physical blocks **26–37 inclusive**, in each pass. It forms own-exit contrasts against the final-target lens in the same initial-study family. The code was read, not run.

Try recomputes **34.17 − 22.60 = 11.57 percentage points** from the rounded reported means. This arithmetic cannot identify a mechanism, infer statistical significance, generate an interval, establish causal use or extrapolate a scaling relationship. The fit01 level cannot be added to the other family's contrast to invent an absolute own-exit score. The public dataset bundles no item-level ranks or confidence-interval endpoints; `uncertainty` is null with an explanation. The source repository's own verification and uncertainty claims are not presented as our verification.

Curve `snapshot_sha256` hashes the canonical JSON object containing `source_commit`, `estimator_family`, `model_revision` and `points`. The prior prototype hash is retained as `inherited_snapshot_sha256`; neither is an experiment receipt.

## Relations, versions and missing history

`relations` keeps direct citations, method adaptations, evaluations, challenges and editorial connections distinct. Machine-inspected scholarly links include an original URL and locator. Editorial edges have no invented proof location and do not establish citation, agreement or method inheritance.

`evidenceRelations` separately links reported evidence to the bounded claim, the claim to the editorial investigation question, and that question to an unrun proposal. It also preserves the two actual saved revision edges from the prototype. The imported hypothesis history contains one seed and **two sibling revisions**; both have the seed as their parent. They are not rewritten into a chronological chain. Original IDs, snapshots, timestamps, reasons, before/after values and `parent_ids` remain available and carry `origin: imported_prototype_example`.

The new bilingual `hypothesisTemplate` is an adaptation with no asserted parent. It provides question, decision, bounded claim, source/evidence IDs, alternatives and predictions, experiment, controls, data, budget, outcome criteria and missing resources. Its status is `not_run`. Personal saved edits create their own real revision links. The old prototype's source IDs in its legacy `snapshot.evidence_ids` retain their original namespace; they are not silently converted into the new evidence-record IDs.

`changes` and `runs` are empty. No historical Observatory judgment is inferred from a paper's date; no result node is created for a proposal. Future judgment changes require a prior statement, new evidence, revised statement, reason and applicable conditions. The long guide contains inherited editorial synthesis beyond the seven-node core and remains a retained, review-pending asset; it is not separately displayed. Brief explanations, bibliography expansion and selected discussions now live in the graph.

## Retained method references

The original arXiv abstract and metadata pages were checked for [DiscoveryRSI v2](https://arxiv.org/abs/2610.23839v2), [Evidence-Informed LLM Beliefs v1](https://arxiv.org/abs/2606.29182v1) and [Hypothesis Evolution Protocol v1](https://arxiv.org/abs/2607.09195v1). [Paper2Agent](https://github.com/jmiao24/Paper2Agent) and [autoresearch](https://github.com/karpathy/autoresearch) repository overviews were also inspected.

These five entries are preserved as **design references, not integrated capabilities or J-lens evidence**. Full methods, dependencies, licenses and applicability must be checked before a concrete scientific implementation adopts them. The initial migration did not install an experiment framework or embedded model. Four project-local K-Dense development skills were subsequently installed, and the current literature/discussion pass used them for retrieval and source appraisal. They do not activate website agents or validate J-lens claims. See [research-skills.md](research-skills.md).

Software/methodology attribution, checked against the current source record: Timothy Kassis, Vinayak Agarwal, Yuhuan He, Darshil Patel and Aubrey M. Brueckner (2026), [Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://arxiv.org/abs/2609.00065). This is a development-tool reference, not a J-lens evidence node.
