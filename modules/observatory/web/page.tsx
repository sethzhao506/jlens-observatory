import { redirect, useLoaderData, useLocation } from "react-router";
import { apiGet } from "@aihot/web/lib/api.server";
import { renderMarkdown } from "@aihot/web/lib/markdown";
import { listPath, pageMeta, siteLd } from "@aihot/web/lib/seo";
import { ResearchFrame, language, localized, text, type Lang } from "./shell.tsx";
import { Arrow, Badge, CurvePlot, Eyebrow, Note, PageHeader, SourceLink, type ObservatoryDocument } from "./ui.tsx";
import { EvolutionGraph } from "./graph.tsx";
import { TryCheck } from "./try.tsx";
import { InvestigationLab } from "./lab.tsx";
import { CoverageDetails } from "./coverage.tsx";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname === "/research-updates") throw redirect(`/all${url.search}`);
  const doc = await apiGet<ObservatoryDocument>("/api/v1/observatory", { signal: request.signal });
  if (url.pathname.startsWith("/branches/") && !doc.branches.some((branch) => branch.id === url.pathname.slice("/branches/".length))) throw new Response("Research branch not found", { status: 404 });
  return { doc };
}
export function meta({ location }: { location: { pathname: string; search: string } }) {
  const lang = language(location.search), query = new URLSearchParams(location.search);
  const path = location.pathname === "/evidence" || location.pathname.startsWith("/branches/") ? "/explore" : location.pathname;
  const canonical: Record<string, string> = {};
  if (lang) canonical.lang = "zh";
  if (path === "/explore") {
    for (const key of ["view", "branch", "node", "edge"]) { const value = query.get(key); if (value) canonical[key] = value; }
    if (location.pathname === "/evidence") canonical.view = "evidence";
    if (location.pathname.startsWith("/branches/")) canonical.branch = location.pathname.slice("/branches/".length);
  }
  if (path === "/research-updates") for (const key of ["q", "cursor"]) { const value = query.get(key)?.trim(); if (value) canonical[key] = key === "q" ? value.slice(0, 200) : value; }
  if (path === "/try" || path === "/investigate") { const evidence = query.get("evidence"); if (evidence) canonical.evidence = evidence; }
  const titles: Record<string, [string, string]> = { "/": ["J-lens Research Observatory", "J-lens 研究观测站"], "/understand": ["Understand J-lens", "看懂 J-lens"], "/explore": ["Research evolution graph", "研究演化图"], "/research-updates": ["Research updates", "研究更新"], "/try": ["Try a deterministic check", "确定性小检查"], "/investigate": ["Investigate the Ouro question", "调查 Ouro 问题"] };
  const title = titles[path]?.[lang] ?? titles["/"][lang];
  const metadata = pageMeta({ title, rawTitle: path === "/", path: listPath(path, canonical), description: lang ? "看懂 J-lens，追溯研究与证据，完成一次小检查，再提出可检验的下一步问题。首个案例：looped LM 与 Ouro。" : "Understand J-lens, trace research and evidence, try a small check, and investigate the next question. First case: looped language models and Ouro.", noindex: ["q", "cursor", "node", "edge", "evidence"].some((key) => Boolean(canonical[key])), jsonLd: path === "/" ? siteLd().filter((entry) => entry["@type"] === "Organization" || entry["@type"] === "WebSite") : undefined });
  return metadata.map((entry) => "property" in entry && entry.property === "og:locale" ? { ...entry, content: lang ? "zh_CN" : "en" } : entry);
}

