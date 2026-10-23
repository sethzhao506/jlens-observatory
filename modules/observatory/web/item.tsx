import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import type { SiteItemDetail } from "@aihot/contracts/site";
import type { discussionForItem } from "../research.ts";
import { DiscussionNotes } from "./discussions.tsx";
import { language, text, type Lang } from "./shell.tsx";

type DiscussionSnapshot = ReturnType<typeof discussionForItem> & { checkedAt: string };
type State = { status: "loading" } | { status: "failed" } | { status: "ready"; snapshot: DiscussionSnapshot };

export default function ItemDiscussions({ item }: { item: SiteItemDetail }) {
  const relevant = item.id.startsWith("jlens-") || /\b(?:[jr][ -]?lens|jacobian[ -]?lens|j\+\+\s*lens|ouro|huginn|workspacebench)\b|J-space|读出方法|循环语言模型/i.test([item.title, item.originalTitle, item.summary].filter(Boolean).join(" "));
  return relevant ? <ResearchDiscussion key={item.id} item={item} /> : null;
}

function ResearchDiscussion({ item }: { item: SiteItemDetail }) {
  const { search } = useLocation();
  const [lang, setLang] = useState<Lang>(() => language(search));
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const completeInspection = state.status === "ready" && state.snapshot.posts.every((post) => post.status === "ok" && post.countsReconciled);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`/api/v1/research-discussions?item=${encodeURIComponent(item.id)}`, {
      headers: { Accept: "application/json" }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Discussion snapshot unavailable");
      const snapshot = await response.json() as DiscussionSnapshot;
      if (snapshot.itemId !== item.id || !Array.isArray(snapshot.posts) || !Array.isArray(snapshot.notes) || !["checked_snapshot", "not_checked"].includes(snapshot.status)) throw new Error("Invalid discussion snapshot");
      if (!controller.signal.aborted) setState({ status: "ready", snapshot });
    }).catch(() => { if (!controller.signal.aborted) setState({ status: "failed" }); });
    return () => controller.abort();
  }, [item.id, attempt]);
  return <section className="mt-10 border-t border-line pt-5" aria-labelledby="research-discussion-title" lang={lang ? "zh-CN" : "en"}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id="research-discussion-title" className="text-[14px] font-semibold text-ink">{lang ? "讨论观点" : "Discussion viewpoints"}</h2>
      <button type="button" onClick={() => setLang(lang ? 0 : 1)} className="rounded-control border border-line px-2 py-1 text-[12px] text-ink-3 hover:text-accent" aria-label={lang ? "Switch discussion to English" : "讨论切换为中文"}>{lang ? "EN" : "中文"}</button>
    </div>
    <p className="mb-3 text-[12px] leading-relaxed text-ink-4">{lang ? "精选技术观点为编辑性转述，尚待人工审核；高分与作者身份只帮助发现线索，不是独立验证。" : "Selected technical viewpoints are editorial paraphrases awaiting human review. Scores and author names help discovery; they do not establish independent validation."}</p>
    {state.status === "loading" && <p role="status" className="text-[13px] text-ink-3">{lang ? "正在读取讨论记录……" : "Loading discussion records…"}</p>}
    {state.status === "failed" && <div role="alert" className="text-[13px] leading-relaxed text-ink-3"><p>{lang ? "讨论记录暂时无法读取；这不代表原帖没有评论。" : "Discussion records could not load. This does not mean the source has no comments."}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-2 text-accent hover:underline">{lang ? "重试" : "Retry"}</button></div>}
    {state.status === "ready" && <>
      {state.snapshot.status === "not_checked" ? <p className="text-[13px] leading-relaxed text-ink-3">{lang ? "尚未检查该资料的讨论；不能据此判断没有评论或争议。" : "Discussion on this material has not been checked. Absence of a record does not establish absence of comments or disagreement."}</p>
        : <>
          {!completeInspection && <p className="mb-3 text-[13px] leading-relaxed text-ink-3">{lang ? "本轮来源检查失败或数量未对齐，讨论覆盖仍不完整。" : "Source inspection failed or counts were not reconciled; discussion coverage remains incomplete."}</p>}
          {completeInspection && !state.snapshot.notes.length && <p className="mb-3 text-[13px] leading-relaxed text-ink-3">{lang ? "已检查来源讨论，本轮没有选入观点；不表示不存在其他有用观点。" : "Source discussion was checked; no viewpoints were selected in this pass. Other useful viewpoints may remain."}</p>}
          <DiscussionNotes notes={state.snapshot.notes} lang={lang} />
          <details className="mt-3 text-[12px] leading-relaxed text-ink-4"><summary className="cursor-pointer hover:text-ink-2">{lang ? "检查覆盖范围与收录依据" : "Inspection coverage and selection policy"}</summary>
            <p className="mt-2">{text(state.snapshot.selectionPolicy, lang)}</p>
            <ul className="mt-2 space-y-3">{state.snapshot.posts.map((post) => <li key={post.postId}>
              <a href={post.originalUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">{post.title} ↗</a>
              <p>{lang ? "检查于" : "Checked"}: <time dateTime={post.checkedAt}>{post.checkedAt}</time></p>
              <p>{lang ? "抓取到评论" : "Comments retrieved"}: {post.retrievedCommentCount} · {lang ? "来源报告评论数" : "Source-reported count"}: {post.reportedCommentCount ?? (lang ? "未知" : "Unknown")} · {post.countsReconciled ? lang ? "数量已对齐" : "Counts reconciled" : lang ? "数量未对齐，覆盖不完整" : "Counts not reconciled; coverage incomplete"}</p>
              {post.status !== "ok" && <p>{lang ? "来源检查未成功完成" : "Source inspection did not complete successfully"} · {post.status}</p>}
            </li>)}</ul>
          </details>
        </>}
    </>}
    <noscript><p className="mt-3 text-[12px] text-ink-3"><a href={item.links.original} target="_blank" rel="noreferrer">Read the original source and discussion ↗</a></p></noscript>
  </section>;
}
