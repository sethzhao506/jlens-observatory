import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { after, before, test } from 'node:test';
import Fastify from 'fastify';
import { installModules } from '@aihot/backend/modules';
import { readModulePublication } from '@aihot/backend/publication/modules';
import { closeDb } from '@aihot/backend/db';
import { checkComparability, summarizeCurve, type Curve } from '../checks.ts';
import { createProposal, createRevision, proposalJSON, proposalMarkdown, validateHistory, validateProposal, type Proposal, type ProposalCatalog, type ProposalDraft } from '../proposals.ts';
import { researchContext } from '../updates.ts';
import server from '../server.ts';
import document from '../data/observatory.json' with { type: 'json' };

const app = Fastify();
before(async () => {
  installModules([server]);
  await server.http!(app);
  await app.ready();
});
after(async () => { await app.close(); installModules([]); await closeDb(); });

const curve: Curve = {
  id: 'ouro-own-final', source_id: 'ouro', source_url: 'https://github.com/VykosMolt/JLens-Ouro',
  snapshot_sha256: '76591eac4655203754782e545cadf9950f83b87f5ec642921f294ad97bc52992',
  status: 'source_reported_summary', model: 'ByteDance/Ouro-2.6B (base)',
  model_revision: '1ed04250da1a9936042725d302e81c8fa2ab5abd', cohort: '160-question confirmation states',
  metric: 'excess hit@10', unit: 'percentage points', x: 'recurrent pass',
  quantity: 'own-exit minus final-target contrast', estimator_family: 'initial-study own-exit/final-target family',
  analysis: 'post-confirmation', points: [[1, 22.6], [2, 26.5], [3, 34.17]],
  boundary: ['Reported rounded aggregate contrasts; no raw observations or uncertainty.'],
};

const catalog: ProposalCatalog = {
  claimIds: ['claim-own-exit'], evidence: [{ id: 'evidence-own-exit', source_ids: ['ouro'], locator: 'README results', report_values: [22.6, 26.5, 34.17] }], sourceIds: ['ouro'],
  evidenceSnapshot: 'e3af73dd24d591d2a16be39ad2177a5007efe1cd5e8c6d5b3f424721cf4448dd',
  sources: [{ id: 'ouro', url: 'https://github.com/VykosMolt/JLens-Ouro', locator: 'README: Results', version: 'fixed-source-commit' }],
};

const draft: ProposalDraft = {
  case_id: 'ouro', language: 'en',
  question: 'After matching distance, calibration budget and concept strength, does exit or pass still matter?',
  decision: 'Choose whether to improve the measurement or investigate changing representations.',
  claim: 'A residual target-exit or source-pass effect may remain under matched controls.',
  claim_ids: ['claim-own-exit'], evidence_ids: ['evidence-own-exit'],
  alternatives: [
    { explanation: 'The readout loses reach.', prediction: 'Distance-matched measurements reduce the gap.' },
    { explanation: 'The representation changes.', prediction: 'An independently calibrated alternative readout recovers content differently.' },
  ],
  experiment: 'Cache matching states; sweep exits in one estimator family; evaluate held-out tasks.',
  controls: 'Matched concept strength, distance, checkpoint, calibration budget and held-out groups.',
  data: 'Paired item-level observations with documented dependency groups; not yet available.',
  budget: 'Pilot budget to be measured; no compute run authorized or started.',
  criteria: {
    support: 'A practically meaningful residual survives prespecified held-out controls.',
    weaken: 'Controls account for the difference on held-out data.',
    null_result: 'Prioritize measurement calibration and report the tested detection limit.',
    inconclusive: 'Do not distinguish mechanisms if pairing or statistical power is inadequate.',
  },
  missing_resources: ['Pinned analysis environment', 'Compatible cached states and item-level data'], resource_tier: 'summaries',
};

test('reported means give 11.57 points, with no scientific uncertainty or causal inference', () => {
  const original = structuredClone(curve);
  const summary = summarizeCurve(curve, [3, 1]);
  assert.equal(summary.first_to_last_change, 11.57);
  assert.equal(summary.formula, '34.17 - (22.6)');
  assert.deepEqual(summary.points, [[1, 22.6], [3, 34.17]]);
  assert.equal(summary.confidence_interval, null);
  assert.equal(summary.can_identify_mechanism, false);
  assert.equal(summary.can_infer_significance, false);
  assert.equal(summary.can_extrapolate, false);
  summary.points[0][1] = 0;
  assert.deepEqual(curve, original);
});

