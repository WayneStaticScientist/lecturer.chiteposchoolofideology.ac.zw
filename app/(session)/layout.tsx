"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  Users,
  X,
  Menu,
  Bell,
  User,
  Search,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getLecturerDashboard, logoutUser } from "@/services/api";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getLecturerDashboard();
        if (res.user?.role !== 'lecturer') {
          // Not a lecturer — kick out
          router.push('/login');
          return;
        }
        setUser(res.user);
      } catch {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    window.location.href = '/login';
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: Users, label: "Students", path: "/students" },
    { icon: Calendar, label: "Schedules", path: "/schedules" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const displayName = user ? `${user.firstName}` : "";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-50 bg-emerald-950 text-emerald-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarExpanded ? "w-64" : "w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-emerald-800/50">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="bg-white text-white p-2 rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <Image src="/apple-touch-icon.png" width={30} height={30} alt="logo" />
            </div>
            {isSidebarExpanded && (
              <span className="font-bold text-xl tracking-wide">Chitepo</span>
            )}
          </div>
          <button
            className="lg:hidden text-emerald-300 hover:text-white p-1"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {navItems.map((item, index) => {
            const active = path?.toLowerCase().trim() === item.path.toLowerCase().trim();
            return (
              <button
                onClick={() => {
                  if (item.path === path) return;
                  router.push(item.path);
                }}
                key={index}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active
                    ? "bg-emerald-800 text-white shadow-md"
                    : "text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-50"
                  }
                `}
                title={!isSidebarExpanded ? item.label : ""}
              >
                <item.icon size={22} className={`flex-shrink-0 ${active ? "text-emerald-400" : ""}`} />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${!isSidebarExpanded ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100"}`}>
                  {item.label}
                </span>
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 lg:block hidden shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout & Collapse */}
        <div className="p-3 border-t border-emerald-800/50 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-xl text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors w-full"
            title={!isSidebarExpanded ? "Logout" : ""}
          >
            <LogOut size={22} className="flex-shrink-0" />
            <span className={`whitespace-nowrap ${!isSidebarExpanded ? "lg:hidden" : ""}`}>Logout</span>
          </button>
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 rounded-lg text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors items-center justify-center w-full hidden lg:flex"
          >
            {isSidebarExpanded ? (
              <div className="flex items-center gap-2 text-sm w-full justify-center">
                <ChevronLeft size={20} /> Collapse
              </div>
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* AppBar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 hidden sm:block">
              {displayName ? `Welcome, ${displayName}! 👋` : "Lecturer Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
                <User size={20} />
              </div>
              {fullName && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-700 leading-tight">{fullName}</p>
                  <p className="text-xs text-slate-500">Lecturer</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
