"use client";

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
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { logoutUser } from "@/services/api";

type NavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

function isNavActive(pathname: string | null, itemPath: string) {
  const current = pathname?.toLowerCase().trim() ?? "";
  const target = itemPath.toLowerCase().trim();

  if (target === "/") {
    return current === "/";
  }

  return current === target || current.startsWith(`${target}/`);
}

function NavButton({
  item,
  active,
  expanded,
  onClick,
  variant = "default",
}: {
  item: { icon: LucideIcon; label: string };
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`
        group relative flex w-full items-center rounded-xl transition-all duration-200
        ${expanded ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-3 lg:px-0"}
        ${
          active
            ? "bg-emerald-800/80 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-600/40"
            : variant === "danger"
              ? "text-emerald-300/90 hover:bg-rose-500/10 hover:text-rose-300"
              : "text-emerald-200/80 hover:bg-emerald-900/60 hover:text-emerald-50"
        }
      `}
      title={!expanded ? item.label : undefined}
      onClick={onClick}
    >
      {active && (
        <span
          aria-hidden
          className={`absolute top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] ${expanded ? "left-0" : "left-1 lg:left-0.5"}`}
        />
      )}

      <span
        className={`
          flex shrink-0 items-center justify-center rounded-lg transition-colors
          ${expanded ? "h-9 w-9" : "h-10 w-10"}
          ${
            active
              ? "bg-emerald-700/50 text-emerald-100"
              : "bg-emerald-950/40 text-emerald-300 group-hover:bg-emerald-900/50 group-hover:text-emerald-100"
          }
        `}
      >
        <Icon
          size={20}
          strokeWidth={active ? 2.25 : 2}
          className={active ? "text-emerald-200" : undefined}
        />
      </span>

      <span
        className={`truncate text-sm font-medium tracking-wide transition-all duration-300 ${
          expanded ? "opacity-100" : "lg:pointer-events-none lg:w-0 lg:opacity-0"
        }`}
      >
        {item.label}
      </span>

      {!expanded && (
        <div className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-emerald-800/80 bg-emerald-950 px-3 py-2 text-sm font-medium text-emerald-50 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 lg:block">
          {item.label}
          <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-emerald-800/80 bg-emerald-950" />
        </div>
      )}
    </button>
  );
}

export default function LecturerSideBar({
  isSidebarExpanded,
  isMobileSidebarOpen,
  setIsSidebarExpanded,
  setIsMobileSidebarOpen,
}: {
  isSidebarExpanded: boolean;
  isMobileSidebarOpen: boolean;
  setIsSidebarExpanded: (state: boolean) => void;
  setIsMobileSidebarOpen: (state: boolean) => void;
}) {
  const router = useRouter();
  const path = usePathname();

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: Users, label: "Students", path: "/students" },
    { icon: Calendar, label: "Schedules", path: "/schedules" },
  ];

  const navigate = (itemPath: string) => {
    if (isNavActive(path, itemPath)) return;
    setIsMobileSidebarOpen(false);
    router.push(itemPath);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* continue to login */
    }
    window.location.href = "/login";
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 flex h-full flex-col
        border-r border-emerald-800/40
        bg-gradient-to-b from-emerald-950 via-[#022c22] to-emerald-950
        text-emerald-50 shadow-2xl shadow-emerald-950/50
        transition-[width,transform] duration-300 ease-out
        lg:relative lg:shadow-none
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isSidebarExpanded ? "w-[17.5rem]" : "w-[5.25rem]"}
      `}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,138,46,0.18),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-500/25 to-transparent"
      />

      <div className="relative flex h-[4.75rem] shrink-0 items-center justify-between border-b border-emerald-800/50 px-4">
        <div
          className={`flex min-w-0 items-center overflow-hidden ${isSidebarExpanded ? "gap-3" : "w-full justify-center"}`}
        >
          <div className="relative flex shrink-0 rounded-2xl bg-white p-2 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/30">
            <Image alt="Chitepo logo" height={28} src="/apple-touch-icon.png" width={28} />
          </div>
          {isSidebarExpanded && (
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-tight tracking-tight">
                Chitepo
              </p>
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                Lecturer portal
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-emerald-300 transition-colors hover:bg-emerald-900/60 hover:text-white lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-5">
        {isSidebarExpanded && (
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-500/90">
            Menu
          </p>
        )}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              active={isNavActive(path, item.path)}
              expanded={isSidebarExpanded}
              item={item}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      </nav>

      <div className="relative shrink-0 space-y-1 border-t border-emerald-800/50 px-3 py-4">
        {isSidebarExpanded && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-500/90">
            Account
          </p>
        )}
        <NavButton
          active={isNavActive(path, "/settings")}
          expanded={isSidebarExpanded}
          item={{ icon: Settings, label: "Settings" }}
          onClick={() => navigate("/settings")}
        />
        <NavButton
          active={false}
          expanded={isSidebarExpanded}
          item={{ icon: LogOut, label: "Log out" }}
          variant="danger"
          onClick={handleLogout}
        />

        <button
          type="button"
          className={`
            mt-3 hidden w-full items-center rounded-xl border border-emerald-800/60 bg-emerald-950/50
            text-emerald-300 transition-all hover:border-emerald-700 hover:bg-emerald-900/50 hover:text-white
            lg:flex
            ${isSidebarExpanded ? "justify-center gap-2 px-3 py-2.5 text-sm font-medium" : "justify-center p-2.5"}
          `}
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarExpanded ? (
            <>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div>
    </aside>
  );
}
