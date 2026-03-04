"use client";
import {
  GraduationCap,
  ChevronLeft,
  Menu,
  LogOut,
  X,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export default function SideBar({
  isSidebarExpanded,
  toggleSidebar,
  toggleMobileMenu,
  isMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <React.Fragment>
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl ">
            <Image
              src={"/apple-touch-icon.png"}
              width={30}
              height={30}
              alt={"logo"}
            />
          </div>
          {isSidebarExpanded && (
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Chitepo
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                activeTab === item.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={activeTab === item.id ? 2.5 : 2}
              />
              {isSidebarExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-4 p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isSidebarExpanded ? <ChevronLeft size={22} /> : <Menu size={22} />}
            {isSidebarExpanded && <span className="font-medium">Collapse</span>}
          </button>
          <button className="w-full flex items-center gap-4 p-3 mt-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={22} />
            {isSidebarExpanded && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR (Drawer) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <span className="font-bold text-xl text-slate-800">
                  EduPortal
                </span>
              </div>
              <button onClick={toggleMobileMenu} className="p-2 text-slate-500">
                <X />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <item.icon size={22} />
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-6 border-t">
              <button className="w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                <LogOut size={22} />
                <span className="font-medium text-lg">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </React.Fragment>
  );
}
