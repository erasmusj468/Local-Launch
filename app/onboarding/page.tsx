"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

const steps = [
  "Business name",
  "Category",
  "Location",
  "Description",
  "Services / products",
  "Phone",
  "WhatsApp",
  "Email",
  "Business hours",
  "Social links",
  "Logo / photos",
  "Style",
];

const styles = ["Modern", "Luxury", "Minimal", "Bold", "Professional", "Friendly"];
const categories = [
  "Restaurant",
  "Automotive",
  "Barber",
  "Fitness",
  "Construction",
  "Professional services",
];
const keys = [
  "name",
  "category",
  "location",
  "description",
  "services",
  "phone",
  "whatsapp",
  "email",
  "hours",
  "social",
  "media",
  "style",
];

const categoryDefaults: Record<string, any> = {
  Restaurant: {
    primaryColor: "#174b63",
    headline: "Fresh food, made for good moments.",
    font: "Georgia",
    template: "restaurant",
  },
  Automotive: {
    primaryColor: "#183d2a",
    headline: "Reliable automotive care without the runaround.",
    font: "Inter",
    template: "automotive",
  },
  Barber: {
    primaryColor: "#5b3a29",
    headline: "Sharp cuts. Clean finish. Proper service.",
    font: "Georgia",
    template: "beauty",
  },
  Fitness: {
    primaryColor: "#4b356f",
    headline: "Train stronger. Live better.",
    font: "Inter",
    template: "fitness",
  },
  Construction: {
    primaryColor: "#1d3557",
    headline: "Built properly. Built to last.",
    font: "Inter",
    template: "construction",
  },
  "Professional services": {
    primaryColor: "#183d2a",
    headline: "Professional service you can trust.",
    font: "Inter",
    template: "professional",
  },
};

export default function Onboarding() {
  const r = useRouter();
  const [i, setI] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const key = keys[i];
  const value = values[key] || "";
  const setValue = (nextVal: string) => setValues((v) => ({ ...v, [key]: nextVal }));

  // Fixed: Added `async` to the next function below
  const next = async () => {
    if (!value.trim()) {
      setError("Please enter this information before continuing.");
      return;
    }
    setError("");

    if (i === steps.length - 1) {
      const preset =
        categoryDefaults[values.category] || categoryDefaults["Professional services"];
      const business = {
        ...values,
        ...preset,
        slug:
          String(values.name || "business")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "business",
      };

      setLoading(true);

      try {
        const response = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...business,
            services: String(business.services || "")
              .split(/[,\\n]/)
              .map((x: string) => x.trim())
              .filter(Boolean),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const saved = {
            ...business,
            dbId: data.business.id,
            slug: data.business.websites?.[0]?.slug || business.slug,
          };
          localStorage.setItem("ll_business", JSON.stringify(saved));
          setTimeout(() => r.push("/editor"), 900);
          return;
        }
      } catch {}

      localStorage.setItem("ll_business", JSON.stringify(business));
      setTimeout(() => r.push("/editor"), 900);
    } else {
      setI(i + 1);
    }
  };

  if (loading) {
    return (
      <div className="authPage">
        <div className="auth">
          <Brand />
          <h1>Generating your website...</h1>
          <p className="muted">
            Choosing a layout for your {values.category || "local"} business and preparing your
            sections.
          </p>
          <div className="progress">
            <span style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="onboardCard" style={{ width: "min(760px,100%)" }}>
        <Brand />
        <p className="muted">
          Step {i + 1} of {steps.length}
        </p>
        <div className="progress">
          <span style={{ width: ((i + 1) / steps.length) * 100 + "%" }} />
        </div>
        <h1>{steps[i]}</h1>
        {error && (
          <p className="warn" role="alert">
            {error}
          </p>
        )}

        {i === 1 ? (
          <div className="choiceGrid">
            {categories.map((x) => (
              <button
                type="button"
                className={"choice " + (value === x ? "selected" : "")}
                onClick={() => setValue(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        ) : i === 11 ? (
          <div className="choiceGrid">
            {styles.map((x) => (
              <button
                type="button"
                className={"choice " + (value === x ? "selected" : "")}
                onClick={() => setValue(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        ) : (
          <div className="field">
            <label>{steps[i]}</label>
            <textarea
              rows={i === 3 ? 5 : 3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                i === 10
                  ? "Paste image URLs or describe your photos..."
                  : "Enter details..."
              }
            />
          </div>
        )}

        <div className="actions">
          <button
            className="button secondary"
            disabled={!i}
            onClick={() => setI(Math.max(0, i - 1))}
          >
            Back
          </button>
          <button className="button" onClick={next}>
            {i === steps.length - 1 ? "Generate Website" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
