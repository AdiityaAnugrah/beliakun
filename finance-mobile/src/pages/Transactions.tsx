import { useEffect, useState } from "react";
import { createTransaction, listAccounts, listCategories, listTransactions } from "../api/finance";
import type { Account, Category, Paged, Transaction } from "../api/finance";
import { useTenant } from "../context/TenantProvider";
import { money } from "../utils/format";
import { getErrorMessage } from "../utils/error";

type TxType = "income" | "expense" | "transfer";
type TxForm = {
  account_id: number;
  category_id: number | 0;
  type: TxType;
  amount: number;
  note: string;
  occurred_at: string; // "YYYY-MM-DD HH:mm:ss"
};

export default function Transactions() {
  const { tenantId } = useTenant();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<TxForm>({ account_id: 0, category_id: 0, type: "expense", amount: 0, note: "", occurred_at: "" });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!tenantId) return;
    try {
      const data: Paged<Transaction> = await listTransactions(tenantId, { page, pageSize: 20 });
      setRows(data.rows);
      setTotal(data.total);
      if (accounts.length === 0) setAccounts(await listAccounts(tenantId));
      if (cats.length === 0) setCats(await listCategories(tenantId));
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    }
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tenantId, page]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const payload: Partial<Transaction> = {
        tenant_id: tenantId,
        account_id: form.account_id,
        category_id: form.category_id || null,
        type: form.type,
        amount: form.amount,
        note: form.note || null,
        occurred_at: form.occurred_at
      };
      await createTransaction(tenantId, payload);
      setForm({ account_id: 0, category_id: 0, type: "expense", amount: 0, note: "", occurred_at: "" });
      await load();
    } catch (e: unknown) { setErr(getErrorMessage(e)); }
  }

  return (
    <div className="container">
      {err && <div className="card small" style={{ color: "crimson" }}>{err}</div>}

      <form className="card row" onSubmit={onSubmit}>
        <h2>Tambah Transaksi</h2>
        <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: Number(e.target.value) })} required>
          <option value={0}>Pilih Akun</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TxType })}>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
          <option value={0}>Tanpa Kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.kind} — {c.name}</option>)}
        </select>
        <input type="number" placeholder="Jumlah (IDR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
        <input type="datetime-local" value={form.occurred_at} onChange={(e) => setForm({ ...form, occurred_at: e.target.value.replace("T", " ") + ":00" })} required />
        <input placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button type="submit">+ Tambah</button>
      </form>

      <div className="card">
        <h3>Riwayat</h3>
        {rows.map((r) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
            <div>
              <div style={{ fontWeight: 800 }}>{r.type.toUpperCase()} • {money(r.amount)}</div>
              <div className="small">{r.occurred_at} — Akun #{r.account_id} • {r.category_id ?? "-"}</div>
              {r.note && <div className="small">{r.note}</div>}
            </div>
          </div>
        ))}
        <div className="row" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button className="secondary" onClick={() => setPage((p) => Math.max(p - 1, 1))}>Prev</button>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
        <div className="small" style={{ textAlign: "center" }}>Total: {total}</div>
      </div>
    </div>
  );
}