test('arithmetic rejects extrapolation, duplicates, insufficient points and malformed source values', () => {
  for (const passes of [[1], [], [1, 1], [1, 4], [1, 2.5]]) assert.throws(() => summarizeCurve(curve, passes));
  assert.throws(() => summarizeCurve({ ...curve, points: [[1, 22.6], [2, NaN]] }));
  assert.throws(() => summarizeCurve({ ...curve, points: [[1, 22.6], [1, 26.5]] }));
  assert.throws(() => summarizeCurve({ ...curve, points: [[1, 22.6, 0], [2, 26.5]] }));
});

test('different Ouro estimator families cannot be added to invent an own-exit score', () => {
  const finalTarget: Curve = {
    ...curve, id: 'ouro-fit01-final', quantity: 'final-target excess level',
    estimator_family: 'frozen confirmation fit01', points: [[1, -6.5], [2, -8.64], [3, -11.14]],
  };
  const comparison = checkComparability(curve, finalTarget);
  assert.equal(comparison.metadata_compatible, false);
  assert.deepEqual(comparison.mismatches, ['quantity', 'estimator_family']);
  assert.equal(comparison.compatible_for_direct_numeric_combination, false);
  assert.equal(comparison.statistical_comparison_available, false);
});

test('matching unknown revisions never count as matching scientific metadata', () => {
  const missingRevision = { ...curve, model_revision: null };
  const comparison = checkComparability(missingRevision, missingRevision);
  assert.equal(comparison.metadata_compatible, false);
  assert.ok(comparison.missing.includes('model_revision'));
  assert.equal(checkComparability(curve, { ...curve }).metadata_compatible, true);
  assert.equal(checkComparability(curve, { ...curve }).compatible_for_direct_numeric_combination, false);
  assert.equal(checkComparability(curve, { ...curve, points: [[1, 22.6], [3, 34.17]] }).same_grid, false);
});

test('a structurally complete draft remains unrun and unvalidated at every resource tier', () => {
  for (const resource_tier of ['summaries', 'states', 'compute'] as const) {
    const proposal = createProposal({ ...draft, resource_tier }, catalog);
    assert.equal(proposal.execution_status, 'not_run');
    assert.equal(proposal.status, 'proposed_not_run');
    assert.equal(proposal.assessment, 'not_reviewed');
    assert.deepEqual(proposal.source_ids, ['ouro']);
    assert.equal(proposal.evidence_snapshot, catalog.evidenceSnapshot);
    assert.ok(Math.abs(Date.now() - Date.parse(proposal.created_at)) < 5000);
    assert.throws(() => { proposal.snapshot.claim = 'edited saved history'; }, TypeError);
    assert.throws(() => { proposal.snapshot.evidence_ids.push('invented'); }, TypeError);
  }
  const result = validateProposal(draft, catalog);
  assert.equal(result.valid, true);
  assert.equal(result.scientific_validity, 'unassessed');
});

test('drafts require known citations, competing predictions, null criteria and fixed provenance', () => {
  for (const invalid of [
    { ...draft, evidence_ids: ['missing'] }, { ...draft, claim_ids: ['missing'] },
    { ...draft, evidence_ids: ['evidence-own-exit', 'evidence-own-exit'] },
    { ...draft, alternatives: [draft.alternatives[0]] },
    { ...draft, alternatives: [{ explanation: 'A', prediction: '' }, draft.alternatives[1]] },
    { ...draft, criteria: { ...draft.criteria, null_result: '' } },
    { ...draft, status: 'executed' }, { ...draft, confidence_interval: [0.7, 0.9] },
  ]) assert.equal(validateProposal(invalid, catalog).valid, false);
  assert.throws(() => createProposal(draft, { ...catalog, sourceIds: [] }), /known original sources/);
});

