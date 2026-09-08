import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username_or_email, password } = await req.json();
    if (!username_or_email || !password) {
      return NextResponse.json({ error: "Missing login credentials." }, { status: 400 });
    }

    const identifier = username_or_email.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier.toLowerCase() }]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 400 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 400 });
    }

    const token = await signToken(user.id, user.username);
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      currency: user.currency,
      currencySymbol: user.currencySymbol,
      officeRole: user.officeRole,
      devModeUnlocked: user.devModeUnlocked,
      devModeEnabled: user.devModeEnabled,
      onboardingCompleted: user.onboardingCompleted,
      dailyModules: user.dailyModules
    };

    const res = NextResponse.json({ message: "Logged in successfully.", token, user: sanitizedUser });
    res.cookies.set("lifehub_session", token, { httpOnly: true, maxAge: 30 * 86400, path: "/", sameSite: "lax" });
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 500 });
  }
}
