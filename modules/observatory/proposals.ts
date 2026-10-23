// Personal drafts reuse the old prototype's evidence checks and append-only revision discipline.
export interface ProposalDraft {
  case_id: string;
  language: 'en' | 'zh';
  question: string;
  decision: string;
  claim: string;
  claim_ids: string[];
  evidence_ids: string[];
  alternatives: { explanation: string; prediction: string }[];
  experiment: string;
  controls: string;
  data: string;
  budget: string;
  criteria: { support: string; weaken: string; null_result: string; inconclusive: string };
  missing_resources: string[];
  resource_tier: 'summaries' | 'states' | 'compute';
}

export interface ProposalCatalog {
  claimIds: string[];
  evidence: { id: string; source_ids: string[]; [key: string]: unknown }[];
  sourceIds: string[];
  evidenceSnapshot: string;
  sources?: { id: string; url: string; [key: string]: unknown }[];
}

export interface Proposal {
  id: string;
  parent_ids: string[];
  created_at: string;
  operation: 'personal_draft' | 'revision';
  reason: string;
  author: 'reader';
  assessment: 'not_reviewed';
  execution_status: 'not_run';
  status: 'proposed_not_run';
  evidence_snapshot: string;
  source_ids: string[];
  source_snapshots: NonNullable<ProposalCatalog['sources']>;
  evidence_snapshots: ProposalCatalog['evidence'];
  snapshot: ProposalDraft;
}

const draftFields = ['case_id', 'language', 'question', 'decision', 'claim', 'claim_ids', 'evidence_ids', 'alternatives',
  'experiment', 'controls', 'data', 'budget', 'criteria', 'missing_resources', 'resource_tier'];
const textFields = ['case_id', 'question', 'decision', 'claim', 'experiment', 'controls', 'data', 'budget'] as const;
const criteriaFields = ['support', 'weaken', 'null_result', 'inconclusive'] as const;
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown, max = 20000): value is string => typeof value === 'string' && !!value.trim() && value.length <= max;
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function distinctIds(value: unknown, known: Set<string>, label: string, errors: string[]) {
  if (!Array.isArray(value) || !value.length || value.length > 30 || value.some((id) => !isText(id, 150)) || new Set(value).size !== value.length) {
    errors.push(`${label} must contain 1–30 distinct identifiers.`);
  } else if (value.some((id) => !known.has(id))) errors.push(`${label} contain an unknown identifier.`);
}

