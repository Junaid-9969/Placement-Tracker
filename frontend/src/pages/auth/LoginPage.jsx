import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GraduationCap, Eye, EyeOff, Moon, Sun, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
  role: z.enum(['admin', 'student', 'company', 'trainer'])
});

const roleInfo = {
  student: { label: 'Student', color: 'bg-blue-600', desc: 'Browse jobs & track applications' },
  company: { label: 'Company', color: 'bg-emerald-600', desc: 'Post jobs & manage candidates' },
  trainer: { label: 'Trainer', color: 'bg-orange-500', desc: 'Monitor & guide students' },
  admin: { label: 'Admin', color: 'bg-purple-600', desc: 'Full system management' }
};

export default function LoginPage() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back!`);
      const routes = { admin: '/admin', student: '/student', company: '/company', trainer: '/trainer' };
      navigate(routes[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PlaceTrack</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Placement Management System</p>
        </div>

        <div className="card p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Sign In</h2>
            <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {Object.entries(roleInfo).map(([role, info]) => (
              <button
                key={role}
                type="button"
                onClick={() => setValue('role', role)}
                className={`p-2 rounded-lg border-2 text-center transition-all ${
                  selectedRole === role
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-6 h-6 ${info.color} rounded-md mx-auto mb-1`} />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{info.label}</p>
              </button>
            ))}
          </div>
          {selectedRole && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-3 mb-4">
              {roleInfo[selectedRole].desc}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="yourname@gmail.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Register here</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} PlaceTrack · Placement Management System
        </p>
      </div>
    </div>
  );
}
