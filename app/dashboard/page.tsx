"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";

type Website = { id: string; name: string; slug: string; status: string; template?: string };
type Business = { id: string; name: string; category: string; websites: Website[]; leads?: { id: string; name: string; message?: string | null; createdAt: string }[] };

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/businesses", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Businesses request failed"); return r.json(); }),
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.ok ? r.json() : { user: null }),
    ]).then(([businessData, userData]) => {
      if (!active) return;
      setBusinesses(businessData.businesses || []);
      setEmail(userData.user?.email || "");
      setRole(userData.user?.role || "customer");
    }).catch(() => { if (active) setLoadError("We couldn’t load your workspace. Check your connection and try again."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const websites = useMemo(() => businesses.flatMap((business) => business.websites.map((website) => ({ ...website, businessName: business.name, category: business.category }))), [businesses]);
  const leads = useMemo(() => businesses.flatMap((business) => (business.leads || []).map((lead) => ({ ...lead, businessName: business.name }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [businesses]);
  const published = websites.filter((website) => website.status === "published").length;

  return <AppShell>
    <div className="dashHead">
      <div><span className="eyebrow">Workspace</span><h1>Good to have you back.</h1><p className="muted">Manage websites, leads and your local business presence from one place.</p></div>
      <a className="button" href="/onboarding">+ Create website</a>
    </div>

    <section className="statGrid">
      <div className="statCard"><span>Websites</span><strong>{loading ? "—" : websites.length}</strong></div>
      <div className="statCard"><span>Published</span><strong>{loading ? "—" : published}</strong></div>
      <div className="statCard"><span>Leads</span><strong>{loading ? "—" : leads.length}</strong></div>
      <div className="statCard"><span>Plan</span><strong style={{fontSize:22}}>Free</strong></div>
    </section>

    <section style={{marginTop:28}}>
      <div className="dashHead"><div><h2 style={{fontSize:26}}>Your websites</h2><p className="muted">Edit, preview and publish every site from this workspace.</p></div></div>
      {loadError ? <div className="card emptyState" role="alert"><h3>Workspace unavailable</h3><p className="muted">{loadError}</p><button className="button secondary" onClick={() => window.location.reload()}>Try again</button></div> : websites.length ? <div className="siteList">{websites.map((website) => <div className="siteRow" key={website.id}>
        <div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><strong>{website.name}</strong><span className="status">{website.status}</span></div><p className="muted" style={{margin:"5px 0 0",fontSize:13}}>{website.category} · /sites/{website.slug}</p></div>
        <div className="siteRowActions"><a className="button secondary small" href={`/sites/${website.slug}`}>Open</a><a className="button small" href={`/editor?slug=${encodeURIComponent(website.slug)}`}>Edit</a></div>
      </div>)}</div> : <div className="card emptyState"><div className="emptyIcon">✦</div><h3>{loading ? "Loading your workspace…" : "No website yet"}</h3><p className="muted">Create a business profile and LocalLaunch will generate the first version of the site for editing.</p>{!loading && <a className="button" href="/onboarding">Build first website</a>}</div>}
    </section>

    <section style={{marginTop:42}}><div className="dashHead"><div><h2 style={{fontSize:26}}>Recent enquiries</h2><p className="muted">Leads submitted through published websites.</p></div></div>{leads.length ? <div className="siteList">{leads.slice(0,5).map((lead)=><div className="siteRow" key={lead.id}><div><strong>{lead.name}</strong><p className="muted" style={{margin:"5px 0 0",fontSize:13}}>{lead.businessName} · {lead.message || "New enquiry"}</p></div><span className="muted" style={{fontSize:12}}>{new Date(lead.createdAt).toLocaleDateString()}</span></div>)}</div> : <div className="card"><strong>No enquiries yet.</strong><p className="muted">When a customer sends an enquiry, it will appear here.</p></div>}</section>

    <div className="card" style={{marginTop:28,display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap"}}><div><strong>{email || "Account"}</strong><p className="muted" style={{margin:4}}>{role === "owner" ? "Owner workspace" : "Customer workspace"}</p></div><a className="button secondary small" href="/billing">Manage plan</a></div>
  </AppShell>;
}
