"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  ExternalLink,
  File,
  FileText,
  Loader2,
  Mic,
  PlayCircle,
  Plus,
  UploadCloud,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  inputClass,
  ModalActions,
  ModalShell,
} from "@/components/courses/lecturer-modals";
import {
  getAssetUrl,
  isNoteMedia,
  isTutorialMedia,
} from "@/lib/media-helpers";
import { getTopicLecturerOverview } from "@/services/api";
import api from "@/services/api";

type TopicTab = "materials" | "quizzes" | "submissions";

interface MediaItem {
  _id: string;
  title: string;
  type: string;
  url: string;
}

interface QuizItem {
  _id: string;
  title: string;
  durationMinutes?: number;
  questions?: unknown[];
}

interface AttemptUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AttemptQuiz {
  title?: string;
  durationMinutes?: number;
}

interface QuizAttemptRow {
  _id: string;
  status: "in-progress" | "completed";
  score: number;
  totalQuestions: number;
  startedAt?: string;
  completedAt?: string;
  userId?: AttemptUser | null;
  quizId?: AttemptQuiz | null;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function studentName(user?: AttemptUser | null) {
  if (!user) return "Student";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email || "Student";
}

export default function LecturerTopicDetailPage() {
  const { id: courseId, topicId } = useParams<{
    id: string;
    topicId: string;
  }>();

  const [tab, setTab] = useState<TopicTab>("materials");
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<{
    title: string;
    description?: string;
  } | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptRow[]>([]);
  const [submissionStats, setSubmissionStats] = useState({
    totalAttempts: 0,
    completed: 0,
    inProgress: 0,
  });

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTopicLecturerOverview(topicId);
      setTopic(data.topic);
      setMedia(data.media || []);
      setQuizzes(data.quizzes || []);
      setAttempts(data.attempts || []);
      setSubmissionStats(
        data.submissionStats || {
          totalAttempts: 0,
          completed: 0,
          inProgress: 0,
        },
      );
    } catch {
      toast.error("Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) load();
  }, [topicId]);

