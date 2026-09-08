import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  CheckSquare, 
  Receipt,
  Briefcase 
} from "lucide-react";

async function getDashboardData(userId: number) {
  // Direct Prisma call in Server Component for optimal performance
  const { prisma } = await import("@/lib/prisma");
  const todayStr = new Date().toISOString().split("T")[0];
  const firstOfMonth = todayStr.substring(0, 7) + "-01";

  const [allInc, allExp, mInc, mExp, pots, goals, bills, tasks, routines, projects] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: "income" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "expense" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "income", date: { gte: firstOfMonth } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "expense", date: { gte: firstOfMonth } }, _sum: { amount: true } }),
    prisma.savingsPot.aggregate({ where: { userId }, _sum: { currentAmount: true } }),
    prisma.goal.findMany({ where: { userId, status: "Active" }, take: 4 }),
    prisma.bill.findMany({ where: { userId, isActive: true }, take: 3 }),
    prisma.task.findMany({ where: { userId, dueDate: todayStr, status: { not: "Completed" } } }),
    prisma.routine.findMany({ where: { userId, isActive: true }, take: 4 }),
    prisma.officeProject.findMany({ where: { userId, status: "Active" }, take: 3 })
  ]);

  const totalInc = allInc._sum.amount || 0;
  const totalExp = allExp._sum.amount || 0;

  return {
    finance: {
      balance: Math.round((totalInc - totalExp) * 100) / 100,
      incomeMonth: Math.round((mInc._sum.amount || 0) * 100) / 100,
      expenseMonth: Math.round((mExp._sum.amount || 0) * 100) / 100,
      savings: Math.round((pots._sum.currentAmount || 0) * 100) / 100
    },
    goals: goals.map(g => ({ ...g, pct: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0 })),
    bills,
    tasks,
    routines,
    projects
  };
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);
  const cur = user.currencySymbol || "$";

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10">
      <Navigation user={user} onOpenQuickAdd={() => {}} />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Hello, {user.fullName || user.username} 👋</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })} &bull; <span className="text-indigo-400 font-semibold">{user.officeRole}</span>
          </p>
        </div>

        {/* 1. Finance Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Current Balance</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-white">{cur}{data.finance.balance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Net Cashflow</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Income This Month</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-emerald-400">+{cur}{data.finance.incomeMonth.toLocaleString()}</div>
            <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> This Month</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Expenses This Month</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-red-400">-{cur}{data.finance.expenseMonth.toLocaleString()}</div>
            <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> This Month</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl">
            <div className="text-[11px] font-bold uppercase text-muted-foreground">Total Savings</div>
            <div className="text-xl md:text-2xl font-bold mt-1 text-indigo-400">{cur}{data.finance.savings.toLocaleString()}</div>
            <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1"><PiggyBank className="w-3 h-3" /> In Pots</div>
          </div>
        </div>

        {/* 2. Today's Action Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-card border border-border p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> Today's Tasks ({data.tasks.length})
              </h3>
            </div>
            {data.tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No pending tasks due today.</p>
            ) : (
              <div className="space-y-2">
                {data.tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border text-sm">
                    <span>{t.title}</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">{t.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals */}
          <div className="bg-card border border-border p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Active Goals
              </h3>
            </div>
            {data.goals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No goals configured yet.</p>
            ) : (
              <div className="space-y-3">
                {data.goals.map((g) => (
                  <div key={g.id} className="p-3 bg-surface rounded-lg border border-border">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{g.name}</span>
                      <span className="text-emerald-400">{g.pct}%</span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, g.pct)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
