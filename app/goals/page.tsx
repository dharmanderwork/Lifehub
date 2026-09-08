"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, Target, CheckCircle2 } from "lucide-react";

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());
      const res = await fetch("/api/goals");
      if (res.ok) setGoals(await res.json());
    } catch (e) {}
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          priority,
          target_amount: parseFloat(target || "0"),
          current_amount: parseFloat(current || "0")
        })
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setTarget("");
        setCurrent("");
        loadGoals();
      }
    } catch (e) {}
  };

  const cur = user?.currencySymbol || "$";

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <Navigation user={user} onOpenQuickAdd={() => setShowModal(true)} />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Goals & Milestones</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Financial & personal life milestones</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Set Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xl col-span-2 text-center text-muted-foreground text-xs">
              No active goals configured. Click "Set Goal" to start tracking.
            </div>
          ) : (
            goals.map((g) => (
              <div key={g.id} className="bg-card border border-border p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">{g.priority}</span>
                      <span className="text-[10px] bg-surface border border-border px-2 py-0.5 rounded">{g.category}</span>
                    </div>
                    <h3 className="font-bold text-sm">{g.name}</h3>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{g.progress_pct}%</span>
                </div>

                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, g.progress_pct)}%` }}></div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress: {cur}{g.currentAmount.toLocaleString()}</span>
                  <span>Target: {cur}{g.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base">New Goal</h3>
              <form onSubmit={handleCreateGoal} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-secondary">Goal Name *</label>
                  <input type="text" required placeholder="e.g. Save $10,000 Emergency Fund" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-secondary">Category</label>
                    <input type="text" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">Priority</label>
                    <select className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-secondary">Target Amount ({cur})</label>
                    <input type="number" step="0.01" placeholder="1000.00" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={target} onChange={(e) => setTarget(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">Current Progress ({cur})</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={current} onChange={(e) => setCurrent(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs bg-surface border border-border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-primary text-white font-semibold rounded">Save Goal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
