import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const icons = {
  info: <Info size={14} className="text-blue-500" />,
  success: <CheckCircle size={14} className="text-green-500" />,
  warning: <AlertTriangle size={14} className="text-yellow-500" />,
  error: <XCircle size={14} className="text-red-500" />
};

export default function NotificationDropdown({ onClose }) {
  const { notifications, markNotificationsRead, refreshNotifications } = useAuth();
  const ref = useRef();

  useEffect(() => {
    refreshNotifications();
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 card shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-500" />
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifications</span>
        </div>
        <button onClick={markNotificationsRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
          <CheckCheck size={13} /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Bell size={28} className="mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((n, i) => (
            <div key={i} className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="mt-0.5 flex-shrink-0">{icons[n.type] || icons.info}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
