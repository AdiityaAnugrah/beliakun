import { useEffect, useState } from "react";
import { attachTenant, listTenants } from "../api/finance";
import type { Tenant } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

export default function AttachTenant() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const { setTenantId } = useTenant();
  const { setToken } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try { setTenants(await listTenants()); }
      catch (e: unknown) { setErr(getErrorMessage(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  async function bind(id: number) {
    try {
      const r = await attachTenant(id);
      setToken(r.access_token);
      setTenantId(id);
      nav("/");
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Pilih Tenant</h2>
        {loading && <div className="small">Memuat…</div>}
        {err && <div className="small" style={{ color: "crimson" }}>{err}</div>}
        <div className="row">
          {tenants.map((t) => (
            <button key={t.id} className="secondary" onClick={() => bind(t.id)}>
              {t.name} <span className="badge">#{t.id}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="card row">
        <h3>Masukkan Tenant ID</h3>
        <input placeholder="mis. 1" value={manual} onChange={(e) => setManual(e.target.value ? Number(e.target.value) as number : "")} />
        <button disabled={!manual} onClick={() => bind(Number(manual))}>Gunakan</button>
      </div>
    </div>
  );
}
