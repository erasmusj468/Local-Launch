import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const businesses = await (prisma.business.findMany as any)({
      orderBy: { createdAt: "desc" },
      include: {
        services: true,
        images: true,
        websites: {
          include: {
            analytics: { orderBy: { date: "desc" }, take: 30 },
          },
        },
        leads: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json(businesses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, phone, whatsapp, email, location, description, services, slug } = body;

    const businessSlug =
      slug ||
      String(name || "business")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      "business";

    const business = await (prisma.business.create as any)({
      data: {
        name: name || "My Business",
        category: category || "General",
        phone: phone || "",
        whatsapp: whatsapp || "",
        email: email || "",
        location: location || "",
        description: description || "",
        websites: {
          create: {
            slug: businessSlug,
            name: name || "My Business",
            published: true,
            config: {
              category,
              phone,
              whatsapp,
              email,
              location,
              description,
              services,
            },
          },
        },
      },
      include: {
        websites: true,
      },
    });

    return NextResponse.json({ business });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create business" }, { status: 500 });
  }
}
