# PaintFlow — Hệ thống quản lý đơn hàng & sản xuất nhà máy sơn

## Cấu trúc project

```
paintflow/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                  ← Entry point
    ├── App.jsx                   ← Router chính
    ├── styles/
    │   └── global.css            ← Design system, tokens, components
    ├── data/
    │   └── mockData.js           ← Mock data (swap ra API tại đây)
    ├── components/
    │   ├── Layout.jsx            ← Sidebar + Topbar dùng chung
    │   └── Badges.jsx            ← StatusBadge, PriorityBadge, ProgressBar
    └── pages/
        ├── DashboardPage.jsx     ← Tổng quan KPI + biểu đồ
        ├── OrdersPage.jsx        ← Quản lý đơn hàng + ưu tiên + ghi chú
        └── KanbanPage.jsx        ← Kanban lệnh sản xuất
```

---

## Cài đặt & chạy

### Yêu cầu
- Node.js >= 18
- npm hoặc pnpm

### Bước 1 — Cài dependencies

```bash
cd paintflow
npm install
```

### Bước 2 — Chạy môi trường development

```bash
npm run dev
```

Trình duyệt sẽ tự mở tại `http://localhost:3000`

### Bước 3 — Build production

```bash
npm run build
# Output tại /dist — deploy lên Nginx, Vercel, Netlify...
```

---

## Kết nối API thật

Tất cả mock data nằm trong **`src/data/mockData.js`**.  
Để swap sang API thật, tạo custom hooks:

```js
// src/hooks/useOrders.js
import { useState, useEffect } from 'react';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); });
  }, []);

  return { orders, loading };
}
```

Sau đó trong `OrdersPage.jsx` thay:
```js
// Cũ (mock)
import { ORDERS } from '../data/mockData';

// Mới (API)
import { useOrders } from '../hooks/useOrders';
const { orders: ORDERS, loading } = useOrders();
```

---

## Thêm module mới

1. Tạo file `src/pages/TenModulePage.jsx`
2. Wrap bằng `<Layout>` component
3. Thêm route trong `src/App.jsx`:
   ```jsx
   <Route path="/ten-module" element={<TenModulePage />} />
   ```
4. Thêm nav item trong `src/components/Layout.jsx` → mảng `NAV_ITEMS`

---

## Modules đã có

| Module | Route | Trạng thái |
|--------|-------|------------|
| Dashboard tổng quan | `/` | ✅ Hoàn thành |
| Quản lý đơn hàng | `/orders` | ✅ Hoàn thành |
| Kanban lệnh sản xuất | `/kanban` | ✅ Hoàn thành |
| Tiến độ sản xuất | `/progress` | 🔲 Placeholder |
| Kiểm định QC | `/qc` | 🔲 Placeholder |
| Phân tích & Báo cáo | `/analytics` | 🔲 Placeholder |
| Cài đặt | `/settings` | 🔲 Placeholder |

---

## Tech stack

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 18 | UI framework |
| React Router | v6 | Client-side routing |
| Vite | 5 | Build tool |
| Chart.js | 4.4 | Biểu đồ Dashboard (CDN) |
| Tabler Icons | 3.19 | Icon set (CDN) |
| Google Fonts (Syne + DM Sans + DM Mono) | — | Typography |

> Không có CSS framework bên ngoài — toàn bộ styling trong `global.css` với CSS variables.
