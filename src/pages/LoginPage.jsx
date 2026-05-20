// src/pages/LoginPage.jsx
// Màn hình đăng nhập — hiện trước khi vào app

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const { signIn }        = useAuth();
    const [email, setEmail] = useState('');
    const [pass, setPass]   = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, pass);
            // AuthProvider tự điều hướng sau khi đăng nhập thành công
        } catch (err) {
            setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight:'100vh', background:'#1a1714', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" }}>
            <div style={{ background:'white', borderRadius:12, padding:'36px 40px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
                {/* Logo */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
                    <div style={{ width:36, height:36, background:'#c8750a', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="ti ti-droplet" style={{ fontSize:18, color:'white' }} />
                    </div>
                    <div>
                        <div style={{ fontFamily:"'Syne', sans-serif", fontSize:16, fontWeight:700, color:'#1a1714', letterSpacing:'-0.02em' }}>PaintFlow</div>
                        <div style={{ fontSize:10, color:'#a09890', fontFamily:"'DM Mono', monospace", letterSpacing:'0.08em', textTransform:'uppercase' }}>Nhà máy sơn</div>
                    </div>
                </div>

                <div style={{ fontSize:20, fontFamily:"'Syne', sans-serif", fontWeight:700, color:'#1a1714', marginBottom:6, letterSpacing:'-0.02em' }}>Đăng nhập</div>
                <div style={{ fontSize:13, color:'#a09890', marginBottom:24 }}>Dùng tài khoản được cấp bởi quản trị viên</div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom:14 }}>
                        <label style={{ fontSize:12, fontWeight:500, color:'#6b6358', display:'block', marginBottom:5 }}>Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="ten@nhamay.com"
                            style={{ width:'100%', padding:'9px 12px', border:'1px solid rgba(26,23,20,0.2)', borderRadius:6, fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:'none', color:'#1a1714' }}
                        />
                    </div>
                    <div style={{ marginBottom:20 }}>
                        <label style={{ fontSize:12, fontWeight:500, color:'#6b6358', display:'block', marginBottom:5 }}>Mật khẩu</label>
                        <input
                            type="password" required
                            value={pass} onChange={e => setPass(e.target.value)}
                            placeholder="••••••••"
                            style={{ width:'100%', padding:'9px 12px', border:'1px solid rgba(26,23,20,0.2)', borderRadius:6, fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:'none', color:'#1a1714' }}
                        />
                    </div>

                    {error && (
                        <div style={{ background:'#fdecea', border:'1px solid rgba(192,57,43,0.2)', borderRadius:6, padding:'9px 12px', fontSize:13, color:'#c0392b', marginBottom:16 }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={loading}
                        style={{ width:'100%', padding:'10px', background: loading ? '#e0c090' : '#c8750a', color:'white', border:'none', borderRadius:6, fontSize:14, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans', sans-serif", transition:'background 0.13s' }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div style={{ marginTop:20, fontSize:12, color:'#a09890', textAlign:'center', lineHeight:1.5 }}>
                    Quên mật khẩu? Liên hệ quản trị viên hệ thống.
                </div>
            </div>
        </div>
    );
}
