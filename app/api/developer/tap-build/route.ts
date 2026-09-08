import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return unauthorizedResponse();

  const { taps } = await req.json();
  const threshold = parseInt(process.env.NEXT_PUBLIC_DEV_TAP_THRESHOLD || "7");

  if (user.devModeUnlocked) {
    return NextResponse.json({ unlocked: true, enabled: user.devModeEnabled, message: "Developer Mode already unlocked." });
  }

  if (taps < threshold) {
    const remaining = threshold - taps;
    return NextResponse.json({
      unlocked: false,
      remaining,
      message: remaining <= 4 ? `You are ${remaining} steps away from becoming a developer.` : ""
    });
  }

  // Taps reached threshold: STRICT ROLE CHECK
  if (user.officeRole !== "Developer") {
    return NextResponse.json({
      unlocked: false,
      role_mismatch: true,
      current_role: user.officeRole,
      message: `Developer Mode is only available to users with the Developer office profile. Current role: '${user.officeRole}'.`
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { devModeUnlocked: true, devModeEnabled: true }
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Developer Mode Unlocked!",
      message: "You are now a developer! Dev Workspace is active.",
      type: "system",
      link: "/developer"
    }
  });

  return NextResponse.json({
    unlocked: true,
    enabled: true,
    message: "🎉 You are now a developer! Developer Mode workspace unlocked."
  });
}
