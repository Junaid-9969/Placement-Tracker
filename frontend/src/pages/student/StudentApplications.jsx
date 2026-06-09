import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationAPI } from '../../api';
import { PageHeader, StatusBadge, Pagination, PageLoader, EmptyState, Select, Modal } from '../../components/common';
import { FileText, Calendar, MapPin, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const statuses = [
  { value: 'applied', label: 'Applied' }, { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' }, { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'selected', label: 'Selected' }, { value: 'rejected', label: 'Rejected' }
];

export default function StudentApplications() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', status, page],
    queryFn: () => applicationAPI.getMyApplications({ status, page, limit: 10 }).then(r => r.data)
  });

  const withdrawMutation = useMutation({
    mutationFn: applicationAPI.withdraw,
    onSuccess: () => { toast.success('Application withdrawn'); qc.invalidateQueries(['my-applications']); setSelected(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to withdraw')
  });

  const statusColors = {
    applied: 'border-l-blue-500', under_review: 'border-l-yellow-500',
    shortlisted: 'border-l-purple-500', interview_scheduled: 'border-l-indigo-500',
    selected: 'border-l-green-500', rejected: 'border-l-red-500', withdrawn: 'border-l-gray-400'
  };

  return (
    <div className="space-y-5">
      <PageHeader title="My Applications" subtitle={`${data?.meta?.total || 0} total applications`} />

      <Select value={status} onChange={v => { setStatus(v); setPage(1); }}
        options={statuses} placeholder="All Statuses" className="w-52" />

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={FileText} title="No applications" subtitle="You haven't applied for any jobs yet." /></div>
          ) : (
            <div className="space-y-3">
              {data.data.map(app => (
                <div key={app._id}
                  className={`card p-4 border-l-4 ${statusColors[app.status] || 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{app.job?.title}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{app.company?.companyName}</p>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>
                        {app.job?.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> Deadline: {new Date(app.job.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Interview info */}
                      {app.status === 'interview_scheduled' && app.interviewSchedule?.date && (
                        <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                            Interview: {new Date(app.interviewSchedule.date).toLocaleDateString()} at {app.interviewSchedule.time}
                          </p>
                          {app.interviewSchedule.mode && (
                            <p className="text-xs text-indigo-500 mt-0.5 capitalize">Mode: {app.interviewSchedule.mode}</p>
                          )}
                          {app.interviewSchedule.meetLink && (
                            <a href={app.interviewSchedule.meetLink} target="_blank" rel="noreferrer"
                              className="text-xs text-indigo-600 hover:underline mt-0.5 block">Join Meeting Link</a>
                          )}
                        </div>
                      )}

                      {/* Selected offer */}
                      {app.status === 'selected' && app.offerDetails?.package && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs font-medium text-green-700 dark:text-green-400">
                            🎉 Offer: ₹{(app.offerDetails.package / 100000).toFixed(1)}L per annum
                          </p>
                          {app.offerDetails.joiningDate && (
                            <p className="text-xs text-green-600">Joining: {new Date(app.offerDetails.joiningDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      {/* Company feedback */}
                      {app.companyFeedback && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Feedback:</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{app.companyFeedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => setSelected(app)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors" title="View details">
                        <Eye size={15} />
                      </button>
                      {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                        <button onClick={() => withdrawMutation.mutate(app._id)}
                          disabled={withdrawMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Withdraw">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Pagination page={page} pages={data.meta?.pages || 1} onPage={setPage} />
            </div>
          )}
        </>
      )}

      {/* Application detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Application Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Job</p><p className="font-medium">{selected.job?.title}</p></div>
              <div><p className="text-gray-400 text-xs">Company</p><p className="font-medium">{selected.company?.companyName}</p></div>
              <div><p className="text-gray-400 text-xs">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="text-gray-400 text-xs">Applied On</p><p className="font-medium">{new Date(selected.appliedAt || selected.createdAt).toLocaleDateString()}</p></div>
            </div>

            {selected.coverLetter && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Cover Letter</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{selected.coverLetter}</p>
              </div>
            )}

            {selected.statusHistory?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Status History</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selected.statusHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium capitalize">{h.status?.replace(/_/g, ' ')}</span>
                        {h.note && <span className="text-gray-400"> – {h.note}</span>}
                        <p className="text-gray-400">{new Date(h.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