test('revisions preserve the actual parent without changing old content or language', () => {
  const seed = createProposal(draft, catalog);
  const before = JSON.stringify(seed);
  const nextDraft = { ...structuredClone(draft), language: 'zh' as const, claim: '匹配距离和预算后仍可能有目标出口效应。' };
  const revision = createRevision([seed], seed.id, nextDraft, 'Add a bounded, explicit matched-control claim.', catalog);
  assert.equal(JSON.stringify(seed), before);
  assert.equal(seed.snapshot.language, 'en');
  assert.equal(revision.snapshot.language, 'zh');
  assert.deepEqual(revision.parent_ids, [seed.id]);
  assert.equal(revision.execution_status, 'not_run');
  assert.throws(() => createRevision([seed], 'unknown', nextDraft, 'reason', catalog), /parent is missing/);
  assert.throws(() => createRevision([seed], seed.id, draft, 'No substantive change', catalog), /Change the proposal/);
  assert.throws(() => createRevision([seed], seed.id, nextDraft, '', catalog), /revision reason/);
});

test('forks and explicit merges preserve a DAG; missing parents and cycles fail', () => {
  const seed = createProposal(draft, catalog);
  const a = createRevision([seed], seed.id, { ...draft, experiment: 'Add a target-exit sweep.' }, 'Refine the experiment.', catalog);
  const b = createRevision([seed], seed.id, { ...draft, controls: 'Add a stronger independent concept-strength control.' }, 'Refine controls.', catalog);
  const mergedDraft = { ...draft, experiment: a.snapshot.experiment, controls: b.snapshot.controls };
  const merged = createRevision([seed, a, b], [a.id, b.id], mergedDraft, 'Combine both actual edits.', catalog);
  assert.deepEqual(merged.parent_ids, [a.id, b.id]);
  assert.throws(() => validateHistory([a]), /parent is missing/);
  const cycle = structuredClone([seed, a]);
  cycle[0].parent_ids = [a.id]; cycle[0].operation = 'revision';
  assert.throws(() => validateHistory(cycle), /cycle/);
});

test('export preserves ancestor snapshots, evidence identifiers and honest execution status', () => {
  const seed = createProposal(draft, catalog);
  const revision = createRevision([seed], seed.id, { ...draft, controls: 'Revised matching controls.' }, 'Make distance matching explicit.', catalog);
  const unrelated = createProposal(draft, catalog);
  const exported = JSON.parse(proposalJSON(revision, [seed, revision, unrelated]));
  assert.deepEqual(exported.history.map((record: Proposal) => record.id), [seed.id, revision.id]);
  assert.equal(exported.model_experiment_run, false);
  assert.equal(exported.independently_validated, false);
  assert.deepEqual(exported.selected_hypothesis.snapshot.evidence_ids, draft.evidence_ids);
  assert.equal(exported.sources[0].url, 'https://github.com/VykosMolt/JLens-Ouro');
  assert.deepEqual(exported.evidence[0].report_values, [22.6, 26.5, 34.17]);
  const markdown = proposalMarkdown(revision, [seed, revision]);
  for (const text of ['Null result:', 'Inconclusive:', 'evidence-own-exit', 'claim-own-exit', seed.id, revision.id, 'proposed, not run']) assert.ok(markdown.includes(text), text);
  assert.throws(() => proposalJSON(revision), /parent is missing/);
  const changedWithoutRevision = structuredClone(revision);
  changedWithoutRevision.snapshot.claim = 'Unsaved change.';
  assert.throws(() => proposalJSON(changedWithoutRevision, [seed, revision]), /differs from its saved history/);
});

test('research updates link known reading while unrelated funding stays outside the research stream', () => {
  assert.equal(researchContext({ id: 'generic-funding', title: 'AI startup raises a new financing round', originalTitle: null, summary: 'Funding, hiring and launch promotion.' }), null);
  const known = researchContext({ id: 'jlens-ouro', title: 'Own-exit comparison', originalTitle: null, summary: 'Reported aggregate contrasts.' });
  assert.deepEqual(known?.nodeIds, ['ouro']);
  assert.deepEqual(known?.affectedClaimIds, ['ouro-target']);
  assert.equal(known?.association, 'editorial');
  assert.equal(known?.verificationStatus, 'candidate_not_scientifically_reviewed');
});

