import Link from "next/link";
import { formatTime, type EventRecord } from "@/lib/agenda/constants";

export function EventPreview({ event }: { event: EventRecord }) {
  return <Link href={`/agenda/${event.id}/modifier`} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] p-3 transition hover:border-[var(--mint)]"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--coral)]" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[var(--ink)]">{event.title}</span><span className="mt-1 block text-xs text-[var(--ink-soft)]">{event.is_all_day ? "Toute la journée" : `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}{event.location ? ` · ${event.location}` : ""}</span></span></Link>;
}
