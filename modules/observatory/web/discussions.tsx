import { Link } from "react-router";
import type { DiscussionNote } from "../research.ts";
import { localized, text, type Lang } from "./shell.tsx";

function RecordedTime({ value, lang }: { value: string | null; lang: Lang }) {
  return value ? <time dateTime={value}>{value.replace("T", " ").replace(/\.\d+Z$/, " UTC")}</time> : <span>{lang ? "未记录" : "Not recorded"}</span>;
}

/** Editorial paraphrases retain the comment, reply context, observation time and review boundary. */
export function DiscussionNotes({ notes, lang, onSelect }: { notes: DiscussionNote[]; lang: Lang; onSelect?: (id: string) => void }) {
  return <ul className="divide-y divide-line-soft">
    {notes.map((note) => <li key={note.id} className="py-4 first:pt-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12px] text-ink-4">
        <strong className="text-[13px] font-semibold text-ink">{note.author.displayName}</strong>
        <span>{note.platform}</span>
        <span>{lang ? "发表于" : "Posted"}: <RecordedTime value={note.postedAt} lang={lang} /></span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{text(note.summary, lang)}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{text(note.limitation, lang)}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] leading-relaxed text-ink-4">
        <span>{lang ? "来源评分" : "Source score"}: {note.baseScore ?? (lang ? "未记录" : "Not recorded")}</span>
        <span>{lang ? "投票数" : "Vote count"}: {note.voteCount ?? (lang ? "未记录" : "Not recorded")}</span>
        <span>{lang ? "来源检查于" : "Source checked"}: <RecordedTime value={note.checkedAt} lang={lang} /></span>
        <span>{note.humanReviewedAt ? <>{lang ? "人工审核于" : "Human reviewed"}: <RecordedTime value={note.humanReviewedAt} lang={lang} /></> : lang ? "尚待人工审核" : "Human review pending"}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-accent">
        <a href={note.originalUrl} target="_blank" rel="noreferrer" className="hover:underline">{lang ? "原评论" : "Original comment"} ↗</a>
        <a href={note.postUrl} target="_blank" rel="noreferrer" className="hover:underline">{lang ? "讨论原帖" : "Source post"} ↗</a>
        {note.parentCommentUrl && <a href={note.parentCommentUrl} target="_blank" rel="noreferrer" className="hover:underline">{lang ? "上文评论" : "Parent comment"} ↗</a>}
        {onSelect ? <button type="button" onClick={() => onSelect(note.id)} className="text-left hover:underline">{lang ? "在图谱看" : "View in graph"} →</button>
          : <Link to={localized(`/explore?node=${encodeURIComponent(note.id)}`, lang)} className="hover:underline">{lang ? "在图谱看" : "View in graph"} →</Link>}
      </div>
    </li>)}
  </ul>;
}
