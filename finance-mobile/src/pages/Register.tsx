// src/pages/Register.tsx
import { useCallback, useState } from "react";
import { register } from "../api/finance";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import Turnstile from "../components/Turnstile";

const USE_DEV_SIGNUP = (import.meta.env.VITE_DEV_SIGNUP || "") === "1";
const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY || "";

export default function Register(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [token,setToken]=useState<string>("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const nav = useNavigate();

  const handleToken = useCallback((t: string) => {
    setToken(t);
  }, []);

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setErr(null); setLoading(true);
    try{
      if (!USE_DEV_SIGNUP) {
        if (!SITEKEY) throw new Error("Turnstile sitekey belum dikonfigurasi (VITE_TURNSTILE_SITEKEY).");
        if (!token) throw new Error("Captcha wajib. Silakan selesaikan verifikasi.");
      }

      await register(name, email, password, token);

      if (USE_DEV_SIGNUP) nav("/login");
      else nav(`/verify?email=${encodeURIComponent(email)}`);
    }catch(e:unknown){
      setErr(getErrorMessage(e));
    }finally{ setLoading(false); }
  }

  return (
    <div className="container">
      <div className="card" style={{textAlign:"center"}}>
        <h2 style={{marginBottom:4}}>Buat Akun</h2>
        <div className="small">Gratis & cepat — verifikasi via email</div>
      </div>

      <form className="card row" onSubmit={onSubmit}>
        <input placeholder="Nama" value={name} onChange={(ev)=>setName(ev.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(ev)=>setEmail(ev.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(ev)=>setPassword(ev.target.value)} required />

        {!USE_DEV_SIGNUP && (
          <div className="card small" style={{ background: "#fafafa" }}>
            {SITEKEY ? (
              <Turnstile sitekey={SITEKEY} onToken={handleToken} />
            ) : (
              <div style={{ color: "crimson" }}>
                VITE_TURNSTILE_SITEKEY belum di-set. Set dulu di .env frontend.
              </div>
            )}
          </div>
        )}

        {err && <div className="small" style={{color:"crimson"}}>{err}</div>}
        <button disabled={loading} type="submit">{loading? "Memproses..." : "Daftar"}</button>
      </form>

      <div className="small" style={{textAlign:"center"}}>
        Sudah punya akun? <a href="/login">Masuk</a>
      </div>
    </div>
  );
}
