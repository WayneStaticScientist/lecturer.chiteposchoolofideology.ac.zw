export type CourseLiveSchedule = {
  _id: string;
  title: string;
  summary?: string;
  startTime: string;
  status: "scheduled" | "live" | "completed";
};

export type ScheduleBucket = "live" | "upcoming" | "past";

export type LiveSessionFilter = "all" | "live" | "upcoming" | "past";

export function bucketOf(
  schedule: CourseLiveSchedule,
  nowMs = Date.now(),
): ScheduleBucket {
  if (schedule.status === "live") return "live";
  if (schedule.status === "completed") return "past";
  const startMs = new Date(schedule.startTime).getTime();
  if (startMs < nowMs) return "past";
  return "upcoming";
}

export function partitionSchedules(schedules: CourseLiveSchedule[]) {
  const nowMs = Date.now();
  const live: CourseLiveSchedule[] = [];
  const upcoming: CourseLiveSchedule[] = [];
  const past: CourseLiveSchedule[] = [];

  for (const schedule of schedules) {
    const bucket = bucketOf(schedule, nowMs);
    if (bucket === "live") live.push(schedule);
    else if (bucket === "upcoming") upcoming.push(schedule);
    else past.push(schedule);
  }

  upcoming.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  past.sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  return { live, upcoming, past };
}

export function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
