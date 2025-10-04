// controllers/finance.controller.js
const { q } = require("../config/db.finance");

// helpers
function intOr(v, d = 0) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; }
function floatOr(v, d = 0) { const n = parseFloat(v); return Number.isFinite(n) ? n : d; }
function likeWrap(s) { return s ? `%${s}%` : "%"; }
function miss(body, fields) { const m=[]; for (const f of fields) if (body[f]==null||body[f]==="") m.push(f); return m; }

/* ========== TENANTS ========== */
exports.listTenants = async (req, res) => {
  try {
    const search = req.query.search || "";
    const rows = await q(
      `SELECT id,name,created_at FROM fin_tenants WHERE name LIKE ? ORDER BY created_at DESC`,
      [likeWrap(search)]
    );
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.createTenant = async (req, res) => {
  try {
    const m = miss(req.body, ["name"]); if (m.length) return res.status(400).json({error:"Missing fields",fields:m});
    const { name } = req.body;
    const ex = await q(`SELECT id FROM fin_tenants WHERE name=? LIMIT 1`, [name]);
    let id = ex.length ? ex[0].id : (await q(`INSERT INTO fin_tenants (name) VALUES (?)`, [name])).insertId;
    await q(
      `INSERT IGNORE INTO fin_tenant_members (tenant_id,user_id_ref,user_label_cache,role)
       VALUES (?,?,?,'owner')`,
      [id, req.user?.id || null, req.user?.email || req.user?.name || null]
    );
    res.status(201).json({ id });
  } catch(e){ res.status(500).json({error:e.message}); }
};

/* ========== ACCOUNTS ========== */
exports.getAccounts = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const includeArchived = req.query.includeArchived === "1";
    const rows = await q(
      `SELECT id,tenant_id,name,type,currency,balance_cached,is_archived,created_at,updated_at
       FROM fin_accounts
       WHERE tenant_id=? ${includeArchived ? "" : "AND is_archived=0"}
       ORDER BY name ASC`,
      [tenantId]
    );
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.createAccount = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const m = miss(req.body, ["name"]); if (m.length) return res.status(400).json({error:"Missing fields",fields:m});
    const { name, type="other", currency="IDR" } = req.body;
    const r = await q(
      `INSERT INTO fin_accounts (tenant_id,name,type,currency) VALUES (?,?,?,?)`,
      [tenantId, name, type, currency]
    );
    res.status(201).json({ id: r.insertId });
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.updateAccount = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId), id = intOr(req.params.id);
    const { name, type, currency, is_archived } = req.body;
    const f=[],v=[];
    if (name !== undefined)       { f.push("name=?");        v.push(name); }
    if (type !== undefined)       { f.push("type=?");        v.push(type); }
    if (currency !== undefined)   { f.push("currency=?");    v.push(currency); }
    if (is_archived !== undefined){ f.push("is_archived=?"); v.push(is_archived?1:0); }
    if (!f.length) return res.json({ ok:true });
    v.push(tenantId, id);
    await q(`UPDATE fin_accounts SET ${f.join(", ")}, updated_at=NOW() WHERE tenant_id=? AND id=?`, v);
    res.json({ ok:true });
  } catch(e){ res.status(500).json({error:e.message}); }
};

/* ========== CATEGORIES ========== */
exports.getCategories = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const kind = req.query.kind || "";
    const search = req.query.search || "";
    const rows = await q(
      `SELECT id,tenant_id,name,kind,created_at
       FROM fin_categories
       WHERE tenant_id=? AND (?='' OR kind=?) AND name LIKE ?
       ORDER BY kind,name`,
      [tenantId, kind, kind, likeWrap(search)]
    );
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.createCategory = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const m = miss(req.body, ["name","kind"]); if (m.length) return res.status(400).json({error:"Missing fields",fields:m});
    const { name, kind } = req.body;
    const ex = await q(`SELECT id FROM fin_categories WHERE tenant_id=? AND name=? AND kind=? LIMIT 1`,
                       [tenantId, name, kind]);
    if (ex.length) return res.status(409).json({ error: "Category already exists" });
    const r = await q(`INSERT INTO fin_categories (tenant_id,name,kind) VALUES (?,?,?)`,
                      [tenantId, name, kind]);
    res.status(201).json({ id: r.insertId });
  } catch(e){ res.status(500).json({error:e.message}); }
};

