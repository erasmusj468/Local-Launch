"use client";

import { FormEvent, useState } from "react";
import Brand from "@/components/Brand";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage authSplit">
      <section className="authVisual">
        <Brand />
        <div className="authVisualCopy">
          <span className="eyebrow">Your business, online</span>
          <h1>Everything your local business needs to look professional online.</h1>
          <p>Build, edit and publish a polished website without needing to code.</p>
          <div className="authMiniGrid">
            <div><strong>01</strong><span>Build faster</span></div>
            <div><strong>02</strong><span>Look professional</span></div>
            <div><strong>03</strong><span>Get discovered</span></div>
          </div>
        </div>
        <div className="authVisualFooter">LocalLaunch · Professional websites for local businesses</div>
      </section>

      <section className="authFormWrap">
        <div className="authCard">
          <div className="authMobileBrand"><Brand /></div>
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to LocalLaunch</h2>
          <p className="muted">Continue building your business website.</p>

          <form onSubmit={handleSubmit} className="authForm">
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@business.com" required />
            </div>
            <div className="field">
              <div className="passwordLabel"><label htmlFor="password">Password</label><a href="/reset-password">Forgot password?</a></div>
              <div className="passwordField">
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </div>
            {error && <div className="authError" role="alert">{error}</div>}
            <button className="button authSubmit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in →"}</button>
          </form>

          <div className="authDivider"><span>New to LocalLaunch?</span></div>
          <a className="button secondary authSubmit" href="/signup">Create a free account</a>
          <p className="authLegal">By continuing, the account remains subject to the LocalLaunch terms and privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
