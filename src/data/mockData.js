// ============================================================
// PaintFlow — Mock Data Layer (swap ra API thật tại đây)
// ============================================================

export const ORDERS = [
  { id:'DH-2605-001', client:'Cty TNHH Xây Dựng Bình Minh', clientCode:'KH-0045', product:'Sơn ngoại thất siêu bền', color:'Xanh dương biển', qty:'1.200 kg', status:'mixing', deadline:'22/05/2026', deadlineClass:'warn', progress:55, note:'Ưu tiên sản xuất, giao trước 8h sáng.', timelineStep:2, priority:'urgent' },
  { id:'DH-2605-002', client:'Tập đoàn Hoàng Anh Land',       clientCode:'KH-0012', product:'Sơn lót chống thấm',       color:'Trắng kem',         qty:'3.500 lít', status:'qc',      deadline:'24/05/2026', deadlineClass:'ok',   progress:80, note:'Kiểm định độ pH theo TCVN 5670.',        timelineStep:3, priority:'high'   },
  { id:'DH-2605-003', client:'Công ty CP Nội Thất Việt',       clientCode:'KH-0089', product:'Sơn nội thất cao cấp',    color:'Vàng nhạt',         qty:'800 kg',    status:'late',    deadline:'18/05/2026', deadlineClass:'late', progress:30, note:'Trễ do thiếu TiO2.',                    timelineStep:2, priority:'urgent' },
  { id:'DH-2605-004', client:'Sở Xây Dựng TP.HCM',            clientCode:'KH-0003', product:'Sơn kẻ đường giao thông', color:'Trắng phản quang',  qty:'5.000 kg',  status:'scheduled',deadline:'30/05/2026', deadlineClass:'ok',   progress:10, note:'Dự án sơn đường Quận 7, 3 đợt.',        timelineStep:1, priority:'normal' },
  { id:'DH-2605-005', client:'Cty TNHH Decor Homes',           clientCode:'KH-0067', product:'Sơn bóng cao cấp epoxy',  color:'Xám xi măng',       qty:'600 lít',   status:'packing', deadline:'20/05/2026', deadlineClass:'warn', progress:92, note:'Đóng thùng 20L, dán nhãn KH-0067.',     timelineStep:4, priority:'high'   },
  { id:'DH-2605-006', client:'Cty CP Nhà Đẹp 365',             clientCode:'KH-0023', product:'Sơn chống nóng mái tôn', color:'Bạc nhũ',           qty:'2.000 kg',  status:'done',    deadline:'15/05/2026', deadlineClass:'ok',   progress:100,note:'Đã giao đủ, khách hài lòng.',           timelineStep:5, priority:'normal' },
  { id:'DH-2605-007', client:'Tổng Công Ty Vinaconex',         clientCode:'KH-0007', product:'Sơn Silicate khoáng chất',color:'Đá granit',         qty:'4.200 kg',  status:'mixing',  deadline:'27/05/2026', deadlineClass:'ok',   progress:40, note:'Công thức FK-07, giám sát kỹ.',         timelineStep:2, priority:'high'   },
  { id:'DH-2605-008', client:'Cty TNHH Bảo Ngọc',             clientCode:'KH-0098', product:'Sơn cửa sắt chống rỉ',   color:'Xanh lá',           qty:'350 kg',    status:'new',     deadline:'02/06/2026', deadlineClass:'ok',   progress:0,  note:'Đơn mới, chờ lập lệnh sản xuất.',      timelineStep:0, priority:'normal' },
];

export const TIMELINE_STEPS = [
  'Tiếp nhận đơn', 'Lập lệnh SX', 'Pha chế & trộn', 'Kiểm định QC', 'Đóng gói & xuất kho',
];

export const TIMELINE_TIMES = [
  '19/05 08:30', '19/05 09:15', '19/05 11:00', '19/05 15:30', '20/05 08:00',
];

