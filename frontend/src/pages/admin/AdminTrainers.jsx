import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerAPI } from '../../api';
import { PageHeader, PageLoader, EmptyState, StatusBadge } from '../../components/common';
import { UserCheck } from 'lucide-react';

export default function AdminTrainers() {
  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => trainerAPI.getAll().then(r => r.data.data)
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Trainers" subtitle={`${trainers.length} registered trainers`} />
      {isLoading ? <PageLoader /> : (
        <>
          {!trainers.length ? (
            <div className="card"><EmptyState icon={UserCheck} title="No trainers found" subtitle="No trainers have registered yet." /></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Trainer</th><th>Designation</th><th>Specialization</th><th>Experience</th><th>Approved</th></tr>
                </thead>
                <tbody>
                  {trainers.map(t => (
                    <tr key={t._id}>
                      <td>
                        <p className="font-medium">{t.firstName} {t.lastName}</p>
                        <p className="text-xs text-gray-400">{t.user?.email}</p>
                      </td>
                      <td className="text-sm">{t.designation || '—'}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {t.specialization?.map((s, i) => <span key={i} className="badge badge-purple">{s}</span>)}
                        </div>
                      </td>
                      <td className="text-sm">{t.experience ? `${t.experience} yrs` : '—'}</td>
                      <td><StatusBadge status={t.user?.isApproved} label={t.user?.isApproved ? 'Yes' : 'No'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
