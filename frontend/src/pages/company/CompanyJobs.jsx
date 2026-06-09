import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../api';
import { PageHeader, StatusBadge, PageLoader, EmptyState, ConfirmDialog } from '../../components/common';
import { Briefcase, Plus, Trash2, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyJobs() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['company-jobs'],
    queryFn: () => jobAPI.getMyJobs().then(r => r.data.data)
  });

  const deleteMutation = useMutation({
    mutationFn: jobAPI.delete,
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries(['company-jobs']); },
    onError: () => toast.error('Failed to delete')
  });

  return (
    <div className="space-y-5">
      <PageHeader title="My Job Postings" subtitle={`${jobs.length} total jobs`}
        action={<Link to="/company/jobs/post" className="btn-primary"><Plus size={16} /> Post New Job</Link>} />

      {isLoading ? <PageLoader /> : jobs.length === 0 ? (
        <div className="card">
          <EmptyState icon={Briefcase} title="No jobs posted yet"
            subtitle="Post your first job to start receiving applications."
            action={<Link to="/company/jobs/post" className="btn-primary"><Plus size={16} /> Post a Job</Link>} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map(job => (
            <div key={job._id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{job.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <StatusBadge status={job.status} />
                    <StatusBadge status={job.isApproved} label={job.isApproved ? 'Approved' : 'Pending Approval'} />
                  </div>
                </div>
                <button onClick={() => setDeleteId(job._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Users size={11} /> {job.applicationCount || 0} applications</span>
                <span className="flex items-center gap-1"><Clock size={11} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {job.requiredSkills?.slice(0, 3).map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)}
                {job.requiredSkills?.length > 3 && <span className="badge badge-gray">+{job.requiredSkills.length - 3}</span>}
              </div>

              <div className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                Min CGPA: {job.eligibility?.minCGPA || '—'} • Openings: {job.openings}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteId); setDeleteId(null); }}
        title="Delete Job" message="Delete this job posting? All applications will also be removed." danger />
    </div>
  );
}
