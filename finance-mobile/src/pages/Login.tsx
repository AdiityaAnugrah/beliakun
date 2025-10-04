import { useState } from "react";
import { login, attach } from "../api/finance";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { setToken } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await login(email, password, tenantId ? Number(tenantId) : undefined);
      setToken(r.access_token);
      const a = await attach();
      setToken(a.access_token);
      nav(tenantId ? "/" : "/attach-tenant");
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: 4 }}>Masuk</h2>
        <div className="small">Akses keuanganmu dengan aman</div>
      </div>

      <form className="card row" onSubmit={onSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input placeholder="Tenant ID (opsional)" value={tenantId} onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) as number : "")} />
        {err && <div className="small" style={{ color: "crimson" }}>{err}</div>}
        <button disabled={loading} type="submit">{loading ? "Memproses..." : "Masuk"}</button>
      </form>
      <div className="small" style={{textAlign:"center"}}>
        Belum punya akun? <a href="/register">Daftar</a>
      </div>    
    </div>
  );
}
