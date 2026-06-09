import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api';
import { GraduationCap, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must have uppercase')
  .regex(/[a-z]/, 'Must have lowercase')
  .regex(/[0-9]/, 'Must have number');

const studentSchema = z.object({
  email: z.string().email('Valid email required'),
  password: passwordSchema,
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  branch: z.string().min(1, 'Required'),
  rollNumber: z.string().optional(),
  cgpa: z.coerce.number().min(0).max(10).optional()
});

const companySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  companyName: z.string().min(1, 'Required'),
  hrName: z.string().min(1, 'Required'),
  sector: z.string().optional(),
  hrPhone: z.string().optional()
});

const trainerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  designation: z.string().optional(),
  specialization: z.string().optional()
});

const schemas = { student: studentSchema, company: companySchema, trainer: trainerSchema };
const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AIDS', 'AIML', 'DS', 'IOT', 'Other'];
const sectors = ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'E-commerce', 'Consulting', 'Telecom', 'Other'];

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schemas[role]),
    defaultValues: {}
  });

  const handleRoleChange = (r) => { setRole(r); reset(); };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const apis = {
        student: authAPI.registerStudent,
        company: authAPI.registerCompany,
        trainer: authAPI.registerTrainer
      };
      await apis[role](data);
      toast.success('Registration successful! Awaiting admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(`${e.field}: ${e.message}`));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join the Placement Management System</p>
        </div>

        <div className="card p-6 shadow-lg">
          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {['student', 'company', 'trainer'].map(r => (
              <button key={r} type="button" onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  role === r ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="yourname@gmail.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Password *</label>
                <div className="relative">
                  <input {...register('password')} type={showPass ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min 8 chars, upper+lower+number" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Student fields */}
              {role === 'student' && <>
                <div>
                  <label className="label">First Name *</label>
                  <input {...register('firstName')} className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="First name" />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input {...register('lastName')} className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Last name" />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="label">Branch *</label>
                  <select {...register('branch')} className={`input ${errors.branch ? 'input-error' : ''}`}>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.branch && <p className="text-xs text-red-500 mt-1">{errors.branch.message}</p>}
                </div>
                <div>
                  <label className="label">CGPA</label>
                  <input {...register('cgpa')} type="number" step="0.01" min="0" max="10" className="input" placeholder="e.g. 8.5" />
                </div>
                <div>
                  <label className="label">Roll Number</label>
                  <input {...register('rollNumber')} className="input" placeholder="e.g. CS2024001" />
                </div>
              </>}

              {/* Company fields */}
              {role === 'company' && <>
                <div className="col-span-2">
                  <label className="label">Company Name *</label>
                  <input {...register('companyName')} className={`input ${errors.companyName ? 'input-error' : ''}`} placeholder="Company Inc." />
                  {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <label className="label">HR Name *</label>
                  <input {...register('hrName')} className={`input ${errors.hrName ? 'input-error' : ''}`} placeholder="HR Manager Name" />
                  {errors.hrName && <p className="text-xs text-red-500 mt-1">{errors.hrName.message}</p>}
                </div>
                <div>
                  <label className="label">Sector</label>
                  <select {...register('sector')} className="input">
                    <option value="">Select sector</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">HR Phone</label>
                  <input {...register('hrPhone')} className="input" placeholder="10-digit number" />
                </div>
              </>}

              {/* Trainer fields */}
              {role === 'trainer' && <>
                <div>
                  <label className="label">First Name *</label>
                  <input {...register('firstName')} className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="First name" />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input {...register('lastName')} className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Last name" />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input {...register('designation')} className="input" placeholder="Senior Trainer" />
                </div>
                <div>
                  <label className="label">Specialization</label>
                  <input {...register('specialization')} className="input" placeholder="e.g. Full Stack" />
                </div>
              </>}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠️ After registration, your account requires admin approval before you can log in.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
