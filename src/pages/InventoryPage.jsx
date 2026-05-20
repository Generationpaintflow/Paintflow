// src/pages/InventoryPage.jsx
// Vật tư đầu vào — danh sách lô đang chờ về, trạng thái từng lô

import Layout from '../components/Layout';

const VAT_TU = [
  { id:'VT-20240519-001', ten:'TiO2 (Titan Dioxide)', nhaCungCap:'Công ty Hóa chất Miền Nam', soLuong:500, donVi:'kg', uuTien:'Khan', trangThai:'Dang giao vat tu', canVe:'20/05/2026', donHang:'DH-2605-003,DH-2605-005', ghiChu:'Gấp — trễ sản xuất DH-2605-003' },
  { id:'VT-20240519-002', ten:'Nhựa Acrylic A-12', nhaCungCap:'Toàn Phát Chemical', soLuong:200, donVi:'kg', uuTien:'Thuong', trangThai:'Da len don hang', canVe:'25/05/2026', donHang:'DH-2605-004', ghiChu:'' },
  { id:'VT-20240519-003', ten:'Bột CaCO3 siêu mịn', nhaCungCap:'Minh Đức Minerals', soLuong:1000, donVi:'kg', uuTien:'Thuong', trangThai:'Da ve kho nha may', canVe:'18/05/2026', donHang:'DH-2605-007', ghiChu:'Đã về đủ, chuyển vào kho' },
  { id:'VT-20240519-004', ten:'Dung môi Xylene', nhaCungCap:'Petro Chemical VN', soLuong:300, donVi:'lít', uuTien:'Dac biet khan', trangThai:'Dang giao vat tu', canVe:'19/05/2026', donHang:'DH-2605-001', ghiChu:'LĐ yêu cầu theo dõi sát — giao hàng hôm nay' },
  { id:'VT-20240519-005', ten:'Chất tạo màu Pigment Blue', nhaCungCap:'ColorChem Asia', soLuong:50, donVi:'kg', uuTien:'Thuong', trangThai:'Da len don hang', canVe:'28/05/2026', donHang:'DH-2605-002', ghiChu:'' },
];

const TRANG_THAI_MAP = {
  'Da len don hang':   { label: 'Đã lên đơn',      bg: '#e8f0fb', color: '#1a5fa0' },
  'Dang giao vat tu':  { label: 'Đang vận chuyển', bg: '#fdf0da', color: '#c8750a', pulse: true },
  'Da ve kho nha may': { label: 'Đã về kho',        bg: '#e0f5eb', color: '#1a7a4a' },
};

const UU_TIEN_MAP = {
  'Dac biet khan': { label: '🔴 Đặc biệt khẩn', bg: '#fdecea', color: '#c0392b' },
  'Khan':          { label: '🟡 Khẩn',           bg: '#fdf0da', color: '#c8750a' },
  'Thuong':        { label: '⚪ Thường',           bg: '#f2ede6', color: '#6b6358' },
};

export default function InventoryPage() {
  const dangChoVe = VAT_TU.filter(v => v.trangThai !== 'Da ve kho nha may');
  const daVe      = VAT_TU.filter(v => v.trangThai === 'Da ve kho nha may');

  return (
    <Layout currentPath="/inventory" pageTitle="Vật tư đầu vào" pageMeta="T5 19/05/2026">

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Tổng lô đang theo dõi', value: VAT_TU.length,      accent:'var(--am)' },
          { label:'Đang vận chuyển',        value: VAT_TU.filter(v=>v.trangThai==='Dang giao vat tu').length,  accent:'var(--bl)', valColor:'var(--bl)' },
          { label:'Khẩn / Đặc biệt khẩn',  value: VAT_TU.filter(v=>v.uuTien!=='Thuong').length, accent:'var(--rd)', valColor:'var(--rd)' },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ '--stat-accent': s.accent }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.valColor, fontSize: 22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bảng đang chờ về */}
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head">
          <div className="panel-title">
            <i className="ti ti-truck-delivery" aria-hidden="true" />
            Lô vật tư đang chờ về ({dangChoVe.length})
          </div>
          <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <i className="ti ti-plus" style={{ fontSize: 13 }} />Thêm lô vật tư
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <thead>
              <tr style={{ background:'var(--sf)', borderBottom:'1px solid var(--border)' }}>
                {['Mã lô','Tên vật tư / Nhà cung cấp','Số lượng','Ưu tiên','Trạng thái','Cần về','Đơn hàng liên kết','Ghi chú'].map((h,i) => (
                  <th key={i} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5, fontFamily:'var(--font-mono)', color:'var(--ink4)', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dangChoVe.map(v => {
                const tt = TRANG_THAI_MAP[v.trangThai];
                const ut = UU_TIEN_MAP[v.uuTien];
                const isLate = v.trangThai === 'Dang giao vat tu' && v.uuTien !== 'Thuong';
                return (
                  <tr key={v.id} style={{ borderBottom:'1px solid var(--border)', background: isLate ? '#fffaf5' : undefined }}>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--am)' }}>{v.id}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{v.ten}</div>
                      <div style={{ fontSize:11, color:'var(--ink4)' }}>{v.nhaCungCap}</div>
                    </td>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--ink2)' }}>
                      {v.soLuong.toLocaleString()} {v.donVi}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:ut.bg, color:ut.color, whiteSpace:'nowrap' }}>
                        {ut.label}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:tt.bg, color:tt.color, display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                        {tt.pulse && <span style={{ width:6, height:6, borderRadius:'50%', background:tt.color, animation:'pulse 1.5s infinite', flexShrink:0 }} />}
                        {tt.label}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:12, color: v.canVe <= '19/05/2026' ? 'var(--rd)' : 'var(--ink3)', fontWeight: v.canVe <= '19/05/2026' ? 500 : 400 }}>
                      {v.canVe}
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      {v.donHang.split(',').map(d => (
                        <span key={d} style={{ fontSize:10.5, fontFamily:'var(--font-mono)', padding:'1px 5px', borderRadius:8, background:'var(--aml)', color:'var(--am)', marginRight:3, display:'inline-block' }}>{d.trim()}</span>
                      ))}
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:12, color: v.ghiChu ? 'var(--rd)' : 'var(--ink4)' }}>
                      {v.ghiChu || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Đã về kho */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <i className="ti ti-check" aria-hidden="true" style={{ color:'var(--gn)' }} />
            Đã về kho ({daVe.length})
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--sf)', borderBottom:'1px solid var(--border)' }}>
                {['Mã lô','Tên vật tư','Số lượng','Đơn hàng liên kết','Ngày về thực tế'].map((h,i) => (
                  <th key={i} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5, fontFamily:'var(--font-mono)', color:'var(--ink4)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daVe.map(v => (
                <tr key={v.id} style={{ borderBottom:'1px solid var(--border)', opacity:0.7 }}>
                  <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--gn)' }}>{v.id}</td>
                  <td style={{ padding:'9px 12px', fontSize:13, color:'var(--ink2)' }}>{v.ten}</td>
                  <td style={{ padding:'9px 12px', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink3)' }}>{v.soLuong.toLocaleString()} {v.donVi}</td>
                  <td style={{ padding:'9px 12px' }}>
                    {v.donHang.split(',').map(d => (
                      <span key={d} style={{ fontSize:10.5, fontFamily:'var(--font-mono)', padding:'1px 5px', borderRadius:8, background:'var(--gnl)', color:'var(--gn)', marginRight:3 }}>{d.trim()}</span>
                    ))}
                  </td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:'var(--gn)' }}>{v.canVe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
}
