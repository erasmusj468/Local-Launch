import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Adjust import path to match your Prisma client helper location
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("========================================");
    console.log("[AUTH DEBUG] New login attempt initiated");

    if (!email || !password) {
      console.log("[AUTH DEBUG] Rejected: Missing email or password field in request payload.");
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Normalize email casing and whitespace
    const cleanEmail = email.trim().toLowerCase();
    console.log(`[AUTH DEBUG] Searching database for email: "${cleanEmail}"`);

    // 2. Query Neon PostgreSQL database via Prisma
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      console.log(`[AUTH DEBUG] Rejected: No account exists for "${cleanEmail}".`);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log(`[AUTH DEBUG] User record located. ID: ${user.id} | Role: ${user.role}`);

    // 3. Resolve password hash property name (handles passwordHash vs password column)
    const storedHash = user.passwordHash || (user as unknown as { password?: string }).password;

    if (!storedHash) {
      console.log("[AUTH DEBUG] Rejected: Account record has no password hash stored.");
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Validate password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    console.log(`[AUTH DEBUG] Password hash match result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log("[AUTH DEBUG] Rejected: Incorrect password provided.");
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log("[AUTH DEBUG] Success: Credentials verified successfully.");

    // 5. Attach authentication session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7-day expiration
    });

    // 6. Return authenticated user payload
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
      },
    });

  } catch (error: unknown) {
    console.error("[AUTH DEBUG] Unexpected server runtime error during login:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
