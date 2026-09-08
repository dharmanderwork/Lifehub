"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Plus, CheckSquare } from "lucide-react";

export default function TasksPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { loadTasks(); }, [view]);

  const loadTasks = async () => {
    try {
      const uRes = await fetch("/api/auth/me");
      if (uRes.ok) setUser(await uRes.json());
      const res = await fetch(`/api/tasks?view=${view}`);
      if (res.ok) {
        const d = await res.json();
        setTasks(d.tasks || []);
      }
    } catch (e) {}
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, due_date: dueDate })
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        loadTasks();
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10 p-4 md:p-8">
      <Navigation user={user} onOpenQuickAdd={() => setShowModal(true)} />

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Tasks & To-Do System</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Action items, recurring tasks, and priorities</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "today", "upcoming", "overdue", "completed"].map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition ${view === v ? "bg-primary text-white" : "bg-surface border border-border text-muted-foreground"}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border p-5 rounded-xl space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No tasks found for this view.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border text-sm">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.dueDate ? `Due: ${t.dueDate} &bull; ` : ""}<span className="bg-border px-1.5 py-0.5 rounded text-[10px]">{t.priority}</span></div>
                </div>
                <span className="text-xs bg-border px-2 py-0.5 rounded">{t.status}</span>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base">New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-secondary">Title *</label>
                  <input type="text" required placeholder="What needs to be done?" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-secondary">Priority</label>
                    <select className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-secondary">Due Date</label>
                    <input type="date" className="w-full mt-1 bg-surface border border-border p-2 rounded text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs bg-surface border border-border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-primary text-white font-semibold rounded">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
