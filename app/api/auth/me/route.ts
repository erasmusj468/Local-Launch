import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(sessionCookie)?.value;
  const userId = readSession(token);
  if (!userId) return Response.json({ user: null }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
    return user ? Response.json({ user }) : Response.json({ user: null }, { status: 401 });
  } catch { return Response.json({ error: "Database is not configured yet." }, { status: 503 }); }
}
