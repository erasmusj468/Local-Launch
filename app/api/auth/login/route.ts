import { prisma } from "@/lib/prisma";
import { createSession, sessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalized = String(email || "").trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user?.passwordHash || !verifyPassword(String(password || ""), user.passwordHash)) return Response.json({ error: "Invalid email or password." }, { status: 401 });
    const ownerEmail = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
    const role = ownerEmail && user.email.toLowerCase() === ownerEmail ? "owner" : "customer";
    if (user.role !== role) await prisma.user.update({ where: { id: user.id }, data: { role } });
    const response = Response.json({ ok: true, user: { id: user.id, email: user.email, role } });
    response.headers.append("Set-Cookie", `${sessionCookie}=${createSession(user.id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return response;
  } catch { return Response.json({ error: "Database is not configured yet." }, { status: 503 }); }
}
