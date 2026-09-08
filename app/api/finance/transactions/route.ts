import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: any = { userId: user.id };
  if (type && type !== "all") where.type = type;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } }
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 100
  });

  return NextResponse.json({ transactions, total: transactions.length });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: body.type,
      amount: parseFloat(body.amount),
      category: body.category,
      date: body.date,
      description: body.description,
      notes: body.notes || "",
      isRecurring: !!body.is_recurring,
      recurringFrequency: body.recurring_frequency || ""
    }
  });

  return NextResponse.json(tx, { status: 201 });
}
