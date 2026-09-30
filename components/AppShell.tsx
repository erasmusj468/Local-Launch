"use client";
import {useEffect,useState} from "react";
import Brand from "./Brand";
export default function AppShell({children}:{children:React.ReactNode}){
 const [logged,setLogged]=useState<boolean|null>(null);
 useEffect(()=>setLogged(!!localStorage.getItem("ll_auth")),[]);
 if(logged===null)return <div className="authPage"><p className="muted">Loading LocalLaunch...</p></div>;
 if(!logged)return <div className="authPage"><div className="auth"><Brand/><h1>Sign in required</h1><p className="muted">Log in to access your LocalLaunch dashboard.</p><a className="button" href="/login">Log in</a><a className="button secondary" href="/signup">Create account</a></div></div>;
 return <div className="app"><header className="appbar"><Brand/><div><a className="button small" href="/onboarding">+ Create Website</a> <button className="button small secondary" onClick={()=>{localStorage.removeItem("ll_auth");location.href="/login"}}>Log out</button></div></header><div className="appLayout"><aside className="sidebar"><a className="sideLink active" href="/dashboard">Dashboard</a><a className="sideLink" href="/scanner">Business Scanner</a><a className="sideLink" href="/editor">Editor</a><a className="sideLink" href="/dashboard#billing">Billing</a></aside><main className="main">{children}</main></div></div>;
}