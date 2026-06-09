import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerAPI } from '../../api';
import { PageHeader, SearchBar, StatusBadge, PageLoader, EmptyState, Modal, Select } from '../../components/common';
import { Users, MessageSquare, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrainerStudents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ readinessScore: 50, feedback: '', category: 'overall' });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['trainer-students', search, placementStatus],
    queryFn: () => trainerAPI.getStudents({ search, placementStatus }).then(r => r.data.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => trainerAPI.updateReadiness(id, data),
    onSuccess: () => {
      toast.success('Feedback submitted!');
      qc.invalidateQueries(['trainer-students']);
      qc.invalidateQueries(['trainer-dashboard']);
      setFeedbackModal(null);
    },
    onError: () => toast.error('Failed to update')
  });

  const getReadinessColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-5">
      <PageHeader title="My Students" subtitle={`${students.length} assigned students`} />

      <div className="flex gap-3 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search students..." className="flex-1 min-w-48" />
        <Select value={placementStatus} onChange={setPlacementStatus}
          options={[{ value: 'not_placed', label: 'Not Placed' }, { value: 'shortlisted', label: 'Shortlisted' }, { value: 'placed', label: 'Placed' }]}
          placeholder="All Status" className="w-44" />
      </div>

      {isLoading ? <PageLoader /> : students.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No students found" subtitle="No students match your search." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map(s => (
            <div key={s._id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold flex-shrink-0">
                  {s.firstName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{s.firstName} {s.lastName}</h3>
                  <p className="text-xs text-gray-400">{s.branch} • CGPA: {s.cgpa || '—'}</p>
                  <p className="text-xs text-gray-400">{s.user?.email}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {s.skills?.slice(0, 3).map((sk, i) => <span key={i} className="badge badge-gray">{sk}</span>)}
                {(s.skills?.length || 0) > 3 && <span className="badge badge-gray">+{s.skills.length - 3}</span>}
              </div>

              {/* Readiness */}
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${getReadinessColor(s.readinessScore)}`}>
                <div className="flex items-center gap-1.5">
                  <Star size={14} />
                  <span className="text-xs font-medium">Readiness</span>
                </div>
                <span className="font-bold text-sm">{s.readinessScore || 0}/100</span>
              </div>

              <div className="flex items-center justify-between">
                <StatusBadge status={s.placementStatus} />
                <button onClick={() => { setFeedbackModal(s); setFeedbackData({ readinessScore: s.readinessScore || 50, feedback: '', category: 'overall' }); }}
                  className="btn-secondary text-xs py-1.5 px-3">
                  <MessageSquare size={12} /> Give Feedback
                </button>
              </div>

              {/* Latest feedback */}
              {s.trainerFeedback?.[0] && (
                <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Latest Feedback:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{s.trainerFeedback[0].feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!feedbackModal} onClose={() => setFeedbackModal(null)} title={`Feedback – ${feedbackModal?.firstName} ${feedbackModal?.lastName}`} size="md">
        {feedbackModal && (
          <div className="space-y-4">
            <div>
              <label className="label">Readiness Score: <span className="font-bold text-primary-600">{feedbackData.readinessScore}/100</span></label>
              <input type="range" min="0" max="100" value={feedbackData.readinessScore}
                onChange={e => setFeedbackData(p => ({ ...p, readinessScore: parseInt(e.target.value) }))}
                className="w-full accent-primary-600 mt-1" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Not Ready</span><span>Partially Ready</span><span>Fully Ready</span>
              </div>
            </div>

            <div>
              <label className="label">Category</label>
              <Select value={feedbackData.category} onChange={v => setFeedbackData(p => ({ ...p, category: v }))}
                options={[{ value: 'resume', label: 'Resume' }, { value: 'technical', label: 'Technical' }, { value: 'communication', label: 'Communication' }, { value: 'overall', label: 'Overall' }]}
                placeholder="" className="w-full" />
            </div>

            <div>
              <label className="label">Feedback</label>
              <textarea value={feedbackData.feedback} onChange={e => setFeedbackData(p => ({ ...p, feedback: e.target.value }))}
                className="input resize-none" rows={4}
                placeholder="Provide constructive feedback about the student's placement readiness..." />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setFeedbackModal(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => updateMutation.mutate({ id: feedbackModal._id, data: feedbackData })}
                disabled={updateMutation.isPending || !feedbackData.feedback.trim()}
                className="btn-primary"
              >
                {updateMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
