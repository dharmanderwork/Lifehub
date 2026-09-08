import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const allInc = await prisma.transaction.aggregate({ where: { userId: user.id, type: "income" }, _sum: { amount: true } });
  const allExp = await prisma.transaction.aggregate({ where: { userId: user.id, type: "expense" }, _sum: { amount: true } });
  const potsSum = await prisma.savingsPot.aggregate({ where: { userId: user.id }, _sum: { currentAmount: true } });

  const totalInc = allInc._sum.amount || 0;
  const totalExp = allExp._sum.amount || 0;

  // Group by category for expenses
  const expenses = await prisma.transaction.findMany({
    where: { userId: user.id, type: "expense" }
  });

  const categoryTotals: { [k: string]: number } = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const spending_by_category = Object.entries(categoryTotals).map(([cat, amt]) => ({
    category: cat,
    amount: Math.round(amt * 100) / 100,
    percentage: totalExp > 0 ? Math.round((amt / totalExp) * 1000) / 10 : 0
  })).sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    all_time: {
      income: Math.round(totalInc * 100) / 100,
      expense: Math.round(totalExp * 100) / 100,
      net_balance: Math.round((totalInc - totalExp) * 100) / 100,
      total_savings: Math.round((potsSum._sum.currentAmount || 0) * 100) / 100
    },
    period: {
      filter: "this_month",
      income: Math.round(totalInc * 100) / 100,
      expense: Math.round(totalExp * 100) / 100,
      net: Math.round((totalInc - totalExp) * 100) / 100,
      savings_rate: totalInc > 0 && totalInc > totalExp ? Math.round(((totalInc - totalExp) / totalInc) * 1000) / 10 : 0
    },
    spending_by_category,
    monthly_trend: []
  });
}
