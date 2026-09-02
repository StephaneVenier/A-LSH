"use client";

import Link from "next/link";
import { addDays, eventColorClasses, formatDate, formatMonth, formatTime, getAgendaRange, isToday, listDates, parseDate, startOfWeek, toIsoDate } from "@/lib/agenda/constants";
import type { AgendaTask, AgendaView, EventRecord } from "@/lib/agenda/constants";

type Props = { date: string; view: AgendaView; events: EventRecord[]; tasks: AgendaTask[] };

function periodLabel(date: string, view: AgendaView) {
  if (view === "mois") return formatMonth(date);
  if (view === "jour") return formatDate(date, { dateStyle: "full" });
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  return `${formatDate(start, { day: "numeric", month: "long" })} – ${formatDate(end, { day: "numeric", month: "long", year: "numeric" })}`;
}

function navigationDate(date: string, view: AgendaView, direction: number) {
  const current = parseDate(date);
  if (view === "mois") current.setMonth(current.getMonth() + direction);
  else current.setDate(current.getDate() + (view === "semaine" ? 7 : 1) * direction);
  return toIsoDate(current);
}

function hrefFor(date: string, view: AgendaView) { return `/agenda?date=${date}&vue=${view}`; }
function eventHref(id: string) { return `/agenda/${id}/modifier`; }
function newEventHref(date: string, time?: string) { return `/agenda/nouvel-evenement?date=${date}${time ? `&heure=${time}` : ""}`; }

function EventPill({ event }: { event: EventRecord }) {
  return <Link href={eventHref(event.id)} className={`block truncate rounded-md border-l-4 px-2 py-1 text-xs font-bold ${eventColorClasses[event.color]}`} title={event.title}><span aria-hidden="true">{event.is_all_day ? "" : `${formatTime(event.start_time)} `}</span>{event.title}</Link>;
}

function TaskPill({ task }: { task: AgendaTask }) {
  return <Link href={`/taches/${task.id}/modifier`} className="block truncate rounded-md border-l-4 border-l-[var(--coral)] bg-[#fff0ed] px-2 py-1 text-xs font-bold text-[var(--coral-dark)]" title={`Tâche : ${task.title}`}><span aria-hidden="true">☑ </span>{task.due_time ? `${formatTime(task.due_time)} ` : ""}{task.title}</Link>;
}

function DayItems({ date, events, tasks, limit = 3 }: { date: string; events: EventRecord[]; tasks: AgendaTask[]; limit?: number }) {
  const dayEvents = events.filter((event) => event.start_date <= date && event.end_date >= date);
  const dayTasks = tasks.filter((task) => task.due_date === date);
  const items = [...dayEvents.map((event) => ({ key: `event-${event.id}`, element: <EventPill key={event.id} event={event} /> })), ...dayTasks.map((task) => ({ key: `task-${task.id}`, element: <TaskPill key={task.id} task={task} /> }))];
  return <>{items.slice(0, limit).map((item) => item.element)}{items.length > limit ? <span className="block px-2 text-xs font-semibold text-[var(--muted)]">+ {items.length - limit} autres</span> : null}</>;
}

