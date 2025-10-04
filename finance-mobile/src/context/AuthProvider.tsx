import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../api/client";

type AuthCtx = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => Promise<void>;
};
const Ctx = createContext<AuthCtx>({ token:null, setToken(){}, async logout(){} });

export function AuthProvider({ children }:{children:React.ReactNode}){
  const [token, setTokenState] = useState<string|null>(null);

  function setToken(t:string|null){
    setTokenState(t);
    setAccessToken(t);
  }

  async function logout(){
    try { await api.post("/auth/persist/logout"); } catch {}
    setToken(null);
  }

  useEffect(()=>{ (async()=>{
    try{
      const r = await api.post("/auth/refresh");
      setToken(r.data.access_token);
    }catch{/* belum login */}
  })(); },[]);

  return <Ctx.Provider value={{ token, setToken, logout }}>{children}</Ctx.Provider>;
}
export function useAuth(){ return useContext(Ctx); }