  const notes = useMemo(
    () => media.filter((m) => isNoteMedia(m.type)),
    [media],
  );
  const tutorials = useMemo(
    () => media.filter((m) => isTutorialMedia(m.type)),
    [media],
  );
  const otherMedia = useMemo(
    () => media.filter((m) => !isNoteMedia(m.type) && !isTutorialMedia(m.type)),
    [media],
  );

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;
    setIsSubmittingMedia(true);
    try {
      const formData = new FormData();
      formData.append("topicId", topicId);
      formData.append("title", mediaTitle);
      formData.append("file", mediaFile);
      await api.post("/topics/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Media uploaded");
      setIsMediaModalOpen(false);
      setMediaFile(null);
      setMediaTitle("");
      load();
    } catch {
      toast.error("Failed to upload media");
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/topics/media/${mediaId}`);
      toast.success("Media deleted");
      load();
    } catch {
      toast.error("Failed to delete media");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await api.delete(`/topics/quiz/${quizId}`);
      toast.success("Quiz deleted");
      load();
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-16 text-center text-slate-500">Topic not found.</div>
    );
  }

  const tabs: { id: TopicTab; label: string; count?: number }[] = [
    { id: "materials", label: "Materials", count: media.length },
    { id: "quizzes", label: "Quizzes", count: quizzes.length },
    {
      id: "submissions",
      label: "Submissions",
      count: submissionStats.totalAttempts,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to topics
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-slate-800">{topic.title}</h2>
        {topic.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {topic.description}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
            {notes.length} notes / readings
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
            {tutorials.length} tutorials
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
            {submissionStats.completed} completed submissions
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              tab === t.id
                ? "bg-primary text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary/30"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 opacity-80">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {tab === "materials" && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Notes, readings, videos, and audio for this topic.
            </p>
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
            >
              <UploadCloud size={16} />
              Upload
            </button>
          </div>

          <MaterialGroup
            title="Notes & readings"
            empty="No notes or PDFs uploaded yet."
            items={notes}
            icon={FileText}
            onDelete={handleDeleteMedia}
          />
          <MaterialGroup
            title="Tutorials (video & audio)"
            empty="No tutorials uploaded yet."
            items={tutorials}
            icon={PlayCircle}
            onDelete={handleDeleteMedia}
          />
          {otherMedia.length > 0 && (
            <MaterialGroup
              title="Other files"
              empty=""
              items={otherMedia}
              icon={File}
              onDelete={handleDeleteMedia}
            />
          )}
        </section>
      )}

      {tab === "quizzes" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Quizzes</h3>
              <p className="text-sm text-slate-500">
                Assessments linked to this topic.
              </p>
            </div>
            <Link
              href={`/courses/${courseId}/topic/${topicId}/quiz/create`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
            >
              <Plus size={16} />
              Create quiz
            </Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              No quizzes for this topic yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {quizzes.map((q) => (
                <li
                  key={q._id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BrainCircuit size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{q.title}</p>
                      <p className="text-xs text-slate-500">
                        {q.questions?.length ?? 0} questions
                        {q.durationMinutes
                          ? ` · ${q.durationMinutes} min`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(q._id)}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "submissions" && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 md:px-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Users size={20} className="text-primary" />
              Student quiz activity
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {submissionStats.inProgress} in progress ·{" "}
              {submissionStats.completed} completed
            </p>
          </div>
          {attempts.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500 md:px-8">
              No student attempts yet for quizzes in this topic.
            </div>
          ) : (
            <>
              <div className="hidden border-b border-slate-100 bg-slate-50/80 px-8 py-3 md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student
                </div>
                <div className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Quiz
                </div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status
                </div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Score
                </div>
                <div className="col-span-1 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                  Date
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {attempts.map((row) => {
                  const pct =
                    row.totalQuestions > 0
                      ? Math.round((row.score / row.totalQuestions) * 100)
                      : 0;
                  return (
                    <li
                      key={row._id}
                      className="px-6 py-4 md:px-8 md:py-5 hover:bg-slate-50/80"
                    >
                      <div className="md:grid md:grid-cols-12 md:items-center md:gap-4">
                        <div className="md:col-span-4">
                          <p className="font-semibold text-slate-800">
                            {studentName(row.userId)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {row.userId?.email}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-slate-700 md:col-span-3 md:mt-0">
                          {row.quizId?.title || "Quiz"}
                        </div>
                        <div className="mt-2 md:col-span-2 md:mt-0">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              row.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {row.status === "completed"
                              ? "Completed"
                              : "In progress"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-bold text-slate-800 md:col-span-2 md:mt-0">
                          {row.status === "completed" ? (
                            <>
                              {pct}% ({row.score}/{row.totalQuestions})
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 md:col-span-1 md:mt-0 md:text-right">
                          {formatDate(row.completedAt || row.startedAt)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      )}

      {isMediaModalOpen && (
        <ModalShell onClose={() => !isSubmittingMedia && setIsMediaModalOpen(false)}>
          <h2 className="text-xl font-bold text-slate-800">Upload media</h2>
          <form onSubmit={handleUploadMedia} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="topic-media-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Title
              </label>
              <input
                id="topic-media-title"
                required
                type="text"
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="topic-media-file"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                File (PDF, image, video, or audio)
              </label>
              <input
                id="topic-media-file"
                required
                type="file"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary`}
              />
            </div>
            <ModalActions
              onCancel={() => setIsMediaModalOpen(false)}
              submitLabel="Upload"
              loading={isSubmittingMedia}
              disabled={!mediaFile}
            />
          </form>
        </ModalShell>
      )}
    </div>
  );
}

function MaterialGroup({
  title,
  empty,
  items,
  icon: Icon,
  onDelete,
}: {
  title: string;
  empty: string;
  items: MediaItem[];
  icon: LucideIcon;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0 && !empty) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-slate-800">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => {
            const isVideo = m.type === "video";
            const isAudio = m.type === "voice";
            const RowIcon = isVideo ? PlayCircle : isAudio ? Mic : Icon;
            const href = getAssetUrl(m.url);
            return (
              <li
                key={m._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <RowIcon size={18} className="shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {m.title}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {m.type}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(m._id)}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
