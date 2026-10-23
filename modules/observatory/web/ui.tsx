import type { ReactNode } from "react";
import { Link } from "react-router";
import { localized, text, type Lang } from "./shell.tsx";
import type { DiscussionDocument, ResearchEntry } from "../research.ts";

export type ObservatoryDocument = Omit<typeof import("../data/observatory.json"), "researchCatalog" | "discussions"> & { researchCatalog: ResearchEntry[]; discussions: DiscussionDocument };
export type Source = ObservatoryDocument["sources"][number];
export function Arrow({ children, to, lang, primary = false }: { children: ReactNode; to: string; lang: Lang; primary?: boolean }) {
  return <Link className={`obs-button${primary ? " obs-button-primary" : ""}`} to={localized(to, lang)}>{children}<span aria-hidden="true">↗</span></Link>;
}
export function Eyebrow({ children }: { children: ReactNode }) { return <p className="obs-eyebrow">{children}</p>; }
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) { return <span className={`obs-badge obs-badge-${tone}`}>{children}</span>; }
export function PageHeader({ number, title, lead, children }: { number: string; title: string; lead: string; children?: ReactNode }) {
  return <div className="obs-page-header"><Eyebrow>{number}</Eyebrow><h1 data-page-title="">{title}</h1><p className="obs-lead">{lead}</p>{children}</div>;
}
export function SourceLink({ source, lang }: { source: Source; lang: Lang }) { return <a className="obs-source-link" href={"pinnedUrl" in source && typeof source.pinnedUrl === "string" ? source.pinnedUrl : source.url} target="_blank" rel="noreferrer">{text(source.label, lang)} <span aria-hidden="true">↗</span></a>; }
export function SourceInspector({ source, lang }: { source: Source; lang: Lang }) {
  return <>
    <Eyebrow>{lang ? "研究节点" : "RESEARCH NODE"}</Eyebrow>
    <Badge tone="amber">{lang ? "人工审核待完成" : "Human review pending"}</Badge>
    <h2>{text(source.label, lang)}</h2>
    <p>{text(source.summary, lang)} <SourceLink source={source} lang={lang} /></p>
    <dl className="obs-record">
      <dt>{lang ? "适用范围" : "Scope"}</dt><dd>{text(source.scope, lang)}</dd>
      <dt>{lang ? "局限" : "Limit"}</dt><dd>{text(source.limitation, lang)}</dd>
      <dt>{lang ? "原文定位" : "Locator"}</dt><dd>{text(source.locator, lang)}</dd>
    </dl>
    <details className="obs-details obs-inspection">
      <summary>{lang ? "来源核对与时间记录" : "Source inspection and dates"}</summary>
      <dl className="obs-record">
        <dt>{lang ? "机器来源核对" : "Machine source inspection"}</dt><dd>{source.machineInspectedAt ?? (lang ? "未记录" : "Not recorded")}</dd>
        <dt>{lang ? "核对范围" : "Inspection scope"}</dt><dd>{source.inspectionScope}</dd>
        <dt>{lang ? "发表时间" : "Published"}</dt><dd>{source.publishedAt ?? (lang ? "未知" : "Unknown")}</dd>
        <dt>{lang ? "版本更新时间" : "Version updated"}</dt><dd>{source.versionUpdatedAt ?? (lang ? "未知" : "Unknown")}</dd>
        <dt>{lang ? "首次发现时间" : "First discovered"}</dt><dd>{source.firstDiscoveredAt ?? (lang ? "未记录" : "Not recorded")}</dd>
        <dt>{lang ? "人工审核时间" : "Human reviewed"}</dt><dd>{source.humanReviewedAt ?? (lang ? "待审核" : "Pending")}</dd>
      </dl>
    </details>
    {source.id === "ouro" && <Arrow to="/explore?view=evidence&node=ouro-target" lang={lang} primary>{lang ? "查看它支持的主张" : "Inspect the scoped claim"}</Arrow>}
  </>;
}
export function Note({ title, children }: { title: string; children: ReactNode }) { return <aside className="obs-note"><strong>{title}</strong><div>{children}</div></aside>; }
export function CurvePlot({ curve, lang, small = false }: { curve: ObservatoryDocument["curves"][number]; lang: Lang; small?: boolean }) {
  const points = curve.points;
  const low = Math.min(0, ...points.map((p) => p[1]));
  const high = Math.max(1, ...points.map((p) => p[1]));
  const y = (v: number) => 150 - (v - low) / (high - low) * 112;
  const x = (i: number) => 60 + i / Math.max(1, points.length - 1) * 300;
  return <figure className={`obs-curve${small ? " obs-curve-small" : ""}`}><svg viewBox="0 0 420 205" role="img" aria-label={`${text(curve.label, lang)}: ${points.map(([pass, value]) => `${lang ? "轮次" : "pass"} ${pass}: ${value}`).join(", ")}`}>
    {[0, 1, 2].map((n) => <line key={n} x1="48" x2="380" y1={38 + n * 56} y2={38 + n * 56} className="obs-chart-grid" />)}
    <polyline points={points.map((p, i) => `${x(i)},${y(p[1])}`).join(" ")} className="obs-chart-line" />
    {points.map(([pass, value], i) => <g key={pass}><circle cx={x(i)} cy={y(value)} r="5" className="obs-chart-point" /><text x={x(i)} y={y(value) - 14} textAnchor="middle" className="obs-chart-value">{value.toFixed(2)}</text><text x={x(i)} y="176" textAnchor="middle" className="obs-chart-label">{lang ? `第 ${pass} 轮` : `Pass ${pass}`}</text></g>)}
    <text x="48" y="20" className="obs-chart-label">{lang ? "百分点 · 来源报告汇总值" : "percentage points · reported aggregates"}</text>
  </svg><figcaption>{text(curve.label, lang)} · {curve.metric}</figcaption></figure>;
}
