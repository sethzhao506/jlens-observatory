import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { PhoneBar } from "@aihot/web/components/shell/PhoneBar";
import { buttonClass } from "@aihot/web/components/ui/Controls";
import "./style.css";

export type Lang = 0 | 1;
export const language = (search: string): Lang => new URLSearchParams(search).get("lang") === "zh" ? 1 : 0;
export const localized = (path: string, lang: Lang) => {
  const [address, hash] = path.split("#");
  const [pathname, search] = address.split("?");
  const query = new URLSearchParams(search);
  query.set("lang", lang ? "zh" : "en");
  return `${pathname}?${query}${hash ? `#${hash}` : ""}`;
};
export const text = (value: string | string[] | null | undefined, lang: Lang) => Array.isArray(value) ? value[lang] ?? value[0] ?? "" : value ?? "";

export function ResearchFrame({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const lang = language(search);
  const query = new URLSearchParams(search); query.set("lang", lang ? "en" : "zh");
  const titles: Record<string, [string, string]> = { "/explore": ["Research graph", "研究图谱"], "/evidence": ["Evidence", "证据"], "/try": ["Try", "小检查"], "/investigate": ["Investigate", "调查计划"] };
  const title = titles[pathname]?.[lang] ?? (lang ? "研究" : "Research");
  const toggle = <Link className={buttonClass("secondary")} to={`${pathname}?${query}${hash}`} aria-label={lang ? "Switch to English" : "切换为中文"}>{lang ? "EN" : "中文"}</Link>;
  return <div className="observatory" lang={lang ? "zh-CN" : "en"}>
    <PhoneBar back={{ to: "/", label: lang ? "精选" : "Selected" }} title={title} actions={toggle} />
    <div className="mb-4 hidden items-center justify-between border-b border-line pb-4 lg:flex"><nav className="flex flex-wrap items-center gap-5 text-[13px] text-ink-3" aria-label={lang ? "研究工具" : "Research tools"}><Link className="hover:text-accent" to={localized("/explore", lang)}>{lang ? "研究图谱" : "Research graph"}</Link><Link className="hover:text-accent" to={localized("/try", lang)}>{lang ? "小检查" : "Try"}</Link><Link className="hover:text-accent" to={localized("/investigate", lang)}>{lang ? "调查计划" : "Investigate"}</Link><Link className="hover:text-accent" to="/all">{lang ? "全部动态" : "All updates"}</Link></nav>{toggle}</div>
    {children}
  </div>;
}
