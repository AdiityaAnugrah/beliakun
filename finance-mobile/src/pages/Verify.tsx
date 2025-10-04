import { useEffect, useState } from "react";
import { verifyCode } from "../api/finance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

export default function Verify(){
  const [sp] = useSearchParams();
  const presetEmail = sp.get("email") || "";
  const [email,setEmail]=useState(presetEmail);
  const [code,setCode]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const nav = useNavigate();

  useEffect(()=>{ if(presetEmail) setEmail(presetEmail); },[presetEmail]);

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setErr(null); setLoading(true);
    try{
      await verifyCode(email, code);
      nav("/login");
    }catch(e:unknown){
      setErr(getErrorMessage(e));
    }finally{ setLoading(false); }
  }

  return (
    <div className="container">
      <div className="card" style={{textAlign:"center"}}>
        <h2 style={{marginBottom:4}}>Verifikasi Email</h2>
        <div className="small">Masukkan kode yang dikirim ke email</div>
      </div>

      <form className="card row" onSubmit={onSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input placeholder="Kode verifikasi" value={code} onChange={(e)=>setCode(e.target.value)} required />
        {err && <div className="small" style={{color:"crimson"}}>{err}</div>}
        <button disabled={loading} type="submit">{loading? "Memproses..." : "Verifikasi"}</button>
      </form>

      <div className="small" style={{textAlign:"center"}}>
        Belum menerima kode? Cek folder spam.
      </div>
    </div>
  );
}
