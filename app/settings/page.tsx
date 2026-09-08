"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Shield, Download, Trash2, Code } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const [tapMessage, setTapMessage] = useState("");

  const handleTapBuild = async () => {
    const nextTaps = taps + 1;
    setTaps(nextTaps);
    try {
      const res = await fetch("/api/developer/tap-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taps: nextTaps }),
      });
      const data = await res.json();
      if (data.message) {
        setTapMessage(data.message);
      }
    } catch (e) {}
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Settings & Profile</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Manage preferences, developer mode, and exports</p>
          </div>
          <button onClick={handleLogout} className="bg-surface border border-border hover:border-red-500 text-xs px-3 py-1.5 rounded-lg transition">
            Sign Out
          </button>
        </div>

        {/* Hidden Developer Mode Tap Trigger */}
        <div className="bg-card border border-border p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-400" /> About Life Hub & Build Number
          </h3>
          <p className="text-xs text-muted-foreground">Tap the build number 7 times to unlock hidden Developer Mode (requires Developer role).</p>
          <div
            onClick={handleTapBuild}
            className="p-3 bg-surface border border-dashed border-border rounded-lg cursor-pointer select-none hover:border-primary transition"
          >
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Build Identifier</div>
            <div className="font-mono text-sm text-indigo-300">v2.4.1-prod.build-8942</div>
          </div>
          {tapMessage && (
            <div className="text-xs font-semibold p-2 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
              {tapMessage}
            </div>
          )}
        </div>

        {/* Data Export */}
        <div className="bg-card border border-border p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" /> Data Portability & Backup
          </h3>
          <p className="text-xs text-muted-foreground">Export your entire system database in standard JSON format.</p>
          <a
            href="/api/settings/export"
            target="_blank"
            className="inline-flex items-center gap-2 bg-surface border border-border hover:border-emerald-500 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" /> Download Complete Export (JSON)
          </a>
        </div>
      </div>
    </div>
  );
}
