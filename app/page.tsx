"use client";
import React, { useState } from "react";
import {
  BookOpen,
  Users,
  MoreVertical,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Appbar from "@/components/layouts/appbar";
import SideBar from "@/components/layouts/sidebar";

const App = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock Data
  const stats = [
    {
      label: "Total Students",
      value: "1,284",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Courses",
      value: "6",
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Avg. Attendance",
      value: "92%",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Research Score",
      value: "4.8",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const recentCourses = [
    {
      id: 1,
      name: "National Defense And Security Policy",
      code: "PHY402",
      students: 45,
      progress: 75,
    },
    {
      id: 2,
      name: "Part Governancy",
      code: "CS301",
      students: 120,
      progress: 40,
    },
    {
      id: 3,
      name: "National Ideology",
      code: "ETH102",
      students: 85,
      progress: 90,
    },
  ];

  const upcomingClasses = [
    { time: "09:00 AM", subject: "National Ideology", room: "Hall A1" },
    { time: "11:30 AM", subject: "Part Governancy", room: "Lab 04" },
    {
      time: "02:00 PM",
      subject: "National Defense And Security Policy",
      room: "Conf Room",
    },
  ];

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* --- SIDEBAR (Desktop) --- */}
      <SideBar
        isMobileMenuOpen={isMobileMenuOpen}
        isSidebarExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        toggleMobileMenu={toggleMobileMenu}
      />
      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <Appbar toggleMobileMenu={toggleMobileMenu} />

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* GREETING */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Welcome back, Wayne! 👋
                </h1>
                <p className="text-slate-500 mt-1">
                  Here's what's happening with your courses today.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white border p-1 rounded-lg shadow-sm w-fit">
                <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-md shadow-sm">
                  Overview
                </button>
                <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-md">
                  Analytics
                </button>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-emerald-100 transition-colors"
                >
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COURSES SECTION */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    My Courses
                  </h2>
                  <button className="text-emerald-600 font-semibold text-sm hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            {course.code.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                              {course.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {course.code} • {course.students} Students
                            </p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500 uppercase tracking-wider">
                            Curriculum Progress
                          </span>
                          <span className="text-emerald-600">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SCHEDULE SECTION */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Today's Schedule
                </h2>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm divide-y">
                  {upcomingClasses.map((item, i) => (
                    <div
                      key={i}
                      className="py-4 first:pt-0 last:pb-0 flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="flex-1 w-px bg-slate-100 my-1"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md mb-1">
                          <Clock size={12} />
                          {item.time}
                        </div>
                        <h4 className="font-bold text-slate-800">
                          {item.subject}
                        </h4>
                        <p className="text-sm text-slate-500">{item.room}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-emerald-300 hover:text-emerald-500 transition-all text-sm">
                    + Add New Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