export function validateProposal(draft: unknown, catalog: ProposalCatalog) {
  const errors: string[] = [];
  if (!isObject(draft)) errors.push('A structured personal proposal is required.');
  else {
    if (Object.keys(draft).some((field) => !draftFields.includes(field))) errors.push('Only proposal content may be edited; status and provenance are fixed.');
    for (const field of textFields) if (!isText(draft[field])) errors.push(`${field} must contain non-empty text (at most 20000 characters).`);
    if (!['en', 'zh'].includes(draft.language as string)) errors.push('Choose an available proposal language.');
    if (!['summaries', 'states', 'compute'].includes(draft.resource_tier as string)) errors.push('Choose an available resource tier.');
    distinctIds(draft.claim_ids, new Set(catalog.claimIds), 'Claim references', errors);
    distinctIds(draft.evidence_ids, new Set(catalog.evidence.map(({ id }) => id)), 'Evidence references', errors);
    if (!Array.isArray(draft.alternatives) || draft.alternatives.length < 2 || draft.alternatives.length > 10 || draft.alternatives.some((alternative) =>
      !isObject(alternative) || Object.keys(alternative).some((field) => !['explanation', 'prediction'].includes(field)) || !isText(alternative.explanation) || !isText(alternative.prediction))) {
      errors.push('Provide 2–10 competing explanations, each with a prediction.');
    }
    if (!isObject(draft.criteria) || Object.keys(draft.criteria).some((field) => !criteriaFields.includes(field as typeof criteriaFields[number])) || criteriaFields.some((field) => !isText((draft.criteria as Record<string, unknown>)?.[field]))) {
      errors.push('Provide support, weakening, null-result and inconclusive-result criteria.');
    }
    if (!Array.isArray(draft.missing_resources) || draft.missing_resources.length > 30 || draft.missing_resources.some((resource) => !isText(resource, 2000))) {
      errors.push('Missing resources must be a list of at most 30 descriptions.');
    }
  }
  if (!isText(catalog.evidenceSnapshot, 200)) errors.push('An evidence snapshot identifier is required.');
  if (catalog.evidence.some(({ source_ids }) => !source_ids.length || source_ids.some((id) => !catalog.sourceIds.includes(id)))) {
    errors.push('Evidence must resolve to known original sources.');
  }
  if (catalog.sources && catalog.sources.some(({ id, url }) => !catalog.sourceIds.includes(id) || typeof url !== 'string' || !/^https?:\/\//.test(url))) {
    errors.push('Source snapshots must resolve to original HTTP sources.');
  }
  return { valid: errors.length === 0, errors, scientific_validity: 'unassessed', execution_status: 'not_run' } as const;
}

function assertDraft(draft: ProposalDraft, catalog: ProposalCatalog) {
  const result = validateProposal(draft, catalog);
  if (!result.valid) throw new Error(result.errors.join(' '));
}

function newRecord(draft: ProposalDraft, catalog: ProposalCatalog, parentIds: string[], reason: string): Proposal {
  assertDraft(draft, catalog);
  const sourceIds = new Set(catalog.evidence.filter(({ id }) => draft.evidence_ids.includes(id)).flatMap(({ source_ids }) => source_ids));
  return freeze({
    id: `proposal-${globalThis.crypto.randomUUID()}`, parent_ids: [...parentIds], created_at: new Date().toISOString(),
    operation: parentIds.length ? 'revision' : 'personal_draft', reason, author: 'reader',
    assessment: 'not_reviewed', execution_status: 'not_run', status: 'proposed_not_run',
    evidence_snapshot: catalog.evidenceSnapshot, source_ids: [...sourceIds],
    source_snapshots: copy((catalog.sources ?? []).filter(({ id }) => sourceIds.has(id))),
    evidence_snapshots: copy(catalog.evidence.filter(({ id }) => draft.evidence_ids.includes(id))), snapshot: copy(draft),
  });
}

export function createProposal(draft: ProposalDraft, catalog: ProposalCatalog): Proposal {
  return newRecord(draft, catalog, [], 'Personal draft created from selected evidence.');
}

// Validate actual ancestry, including browser storage loaded from a prior session.
export function validateHistory(records: Proposal[]) {
  if (!Array.isArray(records) || records.length > 1000) throw new Error('A bounded proposal history is required.');
  const byId = new Map<string, Proposal>();
  for (const record of records) {
    if (!isObject(record) || !isText(record.id, 150) || byId.has(record.id) || !Array.isArray(record.parent_ids) ||
      record.parent_ids.some((id) => !isText(id, 150)) || new Set(record.parent_ids).size !== record.parent_ids.length ||
      !isText(record.created_at, 100) || !Number.isFinite(Date.parse(record.created_at)) || !isObject(record.snapshot) ||
      record.author !== 'reader' || record.assessment !== 'not_reviewed' || record.execution_status !== 'not_run' || record.status !== 'proposed_not_run' ||
      record.operation !== (record.parent_ids.length ? 'revision' : 'personal_draft') || !isText(record.reason, 2000) ||
      !isText(record.evidence_snapshot, 200) || !Array.isArray(record.source_ids) || record.source_ids.some((id) => !isText(id, 150)) ||
      !Array.isArray(record.source_snapshots) || !Array.isArray(record.evidence_snapshots)) {
      throw new Error('Invalid personal proposal history; no execution or scientific validation may be implied.');
    }
    const historicalCatalog: ProposalCatalog = {
      claimIds: record.snapshot.claim_ids ?? [], evidence: record.evidence_snapshots, sourceIds: record.source_ids,
      evidenceSnapshot: record.evidence_snapshot, sources: record.source_snapshots,
    };
    assertDraft(record.snapshot, historicalCatalog);
    byId.set(record.id, record);
  }
  const active = new Set<string>(), visited = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) throw new Error('Proposal ancestry contains a cycle.');
    if (visited.has(id)) return;
    const record = byId.get(id);
    if (!record) throw new Error('A revision parent is missing from the personal history.');
    active.add(id);
    for (const parentId of record.parent_ids) {
      visit(parentId);
      const parent = byId.get(parentId)!;
      if (parent.snapshot.case_id !== record.snapshot.case_id) throw new Error('Revision parents must belong to the same case.');
      if (Date.parse(parent.created_at) > Date.parse(record.created_at)) throw new Error('A revision cannot precede its parent.');
    }
    active.delete(id); visited.add(id);
  }
  for (const record of records) visit(record.id);
  return records;
}

