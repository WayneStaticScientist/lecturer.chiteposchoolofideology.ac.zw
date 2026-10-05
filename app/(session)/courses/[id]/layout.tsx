"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import LecturerCourseShell, {
  type LecturerCourseSummary,
} from "@/components/courses/LecturerCourseShell";
import api from "@/services/api";

export default function LecturerCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id: courseId } = useParams<{ id: string }>();
  const [course, setCourse] = useState<LecturerCourseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.course);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-slate-500">Course not found.</p>
      </div>
    );
  }

  return <LecturerCourseShell course={course}>{children}</LecturerCourseShell>;
}
