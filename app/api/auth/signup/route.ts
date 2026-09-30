import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalized = String(email || "").trim().toLowerCase();
    const pass = String(password || "");
    if (!/^\S+@\S+\.\S+$/.test(normalized) || pass.length < 8) {
      return Response.json({ error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    const user = await prisma.user.create({ data: { email: normalized, passwordHash: hashPassword(pass) }, select: { id: true, email: true } });
    const response = Response.json({ ok: true, user });
    response.headers.append("Set-Cookie", `${sessionCookie}=${createSession(user.id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return response;
  } catch {
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
