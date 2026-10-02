import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const website = await prisma.website.findUnique({
      where: { slug },
      include: {
        pages: { orderBy: { title: "asc" }, include: { sections: { orderBy: { order: "asc" } } } },
        business: { include: { services: true, images: true } },
      },
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
    const existing = await prisma.website.findUnique({ where: { slug }, include: { business: true, pages: true } });
    if (!existing || existing.business.userId !== userId) return Response.json({ error: "Website not found" }, { status: 404 });

    const config = body.config && typeof body.config === "object" ? body.config : {};
    const businessData = body.business || {};
    const nextSlug = String(businessData.slug || config.slug || existing.slug).trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || existing.slug;

    const website = await prisma.website.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
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
        }},
      },
      include: { pages: { include: { sections: true } }, business: { include: { services: true, images: true } } },
    });

    if (Array.isArray(body.pages)) {
      for (const page of body.pages) {
        if (!page?.title || !page?.slug) continue;
        const pageSlug = String(page.slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";
        const savedPage = await prisma.page.upsert({
          where: { websiteId_slug: { websiteId: existing.id, slug: pageSlug } },
          create: { websiteId: existing.id, title: String(page.title), slug: pageSlug },
          update: { title: String(page.title) },
        });
        if (Array.isArray(page.sections)) {
          await prisma.section.deleteMany({ where: { pageId: savedPage.id } });
          if (page.sections.length) {
            await prisma.section.createMany({
              data: page.sections.map((section: any, index: number) => ({
                pageId: savedPage.id,
                type: String(section.type || "content"),
                order: Number.isFinite(Number(section.order)) ? Number(section.order) : index,
                data: section.data && typeof section.data === "object" ? section.data : {},
              })),
            });
          }
        }
      }
    }

    return Response.json({ ok: true, website });
  } catch (error) {
    console.error("PUT /api/websites/[slug]", error);
    return Response.json({ error: "Database is not configured yet." }, { status: 503 });
  }
}
