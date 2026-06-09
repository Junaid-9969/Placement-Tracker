import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationAPI } from '../../api';
import { PageHeader, StatusBadge, Pagination, PageLoader, EmptyState, Select } from '../../components/common';
import { FileText } from 'lucide-react';

const statuses = ['applied','under_review','shortlisted','interview_scheduled','interview_done','selected','rejected','withdrawn'];

export default function AdminApplications() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', status, page],
    queryFn: () => applicationAPI.getAll({ status, page, limit: 15 }).then(r => r.data)
  });

  return (
    <div className="space-y-5">
      <PageHeader title="All Applications" subtitle={`${data?.meta?.total || 0} total applications`} />
      <Select value={status} onChange={v => { setStatus(v); setPage(1); }}
        options={statuses.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))}
        placeholder="All Statuses" className="w-52" />

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={FileText} title="No applications found" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Student</th><th>Job</th><th>Company</th><th>Status</th><th>Applied</th></tr>
                  </thead>
                  <tbody>
                    {data.data.map(app => (
                      <tr key={app._id}>
                        <td>
                          <p className="font-medium text-sm">{app.student?.firstName} {app.student?.lastName}</p>
                          <p className="text-xs text-gray-400">{app.student?.branch}</p>
                        </td>
                        <td className="text-sm">{app.job?.title}</td>
                        <td className="text-sm">{app.company?.companyName}</td>
                        <td><StatusBadge status={app.status} /></td>
                        <td className="text-xs text-gray-400">{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</td>
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
