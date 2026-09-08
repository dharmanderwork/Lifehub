import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: [{ isRead: "asc" }, { id: "desc" }],
    take: 50
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false }
  });

  return NextResponse.json({ notifications, unread_count: unreadCount });
}
