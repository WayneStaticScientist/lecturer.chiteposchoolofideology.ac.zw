"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Loader2, File, Video, Image as ImageIcon, Music, HelpCircle, UploadCloud, Radio } from "lucide-react";
import api from "@/services/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Course {
    _id: string;
    id?: string;
    title: string;
    code: string;
    description: string;
}

interface Topic {
    _id: string;
    title: string;
    description: string;
    media: any[];
    quizzes: any[];
}

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Topic Modal
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [topicTitle, setTopicTitle] = useState("");
    const [topicDesc, setTopicDesc] = useState("");
    const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

    // Media Modal
    const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaTitle, setMediaTitle] = useState("");
    const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

    // Live Schedule State
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
    const [liveTitle, setLiveTitle] = useState("");
    const [liveSummary, setLiveSummary] = useState("");
    const [liveStartTime, setLiveStartTime] = useState("");
    const [isSubmittingLive, setIsSubmittingLive] = useState(false);



    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [courseRes, topicsRes, schedulesRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/topics/course/${courseId}`),
                api.get(`/live/course/${courseId}`)
            ]);
            setCourse(courseRes.data.course);
            setTopics(topicsRes.data.topics);
            setSchedules(schedulesRes.data.schedules || []);
        } catch (error) {
            toast.error("Failed to load course details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTopic(true);
        try {
            await api.post("/topics/create", {
                courseId,
                title: topicTitle,
                description: topicDesc
            });
            toast.success("Topic created!");
            setIsTopicModalOpen(false);
            setTopicTitle("");
            setTopicDesc("");
            fetchData();
        } catch (error) {
            toast.error("Failed to create topic");
        } finally {
            setIsSubmittingTopic(false);
        }
    };

    const handleUploadMedia = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mediaFile || !activeTopicId) return;
        
        setIsSubmittingMedia(true);
        try {
            const formData = new FormData();
            formData.append("topicId", activeTopicId);
            formData.append("title", mediaTitle);
            formData.append("file", mediaFile);

            await api.post("/topics/media", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("Media uploaded!");
            setIsMediaModalOpen(false);
            setMediaFile(null);
            setMediaTitle("");
        } catch (error) {
            toast.error("Failed to upload media");
        } finally {
            setIsSubmittingMedia(false);
        }
    };



    const handleDeleteMedia = async (mediaId: string) => {
        if (!confirm("Are you sure you want to delete this media?")) return;
        try {
            await api.delete(`/topics/media/${mediaId}`);
            toast.success("Media deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete media");
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await api.delete(`/topics/quiz/${quizId}`);
            toast.success("Quiz deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingLive(true);
        try {
            await api.post("/live/schedule", {
                courseId,
                title: liveTitle,
                summary: liveSummary,
                startTime: new Date(liveStartTime).toISOString()
            });
            toast.success("Live lecture scheduled!");
            setIsLiveModalOpen(false);
            setLiveTitle("");
            setLiveSummary("");
            setLiveStartTime("");
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
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!course) return <div className="p-10">Course not found</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/courses" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
                        <p className="text-slate-500 mt-1">{course.code} - {course.description}</p>
                    </div>
                </div>

                {/* Topics Section */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Course Topics</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsLiveModalOpen(true)}
                                className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl font-medium transition-all"
                            >
                                <Radio size={18} className="animate-pulse" /> Schedule Live
                            </button>
                            <button
                                onClick={() => setIsTopicModalOpen(true)}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
                            >
                                <Plus size={18} /> Add Topic
                            </button>
                        </div>
                    </div>

                    {schedules.length > 0 && (
                        <div className="mb-8 space-y-3">
                            <h3 className="font-bold text-slate-700">Live Lectures</h3>
                            {schedules.map(schedule => (
                                <div key={schedule._id} className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="flex h-3 w-3 relative">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                            </span>
                                            <h4 className="font-bold text-rose-900">{schedule.title}</h4>
                                            <span className="text-xs bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full ml-2 font-semibold">
                                                {new Date(schedule.startTime).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-rose-700 text-sm">{schedule.summary}</p>
                                    </div>
                                    <Link
                                        href={`/courses/${courseId}/live/${schedule._id}`}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-xl transition-colors whitespace-nowrap text-center shadow-lg hover:shadow-rose-500/30"
                                    >
                                        Enter Broadcast Studio
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        {topics.length === 0 ? (
                            <div className="text-center p-10 text-slate-500 bg-slate-50 rounded-2xl">
                                No topics added yet. Click "Add Topic" to begin building your curriculum.
                            </div>
                        ) : (
                            topics.map(topic => (
                                <div key={topic._id} className="border border-slate-200 rounded-2xl p-6 hover:border-emerald-200 transition-colors">
                                    <h3 className="text-xl font-bold text-slate-800">{topic.title}</h3>
                                    <p className="text-slate-600 mt-2 mb-4">{topic.description}</p>
                                    
                                    {topic.media && topic.media.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-slate-700 mb-2">Media Files</h4>
                                            <ul className="space-y-2">
                                                {topic.media.map(m => (
                                                    <li key={m._id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <File size={16} className="text-emerald-600" />
                                                            <span className="text-slate-700 font-medium">{m.title}</span>
                                                            <span className="text-xs text-slate-400 uppercase bg-slate-200 px-2 py-0.5 rounded">{m.type}</span>
                                                        </div>
                                                        <button onClick={() => handleDeleteMedia(m._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {topic.quizzes && topic.quizzes.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-slate-700 mb-2">Quizzes</h4>
                                            <ul className="space-y-2">
                                                {topic.quizzes.map(q => (
                                                    <li key={q._id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            <HelpCircle size={16} className="text-amber-600" />
                                                            <span className="text-slate-700 font-medium">{q.title}</span>
                                                            <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">{q.questions?.length || 0} Qs</span>
                                                        </div>
                                                        <button onClick={() => handleDeleteQuiz(q._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => { setActiveTopicId(topic._id); setIsMediaModalOpen(true); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <UploadCloud size={16} /> Upload Media
                                        </button>
                                        <Link
                                            href={`/courses/${courseId}/topic/${topic._id}/quiz/create`}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <HelpCircle size={16} /> Add Quiz
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Topic Modal */}
            {isTopicModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Topic</h2>
                        <form onSubmit={handleCreateTopic} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Topic Title</label>
                                <input required type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea required value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={isSubmittingTopic} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                                    {isSubmittingTopic ? <Loader2 size={18} className="animate-spin" /> : "Save Topic"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Upload Modal */}
            {isMediaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Upload Media</h2>
                        <form onSubmit={handleUploadMedia} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Media Title</label>
                                <input required type="text" value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">File</label>
                                <input required type="file" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsMediaModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={isSubmittingMedia || !mediaFile} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isSubmittingMedia ? <Loader2 size={18} className="animate-spin" /> : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Live Schedule Modal */}
            {isLiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-t-8 border-rose-500">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                            <Radio className="text-rose-500" /> Schedule Live Lecture
                        </h2>
                        <form onSubmit={handleCreateSchedule} className="space-y-4">
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
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsLiveModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={isSubmittingLive} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                                    {isSubmittingLive ? <Loader2 size={18} className="animate-spin" /> : "Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}
