import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PublicSiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const website = await prisma.website.findUnique({ where: { slug }, select: { status: true, name: true, pages: { orderBy: { title: "asc" }, select: { title: true, slug: true } } } });
  if (!website || website.status !== "published") notFound();

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
