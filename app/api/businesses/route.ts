import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get(sessionCookie)?.value;
    const userId = readSession(token);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        services: true,
        websites: {
          include: {
            leads: { orderBy: { createdAt: "desc" }, take: 20 },
            analytics: { orderBy: { date: "desc" }, take: 30 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ businesses });
  } catch (error) {
    console.error("GET /api/businesses", error);
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}

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
    const services = Array.isArray(body.services)
      ? body.services.map((service: any) => typeof service === "string" ? ({ name: service }) : ({ name: String(service.name || "").trim(), description: service.description ? String(service.description) : null, price: service.price ? String(service.price) : null })).filter((service: any) => service.name)
      : [];
    const business = await prisma.business.create({
      data: {
        userId, name, category, location,
        description: body.description || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        services: { create: services },
        websites: { create: { name, slug: slug + "-" + Date.now().toString(36), status: "published", template: String(body.template || "professional") } }
      },
      include: { services: true, websites: true },
    });
    return Response.json({ ok: true, business });
  } catch (error) {
    console.error("POST /api/businesses", error);
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
