import { Bell, Menu, Search } from "lucide-react";
import React from "react";

export default function Appbar({
  toggleMobileMenu,
}: {
  toggleMobileMenu: () => void;
}) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search students or courses..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">
              Dr. Wayne Scientist
            </p>
            <p className="text-xs text-slate-500 mt-1">Senior Lecturer</p>
          </div>
          <img
            src=""
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-50"
          />
        </div>
      </div>
    </header>
  );
}
