// src/pages/KanbanPage.jsx — 6 cột mới: Nhận đơn → Đã duyệt → Duyệt SX → Đang SX → Hoàn thành → Đã giao

import { useState } from 'react';
import Layout from '../components/Layout';
import { PriorityBadge, ProgressBar } from '../components/Badges';
import {
  KANBAN_CARDS as INIT_CARDS,
  KANBAN_COLS, KANBAN_COL_LABELS, KANBAN_COL_NEXT,
} from '../data/mockData';

const COL_CONFIG = {
  waiting:   { dot:'var(--ink4)', bg:'#f8f6f3', head:'#e8e4df' },
  approved:  { dot:'var(--bl)',   bg:'#f0f5fd', head:'#dce8f8' },
  scheduled: { dot:'var(--pu)',   bg:'#f5f0fd', head:'#e6d9f8' },
  running:   { dot:'var(--am)',   bg:'#fdf8f0', head:'#f8ead0' },
  done:      { dot:'var(--gn)',   bg:'#f0faf4', head:'#d0f0e0' },
  delivered: { dot:'#2d3748',    bg:'#f5f5f5', head:'#e0e0e0' },
};

const TEAM_COLORS = [
  ['#fdf0da','#7a4a06'],['#e8f0fb','#1a5fa0'],
  ['#e1f5ee','#0f6e56'],['#f0ecfa','#6b4fa0'],
];

function teamColor(team) {
  const n = parseInt(team.match(/\d/)?.[0] || 1) - 1;
  return TEAM_COLORS[Math.max(0,n) % TEAM_COLORS.length];
}

