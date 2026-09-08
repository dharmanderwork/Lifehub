import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || !user.devModeUnlocked) return unauthorizedResponse();

  const tasks = await prisma.developerTask.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || !user.devModeUnlocked) return unauthorizedResponse();

  const body = await req.json();
  const task = await prisma.developerTask.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || "",
      issueType: body.issue_type || "Feature",
      severity: body.severity || "Medium",
      status: body.status || "To Do",
      branchOrPr: body.branch_or_pr || ""
    }
  });

  return NextResponse.json(task, { status: 201 });
}
