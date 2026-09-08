import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const pots = await prisma.savingsPot.findMany({
    where: { userId: user.id },
    orderBy: { id: "asc" }
  });

  const totalSaved = pots.reduce((sum, p) => sum + p.currentAmount, 0);
  const totalTarget = pots.reduce((sum, p) => sum + p.targetAmount, 0);

  return NextResponse.json({
    pots: pots.map(p => ({
      ...p,
      progress_pct: p.targetAmount > 0 ? Math.round((p.currentAmount / p.targetAmount) * 1000) / 10 : 0
    })),
    summary: {
      total_saved: Math.round(totalSaved * 100) / 100,
      total_target: Math.round(totalTarget * 100) / 100,
      overall_progress_pct: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 1000) / 10 : 0,
      pot_count: pots.length
    }
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const pot = await prisma.savingsPot.create({
    data: {
      userId: user.id,
      name: body.name,
      targetAmount: parseFloat(body.target_amount),
      currentAmount: parseFloat(body.current_amount || 0),
      notes: body.notes || ""
    }
  });

  return NextResponse.json(pot, { status: 201 });
}
