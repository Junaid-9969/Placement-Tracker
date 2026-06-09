import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { trainerAPI } from '../../api';
import { PageHeader, PageLoader, FormField } from '../../components/common';
import { Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrainerProfile() {
  const qc = useQueryClient();
  const [specInput, setSpecInput] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['trainer-profile'],
    queryFn: () => trainerAPI.getProfile().then(r => r.data.data)
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm();
  const specialization = watch('specialization', []);

  useEffect(() => {
    if (profile) reset({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      designation: profile.designation || '',
      bio: profile.bio || '',
      experience: profile.experience || '',
      specialization: profile.specialization || []
    });
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: trainerAPI.updateProfile,
    onSuccess: () => { toast.success('Profile updated!'); qc.invalidateQueries(['trainer-profile']); },
    onError: () => toast.error('Update failed')
  });

  const addSpec = () => {
    const s = specInput.trim();
    if (s && !specialization.includes(s)) setValue('specialization', [...specialization, s], { shouldDirty: true });
    setSpecInput('');
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your trainer information" />
      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name"><input {...register('firstName')} className="input" /></FormField>
            <FormField label="Last Name"><input {...register('lastName')} className="input" /></FormField>
            <FormField label="Phone"><input {...register('phone')} className="input" /></FormField>
            <FormField label="Designation"><input {...register('designation')} className="input" placeholder="Senior Trainer" /></FormField>
            <FormField label="Experience (years)"><input {...register('experience')} type="number" min="0" className="input" /></FormField>
            <div className="md:col-span-2">
              <FormField label="Bio">
                <textarea {...register('bio')} className="input resize-none" rows={3} placeholder="Tell students about yourself..." />
              </FormField>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Specialization</h2>
          <div className="flex gap-2 mb-3">
            <input value={specInput} onChange={e => setSpecInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); } }}
              className="input flex-1" placeholder="e.g. Full Stack, DSA, Python" />
            <button type="button" onClick={addSpec} className="btn-primary"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {specialization.map((s, i) => (
              <span key={i} className="badge badge-purple py-1 px-3 flex items-center gap-1.5">
                {s}
                <button type="button" onClick={() => setValue('specialization', specialization.filter(sp => sp !== s), { shouldDirty: true })}><X size={11} /></button>
              </span>
            ))}
            {specialization.length === 0 && <p className="text-sm text-gray-400">No specializations added</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="card p-5 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-2xl font-bold text-primary-600">{profile?.assignedStudents?.length || 0}</p><p className="text-sm text-gray-500">Assigned Students</p></div>
            <div><p className="text-2xl font-bold text-green-600">{profile?.reportsSubmitted || 0}</p><p className="text-sm text-gray-500">Reports Submitted</p></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updateMutation.isPending || !isDirty} className="btn-primary px-6 py-2.5">
            {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
