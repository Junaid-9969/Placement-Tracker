import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { PageHeader, PageLoader, EmptyState, Modal } from '../../components/common';
import { CheckSquare, CheckCircle, XCircle, GraduationCap, Building2, UserCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const roleIcons = { student: GraduationCap, company: Building2, trainer: UserCheck };
const roleColors = { student: 'bg-blue-100 text-blue-600', company: 'bg-green-100 text-green-600', trainer: 'bg-orange-100 text-orange-600' };

export default function AdminApprovals() {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null });
  const [reason, setReason] = useState('');

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => adminAPI.getPendingApprovals().then(r => r.data.data),
    refetchInterval: 30000
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveUser(id),
    onSuccess: () => { toast.success('User approved!'); qc.invalidateQueries(['pending-approvals']); qc.invalidateQueries(['admin-dashboard']); },
    onError: () => toast.error('Failed to approve user')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.rejectUser(id, { reason }),
    onSuccess: () => { toast.success('User rejected.'); qc.invalidateQueries(['pending-approvals']); setRejectModal({ open: false, userId: null }); setReason(''); },
    onError: () => toast.error('Failed to reject user')
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Approvals" subtitle={`${approvals.length} accounts awaiting review`} />

      {approvals.length === 0 ? (
        <div className="card">
          <EmptyState icon={CheckSquare} title="All caught up!" subtitle="No pending approvals at the moment." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {approvals.map(({ user, profile }) => {
            const Icon = roleIcons[user.role] || UserCheck;
            return (
              <div key={user._id} className="card p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${roleColors[user.role]}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {user.role === 'student' && profile ? `${profile.firstName} ${profile.lastName}` :
                         user.role === 'company' && profile ? profile.companyName :
                         user.role === 'trainer' && profile ? `${profile.firstName} ${profile.lastName}` :
                         'Unknown'}
                      </h3>
                      <span className={`badge capitalize ${
                        user.role === 'student' ? 'badge-blue' :
                        user.role === 'company' ? 'badge-green' : 'badge-yellow'
                      }`}>{user.role}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-1.5">
                  {user.role === 'student' && profile && <>
                    <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Branch:</span> {profile.branch}</p>
                  </>}
                  {user.role === 'company' && profile && <>
                    <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">HR:</span> {profile.hrName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Sector:</span> {profile.sector}</p>
                  </>}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    <span>Registered {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => approveMutation.mutate(user._id)}
                    disabled={approveMutation.isPending}
                    className="btn-success flex-1 text-xs py-2"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, userId: user._id })}
                    className="btn-danger flex-1 text-xs py-2"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, userId: null })} title="Reject Registration" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason for rejection (optional):</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="e.g. Incomplete information, invalid credentials..."
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setRejectModal({ open: false, userId: null })} className="btn-secondary">Cancel</button>
            <button
              onClick={() => rejectMutation.mutate({ id: rejectModal.userId, reason })}
              disabled={rejectMutation.isPending}
              className="btn-danger"
            >
              Reject User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
