import axios from "axios";

let accessToken = null;
let user = null;

export const api = axios.create({ baseURL: "http://localhost:5000", withCredentials: true });

export function setAccessToken(t){ accessToken = t || null; }
export function getUser(){ return user; }
export function setUser(u){ user = u || null; if(u) localStorage.setItem("user", JSON.stringify(u)); else localStorage.removeItem("user"); }

api.interceptors.request.use((config)=>{
  if(accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;
api.interceptors.response.use(r=>r, async (err)=>{
  const original = err.config;
  if(err.response && err.response.status === 401 && !original._retry){
    original._retry = true;
    try{
      refreshing = refreshing || api.post("/auth/refresh");
      const { data } = await refreshing; refreshing = null;
      setAccessToken(data.accessToken); setUser(data.user);
      original.headers["Authorization"] = `Bearer ${data.accessToken}`;
      return api(original);
    }catch(e){ refreshing = null; setAccessToken(null); setUser(null); }
  }
  throw err;
});

export async function bootstrapAuth(){
  const cached = localStorage.getItem("user");
  if(cached) try{ user = JSON.parse(cached)||null; }catch{}
  try{ const { data } = await api.post("/auth/refresh"); setAccessToken(data.accessToken); setUser(data.user); }catch{}
}