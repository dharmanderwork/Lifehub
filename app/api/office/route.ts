import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const todayStr = new Date().toISOString().split("T")[0];

  const projects = await prisma.officeProject.findMany({
    where: { userId: user.id },
    include: { tasks: true }
  });

  const meetings = await prisma.officeMeeting.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" }
  });

  // const contacts = await prisma.officeContact.findMany({
  //   where: { userId: user.id },
  //   orderBy: { name: "asc" }
  // });

  // const links = await prisma.officeLink.findMany({
  //   where: { userId: user.id },
  //   orderBy: { id: "desc" }
  // });

  // const roleItems = await prisma.officeRoleItem.findMany({
  //   where: { userId: user.id, role: user.officeRole }
  // });

  return NextResponse.json({
    role: user.officeRole,
    projects,
    meetings,
    // contacts,
    // links,
    // roleItems
  });
}
