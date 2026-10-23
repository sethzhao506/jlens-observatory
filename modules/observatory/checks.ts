// Migrated from the existing guide's discovery-core.js. These are summary operations, not model runs.
export interface Curve {
  id: string;
  source_id: string;
  source_url: string;
  snapshot_sha256: string;
  status: string;
  unit: string;
  model: string;
  model_revision: string | null;
  cohort: string;
  metric: string;
  x: string;
  quantity: string;
  estimator_family: string;
  analysis: string;
  points: number[][];
  boundary: string[];
}

function observedPoints(curve: Curve) {
  if (!Array.isArray(curve.points) || curve.points.length < 2 || curve.points.some((point) =>
    !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || !Number.isInteger(point[0]))) {
    throw new Error('A curve needs finite reported values at observed integer passes.');
  }
  if (new Set(curve.points.map(([pass]) => pass)).size !== curve.points.length) {
    throw new Error('A curve cannot contain duplicate observed passes.');
  }
  return curve.points.map((point) => [...point]).sort((a, b) => a[0] - b[0]);
}

export function summarizeCurve(curve: Curve, passes?: number[]) {
  const observed = observedPoints(curve);
  if (passes !== undefined && (!Array.isArray(passes) || new Set(passes).size !== passes.length || passes.some((pass) =>
    !Number.isInteger(pass) || !observed.some(([x]) => pass === x)))) {
    throw new Error('Select distinct observed passes.');
  }
  const points = observed.filter(([pass]) => passes === undefined || passes.includes(pass));
  if (points.length < 2) throw new Error('Select at least two observed passes.');
  const first = points[0], last = points.at(-1)!;
  return {
    tool: 'summarize_curve', source_status: curve.status,
    computation_status: 'recomputed_from_reported_aggregates',
    source_id: curve.source_id, source_url: curve.source_url, source_snapshot: curve.snapshot_sha256,
    curve_id: curve.id, points, count: points.length, unit: curve.unit,
    first_to_last_change: Number((last[1] - first[1]).toFixed(8)),
    formula: `${last[1]} - (${first[1]})`,
    strictly_increasing: points.slice(1).every((point, index) => point[1] > points[index][1]),
    confidence_interval: null,
    can_identify_mechanism: false, can_infer_significance: false, can_extrapolate: false,
    boundary: [...curve.boundary],
  } as const;
}

export function checkComparability(a: Curve, b: Curve) {
  const pointsA = observedPoints(a), pointsB = observedPoints(b);
  const fields = ['model', 'model_revision', 'cohort', 'metric', 'unit', 'x', 'quantity', 'estimator_family', 'analysis'] as const;
  const mismatches = fields.filter((key) => a[key] !== b[key]);
  const missing = fields.filter((key) => typeof a[key] !== 'string' || !a[key]!.trim() || typeof b[key] !== 'string' || !b[key]!.trim());
  const sameGrid = JSON.stringify(pointsA.map(([pass]) => pass)) === JSON.stringify(pointsB.map(([pass]) => pass));
  return {
    tool: 'check_comparability', a: a.id, b: b.id,
    metadata_compatible: !mismatches.length && !missing.length && sameGrid,
    mismatches, missing, same_grid: sameGrid,
    compatible_for_direct_numeric_combination: false,
    statistical_comparison_available: false,
    decision: mismatches.length || missing.length || !sameGrid
      ? 'Do not combine these series into a synthetic result. Side-by-side contextual reading remains possible.'
      : 'Matching metadata do not establish pairing, statistical uncertainty or a valid numerical operation.',
    source_ids: [...new Set([a.source_id, b.source_id])],
  } as const;
}
