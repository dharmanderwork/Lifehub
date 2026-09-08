"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, PiggyBank } from "lucide-react";

export default function SavingsPage() {
  const [user, setUser] = useState<any>(null);
  const [pots, setPots] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [initialAmt, setInitialAmt] = useState("");

  useEffect(() => { loadPots(); }, []);

  const loadPots = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());

      const res = await fetch("/api/savings/pots");
      if (res.ok) {
        const d = await res.json();
        setPots(d.pots || []);
        setSummary(d.summary);
      }
    } catch (e) {}
  };

  const handleCreatePot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/savings/pots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          target_amount: parseFloat(target),
          current_amount: parseFloat(initialAmt || "0")
        })
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setTarget("");
        setInitialAmt("");
        loadPots();
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
            <h2 className="text-xl md:text-2xl font-bold">Savings Pots</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Dedicated savings pots with automatic target tracking</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Create Pot
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total Saved</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{cur}{(summary?.total_saved || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total Target</div>
            <div className="text-2xl font-bold text-white mt-1">{cur}{(summary?.total_target || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Overall Progress</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{summary?.overall_progress_pct || 0}%</div>
          </div>
        </div>

        {/* Pots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pots.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xl col-span-2 text-center text-muted-foreground text-xs">
              No savings pots created yet. Click "Create Pot" to begin saving toward targets.
            </div>
          ) : (
            pots.map((p) => (
              <div key={p.id} className="bg-card border border-border p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm">{p.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{p.progress_pct}%</span>
                </div>

                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, p.progress_pct)}%` }}></div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {cur}{p.currentAmount.toLocaleString()}</span>
                  <span>Target: {cur}{p.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base">New Savings Pot</h3>
              <form onSubmit={handleCreatePot} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-secondary">Pot Name *</label>
                  <input type="text" required placeholder="e.g. Emergency Fund, Japan Trip" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Target Amount ({cur}) *</label>
                  <input type="number" step="0.01" required placeholder="5000.00" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Initial Deposit (Optional)</label>
                  <input type="number" step="0.01" placeholder="0.00" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={initialAmt} onChange={(e) => setInitialAmt(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs bg-surface border border-border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-primary text-white font-semibold rounded">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
