"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Developer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          officeRole: regRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background">
      <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xl leading-none">Life Hub</h2>
            <p className="text-xs text-muted-foreground mt-1">All-in-One Life Platform</p>
          </div>
        </div>

        <div className="flex bg-surface p-1 rounded-xl mb-6">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${tab === "login" ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${tab === "register" ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg mb-4">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary">Username or Email</label>
              <input
                type="text"
                required
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary">Password</label>
              <input
                type="password"
                required
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm transition"
            >
              {loading ? "Signing in..." : "Sign In to Life Hub"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary">Username</label>
              <input
                type="text"
                required
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary">Email</label>
              <input
                type="email"
                required
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary">Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary">Office Profile Role</label>
              <select
                className="w-full mt-1 bg-surface border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                {["Developer", "Designer", "Manager", "HR", "Student/Intern", "Sales", "Marketing", "Finance", "Other"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm transition"
            >
              {loading ? "Creating..." : "Create Free Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
