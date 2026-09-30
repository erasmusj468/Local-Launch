import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(sessionCookie)?.value;
  const userId = readSession(token);
  if (!userId) return Response.json({ user: null }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
    if (!user) return Response.json({ user: null }, { status: 401 });
    const ownerEmail = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
    const role = ownerEmail && user.email.toLowerCase() === ownerEmail ? "owner" : "customer";
    if (user.role !== role) await prisma.user.update({ where: { id: user.id }, data: { role } });
    return Response.json({ user: { ...user, role } });
  } catch { return Response.json({ error: "Database is not configured yet." }, { status: 503 }); }
}