function MonthView({ date, events, tasks }: Omit<Props, "view">) {
  const range = getAgendaRange(date, "mois");
  const dates = listDates(range.start, range.end);
  return <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white"><div className="hidden grid-cols-7 border-b border-[var(--line)] bg-[var(--background)] sm:grid">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <div key={day} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{day}</div>)}</div><div className="grid grid-cols-2 sm:grid-cols-7">{dates.map((day) => { const outside = parseDate(day).getMonth() !== parseDate(date).getMonth(); return <div key={day} className={`min-h-36 border-b border-r border-[var(--line)] p-2 ${outside ? "bg-[#fafbf8] text-[var(--muted)]/60" : ""}`}><div className="mb-2 flex items-center justify-between"><Link href={newEventHref(day)} className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold hover:bg-[var(--mint-pale)] ${isToday(day) ? "bg-[var(--coral)] text-white" : "text-[var(--ink)]"}`} aria-label={`Créer un événement le ${formatDate(day, { dateStyle: "long" })}`}>{parseDate(day).getDate()}</Link><span className="text-[0.65rem] font-bold uppercase text-[var(--muted)] sm:hidden">{new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(parseDate(day))}</span></div><div className="space-y-1"><DayItems date={day} events={events} tasks={tasks} /></div></div>; })}</div></div>;
}

function TimedItem({ event, task }: { event?: EventRecord; task?: AgendaTask }) {
  const time = event?.start_time ?? task?.due_time ?? null;
  const hour = time ? Number(time.slice(0, 2)) : 7;
  const minute = time ? Number(time.slice(3, 5)) : 0;
  const row = Math.max(1, Math.min(14, hour - 7 + 1));
  const label = event ? event.title : task?.title;
  const href = event ? eventHref(event.id) : `/taches/${task?.id}/modifier`;
  return <Link href={href} className={`absolute left-1 right-1 z-10 min-h-9 overflow-hidden rounded-md border-l-4 px-2 py-1 text-xs font-bold ${event ? eventColorClasses[event.color] : "border-l-[var(--coral)] bg-[#fff0ed] text-[var(--coral-dark)]"}`} style={{ top: `calc(${row - 1} * 52px + ${minute / 60 * 52}px + 2px)` }} title={label}>{event ? "" : "☑ "}{formatTime(time)} {label}</Link>;
}

function DayColumn({ date, events, tasks, compact = false }: { date: string; events: EventRecord[]; tasks: AgendaTask[]; compact?: boolean }) {
  const allDayEvents = events.filter((event) => event.start_date <= date && event.end_date >= date && event.is_all_day);
  const allDayTasks = tasks.filter((task) => task.due_date === date && !task.due_time);
  const timedEvents = events.filter((event) => event.start_date === date && !event.is_all_day);
  const timedTasks = tasks.filter((task) => task.due_date === date && task.due_time);
  return <div className={`min-w-0 ${compact ? "border-b border-[var(--line)] pb-4" : ""}`}><div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--background)] px-3 py-3"><span className="text-sm font-bold text-[var(--ink)]">{formatDate(date, { weekday: "long", day: "numeric", month: "short" })}</span>{isToday(date) ? <span className="rounded-full bg-[var(--coral)] px-2 py-1 text-[0.65rem] font-bold text-white">Aujourd’hui</span> : null}</div><div className="min-h-16 space-y-1 border-b border-[var(--line)] p-2"><p className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--muted)]">Toute la journée</p>{allDayEvents.map((event) => <EventPill key={event.id} event={event} />)}{allDayTasks.map((task) => <TaskPill key={task.id} task={task} />)}</div><div className="relative h-[676px] bg-white">{Array.from({ length: 13 }, (_, index) => <Link key={index} href={newEventHref(date, `${String(index + 7).padStart(2, "0")}:00`)} className="absolute left-0 right-0 h-[52px] border-b border-[var(--line)] hover:bg-[var(--mint-pale)]" style={{ top: `${index * 52}px` }} aria-label={`Créer un événement le ${date} à ${index + 7} heures`}><span className="sr-only">{index + 7} h</span></Link>)}{timedEvents.map((event) => <TimedItem key={event.id} event={event} />)}{timedTasks.map((task) => <TimedItem key={task.id} task={task} />)}</div></div>;
}

function WeekView({ date, events, tasks }: Omit<Props, "view">) {
  const dates = listDates(startOfWeek(date), addDays(startOfWeek(date), 6));
  return <><div className="mb-3 hidden gap-2 text-xs text-[var(--muted)] lg:flex"><span className="w-16 pt-2">Heure</span><div className="grid flex-1 grid-cols-7">{dates.map((day) => <div key={day} className="text-center font-bold">{formatDate(day, { weekday: "short" })}</div>)}</div></div><div className="hidden overflow-hidden rounded-3xl border border-[var(--line)] bg-white lg:grid lg:grid-cols-7">{dates.map((day) => <DayColumn key={day} date={day} events={events} tasks={tasks} />)}</div><div className="space-y-4 lg:hidden">{dates.map((day) => <DayColumn key={day} date={day} events={events} tasks={tasks} compact />)}</div></>;
}

function DayView({ date, events, tasks }: Omit<Props, "view">) { return <DayColumn date={date} events={events} tasks={tasks} />; }

export function AgendaView({ date, view, events, tasks }: Props) {
  return <div className="space-y-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2"><Link href={hrefFor(navigationDate(date, view, -1), view)} className="touch-target rounded-xl border border-[var(--line)] bg-white px-3 text-lg font-bold text-[var(--ink)] shadow-sm transition hover:border-[var(--mint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]" aria-label="Période précédente">‹</Link><Link href={hrefFor(toIsoDate(new Date()), view)} className="touch-target rounded-xl border border-[var(--line)] bg-white px-3 text-sm font-bold text-[var(--ink)] shadow-sm transition hover:border-[var(--mint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]">Aujourd’hui</Link><Link href={hrefFor(navigationDate(date, view, 1), view)} className="touch-target rounded-xl border border-[var(--line)] bg-white px-3 text-lg font-bold text-[var(--ink)] shadow-sm transition hover:border-[var(--mint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]" aria-label="Période suivante">›</Link></div><h2 className="order-first text-center text-xl font-bold capitalize text-[var(--ink)] lg:order-none lg:min-w-0 lg:flex-1">{periodLabel(date, view)}</h2><div className="agenda-view-switch lg:shrink-0">{(["mois", "semaine", "jour"] as const).map((item) => <Link key={item} href={hrefFor(date, item)} aria-current={view === item ? "page" : undefined} className={`agenda-view-tab ${view === item ? "agenda-view-tab-active" : ""}`}>{item}</Link>)}</div></div><div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-xs font-semibold text-[var(--ink-soft)]"><span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-[var(--green)] ring-2 ring-[var(--mint-light)]" />Événement</span><span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-[var(--coral)] ring-2 ring-[#ffd8ce]" />Tâche datée</span><span className="text-[var(--muted)]">Les éléments restent privés.</span></div>{view === "mois" ? <MonthView date={date} events={events} tasks={tasks} /> : view === "semaine" ? <WeekView date={date} events={events} tasks={tasks} /> : <DayView date={date} events={events} tasks={tasks} />}</div>;
}
