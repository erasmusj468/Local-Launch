import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("========================================");
    console.log("[AUTH DEBUG] New login attempt initiated");

    if (!email || !password) {
      console.log("[AUTH DEBUG] Rejected: Missing email or password field.");
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Normalize email casing and whitespace
    const cleanEmail = email.trim().toLowerCase();
    console.log(`[AUTH DEBUG] Searching database for email: "${cleanEmail}"`);

    // 2. Query Neon database via Prisma
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

    // 3. Resolve password hash
    const storedHash = user.passwordHash;

    if (!storedHash) {
      console.log("[AUTH DEBUG] Rejected: Account record has no password hash stored.");
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Validate password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    console.log(`[AUTH DEBUG] Password match result: ${isPasswordValid}`);

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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 6. Return payload without 'name' property
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
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
