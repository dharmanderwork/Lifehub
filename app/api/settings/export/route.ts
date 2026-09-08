import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const [transactions, goals, tasks, bills, pots, notes, projects] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id } }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.task.findMany({ where: { userId: user.id } }),
    prisma.bill.findMany({ where: { userId: user.id } }),
    prisma.savingsPot.findMany({ where: { userId: user.id } }),
    prisma.dailyNote.findMany({ where: { userId: user.id } }),
    prisma.officeProject.findMany({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    metadata: {
      app: "Life Hub",
      version: "2.4.1",
      exportedAt: new Date().toISOString(),
      user: { id: user.id, username: user.username }
    },
    transactions,
    goals,
    tasks,
    bills,
    savings_pots: pots,
    notes,
    office_projects: projects
  });
}
