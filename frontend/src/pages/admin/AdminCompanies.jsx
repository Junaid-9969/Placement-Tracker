import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAPI } from '../../api';
import { PageHeader, SearchBar, StatusBadge, Pagination, PageLoader, EmptyState, ConfirmDialog } from '../../components/common';
import { Building2, CheckCircle, Trash2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', search, page],
    queryFn: () => companyAPI.getAll({ search, page, limit: 12 }).then(r => r.data)
  });

  const verifyMutation = useMutation({
    mutationFn: companyAPI.verify,
    onSuccess: () => { toast.success('Company verified!'); qc.invalidateQueries(['admin-companies']); },
    onError: () => toast.error('Failed to verify')
  });

  const deleteMutation = useMutation({
    mutationFn: companyAPI.delete,
    onSuccess: () => { toast.success('Company deleted'); qc.invalidateQueries(['admin-companies']); },
    onError: () => toast.error('Failed to delete')
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Companies" subtitle={`${data?.meta?.total || 0} registered companies`} />
      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search companies..." className="max-w-sm" />

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={Building2} title="No companies found" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Company</th><th>Sector</th><th>HR Contact</th><th>Verified</th><th>Approved</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.data.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{c.companyName}</p>
                            <p className="text-xs text-gray-400">{c.user?.email}</p>
                          </div>
                        </td>
                        <td><span className="badge badge-blue">{c.sector}</span></td>
                        <td>
                          <p className="text-sm">{c.hrName}</p>
                          <p className="text-xs text-gray-400">{c.hrEmail}</p>
                        </td>
                        <td>
                          {c.isVerified ? (
                            <span className="badge badge-green">Verified</span>
                          ) : (
                            <button onClick={() => verifyMutation.mutate(c._id)} className="btn-success text-xs py-1 px-2">
                              <CheckCircle size={12} /> Verify
                            </button>
                          )}
                        </td>
                        <td><StatusBadge status={c.user?.isApproved} label={c.user?.isApproved ? 'Yes' : 'No'} /></td>
                        <td>
                          <button onClick={() => setDeleteId(c._id)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <Trash2 size={14} />
                          </button>
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
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteId); setDeleteId(null); }}
        title="Delete Company" message="Delete this company and all its data?" danger />
    </div>
  );
}
