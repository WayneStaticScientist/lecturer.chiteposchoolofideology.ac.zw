"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Radio, Calendar, PlayCircle, Plus, X } from "lucide-react";
import api, { getLecturerSchedules, createLiveSchedule } from "@/services/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function LecturerSchedulesPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [liveTitle, setLiveTitle] = useState("");
    const [liveSummary, setLiveSummary] = useState("");
    const [liveStartTime, setLiveStartTime] = useState("");
    const [isSubmittingLive, setIsSubmittingLive] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [schedulesRes, coursesRes] = await Promise.all([
                getLecturerSchedules(),
                api.get('/courses')
            ]);
            setSchedules(schedulesRes.schedules || []);
            setCourses(coursesRes.data.courses || []);
        } catch (error) {
            toast.error("Failed to load schedules");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) {
            toast.error("Please select a course");
            return;
        }
        setIsSubmittingLive(true);
        try {
            await createLiveSchedule({
                courseId: selectedCourse,
                title: liveTitle,
                summary: liveSummary,
                startTime: new Date(liveStartTime).toISOString()
            });
            toast.success("Live lecture scheduled!");
            setIsLiveModalOpen(false);
            setLiveTitle("");
            setLiveSummary("");
            setLiveStartTime("");
            setSelectedCourse("");
            fetchData();
        } catch (error) {
            toast.error("Failed to schedule lecture");
        } finally {
            setIsSubmittingLive(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center h-screen bg-slate-50">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
            </div>
        );
    }

    const liveSchedules = schedules.filter(s => s.status === 'live');
    const upcomingSchedules = schedules.filter(s => s.status === 'scheduled');
    const pastSchedules = schedules.filter(s => s.status === 'completed');

    const getDurationStr = (start: string, end: string) => {
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const minutes = Math.max(1, Math.floor(diff / 60000));
        if (minutes < 60) return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        const remMins = minutes % 60;
        return `${hours}h ${remMins}m`;
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Broadcast Hub</h1>
                        <p className="text-slate-500 mt-1">Manage your online lectures across all courses.</p>
                    </div>
                    <button
                        onClick={() => setIsLiveModalOpen(true)}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-rose-500/30"
                    >
                        <Radio size={20} className="animate-pulse" /> Schedule Broadcast
                    </button>
                </div>

                {liveSchedules.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            Live Now
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveSchedules.map(schedule => (
                                <div key={schedule._id} className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded-md mb-2 inline-block">
                                                {schedule.courseId?.code}
                                            </span>
                                            <h3 className="font-bold text-xl text-rose-900">{schedule.title}</h3>
                                        </div>
                                    </div>
                                    <p className="text-rose-700 mb-6">{schedule.summary}</p>
                                    <Link 
                                        href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                                        className="block w-full bg-rose-600 hover:bg-rose-700 text-white text-center font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Rejoin Broadcast
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-500" /> Upcoming Broadcasts
                    </h2>
                    {upcomingSchedules.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                            No upcoming broadcasts. Schedule one above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingSchedules.map(schedule => (
                                <div key={schedule._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 transition-colors group">
                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block group-hover:bg-indigo-100 transition-colors">
                                        {schedule.courseId?.code}
                                    </span>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">{schedule.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{schedule.summary}</p>
                                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 flex items-center gap-2 text-sm text-slate-700 font-medium">
                                        <Calendar size={16} className="text-slate-400" />
                                        {new Date(schedule.startTime).toLocaleString()}
                                    </div>
                                    <Link 
                                        href={`/courses/${schedule.courseId?._id}/live/${schedule._id}`}
                                        className="block w-full bg-slate-900 hover:bg-indigo-600 text-white text-center font-semibold py-2.5 rounded-xl transition-colors"
                                    >
                                        Enter Studio
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {pastSchedules.length > 0 && (
                    <div className="space-y-4 pt-8 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-500 flex items-center gap-2">
                            <PlayCircle size={20} /> Past Broadcasts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {pastSchedules.map(schedule => (
                                <div key={schedule._id} className="bg-slate-100 border border-slate-200 rounded-2xl p-5 opacity-75">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-700">{schedule.title}</h3>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded-md">{getDurationStr(schedule.startTime, schedule.updatedAt)}</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1">{schedule.courseId?.code} • {new Date(schedule.startTime).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {isLiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-t-8 border-rose-500 relative">
                        <button onClick={() => setIsLiveModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                            <Radio className="text-rose-500" /> Schedule Broadcast
                        </h2>
                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course</label>
                                <select required value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none">
                                    <option value="" disabled>Choose a course...</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Lecture Title</label>
                                <input required type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g. Chapter 1 Review" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Summary / Agenda</label>
                                <textarea required value={liveSummary} onChange={(e) => setLiveSummary(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none resize-none" placeholder="What will be covered?" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                                <input required type="datetime-local" value={liveStartTime} onChange={(e) => setLiveStartTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmittingLive} className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2">
                                    {isSubmittingLive ? <Loader2 size={18} className="animate-spin" /> : "Confirm Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
