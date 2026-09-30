import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const website = await prisma.website.findUnique({
      where: { slug },
      include: { business: { include: { services: true, images: true, leads: { orderBy: { createdAt: "desc" }, take: 20 } } } },
    });
    if (!website) return Response.json({ error: "Website not found" }, { status: 404 });
    return Response.json({ website: { ...website, config: website.config || {} } });
  } catch (error) {
    console.error("GET /api/websites/[slug]", error);
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const token = (await cookies()).get(sessionCookie)?.value;
    const userId = readSession(token);
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { slug } = await params;
    const body = await request.json();
    const existing = await prisma.website.findUnique({ where: { slug }, include: { business: true } });
    if (!existing || existing.business.userId !== userId) return Response.json({ error: "Website not found" }, { status: 404 });
    const config = body.config && typeof body.config === "object" ? body.config : {};
    const businessData = body.business || {};
    const website = await prisma.website.update({
      where: { id: existing.id },
      data: {
        name: String(businessData.name || existing.name),
        template: String(businessData.template || existing.template),
        status: body.status === "draft" ? "draft" : "published",
        config,
        business: { update: {
          name: String(businessData.name || existing.business.name),
          category: String(businessData.category || existing.business.category),
          location: String(businessData.location || existing.business.location),
          description: businessData.description ?? existing.business.description,
          phone: businessData.phone ?? existing.business.phone,
          whatsapp: businessData.whatsapp ?? existing.business.whatsapp,
          email: businessData.email ?? existing.business.email,
        }}
      },
      include: { business: { include: { services: true, images: true } } },
    });
    return Response.json({ ok: true, website });
  } catch (error) {
    console.error("PUT /api/websites/[slug]", error);
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
