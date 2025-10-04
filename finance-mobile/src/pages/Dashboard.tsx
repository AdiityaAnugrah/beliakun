import { useEffect, useState } from "react";
import { monthlySummary } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { money } from "../utils/format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard(){
  const { tenantId } = useTenant();
  const [data,setData]=useState<{ym:string; income_total:number; expense_total:number; net_total:number}[]>([]);
  const [err,setErr]=useState<string|null>(null);

  useEffect(()=>{ (async()=>{
    if(!tenantId) return;
    try{ setData(await monthlySummary(tenantId)); }
    catch(e:any){ setErr(e?.response?.data?.error || e.message); }
  })(); },[tenantId]);

  const latest = data[0];

  return (
    <div className="container">
      {err && <div className="card small" style={{color:"crimson"}}>{err}</div>}

      <div className="card">
        <h2>Ringkasan</h2>
        {latest ? (
          <div className="grid2">
            <div className="card" style={{padding:12}}>
              <div className="small">Pemasukan</div>
              <div style={{fontSize:20,fontWeight:800,color:"#16a34a"}}>{money(latest.income_total)}</div>
            </div>
            <div className="card" style={{padding:12}}>
              <div className="small">Pengeluaran</div>
              <div style={{fontSize:20,fontWeight:800,color:"#dc2626"}}>{money(latest.expense_total)}</div>
            </div>
            <div className="card" style={{padding:12, gridColumn:"1 / span 2"}}>
              <div className="small">Bersih</div>
              <div style={{fontSize:22,fontWeight:900}}>{money(latest.net_total)}</div>
            </div>
          </div>
        ) : <div className="small">Belum ada ringkasan.</div>}
      </div>

      <div className="card" style={{height:300}}>
        <h3 style={{marginBottom:8}}>Grafik Bulanan</h3>
        <div style={{width:"100%", height:230}}>
          <ResponsiveContainer>
            <AreaChart data={[...data].reverse()}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.6}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.6}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/></linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.6}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="ym" />
              <YAxis />
              <Tooltip formatter={(v)=> money(Number(v))} />
              <CartesianGrid strokeDasharray="3 3" />
              <Area type="monotone" dataKey="income_total" stroke="#16a34a" fill="url(#g1)" />
              <Area type="monotone" dataKey="expense_total" stroke="#dc2626" fill="url(#g2)" />
              <Area type="monotone" dataKey="net_total" stroke="#2563eb" fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
