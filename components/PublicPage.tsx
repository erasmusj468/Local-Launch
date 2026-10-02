"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PublicPage({ slug, pageSlug }: { slug: string; pageSlug: string }) {
  const [website, setWebsite] = useState<any>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/websites/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setWebsite(data?.website || null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="authPage"><p className="muted">Loading website…</p></main>;
  if (!website) return <main className="authPage"><div className="authCard"><h2>Website unavailable</h2><p className="muted">This website has not been published or could not be found.</p><a className="button" href="/">Back to LocalLaunch</a></div></main>;

  const config = website.config && typeof website.config === "object" ? website.config : {};
  const business = website.business || {};
  const page = (website.pages || []).find((item: any) => item.slug === pageSlug);
  const services = Array.isArray(business.services) ? business.services : [];
  const accent = config.primaryColor || "#183d2a";
  const pages = website.pages || [];
  const title = page?.title || "Page";
  const description = business.description || "Professional service from a local business.";
  const social = String(config.social || "").split(/[,\n]/).map((x: string) => x.trim()).filter(Boolean);

  if (!page) return <main className="authPage"><div className="authCard"><h2>Page not found</h2><p className="muted">The requested page does not exist on this website.</p><a className="button" href={`/sites/${slug}`}>Back to home</a></div></main>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, name: data.get("name"), email: data.get("email"), phone: data.get("phone"), message: data.get("message") }) });
    if (response.ok) setSent(true);
  }

  const sectionEnabled = (type: string) => page.sections?.some((section: any) => section.type === type && section.data?.enabled !== false) ?? true;

  return <main className="generatedSite" style={{ "--site-accent": accent, fontFamily: config.font || "Inter" } as React.CSSProperties}>
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.94)", borderBottom: "1px solid #dfe8e2", backdropFilter: "blur(14px)" }}>
      <div style={{ width: "min(1180px,calc(100% - 30px))", margin: "auto", minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <a href={`/sites/${slug}`} className="brand"><span className="logoMark"><span className="logoRoof"/><span className="logoDoor"/></span><span>{business.name || website.name}</span></a>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{pages.map((item: any) => <a key={item.slug} className={item.slug === pageSlug ? "pill" : "button secondary small"} href={item.slug === "home" ? `/sites/${slug}` : `/sites/${slug}/${item.slug}`}>{item.title}</a>)}</nav>
      </div>
    </header>

    <section className="previewHero" style={{ background: config.heroImage ? `linear-gradient(#0008,#0008),url(${config.heroImage}) center/cover` : accent }}>
      <div style={{ width: "min(1100px,100%);", margin: "auto" }}>
        <span style={{ opacity: .75 }}>{String(business.category || "Local business").toUpperCase()}</span>
        <h1>{pageSlug === "home" ? (config.headline || description.split(".")[0] || business.name) : title}</h1>
        <p>{pageSlug === "home" ? description : `${business.name || website.name} · ${business.location || "Local business"}`}</p>
        <div className="actions"><a className="pill" href={business.whatsapp ? `https://wa.me/${String(business.whatsapp).replace(/\D/g, "")}` : `tel:${business.phone || ""}`}>{business.whatsapp ? "WhatsApp" : "Contact us"}</a>{business.location && <a className="pill" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location)}`}>Get directions</a>}</div>
      </div>
    </section>

    <section className="section">
      {sectionEnabled("services") && <div><div className="sectionHead"><span className="eyebrow">Services</span><h2>What we offer</h2></div><div className="grid">{services.length ? services.map((service: any) => <article className="card" key={service.id || service.name}><span className="eyebrow">Service</span><h3>{service.name}</h3>{service.price && <strong style={{ color: accent }}>{service.price}</strong>}<p className="muted">{service.description || "Professional service with clear communication."}</p></article>) : <div className="card"><h3>Services</h3><p className="muted">Contact the business to learn more.</p></div>}</div></div>}

      {sectionEnabled("about") && <div className="card" style={{ marginTop: 45 }}><span className="eyebrow">About</span><h2>{business.name || website.name}</h2><p className="muted">{description}</p></div>}

      {sectionEnabled("contact") && <div className="grid3" style={{ marginTop: 28 }}><div className="card"><h3>Location</h3><p className="muted">{business.location || "Contact us for our location."}</p></div><div className="card"><h3>Phone</h3><p className="muted">{business.phone || "Contact us by email or WhatsApp."}</p></div><div className="card"><h3>Hours</h3><p className="muted">{config.hours || "Contact us for opening hours."}</p></div></div>}

      {social.length > 0 && <div className="card" style={{ marginTop: 28 }}><h3>Follow us</h3><div className="actions" style={{ marginTop: 12 }}>{social.map((link: string) => <a className="pill" key={link} href={/^https?:\/\//i.test(link) ? link : `https://${link}`} target="_blank" rel="noreferrer">{link.replace(/^https?:\/\//i, "")}</a>)}</div></div>}

      {sectionEnabled("form") && <div className="card" style={{ marginTop: 45 }}><span className="eyebrow">Contact</span><h2>Send an enquiry</h2>{sent ? <p><strong>Thanks — the enquiry was received.</strong></p> : <form onSubmit={submit}><div className="grid3"><input name="name" required placeholder="Your name"/><input name="email" type="email" required placeholder="Email address"/><input name="phone" placeholder="Phone number"/></div><textarea name="message" required placeholder="How can we help?" rows={5} style={{ marginTop: 12 }}/><button className="button" style={{ marginTop: 12 }}>Send enquiry</button></form>}</div>}
    </section>

    <footer className="footer"><span><b>{business.name || website.name}</b> · {business.location || "Local business"}</span><span>{business.phone || business.email || "Get in touch"} · Built with LocalLaunch</span></footer>
  </main>;
}
