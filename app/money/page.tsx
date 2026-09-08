"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, Wallet, TrendingUp, TrendingDown, Tag, Trash2, Edit } from "lucide-react";

export default function MoneyPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("this_month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [dateVal, setDateVal] = useState(new Date().toISOString().split("T")[0]);
  const [desc, setDesc] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter, typeFilter, search]);

  const loadData = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());

      const sRes = await fetch(`/api/finance/stats`);
      if (sRes.ok) setStats(await sRes.json());

      let url = `/api/finance/transactions?limit=100`;
      if (typeFilter !== "all") url += `&type=${typeFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const tRes = await fetch(url);
      if (tRes.ok) {
        const d = await tRes.json();
        setTransactions(d.transactions || []);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          amount: parseFloat(amount),
          category,
          date: dateVal,
          description: desc,
          notes,
          is_recurring: isRecurring
        })
      });
      if (res.ok) {
        setShowModal(false);
        setAmount("");
        setDesc("");
        setNotes("");
        loadData();
      }
    } catch (e) {}
  };

  const cur = user?.currencySymbol || "$";

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <Navigation user={user} onOpenQuickAdd={() => setShowModal(true)} />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Money Management</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Income, expenses, categories, and monthly cashflow</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setTxType("expense"); setShowModal(true); }} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
            <button onClick={() => { setTxType("income"); setShowModal(true); }} className="bg-surface border border-border text-emerald-400 text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Income
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Total Income</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-emerald-400">+{cur}{(stats?.all_time?.income || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">All time</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Total Expenses</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-red-400">-{cur}{(stats?.all_time?.expense || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">All time</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Net Balance</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-white">{cur}{(stats?.all_time?.net_balance || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Cash on hand</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">In Savings Pots</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-indigo-400">{cur}{(stats?.all_time?.total_savings || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Allocated savings</div>
          </div>
        </div>

        {/* Category Breakdown */}
        {stats?.spending_by_category?.length > 0 && (
          <div className="bg-card border border-border p-5 rounded-xl">
            <h3 className="font-bold text-sm mb-3">Spending by Category</h3>
            <div className="space-y-2">
              {stats.spending_by_category.slice(0, 5).map((c: any) => (
                <div key={c.category} className="flex justify-between items-center text-xs p-2 bg-surface rounded-lg">
                  <span className="font-semibold">{c.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{c.percentage}%</span>
                    <span className="font-bold text-red-400">-{cur}{c.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-card border border-border p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-bold text-sm">Transactions History ({transactions.length})</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search merchant..."
                className="bg-surface border border-border px-3 py-1.5 text-xs rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bg-surface border border-border px-2 py-1.5 text-xs rounded-lg"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No transactions recorded yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border text-sm">
                  <div>
                    <div className="font-semibold">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">{tx.date} &bull; <span className="bg-border px-1.5 py-0.5 rounded text-[10px]">{tx.category}</span> {tx.notes && `&bull; ${tx.notes}`}</div>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{cur}{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Add Transaction</h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">&times;</button>
              </div>
              <form onSubmit={handleAddTx} className="space-y-3">
                <div className="flex bg-surface p-1 rounded-lg">
                  <button type="button" onClick={() => setTxType("expense")} className={`flex-1 py-1 text-xs font-semibold rounded ${txType === "expense" ? "bg-red-500/20 text-red-400" : "text-muted-foreground"}`}>Expense</button>
                  <button type="button" onClick={() => setTxType("income")} className={`flex-1 py-1 text-xs font-semibold rounded ${txType === "income" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground"}`}>Income</button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Amount ({cur}) *</label>
                  <input type="number" step="0.01" required className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Description / Merchant *</label>
                  <input type="text" required className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Category</label>
                  <input type="text" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary">Date</label>
                  <input type="date" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs bg-surface border border-border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-primary text-white font-semibold rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
