import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const todayStr = new Date().toISOString().split("T")[0];

  const routines = await prisma.routine.findMany({
    where: { userId: user.id, isActive: true },
    include: { completions: { where: { date: todayStr } } }
  });

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: { logs: { where: { date: todayStr } } }
  });

  const shopping = await prisma.shoppingList.findMany({
    where: { userId: user.id },
    include: { items: true }
  });

  const dates = await prisma.importantDate.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" }
  });

  const notes = await prisma.dailyNote.findMany({
    where: { userId: user.id },
    orderBy: [{ isPinned: "desc" }, { id: "desc" }]
  });

  const dailyPlan = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId: user.id, date: todayStr } }
  });

  return NextResponse.json({
    routines: routines.map(r => ({ ...r, completed_today: r.completions.length > 0 })),
    habits: habits.map(h => ({ ...h, completed_today: h.logs.length > 0 })),
    shopping,
    dates,
    notes,
    daily_plan: dailyPlan
  });
}
