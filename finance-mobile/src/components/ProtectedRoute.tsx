import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useTenant } from "../context/TenantProvider";

export default function ProtectedRoute({ children, needTenant=false }: { children:JSX.Element; needTenant?:boolean }) {
  const { token } = useAuth();
  const { tenantId } = useTenant();
  if (!token) return <Navigate to="/login" replace />;
  if (needTenant && !tenantId) return <Navigate to="/attach-tenant" replace />;
  return children;
}
