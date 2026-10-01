"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: "",
    category: "General",
    phone: "",
    whatsapp: "",
    email: "",
    location: "",
    description: "",
    services: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug =
      String(values.name || "business")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "business";

    const business = { ...values, slug };

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...business,
          services: String(values.services || ""),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const saved = {
          ...business,
          dbId: data.business?.id,
          slug: data.business?.websites?.[0]?.slug || business.slug,
        };
        localStorage.setItem("ll_business", JSON.stringify(saved));
      } else {
        localStorage.setItem("ll_business", JSON.stringify(business));
      }
    } catch {
      localStorage.setItem("ll_business", JSON.stringify(business));
    } finally {
      setLoading(false);
      setTimeout(() => router.push("/editor"), 300);
    }
  };

  return (
    <main className="authPage" style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>Set up your business</h1>
      <p className="muted">Enter your business details to generate your website.</p>

      <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        <div>
          <label>Business Name</label>
          <input
            name="name"
            required
            value={values.name}
            onChange={handleChange}
            placeholder="e.g. Acme Services"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Category</label>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          >
            <option value="General">General / Professional</option>
            <option value="Restaurant">Restaurant / Food / Cafe</option>
            <option value="Automotive">Automotive / Mechanic</option>
            <option value="Fitness">Fitness / Gym / Studio</option>
            <option value="Beauty">Beauty / Salon / Barber</option>
            <option value="Construction">Construction / Trades</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Phone Number</label>
            <input
              name="phone"
              value={values.phone}
              onChange={handleChange}
              placeholder="+27 12 345 6789"
              style={{ width: "100%", padding: 10, marginTop: 4 }}
            />
          </div>
          <div>
            <label>WhatsApp Number</label>
            <input
              name="whatsapp"
              value={values.whatsapp}
              onChange={handleChange}
              placeholder="+27 12 345 6789"
              style={{ width: "100%", padding: 10, marginTop: 4 }}
            />
          </div>
        </div>

        <div>
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="info@business.com"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Location / Address</label>
          <input
            name="location"
            value={values.location}
            onChange={handleChange}
            placeholder="City or Full Address"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            rows={3}
            value={values.description}
            onChange={handleChange}
            placeholder="Briefly describe what your business does..."
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Services offered (comma or newline separated)</label>
          <textarea
            name="services"
            rows={3}
            value={values.services}
            onChange={handleChange}
            placeholder="Service 1 | R500, Service 2 | R1000"
            style={{ width: "100%", padding: 10, marginTop: 4 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#183d2a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: 12,
          }}
        >
          {loading ? "Saving..." : "Continue to Editor →"}
        </button>
      </form>
    </main>
  );
}
