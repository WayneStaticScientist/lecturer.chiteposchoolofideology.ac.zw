"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit,
  ChevronRight,
  File,
  Layers,
  Loader2,
  Plus,
  Radio,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  inputClass,
  ModalActions,
  ModalShell,
} from "@/components/courses/lecturer-modals";
import api from "@/services/api";

interface TopicSummary {
  _id: string;
  title: string;
  description: string;
  media?: { _id: string }[];
  quizzes?: { _id: string }[];
}

export default function CourseTopicsPage() {
  const { id: courseId } = useParams<{ id: string }>();

  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [topicsRes, schedulesRes] = await Promise.all([
        api.get(`/topics/course/${courseId}`),
        api.get(`/live/course/${courseId}`),
      ]);
      setTopics(topicsRes.data.topics || []);
      setSessionCount(schedulesRes.data.schedules?.length ?? 0);
    } catch {
      toast.error("Failed to load topics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const stats = useMemo(() => {
    const mediaCount = topics.reduce(
      (sum, t) => sum + (t.media?.length ?? 0),
      0,
    );
    const quizCount = topics.reduce(
      (sum, t) => sum + (t.quizzes?.length ?? 0),
      0,
    );
    return {
      topics: topics.length,
      media: mediaCount,
      quizzes: quizCount,
      sessions: sessionCount,
    };
  }, [topics, sessionCount]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTopic(true);
    try {
      await api.post("/topics/create", {
        courseId,
        title: topicTitle,
        description: topicDesc,
      });
      toast.success("Topic created");
      setIsTopicModalOpen(false);
      setTopicTitle("");
      setTopicDesc("");
      fetchData();
    } catch {
      toast.error("Failed to create topic");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Topics", value: stats.topics, icon: Layers },
          { label: "Media files", value: stats.media, icon: File },
          { label: "Quizzes", value: stats.quizzes, icon: BrainCircuit },
          { label: "Live sessions", value: stats.sessions, icon: Radio },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Course topics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a topic to manage materials, quizzes, and view student
              submissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTopicModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
          >
            <Plus size={18} />
            Add topic
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center">
            <p className="font-medium text-slate-500">
              No topics yet. Add a topic to start building this course.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <Link
                key={topic._id}
                href={`/courses/${courseId}/topic/${topic._id}`}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 transition-all hover:border-primary/30 hover:shadow-md md:p-6"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Topic {index + 1}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-800 group-hover:text-primary">
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {topic.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  className="mt-2 shrink-0 text-slate-300 transition-colors group-hover:text-primary"
                  size={22}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {isTopicModalOpen && (
        <ModalShell onClose={() => !isSubmittingTopic && setIsTopicModalOpen(false)}>
          <h2 className="text-xl font-bold text-slate-800">New topic</h2>
          <form onSubmit={handleCreateTopic} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                required
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <ModalActions
              onCancel={() => setIsTopicModalOpen(false)}
              submitLabel="Save topic"
              loading={isSubmittingTopic}
            />
          </form>
        </ModalShell>
      )}
    </div>
  );
}
