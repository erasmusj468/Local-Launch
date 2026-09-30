"use client";
import {useEffect,useState} from "react";
import {examples} from "@/lib/demo";
export default function Site({params}:{params:{slug:string}}){
 const [site,setSite]=useState<any>(null);
 useEffect(()=>{const demo=examples.find(x=>x.slug===params.slug);let published=null;try{published=JSON.parse(localStorage.getItem("ll_published")||"null")}catch{}setSite(published?.slug===params.slug?published:demo||null)},[params.slug]);
 if(!site)return <main className="authPage"><p className="muted">Loading website...</p></main>;
 const services=Array.isArray(site.services)?site.services:(site.services||"").split(",").map((x:string)=>x.trim()).filter(Boolean);
 return <main style={{background:"#fff",minHeight:"100vh"}}><div className="previewHero"><div style={{maxWidth:1000,margin:"auto"}}><small>{site.name.toUpperCase()} · {site.category||site.type||"Local business"}</small><h1>{site.headline||site.tag||"Welcome to our business."}</h1><p>{site.location}</p><span className="pill">Contact us</span></div></div><section className="section"><div className="sectionHead"><span className="eyebrow">Services</span><h2>What we offer</h2></div><div className="grid">{services.map((s:string)=><div className="card" key={s}><h3>{s}</h3><p className="muted">Professional service with clear communication.</p></div>)}</div><div className="grid3" style={{marginTop:40}}><div className="card"><h3>About</h3><p className="muted">{site.description||"A local business focused on quality service and a great customer experience."}</p></div><div className="card"><h3>Hours</h3><p className="muted">{site.hours||"Mon–Fri 08:00–17:00"}</p></div><div className="card"><h3>Find us</h3><p className="muted">{site.location||"Your local area"}</p></div></div></section></main>;
}