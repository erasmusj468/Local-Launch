import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookie } from "@/lib/auth";
import PublicPage from "@/components/PublicPage";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string; page: string }> };

async function getWebsite(slug: string) {
  return prisma.website.findUnique({ where: { slug }, include: { pages: true, business: true } });
}

async function canView(website: Awaited<ReturnType<typeof getWebsite>>) {
  if (!website) return false;
  if (website.status === "published") return true;
  const userId = readSession((await cookies()).get(sessionCookie)?.value);
  return userId === website.business.userId;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page: pageSlug } = await params;
  const website = await getWebsite(slug);
  if (!await canView(website) || !website) return { title: "Website unavailable | LocalLaunch" };
  const page = website.pages.find((item) => item.slug === pageSlug);
  if (!page) return { title: "Page not found | LocalLaunch" };
  const config = website.config && typeof website.config === "object" && website.config !== null ? website.config as Record<string, unknown> : {};
  return { title: String(config.seoTitle || `${page.title} | ${website.name}`), description: String(config.seoDescription || website.business.description || `Visit ${website.name}.`) };
}

export default async function PublicWebsitePage({ params }: Props) {
  const { slug, page } = await params;
  const website = await getWebsite(slug);
  if (!website) notFound();
  if (!await canView(website)) notFound();
  if (!website.pages.some((item) => item.slug === page)) notFound();
  return <PublicPage slug={slug} pageSlug={page} />;
}
