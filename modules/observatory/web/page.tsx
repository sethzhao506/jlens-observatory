import { redirect, useLoaderData, useLocation } from "react-router";
import { apiGet } from "@aihot/web/lib/api.server";
import { listPath, pageMeta, siteLd } from "@aihot/web/lib/seo";
import { ResearchFrame, language } from "./shell.tsx";
import type { ObservatoryDocument } from "./ui.tsx";
import { EvolutionGraph } from "./graph.tsx";
import { TryCheck } from "./try.tsx";
import { InvestigationLab } from "./lab.tsx";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  if (url.pathname === "/research-updates") throw redirect(`/all${url.search}`);
  const doc = await apiGet<ObservatoryDocument>("/api/v1/observatory", { signal: request.signal });
  if (url.pathname.startsWith("/branches/") && !doc.branches.some((branch) => branch.id === url.pathname.slice("/branches/".length))) throw new Response("Research branch not found", { status: 404 });
  return { doc };
}
export function meta({ location }: { location: { pathname: string; search: string } }) {
  const lang = language(location.search), query = new URLSearchParams(location.search);
  const path = location.pathname === "/understand" || location.pathname === "/evidence" || location.pathname.startsWith("/branches/") ? "/explore" : location.pathname;
  const canonical: Record<string, string> = {};
  if (lang) canonical.lang = "zh";
  if (path === "/explore") {
    for (const key of ["view", "branch", "node", "edge"]) { const value = query.get(key); if (value) canonical[key] = value; }
    if (location.pathname === "/evidence") canonical.view = "evidence";
    if (location.pathname.startsWith("/branches/")) canonical.branch = location.pathname.slice("/branches/".length);
  }
  if (path === "/research-updates") for (const key of ["q", "cursor"]) { const value = query.get(key)?.trim(); if (value) canonical[key] = key === "q" ? value.slice(0, 200) : value; }
  if (path === "/try" || path === "/investigate") { const evidence = query.get("evidence"); if (evidence) canonical.evidence = evidence; }
  const titles: Record<string, [string, string]> = { "/": ["J-lens Research Observatory", "J-lens 研究观测站"], "/explore": ["Research evolution graph", "研究演化图"], "/research-updates": ["Research updates", "研究更新"], "/try": ["Try a deterministic check", "确定性小检查"], "/investigate": ["Investigate the Ouro question", "调查 Ouro 问题"] };
  const title = titles[path]?.[lang] ?? titles["/"][lang];
  const metadata = pageMeta({ title, rawTitle: path === "/", path: listPath(path, canonical), description: lang ? "看懂 J-lens，追溯研究与证据，完成一次小检查，再提出可检验的下一步问题。首个案例：looped LM 与 Ouro。" : "Understand J-lens, trace research and evidence, try a small check, and investigate the next question. First case: looped language models and Ouro.", noindex: ["q", "cursor", "node", "edge", "evidence"].some((key) => Boolean(canonical[key])), jsonLd: path === "/" ? siteLd().filter((entry) => entry["@type"] === "Organization" || entry["@type"] === "WebSite") : undefined });
  return metadata.map((entry) => "property" in entry && entry.property === "og:locale" ? { ...entry, content: lang ? "zh_CN" : "en" } : entry);
}

export const handle = { tab: "research", name: "研究" };
export default function ObservatoryPage() {
  const { doc } = useLoaderData<typeof loader>();
  const { pathname, search } = useLocation();
  const lang = language(search);
  const content = pathname === "/try" ? <TryCheck doc={doc} lang={lang} />
    : pathname === "/investigate" ? <InvestigationLab key={lang} doc={doc} lang={lang} />
    : <EvolutionGraph doc={doc} lang={lang} />;
  return <ResearchFrame>{content}</ResearchFrame>;
}
