// src/api/finance.ts
import api from "./client";

export type Tenant   = { id:number; name:string; created_at:string };
export type Account  = { id:number; tenant_id:number; name:string; type:string; currency:string; balance_cached:number; is_archived:number; created_at:string; updated_at:string|null };
export type Category = { id:number; tenant_id:number; name:string; kind:"income"|"expense"|"transfer"; created_at:string };
export type Transaction = { id:number; tenant_id:number; account_id:number; category_id:number|null; user_id_ref:number|null; type:"income"|"expense"|"transfer"; amount:number; note:string|null; occurred_at:string; created_at:string; updated_at:string|null };
export type Budget = { id:number; tenant_id:number; category_id:number; category_name?:string; month:string; amount:number; created_at:string };
export type Monthly = { ym:string; income_total:number; expense_total:number; net_total:number };
export type Paged<T> = { page:number; pageSize:number; total:number; rows:T[] };

const USE_DEV_SIGNUP = (import.meta.env.VITE_DEV_SIGNUP || "") === "1";

export async function register(name: string, email: string, password: string, token?: string) {
  if (USE_DEV_SIGNUP) {
    const r = await api.post("/auth/dev-signup", { name, email, password });
    return r.data as { ok?: boolean; message?: string };
  }
  // PRODUKSI: backend-mu minta captcha "token"
  const r = await api.post("/auth/signup", { name, email, password, token });
  return r.data as { ok?: boolean; message?: string };
}

export async function verifyCode(email: string, code: string) {
  const r = await api.post("/auth/verify", { email, code });
  return r.data as { ok?: boolean; message?: string };
}

export async function login(email:string,password:string,tenantId?:number){
  const r = await api.post("/auth/login",{ email,password, tenant_id: tenantId });
  return r.data as { access_token:string; expires_in:string };
}

export async function attach(){
  const r = await api.post("/auth/persist/attach");
  return r.data as { access_token:string; expires_in:string };
}

export async function attachTenant(tenant_id:number){
  const r = await api.post("/auth/attach-tenant",{ tenant_id });
  return r.data as { access_token:string; expires_in:string };
}

export async function listTenants(){ return (await api.get<Tenant[]>("/finance/tenants")).data; }
export async function listAccounts(tenantId:number){ return (await api.get<Account[]>(`/finance/${tenantId}/accounts`)).data; }
export async function createAccount(tenantId:number, payload:{name:string;type:string;currency?:string}){ return (await api.post(`/finance/${tenantId}/accounts`,payload)).data as {id:number}; }
export async function updateAccount(tenantId:number,id:number,patch:Partial<{name:string;type:string;currency:string;is_archived:boolean}>){ return (await api.patch(`/finance/${tenantId}/accounts/${id}`,patch)).data; }

export async function listCategories(tenantId:number,kind?:string){ return (await api.get<Category[]>(`/finance/${tenantId}/categories`,{ params:{ kind:kind||"" } })).data; }
export async function createCategory(tenantId:number,payload:{name:string;kind:"income"|"expense"|"transfer"}){ return (await api.post(`/finance/${tenantId}/categories`,payload)).data as {id:number}; }

export async function listTransactions(tenantId:number,params?:Record<string,string|number|boolean|null|undefined>){ return (await api.get<Paged<Transaction>>(`/finance/${tenantId}/transactions`,{ params })).data; }
export async function createTransaction(tenantId:number,payload:Partial<Transaction>){ return (await api.post(`/finance/${tenantId}/transactions`,payload)).data as {id:number}; }

export async function listBudgets(tenantId:number,month?:string){ return (await api.get<Budget[]>(`/finance/${tenantId}/budgets`,{ params:{ month:month||"" } })).data; }
export async function upsertBudget(tenantId:number,payload:{category_id:number;month:string;amount:number}){ return (await api.post(`/finance/${tenantId}/budgets`,payload)).data as {id:number;created?:boolean;updated?:boolean}; }

export async function monthlySummary(tenantId:number,month?:string){ return (await api.get<Monthly[]>(`/finance/${tenantId}/summary`,{ params:{ month:month||"" } })).data; }
