"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authPage authSplit">
      <section className="authVisual">
        <Brand />
        <div className="authVisualCopy">
          <span className="eyebrow">A better first impression</span>
          <h1>Get your business online, beautifully.</h1>
          <p>Create a professional website for your business, then make it your own as you grow.</p>
          <div className="authMiniGrid">
            <div><strong>01</strong><span>Start with a plan</span></div>
            <div><strong>02</strong><span>Make it yours</span></div>
            <div><strong>03</strong><span>Publish with confidence</span></div>
          </div>
        </div>
        <div className="authVisualFooter">LocalLaunch · Professional websites for local businesses</div>
      </section>

      <section className="authFormWrap">
        <div className="authCard">
          <div className="authMobileBrand"><Brand /></div>
          <span className="eyebrow">Get started for free</span>
          <h2>Create your account</h2>
          <p className="muted">Set up your workspace and start building your business website.</p>

          <form onSubmit={handleSubmit} className="authForm">
            <div className="field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@business.com"
                required
              />
            </div>
            <div className="field">
              <div className="passwordLabel"><label htmlFor="signup-password">Password</label><span className="muted">At least 8 characters</span></div>
              <div className="passwordField">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && <div className="authError" role="alert">{error}</div>}
            <button className="button authSubmit" type="submit" disabled={busy}>
              {busy ? "Creating account…" : "Create free account →"}
            </button>
          </form>

          <div className="authDivider"><span>Already have an account?</span></div>
          <a className="button secondary authSubmit" href="/login">Sign in</a>
          <p className="authLegal">Your account is subject to the LocalLaunch terms and privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
