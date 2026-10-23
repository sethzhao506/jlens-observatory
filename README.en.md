<h1 align="center">J-lens Research Observatory</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-176b75?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Node.js-24.22.1%2B-176b75?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 24.22.1 or newer">
  <img src="https://img.shields.io/badge/PostgreSQL-17-176b75?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17">
  <img src="https://img.shields.io/badge/Docker-Compose-176b75?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
</p>

<p align="center">
  <b>Understand J-lens, trace the evidence, and make a small, testable next step.</b><br>
  Research discussions, a bilingual guide, an evolution graph, and an auditable path from reported results to an unrun proposal.
</p>

<p align="center">
  <a href="README.md">简体中文</a> · <b>English</b>
</p>

<p align="center">
  <a href="#run-it">Run it</a> ·
  <a href="#make-it-your-field">Project configuration</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="https://github.com/sethzhao506/jlens-observatory/issues">Issues</a>
</p>

<br>

## What this is

J-lens Research Observatory is a research entry point built on the [AIHOT open-source framework](https://github.com/KKKKhazix/AIHOT). It keeps the original layout and colors, the discussion feed, search, source attribution, administration, and publication interfaces, and adds research tools within that layout.

The first topic is **J-lens**, with **J-lens on looped language models / Ouro** as the first complete reader path:

**Understand the question → follow the research graph → find the original evidence → inspect reported curves → perform a deterministic check → compare explanations → save and export a proposal.**

LessWrong discussions, papers, code and directly relevant research updates belong in the feed. General AI news, funding, personnel changes and marketing are outside the current scope. The goal is to track what changes our research judgment, rather than rank what is popular.

## Why this project

Entering a research direction requires more than a list of links. Readers need to know what a method measures, what evidence supports a bounded claim, what remains uncertain, and which affordable next check could distinguish competing explanations.

This repository connects those steps while keeping sources and scientific status visible. It currently develops one worked example rather than claiming a comprehensive J-lens review or an autonomous research system.

## Before you start

- **Research pages default to English and support Chinese** through `?lang=zh`. The inherited navigation, administration and some utility pages remain Chinese; this is not yet a fully translated application.
- **Reading and deterministic checks need no account or model key.** The current preview uses a curated reading catalog. Continuous collection, paid model calls, pushes and IndexNow are not enabled in the recorded local setup. A fresh `.env` generated from the upstream example needs its safety valves turned off before starting services; see [Run it](#run-it).
- **Coverage is incomplete.** The current catalog has 30 materials, including 28 dated feed entries and two undated materials with detail links. The seven core graph sources are a reading route, not a complete citation graph. These counts are not the worldwide J-lens citation count.
- **Source-reported results are not independent replications.** Try recomputes published aggregates; the Observatory has not run the Ouro model experiment. Personal proposals remain unreviewed and `not_run`.
- **The original framework remains the foundation.** Trending, report and bookmark entries are hidden from reader navigation; historical records and inherited machine interfaces are retained. Automatic report composition is disabled in `site/site.ts`.
- **Deployment is separate from this local preview.** No public Observatory domain is documented here. Confirm administrator authentication, terms, privacy and source permissions before public deployment. Do not use the upstream AIHOT name or logo for the Observatory.

## How it works

The existing API, database and worker pipeline supply source management, deduplication, review tools and publication. The web frontend reads the API over HTTP; database credentials and paid services stay in the backend. Public outputs share the publication reading layer.

The research module adds a versioned document of sources, claims, evidence, typed relationships and proposal templates. The guide, graph, Try and Investigate read that document through the same publication boundary. Loading an ordinary page does not call a model.

### Sources and research updates

The intended workflow is **collect → deduplicate → candidate update → verify → update evidence and graph → publish**. The current preview imports a curated reading catalog manually. It does not claim this continuous workflow is already operating unattended.

Source cards identify platforms such as LessWrong, X, GitHub and arXiv, while retaining the specific source and original link. There are 30 manual source-attribution records, two paused LessWrong RSS drafts and two paused X searches. Attribution records are not active subscriptions. X collection remains deferred and requires a separately configured provider before activation.

The inherited selection rubric, dimensions and thresholds remain available. Popularity or repeated coverage is not treated as independent scientific support. The same work's paper, code and author explanation can be linked without counting as separate replications. Search coverage, checked references and failures are documented in [the citation-search audit](docs/citation-search-2026-10-22.md).

### Evidence and scientific status

The graph separates citation, method adaptation, evaluation, challenge, editorial reading order, evidence support and actual proposal revisions. Left-to-right placement is a reading order; it does not establish inheritance. Publication, version update, discovery, machine inspection and human review are separate fields. Unknown dates remain null.

For Ouro, Try recomputes **34.17 − 22.60 = 11.57 percentage points** from rounded source-reported means. This does not establish a mechanism, causal use, significance or a confidence interval. The check rejects combinations across incompatible estimator families. No experimental result node is created for an unrun proposal.

## What you get

| | |
|---|---|
| **Research discussions** | The existing selected feed, all-updates feed, topics and search, focused on J-lens, readout methods and looped LM/Ouro. Summaries retain original links and platform attribution. |
| **Understand** | A short English/Chinese guide, with a longer explanation and technical detail available on demand. |
| **Research Evolution Graph** | Seven initial core sources, five research branches, inspectable typed relations and source locators, evidence and hypothesis views, plus a phone reading-list view. Readout methods and model architecture receive the initial focus. |
| **Evidence** | A bounded Ouro claim, pinned source and curve snapshots, explicit estimator families, limitations and review status. Judgment-change and real-run histories are not fabricated where none exists. |
| **Try** | Deterministic arithmetic and comparability checks on reported aggregates. No model execution or invented uncertainty estimates. |
| **Investigate** | Editable competing explanations, predictions, controls, budget and outcome criteria. Browser-local versions preserve actual parents and export JSON/Markdown; saved proposals link back to the hypothesis view. |
| **Reading experience** | The original layout, colors, light/dark appearance and reading settings. Phone navigation has Selected, Research and More; bookmarks and report entries are hidden. |
| **For agents** | Existing RSS, public API, MCP, Agent Markdown and `llms.txt`, plus research-document and candidate-update endpoints. These are access interfaces, not an embedded research assistant. |
| **Admin and backend** | Existing source tools, diagnostics, manual edits, pipeline evaluation, receipts and budget breakers. Paid operations remain backend worker tasks. |
| **Development research skills** | Four project-local K-Dense skills for scholarly lookup, citation management, review planning and critical thinking. They do not activate website collection or reader-facing agents. |

## A quick look

After starting the site locally:

| Page | What to inspect |
|---|---|
| [Selected](http://localhost:3000/) / [All updates](http://localhost:3000/all) | Research materials, discussions and visible source platforms. |
| [Understand](http://localhost:3000/understand) | Start with the short guide; expand coverage notes or technical detail. |
| [Explore](http://localhost:3000/explore) | Follow the left-to-right reading route, inspect a relationship and open its original evidence. |
| [Try](http://localhost:3000/try) | Recompute the reported change and inspect what the result cannot establish. |
| [Investigate](http://localhost:3000/investigate) | Compare explanations, save a real revision and download a proposal. |
| [Topics](http://localhost:3000/topics) / [Admin](http://localhost:3000/admin) | Existing research categories and backend tools. |

The first investigation asks whether source pass or target exit still affects recoverability after matching remaining computation distance, calibration budget and independently measured concept strength. It is a proposed test, not a completed experiment.

## Run it

You need [Node.js 24.22.1 or newer](https://nodejs.org/en/download) and [Docker Compose](https://docs.docker.com/compose/install/). The Compose stack provides PostgreSQL 17. A model API key is **not** required for the curated reading path.

```bash
git clone --branch setup/jlens-observatory https://github.com/sethzhao506/jlens-observatory.git
cd jlens-observatory
node scripts/init-env.ts
```

Before starting services, edit the generated `.env` and set:

```dotenv
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
```

Keep all `FEISHU_*_ENABLED` and `INDEXNOW_SUBMIT_ENABLED` switches false as well. The upstream `.env.example` currently sets collection and model calls to true; `init-env` copies those values and prints a generic model-key reminder. For this no-model preview, leave `LLM_API_KEY` empty and explicitly turn the two valves off. Do not commit `.env` or paste credentials into chat.

```bash
docker compose up -d --build
docker compose exec api node scripts/import-reading-list.ts
```

Open <http://localhost:3000>. Compose runs migrations and source seeding during setup; the second command imports the curated catalog into the existing material/publication pipeline. Repeating it preserves existing entries and manual edits rather than adding duplicates. Neither command enables continuous research tracking. The admin password is the one generated by `init-env`, stored in `ADMIN_PASSWORD` in `.env`.

For an already configured database, the equivalent content commands are:

```bash
node --env-file=.env scripts/seed.ts
node --env-file=.env scripts/import-reading-list.ts
```

For native setup, domains, HTTPS, backups and production process settings, see [Deployment](docs/deploy.md). Its inherited instructions describe optional paid collection/model workflows too; retain the disabled valves for this curated preview. The existing portable Windows runtime under `.data/` is local and ignored, and is not included in a clone.

Once running, `/agent` documents the inherited MCP, RSS and API access; `/api/v1/agent` is the machine-readable entry and `/openapi-v1.json` describes the public API. `/api/v1/observatory` serves the research document. `/api/v1/research-updates` returns relevant candidates from a seven-day publication window, not a complete archive or confirmed scientific relationships.

### Checks

Run the existing checks for code changes, using a separate PostgreSQL database whose name ends in `_test` or `_ci`:

```bash
npm ci
npm run typecheck
DATABASE_URL=postgres://127.0.0.1:5432/jlens_test npm test
npm run build -w @aihot/web
node --test apps/web/tests/*.test.ts
node scripts/smoke.ts --base http://localhost:3000
```

The environment-variable syntax above is for a POSIX shell; use the corresponding `$env:DATABASE_URL` assignment in PowerShell. Recorded type, build, targeted backend/module and browser checks passed for the current reader path. The full native Windows suites have not all passed; known limits and the local development-login smoke exception are recorded in [Local preview](docs/local-preview.md). These records are not a fresh test run on your machine, and prototype test reports do not validate the current site.

## Make it your field

This repository is already configured for J-lens. Extend that scope in the existing project files rather than replacing the website shell:

| File | Responsibility |
|---|---|
| `site/site.ts` | Observatory identity, original layout copy, navigation visibility and disabled automatic reports. |
| `industry/taxonomy.ts`, `industry/topics.json` | Research categories, tags and topics. |
| `industry/sources.json` | Manual source attribution and paused collection drafts. |
| `industry/reading-list.json`, `scripts/import-reading-list.ts` | Curated catalog and repeatable import through existing publication paths. |
| `industry/prompts/`, `industry/selection.ts` | Research relevance, writing instructions and inherited selection thresholds. Calibrate numerical changes using labelled examples. |
| `site/models.ts` | Backend models for individual pipeline steps, if paid processing is enabled later. |
| `site/brand/`, `site/pages/`, `site/public/`, `site/changelog.json` | Branding, terms/privacy templates, root files and actual project updates. |
| `modules/observatory/` | Bilingual guide, graph, evidence, deterministic checks, personal proposal versions and exports. |
| `modules/observatory/data/observatory.json`, `updates.json` | Research records and bilingual editorial update text. |
| `.agents/skills/` | Pinned, project-local K-Dense development skills, their licenses and installation provenance. |

Preserve the distinction between finding a real source, verifying that it supports a claim, and independently reproducing a result. Keep human-reviewed public content separate from personal browser drafts. Before enabling a collector, manually preview a small source batch, inspect relevance and noise, and repeat the fetch to verify deduplication.

## Documentation

Most inherited framework documents are in Chinese. The research-path and provenance documents are in English; local operations and skill instructions are in Chinese.

| Document | Contents |
|---|---|
| [Local preview](docs/local-preview.md) | Openable pages, content counts, actual validation records and known limits. |
| [Observatory reader path](docs/observatory-reader-path.md) | Routes, reused architecture, graph, deterministic checks, proposal versions and source scope. |
| [Research provenance](docs/research-provenance.md) | Reused materials, pinned originals, numeric snapshots, scientific boundaries and missing history. |
| [Citation-search audit](docs/citation-search-2026-10-22.md) | Checked citing papers, author reports, deduplication and incomplete search coverage. |
| [Project research skills](docs/research-skills.md) | Four K-Dense skills, pinned upstream version, dependencies and validation. |
| [AISafetyHot reference audit](docs/aisafetyhot-reference-plan.md) | What the public Hub does and does not contain; source-attribution reference and licensing boundaries. |
| [Customization](docs/customize.md) | Framework site configuration, categories, sources, prompts, thresholds, models and branding. |
| [Sources](docs/sources.md) | Inherited collector types, tiers, permissions, frequency, historical records and external ingest. |
| [Selection and calibration](docs/selection.md) | Inherited scoring pipeline and calibration against labelled samples. |
| [Grouping](docs/grouping.md) / [Overview evaluation](docs/story-digest-evaluation.md) | Event grouping and digest evaluation; event grouping is not scientific evidence support. |
| [Deployment](docs/deploy.md) | Docker, domains, updates, backups, process settings and production prerequisites. |
| [Architecture](docs/architecture.md) | API/web/worker boundaries, modules, migrations, publication and tests. |

Stack: Node.js 24 · TypeScript · React Router (server-side rendering) · Fastify · PostgreSQL · pg-boss · Tailwind CSS · Docker Compose.

## Community and contributing

Use this repository's [issues](https://github.com/sethzhao506/jlens-observatory/issues) for source suggestions, corrections, research proposals and implementation problems. Include the original URL, version and relevant passage when reporting a claim or relationship problem. A submitted source is a candidate for review, not an automatically confirmed conclusion.

Read [AGENTS.md](AGENTS.md) before changing the project. [CONTRIBUTING.md](CONTRIBUTING.md) describes the upstream framework's contribution rules; site-specific J-lens content belongs here rather than in a generic AIHOT framework pull request. Security-reporting instructions are retained in [SECURITY.md](SECURITY.md).

## Next steps

The next small milestone is to review the first claim and graph relationships, manually test a small LessWrong source batch twice, and record candidate updates without promoting them automatically. X remains deferred until a suitable provider is configured.

A real model check comes later: pin the source commit, checkpoint, data, environment, expected outputs, tolerances and budget, then attempt the reference result before testing a new hypothesis. Source-reported numbers and saved proposals do not replace that work.

## License

The code retains the upstream [MIT License](LICENSE) and copyright attribution to **数字生命卡兹克 (Khazix)**. The AIHOT name and logo are not covered by that license; this site uses its own identity. Fonts and other notices are listed in [NOTICE](NOTICE).

The project-local K-Dense skills retain their upstream MIT licenses and provenance. Original papers, posts, code repositories and other linked research material remain subject to their own owners' terms; the code license does not grant blanket republication rights to that content. This site presents summaries and original links by default.
