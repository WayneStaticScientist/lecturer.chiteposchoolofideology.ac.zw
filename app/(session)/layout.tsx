"use client";

import React, { useEffect, useState } from "react";
import { Bell, Menu, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";

import LecturerSideBar from "@/components/layouts/lecturer-sidebar";
import { getLecturerDashboard } from "@/services/api";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    role: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getLecturerDashboard();
        if (res.user?.role !== "lecturer") {
          router.push("/login");
          return;
        }
        setUser(res.user);
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const displayName = user ? user.firstName : "";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      {isMobileSidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsMobileSidebarOpen(false);
            }
          }}
        />
      )}

      <LecturerSideBar
        isMobileSidebarOpen={isMobileSidebarOpen}
        isSidebarExpanded={isSidebarExpanded}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        setIsSidebarExpanded={setIsSidebarExpanded}
      />

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="hidden text-xl font-bold text-slate-800 sm:block md:text-2xl">
              {displayName ? `Welcome, ${displayName}` : "Lecturer portal"}
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="search"
                placeholder="Search..."
                className="w-64 rounded-full border-none bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="button"
              className="relative p-2 text-slate-400 transition-colors hover:text-primary"
            >
              <Bell size={22} />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <User size={20} />
              </div>
              {fullName && (
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold leading-tight text-slate-700">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-500">Lecturer</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
