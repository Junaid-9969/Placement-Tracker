import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import { StatCard, PageLoader, StatusBadge, PageHeader } from '../../components/common';
import { Users, Building2, Briefcase, FileText, CheckSquare, TrendingUp, BarChart3, UserCheck, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminAPI.getDashboard().then(r => r.data.data) });

  if (isLoading) return <PageLoader />;

  const { stats, recentActivity, branchStats } = data || {};

  const branchChartData = branchStats?.map(b => ({ name: b._id, placed: b.count })) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="System overview and quick actions" action={
        <Link to="/admin/approvals" className="btn-primary relative">
          <CheckSquare size={16} /> Approvals
          {stats?.pendingApprovals > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {stats.pendingApprovals}
            </span>
          )}
        </Link>
      } />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="blue" subtitle={`${stats?.approvedStudents || 0} approved`} />
        <StatCard title="Companies" value={stats?.totalCompanies || 0} icon={Building2} color="green" />
        <StatCard title="Active Jobs" value={stats?.activeJobs || 0} icon={Briefcase} color="orange" subtitle={`${stats?.totalJobs || 0} total`} />
        <StatCard title="Applications" value={stats?.totalApplications || 0} icon={FileText} color="purple" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Placed Students" value={stats?.placedStudents || 0} icon={TrendingUp} color="cyan" />
        <StatCard title="Shortlisted" value={stats?.shortlistedStudents || 0} icon={UserCheck} color="indigo" />
        <StatCard title="Trainers" value={stats?.totalTrainers || 0} icon={UserCheck} color="rose" />
        <StatCard title="Placement %" value={`${stats?.placementPercentage || 0}%`} icon={BarChart3} color="green" />
      </div>

      {/* Pending approvals alert */}
      {stats?.pendingApprovals > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">New registrations waiting for your review</p>
            </div>
          </div>
          <Link to="/admin/approvals" className="btn text-xs px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700">Review</Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Branch placements */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Placements by Branch</h3>
          {branchChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branchChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="placed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No placement data yet</p>}
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {recentActivity?.recentJobs?.length ? recentActivity.recentJobs.map(job => (
              <div key={job._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.company?.companyName}</p>
                </div>
                <StatusBadge status={job.isApproved ? 'approved' : 'pending'} label={job.isApproved ? 'Approved' : 'Pending'} />
              </div>
            )) : <p className="text-sm text-gray-400 py-4 text-center">No jobs yet</p>}
          </div>
        </div>
      </div>

      {/* Recent registrations */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Students</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Branch</th><th>Status</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity?.recentStudents?.map(s => (
                <tr key={s._id}>
                  <td className="font-medium">{s.firstName} {s.lastName}</td>
                  <td><StatusBadge status={s.branch} label={s.branch} /></td>
                  <td><StatusBadge status={s.user?.isApproved} label={s.user?.isApproved ? 'Approved' : 'Pending'} /></td>
                  <td className="text-gray-400">{new Date(s.createdAt || s.user?.createdAt).toLocaleDateString()}</td>
                </tr>
              )) || <tr><td colSpan={4} className="text-center text-gray-400 py-4">No students yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
