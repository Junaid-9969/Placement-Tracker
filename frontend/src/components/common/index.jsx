import React from 'react';
import { ChevronLeft, ChevronRight, Search, X, AlertTriangle } from 'lucide-react';

// ── Stat Card ──────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colors = {
    blue: 'bg-blue-500', green: 'bg-emerald-500', orange: 'bg-orange-500',
    purple: 'bg-purple-500', red: 'bg-red-500', cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500', rose: 'bg-rose-500'
  };
  return (
    <div className="stat-card">
      <div className={`${colors[color]} p-3 rounded-xl flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────
const statusMap = {
  applied: 'badge-blue', under_review: 'badge-yellow', shortlisted: 'badge-purple',
  interview_scheduled: 'badge-purple', interview_done: 'badge-yellow',
  selected: 'badge-green', rejected: 'badge-red', withdrawn: 'badge-gray',
  active: 'badge-green', closed: 'badge-gray', filled: 'badge-blue', draft: 'badge-yellow',
  placed: 'badge-green', not_placed: 'badge-gray', pending: 'badge-yellow',
  approved: 'badge-green', verified: 'badge-green', true: 'badge-green', false: 'badge-red'
};

export function StatusBadge({ status, label }) {
  const cls = statusMap[String(status)] || 'badge-gray';
  const display = label || String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return <span className={cls}>{display}</span>;
}

// ── Pagination ─────────────────────────────────────────
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const pagesToShow = () => {
    const arr = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) arr.push(i);
    return arr;
  };
  const btnBase = 'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors';
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className={`${btnBase} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40`}>
        <ChevronLeft size={16} />
      </button>
      {page > 3 && <><button onClick={() => onPage(1)} className={`${btnBase} hover:bg-gray-100 dark:hover:bg-gray-700`}>1</button><span className="text-gray-400">…</span></>}
      {pagesToShow().map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={`${btnBase} ${p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
          {p}
        </button>
      ))}
      {page < pages - 2 && <><span className="text-gray-400">…</span><button onClick={() => onPage(pages)} className={`${btnBase} hover:bg-gray-100 dark:hover:bg-gray-700`}>{pages}</button></>}
      <button onClick={() => onPage(page + 1)} disabled={page === pages}
        className={`${btnBase} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40`}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 pr-8"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={`${sizes[size]} border-3 border-primary-600 border-t-transparent rounded-full animate-spin`} style={{ borderWidth: 3 }} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

// ── Empty State ────────────────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>}
      <h3 className="font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative card w-full ${sizes[size]} shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle size={20} className={danger ? 'text-red-500 flex-shrink-0 mt-0.5' : 'text-yellow-500 flex-shrink-0 mt-0.5'} />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// ── Page Header ────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

// ── Form Field ─────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────
export function Select({ options, value, onChange, placeholder = 'Select...', className = '' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={`input ${className}`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
