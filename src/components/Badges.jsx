// src/components/Badges.jsx
// Dùng chung ở mọi trang: OrdersPage, KanbanPage, Dashboard

import { STATUS_MAP } from '../data/mockData';

/**
 * StatusBadge — hiển thị trạng thái đơn hàng
 * @param {string} status — key trong STATUS_MAP
 */
export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'new' };
  return (
    <span className={`badge ${s.cls}`}>
      <span className="badge-dot" />
      {s.label}
    </span>
  );
}

const PRI_LABELS = { urgent: 'Khẩn cấp', high: 'Cao', normal: 'Thường' };

/**
 * PriorityBadge — Khẩn cấp / Cao / Thường
 * @param {string} priority
 */
export function PriorityBadge({ priority }) {
  return (
    <span className={`pri-badge ${priority}`}>
      {PRI_LABELS[priority] || priority}
    </span>
  );
}

/**
 * DeadlineText — hiển thị deadline có màu theo tình trạng
 * @param {string} deadline  — "22/05/2026"
 * @param {'ok'|'warn'|'late'} cls
 */
export function DeadlineText({ deadline, cls }) {
  const colorMap = { ok: 'var(--ink3)', warn: 'var(--am)', late: 'var(--rd)' };
  return (
    <span style={{ fontSize: 12, fontWeight: cls !== 'ok' ? 500 : 400, color: colorMap[cls] || 'var(--ink3)' }}>
      {deadline}
    </span>
  );
}

/**
 * ProgressBar — thanh tiến độ
 * @param {number} value  0–100
 * @param {string} [color]  optional override
 */
export function ProgressBar({ value, color }) {
  const auto = value >= 90 ? 'var(--gn)' : value >= 50 ? 'var(--am)' : 'var(--bl)';
  return (
    <div className="progress-wrap">
      <div className="progress-fill" style={{ width: `${value}%`, background: color || auto }} />
    </div>
  );
}
