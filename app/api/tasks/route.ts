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
  include: {
    officeProject: true,
  },
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
      priority: body.priority || "Medium",
      category: body.category || "General",
      status: body.status || "To Do",
      recurrence: body.recurrence || "None",
      isDeveloper: !!body.is_developer,

      officeProjectId: body.related_project_id
        ? parseInt(body.related_project_id)
        : null,
    },
    include: {
      officeProject: true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

