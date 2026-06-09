import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../api';
import { PageHeader, SearchBar, StatusBadge, Pagination, PageLoader, EmptyState, Select } from '../../components/common';
import { Briefcase, MapPin, Clock, Building2, IndianRupee, ChevronRight } from 'lucide-react';

const jobTypes = [
  { value: 'full_time', label: 'Full Time' }, { value: 'internship', label: 'Internship' },
  { value: 'part_time', label: 'Part Time' }, { value: 'contract', label: 'Contract' }
];

export default function StudentJobs() {
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['student-jobs', search, jobType, page],
    queryFn: () => jobAPI.getAll({ search, jobType, page, limit: 9 }).then(r => r.data)
  });

  const formatPackage = (pkg) => {
    if (!pkg) return null;
    if (pkg.min && pkg.max) return `₹${(pkg.min/100000).toFixed(1)}L – ₹${(pkg.max/100000).toFixed(1)}L`;
    if (pkg.min) return `₹${(pkg.min/100000).toFixed(1)}L+`;
    return null;
  };

  const daysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days}d left`;
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Browse Jobs" subtitle={`${data?.meta?.total || 0} jobs available`} />

      <div className="flex gap-3 flex-wrap">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by title or skills..." className="flex-1 min-w-48" />
        <Select value={jobType} onChange={v => { setJobType(v); setPage(1); }}
          options={jobTypes} placeholder="All Types" className="w-40" />
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {!data?.data?.length ? (
            <div className="card"><EmptyState icon={Briefcase} title="No jobs found" subtitle="Check back later or adjust your search." /></div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map(job => (
                  <Link to={`/student/jobs/${job._id}`} key={job._id}
                    className="card-hover p-5 block hover:shadow-md transition-all group">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.company?.companyName}</p>
                        </div>
                      </div>
                      <StatusBadge status={job.jobType} label={job.jobType?.replace('_',' ')} />
                    </div>

                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-1.5 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={12} /> <span>{job.location}</span>
                          <span className="badge badge-gray ml-1">{job.workMode}</span>
                        </div>
                      )}
                      {formatPackage(job.package) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <IndianRupee size={12} /> <span className="font-medium">{formatPackage(job.package)}</span>
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 text-xs ${daysLeft(job.deadline) === 'Expired' ? 'text-red-500' : daysLeft(job.deadline).startsWith('0') || daysLeft(job.deadline) === 'Today' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Clock size={12} /> <span>Deadline: {daysLeft(job.deadline)}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.requiredSkills?.slice(0, 3).map((s, i) => (
                        <span key={i} className="badge badge-blue">{s}</span>
                      ))}
                      {job.requiredSkills?.length > 3 && <span className="badge badge-gray">+{job.requiredSkills.length - 3}</span>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-xs text-gray-400">
                        Min CGPA: <span className="font-medium text-gray-600 dark:text-gray-400">{job.eligibility?.minCGPA || '—'}</span>
                      </div>
                      <span className="text-xs text-primary-600 group-hover:gap-1.5 flex items-center gap-1 transition-all">
                        View Details <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination page={page} pages={data.meta?.pages || 1} onPage={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