test('newly discovered J-lens updates remain editorial candidates rather than confirmed scientific relations', () => {
  const candidate = researchContext({ id: 'new-jlens', title: 'A J-lens measurement correction', originalTitle: null, summary: 'A technical discussion about calibration.' });
  assert.ok(candidate);
  assert.deepEqual(candidate.nodeIds, ['jlens']);
  assert.equal(candidate.association, 'editorial');
  assert.equal(candidate.verificationStatus, 'candidate_not_scientifically_reviewed');
  assert.deepEqual(candidate.affectedClaimIds, []);
});

function httpSource(value: unknown) {
  assert.equal(typeof value, 'string');
  const url = new URL(value as string);
  assert.ok(['https:', 'http:'].includes(url.protocol));
  assert.equal(url.username, '');
  assert.equal(url.password, '');
}

test('research relations resolve in the source space and scientific relations retain proof locators', () => {
  const sources = new Set(document.sources.map(({ id }) => id));
  const branches = new Set(document.branches.map(({ id }) => id));
  const kinds = new Set(document.relationKinds.map(({ id }) => id));
  assert.equal(sources.size, document.sources.length);
  assert.equal(new Set(document.relations.map(({ id }) => id)).size, document.relations.length);
  for (const source of document.sources) {
    httpSource(source.url);
    assert.ok(source.locator.every((text) => text.trim()));
    assert.ok(source.branch === 'root' || branches.has(source.branch));
    assert.equal(source.humanReviewedAt, null);
    assert.equal(source.replicationStatus, 'not_replicated_by_observatory');
  }
  for (const relation of document.relations) {
    assert.ok(sources.has(relation.source), relation.id);
    assert.ok(sources.has(relation.target), relation.id);
    assert.ok(kinds.has(relation.kind), relation.id);
    if (relation.kind === 'editorial') {
      assert.equal(relation.proof_url, null);
      assert.equal(relation.reviewStatus, 'editorial_not_scientific_evidence');
    } else {
      httpSource(relation.proof_url);
      assert.ok(relation.locator?.trim(), relation.id);
      assert.equal(relation.directed, true);
      assert.ok(relation.reviewStatus.includes('pending'), relation.id);
    }
  }
});

test('evidence, questions and proposal ancestry never become an implicit paper-citation relationship', () => {
  const sources = new Set(document.sources.map(({ id }) => id));
  const claims = new Set(document.claims.map(({ id }) => id));
  const evidence = new Set(document.evidence.map(({ id }) => id));
  const questions = new Set(document.questionNodes.map(({ id }) => id));
  const versions = new Map(document.hypothesisVersions.map((version) => [version.id, version]));
  for (const claim of document.claims) {
    assert.equal(claim.status, 'source_reported');
    assert.ok(claim.evidenceIds.every((id) => evidence.has(id)));
    assert.ok(claim.conditions.every((text) => text.trim()));
    assert.ok(claim.limitations.every((text) => text.trim()));
  }
  for (const entry of document.evidence) {
    assert.ok(sources.has(entry.sourceId)); assert.ok(claims.has(entry.claimId));
    assert.ok(document.curves.some(({ id }) => id === entry.curveId));
    assert.equal(entry.status, 'reported_not_replicated');
    httpSource(entry.sourceUrl); httpSource(entry.codeUrl);
  }
  for (const question of document.questionNodes) {
    assert.equal(question.kind, 'investigation_question');
    assert.equal(question.status, 'unresolved');
    assert.ok(question.evidenceIds.every((id) => evidence.has(id)));
    assert.ok(question.claimIds.every((id) => claims.has(id)));
    assert.equal(claims.has(question.id), false);
  }
  for (const relation of document.evidenceRelations) {
    if (relation.kind === 'support') {
      assert.ok(evidence.has(relation.source)); assert.ok(claims.has(relation.target));
      httpSource(relation.proof_url); assert.ok(relation.locator);
    } else if (relation.kind === 'motivates') {
      assert.ok(claims.has(relation.source)); assert.ok(questions.has(relation.target));
      assert.equal(relation.reviewStatus, 'editorial_proposal_pending_review');
    } else if (relation.kind === 'planned_test') {
      assert.ok(questions.has(relation.source)); assert.equal(relation.target, document.hypothesisTemplate.id);
      assert.equal(document.hypothesisTemplate.status, 'not_run');
    } else if (relation.kind === 'hypothesis_revision') {
      assert.ok(versions.has(relation.source)); assert.ok(versions.has(relation.target));
      assert.ok((versions.get(relation.target)!.parent_ids as string[]).includes(relation.source));
    } else assert.fail(`Unknown evidence relation kind: ${relation.kind}`);
  }
  for (const version of document.hypothesisVersions) {
    assert.equal(version.execution_status, 'not_run');
    assert.equal(version.snapshot.status, 'proposed_not_run');
    assert.equal(version.assessment, 'not_reviewed');
    for (const parentId of version.parent_ids) {
      assert.ok(versions.has(parentId));
      assert.ok(Date.parse(versions.get(parentId)!.created_at) <= Date.parse(version.created_at));
    }
  }
  assert.deepEqual(document.runs, [], 'This source-reported seed contains no Observatory model run or synthetic result.');
  for (const field of ['support', 'weaken', 'null', 'uncertain'] as const) assert.ok(document.hypothesisTemplate.criteria[field].every((text) => text.trim()));
});

