"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, X } from "lucide-react";
import api from "@/services/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Option {
    text: string;
    isCorrect: boolean;
}

interface Question {
    questionText: string;
    options: Option[];
}

export default function CreateQuizPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const topicId = params.topicId as string;

    const [quizTitle, setQuizTitle] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    const [questions, setQuestions] = useState<Question[]>([
        { questionText: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
    };

    const handleRemoveQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const handleQuestionChange = (index: number, value: string) => {
        const newQ = [...questions];
        newQ[index].questionText = value;
        setQuestions(newQ);
    };

    const handleOptionTextChange = (qIndex: number, oIndex: number, value: string) => {
        const newQ = [...questions];
        newQ[qIndex].options[oIndex].text = value;
        setQuestions(newQ);
    };

    const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.forEach((opt, idx) => {
            opt.isCorrect = idx === oIndex;
        });
        setQuestions(newQ);
    };

    const handleAddOption = (qIndex: number) => {
        const newQ = [...questions];
        newQ[qIndex].options.push({ text: "", isCorrect: false });
        setQuestions(newQ);
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        const newQ = [...questions];
        const wasCorrect = newQ[qIndex].options[oIndex].isCorrect;
        newQ[qIndex].options.splice(oIndex, 1);
        if (wasCorrect && newQ[qIndex].options.length > 0) {
            newQ[qIndex].options[0].isCorrect = true;
        }
        setQuestions(newQ);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/topics/quiz", {
                topicId,
                title: quizTitle,
                durationMinutes,
                questions
            });
            toast.success("Quiz created successfully!");
            router.push(`/courses/${courseId}`);
        } catch (error) {
            toast.error("Failed to create quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 scroll-smooth bg-slate-50 h-full">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/courses/${courseId}`} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Create Quiz</h1>
                        <p className="text-slate-500 mt-1">Design a new quiz for this topic.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Quiz Title</label>
                            <input
                                required
                                type="text"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                placeholder="e.g. Midterm Evaluation"
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="md:w-1/3">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Time Limit (Minutes)</label>
                            <input
                                type="number"
                                min="0"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                placeholder="0 for no limit"
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Set to 0 for no time limit.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 relative group">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-slate-800">Question {qIndex + 1}</h3>
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
                                    <input
                                        required
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                        placeholder="Enter the question..."
                                        className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">Options</label>
                                        <button type="button" onClick={() => handleAddOption(qIndex)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">+ Add Option</button>
                                    </div>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50/50' : 'bg-slate-50 border-slate-200'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCorrectOption(qIndex, oIndex)}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-emerald-400'}`}
                                                    title="Mark as correct answer"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <input
                                                    required
                                                    value={opt.text}
                                                    onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    className="flex-1 bg-transparent outline-none font-medium"
                                                />
                                                {q.options.length > 2 && (
                                                    <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500">
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Click the circle next to an option to mark it as the correct answer.</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button type="button" onClick={handleAddQuestion} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-bold rounded-2xl transition-colors">
                            <Plus size={20} /> Add Another Question
                        </button>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Publish Quiz"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
