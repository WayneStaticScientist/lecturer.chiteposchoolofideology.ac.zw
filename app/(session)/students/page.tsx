"use client";
import React, { useEffect, useState } from "react";
import { Users, Loader2, Search, Trophy, Calendar, Clock } from "lucide-react";
import { getLecturerStudents } from "@/services/api";

interface StudentMetric {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  averageScore: number;
  lastActive: string;
}

export default function StudentsMetricsPage() {
  const [students, setStudents] = useState<StudentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getLecturerStudents();
        setStudents(res.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: "A", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (score >= 80) return { letter: "B", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (score >= 70) return { letter: "C", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    if (score >= 60) return { letter: "D", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { letter: "F", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading student metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50 h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Users className="text-emerald-600" size={32} />
              Enrolled Students
            </h1>
            <p className="text-slate-500 mt-1">Track student performance and activity across all courses.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-80"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 font-semibold text-slate-600">Student</th>
                  <th className="p-5 font-semibold text-slate-600">Average Score</th>
                  <th className="p-5 font-semibold text-slate-600">Current Grade</th>
                  <th className="p-5 font-semibold text-slate-600">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const grade = getGrade(student.averageScore);
                    const avgScore = Math.round(student.averageScore);
                    
                    return (
                      <tr key={student._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <p className="font-bold text-slate-800">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-slate-500">{student.email}</p>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <Trophy size={16} className={avgScore >= 50 ? "text-amber-500" : "text-slate-300"} />
                            <span className="font-bold text-slate-700">{avgScore}%</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-4 py-1.5 rounded-xl border font-bold text-sm ${grade.color}`}>
                            {grade.letter}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Clock size={16} className="text-slate-400" />
                            {student.lastActive ? new Date(student.lastActive).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            }) : 'Never'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

