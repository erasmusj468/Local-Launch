import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

async function currentUserId() {
  const token = (await cookies()).get(sessionCookie)?.value;
  return readSession(token);
}

export async function GET() {
  try {
    const userId = await currentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businesses = await prisma.business.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        services: true,
        images: true,
        websites: {
          include: {
            pages: { orderBy: { title: "asc" }, include: { sections: { orderBy: { order: "asc" } } } },
            analytics: { orderBy: { date: "desc" }, take: 30 },
          },
        },
        leads: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json({ businesses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await currentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, category, phone, whatsapp, email, location, description, services, slug } = body;
    const baseSlug = String(slug || name || "business")
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
    const businessSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const serviceList = String(services || "")
      .split(/[,\n]/).map((x) => x.trim()).filter(Boolean)
      .map((x) => { const [serviceName, ...price] = x.split("|"); return { name: serviceName.trim(), price: price.join("|").trim() || null }; });

    const business = await prisma.business.create({
      data: {
        userId,
        name: name || "My Business",
        category: category || "General",
        phone: phone || "",
        whatsapp: whatsapp || "",
        email: email || "",
        location: location || "",
        description: description || "",
        services: { create: serviceList },
        websites: {
          create: {
            slug: businessSlug,
            name: name || "My Business",
            status: "draft",
            template: category === "Restaurant" ? "restaurant" : category === "Automotive" ? "automotive" : category === "Fitness" ? "fitness" : category === "Beauty" ? "beauty" : category === "Construction" ? "construction" : "professional",
            config: {
              category, phone, whatsapp, email, location, description,
              services: String(services || ""),
              showAbout: true, showHours: true, showContact: true, showGallery: true, showReviews: true, showForm: true,
            },
            pages: {
              create: [
                { title: "Home", slug: "home", sections: { create: [
                  { type: "hero", order: 0, data: { enabled: true } },
                  { type: "services", order: 1, data: { enabled: true } },
                  { type: "about", order: 2, data: { enabled: true } },
                  { type: "contact", order: 3, data: { enabled: true } },
                ] } },
                { title: "About", slug: "about", sections: { create: [
                  { type: "about", order: 0, data: { enabled: true } },
                  { type: "contact", order: 1, data: { enabled: true } },
                ] } },
                { title: "Contact", slug: "contact", sections: { create: [
                  { type: "contact", order: 0, data: { enabled: true } },
                  { type: "form", order: 1, data: { enabled: true } },
                ] } },
              ],
            },
          },
        },
      },
      include: { websites: { include: { pages: true } } },
    });

    return NextResponse.json({ business });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create business" }, { status: 500 });
  }
}
