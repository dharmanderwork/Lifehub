import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const todayStr = new Date().toISOString().split("T")[0];
  const firstOfMonth = todayStr.substring(0, 7) + "-01";
  const thirtyDaysLater = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  // Transactions calculations
  const allIncome = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "income" },
    _sum: { amount: true }
  });
  const allExpense = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "expense" },
    _sum: { amount: true }
  });

  const monthIncome = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "income", date: { gte: firstOfMonth } },
    _sum: { amount: true }
  });
  const monthExpense = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "expense", date: { gte: firstOfMonth } },
    _sum: { amount: true }
  });

  // Savings pots sum
  const potsSum = await prisma.savingsPot.aggregate({
    where: { userId: user.id },
    _sum: { currentAmount: true }
  });

  // Goals
  const activeGoals = await prisma.goal.findMany({
    where: { userId: user.id, status: "Active" },
    take: 4,
    orderBy: { id: "desc" }
  });

  // Upcoming bills
  const upcomingBills = await prisma.bill.findMany({
    where: {
      userId: user.id,
      isActive: true,
      nextPaymentDate: { gte: todayStr, lte: thirtyDaysLater }
    },
    take: 4,
    orderBy: { nextPaymentDate: "asc" }
  });

  // Today tasks
  const todayTasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: todayStr,
      status: { notIn: ["Completed", "Archived"] }
    }
  });

  // Overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: { lt: todayStr, not: "" },
      status: { notIn: ["Completed", "Archived"] }
    }
  });

  // Today routines
  const routines = await prisma.routine.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      completions: {
        where: { date: todayStr }
      }
    }
  });

  // Office projects & meetings
  const officeProjects = await prisma.officeProject.findMany({
    where: { userId: user.id, status: "Active" },
    take: 3
  });

  const officeMeetings = await prisma.officeMeeting.findMany({
    where: { userId: user.id, date: { gte: todayStr } },
    take: 3,
    orderBy: { date: "asc" }
  });

  const dailyPlan = await prisma.dailyPlan.findUnique({
    where: {
      userId_date: { userId: user.id, date: todayStr }
    }
  });

  const totalInc = allIncome._sum.amount || 0;
  const totalExp = allExpense._sum.amount || 0;

  return NextResponse.json({
    user,
    finance: {
      current_balance: Math.round((totalInc - totalExp) * 100) / 100,
      income_this_month: Math.round((monthIncome._sum.amount || 0) * 100) / 100,
      expenses_this_month: Math.round((monthExpense._sum.amount || 0) * 100) / 100,
      savings_total: Math.round((potsSum._sum.currentAmount || 0) * 100) / 100
    },
    goals: activeGoals.map(g => ({
      ...g,
      progress_pct: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 1000) / 10 : 0
    })),
    bills: {
      upcoming: upcomingBills,
      total_upcoming: Math.round(upcomingBills.reduce((acc, b) => acc + b.amount, 0) * 100) / 100,
      count: upcomingBills.length
    },
    tasks: {
      today: todayTasks,
      today_count: todayTasks.length,
      overdue: overdueTasks,
      overdue_count: overdueTasks.length
    },
    routines: routines.map(r => ({
      ...r,
      completed_today: r.completions.length > 0
    })),
    office: {
      projects: officeProjects,
      meetings: officeMeetings
    },
    today_plan: dailyPlan
  });
}
