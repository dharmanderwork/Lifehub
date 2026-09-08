import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const bills = await prisma.bill.findMany({
    where: { userId: user.id },
    orderBy: { nextPaymentDate: "asc" }
  });

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  bills.forEach(b => {
    if (b.isActive) {
      if (b.frequency === "Weekly") { monthlyTotal += b.amount * 4.33; yearlyTotal += b.amount * 52; }
      else if (b.frequency === "Monthly") { monthlyTotal += b.amount; yearlyTotal += b.amount * 12; }
      else if (b.frequency === "Quarterly") { monthlyTotal += b.amount / 3; yearlyTotal += b.amount * 4; }
      else { monthlyTotal += b.amount / 12; yearlyTotal += b.amount; }
    }
  });

  return NextResponse.json({
    bills,
    summary: {
      monthly_recurring_cost: Math.round(monthlyTotal * 100) / 100,
      yearly_estimated_cost: Math.round(yearlyTotal * 100) / 100,
      active_subscriptions: bills.filter(b => b.isActive).length
    }
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const bill = await prisma.bill.create({
    data: {
      userId: user.id,
      name: body.name,
      amount: parseFloat(body.amount),
      frequency: body.frequency || "Monthly",
      nextPaymentDate: body.next_payment_date,
      category: body.category || "Utilities",
      paymentMethod: body.payment_method || "Auto-debit",
      notes: body.notes || ""
    }
  });

  return NextResponse.json(bill, { status: 201 });
}
