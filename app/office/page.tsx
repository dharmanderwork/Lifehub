"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Briefcase, Calendar, Users, Link as LinkIcon } from "lucide-react";

export default function OfficePage() {
  const [user, setUser] = useState<any>(null);
  const [officeData, setOfficeData] = useState<any>(null);

  useEffect(() => { loadOffice(); }, []);

  const loadOffice = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());
      const res = await fetch("/api/office");
      if (res.ok) setOfficeData(await res.json());
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <Navigation user={user} onOpenQuickAdd={() => {}} />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-bold">Office & Work Profile</h2>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">{user?.officeRole}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Work projects, scheduled meetings, and team directory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Active Projects
            </h3>
            <div className="space-y-2">
              {(officeData?.projects || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active projects logged.</p>
              ) : (
                officeData.projects.map((p: any) => (
                  <div key={p.id} className="p-3 bg-surface rounded-lg border border-border text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold">{p.title}</div>
                      <div className="text-muted-foreground text-[10px]">Deadline: {p.deadline || "Ongoing"}</div>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">{p.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-card border border-border p-5 rounded-xl space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Meetings & Syncs
            </h3>
            <div className="space-y-2">
              {(officeData?.meetings || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No meetings scheduled.</p>
              ) : (
                officeData.meetings.map((m: any) => (
                  <div key={m.id} className="p-3 bg-surface rounded-lg border border-border text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold">{m.title}</div>
                      <div className="text-muted-foreground text-[10px]">{m.date} {m.time ? `at ${m.time}` : ""} ({m.durationMinutes}m)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
