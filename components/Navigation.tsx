"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Wallet, 
  Target, 
  CheckSquare, 
  Sun, 
  Briefcase, 
  Settings, 
  Code, 
  PiggyBank, 
  Receipt,
  Plus
} from "lucide-react";

interface NavProps {
  user: any;
  onOpenQuickAdd: () => void;
}

export function Navigation({ user, onOpenQuickAdd }: NavProps) {
  const pathname = usePathname();
  const isDevUnlocked = user?.devModeUnlocked && user?.devModeEnabled && user?.officeRole === "Developer";

  const mainTabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/money", label: "Money", icon: Wallet },
    { href: "/savings", label: "Savings", icon: PiggyBank },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/bills", label: "Bills", icon: Receipt },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/daily", label: "Daily Life", icon: Sun },
    { href: "/office", label: "Office", icon: Briefcase },
    ...(isDevUnlocked ? [{ href: "/developer", label: "Dev Mode", icon: Code, isDev: true }] : []),
    { href: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <>
      {/* Desktop Sidebar (>= 860px) */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border fixed top-0 bottom-0 left-0 flex-col z-40">
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            LH
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">Life Hub</h1>
            <p className="text-xs text-muted-foreground mt-1">Life Operating System</p>
          </div>
        </div>
{(pathname != "/dashboard" ) && (pathname != "/developer" )  &&
        <div className="px-4 mb-2">
          <button 
            onClick={onOpenQuickAdd}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Quick Add
          </button>
        </div>
}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-500/15 text-primary font-semibold border border-indigo-500/30"
                    : "text-secondary hover:bg-card hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.isDev && (
                  <span className="ml-auto text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                    DEV
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/settings" className="flex items-center gap-3 p-2 bg-card rounded-lg hover:border-primary border border-transparent transition">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
              {(user?.fullName || user?.username || "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate">{user?.fullName || user?.username}</div>
              <div className="text-[10px] text-muted-foreground">{user?.officeRole} &bull; {user?.currency}</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (< 860px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-40">
        {[
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/money", label: "Money", icon: Wallet },
          { href: "/goals", label: "Goals", icon: Target },
          { href: "/tasks", label: "Tasks", icon: CheckSquare },
          { href: "/daily", label: "Daily", icon: Sun },
          { href: "/office", label: "Office", icon: Briefcase },
          ...(isDevUnlocked ? [{ href: "/developer", label: "Dev", icon: Code }] : []),
          { href: "/settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] flex-1 py-1 transition ${
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Floating Action Button */}
      {(pathname != "/dashboard" ) && (pathname != "/developer" )  &&
      <button
        onClick={onOpenQuickAdd}
        className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
}
    </>
  );
}
