"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

type Business={name?:string;category?:string;location?:string;description?:string;services?:string;phone?:string;whatsapp?:string;email?:string;hours?:string;social?:string;style?:string};

export default function Editor(){
 const r=useRouter();
 const [tab,setTab]=useState("Text");
 const [business,setBusiness]=useState<Business>({});
 const [name,setName]=useState("Northside Auto Works");
 const [headline,setHeadline]=useState("Honest repairs. Done right.");
 const [saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem("ll_business");if(raw){const b=JSON.parse(raw);setBusiness(b);setName(b.name||"Local Business");setHeadline(b.description?.split(".")[0]||"Professional service. Done right.");}}catch{}},[]);
 const save=()=>{localStorage.setItem("ll_business",JSON.stringify({...business,name,description:headline}));setSaved(true);setTimeout(()=>setSaved(false),1500)};
 const preview=()=>{window.open("/sites/northside-auto-works","_blank")};
 return <div className="app"><header className="appbar"><a href="/dashboard">← Dashboard</a><b>Website Editor</b><div><button className="button secondary" onClick={preview}>Preview</button> <button className="button" onClick={save}>{saved?"Saved ✓":"Save changes"}</button></div></header>
 <div className="editor"><aside className="editorSide">{["Pages","Sections","Design","Text","Images","Services","Contact","SEO","Settings"].map(x=><button className={"sideLink "+(tab===x?"active":"")} onClick={()=>setTab(x)} key={x}>{x}</button>)}</aside>
 <section className="previewArea"><div className="previewFrame"><div className="previewHero"><small>{name.toUpperCase()}</small><h1>{headline}</h1><p>{business.location||"Professional local service for your community."}</p><span className="pill">Contact us</span></div><div className="previewContent"><h2>{tab==="Services"?"Your services":"Our services"}</h2><div className="siteGrid">{(business.services||"Diagnostics, Brake service, Engine repairs, Oil & filter service").split(",").map(x=><div className="serviceBox" key={x}><b>{x.trim()}</b><p className="muted">Professional service with clear communication.</p></div>)}</div></div></div></section>
 <aside className="inspector"><b>{tab}</b><p className="muted">Edit your selected website content.</p>{tab==="Text"||tab==="Pages"?<><div className="field"><label>Business name</label><input value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label>Hero headline</label><textarea value={headline} onChange={e=>setHeadline(e.target.value)}/></div></>:tab==="Contact"?<><div className="field"><label>Phone</label><input value={business.phone||""} onChange={e=>setBusiness({...business,phone:e.target.value})}/></div><div className="field"><label>WhatsApp</label><input value={business.whatsapp||""} onChange={e=>setBusiness({...business,whatsapp:e.target.value})}/></div><div className="field"><label>Email</label><input value={business.email||""} onChange={e=>setBusiness({...business,email:e.target.value})}/></div></>:tab==="Services"?<div className="field"><label>Services</label><textarea value={business.services||""} onChange={e=>setBusiness({...business,services:e.target.value})}/></div>:<p className="muted">This section is ready for customization. Use Save changes when you finish editing.</p>}<button className="button secondary" onClick={save}>Save changes</button></aside></div></div>
}