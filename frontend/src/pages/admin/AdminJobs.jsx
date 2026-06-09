// AdminJobs.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobAPI } from '../../api';
import { PageHeader, SearchBar, StatusBadge, Pagination, PageLoader, EmptyState } from '../../components/common';
import { Briefcase, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminJobs() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', search, page],
    queryFn: () => jobAPI.getAll({ search, page, limit: 12 }).then(r => r.data)
  });

  const approveMutation = useMutation({
    mutationFn: jobAPI.approve,
    onSuccess: () => { toast.success('Job approved!'); qc.invalidateQueries(['admin-jobs']); },
    onError: () => toast.error('Failed to approve')
  });

  const deleteMutation = useMutation({
    mutationFn: jobAPI.delete,
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries(['admin-jobs']); },
    onError: () => toast.error('Failed to delete')
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Job Management" subtitle={`${data?.meta?.total || 0} total jobs`} />
      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search jobs..." className="max-w-sm" />

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={Briefcase} title="No jobs found" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Job Title</th><th>Company</th><th>Type</th><th>Deadline</th><th>Applications</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.data.map(job => (
                      <tr key={job._id}>
                        <td>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{job.title}</p>
                          <p className="text-xs text-gray-400">{job.location}</p>
                        </td>
                        <td>{job.company?.companyName}</td>
                        <td><StatusBadge status={job.jobType} label={job.jobType?.replace('_', ' ')} /></td>
                        <td className="text-sm">{new Date(job.deadline).toLocaleDateString()}</td>
                        <td className="text-center">{job.applicationCount || 0}</td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            <StatusBadge status={job.status} />
                            <StatusBadge status={job.isApproved} label={job.isApproved ? 'Approved' : 'Pending'} />
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {!job.isApproved && (
                              <button onClick={() => approveMutation.mutate(job._id)} className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Approve">
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button onClick={() => deleteMutation.mutate(job._id)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pages={data.meta?.pages || 1} onPage={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
