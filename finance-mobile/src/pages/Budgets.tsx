import { useEffect, useState } from "react";
import { listBudgets, listCategories, upsertBudget } from "../api/finance";
import type { Budget, Category } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { getErrorMessage } from "../utils/error";

type BudgetForm = { category_id: number; month: string; amount: number };

export default function Budgets() {
  const { tenantId } = useTenant();
  const [rows, setRows] = useState<Budget[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<BudgetForm>({ category_id: 0, month: "", amount: 0 });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!tenantId) return;
    try {
      setRows(await listBudgets(tenantId));
      setCats(await listCategories(tenantId, "expense"));
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }
  useEffect(() => { void load(); }, [tenantId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      await upsertBudget(tenantId, form);
      setForm({ category_id: 0, month: "", amount: 0 });
      await load();
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }

  return (
    <div className="container">
      {err && <div className="card small" style={{ color: "crimson" }}>{err}</div>}

      <form className="card row" onSubmit={onSubmit}>
        <h2>Atur Budget</h2>
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} required>
          <option value={0}>Pilih Kategori (expense)</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
        <input type="number" placeholder="Budget (IDR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
        <button type="submit">Simpan</button>
      </form>

      <div className="card">
        <h3>Daftar Budget</h3>
        {rows.map((r) => (
          <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
            <div style={{ fontWeight: 800 }}>{r.month}</div>
            <div className="small">{r.category_name ?? r.category_id}</div>
            <div className="small">Rp {r.amount.toLocaleString("id-ID")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
