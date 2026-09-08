"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Sun, Zap, ShoppingBag, Calendar, FileText } from "lucide-react";

export default function DailyPage() {
  const [user, setUser] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);

  useEffect(() => { loadDaily(); }, []);

  const loadDaily = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());
      const res = await fetch("/api/daily");
      if (res.ok) setDailyData(await res.json());
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <Navigation user={user} onOpenQuickAdd={() => {}} />

      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Daily Life Management</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Routines, habit streaks, shopping lists, and daily planning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Routines */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" /> Daily Rituals & Routines
            </h3>
            <div className="space-y-2">
              {(dailyData?.routines || []).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border text-xs">
                  <span>{r.title}</span>
                  <span className="text-[10px] bg-border px-1.5 py-0.5 rounded uppercase">{r.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Habits */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Habit Streaks
            </h3>
            <div className="space-y-2">
              {(dailyData?.habits || []).map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border text-xs">
                  <span>{h.title}</span>
                  <span className="text-primary font-bold">🔥 {h.currentStreak} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
