import { useState } from "react";
import { api, setAccessToken, setUser, getUser, bootstrapAuth } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault(); setMsg("");
    try{
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.accessToken); setUser(data.user);
      const role = data.user.role;
      nav(role === "admin" ? "/admin" : "/dashboard");
    }catch(err){ setMsg(err?.response?.data?.error || "Login failed"); }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Hyrja</h1>
      <p className="text-sm text-slate-600">Hyni me kredencialet tuaja. Pas loginit, <span className="font-medium">studenti</span> shikon & komenton; <span className="font-medium">admini</span> menaxhon kurse/evente.</p>
      <form onSubmit={submit} className="bg-white p-4 rounded border space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded w-full">Login</button>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
      </form>

      <div className="text-xs text-slate-500">
        Këshillë: krijo një admin me <code>/auth/register</code> (role: "admin") dhe një student (role: "student").
      </div>
    </div>
  );
}