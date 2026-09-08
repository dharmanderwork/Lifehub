import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, fullName, officeRole, currency, currencySymbol, securityQuestion, securityAnswer } = body;

    if (!username || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid registration parameters." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: email.toLowerCase() }]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Username or email already registered." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const securityAnswerHash = securityAnswer ? await hashPassword(securityAnswer.toLowerCase().trim()) : "";

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName?.trim() || "",
        officeRole: officeRole || "Developer",
        currency: currency || "USD",
        currencySymbol: currencySymbol || "$",
        securityQuestion: securityQuestion || "What is your favorite book or city?",
        securityAnswerHash,
      }
    });

    // Seed default categories
    await prisma.category.createMany({
      data: [
        { userId: user.id, name: "Salary", type: "income", icon: "briefcase", color: "#10b981", isDefault: true },
        { userId: user.id, name: "Freelance", type: "income", icon: "laptop", color: "#3b82f6", isDefault: true },
        { userId: user.id, name: "Housing & Rent", type: "expense", icon: "home", color: "#ef4444", isDefault: true },
        { userId: user.id, name: "Food & Dining", type: "expense", icon: "utensils", color: "#f97316", isDefault: true },
        { userId: user.id, name: "Groceries", type: "expense", icon: "shopping-cart", color: "#eab308", isDefault: true },
        { userId: user.id, name: "Utilities", type: "expense", icon: "zap", color: "#84cc16", isDefault: true },
        { userId: user.id, name: "Subscriptions", type: "expense", icon: "repeat", color: "#6366f1", isDefault: true },
      ]
    });

    // Seed initial routines
    await prisma.routine.createMany({
      data: [
        { userId: user.id, title: "Drink 500ml Water & Stretch", type: "morning", timeOfDay: "07:00", icon: "sun" },
        { userId: user.id, title: "Review Today's Top Priorities", type: "morning", timeOfDay: "08:00", icon: "check-square" },
        { userId: user.id, title: "Workday Wrap-up & Reflection", type: "evening", timeOfDay: "18:00", icon: "briefcase" }
      ]
    });

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Life Hub!",
        message: "Your all-in-one personal operating system is ready.",
        type: "system",
        link: "/dashboard"
      }
    });

    const token = await signToken(user.id, user.username);
    const res = NextResponse.json({ message: "Registration successful!", token, user: { id: user.id, username: user.username, email: user.email } }, { status: 201 });
    res.cookies.set("lifehub_session", token, { httpOnly: true, maxAge: 30 * 86400, path: "/", sameSite: "lax" });
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 });
  }
}