export const handle = { tab: "research", name: "研究" };
export default function ObservatoryPage() {
  const { doc } = useLoaderData<typeof loader>();
  const { pathname, search } = useLocation();
  const lang = language(search);
  const content = pathname === "/explore" || pathname === "/evidence" || pathname.startsWith("/branches/") ? <EvolutionGraph doc={doc} lang={lang} />
    : pathname === "/try" ? <TryCheck doc={doc} lang={lang} />
    : pathname === "/investigate" ? <InvestigationLab key={lang} doc={doc} lang={lang} />
    : <Understand doc={doc} lang={lang} />;
  return <ResearchFrame>{content}</ResearchFrame>;
}
function Understand({ doc, lang }: { doc: ObservatoryDocument; lang: Lang }) {
  const steps = lang ? [
    ["一个具体问题", "假设模型正回答：『埃菲尔铁塔所在国家的首都是哪里？』中间计算可能涉及『法国』，最终答案是『巴黎』。我们能否在回答前读出中间概念？"],
    ["Lens 在测量什么", "J-lens 用与输出词表关联的方向探查模型状态。它是一种测量工具；读出的词只是对内部表征的描述，不是模型逐字写下的思想。"],
    ["失败存在多种解释", "没有读出『法国』，可能是信号弱、终点太远、校准不足或描述不合适。它本身不能说明概念不存在。成功读出，也不证明模型实际使用了它。"],
  ] : [
    ["A concrete question", "Imagine a model answering: “What is the capital of the country containing the Eiffel Tower?” Its intermediate computation may involve “France”; its final answer is “Paris.” Can we read the intermediate concept before the answer?"],
    ["What a lens measures", "J-lens probes a model state with directions linked to its output vocabulary. The words are a measurement of the representation, rather than a transcript of a model’s thoughts."],
    ["A failed readout has several explanations", "Perhaps the signal is weak, the target is too distant, calibration is inadequate, or the description is unsuitable. Failure alone does not establish absence. Success alone does not establish causal use."],
  ];
  return <div className="obs-reading-page"><PageHeader number={lang ? "01 / 短导读 · 约 4 分钟" : "01 / UNDERSTAND · ABOUT 4 MINUTES"} title={lang ? "读得出，与实际使用，是两个问题。" : "Reading information is one question. Using it is another."} lead={lang ? "从一个例子开始，再看为什么 Ouro 的目标出口值得检查。" : "Start with one example, then see why the Ouro target exit is worth checking."} />
    <div className="obs-example"><span>{lang ? "问题" : "QUESTION"}</span><p>{lang ? "埃菲尔铁塔所在国家的首都？" : "Capital of the country containing the Eiffel Tower?"}</p><div><span>{lang ? "埃菲尔铁塔" : "Eiffel Tower"}</span><b aria-hidden="true">→</b><span className="obs-example-middle">{lang ? "法国？" : "France?"}</span><b aria-hidden="true">→</b><span>{lang ? "巴黎" : "Paris"}</span></div><small>{lang ? "说明性例子，并非新增实验记录。" : "Illustrative example, not an additional experiment."}</small></div>
    <div className="obs-guide-steps">{steps.map(([title, paragraph], i) => <section key={title}><span>0{i + 1}</span><div><h2>{title}</h2><p>{paragraph}</p></div></section>)}</div>
    <section className="obs-reading-section"><Eyebrow>{lang ? "为什么看 OURO" : "WHY OURO?"}</Eyebrow><h2>{lang ? "共享权重，不等于每一轮有同样的读出条件。" : "Shared weights do not mean identical readout conditions."}</h2><p>{lang ? "Looped LM 反复使用计算模块。本轮出口 lens 距离当前状态较近；最终终点 lens 需要跨越更多计算。来源报告的正差值支持一个有范围的判断：这个设置下，可恢复性取决于目标。" : "A looped language model reuses a computation block. An own-exit lens targets the current pass’s exit; a final-target lens looks across more computation. The positive reported contrast supports a scoped observation: recoverability depends on the target in this setting."}</p><p>{lang ? "它没有独立区分计算距离、概念强度、校准预算和出口相关结构。接下来的小检查先验证汇总算术，再把无法回答的问题交给实验提案。" : "It does not independently separate computation distance, concept strength, calibration budget, and exit-related structure. Our small check verifies the aggregate arithmetic, then turns the unresolved explanations into an experiment proposal."}</p><SourceLink source={doc.sources.find((s) => s.id === "ouro")!} lang={lang} /></section>
    <Note title={lang ? "阅读边界" : "Keep the scientific boundary visible"}>{lang ? "来源真实、来源支持主张、主张被独立验证，是三个不同状态。这个案例有来源报告、本站算术和未运行提案，尚无本站模型实验。" : "A real source, a source supporting a claim, and independent verification are distinct states. This case contains a source report, local arithmetic, and an unrun proposal. It contains no model experiment run by this Observatory."}</Note>
    <div className="obs-actions"><Arrow to="/explore?node=ouro" lang={lang} primary>{lang ? "沿演化图继续" : "Continue through the graph"}</Arrow><Arrow to="/try" lang={lang}>{lang ? "直接做小检查" : "Try the small check"}</Arrow></div>
    <CoverageDetails coverage={doc.searchCoverage} lang={lang} />
    <details className="obs-details"><summary>{lang ? "展开完整双语长文、公式与来源" : "Open the full guide, technical detail, and references"}</summary><div className="obs-prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.guideLong[lang ? "zh" : "en"], "https://jlens.invalid").html }} /></details>
    <details className="obs-details"><summary>{lang ? "网站研究流程的设计参考" : "Design references for the research workflow"}</summary><div className="obs-source-list">{doc.backgroundReferences.map((reference) => <article key={reference.id}><div><a className="obs-source-link" href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a><p>{text(reference.purpose, lang)}</p><p className="obs-small">{lang ? "仅核对摘要或仓库概述；尚未集成，不是 J-lens 主张的证据。" : "Abstract or repository overview inspected only. Not integrated; not evidence for a J-lens claim."}</p></div></article>)}</div></details>
  </div>;
}
