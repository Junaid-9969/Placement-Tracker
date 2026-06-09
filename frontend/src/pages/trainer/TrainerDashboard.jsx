import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { trainerAPI, analyticsAPI } from '../../api';
import { StatCard, PageLoader, PageHeader, EmptyState, StatusBadge } from '../../components/common';
import {
  Users, CheckCircle, TrendingUp, BookOpen, Target, BarChart3,
  GraduationCap, Briefcase, Clock, Star, AlertTriangle, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TrainerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['trainer-dashboard'],
    queryFn: () => trainerAPI.getDashboard().then(r => r.data.data)
  });

  const { data: students = [] } = useQuery({
    queryKey: ['trainer-students-all'],
    queryFn: () => trainerAPI.getStudents({}).then(r => r.data.data)
  });

  if (isLoading) return <PageLoader />;
  const { stats, recentStudents, trainer } = data || {};

  // Branch distribution
  const branchMap = {};
  students.forEach(s => { branchMap[s.branch] = (branchMap[s.branch] || 0) + 1; });
  const branchData = Object.entries(branchMap).map(([name, value]) => ({ name, value }));

  // Readiness distribution
  const readinessBands = [
    { label: '0-39', count: students.filter(s => s.readinessScore < 40).length },
    { label: '40-59', count: students.filter(s => s.readinessScore >= 40 && s.readinessScore < 60).length },
    { label: '60-79', count: students.filter(s => s.readinessScore >= 60 && s.readinessScore < 80).length },
    { label: '80-100', count: students.filter(s => s.readinessScore >= 80).length }
  ];

  // Placement status pie
  const placementPie = [
    { name: 'Not Placed', value: stats?.notPlaced || 0 },
    { name: 'Shortlisted', value: stats?.shortlisted || 0 },
    { name: 'Placed', value: stats?.placed || 0 }
  ].filter(p => p.value > 0);

  // CGPA band
  const cgpaBands = [
    { label: '<6', count: students.filter(s => s.cgpa < 6).length },
    { label: '6-7', count: students.filter(s => s.cgpa >= 6 && s.cgpa < 7).length },
    { label: '7-8', count: students.filter(s => s.cgpa >= 7 && s.cgpa < 8).length },
    { label: '8-9', count: students.filter(s => s.cgpa >= 8 && s.cgpa < 9).length },
    { label: '9-10', count: students.filter(s => s.cgpa >= 9).length }
  ];

  // Students needing attention (low readiness, not placed)
  const needAttention = students
    .filter(s => s.readinessScore < 50 && s.placementStatus === 'not_placed')
    .slice(0, 5);

  // Top performers
  const topPerformers = [...students]
    .sort((a, b) => (b.readinessScore + b.cgpa * 10) - (a.readinessScore + a.cgpa * 10))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Trainer Dashboard 📊
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {trainer?.firstName} {trainer?.lastName} · {trainer?.designation} · {trainer?.specialization?.join(', ')}
          </p>
        </div>
        <Link to="/trainer/students" className="btn-primary">
          <Users size={16} /> My Students
        </Link>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value={stats?.totalAssigned || 0} icon={GraduationCap} color="blue" subtitle="Total under mentorship" />
        <StatCard title="Placed" value={stats?.placed || 0} icon={CheckCircle} color="green" subtitle={`${stats?.totalAssigned ? Math.round((stats.placed / stats.totalAssigned) * 100) : 0}% placement rate`} />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={TrendingUp} color="purple" subtitle="In active process" />
        <StatCard title="Avg Readiness" value={`${stats?.avgReadiness || 0}%`} icon={Target} color="orange" subtitle="Batch average score" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="High Readiness" value={stats?.highReadiness || 0} icon={Star} color="green" subtitle="Score ≥ 70" />
        <StatCard title="Needs Attention" value={stats?.lowReadiness || 0} icon={AlertTriangle} color="red" subtitle="Score < 40" />
        <StatCard title="Not Placed" value={stats?.notPlaced || 0} icon={Clock} color="orange" subtitle="Awaiting placement" />
        <StatCard title="Placement %" value={`${stats?.totalAssigned ? Math.round((stats.placed / stats.totalAssigned) * 100) : 0}%`} icon={BarChart3} color="cyan" subtitle="Overall batch rate" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Placement Status Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Placement Status</h3>
          {placementPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={placementPie} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={10}>
                  {placementPie.map((_, i) => <Cell key={i} fill={['#f59e0b','#8b5cf6','#10b981'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-16 text-sm">No data yet</p>}
        </div>

        {/* Readiness Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Readiness Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={readinessBands} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CGPA Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">CGPA Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cgpaBands} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Branch Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Students by Branch</h3>
          {branchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={branchData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={50} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10 text-sm">No data</p>}
        </div>

        {/* Readiness Progress bar */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Batch Readiness Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Placement Ready (≥70%)', count: stats?.highReadiness || 0, color: 'bg-green-500', total: stats?.totalAssigned },
              { label: 'Developing (40–69%)', count: (stats?.totalAssigned || 0) - (stats?.highReadiness || 0) - (stats?.lowReadiness || 0), color: 'bg-yellow-500', total: stats?.totalAssigned },
              { label: 'Needs Help (<40%)', count: stats?.lowReadiness || 0, color: 'bg-red-500', total: stats?.totalAssigned },
              { label: 'Placed', count: stats?.placed || 0, color: 'bg-blue-500', total: stats?.totalAssigned },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">{item.label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{item.count} / {item.total || 0}</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{stats?.placed || 0} / {stats?.totalAssigned || 0}</p>
            <p className="text-xs text-primary-600 dark:text-primary-500">Students Placed</p>
          </div>
        </div>
      </div>

      {/* Students needing attention & Top performers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Needs Attention</h3>
            </div>
            <Link to="/trainer/students" className="text-xs text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          {needAttention.length ? needAttention.map(s => (
            <div key={s._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {s.firstName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-gray-400">{s.branch} · CGPA {s.cgpa}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-red-600">{s.readinessScore}%</span>
                <Link to="/trainer/students" className="text-xs text-primary-600 hover:text-primary-700">
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={28} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm">All students are on track!</p>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Top Performers</h3>
            </div>
            <Link to="/trainer/students" className="text-xs text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          {topPerformers.length ? topPerformers.map((s, i) => (
            <div key={s._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'
                }`}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-gray-400">{s.branch} · CGPA {s.cgpa}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={s.placementStatus} />
                <span className="text-sm font-bold text-green-600">{s.readinessScore}%</span>
              </div>
            </div>
          )) : (
            <EmptyState icon={Users} title="No students assigned yet" />
          )}
        </div>
      </div>

      {/* Recent feedback given */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity – Students</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th><th>Branch</th><th>CGPA</th><th>Readiness</th><th>Placement</th><th>Last Feedback</th>
              </tr>
            </thead>
            <tbody>
              {(recentStudents || []).slice(0, 8).map(s => (
                <tr key={s._id}>
                  <td className="font-medium">{s.firstName} {s.lastName}</td>
                  <td><span className="badge badge-blue">{s.branch}</span></td>
                  <td>
                    <span className={`font-semibold ${s.cgpa >= 8 ? 'text-green-600' : s.cgpa >= 7 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {s.cgpa}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.readinessScore >= 70 ? 'bg-green-500' : s.readinessScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${s.readinessScore}%` }} />
                      </div>
                      <span className="text-xs font-medium">{s.readinessScore}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={s.placementStatus} /></td>
                  <td className="text-xs text-gray-400">
                    {s.trainerFeedback?.[0]
                      ? new Date(s.trainerFeedback[0].date).toLocaleDateString()
                      : 'No feedback yet'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
