import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q) return NextResponse.json({ results: {}, total_matches: 0 });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, description: { contains: q, mode: "insensitive" } },
    take: 5
  });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
    take: 5
  });

  const goals = await prisma.goal.findMany({
    where: { userId: user.id, name: { contains: q, mode: "insensitive" } },
    take: 5
  });

  const notes = await prisma.dailyNote.findMany({
    where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
    take: 5
  });

  return NextResponse.json({
    query: q,
    total_matches: transactions.length + tasks.length + goals.length + notes.length,
    results: { transactions, tasks, goals, notes }
  });
}
