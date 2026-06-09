import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../api';
import { PageHeader, PageLoader, StatCard } from '../../components/common';
import { Users, Building2, Briefcase, FileText, TrendingUp, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getAnalytics().then(r => r.data.data)
  });

  if (isLoading) return <PageLoader />;
  const { overview, monthlyApplications, branchStats, companyHiring, statusDistribution, skillsDemand } = data || {};

  const monthNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = monthlyApplications?.map(m => ({
    name: `${monthNames[m._id.month]} ${m._id.year}`, count: m.count
  })) || [];

  const pieData = statusDistribution?.map(s => ({
    name: s._id.replace(/_/g,' '), value: s.count
  })) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Insights" subtitle="Placement statistics and trends" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={overview?.totalStudents || 0} icon={Users} color="blue" />
        <StatCard title="Companies" value={overview?.totalCompanies || 0} icon={Building2} color="green" />
        <StatCard title="Jobs Posted" value={overview?.totalJobs || 0} icon={Briefcase} color="orange" />
        <StatCard title="Applications" value={overview?.totalApplications || 0} icon={FileText} color="purple" />
        <StatCard title="Placed" value={overview?.placedStudents || 0} icon={TrendingUp} color="cyan" />
        <StatCard title="Shortlisted" value={overview?.shortlistedStudents || 0} icon={Target} color="indigo" />
        <StatCard title="Selected" value={overview?.selectedApplications || 0} icon={TrendingUp} color="green" />
        <StatCard title="Placement %" value={`${overview?.placementPercentage || 0}%`} icon={Target} color="rose" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Monthly Applications Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No data yet</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Application Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No data yet</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Branch-wise Total Students</h3>
          {branchStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branchStats.map(b => ({ name: b._id, total: b.total, placed: b.placed }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} name="Total" />
                <Bar dataKey="placed" fill="#10b981" radius={[4,4,0,0]} name="Placed" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No data yet</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Skills in Demand</h3>
          {skillsDemand?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillsDemand.map(s => ({ name: s._id, count: s.count }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No data yet</p>}
        </div>
      </div>

      {/* Top hiring companies */}
      {companyHiring?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Hiring Companies</h3>
          <div className="space-y-3">
            {companyHiring.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.companyName}</span>
                    <span className="text-sm font-bold text-primary-600">{c.count} hired</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(c.count / companyHiring[0].count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
