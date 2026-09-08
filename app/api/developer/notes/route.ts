import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || !user.devModeUnlocked) return unauthorizedResponse();

  const notes = await prisma.developerNote.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" }
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || !user.devModeUnlocked) return unauthorizedResponse();

  const body = await req.json();
  const note = await prisma.developerNote.create({
    data: {
      userId: user.id,
      title: body.title,
      category: body.category || "snippet",
      language: body.language || "javascript",
      codeOrContent: body.code_or_content,
      description: body.description || "",
      tags: body.tags || ""
    }
  });

  return NextResponse.json(note, { status: 201 });
}
