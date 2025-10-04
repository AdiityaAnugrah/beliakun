import React, { createContext, useContext, useEffect, useState } from "react";

type TenantCtx = { tenantId:number|null; setTenantId:(id:number|null)=>void; };
const Ctx = createContext<TenantCtx>({ tenantId:null, setTenantId(){} });

export function TenantProvider({ children }:{children:React.ReactNode}){
  const [tenantId, setTenantIdState] = useState<number|null>(null);
  function setTenantId(id:number|null){
    setTenantIdState(id);
    if (id) localStorage.setItem("tenantId", String(id));
    else localStorage.removeItem("tenantId");
  }
  useEffect(()=>{ const t=localStorage.getItem("tenantId"); if (t) setTenantIdState(parseInt(t,10)); },[]);
  return <Ctx.Provider value={{ tenantId, setTenantId }}>{children}</Ctx.Provider>;
}
export function useTenant(){ return useContext(Ctx); }
