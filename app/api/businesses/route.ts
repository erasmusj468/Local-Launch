import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(sessionCookie)?.value;
    const userId = readSession(token);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const location = String(body.location || "").trim();
    if (!name || !category || !location) return Response.json({ error: "Business name, category and location are required." }, { status: 400 });

    const slug = String(body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
    const business = await prisma.business.create({
      data: {
        userId, name, category, location,
        description: body.description || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        services: Array.isArray(body.services) ? { create: body.services.map((service: string) => ({ name: service })) } : undefined,
        websites: { create: { name, slug: `${slug}-${Date.now().toString(36)}`, status: "published", template: String(body.template || "professional") } }
      },
      include: { websites: true },
    });
    return Response.json({ ok: true, business });
  } catch {
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
