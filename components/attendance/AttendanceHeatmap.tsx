"use client";

import React, { useMemo } from "react";

export type HeatmapDay = { date: string; count: number };

function levelForCount(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return count >= 1 ? 4 : 0;
  const ratio = count / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

const LEVEL_CLASS = [
  "bg-slate-100",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function parseUtcDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AttendanceHeatmap({
  days,
  year,
  title = "Attendance",
  subtitle,
}: {
  days: HeatmapDay[];
  year: number;
  title?: string;
  subtitle?: string;
}) {
  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of days) {
      map.set(row.date, row.count);
    }
    return map;
  }, [days]);

  const { weeks, maxCount, total } = useMemo(() => {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31));
    const startDow = start.getUTCDay();
    const gridStart = new Date(start);
    gridStart.setUTCDate(gridStart.getUTCDate() - startDow);

    const cells: { date: string; count: number }[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= end || cursor.getUTCDay() !== 0) {
      const iso = toIsoDate(cursor);
      const inYear = cursor.getUTCFullYear() === year;
      cells.push({
        date: iso,
        count: inYear ? countByDate.get(iso) ?? 0 : 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      if (cursor > end && cursor.getUTCDay() === 0) break;
    }

    const weekColumns: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekColumns.push(cells.slice(i, i + 7));
    }

    let max = 0;
    let sum = 0;
    for (const row of days) {
      max = Math.max(max, row.count);
      sum += row.count;
    }

    return { weeks: weekColumns, maxCount: max, total: sum };
  }, [countByDate, days, year]);

  const monthLabels = useMemo(() => {
    return weeks.map((week) => {
      const firstInYear = week.find(
        (c) => parseUtcDate(c.date).getUTCFullYear() === year,
      );
      if (!firstInYear) return "";
      const d = parseUtcDate(firstInYear.date);
      return d.getUTCDate() <= 7 ? d.toLocaleString("en", { month: "short" }) : "";
    });
  }, [weeks, year]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-bold text-primary">{total}</span> live sessions
          in {year}
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex min-w-0 flex-col gap-1">
          <div className="flex gap-[3px] pl-8 text-[10px] font-medium text-slate-400">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[11px] flex-shrink-0 text-center">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col justify-between py-[2px] text-[10px] text-slate-400">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell) => {
                    const inYear = parseUtcDate(cell.date).getUTCFullYear() === year;
                    const level = inYear ? levelForCount(cell.count, maxCount) : 0;
                    return (
                      <div
                        key={cell.date}
                        title={
                          inYear
                            ? `${cell.date}: ${cell.count} session${cell.count === 1 ? "" : "s"}`
                            : cell.date
                        }
                        className={`h-[11px] w-[11px] rounded-sm ${inYear ? LEVEL_CLASS[level] : "bg-transparent"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>Less</span>
        {LEVEL_CLASS.map((cls, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