test('Ouro evidence and curves point to the same pinned source rather than an unversioned branch', () => {
  const source = document.sources.find(({ id }) => id === 'ouro')!;
  const evidence = document.evidence.find(({ sourceId }) => sourceId === source.id)!;
  assert.match(source.version!, /^[a-f0-9]{40}$/);
  assert.ok(source.pinnedUrl!.includes(`/blob/${source.version}/`));
  assert.equal(evidence.sourceCommit, source.version);
  assert.equal(evidence.sourceUrl, source.pinnedUrl);
  for (const curve of document.curves) {
    assert.equal(curve.source_id, source.id);
    assert.equal(curve.source_commit, source.version);
    assert.equal(curve.source_url, source.pinnedUrl);
    assert.ok(curve.code_url.includes(`/blob/${source.version}/`));
    assert.match(curve.snapshot_sha256, /^[a-f0-9]{64}$/);
    const snapshot = createHash('sha256').update(JSON.stringify({
      source_commit: curve.source_commit, estimator_family: curve.estimator_family,
      model_revision: curve.model_revision, points: curve.points,
    })).digest('hex');
    assert.equal(curve.snapshot_sha256, snapshot, 'Curve hashes bind reported values to their estimator, checkpoint and pinned source.');
    assert.equal(curve.uncertainty, null);
    assert.equal(curve.raw_rows_available, false);
    assert.equal(curve.checkpoint_revision_status, 'reported_in_pinned_source_not_downloaded');
  }
});

test('the public research document uses the shared publication read layer and returns an isolated copy', () => {
  const first = readModulePublication<typeof document>('observatory');
  first.claims[0].statement[0] = 'This mutation must not change the public record.';
  const second = readModulePublication<typeof document>('observatory');
  assert.equal(second.claims[0].statement[0], document.claims[0].statement[0]);
});

test('anonymous document HTTP supports ETags, rejects unknown input and cannot publish browser drafts', async () => {
  const response = await app.inject('/api/v1/observatory');
  assert.equal(response.statusCode, 200, response.body);
  assert.match(response.headers['content-type']!, /^application\/json/);
  assert.ok(response.headers.etag);
  const cached = await app.inject({ url: '/api/v1/observatory', headers: { 'if-none-match': response.headers.etag! } });
  assert.equal(cached.statusCode, 304);
  assert.equal(cached.body, '');
  const secret = 'reader-private-proposal-marker';
  const withCookie = await app.inject({ url: '/api/v1/observatory', headers: { cookie: `draft=${secret}` } });
  assert.deepEqual(withCookie.json(), response.json());
  assert.equal(withCookie.body.includes(secret), false);
  const unknown = await app.inject(`/api/v1/observatory?draft=${secret}`);
  assert.equal(unknown.statusCode, 400);
  assert.equal(unknown.json().code, 'invalid_request');
  const write = await app.inject({ method: 'POST', url: '/api/v1/observatory', payload: { privateDraft: secret } });
  assert.equal(write.statusCode, 404);
  assert.equal((await app.inject('/api/v1/observatory')).body.includes(secret), false);
});
