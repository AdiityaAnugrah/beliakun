import { useEffect, useState } from "react";
import { createAccount, listAccounts, updateAccount } from "../api/finance";
import type { Account } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { getErrorMessage } from "../utils/error";

type AccountForm = { name: string; type: string; currency: string };

export default function Accounts() {
  const { tenantId } = useTenant();
  const [rows, setRows] = useState<Account[]>([]);
  const [form, setForm] = useState<AccountForm>({ name: "", type: "cash", currency: "IDR" });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!tenantId) return;
    try { setRows(await listAccounts(tenantId)); }
    catch (e: unknown) { setErr(getErrorMessage(e)); }
  }
  useEffect(() => { void load(); }, [tenantId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      await createAccount(tenantId, form);
      setForm({ name: "", type: "cash", currency: "IDR" });
      await load();
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }

  return (
    <div className="container">
      {err && <div className="card small" style={{ color: "crimson" }}>{err}</div>}

      <form className="card row" onSubmit={onSubmit}>
        <h2>Buat Akun</h2>
        <input placeholder="Nama akun (contoh: Bank BCA)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="cash">Cash</option><option value="bank">Bank</option><option value="ewallet">E-Wallet</option><option value="other">Lainnya</option>
        </select>
        <input placeholder="Mata uang" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        <button type="submit">Tambah</button>
      </form>

      <div className="card">
        <h3>Daftar Akun</h3>
        {rows.map((r) => (
          <div key={r.id} className="row" style={{ borderBottom: "1px solid #f1f1f1", padding: "10px 0" }}>
            <div>
              <b>{r.name}</b>
              <div className="small">{r.type} • {r.currency}</div>
            </div>
            <button
              className="secondary"
              onClick={async () => {
                if (!tenantId) return;
                await updateAccount(tenantId, r.id, { is_archived: !r.is_archived });
                await load();
              }}
            >
              {r.is_archived ? "Unarchive" : "Archive"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
