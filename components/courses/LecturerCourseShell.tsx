"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft, Layers, Radio } from "lucide-react";
import type { ReactNode } from "react";

export interface LecturerCourseSummary {
  _id: string;
  code: string;
  title: string;
  description?: string;
}

const tabs = [
  {
    slug: "topics",
    label: "Topics",
    icon: Layers,
    href: (id: string) => `/courses/${id}`,
  },
  {
    slug: "live",
    label: "Live lessons",
    icon: Radio,
    href: (id: string) => `/courses/${id}/live`,
  },
] as const;

function activeTabFromPath(pathname: string, courseId: string) {
  const base = `/courses/${courseId}`;
  if (pathname === `${base}/live` || pathname.startsWith(`${base}/live/`)) {
    return "live";
  }
  if (pathname === base || pathname.startsWith(`${base}/topic/`)) {
    return "topics";
  }
  return "topics";
}

export default function LecturerCourseShell({
  course,
  children,
}: {
  course: LecturerCourseSummary;
  children: ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.id as string;
  const active = activeTabFromPath(pathname ?? "", courseId);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10 lg:py-8">
          <Link
            href="/courses"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
          >
            <ArrowLeft size={16} />
            All courses
          </Link>

          <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            {course.code}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 lg:text-3xl">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              {course.description}
            </p>
          )}

          <nav
            aria-label="Course sections"
            className="-mx-1 mt-6 flex gap-2 overflow-x-auto border-t border-slate-100 px-1 pt-4 pb-1 [scrollbar-width:thin]"
          >
            {tabs.map((tab) => {
              const isActive = active === tab.slug;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href(courseId)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}
