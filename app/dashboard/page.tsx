"use client";
import {useEffect,useState} from "react";
import AppShell from "@/components/AppShell";
import {examples} from "@/lib/demo";
export default function Dashboard(){
 const [business,setBusiness]=useState<any>(null);
 useEffect(()=>{try{const p=JSON.parse(localStorage.getItem("ll_published")||"null");const b=JSON.parse(localStorage.getItem("ll_business")||"null");setBusiness(p||b)}catch{}},[]);
 const display=business||{name:"No website yet",category:"Create your first website",location:""};
 const slug=business?.slug||"";
 return <AppShell><div className="dashHead"><div><h1>Good morning 👋</h1><p className="muted">{business?"Here's what's happening with "+display.name+".":"Create a website and start building your online presence."}</p></div><a className="button" href="/onboarding">Create Website</a></div>
 <div className="stats">{[["Visitors","0"],["Leads","0"],["Messages","0"],["Bookings","0"],["Reviews","—"]].map(x=><div className="stat" key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div>
 <div className="table"><div className="row"><div><b>{display.name}</b><div className="muted">{business?(business.slug?"Published website":"Draft website"):"No website created yet"}</div></div>{business?<span className="badge">{business.slug?"Published":"Draft"}</span>:<a className="button small" href="/onboarding">Create</a>}</div></div>
 {business&&<div className="grid3" style={{marginTop:25}}><a className="card" href="/editor"><b>Edit website</b><p className="muted">Update your business content and design.</p></a>{slug&&<a className="card" href={"/sites/"+slug} target="_blank"><b>Open website</b><p className="muted">View your published site.</p></a>}<div className="card"><b>{display.category||"Business"}</b><p className="muted">{display.location||"Location not set"}</p></div></div>}
 <h2 style={{marginTop:45}}>Example websites</h2><div className="grid3">{examples.map(e=><a className="card" href={"/sites/"+e.slug} key={e.slug}><b>{e.name}</b><p className="muted">{e.type} · {e.location}</p><span className="badge">Preview</span></a>)}</div></AppShell>
}