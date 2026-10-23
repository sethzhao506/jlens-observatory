import translations from "./data/updates.json" with { type: "json" };

/** Editorial associations help navigation; they never assert support, citation or replication. */
export interface UpdateMaterial {
  id: string;
  title: string;
  originalTitle: string | null;
  summary: string | null;
}

const scope = /\b(?:[jr][ -]?lens|jacobian[ -]?lens|j\+\+\s*lens|ouro|huginn|workspacebench)\b|J-space|读出方法|循环语言模型/i;
const known: Record<string, { nodes: string[]; branches: string[] }> = {
  "jlens-jlens": { nodes: ["jlens"], branches: ["methods", "meaning"] },
  "jlens-rlens": { nodes: ["rlens"], branches: ["methods"] },
  "jlens-jpp": { nodes: ["jpp"], branches: ["methods"] },
  "jlens-layer_metric": { nodes: ["layer_metric", "rlens"], branches: ["methods"] },
  "jlens-looped": { nodes: ["looped"], branches: ["architecture"] },
  "jlens-ouro": { nodes: ["ouro"], branches: ["architecture"] },
  "jlens-bench": { nodes: ["bench"], branches: ["methods", "causal"] },
  "jlens-newline": { nodes: ["jlens", "bench"], branches: ["monitoring"] },
  "jlens-swaps": { nodes: ["jlens", "bench"], branches: ["causal"] },
  "jlens-mamba": { nodes: ["looped"], branches: ["architecture"] },
  "jlens-review": { nodes: ["jlens"], branches: ["causal", "meaning"] },
  "jlens-frequency": { nodes: ["jlens"], branches: ["meaning"] },
  "jlens-errors": { nodes: ["jlens"], branches: ["monitoring"] },
};

export function researchContext(item: UpdateMaterial) {
  const text = [item.title, item.originalTitle, item.summary].filter(Boolean).join(" ");
  if (!known[item.id] && !scope.test(text)) return null;
  const association = known[item.id] ?? (/ouro|huginn|looped|recurrent|循环语言模型/i.test(text)
    ? { nodes: ["looped", "ouro"], branches: ["architecture"] }
    : { nodes: ["jlens"], branches: ["methods"] });
  const localized = (translations as Record<string, { title: string[]; summary: string[] }>)[item.id];
  return {
    branchIds: association.branches,
    nodeIds: association.nodes,
    question: ["Which measurement, assumption or research decision could this change?", "这会改变哪项测量、假设或研究决策？"],
    newInformation: item.summary ?? item.originalTitle ?? item.title,
    localizedTitle: localized?.title ?? [item.originalTitle ?? item.title, item.title],
    localizedSummary: localized?.summary ?? [
      item.summary && !/[\u3400-\u9fff]/.test(item.summary) ? item.summary : "An English editorial summary is not yet available. Read the original source before interpreting this candidate.",
      item.summary ?? "尚无摘要，请阅读原始来源。",
    ],
    affectedClaimIds: association.nodes.includes("ouro") ? ["ouro-target"] : [],
    verificationStatus: "candidate_not_scientifically_reviewed",
    association: "editorial",
    note: ["Related reading; impact on a scientific claim requires separate evidence review.", "相关阅读；是否影响科学主张，需要另行核查证据。"],
  };
}
