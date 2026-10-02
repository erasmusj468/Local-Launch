import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });

    const ownerEmail = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
    const role = ownerEmail && cleanEmail === ownerEmail ? "owner" : "customer";
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({ data: { email: cleanEmail, passwordHash, role } });

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
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}
