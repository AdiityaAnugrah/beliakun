import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../src/pages/Login";
import AttachTenant from "../src/pages/AttachTenant";
import Dashboard from "../src/pages/Dashboard";
import Accounts from "../src/pages/Accounts";
import Categories from "../src/pages/Categories";
import Transactions from "../src/pages/Transactions";
import Budgets from "../src/pages/Budgets";
import ProtectedRoute from "../src/components/ProtectedRoute";
import BottomTabs from "../src/components/BottomTabs";
import TopBar from "../src/components/TopBar";
import { useAuth } from "./context/AuthProvider";
import Register from "../src/pages/Register";   
import Verify from "../src/pages/Verify"; 

export default function App(){
  const { token } = useAuth();
  return (
    <>
      {token && <TopBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/verify" element={<Verify />} />
        <Route path="/attach-tenant" element={<ProtectedRoute><AttachTenant /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute needTenant><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute needTenant><Transactions /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute needTenant><Accounts /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute needTenant><Categories /></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute needTenant><Budgets /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {token && <BottomTabs />}
    </>
  );
}
