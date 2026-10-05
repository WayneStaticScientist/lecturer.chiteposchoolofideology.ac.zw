"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Loader2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import api from "@/services/api";

interface Course {
  _id: string;
  id?: string;
  title: string;
  code: string;
  description: string;
}

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 350);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
  });

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(needle) ||
        c.code?.toLowerCase().includes(needle),
    );
  }, [courses, debouncedQuery]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await api.post("/courses/create", {
        title: formData.title,
        code: formData.code,
        description: formData.description,
      });
      setFormData({ title: "", code: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Course created successfully");
      fetchCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const msg = err.response?.data?.error || "Failed to create course";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Curriculum
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                My courses
              </h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                Create and manage programmes, topics, materials, and live
                sessions.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="search"
                  placeholder="Search by title or code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus size={18} />
                New course
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-lg font-bold text-slate-700">
              {courses.length === 0 ? "No courses yet" : "No matching courses"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {courses.length === 0
                ? "Create your first course to start building topics and scheduling live lectures."
                : "Try a different search term."}
            </p>
            {courses.length === 0 ? (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
              >
                <Plus size={18} />
                Create course
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-6 text-sm font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-medium text-slate-500">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const id = course._id || course.id;
                return (
                  <Link
                    key={id}
                    href={`/courses/${id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="h-1.5 bg-primary/15">
                      <div className="h-full w-1/3 bg-primary transition-all group-hover:w-full" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                          {course.code}
                        </span>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <BookOpen size={20} />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">
                        {course.description || "No description provided."}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Open course
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsDialogOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Create course
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-5 p-6 sm:p-8">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Course title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Political Ideology and Practice"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Course code
                </label>
                <input
                  id="code"
                  name="code"
                  required
                  type="text"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. CS404"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief overview for students and staff…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                />
              </div>
              {errorMsg && (
                <p className="rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-center text-sm font-medium text-secondary">
                  {errorMsg}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
