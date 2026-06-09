import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader, FormField } from '../../components/common';
import { Moon, Sun, Shield, Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 chars').regex(/[A-Z]/, 'Need uppercase').regex(/[a-z]/, 'Need lowercase').regex(/[0-9]/, 'Need number'),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pwSchema)
  });

  const changePwMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: async () => {
      toast.success('Password changed. Please log in again.');
      await logout();
      navigate('/login');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password')
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      {/* Account Info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500">Role</span>
            <span className="badge badge-blue capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Account Status</span>
            <span className={`badge ${user?.isApproved ? 'badge-green' : 'badge-yellow'}`}>
              {user?.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="mt-3 flex gap-3">
          <button onClick={() => !dark && toggle()} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm transition-all ${dark ? 'border-gray-200 dark:border-gray-700 text-gray-500' : 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20'}`}>
            <Sun size={16} /> Light
          </button>
          <button onClick={() => dark || toggle()} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm transition-all ${dark ? 'border-primary-500 text-primary-400 bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            <Moon size={16} /> Dark
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit(d => changePwMutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))} className="space-y-4">
          <FormField label="Current Password" error={errors.currentPassword?.message}>
            <div className="relative">
              <input {...register('currentPassword')} type={showCurrent ? 'text' : 'password'}
                className={`input pr-10 ${errors.currentPassword ? 'input-error' : ''}`} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>

          <FormField label="New Password" error={errors.newPassword?.message}>
            <div className="relative">
              <input {...register('newPassword')} type={showNew ? 'text' : 'password'}
                className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`} />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm New Password" error={errors.confirmPassword?.message}>
            <input {...register('confirmPassword')} type="password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} />
          </FormField>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
            Password must be at least 8 characters with uppercase, lowercase, and a number. Changing your password will log you out of all devices.
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={changePwMutation.isPending} className="btn-primary">
              {changePwMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border-red-200 dark:border-red-900/50">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-3">Sign Out</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Sign out from all your active sessions.</p>
        <button onClick={handleLogout} className="btn-danger">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
