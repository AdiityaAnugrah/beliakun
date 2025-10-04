import { useEffect, useState } from "react";
import { createCategory, listCategories } from "../api/finance";
import type { Category } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { getErrorMessage } from "../utils/error";

type CategoryForm = { name: string; kind: "income" | "expense" | "transfer" };

export default function Categories() {
  const { tenantId } = useTenant();
  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>({ name: "", kind: "expense" });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!tenantId) return;
    try { setRows(await listCategories(tenantId)); }
    catch (e: unknown) { setErr(getErrorMessage(e)); }
  }
  useEffect(() => { void load(); }, [tenantId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      await createCategory(tenantId, form);
      setForm({ name: "", kind: "expense" });
      await load();
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }

  return (
    <div className="container">
      {err && <div className="card small" style={{ color: "crimson" }}>{err}</div>}

      <form className="card row" onSubmit={onSubmit}>
        <h2>Buat Kategori</h2>
        <input placeholder="Nama kategori" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as CategoryForm["kind"] })}>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
          <option value="transfer">Transfer</option>
        </select>
        <button type="submit">Tambah</button>
      </form>

      <div className="card">
        <h3>Daftar Kategori</h3>
        {rows.map((r) => (
          <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
            <b>{r.name}</b> <span className="badge">{r.kind}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
