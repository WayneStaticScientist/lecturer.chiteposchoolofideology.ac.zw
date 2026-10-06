"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import CourseLiveSessionsPanel from "@/components/courses/CourseLiveSessionsPanel";
import {
  inputClass,
  ModalActions,
  ModalShell,
} from "@/components/courses/lecturer-modals";
import type { CourseLiveSchedule } from "@/lib/live-schedules";
import api from "@/services/api";

export default function CourseLiveLessonsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [schedules, setSchedules] = useState<CourseLiveSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveSummary, setLiveSummary] = useState("");
  const [liveStartTime, setLiveStartTime] = useState("");
  const [attendanceThreshold, setAttendanceThreshold] = useState("50");
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/live/course/${courseId}`);
      setSchedules(res.data.schedules || []);
    } catch {
      toast.error("Failed to load live sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchSchedules();
  }, [courseId]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLive(true);
    try {
      await api.post("/live/schedule", {
        courseId,
        title: liveTitle,
        summary: liveSummary,
        startTime: new Date(liveStartTime).toISOString(),
        attendanceThresholdPercent: Number(attendanceThreshold) || 50,
      });
      toast.success("Live session scheduled");
      setIsLiveModalOpen(false);
      setLiveTitle("");
      setLiveSummary("");
      setLiveStartTime("");
      fetchSchedules();
    } catch {
      toast.error("Failed to schedule session");
    } finally {
      setIsSubmittingLive(false);
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
    <div className="pb-16">
      <CourseLiveSessionsPanel
        courseId={courseId}
        schedules={schedules}
        onScheduleClick={() => setIsLiveModalOpen(true)}
      />

      {isLiveModalOpen && (
        <ModalShell onClose={() => !isSubmittingLive && setIsLiveModalOpen(false)}>
          <h2 className="text-xl font-bold text-slate-800">
            Schedule live session
          </h2>
          <form onSubmit={handleCreateSchedule} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Session title
              </label>
              <input
                required
                type="text"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Chapter 1 review"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Summary
              </label>
              <textarea
                required
                rows={3}
                value={liveSummary}
                onChange={(e) => setLiveSummary(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Agenda for this session"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Start time
              </label>
              <input
                required
                type="datetime-local"
                value={liveStartTime}
                onChange={(e) => setLiveStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance threshold (% of session watched)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                Default 50%. Students who watch at least this share of the live
                stream are marked present once (no duplicate logs).
              </p>
            </div>
            <ModalActions
              onCancel={() => setIsLiveModalOpen(false)}
              submitLabel="Schedule"
              loading={isSubmittingLive}
            />
          </form>
        </ModalShell>
      )}
    </div>
  );
}