export function createRevision(records: Proposal[], parentIds: string | string[], draft: ProposalDraft, reason: string, catalog: ProposalCatalog): Proposal {
  validateHistory(records);
  const ids = typeof parentIds === 'string' ? [parentIds] : parentIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 30 || new Set(ids).size !== ids.length) throw new Error('Choose distinct actual revision parents.');
  const parents = ids.map((id) => records.find((record) => record.id === id));
  if (parents.some((record) => !record)) throw new Error('A revision parent is missing from the personal history.');
  if (parents.some((record) => record!.snapshot.case_id !== draft.case_id)) throw new Error('Revision parents must belong to the same case.');
  if (!isText(reason, 2000)) throw new Error('Record a revision reason (at most 2000 characters).');
  if (parents.every((record) => JSON.stringify(record!.snapshot) === JSON.stringify(draft))) throw new Error('Change the proposal before saving a revision.');
  const next = newRecord(draft, catalog, ids, reason.trim());
  validateHistory([...records, next]);
  return next;
}

function packet(record: Proposal, history: Proposal[]) {
  const records = history.some(({ id }) => id === record.id) ? history : [...history, record];
  validateHistory(records);
  if (JSON.stringify(records.find(({ id }) => id === record.id)) !== JSON.stringify(record)) {
    throw new Error('The selected revision differs from its saved history. Save an actual revision first.');
  }
  const included = new Set<string>();
  function include(id: string) {
    if (included.has(id)) return;
    const current = records.find((entry) => entry.id === id)!;
    for (const parent of current.parent_ids) include(parent);
    included.add(id);
  }
  include(record.id);
  return {
    schema_version: 1, exported_at: new Date().toISOString(), visibility: 'personal_browser_draft',
    selected_hypothesis: copy(record), history: records.filter(({ id }) => included.has(id)).map(copy),
    sources: copy(record.source_snapshots), evidence: copy(record.evidence_snapshots),
    scientific_status: 'proposed_not_run', independently_validated: false, model_experiment_run: false,
  };
}

export function proposalJSON(record: Proposal, history: Proposal[] = []) {
  return JSON.stringify(packet(record, history), null, 2);
}

export function proposalMarkdown(record: Proposal, history: Proposal[] = []) {
  const exported = packet(record, history), draft = record.snapshot;
  const list = (values: string[]) => values.map((value) => `- ${value}`).join('\n');
  return `# Personal research proposal\n\nStatus: proposed, not run. Scientific validity: unassessed.\n\n` +
    `ID: ${record.id}\n\nCreated: ${record.created_at}\n\nLanguage: ${draft.language}\n\nCase: ${draft.case_id}\n\n` +
    `## Question\n\n${draft.question}\n\n## Decision affected\n\n${draft.decision}\n\n## Bounded claim\n\n${draft.claim}\n\n` +
    `Claim IDs: ${draft.claim_ids.join(', ')}\n\nEvidence IDs: ${draft.evidence_ids.join(', ')}\n\nSource IDs: ${record.source_ids.join(', ')}\n\nEvidence snapshot: ${record.evidence_snapshot}\n\n` +
    `## Original sources\n\n${record.source_snapshots.length ? record.source_snapshots.map((source) => `- ${source.id}: ${source.url}`).join('\n') : 'Source URLs were not included in this draft; resolve the source IDs against the recorded evidence snapshot.'}\n\n` +
    `## Competing explanations\n\n${draft.alternatives.map((alternative, index) => `${index + 1}. ${alternative.explanation}\n\nPrediction: ${alternative.prediction}`).join('\n\n')}\n\n` +
    `## Minimum experiment\n\n${draft.experiment}\n\n## Controls\n\n${draft.controls}\n\n## Data\n\n${draft.data}\n\n## Budget\n\n${draft.budget}\n\nResource declaration: ${draft.resource_tier}. This grants no data or compute access.\n\n` +
    `## Outcome criteria\n\nSupport: ${draft.criteria.support}\n\nWeaken: ${draft.criteria.weaken}\n\nNull result: ${draft.criteria.null_result}\n\nInconclusive: ${draft.criteria.inconclusive}\n\n` +
    `## Missing resources\n\n${draft.missing_resources.length ? list(draft.missing_resources) : 'None declared; availability is not independently verified.'}\n\n` +
    `## Revision ancestry\n\n${exported.history.map((entry) => `- ${entry.id}; parents: ${entry.parent_ids.join(', ') || 'none'}; ${entry.created_at}; ${entry.reason}`).join('\n')}\n\n` +
    `## Source, evidence and revision snapshots\n\n\`\`\`json\n${JSON.stringify({ sources: exported.sources, evidence: exported.evidence, history: exported.history }, null, 2)}\n\`\`\`\n\n` +
    `This is a personal browser draft. Citation identifiers resolving does not establish support, novelty, causal use or replication. No confidence interval or hypothesis probability is assigned.\n`;
}
