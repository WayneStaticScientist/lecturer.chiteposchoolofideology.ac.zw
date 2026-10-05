"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Clock,
  Layers,
  Loader2,
  Radio,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getLecturerDashboard,
  getLecturerOverviewStats,
  getLecturerSchedules,
} from "@/services/api";

interface OverviewStats {
  totalCourses: number;
  totalTopics: number;
  totalQuizzes: number;
  totalStudentsAttempted: number;
  averageScorePercentage: number;
}

interface ScheduleCourse {
  _id: string;
  title: string;
  code: string;
}

interface LecturerSchedule {
  _id: string;
  title: string;
  summary?: string;
  startTime: string;
  status: string;
  courseId?: ScheduleCourse | null;
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatSessionTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LecturerDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [schedules, setSchedules] = useState<LecturerSchedule[]>([]);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, schedulesRes, profileRes] = await Promise.all([
          getLecturerOverviewStats(),
          getLecturerSchedules(),
          getLecturerDashboard(),
        ]);
        setStats(overviewRes);
        setSchedules(schedulesRes.schedules || []);
        setFirstName(profileRes.user?.firstName || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const liveSessions = useMemo(
    () => schedules.filter((s) => s.status === "live"),
    [schedules],
  );

  const todaySessions = useMemo(() => {
    const today = new Date();
    return schedules
      .filter((s) => s.status !== "completed")
      .filter((s) => isSameCalendarDay(new Date(s.startTime), today))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [schedules]);

  const upcomingSessions = useMemo(() => {
    const now = Date.now();
    const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
    return schedules
      .filter((s) => s.status === "scheduled")
      .filter((s) => {
        const t = new Date(s.startTime).getTime();
        return t >= now && t <= weekAhead;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 6);
  }, [schedules]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">{error || "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Lecturer overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
          </h1>
          <p className="mt-2 text-slate-500">{todayLabel}</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Teaching activity, learner engagement, and upcoming live sessions at
            a glance.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-10">
        {liveSessions.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-primary/20 bg-primary text-white shadow-sm">
            <div className="border-b border-white/15 px-6 py-4 md:px-8">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Radio size={20} />
                Live now
              </h2>
            </div>
            <div className="space-y-3 p-6 md:p-8">
              {liveSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col gap-4 rounded-xl border border-white/20 bg-white/10 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    {session.courseId?.code && (
                      <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                        {session.courseId.code}
                      </span>
                    )}
                    <h3 className="mt-2 text-lg font-bold">{session.title}</h3>
                    {session.summary && (
                      <p className="mt-1 text-sm text-white/85">
                        {session.summary}
                      </p>
                    )}
                  </div>
                  {session.courseId?._id && (
                    <Link
                      href={`/courses/${session.courseId._id}/live/${session._id}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-slate-50"
                    >
                      Open studio
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Courses",
              value: stats.totalCourses,
              icon: BookOpen,
            },
            {
              label: "Topics",
              value: stats.totalTopics,
              icon: Layers,
            },
            {
              label: "Quizzes",
              value: stats.totalQuizzes,
              icon: BrainCircuit,
            },
            {
              label: "Avg. quiz score",
              value: `${stats.averageScorePercentage}%`,
              icon: TrendingUp,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Learner engagement
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalStudentsAttempted}
                  <span className="ml-2 text-base font-medium text-slate-400">
                    students with completed quizzes
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/students"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
            >
              View students
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/courses", label: "Manage courses", icon: BookOpen },
            { href: "/students", label: "Student roster", icon: Users },
            { href: "/schedules", label: "Live schedules", icon: CalendarDays },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex items-center gap-3 font-semibold text-slate-700 group-hover:text-primary">
                  <Icon className="text-primary" size={20} />
                  {item.label}
                </span>
                <ArrowRight
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  size={18}
                />
              </Link>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-800">
                Today&apos;s sessions
              </h2>
              <Link
                href="/schedules"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                All schedules
              </Link>
            </div>
            {todaySessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-500">
                  No sessions scheduled for today.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {todaySessions.map((session) => (
                  <li
                    key={session._id}
                    className="rounded-xl border border-slate-100 p-4 transition-colors hover:border-primary/20 hover:bg-slate-50/80"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {session.status === "live" && (
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                              Live
                            </span>
                          )}
                          {session.courseId?.code && (
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              {session.courseId.code}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-semibold text-slate-800">
                          {session.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatSessionTime(session.startTime)}
                        </p>
                      </div>
                      {session.courseId?._id && (
                        <Link
                          href={`/courses/${session.courseId._id}/live/${session._id}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          {session.status === "live" ? "Join" : "Open"}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-800">
                Next 7 days
              </h2>
              <Link
                href="/schedules"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                Schedule lecture
              </Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-500">
                  No upcoming sessions this week.
                </p>
                <Link
                  href="/schedules"
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Create a live session
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingSessions.map((session) => (
                  <li
                    key={session._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {formatSessionTime(session.startTime)}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-800">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {session.courseId?.code
                        ? `${session.courseId.code} · ${session.courseId.title}`
                        : session.summary || "Live lecture"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
