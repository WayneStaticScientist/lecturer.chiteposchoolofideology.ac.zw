"use client";
import React, { useEffect, useState } from "react";
import { BookOpen, Users, Calendar, Clock, Loader2, PlayCircle, HelpCircle, Trophy } from "lucide-react";
import { getLecturerOverviewStats, getLecturerSchedules } from "@/services/api";

export default function LecturerDashboard() {
  const [data, setData] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, schedulesRes] = await Promise.all([
            getLecturerOverviewStats(),
            getLecturerSchedules()
        ]);
        setData(overviewRes);
        setSchedules(schedulesRes.schedules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Failed to load dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Courses</p>
              <h3 className="text-3xl font-bold text-slate-800">{data.totalCourses || 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <PlayCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Topics</p>
              <h3 className="text-3xl font-bold text-slate-800">{data.totalTopics || 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <HelpCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Quizzes</p>
              <h3 className="text-3xl font-bold text-slate-800">{data.totalQuizzes || 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Avg Score</p>
              <h3 className="text-3xl font-bold text-slate-800">{data.averageScorePercentage || 0}%</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 md:col-span-2 lg:col-span-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active Students</p>
              <h3 className="text-3xl font-bold text-slate-800">{data.totalStudentsAttempted || 0} <span className="text-lg font-medium text-slate-400">attempted quizzes</span></h3>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Today&apos;s Schedule</h2>
          </div>
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No live classes scheduled.</p>
              </div>
            ) : (
              schedules.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-4 sm:items-center p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-32 text-sm font-bold text-slate-600">
                      {new Date(item.startTime).toLocaleTimeString()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-rose-400"></span>
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
