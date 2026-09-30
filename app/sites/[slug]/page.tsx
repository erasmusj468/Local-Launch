"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {examples} from "@/lib/demo";
export default function Site(){
 const params=useParams<{slug:string}>();const slug=params.slug;const [site,setSite]=useState<any>(null);
 useEffect(()=>{let published=null;try{published=JSON.parse(localStorage.getItem("ll_published")||"null")}catch{}const demo=examples.find(x=>x.slug===slug);setSite(published?.slug===slug?published:demo||null)},[slug]);
 if(!site)return <main className="authPage"><p className="muted">Loading website...</p></main>;
 const services=Array.isArray(site.services)?site.services:String(site.services||"").split(",").map((x:string)=>x.trim()).filter(Boolean);
 const gallery=String(site.media||"").split(/[,\n]/).map((x:string)=>x.trim()).filter(Boolean);
 const category=String(site.category||site.type||"Local business");
 const kind=category.toLowerCase();
 const isFood=kind.includes("restaurant")||kind.includes("food")||kind.includes("cafe");
 const isAuto=kind.includes("auto")||kind.includes("mechanic");
 const isFitness=kind.includes("fitness")||kind.includes("gym");
 const isBeauty=kind.includes("beauty")||kind.includes("barber")||kind.includes("salon");
 const isConstruction=kind.includes("construction")||kind.includes("builder");
 const hero=site.heroImage?{background:"linear-gradient(#0008,#0008),url("+site.heroImage+") center/cover"}:{background:site.primaryColor||"#183d2a"};
 const serviceIntro=isFood?"From the kitchen":isAuto?"Our workshop":isFitness?"Training options":isBeauty?"Services & grooming":isConstruction?"What we build":"What we offer";
 const aboutTitle=isFood?"Our story":isAuto?"About the workshop":isFitness?"About the studio":isBeauty?"About us":isConstruction?"About the team":"About";
 return <main className={"generatedSite "+(isFood?"layoutRestaurant ":isAuto?"layoutAutomotive ":isFitness?"layoutFitness ":isBeauty?"layoutBeauty ":isConstruction?"layoutConstruction ":"layoutProfessional")} style={{background:"#fff",minHeight:"100vh",fontFamily:site.font||"Inter",["--site-accent" as any]:site.primaryColor||"#183d2a"}}>
 <div className="previewHero" style={hero}><div style={{maxWidth:1000,margin:"auto"}}>{site.logo&&<img src={site.logo} alt={site.name+" logo"} style={{maxWidth:110,maxHeight:60,objectFit:"contain",marginBottom:20}}/>}<small>{String(site.name||"LOCAL BUSINESS").toUpperCase()} · {category}</small><h1>{site.headline||site.tag||site.description?.split(".")[0]||"Welcome to our business."}</h1><p>{site.location}</p><div className="actions">{site.whatsapp&&<a className="pill" href={"https://wa.me/"+String(site.whatsapp).replace(/\D/g,"")}>WhatsApp</a>}{site.phone&&<a className="pill" href={"tel:"+site.phone}>Call us</a>}{site.location&&<a className="pill" href={"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(site.location)} target="_blank" rel="noreferrer">Get directions</a>}</div></div></div>
 <section className="section"><div className="sectionHead"><span className="eyebrow">{serviceIntro}</span><h2>{isFood?"Made for good meals.":isAuto?"Practical service, clearly explained.":isFitness?"Built around your goals.":isBeauty?"Look sharp. Feel confident.":isConstruction?"Solid work from start to finish.":"Quality service, made simple."}</h2></div><div className="grid">{services.map((s:string,i:number)=><div className="card" key={s}><span className="eyebrow">0{i+1}</span><h3>{s}</h3><p className="muted">{isFood?"Freshly prepared and served with care.":isAuto?"Clear diagnosis and professional workmanship.":isFitness?"Focused coaching and practical progress.":isBeauty?"A clean, professional finish every time.":isConstruction?"Careful planning and dependable workmanship.":"Professional service with clear communication."}</p></div>)}</div>
 {site.showAbout!==false&&<div className="card" style={{marginTop:40}}><span className="eyebrow">{aboutTitle}</span><h3>{site.name}</h3><p className="muted">{site.description||"A local business focused on quality service and a great customer experience."}</p></div>}
 <div className="grid3" style={{marginTop:40}}>{site.showHours!==false&&<div className="card"><h3>Hours</h3><p className="muted">{site.hours||"Contact us for opening hours."}</p></div>}{site.showContact!==false&&<div className="card"><h3>Contact</h3><p className="muted">{site.phone||site.email||site.location||"Get in touch with us."}</p>{site.email&&<a href={"mailto:"+site.email}>Email us</a>}</div>}{site.social&&<div className="card"><h3>Social</h3><p className="muted">{site.social}</p></div>}</div>
 {site.showGallery!==false&&gallery.length>0&&<div style={{marginTop:40}}><span className="eyebrow">Gallery</span><h2>{isAuto||isConstruction?"Recent work":isFood?"From our kitchen":"Our work"}</h2><div className="grid3" style={{marginTop:18}}>{gallery.map((url:string,i:number)=><img key={url+i} src={url} alt={String(site.name||"Business")+" gallery image "+(i+1)} style={{width:"100%",height:220,objectFit:"cover",borderRadius:14}}/>)}</div></div>}</section>
 <footer className="footer"><span><b>{site.name}</b> · {site.location||"Local business"}</span><span>{site.phone||site.email||"Get in touch"} · Built with LocalLaunch</span></footer></main>;
}