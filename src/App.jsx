// src/App.jsx — Đã cập nhật: thêm AuthProvider + LoginPage

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import OrdersPage     from './pages/OrdersPage';
import KanbanPage     from './pages/KanbanPage';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:"'DM Sans', sans-serif", color:'#a09890' }}>Đang tải...</div>;
    if (!user)   return <Navigate to="/login" replace />;
    return children;
}

function Placeholder({ title }) {
    return <div style={{ padding:'40px 24px', fontFamily:"'DM Sans', sans-serif" }}><h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:20, color:'#1a1714', marginBottom:8 }}>{title}</h1><p style={{ color:'#a09890', fontSize:14 }}>Module này đang được phát triển.</p></div>;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login"    element={<LoginPage />} />
                    <Route path="/"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/kanban"   element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
                    <Route path="/progress" element={<ProtectedRoute><Placeholder title="Tiến độ sản xuất" /></ProtectedRoute>} />
                    <Route path="/qc"       element={<ProtectedRoute><Placeholder title="Kiểm định QC" /></ProtectedRoute>} />
                    <Route path="/analytics"element={<ProtectedRoute><Placeholder title="Phân tích & Báo cáo" /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Placeholder title="Cài đặt hệ thống" /></ProtectedRoute>} />
                    <Route path="*"         element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
