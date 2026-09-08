import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "Active";

  const goals = await prisma.goal.findMany({
    where: { userId: user.id, ...(status ? { status } : {}) },
    include: { milestones: true, savingsPot: true },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(goals.map(g => ({
    ...g,
    progress_pct: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 1000) / 10 : 0
  })));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: body.name,
      description: body.description || "",
      category: body.category || "Personal",
      priority: body.priority || "Medium",
      targetAmount: parseFloat(body.target_amount || 0),
      currentAmount: parseFloat(body.current_amount || 0),
      targetDate: body.target_date || "",
      savingsPotId: body.savings_pot_id ? parseInt(body.savings_pot_id) : null
    }
  });

  return NextResponse.json(goal, { status: 201 });
}