/* ========== TRANSACTIONS ========== */
exports.listTransactions = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const page = Math.max(intOr(req.query.page,1),1);
    const pageSize = Math.min(Math.max(intOr(req.query.pageSize,20),1),200);
    const accountId = intOr(req.query.accountId,0) || null;
    const categoryId = intOr(req.query.categoryId,0) || null;
    const type = req.query.type || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const search = req.query.search || "";

    const where = ["tenant_id=?"]; const vals = [tenantId];
    if (accountId) { where.push("account_id=?"); vals.push(accountId); }
    if (categoryId){ where.push("category_id=?"); vals.push(categoryId); }
    if (type)      { where.push("type=?");       vals.push(type); }
    if (dateFrom)  { where.push("DATE(occurred_at) >= ?"); vals.push(dateFrom); }
    if (dateTo)    { where.push("DATE(occurred_at) <= ?"); vals.push(dateTo); }
    if (search)    { where.push("(note LIKE ?)"); vals.push(likeWrap(search)); }

    const sqlWhere = "WHERE " + where.join(" AND ");
    const total = (await q(`SELECT COUNT(*) n FROM fin_transactions ${sqlWhere}`, vals))[0].n;
    const rows = await q(
      `SELECT id,tenant_id,account_id,category_id,user_id_ref,type,amount,note,occurred_at,created_at,updated_at
       FROM fin_transactions ${sqlWhere}
       ORDER BY occurred_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...vals, pageSize, (page-1)*pageSize]
    );
    res.json({ page, pageSize, total, rows });
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.createTransaction = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const m = miss(req.body, ["account_id","type","amount","occurred_at"]);
    if (m.length) return res.status(400).json({error:"Missing fields",fields:m});

    const account_id = intOr(req.body.account_id);
    const category_id = req.body.category_id ? intOr(req.body.category_id) : null;
    const user_id_ref = req.user?.id || null;
    const type = req.body.type;
    const amount = floatOr(req.body.amount);
    const note = req.body.note || null;
    const occurred_at = req.body.occurred_at;

    if (!["income","expense","transfer"].includes(type))
      return res.status(400).json({ error: "Invalid type" });
    if (amount <= 0) return res.status(400).json({ error: "Amount must be > 0" });

    const acc = await q(`SELECT id FROM fin_accounts WHERE id=? AND tenant_id=?`, [account_id, tenantId]);
    if (!acc.length) return res.status(400).json({ error: "Account not found in this tenant" });
    if (category_id) {
      const cat = await q(`SELECT id FROM fin_categories WHERE id=? AND tenant_id=?`, [category_id, tenantId]);
      if (!cat.length) return res.status(400).json({ error: "Category not found in this tenant" });
    }

    const r = await q(
      `INSERT INTO fin_transactions (tenant_id,account_id,category_id,user_id_ref,type,amount,note,occurred_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [tenantId, account_id, category_id, user_id_ref, type, amount, note, occurred_at]
    );
    res.status(201).json({ id: r.insertId });
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.updateTransaction = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId), id = intOr(req.params.id);
    const { account_id, category_id, type, amount, note, occurred_at } = req.body;

    const f=[],v=[];
    if (account_id !== undefined)  { f.push("account_id=?");  v.push(intOr(account_id)); }
    if (category_id !== undefined) { f.push("category_id=?"); v.push(category_id ? intOr(category_id) : null); }
    if (type !== undefined)        {
      if (!["income","expense","transfer"].includes(type)) return res.status(400).json({ error:"Invalid type" });
      f.push("type=?"); v.push(type);
    }
    if (amount !== undefined)      {
      const a = floatOr(amount); if (a <= 0) return res.status(400).json({ error:"Amount must be > 0" });
      f.push("amount=?"); v.push(a);
    }
    if (note !== undefined)        { f.push("note=?");        v.push(note || null); }
    if (occurred_at !== undefined) { f.push("occurred_at=?"); v.push(occurred_at); }

    if (!f.length) return res.json({ ok:true });
    v.push(tenantId, id);
    await q(`UPDATE fin_transactions SET ${f.join(", ")}, updated_at=NOW() WHERE tenant_id=? AND id=?`, v);
    res.json({ ok:true });
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.deleteTransaction = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId), id = intOr(req.params.id);
    await q(`DELETE FROM fin_transactions WHERE tenant_id=? AND id=?`, [tenantId, id]);
    res.json({ ok:true });
  } catch(e){ res.status(500).json({error:e.message}); }
};

/* ========== BUDGETS ========== */
exports.getBudgets = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const month = req.query.month || "";
    const rows = await q(
      `SELECT b.id,b.tenant_id,b.category_id,c.name AS category_name,b.month,b.amount,b.created_at
       FROM fin_budgets b
       LEFT JOIN fin_categories c ON c.id=b.category_id
       WHERE b.tenant_id=? AND (?='' OR b.month=?)
       ORDER BY b.month DESC,c.name ASC`,
      [tenantId, month, month]
    );
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
};
exports.upsertBudget = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const m = miss(req.body, ["category_id","month","amount"]); if (m.length) return res.status(400).json({error:"Missing fields",fields:m});
    const category_id = intOr(req.body.category_id);
    const month = req.body.month;
    const amount = floatOr(req.body.amount);
    const ex = await q(`SELECT id FROM fin_budgets WHERE tenant_id=? AND category_id=? AND month=? LIMIT 1`,
                       [tenantId, category_id, month]);
    if (ex.length) {
      await q(`UPDATE fin_budgets SET amount=? WHERE id=?`, [amount, ex[0].id]);
      return res.json({ id: ex[0].id, updated:true });
    } else {
      const r = await q(`INSERT INTO fin_budgets (tenant_id,category_id,month,amount) VALUES (?,?,?,?)`,
                        [tenantId, category_id, month, amount]);
      return res.status(201).json({ id: r.insertId, created:true });
    }
  } catch(e){ res.status(500).json({error:e.message}); }
};

/* ========== SUMMARY ========== */
exports.summaryMonthly = async (req, res) => {
  try {
    const tenantId = intOr(req.params.tenantId);
    const month = req.query.month || "";
    const rows = await q(
      `SELECT ym,income_total,expense_total,net_total
       FROM fin_v_monthly
       WHERE tenant_id=? AND (?='' OR ym=?)
       ORDER BY ym DESC`,
      [tenantId, month, month]
    );
    res.json(rows);
  } catch(e){ res.status(500).json({error:e.message}); }
};
