import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";

export default async function PublicSiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let website: { status: string; name: string; business: { userId: string }; pages: { title: string; slug: string }[] } | null = null;
  try {
    website = await prisma.website.findUnique({ where: { slug }, select: { status: true, name: true, business: { select: { userId: true } }, pages: { orderBy: { title: "asc" }, select: { title: true, slug: true } } } });
  } catch {
    return children;
  }
  if (!website) return children;

  const userId = readSession((await cookies()).get(sessionCookie)?.value);
  const isOwnerPreview = userId === website.business.userId;
  if (website.status !== "published" && !isOwnerPreview) notFound();

  return <>
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.94)", borderBottom: "1px solid #dfe8e2", backdropFilter: "blur(14px)" }}>
      <div style={{ width: "min(1180px,calc(100% - 30px))", margin: "auto", minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <a href={`/sites/${slug}`} className="brand"><span className="logoMark"><span className="logoRoof"/><span className="logoDoor"/></span><span>{website.name}</span></a>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {website.pages.map((page) => <a key={page.slug} className="button secondary small" href={page.slug === "home" ? `/sites/${slug}` : `/sites/${slug}/${page.slug}`}>{page.title}</a>)}
        </nav>
      </div>
    </header>
    {children}
  </>;
}