export const PRODUCTION_NOTES = [
  { id:1, author:'Trần Minh Khoa', role:'Giám đốc SX', initials:'TK', colorKey:'red',    ref:'DH-2605-003', type:'directive', text:'Ưu tiên tuyệt đối DH-2605-003. Khách là đối tác chiến lược, phải giao trước 20/05 bằng mọi giá. Điều chuyển nhân lực từ tổ 2 nếu cần.', time:'Hôm nay 07:30' },
  { id:2, author:'Lê Thị Hương',   role:'Phó Giám đốc', initials:'LH', colorKey:'orange', ref:'DH-2605-001', type:'change',    text:'Thay đổi thông số pha DH-2605-001: tăng tỷ lệ binder thêm 2% so với công thức gốc. Trưởng ca xác nhận với phòng kỹ thuật trước khi pha.', time:'Hôm nay 09:12' },
  { id:3, author:'Trần Minh Khoa', role:'Giám đốc SX', initials:'TK', colorKey:'red',    ref:'',            type:'directive', text:'Từ tuần tới tất cả đơn trên 2.000 kg phải có phiếu QC đôi (2 KTV ký). Áp dụng ngay từ DH-2605-004.', time:'Hôm nay 11:45' },
];

export const KANBAN_CARDS = [
  { id:'LS-001', orderId:'DH-2605-008', product:'Sơn cửa sắt chống rỉ',    color:'Xanh lá RAL-6005',   qty:350,  team:'Tổ 2 – Lê Thị C',          machine:'MT-03', deadline:'02/06/2026', priority:'normal', col:'approved', progress:0,  note:'Pha theo tỷ lệ chuẩn A-12.', specs:{ viscosity:'—', pH:'—', temp:'25°C', speed:'—' }, log:[{ t:'19/05 08:00', text:'Lệnh được tạo từ DH-2605-008', color:'#1a5fa0' }] },
  { id:'LS-002', orderId:'DH-2605-004', product:'Sơn kẻ đường giao thông', color:'Trắng phản quang',    qty:1200, team:'Tổ 1 – Nguyễn Văn B',       machine:'MT-01', deadline:'30/05/2026', priority:'normal', col:'scheduled', progress:0,  note:'Đợt 1/3. Thêm chất phản quang MG-02.', specs:{ viscosity:'—', pH:'—', temp:'28°C', speed:'—' }, log:[{ t:'19/05 07:45', text:'Lệnh đợt 1 được tạo', color:'#1a5fa0' }] },
  { id:'LS-003', orderId:'DH-2605-001', product:'Sơn ngoại thất siêu bền', color:'Xanh dương biển',     qty:1200, team:'Tổ 1 – Nguyễn Văn B',       machine:'MT-01', deadline:'22/05/2026', priority:'urgent', col:'running', progress:55, note:'LĐ yêu cầu giao trước 8h 22/05.', specs:{ viscosity:'92 KU', pH:'8.2', temp:'32°C', speed:'800 rpm' }, log:[{ t:'19/05 06:15', text:'Bắt đầu pha chế ca sáng', color:'#c8750a' }, { t:'19/05 08:30', text:'Đạt 50% sản lượng', color:'#c8750a' }] },
  { id:'LS-004', orderId:'DH-2605-007', product:'Sơn Silicate khoáng chất',color:'Đá granit',           qty:1500, team:'Tổ 3 – Phạm Văn D',         machine:'MT-02', deadline:'27/05/2026', priority:'high',   col:'running', progress:40, note:'Công thức FK-07, giám sát liên tục.', specs:{ viscosity:'105 KU', pH:'9.1', temp:'29°C', speed:'650 rpm' }, log:[{ t:'19/05 07:00', text:'Bắt đầu pha lô 1', color:'#c8750a' }] },
  { id:'LS-005', orderId:'DH-2605-003', product:'Sơn nội thất cao cấp',    color:'Vàng nhạt RAL-1013',  qty:800,  team:'Tổ 2 – Lê Thị C',          machine:'MT-04', deadline:'18/05/2026', priority:'urgent', col:'running', progress:30, note:'TRỄ HẠN — Thiếu TiO2, đã đặt gấp.', specs:{ viscosity:'88 KU', pH:'7.8', temp:'27°C', speed:'720 rpm' }, log:[{ t:'18/05 16:00', text:'Dừng do thiếu TiO2', color:'#c0392b' }, { t:'19/05 07:30', text:'Tiếp tục sau khi có NVL', color:'#c8750a' }] },
  { id:'LS-006', orderId:'DH-2605-002', product:'Sơn lót chống thấm',      color:'Trắng kem',           qty:1500, team:'Tổ 3 – Phạm Văn D',         machine:'MT-02', deadline:'24/05/2026', priority:'high',   col:'delivered',      progress:80, note:'Kiểm định TCVN 5670.', specs:{ viscosity:'98 KU', pH:'8.5', temp:'26°C', speed:'Done' }, log:[{ t:'19/05 08:00', text:'Chuyển sang QC', color:'#6b4fa0' }] },
  { id:'LS-007', orderId:'DH-2605-005', product:'Sơn bóng cao cấp epoxy',  color:'Xám xi măng',         qty:600,  team:'Tổ 1 – Nguyễn Văn B',       machine:'MT-03', deadline:'20/05/2026', priority:'high',   col:'delivered', progress:92, note:'Đóng thùng 20L, dán nhãn KH-0067.', specs:{ viscosity:'110 KU', pH:'7.6', temp:'25°C', speed:'Done' }, log:[{ t:'19/05 05:30', text:'QC pass', color:'#1a7a4a' }, { t:'19/05 06:30', text:'Bắt đầu đóng gói', color:'#c9a800' }] },
  { id:'LS-008', orderId:'DH-2605-006', product:'Sơn chống nóng mái tôn',  color:'Bạc nhũ',             qty:800,  team:'Tổ 2 – Lê Thị C',          machine:'MT-01', deadline:'15/05/2026', priority:'normal', col:'delivered',    progress:100,note:'Xuất kho 14:30 hôm qua.', specs:{ viscosity:'95 KU', pH:'8.0', temp:'25°C', speed:'Done' }, log:[{ t:'18/05 14:30', text:'Xuất kho — Giao xe TKH-1234', color:'#1a7a4a' }] },
];

