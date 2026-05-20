// src/pages/OrdersPage.jsx
// Module quản lý đơn hàng: tất cả đơn · ưu tiên sản xuất · ghi chú lãnh đạo

import { useState } from 'react';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge, DeadlineText, ProgressBar } from '../components/Badges';
import {
  ORDERS, PRODUCTION_NOTES, TIMELINE_STEPS, TIMELINE_TIMES,
  STATUS_MAP,
} from '../data/mockData';

const AVATAR_COLORS = [
  ['#fdf0da','#7a4a06'], ['#e8f0fb','#185fa0'], ['#fdecea','#c0392b'],
  ['#e0f5eb','#1a7a4a'], ['#f0ecfa','#6b4fa0'], ['#e8ecf2','#2d3748'],
];
const PRIORITY_ACTIVE = ['mixing','qc','packing','late','scheduled'];
const NOTE_TYPE_LABELS = { directive:'Chỉ đạo lãnh đạo', change:'Thay đổi kế hoạch', info:'Thông tin bổ sung' };
const NOTE_COLORS = { red:['var(--rdl)','var(--rd)'], orange:['var(--orl)','var(--or)'], blue:['var(--bll)','var(--bl)'] };

export default function OrdersPage() {
  const [tab, setTab]           = useState('orders');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [detail, setDetail]     = useState(null);       // selected order id
  const [showModal, setModal]   = useState(false);
  const [notes, setNotes]       = useState(PRODUCTION_NOTES);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('directive');
  const [noteRef, setNoteRef]   = useState('');
  const [pqOrder, setPqOrder]   = useState(
    ORDERS.filter(o => PRIORITY_ACTIVE.includes(o.status))
          .sort((a, b) => { const m={urgent:0,high:1,normal:2}; return m[a.priority]-m[b.priority]; })
  );

  // ── Filtered orders ──
  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchF = filter === 'all' || o.status === filter;
    return matchQ && matchF;
  });

  const selectedOrder = ORDERS.find(o => o.id === detail);

  // ── Priority queue reorder ──
  function movePQ(idx, dir) {
    const ni = idx + dir;
    if (ni < 0 || ni >= pqOrder.length) return;
    const next = [...pqOrder];
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setPqOrder(next);
  }

  // ── Add note ──
  function addNote() {
    if (!noteText.trim()) return;
    const colorMap = { directive:'red', change:'orange', info:'blue' };
    setNotes(prev => [...prev, {
      id: Date.now(), author:'Nguyễn Văn A', role:'Sales Manager',
      initials:'NV', colorKey: colorMap[noteType] || 'blue',
      ref: noteRef, type: noteType, text: noteText.trim(), time:'Vừa xong',
    }]);
    setNoteText('');
  }

  return (
    <Layout currentPath="/orders" pageTitle="Quản lý đơn hàng" pageMeta="T5 19/05/2026">

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        {[
          { label:'Tổng đơn tháng', value:47,     accent:'var(--am)', delta:'+12% so tháng trước', deltaType:'up' },
          { label:'Đang xử lý',     value:14,     accent:'var(--bl)', delta:'3 lệnh đang chạy',     deltaType:'neu' },
          { label:'Trễ tiến độ',    value:3,      accent:'var(--rd)', delta:'Tăng 1 so hôm qua',    deltaType:'down', valColor:'var(--rd)' },
          { label:'Hoàn thành',     value:'30',   accent:'var(--gn)', delta:'98.5% đúng hạn',       deltaType:'up' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--stat-accent': s.accent }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.valColor }}>{s.value}</div>
            <div className={`stat-delta ${s.deltaType}`}>
              <i className={`ti ti-arrow-${s.deltaType === 'up' ? 'up' : s.deltaType === 'down' ? 'down' : 'minus'}`} style={{ fontSize: 11 }} />
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ── */}
      <div style={{ display:'flex', gap:4, marginBottom:14, background:'white', padding:4, borderRadius:'var(--rl)', border:'1px solid var(--border)', width:'fit-content' }}>
        {[
          { key:'orders',   icon:'ti-clipboard-list', label:'Tất cả đơn hàng',    badge:14 },
          { key:'priority', icon:'ti-arrows-sort',    label:'Ưu tiên sản xuất',   badge:pqOrder.length },
          { key:'notes',    icon:'ti-message-dots',   label:'Ghi chú lãnh đạo',   badge:notes.length, badgeRed:true },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding:'6px 14px', borderRadius:6, fontSize:13, cursor:'pointer',
              border:'none', background: tab === t.key ? 'var(--ink)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--ink3)',
              display:'flex', alignItems:'center', gap:6, transition:'all 0.13s',
            }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize:13 }} aria-hidden="true" />
            {t.label}
            <span style={{
              background: t.badgeRed ? 'var(--rd)' : 'var(--am)',
              color:'white', fontSize:10, fontFamily:'var(--font-mono)',
              padding:'1px 5px', borderRadius:10,
            }}>{t.badge}</span>
          </button>
        ))}
      </div>

      {/* ══ TAB: ALL ORDERS ══ */}
      {tab === 'orders' && (
        <div className="panel">
          {/* Filter bar */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 15px', borderBottom:'1px solid var(--border)', background:'var(--sf)' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:7, background:'white', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'6px 10px' }}>
              <i className="ti ti-search" style={{ fontSize:15, color:'var(--ink4)' }} aria-hidden="true" />
              <input
                style={{ border:'none', background:'transparent', fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink)', outline:'none', width:'100%' }}
                placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {['all','mixing','late','done'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding:'4px 11px', borderRadius:20, fontSize:11.5, cursor:'pointer',
                  border:`1px solid ${filter === f ? 'var(--ink)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--ink)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--ink3)',
                  fontFamily:'var(--font-body)', transition:'all 0.13s',
                }}
              >
                {{ all:'Tất cả', mixing:'Pha chế', late:'Trễ hạn', done:'Hoàn thành' }[f]}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div className="panel-head">
            <div className="panel-title"><i className="ti ti-list" aria-hidden="true" />Danh sách đơn hàng</div>
            <span className="panel-sub">Hiển thị {filtered.length} / {ORDERS.length} đơn</span>
          </div>

          {/* Table */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
              <thead>
                <tr style={{ background:'var(--sf)', borderBottom:'1px solid var(--border)' }}>
                  {['Mã đơn','Khách hàng','Sản phẩm','Số lượng','Trạng thái','Giao hàng',''].map((h, i) => (
                    <th key={i} style={{ padding:'8px 13px', textAlign:'left', fontSize:10.5, fontFamily:'var(--font-mono)', color:'var(--ink4)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const ini = o.client.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0,2);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setDetail(o.id)}
                      style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.1s', background: detail === o.id ? 'var(--aml)' : undefined }}
                      onMouseEnter={e => { if (detail !== o.id) e.currentTarget.style.background='var(--sf)'; }}
                      onMouseLeave={e => { if (detail !== o.id) e.currentTarget.style.background=''; }}
                    >
                      <td style={{ padding:'10px 13px' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--am)', fontWeight:500 }}>{o.id}</span>
                        {o.priority === 'urgent' && <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'1px 4px', borderRadius:8, background:'var(--rdl)', color:'var(--rd)', marginLeft:4 }}>!</span>}
                      </td>
                      <td style={{ padding:'10px 13px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:24, height:24, borderRadius:'50%', background:av[0], color:av[1], display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{ini}</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{o.client.split(' ').slice(0,3).join(' ')}</div>
                            <div style={{ fontSize:11, color:'var(--ink4)' }}>{o.clientCode}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'10px 13px' }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:150 }}>{o.product}</div>
                        <div style={{ fontSize:11, color:'var(--ink4)' }}>{o.color}</div>
                      </td>
                      <td style={{ padding:'10px 13px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--ink2)' }}>{o.qty}</td>
                      <td style={{ padding:'10px 13px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding:'10px 13px' }}><DeadlineText deadline={o.deadline} cls={o.deadlineClass} /></td>
                      <td style={{ padding:'10px 13px' }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-sm amber" onClick={e => { e.stopPropagation(); setDetail(o.id); }}>
                            <i className="ti ti-eye" style={{ fontSize:12 }} />
                          </button>
                          <button className="btn-sm" onClick={e => e.stopPropagation()}>
                            <i className="ti ti-edit" style={{ fontSize:12 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ TAB: PRIORITY QUEUE ══ */}
      {tab === 'priority' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14, alignItems:'start' }}>
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title"><i className="ti ti-arrows-sort" aria-hidden="true" />Hàng đợi sản xuất — theo thứ tự ưu tiên</div>
              <button className="btn-sm amber"><i className="ti ti-device-floppy" style={{ fontSize:12 }} />Lưu thứ tự</button>
            </div>
            <div style={{ padding:'7px 12px', background:'var(--sf)', borderBottom:'1px solid var(--border)', display:'flex', gap:14, alignItems:'center', fontSize:11 }}>
              {[['var(--rd)','Khẩn cấp'],['var(--am)','Cao'],['var(--bl)','Thường']].map(([c,l]) => (
                <span key={l} style={{ display:'flex', alignItems:'center', gap:4, color:'var(--ink3)' }}>
                  <span style={{ width:8, height:8, background:c, borderRadius:'50%', display:'inline-block' }} />
                  {l}
                </span>
              ))}
            </div>
            <div style={{ padding:'10px 14px' }}>
              {pqOrder.map((o, i) => (
                <PriorityCard key={o.id} order={o} rank={i} onUp={() => movePQ(i,-1)} onDown={() => movePQ(i,1)} onView={() => setDetail(o.id)} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="panel">
            <div className="panel-head"><div className="panel-title"><i className="ti ti-info-circle" aria-hidden="true" />Chú giải mức ưu tiên</div></div>
            <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:9 }}>
              {[
                { key:'urgent', color:'var(--rd)', bg:'var(--rdl)', icon:'ti-flame', label:'Khẩn cấp', desc:'Trễ hoặc lãnh đạo chỉ đạo gấp. Dừng lệnh khác nếu cần.' },
                { key:'high',   color:'#7a4a06', bg:'var(--aml)', icon:'ti-arrow-up', label:'Cao', desc:'Khách quan trọng hoặc deadline trong 3 ngày.' },
                { key:'normal', color:'var(--bl)',  bg:'var(--bll)', icon:'ti-minus', label:'Thường', desc:'Sản xuất theo kế hoạch, deadline > 3 ngày.' },
              ].map(p => (
                <div key={p.key} style={{ padding:'10px 12px', background:p.bg, borderRadius:0, borderLeft:`3px solid`, borderColor: p.key==='urgent'?'var(--rd)':p.key==='high'?'var(--am)':'var(--bl)', borderRightWidth:1, borderTopWidth:1, borderBottomWidth:1, borderStyle:'solid', borderRightColor:'transparent', borderTopColor:'transparent', borderBottomColor:'transparent' }}>
                  <div style={{ fontSize:12, fontWeight:500, color:p.color, marginBottom:3, display:'flex', alignItems:'center', gap:5 }}>
                    <i className={`ti ${p.icon}`} style={{ fontSize:13 }} />{p.label}
                  </div>
                  <div style={{ fontSize:11.5, color:p.color, opacity:0.8 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: NOTES ══ */}
      {tab === 'notes' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:14, alignItems:'start' }}>
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title"><i className="ti ti-message-dots" aria-hidden="true" />Ghi chú & chỉ đạo lãnh đạo</div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn-sm"><i className="ti ti-filter" style={{ fontSize:12 }} />Lọc</button>
                <button className="btn-sm"><i className="ti ti-download" style={{ fontSize:12 }} />Xuất</button>
              </div>
            </div>
            <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:9 }}>
              {[...notes].reverse().map(n => <NoteCard key={n.id} note={n} />)}
            </div>
            <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', background:'var(--sf)' }}>
              <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--ink4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Thêm ghi chú mới</div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <select className="form-input" style={{ flex:1, padding:'6px 9px', fontSize:12 }} value={noteRef} onChange={e => setNoteRef(e.target.value)}>
                  <option value="">Gắn với đơn (tuỳ chọn)</option>
                  {ORDERS.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}
                </select>
                <select className="form-input" style={{ flex:1, padding:'6px 9px', fontSize:12 }} value={noteType} onChange={e => setNoteType(e.target.value)}>
                  <option value="directive">Chỉ đạo lãnh đạo</option>
                  <option value="change">Thay đổi kế hoạch</option>
                  <option value="info">Thông tin bổ sung</option>
                </select>
              </div>
              <textarea className="form-input" rows={3} style={{ width:'100%', resize:'none', marginBottom:8 }}
                placeholder="Nhập nội dung chỉ đạo hoặc ghi chú..."
                value={noteText} onChange={e => setNoteText(e.target.value)}
              />
              <button className="btn-primary" style={{ alignSelf:'flex-end' }} onClick={addNote}>
                <i className="ti ti-send" style={{ fontSize:14 }} />Lưu ghi chú
              </button>
            </div>
          </div>

          {/* Note stats */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="panel">
              <div className="panel-head"><div className="panel-title"><i className="ti ti-chart-pie" aria-hidden="true" />Thống kê ghi chú</div></div>
              <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { type:'directive', label:'Chỉ đạo lãnh đạo', bg:'var(--rdl)', color:'var(--rd)', icon:'ti-urgent' },
                  { type:'change',    label:'Thay đổi kế hoạch', bg:'var(--orl)', color:'var(--or)', icon:'ti-refresh' },
                  { type:'info',      label:'Thông tin bổ sung',  bg:'var(--bll)', color:'var(--bl)', icon:'ti-info-circle' },
                ].map(s => (
                  <div key={s.type} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 11px', background:s.bg, borderRadius:'var(--r)' }}>
                    <div style={{ fontSize:12.5, fontWeight:500, color:s.color, display:'flex', alignItems:'center', gap:6 }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize:14 }} />{s.label}
                    </div>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:500, color:s.color }}>
                      {notes.filter(n => n.type === s.type).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETAIL PANEL ══ */}
      {detail && selectedOrder && (
        <div className="detail-panel">
          <div className="detail-head">
            <div>
              <div className="detail-order-id">{selectedOrder.id}</div>
              <div className="detail-name">{selectedOrder.product}</div>
            </div>
            <button className="close-btn" onClick={() => setDetail(null)}><i className="ti ti-x" style={{ fontSize:14 }} /></button>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <div style={{ fontSize:10.5, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink4)', marginBottom:8 }}>Thông tin đơn hàng</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
              {[
                ['Khách hàng', selectedOrder.client],
                ['Ngày giao', selectedOrder.deadline],
                ['Số lượng', selectedOrder.qty],
                ['Trạng thái', null],
              ].map(([label, value], i) => (
                <div key={i} style={{ background:'var(--sf)', borderRadius:'var(--r)', padding:'9px 11px' }}>
                  <div style={{ fontSize:10.5, color:'var(--ink4)', marginBottom:3 }}>{label}</div>
                  {value
                    ? <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)', fontFamily: label==='Số lượng'?'var(--font-mono)':undefined }}>{value}</div>
                    : <StatusBadge status={selectedOrder.status} />
                  }
                </div>
              ))}
            </div>

            <div style={{ fontSize:10.5, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink4)', marginBottom:6 }}>Tiến độ sản xuất</div>
            <div style={{ fontSize:11.5, fontFamily:'var(--font-mono)', color:'var(--ink4)', marginBottom:5 }}>Tiến độ: {selectedOrder.progress}%</div>
            <div style={{ marginBottom:16 }}><ProgressBar value={selectedOrder.progress} /></div>

            <div style={{ fontSize:10.5, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink4)', marginBottom:8 }}>Timeline quy trình</div>
            <div className="timeline" style={{ marginBottom:16 }}>
              {TIMELINE_STEPS.map((step, i) => (
                <div key={i} className="timeline-step">
                  <div className={`timeline-dot ${i < selectedOrder.timelineStep ? 'done' : i === selectedOrder.timelineStep ? 'active' : ''}`} />
                  <div className="timeline-step-name">{step}</div>
                  <div className="timeline-step-time">{i <= selectedOrder.timelineStep ? TIMELINE_TIMES[i] : '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize:10.5, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink4)', marginBottom:6 }}>Ghi chú</div>
            <div style={{ fontSize:13, color:'var(--ink3)', lineHeight:1.6, background:'var(--sf)', padding:'9px 11px', borderRadius:'var(--r)' }}>
              {selectedOrder.note}
            </div>
          </div>
        </div>
      )}

      {/* ══ NEW ORDER MODAL ══ */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">Tạo đơn hàng mới</div>
              <button className="close-btn" onClick={() => setModal(false)}><i className="ti ti-x" style={{ fontSize:14 }} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field"><label className="form-label">Tên khách hàng *</label><input className="form-input" type="text" placeholder="Công ty TNHH ABC" /></div>
                <div className="form-field"><label className="form-label">Mức ưu tiên</label>
                  <select className="form-input"><option>Thường</option><option>Cao</option><option>Khẩn cấp</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field"><label className="form-label">Ngày đặt</label><input className="form-input" type="date" /></div>
                <div className="form-field"><label className="form-label">Ngày giao *</label><input className="form-input" type="date" /></div>
              </div>
              <div className="form-row full">
                <div className="form-field"><label className="form-label">Ghi chú lãnh đạo / Yêu cầu đặc biệt</label>
                  <textarea className="form-input" rows={3} placeholder="Chỉ đạo ưu tiên, đóng gói đặc biệt..." />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={() => setModal(false)}><i className="ti ti-check" style={{ fontSize:14 }} />Tạo đơn hàng</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ── Sub-components ──────────────────────────────────────────

function PriorityCard({ order, rank, onUp, onDown, onView }) {
  const borderColors = { urgent:'var(--rd)', high:'var(--am)', normal:'var(--bl)' };
  const rankStyle = rank === 0 ? { background:'var(--rdl)', color:'var(--rd)' } : rank === 1 ? { background:'var(--aml)', color:'var(--am)' } : { background:'var(--bll)', color:'var(--bl)' };
  const progColor = borderColors[order.priority];
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:'var(--r)', border:'1px solid var(--border)', borderLeft:`3px solid ${borderColors[order.priority]}`, background:'white', marginBottom:8, cursor:'pointer' }}>
      <div style={{ width:22, height:22, borderRadius:'50%', ...rankStyle, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:500, flexShrink:0, marginTop:1 }}>{rank+1}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10.5, color:'var(--am)', marginBottom:1 }}>{order.id}</div>
        <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.product}</div>
        <div style={{ fontSize:11, color:'var(--ink4)', marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
          <span>{order.client.split(' ').slice(0,3).join(' ')}</span>
          <span>·</span>
          <span style={{ color: order.deadlineClass==='late'?'var(--rd)':order.deadlineClass==='warn'?'var(--am)':'var(--ink4)' }}>Giao {order.deadline}</span>
          <PriorityBadge priority={order.priority} />
        </div>
        <div style={{ background:'var(--sf3)', borderRadius:2, height:3, marginTop:6 }}>
          <div style={{ height:'100%', borderRadius:2, background:progColor, width:`${order.progress}%`, transition:'width 0.4s' }} />
        </div>
        <div style={{ fontSize:10.5, color:'var(--ink4)', fontFamily:'var(--font-mono)', marginTop:3 }}>{order.progress}% hoàn thành · {order.qty}</div>
        <div style={{ display:'flex', gap:5, marginTop:7 }}>
          <button className="btn-icon" style={{ width:24, height:24 }} onClick={onUp} title="Tăng ưu tiên"><i className="ti ti-arrow-up" style={{ fontSize:12 }} /></button>
          <button className="btn-icon" style={{ width:24, height:24 }} onClick={onDown} title="Giảm ưu tiên"><i className="ti ti-arrow-down" style={{ fontSize:12 }} /></button>
          <button className="btn-sm amber" style={{ fontSize:11, padding:'3px 8px' }} onClick={onView}>Xem chi tiết</button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note }) {
  const typeColors = { directive:['var(--rdl)','var(--rd)'], change:['var(--orl)','var(--or)'], info:['var(--bll)','var(--bl)'] };
  const [bg, border] = typeColors[note.type] || typeColors.info;
  const avColors = { red:['var(--rdl)','var(--rd)'], orange:['var(--orl)','var(--or)'], blue:['var(--bll)','var(--bl)'] };
  const [avBg, avColor] = avColors[note.colorKey] || avColors.blue;
  return (
    <div style={{ borderRadius:'var(--r)', border:'1px solid var(--border)', borderLeft:`3px solid ${border}`, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 11px', background:'var(--sf)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:22, height:22, borderRadius:'50%', background:avBg, color:avColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{note.initials}</div>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)' }}>{note.author}</div>
            <div style={{ fontSize:10.5, color:'var(--ink4)', fontFamily:'var(--font-mono)' }}>{note.role} · {note.time}</div>
          </div>
        </div>
        <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'2px 7px', borderRadius:10, background:bg, color:border }}>
          {NOTE_TYPE_LABELS[note.type]}
        </span>
      </div>
      <div style={{ padding:'8px 11px' }}>
        {note.ref && <div style={{ fontSize:10.5, color:'var(--am)', fontFamily:'var(--font-mono)', marginBottom:3 }}>→ {note.ref}</div>}
        <div style={{ fontSize:13, color:'var(--ink2)', lineHeight:1.55 }}>{note.text}</div>
      </div>
    </div>
  );
}