export default function KanbanPage() {
  const [cards, setCards]   = useState(INIT_CARDS.map(c => ({ ...c, log:[...c.log] })));
  const [dragging, setDrag] = useState(null);
  const [dragOver, setOver] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showModal, setModal] = useState(false);
  const [shift, setShift]   = useState('morning');

  const cardsOf = col => cards.filter(c => c.col === col);
  const selected = cards.find(c => c.id === detail);

  function moveCard(id, toCol) {
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c;
      const prog = toCol==='delivered'||toCol==='done' ? 100 : toCol==='running' ? Math.max(c.progress,10) : c.progress;
      return { ...c, col:toCol, progress:prog,
        log:[...c.log, { t:'Vừa xong', text:`Chuyển sang: ${KANBAN_COL_LABELS[toCol]}`, color: COL_CONFIG[toCol]?.dot||'#888' }] };
    }));
  }

  function advanceCard(id) {
    const card = cards.find(c => c.id===id);
    if (!card || card.col==='delivered') return;
    moveCard(id, KANBAN_COL_NEXT[card.col]);
  }

  function saveNewCard(data) {
    const newId = `LS-${String(cards.length+1).padStart(3,'0')}`;
    setCards(prev => [...prev, {
      id:newId, orderId:data.orderId, product:data.product, color:data.color||'—',
      qty:parseInt(data.qty)||0, team:data.team, machine:data.machine,
      deadline:data.deadline||'—', priority:data.priority, col:'waiting', progress:0,
      note:data.note||'', specs:{viscosity:'—',pH:'—',temp:'25°C',speed:'—'},
      log:[{t:'Vừa xong',text:'Lệnh được tạo',color:'#1a5fa0'}],
    }]);
    setModal(false);
  }

  const SHIFTS = [{v:'morning',l:'Ca sáng 06:00–14:00'},{v:'afternoon',l:'Ca chiều 14:00–22:00'},{v:'night',l:'Ca đêm 22:00–06:00'}];

  return (
    <Layout currentPath="/kanban" pageTitle="Lệnh sản xuất" pageMeta="Kanban · 19/05/2026">

      {/* Topbar actions */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:4,background:'var(--sf)',borderRadius:8,padding:3,border:'1px solid var(--border)'}}>
          {SHIFTS.map(s=>(
            <button key={s.v} onClick={()=>setShift(s.v)}
              style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)',
                background:shift===s.v?'var(--am)':'transparent',color:shift===s.v?'white':'var(--ink3)',fontWeight:shift===s.v?500:400,transition:'all .15s'}}>
              {s.l}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={()=>setModal(true)}>
          <i className="ti ti-plus" style={{fontSize:13}}/> Tạo lệnh mới
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[
          {label:'Đang sản xuất',val:cardsOf('running').length,color:'var(--am)'},
          {label:'Chờ vào lệnh', val:cardsOf('waiting').length+cardsOf('approved').length,color:'var(--bl)'},
          {label:'Hoàn thành hôm nay',val:cardsOf('done').length+cardsOf('delivered').length,color:'var(--gn)'},
        ].map((s,i)=>(
          <div key={i} style={{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',display:'flex',alignItems:'center',gap:8,minWidth:160}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:s.color,flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,color:'var(--ink4)',fontFamily:'var(--font-mono)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:'var(--font-mono)'}}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban board — 6 cột */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,minmax(180px,1fr))',gap:10,overflowX:'auto',paddingBottom:8}}>
        {KANBAN_COLS.map(col => {
          const cfg = COL_CONFIG[col];
          const colCards = cardsOf(col);
          return (
            <div key={col}
              onDragOver={e=>{e.preventDefault();setOver(col);}}
              onDrop={e=>{e.preventDefault();if(dragging)moveCard(dragging,col);setDrag(null);setOver(null);}}
              onDragLeave={()=>setOver(null)}
              style={{background:dragOver===col?'rgba(200,117,10,0.06)':cfg.bg,borderRadius:10,border:`1.5px solid ${dragOver===col?'var(--am)':'var(--border)'}`,transition:'all .15s',minHeight:400}}>

              {/* Column header */}
              <div style={{background:cfg.head,borderRadius:'8px 8px 0 0',padding:'9px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:cfg.dot}}/>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--ink)',fontFamily:'var(--font-body)'}}>{KANBAN_COL_LABELS[col]}</span>
                </div>
                <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--ink3)',background:'rgba(255,255,255,0.6)',padding:'1px 6px',borderRadius:20}}>{colCards.length}</span>
              </div>

              {/* Cards */}
              <div style={{padding:'8px 6px',display:'flex',flexDirection:'column',gap:6}}>
                {colCards.map(card => {
                  const [tcBg,tcTxt] = teamColor(card.team);
                  const isLate = card.priority==='urgent' && !['done','delivered'].includes(card.col);
                  return (
                    <div key={card.id}
                      draggable
                      onDragStart={()=>setDrag(card.id)}
                      onDragEnd={()=>setDrag(null)}
                      onClick={()=>setDetail(detail===card.id?null:card.id)}
                      style={{background:'white',borderRadius:8,padding:'10px',cursor:'grab',
                        border:`1.5px solid ${isLate?'rgba(192,57,43,0.35)':detail===card.id?'var(--am)':'var(--border)'}`,
                        boxShadow:dragging===card.id?'0 4px 16px rgba(0,0,0,0.12)':'0 1px 3px rgba(0,0,0,0.06)',
                        transition:'all .13s',opacity:dragging===card.id?0.6:1}}>

                      {/* Card header */}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                        <span style={{fontSize:10.5,fontFamily:'var(--font-mono)',color:'var(--am)',fontWeight:500}}>{card.id}</span>
                        <PriorityBadge priority={card.priority}/>
                      </div>

                      {/* Product */}
                      <div style={{fontSize:12.5,fontWeight:600,color:'var(--ink)',marginBottom:3,lineHeight:1.3}}>{card.product}</div>
                      <div style={{fontSize:11,color:'var(--ink4)',marginBottom:6}}>{card.color} · {card.qty.toLocaleString()} {card.qty<100?'kg':'lít'}</div>

                      {/* Team tag */}
                      <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:6}}>
                        <span style={{fontSize:10.5,padding:'2px 7px',borderRadius:20,background:tcBg,color:tcTxt,fontWeight:500}}>{card.team}</span>
                        <span style={{fontSize:10,color:'var(--ink4)',fontFamily:'var(--font-mono)'}}>{card.machine}</span>
                      </div>

                      {/* Progress */}
                      {card.progress>0 && (
                        <div style={{marginBottom:6}}>
                          <ProgressBar value={card.progress} color={isLate?'var(--rd)':col==='running'?'var(--am)':'var(--gn)'}/>
                          <div style={{fontSize:10,color:'var(--ink4)',textAlign:'right',marginTop:2,fontFamily:'var(--font-mono)'}}>{card.progress}%</div>
                        </div>
                      )}

                      {/* Deadline + advance btn */}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                        <span style={{fontSize:10.5,color:isLate?'var(--rd)':'var(--ink4)',display:'flex',alignItems:'center',gap:3}}>
                          <i className="ti ti-calendar" style={{fontSize:11}}/>{card.deadline}
                        </span>
                        {card.col!=='delivered' && (
                          <button onClick={e=>{e.stopPropagation();advanceCard(card.id);}}
                            style={{padding:'3px 8px',borderRadius:5,border:'1px solid var(--am)',background:'var(--aml)',color:'var(--am)',fontSize:10.5,cursor:'pointer',fontWeight:500}}>
                            Tiếp →
                          </button>
                        )}
                      </div>

                      {/* Late warning */}
                      {isLate && (
                        <div style={{marginTop:5,fontSize:10.5,color:'var(--rd)',background:'rgba(192,57,43,0.07)',borderRadius:5,padding:'3px 7px'}}>
                          <i className="ti ti-alert-triangle" style={{fontSize:11}}/> Trễ hạn
                        </div>
                      )}

                      {/* Expanded detail */}
                      {detail===card.id && (
                        <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--border)'}}>
                          <div style={{fontSize:11,color:'var(--ink4)',marginBottom:4}}>Đơn hàng: <span style={{color:'var(--am)',fontFamily:'var(--font-mono)'}}>{card.orderId}</span></div>
                          {card.note && <div style={{fontSize:11,color:'var(--ink3)',marginBottom:6,lineHeight:1.4}}>{card.note}</div>}
                          <div style={{fontSize:10,color:'var(--ink4)',fontFamily:'var(--font-mono)',marginBottom:4}}>NHẬT KÝ</div>
                          {card.log.slice(-3).map((l,i)=>(
                            <div key={i} style={{fontSize:10.5,display:'flex',gap:6,marginBottom:2}}>
                              <span style={{color:'var(--ink4)',flexShrink:0}}>{l.t}</span>
                              <span style={{color:l.color||'var(--ink3)'}}>{l.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {colCards.length===0 && (
                  <div style={{padding:'20px 8px',textAlign:'center',color:'var(--ink4)',fontSize:12}}>
                    <i className="ti ti-inbox" style={{fontSize:20,display:'block',marginBottom:4,opacity:0.4}}/> Không có lệnh
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal tạo lệnh mới */}
      {showModal && <NewCardModal onSave={saveNewCard} onClose={()=>setModal(false)}/>}
    </Layout>
  );
}

function NewCardModal({ onSave, onClose }) {
  const [f, setF] = useState({ orderId:'', product:'', color:'', qty:'', team:'Tổ 1 – Nguyễn Văn B', machine:'MT-01', deadline:'', priority:'normal', note:'' });
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',borderRadius:12,padding:'24px 28px',width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div style={{fontFamily:'var(--font-head)',fontSize:16,fontWeight:700,color:'var(--ink)'}}>Tạo lệnh sản xuất mới</div>
          <button onClick={onClose} style={{border:'none',background:'transparent',cursor:'pointer',fontSize:18,color:'var(--ink4)'}}>✕</button>
        </div>

        {[
          {label:'Mã đơn hàng',k:'orderId',placeholder:'DH-2605-XXX'},
          {label:'Sản phẩm',k:'product',placeholder:'Tên sản phẩm sơn'},
          {label:'Màu sơn',k:'color',placeholder:'VD: Trắng kem'},
          {label:'Số lượng (lít/kg)',k:'qty',placeholder:'500'},
          {label:'Hạn giao',k:'deadline',placeholder:'DD/MM/YYYY'},
          {label:'Ghi chú',k:'note',placeholder:'Lưu ý khi pha chế...'},
        ].map(({label,k,placeholder})=>(
          <div key={k} style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:500,color:'var(--ink3)',display:'block',marginBottom:4}}>{label}</label>
            <input value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
              style={{width:'100%',padding:'8px 11px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'var(--font-body)',outline:'none',color:'var(--ink)'}}/>
          </div>
        ))}

        {[{label:'Tổ sản xuất',k:'team',opts:['Tổ 1 – Nguyễn Văn B','Tổ 2 – Lê Thị C','Tổ 3 – Phạm Văn D','Tổ 4 – Hoàng Thị E']},
          {label:'Máy',k:'machine',opts:['MT-01','MT-02','MT-03','MT-04']},
          {label:'Ưu tiên',k:'priority',opts:['normal','high','urgent']},
        ].map(({label,k,opts})=>(
          <div key={k} style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:500,color:'var(--ink3)',display:'block',marginBottom:4}}>{label}</label>
            <select value={f[k]} onChange={e=>set(k,e.target.value)}
              style={{width:'100%',padding:'8px 11px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'var(--font-body)',outline:'none',color:'var(--ink)',background:'white'}}>
              {opts.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:'9px',border:'1px solid var(--border)',borderRadius:6,background:'white',cursor:'pointer',fontSize:13,color:'var(--ink3)'}}>Hủy</button>
          <button onClick={()=>onSave(f)} className="btn-primary" style={{flex:2,justifyContent:'center'}}>Tạo lệnh</button>
        </div>
      </div>
    </div>
  );
}
