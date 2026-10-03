"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

type BusinessValues = {
  name: string;
  category: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  description: string;
  services: string;
};

const initialValues: BusinessValues = {
  name: "",
  category: "General",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  description: "",
  services: "",
};

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState(initialValues);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const slug = values.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "business";

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, slug }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "We couldn’t save your business. Please try again.");
        return;
      }

      const saved = {
        ...values,
        dbId: data.business?.id,
        slug: data.business?.websites?.[0]?.slug || slug,
      };
      localStorage.setItem("ll_business", JSON.stringify(saved));
      router.push(`/editor?slug=${encodeURIComponent(saved.slug)}`);
    } catch {
      setError("We couldn’t reach LocalLaunch. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage authSplit">
      <section className="authVisual">
        <Brand />
        <div className="authVisualCopy">
          <span className="eyebrow">Your starting point</span>
          <h1>Let’s build a website that feels like your business.</h1>
          <p>Share a few details to create your first draft. You can keep editing before you publish.</p>
          <div className="authMiniGrid">
            <div><strong>01</strong><span>Add your details</span></div>
            <div><strong>02</strong><span>Shape your website</span></div>
            <div><strong>03</strong><span>Publish when ready</span></div>
          </div>
        </div>
        <div className="authVisualFooter">LocalLaunch · Professional websites for local businesses</div>
      </section>

      <section className="authFormWrap">
        <div className="authCard">
          <div className="authMobileBrand"><Brand /></div>
          <span className="eyebrow">Business profile</span>
          <h2>Tell us about your business</h2>
          <p className="muted">We’ll use these details to create your first website draft.</p>

          <form onSubmit={handleSubmit} className="authForm" aria-busy={loading}>
            <div className="field">
              <label htmlFor="business-name">Business name</label>
              <input id="business-name" name="name" value={values.name} onChange={handleChange} placeholder="e.g. Acme Services" required />
            </div>

            <div className="field">
              <label htmlFor="business-category">Business category</label>
              <select id="business-category" name="category" value={values.category} onChange={handleChange}>
                <option value="General">General / Professional</option>
                <option value="Restaurant">Restaurant / Food / Cafe</option>
                <option value="Automotive">Automotive / Mechanic</option>
                <option value="Fitness">Fitness / Gym / Studio</option>
                <option value="Beauty">Beauty / Salon / Barber</option>
                <option value="Construction">Construction / Trades</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <div className="field">
                <label htmlFor="business-phone">Phone number</label>
                <input id="business-phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={handleChange} placeholder="+27 12 345 6789" />
              </div>
              <div className="field">
                <label htmlFor="business-whatsapp">WhatsApp number</label>
                <input id="business-whatsapp" name="whatsapp" type="tel" value={values.whatsapp} onChange={handleChange} placeholder="+27 12 345 6789" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="business-email">Business email</label>
              <input id="business-email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} placeholder="info@business.com" />
            </div>

            <div className="field">
              <label htmlFor="business-location">Location</label>
              <input id="business-location" name="location" autoComplete="street-address" value={values.location} onChange={handleChange} placeholder="City or address" />
            </div>

            <div className="field">
              <label htmlFor="business-description">What does your business do?</label>
              <textarea id="business-description" name="description" rows={3} value={values.description} onChange={handleChange} placeholder="Describe your business and what makes it special." />
            </div>

            <div className="field">
              <label htmlFor="business-services">Services or products</label>
              <textarea id="business-services" name="services" rows={3} value={values.services} onChange={handleChange} placeholder={"One per line, with an optional price.\nFor example: Plumbing repair | R500"} />
              <span className="muted" style={{ fontSize: 12 }}>Add one service per line. You can change these later.</span>
            </div>

            {error && <div className="authError" role="alert">{error}</div>}
            <button className="button authSubmit" type="submit" disabled={loading}>
              {loading ? "Saving your business…" : "Continue to editor →"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
