// src/pages/DashboardPage.jsx
// Dashboard ưu tiên: Đang sản xuất + Kế hoạch SX → thấy ngay tình hình

import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge, ProgressBar } from '../components/Badges';
import { ORDERS, KANBAN_CARDS } from '../data/mockData';

const NOW_DATE  = 'Thứ 5, 19/05/2026';

// ── Helpers ──────────────────────────────────────────────
function kpiCard(label, value, sub, accent='var(--am)', icon='ti-chart-bar') {
  return (
    <div className="stat-card" style={{'--stat-accent':accent}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div className="stat-label">{label}</div>
        <i className={`ti ${icon}`} style={{fontSize:15,color:accent,opacity:0.5}}/>
      </div>
      <div className="stat-value" style={{color:accent}}>{value}</div>
      {sub && <div style={{fontSize:11,color:'var(--ink4)',marginTop:2}}>{sub}</div>}
    </div>
  );
}

const TEAM_COLORS = [
  ['#fdf0da','#7a4a06'],['#e8f0fb','#1a5fa0'],
  ['#e1f5ee','#0f6e56'],['#f0ecfa','#6b4fa0'],
];
function teamColor(team) {
  const n = parseInt(team.match(/\d/)?.[0]||1)-1;
  return TEAM_COLORS[Math.max(0,n)%TEAM_COLORS.length];
}

// ── Main Component ────────────────────────────────────────
export default function DashboardPage() {
  const chartRef   = useRef(null);
  const donutRef   = useRef(null);
  const [shift, setShift] = useState('morning');

  const running   = KANBAN_CARDS.filter(c=>c.col==='running');
  const scheduled = KANBAN_CARDS.filter(c=>['approved','scheduled'].includes(c.col));
  const done      = KANBAN_CARDS.filter(c=>['done','delivered'].includes(c.col));
  const lateOrders = ORDERS.filter(o=>o.deadlineClass==='late');
  const totalRunQty = running.reduce((s,c)=>s+c.qty,0);

  // ── Chart.js line chart ──────────────────────────────
  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;
    const existing = window.Chart.getChart(chartRef.current);
    if (existing) existing.destroy();
    new window.Chart(chartRef.current, {
      type:'line',
      data:{
        labels:['T2','T3','T4','T5','T6','T7','CN'],
        datasets:[
          { label:'Sản lượng (kg)', data:[3200,4100,3800,4820,null,null,null],
            borderColor:'#c8750a',backgroundColor:'rgba(200,117,10,0.08)',
            tension:0.4,pointRadius:4,pointBackgroundColor:'#c8750a',fill:true },
          { label:'Kế hoạch (kg)', data:[4000,4000,4000,4000,4000,4000,4000],
            borderColor:'rgba(26,23,20,0.2)',borderDash:[5,5],tension:0,pointRadius:0,fill:false },
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:true,position:'top',labels:{font:{family:"'DM Mono', monospace",size:11},boxWidth:12}}},
        scales:{
          x:{grid:{display:false},ticks:{font:{family:"'DM Mono', monospace",size:11}}},
          y:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{font:{family:"'DM Mono', monospace",size:11}}},
        }
      }
    });
  }, []);

  // ── Donut chart ──────────────────────────────────────
  useEffect(() => {
    if (!window.Chart || !donutRef.current) return;
    const existing = window.Chart.getChart(donutRef.current);
    if (existing) existing.destroy();
    const counts = ORDERS.reduce((acc,o)=>{acc[o.status]=(acc[o.status]||0)+1;return acc;},{});
    new window.Chart(donutRef.current, {
      type:'doughnut',
      data:{
        labels:['Đang pha chế','Kiểm định QC','Đóng gói','Trễ tiến độ','Lập lệnh','Hoàn thành'],
        datasets:[{data:[counts.mixing||5,counts.qc||3,counts.packing||3,counts.late||3,counts.scheduled||3,counts.done||30],
          backgroundColor:['#c8750a','#6b4fa0','#c9a800','#c0392b','#1a5fa0','#1a7a4a'],
          borderWidth:2,borderColor:'white'}]
      },
      options:{
        responsive:true,maintainAspectRatio:false,cutout:'70%',
        plugins:{legend:{display:true,position:'right',labels:{font:{family:"'DM Mono', monospace",size:11},boxWidth:12,padding:8}}}
      }
    });
  }, []);

  return (
    <Layout currentPath="/" pageTitle="Dashboard tổng quan" pageMeta={`${NOW_DATE} · Ca ${shift==='morning'?'sáng':shift==='afternoon'?'chiều':'đêm'}`}>

      {/* ── KPI ROW ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {kpiCard('Đang sản xuất', running.length + ' lệnh', `${totalRunQty.toLocaleString()} lít/kg đang pha`, 'var(--am)', 'ti-flask')}
        {kpiCard('Chờ vào lệnh', scheduled.length + ' đơn', 'Cần lên lịch sản xuất', 'var(--bl)', 'ti-clock')}
        {kpiCard('Hoàn thành hôm nay', done.length + ' lệnh', '+8% so hôm qua', 'var(--gn)', 'ti-check')}
        {kpiCard('Đơn trễ tiến độ', lateOrders.length + ' đơn', 'Cần xử lý trước 17:00', 'var(--rd)', 'ti-alert-triangle')}
      </div>

      {/* ══ HÀNG CHÍNH: ĐANG SẢN XUẤT + KẾ HOẠCH ══ */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>

        {/* Đang sản xuất — bảng lớn nổi bật */}
        <div className="panel" style={{border:'2px solid rgba(200,117,10,0.3)',background:'#fffcf7'}}>
          <div className="panel-head">
            <div className="panel-title" style={{color:'var(--am)'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:'var(--am)',display:'inline-block',marginRight:4,animation:'pulse 1.5s infinite'}}/>
              Đang sản xuất ngay lúc này
            </div>
            <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--am)',background:'rgba(200,117,10,0.1)',padding:'2px 8px',borderRadius:20}}>{running.length} lệnh</span>
          </div>

          {running.length===0 ? (
            <div style={{padding:'24px',textAlign:'center',color:'var(--ink4)',fontSize:13}}>Không có lệnh đang chạy</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {running.map((c,i) => {
                const [tcBg,tcTxt] = teamColor(c.team);
                const isLate = c.priority==='urgent';
                return (
                  <div key={c.id} style={{padding:'12px 16px',borderBottom:i<running.length-1?'1px solid rgba(200,117,10,0.1)':undefined,
                    background:isLate?'rgba(192,57,43,0.04)':'transparent'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:7}}>
                        <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--am)',fontWeight:500}}>{c.id}</span>
                        <PriorityBadge priority={c.priority}/>
                        {isLate && <span style={{fontSize:10,color:'var(--rd)',background:'rgba(192,57,43,0.1)',padding:'1px 6px',borderRadius:20}}>⚠ Trễ</span>}
                      </div>
                      <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--ink4)'}}>HĐ: {c.deadline}</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:3}}>{c.product}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:tcBg,color:tcTxt}}>{c.team}</span>
                      <span style={{fontSize:11,color:'var(--ink4)',fontFamily:'var(--font-mono)'}}>{c.machine}</span>
                      <span style={{fontSize:11,color:'var(--ink4)'}}>{c.qty.toLocaleString()} lít</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1}}><ProgressBar value={c.progress} color={isLate?'var(--rd)':'var(--am)'}/></div>
                      <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--am)',fontWeight:500,minWidth:30,textAlign:'right'}}>{c.progress}%</span>
                    </div>
                    {c.specs?.viscosity!=='—' && (
                      <div style={{marginTop:5,fontSize:10.5,color:'var(--ink4)',fontFamily:'var(--font-mono)',display:'flex',gap:10,flexWrap:'wrap'}}>
                        <span>Độ nhớt: {c.specs.viscosity}</span>
                        <span>pH: {c.specs.pH}</span>
                        <span>Nhiệt độ: {c.specs.temp}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kế hoạch sản xuất */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <i className="ti ti-calendar-event" aria-hidden="true"/>
              Kế hoạch sản xuất sắp tới
            </div>
            <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--bl)',background:'rgba(26,95,160,0.1)',padding:'2px 8px',borderRadius:20}}>{scheduled.length} đơn chờ</span>
          </div>

          {scheduled.length===0 ? (
            <div style={{padding:'24px',textAlign:'center',color:'var(--ink4)',fontSize:13}}>Không có đơn chờ</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {scheduled.map((c,i) => {
                const [tcBg,tcTxt] = teamColor(c.team);
                return (
                  <div key={c.id} style={{padding:'11px 16px',borderBottom:i<scheduled.length-1?'1px solid var(--border)':undefined}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--bl)',fontWeight:500}}>{c.id}</span>
                        <PriorityBadge priority={c.priority}/>
                      </div>
                      <span style={{fontSize:11,padding:'1px 7px',borderRadius:20,
                        background:c.col==='scheduled'?'rgba(107,79,160,0.1)':'rgba(26,95,160,0.1)',
                        color:c.col==='scheduled'?'var(--pu)':'var(--bl)',fontFamily:'var(--font-mono)',fontSize:10.5}}>
                        {c.col==='scheduled'?'Duyệt SX':'Đã duyệt đơn'}
                      </span>
                    </div>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',marginBottom:3}}>{c.product}</div>
                    <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                      <span style={{fontSize:10.5,padding:'2px 7px',borderRadius:20,background:tcBg,color:tcTxt}}>{c.team}</span>
                      <span style={{fontSize:10.5,color:'var(--ink4)',fontFamily:'var(--font-mono)'}}>{c.qty.toLocaleString()} lít</span>
                      <span style={{fontSize:10.5,color:'var(--ink4)'}}>HĐ: {c.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ HÀNG 2: Biểu đồ + Trạng thái đơn ══ */}
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12,marginBottom:14}}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title"><i className="ti ti-chart-line" aria-hidden="true"/>Sản lượng 7 ngày (kg)</div></div>
          <div style={{height:180,padding:'0 8px 8px'}}><canvas ref={chartRef}/></div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="panel-title"><i className="ti ti-chart-donut" aria-hidden="true"/>Trạng thái đơn T5/2026</div></div>
          <div style={{height:180,padding:'0 8px 8px'}}><canvas ref={donutRef}/></div>
        </div>
      </div>

      {/* ══ HÀNG 3: Đơn trễ + Công suất xưởng ══ */}
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12}}>
        {/* Đơn trễ */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title" style={{color:'var(--rd)'}}><i className="ti ti-alert-triangle" aria-hidden="true"/>Đơn hàng cần xử lý gấp</div>
          </div>
          {lateOrders.length===0 ? (
            <div style={{padding:'16px',textAlign:'center',color:'var(--gn)',fontSize:13}}>✓ Không có đơn trễ</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'var(--sf)'}}>
                {['Mã đơn','Khách hàng','Sản phẩm','Hạn giao','Tiến độ'].map((h,i)=>(
                  <th key={i} style={{padding:'7px 12px',textAlign:'left',fontSize:10.5,fontFamily:'var(--font-mono)',color:'var(--ink4)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {lateOrders.map(o=>(
                  <tr key={o.id} style={{borderBottom:'1px solid var(--border)',background:'rgba(192,57,43,0.03)'}}>
                    <td style={{padding:'9px 12px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--rd)',fontWeight:500}}>{o.id}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--ink)'}}>{o.client}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--ink3)'}}>{o.product}</td>
                    <td style={{padding:'9px 12px',fontSize:11,color:'var(--rd)',fontFamily:'var(--font-mono)'}}>{o.deadline}</td>
                    <td style={{padding:'9px 12px',minWidth:80}}><ProgressBar value={o.progress} color='var(--rd)'/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Công suất xưởng */}
        <div className="panel">
          <div className="panel-head"><div className="panel-title"><i className="ti ti-building-factory" aria-hidden="true"/>Công suất xưởng · Ca sáng</div></div>
          <div style={{padding:'4px 0'}}>
            {[
              {name:'Tổ 1 – Nguyễn Văn B', pct:88, color:'var(--am)'},
              {name:'Tổ 2 – Lê Thị C',     pct:72, color:'var(--bl)'},
              {name:'Tổ 3 – Phạm Văn D',   pct:95, color:'var(--gn)'},
              {name:'Phòng QC',             pct:60, color:'var(--pu)'},
            ].map((t,i)=>(
              <div key={i} style={{padding:'9px 16px',borderBottom:i<3?'1px solid var(--border)':undefined}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12,color:'var(--ink)'}}>{t.name}</span>
                  <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:t.color,fontWeight:500}}>{t.pct}%</span>
                </div>
                <ProgressBar value={t.pct} color={t.color}/>
              </div>
            ))}
          </div>
        </div>
      </div>

    </Layout>
  );
}
