import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "all";
  const todayStr = new Date().toISOString().split("T")[0];

  const where: any = { userId: user.id };
  if (view === "today") {
    where.dueDate = todayStr;
    where.status = { notIn: ["Completed", "Archived"] };
  } else if (view === "upcoming") {
    where.dueDate = { gt: todayStr };
    where.status = { notIn: ["Completed", "Archived"] };
  } else if (view === "overdue") {
    where.dueDate = { lt: todayStr, not: "" };
    where.status = { notIn: ["Completed", "Archived"] };
  } else if (view === "completed") {
    where.status = "Completed";
  } else {
    where.status = { not: "Archived" };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { relatedGoal: true, relatedProject: true },
    orderBy: { dueDate: "asc" }
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || "",
      dueDate: body.due_date || "",
      dueTime: body.due_time || "",
      priority: body.priority || "Medium",
      category: body.category || "General",
      recurrence: body.recurrence || "None",
      isOffice: !!body.is_office,
      isDeveloper: !!body.is_developer,
      relatedGoalId: body.related_goal_id ? parseInt(body.related_goal_id) : null,
      relatedProjectId: body.related_project_id ? parseInt(body.related_project_id) : null
    }
  });

  return NextResponse.json(task, { status: 201 });
}
