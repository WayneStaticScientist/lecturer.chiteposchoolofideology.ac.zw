"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Radio } from "lucide-react";

import {
  bucketOf,
  formatSessionDate,
  partitionSchedules,
  type CourseLiveSchedule,
  type LiveSessionFilter,
  type ScheduleBucket,
} from "@/lib/live-schedules";

const filterTabs: { id: LiveSessionFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

function StatusBadge({ bucket }: { bucket: ScheduleBucket }) {
  if (bucket === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
        Live
      </span>
    );
  }
  if (bucket === "upcoming") {
    return (
      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      Past
    </span>
  );
}

function SessionRow({
  schedule,
  courseId,
}: {
  schedule: CourseLiveSchedule;
  courseId: string;
}) {
  const bucket = bucketOf(schedule);
  const isPast = bucket === "past";

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between ${
        isPast
          ? "border-slate-200 bg-slate-50/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge bucket={bucket} />
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <CalendarClock size={14} />
            {formatSessionDate(schedule.startTime)}
          </span>
        </div>
        <h3
          className={`font-bold ${isPast ? "text-slate-600" : "text-slate-800"}`}
        >
          {schedule.title}
        </h3>
        {schedule.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {schedule.summary}
          </p>
        )}
      </div>

      {bucket === "live" && (
        <Link
          href={`/courses/${courseId}/live/${schedule._id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Open studio
        </Link>
      )}
      {bucket === "upcoming" && (
        <Link
          href={`/courses/${courseId}/live/${schedule._id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Prepare session
        </Link>
      )}
      {bucket === "past" && (
        <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-400">
          Session ended
        </span>
      )}
    </article>
  );
}

export default function CourseLiveSessionsPanel({
  schedules,
  courseId,
  onScheduleClick,
}: {
  schedules: CourseLiveSchedule[];
  courseId: string;
  onScheduleClick: () => void;
}) {
  const [filter, setFilter] = useState<LiveSessionFilter>("all");
  const partitioned = useMemo(() => partitionSchedules(schedules), [schedules]);

  const counts = useMemo(
    () => ({
      all: schedules.length,
      live: partitioned.live.length,
      upcoming: partitioned.upcoming.length,
      past: partitioned.past.length,
    }),
    [schedules.length, partitioned],
  );

  const visible = useMemo(() => {
    if (filter === "live") return partitioned.live;
    if (filter === "upcoming") return partitioned.upcoming;
    if (filter === "past") return partitioned.past;
    return [
      ...partitioned.live,
      ...partitioned.upcoming,
      ...partitioned.past,
    ];
  }, [filter, partitioned]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Radio size={22} className="text-primary" />
            Live sessions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Past sessions stay on record for reference. Only live and upcoming
            sessions can be opened in the studio.
          </p>
        </div>
        <button
          type="button"
          onClick={onScheduleClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
        >
          Schedule live
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              filter === tab.id
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-80">({counts[tab.id]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">
            {schedules.length === 0
              ? "No live sessions for this course yet."
              : "No sessions in this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((schedule) => (
            <SessionRow
              key={schedule._id}
              courseId={courseId}
              schedule={schedule}
            />
          ))}
        </div>
      )}
    </section>
  );
}
