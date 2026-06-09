import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../api';
import { PageHeader, SearchBar, StatusBadge, Pagination, PageLoader, EmptyState, ConfirmDialog, Select } from '../../components/common';
import { GraduationCap, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AIDS', 'AIML', 'DS', 'IOT', 'Other'];

export default function AdminStudents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, branch, page],
    queryFn: () => studentAPI.getAll({ search, branch, page, limit: 12 }).then(r => r.data)
  });

  const deleteMutation = useMutation({
    mutationFn: studentAPI.delete,
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries(['admin-students']); },
    onError: () => toast.error('Failed to delete')
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Students" subtitle={`${data?.meta?.total || 0} registered students`} />

      <div className="flex gap-3 flex-wrap">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or roll number..." className="flex-1 min-w-48" />
        <Select
          value={branch}
          onChange={v => { setBranch(v); setPage(1); }}
          options={branches.map(b => ({ value: b, label: b }))}
          placeholder="All Branches"
          className="w-40"
        />
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={GraduationCap} title="No students found" subtitle="Try adjusting your search filters" /></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Roll No.</th><th>Branch</th><th>CGPA</th>
                      <th>Status</th><th>Approved</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map(s => (
                      <tr key={s._id}>
                        <td>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">{s.user?.email}</p>
                          </div>
                        </td>
                        <td className="font-mono text-xs">{s.rollNumber || '—'}</td>
                        <td><StatusBadge status={s.branch} label={s.branch} /></td>
                        <td><span className={`font-semibold ${s.cgpa >= 7.5 ? 'text-green-600' : s.cgpa >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>{s.cgpa || '—'}</span></td>
                        <td><StatusBadge status={s.placementStatus} /></td>
                        <td><StatusBadge status={s.user?.isApproved} label={s.user?.isApproved ? 'Yes' : 'No'} /></td>
                        <td>
                          <button onClick={() => setDeleteId(s._id)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMutation.mutate(deleteId); setDeleteId(null); }}
        title="Delete Student" message="Are you sure you want to delete this student? This action cannot be undone." danger
      />
    </div>
  );
}
