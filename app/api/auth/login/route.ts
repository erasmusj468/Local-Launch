import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user?.passwordHash) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const ownerEmail = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
    const role = ownerEmail && cleanEmail === ownerEmail ? "owner" : "customer";
    if (user.role !== role) await prisma.user.update({ where: { id: user.id }, data: { role } });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookie, createSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
