import { useTenant } from "../context/TenantProvider";

export default function TopBar(){
  const { tenantId } = useTenant();
  return (
    <div className="topbar">
      <div className="title">Beliakun Finance</div>
      {tenantId ? <div className="small">Tenant <b>#{tenantId}</b></div> : <div className="small">Pilih tenant…</div>}
    </div>
  );
}
