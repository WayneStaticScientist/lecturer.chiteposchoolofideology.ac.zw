"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, User } from "lucide-react";

import { AttendanceHeatmap } from "@/components/attendance/AttendanceHeatmap";
import {
  getLecturerCourses,
  getLecturerStudents,
  getStudentAttendanceHeatmap,
} from "@/services/api";

export default function StudentAttendancePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const year = new Date().getFullYear();

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [courses, setCourses] = useState<{ _id: string; title: string; code?: string }[]>(
    [],
  );
  const [courseId, setCourseId] = useState("");
  const [days, setDays] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          getLecturerStudents(),
          getLecturerCourses(),
        ]);

        const student = (studentsRes.students ?? []).find(
          (s: { _id: string }) => s._id === studentId,
        );
        if (student) {
          setStudentName(`${student.firstName} ${student.lastName}`);
        }

        setCourses(coursesRes.courses ?? coursesRes ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [studentId]);

  useEffect(() => {
    const loadHeatmap = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await getStudentAttendanceHeatmap(studentId, {
          courseId: courseId || undefined,
          from: `${year}-01-01`,
          to: `${year}-12-31`,
        });
        setDays(res.data?.days ?? []);
      } catch (e) {
        console.error(e);
        setDays([]);
      } finally {
        setLoading(false);
      }
    };
    loadHeatmap();
  }, [studentId, courseId, year]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to students
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {studentName || "Student"}
            </h1>
            <p className="text-sm text-slate-500">
              Live session attendance by course
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Course filter</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code ? `${c.code} — ` : ""}
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AttendanceHeatmap
            days={days}
            year={year}
            title="Attendance heatmap"
            subtitle="Based on live streams watched past the lecturer’s attendance threshold."
          />
        )}
      </div>
    </div>
  );
}
