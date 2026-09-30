import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!slug || !name || !email || !message) {
      return Response.json({ error: "Name, email, message and website are required." }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { slug },
      select: { businessId: true },
    });

    if (!website) return Response.json({ error: "Website not found." }, { status: 404 });

    const lead = await prisma.lead.create({
      data: { businessId: website.businessId, name, email, phone: phone || null, message },
      select: { id: true, createdAt: true },
    });

    return Response.json({ ok: true, lead });
  } catch {
    return Response.json({ error: "Lead storage is not configured yet." }, { status: 503 });
  }
}
