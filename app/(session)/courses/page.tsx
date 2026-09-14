"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Plus, X, Loader2, MoreVertical } from "lucide-react";
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

export default function CoursesSection() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for dialog and form
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    //route to create course
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);
        try {
            const response = await api.post("/courses/create", {
                title: formData.title,
                code: formData.code,
                description: formData.description,
            });
            setIsSubmitting(false);
            setFormData({ title: "", code: "", description: "" }); // Reset form
            setIsDialogOpen(false);
            toast.success("Course created successfully");
            fetchCourses(); // Refresh courses list
        } catch (error: any) {
            setIsSubmitting(false);
            const msg = error.response?.data?.error || "Failed to create course";
            setErrorMsg(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
                        <p className="text-slate-500 mt-1">Manage your active classes and curriculum.</p>
                    </div>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus size={20} />
                        Add New Course
                    </button>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="col-span-full text-center p-12 text-slate-500 bg-white rounded-3xl border border-slate-100">
                            No courses found. Create one to get started.
                        </div>
                    ) : courses.map((course) => (
                        <Link href={`/courses/${course._id || course.id}`} key={course._id || course.id}>
                            <div
                                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group flex flex-col h-full cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <BookOpen size={24} />
                                    </div>
                                    <button onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg mb-3">
                                        {course.code}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {course.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Modern Dialog (Modal) */}
                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                        {/* Backdrop with blur */}
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => !isSubmitting && setIsDialogOpen(false)}
                        />

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">Create Course</h2>
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isSubmitting}
                                        className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateCourse} className="space-y-5">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Course Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Advanced Web Development"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Course Code
                                        </label>
                                        <input
                                            type="text"
                                            id="code"
                                            name="code"
                                            required
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            placeholder="e.g. CS404"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-700 uppercase"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Briefly describe the course objectives..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-700 resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        {errorMsg && (
                                            <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                                {errorMsg}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsDialogOpen(false)}
                                                disabled={isSubmitting}
                                                className="flex-1 px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={20} className="animate-spin" />
                                                        <span>Creating...</span>
                                                    </>
                                                ) : (
                                                    <span>Create Course</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}