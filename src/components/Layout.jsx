// src/components/Layout.jsx

import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard',       icon: 'ti-layout-dashboard', path: '/',          section: 'overview' },
  { label: 'Đơn hàng',        icon: 'ti-clipboard-list',   path: '/orders',    section: 'ops', badge: '14' },
  { label: 'Lệnh sản xuất',   icon: 'ti-assembly',          path: '/kanban',    section: 'ops' },
  { label: 'Tiến độ',         icon: 'ti-chart-gantt',       path: '/progress',  section: 'ops' },
  { label: 'Vật tư đầu vào',  icon: 'ti-box',               path: '/inventory', section: 'ops' },
  { label: 'Phân tích',       icon: 'ti-chart-bar',         path: '/analytics', section: 'report' },
  { label: 'Cài đặt',         icon: 'ti-settings',          path: '/settings',  section: 'report' },
];

export default function Layout({ children, currentPath = '/', pageTitle = '', pageMeta = '' }) {
  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <i className="ti ti-droplet" aria-hidden="true" />
          </div>
          <div>
            <div className="logo-name">PaintFlow</div>
            <div className="logo-sub">Nhà máy sơn</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <div className="nav-label">Tổng quan</div>
          {NAV_ITEMS.filter(i => i.section === 'overview').map(item => (
            <NavItem key={item.path} item={item} active={currentPath === item.path} />
          ))}

          <div className="nav-label" style={{ marginTop: 12 }}>Vận hành</div>
          {NAV_ITEMS.filter(i => i.section === 'ops').map(item => (
            <NavItem key={item.path} item={item} active={currentPath === item.path} />
          ))}

          <div className="nav-label" style={{ marginTop: 12 }}>Báo cáo</div>
          {NAV_ITEMS.filter(i => i.section === 'report').map(item => (
            <NavItem key={item.path} item={item} active={currentPath === item.path} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">TK</div>
          <div>
            <div className="user-name">Trần Minh Khoa</div>
            <div className="user-role">Giám đốc SX</div>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">{pageTitle}</h1>
          {pageMeta && <span className="page-meta">{pageMeta}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-icon" aria-label="Thông báo">
            <i className="ti ti-bell" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
          <button className="btn-icon" aria-label="Xuất dữ liệu">
            <i className="ti ti-download" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
          <button className="btn-icon" aria-label="Làm mới">
            <i className="ti ti-refresh" style={{ fontSize: 15 }} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main style={{ padding: '16px 20px', overflow: 'auto', background: 'var(--sf)' }}>
        {alertVisible && (
          <div className="alert-bar" style={{ marginBottom: 14 }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            <div className="alert-text">
              <strong>3 đơn hàng trễ tiến độ</strong> — DH-2605-003, DH-2605-009, DH-2605-011.
              Cần xử lý trước 17:00 hôm nay.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-sm" style={{ color: 'var(--rd)', borderColor: 'rgba(192,57,43,0.3)' }}>
                <i className="ti ti-eye" style={{ fontSize: 12 }} /> Xem
              </button>
              <button className="btn-icon" style={{ width: 28, height: 28 }}
                aria-label="Đóng cảnh báo" onClick={() => setAlertVisible(false)}>
                <i className="ti ti-x" style={{ fontSize: 13 }} />
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

function NavItem({ item, active }) {
  return (
    <a href={item.path} className={`nav-item ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined}>
      <i className={`ti ${item.icon}`} aria-hidden="true" />
      {item.label}
      {item.badge && (
        <span className={`nav-badge ${item.badgeRed ? 'red' : ''}`}>{item.badge}</span>
      )}
    </a>
  );
}
