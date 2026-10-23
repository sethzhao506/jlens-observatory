import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { createProposal, createRevision, proposalJSON, proposalMarkdown, validateHistory, validateProposal, type Proposal, type ProposalDraft } from "../proposals.ts";
import { Arrow, Badge, Note, PageHeader, type ObservatoryDocument } from "./ui.tsx";
import { text, type Lang } from "./shell.tsx";

const storageKey = "jlens-observatory:personal-proposals:v1";
export function usePersonalProposals() {
  const [records, setRecords] = useState<Proposal[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed: Proposal[] = saved ? JSON.parse(saved) : [];
      validateHistory(parsed);
      setRecords(parsed);
    } catch { setError("Personal history could not be read. Existing browser data was not overwritten."); }
    setReady(true);
  }, []);
  function save(next: Proposal[]) {
    if (!ready || error) return false;
    try { validateHistory(next); localStorage.setItem(storageKey, JSON.stringify(next)); setRecords(next); return true; }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); return false; }
  }
  return { records, error, ready, save };
}

function initialDraft(doc: ObservatoryDocument, lang: Lang): ProposalDraft {
  const template = doc.hypothesisTemplate;
  return {
    case_id: template.id, language: lang ? "zh" : "en", question: text(template.question, lang), decision: text(template.decision, lang), claim: `${text(template.claim, lang)}\n\n${text(template.boundedScope, lang)}`,
    claim_ids: template.claimIds, evidence_ids: template.evidenceIds,
    alternatives: template.alternatives.map((entry) => ({ explanation: `${text(entry.title, lang)}: ${text(entry.claim, lang)}`, prediction: text(entry.prediction, lang) })),
    experiment: text(template.experiment, lang), controls: text(template.controls, lang), data: text(template.data, lang), budget: text(template.budget, lang),
    criteria: { support: text(template.criteria.support, lang), weaken: text(template.criteria.weaken, lang), null_result: text(template.criteria.null, lang), inconclusive: text(template.criteria.uncertain, lang) },
    missing_resources: [text(template.missingResources, lang)], resource_tier: "summaries",
  };
}
export function InvestigationLab({ doc, lang }: { doc: ObservatoryDocument; lang: Lang }) {
  const { search } = useLocation();
  const requestedEvidence = new URLSearchParams(search).get("evidence");
  const { records, error: storageError, ready, save } = usePersonalProposals();
  const [draft, setDraft] = useState<ProposalDraft>(() => initialDraft(doc, lang));
  const [parent, setParent] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [exportText, setExportText] = useState("");
  const catalog = useMemo(() => ({ claimIds: doc.claims.map((claim) => claim.id), sourceIds: doc.sources.map((source) => source.id), sources: doc.sources, evidence: doc.evidence.map((evidence) => ({ ...evidence, source_ids: [evidence.sourceId] })), evidenceSnapshot: doc.curves[0].snapshot_sha256 }), [doc]);
  const saved = records.find((record) => record.id === savedId);
  function field<K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) { setDraft((old) => ({ ...old, [key]: value })); setMessage(""); }
  function persist() {
    const cleanedDraft = { ...draft, missing_resources: draft.missing_resources.map((entry) => entry.trim()).filter(Boolean) };
    const validation = validateProposal(cleanedDraft, catalog);
    if (!validation.valid) { setErrors(validation.errors); setMessage(""); return; }
    try {
      const record = parent ? createRevision(records, parent, cleanedDraft, reason, catalog) : createProposal(cleanedDraft, catalog);
      if (!save([...records, record])) return;
      setParent(record.id); setSavedId(record.id); setReason(""); setErrors([]);
      setMessage(lang ? "已在此浏览器保存不可变版本。可继续修改并保存真实修订。" : "An immutable version was saved in this browser. Further edits can be saved as a real revision.");
    } catch (failure) { setErrors([failure instanceof Error ? failure.message : String(failure)]); }
  }
  function openRecord(record: Proposal) { setDraft(structuredClone(record.snapshot)); setParent(record.id); setSavedId(record.id); setReason(""); setErrors([]); setMessage(lang ? "已载入此版本。修改后保存将保留父版本。" : "Version loaded. Saving changes will preserve this version as its parent."); }
  function download(format: "json" | "markdown") {
    if (!saved) return;
    try {
      const content = format === "json" ? proposalJSON(saved, records) : proposalMarkdown(saved, records);
      setExportText(content);
      const url = URL.createObjectURL(new Blob([content], { type: format === "json" ? "application/json" : "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `jlens-${saved.id}.${format === "json" ? "json" : "md"}`; anchor.click(); URL.revokeObjectURL(url);
      setMessage(lang ? "已请求下载所选保存版本及其真实祖先记录；下方也提供可复制的导出文本。未保存的修改不包含在内。" : "Download requested for the selected saved version and its real ancestry. Export text is also available below. Unsaved edits are not included.");
    } catch (failure) { setErrors([failure instanceof Error ? failure.message : String(failure)]); }
  }
  const fields: Array<[keyof Pick<ProposalDraft, "question" | "decision" | "claim" | "experiment" | "controls" | "data" | "budget">, string, string]> = [
    ["question", "Research question", "研究问题"], ["decision", "What decision would the answer change?", "答案将改变什么判断或决策？"], ["claim", "Scoped candidate claim", "有范围的候选主张"], ["experiment", "Minimum discriminating experiment", "最小区分性实验"], ["controls", "Controls and matching", "控制条件与匹配"], ["data", "Data and analysis unit", "数据与分析单位"], ["budget", "Budget and stopping rule", "预算与停止规则"],
  ];
  if (requestedEvidence && !doc.evidence.some((entry) => entry.id === requestedEvidence)) return <><PageHeader number="INVESTIGATE" title={lang ? "未找到所选证据" : "Selected evidence not found"} lead={lang ? "未使用其他证据替代未知标识。请从已有主张重新选择依据。" : "No other evidence was substituted for an unknown identifier. Choose evidence from an existing claim."} /><Arrow to="/explore?view=evidence" lang={lang}>{lang ? "返回证据图" : "Return to the evidence graph"}</Arrow></>;
  return <><PageHeader number={lang ? "INVESTIGATE / 个人研究草稿" : "INVESTIGATE / PERSONAL RESEARCH DRAFT"} title={lang ? "把一个观察，变成可区分的检验。" : "Turn an observation into a discriminating test."} lead={lang ? "从 Ouro 的目标出口问题开始。比较竞争解释，说明结果怎样改变下一步，而非只写一个可能正确的故事。" : "Start with the Ouro target-exit question. Compare explanations and specify how each outcome would change the next step."} />
    <Note title={lang ? "提案尚未运行 · 保存在此浏览器" : "Not run · saved in this browser"}>{lang ? "这里不会运行模型或申请算力。个人版本不属于公共审核内容。保存仅检查结构完整性，不验证科学结论。请导出保留副本。" : "This page does not run models or obtain compute. Personal versions are separate from public reviewed content. Saving checks structure, not scientific validity. Export a copy to retain your work."}</Note>
    {storageError && <p role="alert" className="obs-error">{lang ? "个人历史无法读取或保存，原有数据未被覆盖。" : "Personal history could not be read or saved; existing data was not overwritten."} {storageError}</p>}
    <div className="obs-lab-layout"><form className="obs-lab-form" onSubmit={(event) => { event.preventDefault(); persist(); }}>
      <div className="obs-form-top"><Badge tone="amber">{lang ? "未运行 · 未经审核" : "Not run · not reviewed"}</Badge><span>{lang ? "草稿语言" : "Draft language"}: {draft.language === "zh" ? "中文" : "English"}</span></div>
      <fieldset className="obs-fieldset"><legend>{lang ? "01 / 问题与依据" : "01 / Question and evidence"}</legend>{fields.slice(0, 3).map(([key, en, zh]) => <label className="obs-field" key={key}><span>{lang ? zh : en}</span><textarea value={draft[key]} onChange={(event) => field(key, event.target.value)} rows={key === "question" ? 3 : 4} required /></label>)}
      <div className="obs-evidence-selection"><strong>{lang ? "关联证据" : "Linked evidence"}</strong>{doc.evidence.map((evidence) => <label key={evidence.id}><input type="checkbox" checked={draft.evidence_ids.includes(evidence.id)} onChange={(event) => field("evidence_ids", event.target.checked ? [...draft.evidence_ids, evidence.id] : draft.evidence_ids.filter((id) => id !== evidence.id))} /><span>{evidence.id} <small>{lang ? "来源报告，未独立复现" : "Source-reported; not independently replicated"}</small></span></label>)}</div></fieldset>
      <fieldset className="obs-fieldset"><legend>{lang ? "02 / 竞争解释与预测" : "02 / Competing explanations and predictions"}</legend>{draft.alternatives.map((alternative, index) => <div className="obs-alternative" key={index}><div><Badge>{String.fromCharCode(65 + index)}</Badge><strong>{lang ? "竞争解释" : "Alternative explanation"}</strong>{draft.alternatives.length > 2 && <button type="button" className="obs-text-link" aria-label={lang ? `移除竞争解释 ${index + 1}` : `Remove alternative ${index + 1}`} onClick={() => field("alternatives", draft.alternatives.filter((_, i) => i !== index))}>{lang ? "移除" : "Remove"}</button>}</div><label className="obs-field"><span>{lang ? "解释" : "Explanation"} {index + 1}</span><textarea value={alternative.explanation} onChange={(event) => field("alternatives", draft.alternatives.map((entry, i) => i === index ? { ...entry, explanation: event.target.value } : entry))} rows={3} required /></label><label className="obs-field"><span>{lang ? "可区分预测" : "Discriminating prediction"} {index + 1}</span><textarea value={alternative.prediction} onChange={(event) => field("alternatives", draft.alternatives.map((entry, i) => i === index ? { ...entry, prediction: event.target.value } : entry))} rows={3} required /></label></div>)}<button type="button" className="obs-text-link" onClick={() => field("alternatives", [...draft.alternatives, { explanation: "", prediction: "" }])}>{lang ? "+ 添加一个竞争解释" : "+ Add a competing explanation"}</button></fieldset>
      <fieldset className="obs-fieldset"><legend>{lang ? "03 / 最小实验与资源" : "03 / Minimum experiment and resources"}</legend>{fields.slice(3).map(([key, en, zh]) => <label className="obs-field" key={key}><span>{lang ? zh : en}</span><textarea value={draft[key]} onChange={(event) => field(key, event.target.value)} rows={4} required /></label>)}<label className="obs-field"><span>{lang ? "当前可用资源声明（不会授予资源）" : "Currently available resources (declaration only)"}</span><select value={draft.resource_tier} onChange={(event) => field("resource_tier", event.target.value as ProposalDraft["resource_tier"])}><option value="summaries">{lang ? "仅来源报告与汇总值" : "Reports and aggregates only"}</option><option value="states">{lang ? "已有缓存状态与样本级结果" : "Cached states and sample-level outcomes"}</option><option value="compute">{lang ? "已有模型、数据与计算资源" : "Model, data, and compute available"}</option></select></label><label className="obs-field"><span>{lang ? "缺失资源，每行一项" : "Missing resources, one per line"}</span><textarea rows={5} value={draft.missing_resources.join("\n")} onChange={(event) => field("missing_resources", event.target.value.split("\n"))} /></label></fieldset>
      <fieldset className="obs-fieldset"><legend>{lang ? "04 / 预先写下判断标准" : "04 / Predefine the decision criteria"}</legend>{([["support", "Support", "支持"], ["weaken", "Weaken", "削弱"], ["null_result", "Null result and next step", "零结果与下一步"], ["inconclusive", "Inconclusive result", "不确定结果"]] as const).map(([key, en, zh]) => <label className="obs-field" key={key}><span>{lang ? zh : en}</span><textarea rows={3} value={draft.criteria[key]} onChange={(event) => field("criteria", { ...draft.criteria, [key]: event.target.value })} required /></label>)}</fieldset>
      <div className="obs-save-panel">{parent && <label className="obs-field"><span>{lang ? "本次修订改变了什么，为什么？" : "What changed in this revision, and why?"}</span><textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} required /></label>}<button type="submit" className="obs-button obs-button-primary" disabled={!ready || Boolean(storageError)}>{parent ? (lang ? "保存为新修订" : "Save a new revision") : (lang ? "保存第一个版本" : "Save the first version")}<span>↗</span></button>{message && <p className="obs-status" role="status">{message}</p>}{errors.length > 0 && <div className="obs-error" role="alert"><strong>{lang ? "未能保存或导出" : "Save or export failed"}</strong><ul>{errors.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>}</div>
    </form><aside className="obs-lab-aside"><div className="obs-panel"><h2>{lang ? "从证据到提案" : "Evidence to proposal"}</h2><p>{lang ? "报告差值增长，并不能单独区分距离、校准、信号强度与出口相关结构。匹配这些变量后还剩下什么，是本提案的核心问题。" : "The growing reported contrast does not isolate distance, calibration, signal strength, or exit-related structure. The proposal asks what remains after matching them."}</p><Arrow to="/try" lang={lang}>{lang ? "查看来源曲线与小检查" : "Review the curve and check"}</Arrow><Arrow to="/explore?view=hypotheses" lang={lang}>{lang ? "查看真实修订关系" : "See the revision graph"}</Arrow></div><div className="obs-panel"><h2>{lang ? "已保存的个人版本" : "Saved personal versions"}</h2>{records.length ? <ol className="obs-version-list">{records.map((record, index) => <li key={record.id}><button type="button" onClick={() => openRecord(record)} aria-pressed={savedId === record.id}><b>v{index + 1}</b><span>{record.reason || (lang ? "首个个人草稿" : "Initial personal draft")}<small>{new Date(record.created_at).toISOString().replace("T", " ").slice(0, 19)} UTC</small></span></button><small className="obs-parent-id">{lang ? "父版本" : "Parents"}: {record.parent_ids.length ? record.parent_ids.map((id) => `v${records.findIndex((entry) => entry.id === id) + 1}`).join(", ") : (lang ? "无" : "none")}</small></li>)}</ol> : <p>{lang ? "尚无保存版本。填好后保存，图谱将显示真实的修订连线。" : "No saved versions yet. Save a draft to add real revision links to the graph."}</p>}
      <div className="obs-export"><button type="button" className="obs-button" disabled={!saved} onClick={() => download("json")}>{lang ? "导出 JSON" : "Export JSON"}<span>↓</span></button><button type="button" className="obs-button" disabled={!saved} onClick={() => download("markdown")}>{lang ? "导出 Markdown" : "Export Markdown"}<span>↓</span></button></div><p className="obs-small">{lang ? "导出所选保存版本、真实祖先、来源与证据；请先保存当前修改。" : "Exports the selected saved version, actual ancestry, sources, and evidence. Save current edits first."}</p></div></aside></div>
    {exportText && <section className="obs-section obs-panel"><h2>{lang ? "导出文本" : "Export text"}</h2><p>{lang ? "如果浏览器没有开始下载，可选择并复制完整文本，保存为 JSON 或 Markdown。" : "If your browser does not start the download, select and copy this complete text into a JSON or Markdown file."}</p><label className="obs-field"><span>{lang ? "所选保存版本的导出内容" : "Export of the selected saved version"}</span><textarea aria-label={lang ? "导出文本" : "Export text"} readOnly rows={14} value={exportText} onFocus={(event) => event.currentTarget.select()} /></label></section>}
  </>;
}
