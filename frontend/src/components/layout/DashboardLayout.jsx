import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText, Bell,
  Settings, LogOut, Moon, Sun, Menu, X, ChevronRight, ClipboardList,
  BarChart3, UserCheck, GraduationCap, BookOpen, CheckSquare
} from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

const navConfig = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/approvals', icon: CheckSquare, label: 'Approvals' },
    { to: '/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/trainers', icon: UserCheck, label: 'Trainers' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/applications', icon: FileText, label: 'Applications' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  student: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/student/profile', icon: Users, label: 'My Profile' },
    { to: '/student/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { to: '/student/applications', icon: ClipboardList, label: 'Applications' },
  ],
  company: [
    { to: '/company', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/company/profile', icon: Building2, label: 'Company Profile' },
    { to: '/company/jobs', icon: Briefcase, label: 'Job Postings' },
    { to: '/company/applications', icon: FileText, label: 'Applications' },
  ],
  trainer: [
    { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/trainer/profile', icon: Users, label: 'My Profile' },
    { to: '/trainer/students', icon: BookOpen, label: 'My Students' },
  ],
};

const roleColors = {
  admin: 'from-indigo-600 to-purple-700',
  student: 'from-blue-600 to-cyan-600',
  company: 'from-emerald-600 to-teal-700',
  trainer: 'from-orange-500 to-rose-600'
};

const roleLabels = { admin: 'Admin Panel', student: 'Student Portal', company: 'Company Portal', trainer: 'Trainer Portal' };

export default function DashboardLayout() {
  const { user, logout, unreadCount } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const links = navConfig[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'fixed inset-y-0 left-0 z-50 w-64 lg:hidden' : 'hidden lg:flex lg:flex-col w-64'}
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full
    `}>
      {/* Logo */}
      <div className={`h-16 flex items-center px-5 bg-gradient-to-r ${roleColors[user?.role]} text-white flex-shrink-0`}>
        <GraduationCap className="w-7 h-7 mr-2.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate">PlaceTrack</p>
          <p className="text-xs opacity-80 truncate">{roleLabels[user?.role]}</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/80 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <NavLink to={`/${user?.role}/settings`} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {sidebarOpen && <Sidebar mobile />}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block max-w-[120px]">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Approval warning */}
        {user && !user.isApproved && user.role !== 'admin' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              Your account is pending admin approval. Some features may be restricted.
            </p>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
