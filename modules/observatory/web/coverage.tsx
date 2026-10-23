import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import type { Lang } from "./shell.tsx";

type CoverageText = string | string[];
export interface SearchCoverage {
  inspectedOn: string;
  catalogEntries: number;
  datedEntries: number;
  newEntries: number;
  newDirectCitingWorks: number;
  newDiscussions: number;
  totalCitations: number | null;
  rootWork: { title: string; url: string; arxivId: string };
  methods: Array<{ provider: CoverageText; query: CoverageText; status: CoverageText; note: CoverageText }>;
  limits: CoverageText;
  undated: Array<{ id: string; title: CoverageText; platform: string }>;
  newDirectCitingRecords?: Array<{ id: string; title: CoverageText; url: string; locator: CoverageText }>;
  companionPosts?: Array<{ workId: string; itemId: string; title: CoverageText; url: string; publishedAt: string | null; note: CoverageText }>;
}
const coverageText = (value: CoverageText, lang: Lang) => Array.isArray(value) ? value[lang] ?? value[0] ?? "" : value;

export function FeedCoverage() {
  const { pathname } = useLocation();
  if (pathname !== "/all") return null;
  return <p className="mb-3 mt-4 text-[12px] leading-relaxed text-ink-4 lg:mt-0">当前为整理中的相关资料索引，非完整引用清单；含未定日期资料。<Link to="/understand#search-coverage" className="ml-1 text-accent hover:underline">查看检索范围</Link></p>;
}

export function CoverageDetails({ coverage, lang }: { coverage: SearchCoverage; lang: Lang }) {
  const { hash } = useLocation();
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (hash === "#search-coverage" && details.current) details.current.open = true;
  }, [hash]);
  const facts = lang ? [
    ["本轮来源核对", coverage.inspectedOn],
    ["已整理资料", `${coverage.catalogEntries} 条，其中 ${coverage.datedEntries} 条有已知原始日期`],
    ["本轮新增资料", `${coverage.newEntries} 条`],
    ["本轮新增直接引用论文", `${coverage.newDirectCitingWorks} 篇（不是总引用数）`],
    ["本轮新增讨论", `${coverage.newDiscussions} 条`],
    ["全球引用总数", coverage.totalCitations === null ? "未知；尚未完成完整引用检索" : String(coverage.totalCitations)],
  ] : [
    ["Primary sources checked", coverage.inspectedOn],
    ["Catalogued materials", `${coverage.catalogEntries}, including ${coverage.datedEntries} with known original dates`],
    ["Materials added in this pass", String(coverage.newEntries)],
    ["Directly citing papers added in this pass", `${coverage.newDirectCitingWorks} (not a total citation count)`],
    ["Discussions added in this pass", String(coverage.newDiscussions)],
    ["Worldwide citation count", coverage.totalCitations === null ? "Unknown; no exhaustive citation search completed" : String(coverage.totalCitations)],
  ];
  return <details id="search-coverage" ref={details} className="obs-details">
    <summary>{lang ? "检索覆盖范围与尚未覆盖的资料" : "Search coverage and remaining gaps"}</summary>
    <div className="obs-prose">
      <p>{coverageText(coverage.limits, lang)}</p>
      <dl className="my-4 space-y-2">{facts.map(([label, value]) => <div key={label}><dt className="font-medium text-ink">{label}</dt><dd>{value}</dd></div>)}</dl>
      <p>{lang ? "引用核对起点：" : "Citation checks start from: "}<a href={coverage.rootWork.url} target="_blank" rel="noreferrer">{coverage.rootWork.title}</a> · <a href={`https://arxiv.org/abs/${coverage.rootWork.arxivId}`} target="_blank" rel="noreferrer">arXiv:{coverage.rootWork.arxivId}</a></p>
      <ul className="my-4">{coverage.methods.map((method, index) => <li key={index} className="mb-3"><strong>{coverageText(method.provider, lang)}</strong> · {coverageText(method.query, lang)}<br />{coverageText(method.status, lang)} — {coverageText(method.note, lang)}</li>)}</ul>
      {!!coverage.newDirectCitingRecords?.length && <details className="obs-details">
        <summary>{lang ? "本轮核对的直接引用论文" : "Directly citing papers checked in this pass"} ({coverage.newDirectCitingRecords.length})</summary>
        <p>{lang ? "这里的直接引用已定位到原文参考文献；引用不代表支持、独立验证或结论一致。" : "Direct citations are located in the original references. Citation alone does not establish support, independent verification, or agreement."}</p>
        <ol>{coverage.newDirectCitingRecords.map((record) => <li key={record.id} className="mb-3 break-words"><Link to={`/items/${record.id}`}>{coverageText(record.title, lang)}</Link><br /><a href={record.url} target="_blank" rel="noreferrer">{lang ? "参考文献原文" : "Original references"} ↗</a> · {coverageText(record.locator, lang)}</li>)}</ol>
      </details>}
      {!!coverage.companionPosts?.length && <details className="obs-details">
        <summary>{lang ? "同一研究的作者导读" : "Author introductions to the same works"}</summary>
        <p>{lang ? "导读与对应论文是同一研究的不同入口，不重复计为一项研究或独立支持。" : "These posts and their corresponding papers are alternate entries to the same research, not additional works or independent support."}</p>
        <ul>{coverage.companionPosts.map((post) => <li key={post.url} className="mb-3 break-words"><a href={post.url} target="_blank" rel="noreferrer">{coverageText(post.title, lang)} ↗</a> · {post.publishedAt ? <time dateTime={post.publishedAt}>{post.publishedAt.slice(0, 10)}</time> : lang ? "原始日期未核实" : "original date unverified"}<br />{coverageText(post.note, lang)} · <Link to={`/items/${post.itemId}`}>{lang ? "对应论文" : "Corresponding paper"}</Link></li>)}</ul>
      </details>}
      {coverage.undated.length > 0 && <div>
        <h3>{lang ? "已收录、原始日期未核实" : "Catalogued, original date unverified"}</h3>
        <p>{lang ? "这些资料可阅读，但不以收录时间充当发表时间进入动态时间线。" : "These materials remain readable. Their collection dates are not substituted for publication dates in the updates timeline."}</p>
        <ul>{coverage.undated.map((item) => <li key={item.id}><Link to={`/items/${item.id}`}>{coverageText(item.title, lang)}</Link> · {item.platform} · {lang ? "原始发表时间未核实" : "original publication date unverified"}</li>)}</ul>
      </div>}
    </div>
  </details>;
}
