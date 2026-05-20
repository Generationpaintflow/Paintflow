import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import OrdersPage     from './pages/OrdersPage';
import KanbanPage     from './pages/KanbanPage';
import InventoryPage  from './pages/InventoryPage';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return children;
}

function Placeholder({ title }) {
    return <div style={{ padding:'40px 24px', fontFamily:"'DM Sans',sans-serif" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, color:'#1a1714', marginBottom:8 }}>{title}</h1>
        <p style={{ color:'#a09890', fontSize:14 }}>Module này đang được phát triển.</p>
    </div>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login"     element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/"          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/kanban"    element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/progress"  element={<ProtectedRoute><Placeholder title="Tiến độ sản xuất" /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Placeholder title="Phân tích & Báo cáo" /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><Placeholder title="Cài đặt hệ thống" /></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
