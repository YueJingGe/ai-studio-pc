import { FolderOpen, Home, Sparkles, Waypoints } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import clsx from "clsx";

const NAV = [
  { to: "/", label: "首页", icon: Home, end: true },
  { to: "/gen", label: "AI生成", icon: Sparkles, end: false },
  { to: "/workflow", label: "工作流", icon: Waypoints, end: false },
  { to: "/assets", label: "资产", icon: FolderOpen, end: false },
];

export function Layout() {
  return (
    <div className="flex h-screen">
      <nav aria-label="主导航" className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-[var(--line)] py-4">
        <div className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-bold">
          AI
        </div>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex w-12 flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition-colors",
                isActive ? "bg-[var(--panel-2)] text-white" : "text-zinc-400 hover:text-zinc-100",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
