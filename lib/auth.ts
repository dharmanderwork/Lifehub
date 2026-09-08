import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-production-key-lifehub-2026-replace-me"
);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signToken(userId: number, username: string): Promise<string> {
  return await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: number; username: string };
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get("lifehub_session")?.value;
    }
  } else {
    token = cookies().get("lifehub_session")?.value;
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      currency: true,
      currencySymbol: true,
      dateFormat: true,
      theme: true,
      officeRole: true,
      devModeUnlocked: true,
      devModeEnabled: true,
      onboardingCompleted: true,
      dailyModules: true,
      notificationSettings: true,
      createdAt: true
    }
  });

  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
}