export const DASHBOARD_WEEK = {
  labels: ['T2 13/5','T3 14/5','T4 15/5','T5 16/5','T6 17/5','T7 18/5','CN 19/5'],
  actual: [4200, 4850, 4100, 5200, 4600, 3800, 4820],
  plan:   [4500, 4500, 4500, 5000, 4500, 4000, 4800],
};

export const DASHBOARD_TODAY = {
  labels: ['06:00','07:00','08:00','09:00','10:00','11:00','12:00'],
  actual: [0, 380, 720, 1100, 1650, 2200, 2850],
  plan:   [0, 400, 800, 1200, 1600, 2000, 2400],
};

export const STATUS_MAP = {
  new:       { label: 'Mới tạo',       cls: 'new'       },
  scheduled: { label: 'Đã lập lệnh',   cls: 'scheduled' },
  mixing:    { label: 'Đang pha chế',  cls: 'mixing'    },
  qc:        { label: 'Kiểm định QC',  cls: 'qc'        },
  packing:   { label: 'Đóng gói',      cls: 'packing'   },
  done:      { label: 'Hoàn thành',    cls: 'done'      },
  late:      { label: 'Trễ tiến độ',   cls: 'late'      },
};

export const KANBAN_COLS = ['waiting','approved','scheduled','running','done','delivered'];
export const KANBAN_COL_LABELS = {
  waiting:   'Nhận đơn hàng',
  approved:  'Đã duyệt đơn',
  scheduled: 'Duyệt sản xuất',
  running:   'Đang sản xuất',
  done:      'Hoàn thành',
  delivered: 'Đã giao hàng',
};
export const KANBAN_COL_NEXT = {
  waiting:   'approved',
  approved:  'scheduled',
  scheduled: 'running',
  running:   'done',
  done:      'delivered',
};
