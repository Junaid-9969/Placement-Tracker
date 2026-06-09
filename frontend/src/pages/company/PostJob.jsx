import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { jobAPI } from '../../api';
import { PageHeader, FormField } from '../../components/common';
import { Plus, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const branches = ['ALL','CSE','IT','ECE','EEE','ME','CE','AIDS','AIML','DS','IOT','Other'];

export default function PostJob() {
  const navigate = useNavigate();
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [allowedBranches, setAllowedBranches] = useState(['ALL']);
  const [selectionProcess, setSelectionProcess] = useState(['Online Test', 'Technical Interview', 'HR Interview']);
  const [processInput, setProcessInput] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      jobType: 'full_time', workMode: 'onsite',
      'eligibility.minCGPA': 0, 'eligibility.maxBacklogs': 0,
      openings: 1
    }
  });

  const createMutation = useMutation({
    mutationFn: jobAPI.create,
    onSuccess: () => { toast.success('Job posted! Awaiting admin approval.'); navigate('/company/jobs'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post job')
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !requiredSkills.includes(s)) setRequiredSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const toggleBranch = (b) => {
    if (b === 'ALL') { setAllowedBranches(['ALL']); return; }
    setAllowedBranches(prev => {
      const without = prev.filter(x => x !== 'ALL');
      return without.includes(b) ? without.filter(x => x !== b) : [...without, b];
    });
  };

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description,
      jobType: data.jobType,
      workMode: data.workMode,
      location: data.location,
      openings: parseInt(data.openings),
      deadline: data.deadline,
      requiredSkills,
      selectionProcess,
      package: {
        min: data.packageMin ? parseInt(data.packageMin) : undefined,
        max: data.packageMax ? parseInt(data.packageMax) : undefined
      },
      eligibility: {
        minCGPA: parseFloat(data['eligibility.minCGPA']) || 0,
        maxBacklogs: parseInt(data['eligibility.maxBacklogs']) || 0,
        allowedBranches
      }
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Post a New Job" subtitle="Fill in the details to post a job for students" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Job Title" required>
                <input {...register('title', { required: 'Title is required' })} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Full Stack Developer" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </FormField>
            </div>
            <FormField label="Job Type">
              <select {...register('jobType')} className="input">
                <option value="full_time">Full Time</option>
                <option value="internship">Internship</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </FormField>
            <FormField label="Work Mode">
              <select {...register('workMode')} className="input">
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </FormField>
            <FormField label="Location">
              <input {...register('location')} className="input" placeholder="Bangalore, Karnataka" />
            </FormField>
            <FormField label="Number of Openings">
              <input {...register('openings')} type="number" min="1" className="input" />
            </FormField>
            <FormField label="Application Deadline" required>
              <input {...register('deadline', { required: 'Deadline is required' })} type="date"
                min={new Date().toISOString().split('T')[0]} className={`input ${errors.deadline ? 'input-error' : ''}`} />
              {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline.message}</p>}
            </FormField>
            <FormField label="CTC / Package Min (₹)">
              <input {...register('packageMin')} type="number" className="input" placeholder="e.g. 500000" />
            </FormField>
            <FormField label="CTC / Package Max (₹)">
              <input {...register('packageMax')} type="number" className="input" placeholder="e.g. 800000" />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Job Description" required>
                <textarea {...register('description', { required: 'Description is required' })}
                  className={`input resize-none ${errors.description ? 'input-error' : ''}`} rows={5}
                  placeholder="Describe the role, responsibilities, and what you're looking for..." />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </FormField>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Required Skills</h2>
          <div className="flex gap-2 mb-3">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              className="input flex-1" placeholder="Type skill and press Enter" />
            <button type="button" onClick={addSkill} className="btn-primary"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredSkills.map((s, i) => (
              <span key={i} className="badge badge-blue py-1 px-3 flex items-center gap-1.5">
                {s} <button type="button" onClick={() => setRequiredSkills(prev => prev.filter(sk => sk !== s))}><X size={11} /></button>
              </span>
            ))}
            {requiredSkills.length === 0 && <p className="text-sm text-gray-400">No skills added yet</p>}
          </div>
        </div>

        {/* Eligibility */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Eligibility Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField label="Minimum CGPA">
              <input {...register('eligibility.minCGPA')} type="number" step="0.1" min="0" max="10" className="input" />
            </FormField>
            <FormField label="Maximum Backlogs Allowed">
              <input {...register('eligibility.maxBacklogs')} type="number" min="0" className="input" />
            </FormField>
          </div>
          <FormField label="Allowed Branches">
            <div className="flex flex-wrap gap-2 mt-2">
              {branches.map(b => (
                <button key={b} type="button" onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    allowedBranches.includes(b)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Selection Process */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Selection Process</h2>
          <div className="space-y-2 mb-3">
            {selectionProcess.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{step}</span>
                <button type="button" onClick={() => setSelectionProcess(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={processInput} onChange={e => setProcessInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (processInput.trim()) { setSelectionProcess(prev => [...prev, processInput.trim()]); setProcessInput(''); } } }}
              className="input flex-1 text-sm" placeholder="Add selection step..." />
            <button type="button" onClick={() => { if (processInput.trim()) { setSelectionProcess(prev => [...prev, processInput.trim()]); setProcessInput(''); } }}
              className="btn-secondary text-sm">Add</button>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/company/jobs')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary px-6">
            {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
}
