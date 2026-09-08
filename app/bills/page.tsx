"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, Receipt } from "lucide-react";

export default function BillsPage() {
  const [user, setUser] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState("Monthly");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());
      const res = await fetch("/api/bills");
      if (res.ok) {
        const d = await res.json();
        setBills(d.bills || []);
        setSummary(d.summary);
      }
    } catch (e) {}
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          frequency: freq,
          next_payment_date: dueDate
        })
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setAmount("");
        loadBills();
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
            <h2 className="text-xl md:text-2xl font-bold">Recurring Bills & Subscriptions</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Monthly projections and payment cycles</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Bill
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Monthly Recurring</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{cur}{(summary?.monthly_recurring_cost || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Yearly Estimated</div>
            <div className="text-2xl font-bold text-white mt-1">{cur}{(summary?.yearly_estimated_cost || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl col-span-2 md:col-span-1">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Active Services</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{summary?.active_subscriptions || 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-sm">All Subscriptions</h3>
          <div className="space-y-2">
            {bills.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recurring bills registered.</p>
            ) : (
              bills.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border text-sm">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-muted-foreground">Due: {b.nextPaymentDate} &bull; <span className="bg-border px-1.5 py-0.5 rounded text-[10px]">{b.frequency}</span></div>
                  </div>
                  <span className="font-bold text-red-400">{cur}{b.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base">New Recurring Bill</h3>
              <form onSubmit={handleCreateBill} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-secondary">Service / Bill Name *</label>
                  <input type="text" required placeholder="e.g. Netflix, Fiber Internet" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-secondary">Amount ({cur}) *</label>
                    <input type="number" step="0.01" required placeholder="15.00" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">Frequency</label>
                    <select className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={freq} onChange={(e) => setFreq(e.target.value)}>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Next Due Date *</label>
                  <input type="date" required className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs bg-surface border border-border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-primary text-white font-semibold rounded">Save Bill</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
