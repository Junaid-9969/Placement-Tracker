import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobAPI, applicationAPI } from '../../api';
import { PageLoader, StatusBadge, Modal } from '../../components/common';
import { Building2, MapPin, Clock, IndianRupee, Users, CheckCircle, XCircle, ChevronLeft, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobAPI.getById(id).then(r => r.data)
  });

  const applyMutation = useMutation({
    mutationFn: (data) => applicationAPI.apply(id, data),
    onSuccess: () => {
      toast.success('Application submitted!');
      setApplyModal(false);
      navigate('/student/applications');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Application failed')
  });

  if (isLoading) return <PageLoader />;

  const job = jobData?.data;
  const eligibility = jobData?.eligibilityStatus;
  if (!job) return <div className="card p-10 text-center text-gray-400">Job not found</div>;

  const deadlineDate = new Date(job.deadline);
  const isExpired = deadlineDate < new Date();
  const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
        <ChevronLeft size={16} /> Back to Jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={24} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{job.company?.companyName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <StatusBadge status={job.jobType} label={job.jobType?.replace('_',' ')} />
                  <StatusBadge status={job.workMode} label={job.workMode} />
                  {job.location && <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} />{job.location}</span>}
                </div>
              </div>
            </div>

            {/* Package */}
            {(job.package?.min || job.stipend) && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <IndianRupee size={16} className="text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {job.package?.min && job.package?.max ? `₹${(job.package.min/100000).toFixed(1)}L – ₹${(job.package.max/100000).toFixed(1)}L` :
                   job.package?.min ? `₹${(job.package.min/100000).toFixed(1)}L+` :
                   job.stipend ? `₹${job.stipend}/month` : 'Not specified'}
                </span>
                {job.jobType === 'internship' && job.stipend && <span className="text-xs text-green-600">(Stipend)</span>}
              </div>
            )}

            {/* Description */}
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Job Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>

          {/* Skills */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {job.requiredSkills?.map((s, i) => <span key={i} className="badge badge-blue py-1 px-3">{s}</span>)}
            </div>
            {job.preferredSkills?.length > 0 && <>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preferred Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s, i) => <span key={i} className="badge badge-gray">{s}</span>)}
              </div>
            </>}
          </div>

          {/* Selection Process */}
          {job.selectionProcess?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Selection Process</h3>
              <div className="flex flex-col gap-2">
                {job.selectionProcess.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply card */}
          <div className="card p-5">
            <div className={`flex items-center gap-2 mb-4 p-2.5 rounded-lg ${isExpired ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
              <Clock size={16} className={isExpired ? 'text-red-500' : 'text-blue-600'} />
              <span className={`text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                {isExpired ? 'Deadline passed' : daysLeft === 0 ? 'Deadline today!' : `${daysLeft} days left`}
              </span>
            </div>

            {/* Eligibility check */}
            {eligibility && (
              <div className={`mb-4 p-3 rounded-lg ${eligibility.isEligible ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {eligibility.isEligible ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-500" />}
                  <span className={`text-sm font-medium ${eligibility.isEligible ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {eligibility.isEligible ? 'You are eligible!' : 'Not eligible'}
                  </span>
                </div>
                {!eligibility.isEligible && eligibility.issues?.map((issue, i) => (
                  <p key={i} className="text-xs text-red-500 ml-6">{issue}</p>
                ))}
              </div>
            )}

            <button
              onClick={() => setApplyModal(true)}
              disabled={isExpired || !eligibility?.isEligible}
              className="btn-primary w-full py-2.5"
            >
              {isExpired ? 'Deadline Passed' : !eligibility?.isEligible ? 'Not Eligible' : 'Apply Now'}
            </button>
          </div>

          {/* Eligibility criteria */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Eligibility Criteria</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Min CGPA</span><span className="font-medium">{job.eligibility?.minCGPA || 'Any'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Max Backlogs</span><span className="font-medium">{job.eligibility?.maxBacklogs ?? 'Any'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Openings</span><span className="font-medium">{job.openings}</span></div>
              {job.eligibility?.allowedBranches?.length > 0 && (
                <div><span className="text-gray-500">Branches:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.eligibility.allowedBranches.map((b, i) => <span key={i} className="badge badge-gray">{b}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">About Company</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.company?.description || 'No description available.'}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Sector: <span className="font-medium text-gray-700 dark:text-gray-300">{job.company?.sector}</span></p>
              {job.company?.headquarters?.city && <p>HQ: <span className="font-medium text-gray-700 dark:text-gray-300">{job.company.headquarters.city}, {job.company.headquarters.state}</span></p>}
            </div>
            {job.company?.website && (
              <a href={job.company.website} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2">
                Visit Website <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title={`Apply for ${job.title}`} size="md">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
            Your profile and resume from your student profile will be shared with {job.company?.companyName}.
          </div>
          <div>
            <label className="label">Cover Letter (Optional)</label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className="input resize-none"
              rows={5}
              placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setApplyModal(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => applyMutation.mutate({ coverLetter })}
              disabled={applyMutation.isPending}
              className="btn-primary"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
