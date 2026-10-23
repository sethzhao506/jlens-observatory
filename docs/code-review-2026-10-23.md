# Graph and discussion code review — 2026-10-23

## Scope and method

Reviewed the uncommitted research graph, literature catalog, discussion snapshots, public HTTP projection, manual comment collector, navigation and documentation changes before committing them. The current environment has no `code-review/SKILL.md`; the available Code Review plugin only reads existing PR checks. Review therefore used the installed Codex CLI's `review --uncommitted` command in read-only mode, plus independent reviews of graph interactions, the collection/publication path, and research provenance.

The native review reported no actionable bugs. Independent graph review reproduced one issue: opening `/explore?node=jlens-rlens` with a public catalog identifier duplicated the existing core source and failed to open its inspector. Other reviewed areas produced no additional reproducible P1/P2 findings. This is a scoped review, not proof that the entire application is defect-free.

## Changes from review

- Centralized catalog/comment-to-core-node identity resolution in `researchNodeId`, including branch and selection handling. Catalog and canonical source links now open the same core node.
- Extracted source details into `SourceInspector`, preserving source status, dates, limits and the Ouro evidence link while removing a duplicate original-source link.
- Added a regression covering all seven catalog aliases, comparing each alias with its canonical node and checking the source inspector. Desktop and phone representations are both retained.

## Verification

- Full workspace typecheck and production web build passed.
- Observatory standalone tests: 21 passed.
- Observatory web acceptance tests: 10 passed, including the new alias regression, bilingual navigation, phone reading, discussion failures/retry, source links and proposal export.
- Independent collector review used a local stub to check repeated collection, stable IDs, visible source failures and preservation of the previous real snapshot, without external requests.
- Research data review checked catalog/source identifiers, new paper metadata, source-located relations and original comment metadata against the saved source inspections. No new experiments or human-reviewed scientific conclusions are claimed.

The full native Windows suites have not all passed; historical tool/process limits and the local development-login smoke exception remain documented in [Local preview](local-preview.md). Review does not activate collection, model calls, publishing or scheduled work. X collection remains deferred.
