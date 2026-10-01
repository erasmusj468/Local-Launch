"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { examples } from "@/lib/demo";

interface ServiceItem {
  name: string;
  price?: string;
}

interface Review {
  name: string;
  rating: string;
  text: string;
}

interface SiteData {
  slug?: string;
  name?: string;
  category?: string;
  type?: string;
  headline?: string;
  tag?: string;
  description?: string;
  location?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  social?: string;
  hours?: string;
  logo?: string;
  heroImage?: string;
  primaryColor?: string;
  font?: string;
  services?: string | Array<{ name: string; price?: string }>;
  media?: string;
  reviews?: string;
  showAbout?: boolean;
  showReviews?: boolean;
  showHours?: boolean;
  showContact?: boolean;
  showGallery?: boolean;
  showForm?: boolean;
}

export default function Site() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [site, setSite] = useState<SiteData | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let mounted = true;

    async function loadSite() {
      try {
        const response = await fetch(`/api/websites/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          const w = data.website || {};
          const b = w.business || {};
          const config = w.config && typeof w.config === "object" ? w.config : {};

          if (mounted) {
            setSite({
              ...b,
              ...config,
              slug: w.slug,
              name: b.name || w.name,
              category: b.category || config.category,
              services: config.services ?? b.services?.map((s: any) => s.name) || "",
              media: config.media ?? b.images?.map((i: any) => i.url).join("\n") || "",
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // Silent catch to fall back to local/demo data below
      }

      try {
        const published = JSON.parse(localStorage.getItem("ll_published") || "null");
        const demo = examples.find((x) => x.slug === slug);

        if (mounted) {
          setSite(published?.slug === slug ? published : demo || null);
        }
      } catch {
        if (mounted) setSite(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSite();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading || !site) {
    return (
      <main className="authPage">
        <p className="muted">{loading ? "Loading website..." : "Website not found."}</p>
      </main>
    );
  }

  // --- Data Parsing ---
  const rawServices = Array.isArray(site.services)
    ? site.services
    : String(site.services || "")
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter(Boolean);

  const parsedServices: ServiceItem[] = rawServices.map((x) => {
    if (typeof x !== "string") {
      return { name: x.name || "Service", price: x.price || "" };
    }
    const [name, price] = x.split("|").map((v) => v.trim());
    return { name, price: price || "" };
  });

  const gallery = String(site.media || "")
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

  const reviews: Review[] = String(site.reviews || "")
    .split(/\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [name, rating, text] = x.split("|").map((v) => v.trim());
      return {
        name: name || "Customer",
        rating: rating || "5",
        text: text || "Great service and a professional experience.",
      };
    });

  const demoReviews: Review[] = [
    { name: "Happy customer", rating: "5", text: "Friendly service, clear communication and a great overall experience." },
    { name: "Local customer", rating: "5", text: "Professional from start to finish. Would happily recommend them." },
    { name: "Recent customer", rating: "5", text: "Excellent service and attention to detail." },
  ];

  const displayedReviews = reviews.length ? reviews : demoReviews;

  // --- Dynamic Layout Category Adjustments ---
  const category = String(site.category || site.type || "Local business");
  const kind = category.toLowerCase();

  const isFood = kind.includes("restaurant") || kind.includes("food") || kind.includes("cafe");
  const isAuto = kind.includes("auto") || kind.includes("mechanic");
  const isFitness = kind.includes("fitness") || kind.includes("gym");
  const isBeauty = kind.includes("beauty") || kind.includes("barber") || kind.includes("salon");
  const isConstruction = kind.includes("construction") || kind.includes("builder");

  const layoutClass = isFood
    ? "layoutRestaurant"
    : isAuto
    ? "layoutAutomotive"
    : isFitness
    ? "layoutFitness"
    : isBeauty
    ? "layoutBeauty"
    : isConstruction
    ? "layoutConstruction"
    : "layoutProfessional";

  const heroStyle = site.heroImage
    ? { background: `linear-gradient(#0008,#0008),url(${site.heroImage}) center/cover` }
    : { background: site.primaryColor || "#183d2a" };

  const serviceIntro = isFood
    ? "From the kitchen"
    : isAuto
    ? "Our workshop"
    : isFitness
    ? "Training options"
    : isBeauty
    ? "Services & grooming"
    : isConstruction
    ? "What we build"
    : "What we offer";

  const aboutTitle = isFood
    ? "Our story"
    : isAuto
    ? "About the workshop"
    : isFitness
    ? "About the studio"
    : isBeauty
    ? "About us"
    : isConstruction
    ? "About the team"
    : "About";

  const cta = isFood
    ? "Ready for your next meal?"
    : isAuto
    ? "Need your vehicle checked?"
    : isFitness
    ? "Ready to get started?"
    : isBeauty
    ? "Ready for a fresh look?"
    : isConstruction
    ? "Planning a project?"
    : "Ready to get started?";

  // --- Lead Handlers ---
  const saveLead = async (lead: Record<string, any>) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, slug }),
      });
      if (response.ok) return true;
    } catch {}

    try {
      const current = JSON.parse(localStorage.getItem("ll_leads") || "[]");
      localStorage.setItem(
        "ll_leads",
        JSON.stringify([{ ...lead, id: Date.now(), business: site.name, slug }, ...current])
      );
      return true;
    } catch {
      return false;
    }
  };

  const handleEnquirySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ok = await saveLead({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      createdAt: new Date().toISOString(),
    });
    if (ok) setSent(true);
  };

  return (
    <main
      className={`generatedSite ${layoutClass}`}
      style={
        {
          background: "#fff",
          minHeight: "100vh",
          fontFamily: site.font || "Inter",
          "--site-accent": site.primaryColor || "#183d2a",
        } as React.CSSProperties
      }
    >
      {/* Hero Header */}
      <div className="previewHero" style={heroStyle}>
        <div style={{ maxWidth: 1000, margin: "auto" }}>
          {site.logo && (
            <img
              src={site.logo}
              alt={`${site.name || "Business"} logo`}
              style={{ maxWidth: 110, maxHeight: 60, objectFit: "contain", marginBottom: 20 }}
            />
          )}
          <small>
            {String(site.name || "LOCAL BUSINESS").toUpperCase()} · {category}
          </small>
          <h1>{site.headline || site.tag || site.description?.split(".")[0] || "Welcome to our business."}</h1>
          <p>{site.location}</p>
          <div className="actions">
            {site.whatsapp && (
              <a
                className="pill"
                href={`https://wa.me/${String(site.whatsapp).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {site.phone && (
              <a className="pill" href={`tel:${site.phone}`}>
                Call us
              </a>
            )}
            {site.location && (
              <a
                className="pill"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location)}`}
                target="_blank"
                rel="noreferrer"
              >
                Get directions
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="section">
        {/* Services */}
        <div className="sectionHead">
          <span className="eyebrow">{serviceIntro}</span>
          <h2>
            {isFood
              ? "Made for good meals."
              : isAuto
              ? "Practical service, clearly explained."
              : isFitness
              ? "Built around your goals."
              : isBeauty
              ? "Look sharp. Feel confident."
              : isConstruction
              ? "Solid work from start to finish."
              : "Quality service, made simple."}
          </h2>
        </div>

        <div className="grid">
          {parsedServices.map((s, i) => (
            <div className="card" key={`${s.name}-${i}`}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{s.name}</h3>
              {s.price && (
                <strong style={{ color: site.primaryColor || "#183d2a", fontSize: 18 }}>
                  {s.price}
                </strong>
              )}
              <p className="muted">Professional service with clear communication.</p>
            </div>
          ))}
        </div>

        {/* About Section */}
        {site.showAbout !== false && (
          <div className="card" style={{ marginTop: 40 }}>
            <span className="eyebrow">{aboutTitle}</span>
            <h3>{site.name}</h3>
            <p className="muted">
              {site.description || "A local business focused on quality service and a great customer experience."}
            </p>
          </div>
        )}

        {/* Customer Reviews */}
        {site.showReviews !== false && (
          <div style={{ marginTop: 48 }}>
            <div className="sectionHead">
              <span className="eyebrow">Customer feedback</span>
              <h2>What customers say</h2>
              <p className="muted">Example testimonials shown until real reviews are connected.</p>
            </div>
            <div className="grid3">
              {displayedReviews.map((review, i) => (
                <div className="card" key={`${review.name}-${i}`}>
                  <div aria-label={`${review.rating} out of 5 stars`} style={{ letterSpacing: 2 }}>
                    ★★★★★
                  </div>
                  <p className="muted">“{review.text}”</p>
                  <b>{review.name}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact / Hours Grid */}
        <div className="grid3" style={{ marginTop: 40 }}>
          {site.showHours !== false && (
            <div className="card">
              <h3>Hours</h3>
              <p className="muted">{site.hours || "Contact us for opening hours."}</p>
            </div>
          )}
          {site.showContact !== false && (
            <div className="card">
              <h3>Contact</h3>
              <p className="muted">{site.phone || site.email || site.location || "Get in touch with us."}</p>
              {site.email && <a href={`mailto:${site.email}`}>Email us</a>}
            </div>
          )}
          {site.social && (
            <div className="card">
              <h3>Social</h3>
              <p className="muted">{site.social}</p>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        {site.showGallery !== false && gallery.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <span className="eyebrow">Gallery</span>
            <h2>{isAuto || isConstruction ? "Recent work" : isFood ? "From our kitchen" : "Our work"}</h2>
            <div className="grid3" style={{ marginTop: 18 }}>
              {gallery.map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt={`${site.name || "Business"} gallery image ${i + 1}`}
                  style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div
          className="card"
          style={{
            marginTop: 48,
            background: site.primaryColor || "#183d2a",
            color: "#fff",
            padding: 36,
          }}
        >
          <span style={{ opacity: 0.75 }}>LET'S WORK TOGETHER</span>
          <h2 style={{ color: "#fff", margin: "8px 0 10px" }}>{cta}</h2>
          <p style={{ opacity: 0.85 }}>Contact {site.name || "us"} today and let's get things moving.</p>
          <div className="actions">
            {site.whatsapp && (
              <a
                className="pill"
                href={`https://wa.me/${String(site.whatsapp).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Message on WhatsApp
              </a>
            )}
            {site.phone && (
              <a className="pill" href={`tel:${site.phone}`}>
                Call {site.name || "us"}
              </a>
            )}
            {site.email && (
              <a className="pill" href={`mailto:${site.email}`}>
                Email us
              </a>
            )}
          </div>
        </div>

        {/* Lead Enquiry Form */}
        {site.showForm !== false && (
          <div className="card" style={{ marginTop: 28 }}>
            <span className="eyebrow">Contact</span>
            <h2>Send an enquiry</h2>
            {sent ? (
              <p>
                <b>Thanks — your enquiry was received.</b> The business dashboard can display this lead when database
                storage is connected.
              </p>
            ) : (
              <form onSubmit={handleEnquirySubmit}>
                <div className="grid3">
                  <input name="name" required placeholder="Your name" />
                  <input name="email" required type="email" placeholder="Email address" />
                  <input name="phone" placeholder="Phone number" />
                </div>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help?"
                  style={{ width: "100%", marginTop: 12 }}
                />
                <button className="button" type="submit" style={{ marginTop: 12 }}>
                  Send enquiry
                </button>
              </form>
            )}
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Enquiries are saved to the business database when it is connected.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>
          <b>{site.name}</b> · {site.location || "Local business"}
        </span>
        <span>{site.phone || site.email || "Get in touch"} · Built with LocalLaunch</span>
      </footer>
    </main>
  );
}
