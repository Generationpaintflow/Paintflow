// src/hooks/useAuth.js
// Quản lý đăng nhập, phiên làm việc, và phân quyền theo role
// Dùng: const { user, role, loading, signIn, signOut, canAccess } = useAuth();

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null); // { ho_ten, chuc_vu, ... }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra phiên đăng nhập hiện tại khi app khởi động
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) loadProfile(session.user.id);
            else setLoading(false);
        });

        // Lắng nghe thay đổi trạng thái auth (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) await loadProfile(session.user.id);
                else { setProfile(null); setLoading(false); }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function loadProfile(userId) {
        const { data } = await supabase
            .from('nguoi_dung')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
        setLoading(false);
    }

    // Đăng nhập bằng email + mật khẩu
    async function signIn(email, matKhau) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: matKhau,
        });
        if (error) throw new Error(error.message);
        return data;
    }

    // Đăng xuất
    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }

    // Kiểm tra quyền truy cập theo role
    // Dùng: canAccess(['Giam Doc', 'Quan Doc'])
    function canAccess(cacRole) {
        if (!profile) return false;
        return cacRole.includes(profile.chuc_vu);
    }

    const value = {
        user,
        profile,
        role: profile?.chuc_vu ?? null,
        hoTen: profile?.ho_ten ?? null,
        loading,
        signIn,
        signOut,
        canAccess,
        isGiamDoc:      profile?.chuc_vu === 'Giam Doc',
        isTruongPhongKD: profile?.chuc_vu === 'Truong Phong KD',
        isNhanVienKD:   profile?.chuc_vu === 'Nhan Vien KD',
        isQuanDoc:      profile?.chuc_vu === 'Quan Doc',
        isTruongPhongQC: profile?.chuc_vu === 'Truong Phong QC',
        isThuKho:       profile?.chuc_vu === 'Thu Kho',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
    return ctx;
}
