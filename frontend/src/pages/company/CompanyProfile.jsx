import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { companyAPI } from '../../api';
import { PageHeader, PageLoader, FormField } from '../../components/common';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const sectors = ['IT','Finance','Healthcare','Manufacturing','E-commerce','Consulting','Telecom','Other'];

export default function CompanyProfile() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => companyAPI.getProfile().then(r => r.data.data)
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  useEffect(() => {
    if (profile) reset({
      companyName: profile.companyName || '',
      description: profile.description || '',
      sector: profile.sector || '',
      website: profile.website || '',
      founded: profile.founded || '',
      employeeCount: profile.employeeCount || '',
      hrName: profile.hrName || '',
      hrEmail: profile.hrEmail || '',
      hrPhone: profile.hrPhone || '',
      hrDesignation: profile.hrDesignation || '',
      'headquarters.city': profile.headquarters?.city || '',
      'headquarters.state': profile.headquarters?.state || '',
      linkedinUrl: profile.linkedinUrl || '',
    });
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: companyAPI.updateProfile,
    onSuccess: () => { toast.success('Profile updated!'); qc.invalidateQueries(['company-profile']); },
    onError: () => toast.error('Update failed')
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" subtitle="Manage your company information" />
      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Company Name" required>
                <input {...register('companyName')} className="input" />
              </FormField>
            </div>
            <FormField label="Sector">
              <select {...register('sector')} className="input">
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Website">
              <input {...register('website')} className="input" placeholder="https://company.com" />
            </FormField>
            <FormField label="Founded Year">
              <input {...register('founded')} type="number" className="input" placeholder="2010" />
            </FormField>
            <FormField label="Employee Count">
              <input {...register('employeeCount')} className="input" placeholder="e.g. 500-1000" />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Description">
                <textarea {...register('description')} className="input resize-none" rows={3} placeholder="Tell students about your company..." />
              </FormField>
            </div>
            <FormField label="City">
              <input {...register('headquarters.city')} className="input" placeholder="Bangalore" />
            </FormField>
            <FormField label="State">
              <input {...register('headquarters.state')} className="input" placeholder="Karnataka" />
            </FormField>
            <FormField label="LinkedIn URL">
              <input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/company/..." />
            </FormField>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">HR Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="HR Name" required>
              <input {...register('hrName')} className="input" />
            </FormField>
            <FormField label="HR Email" required>
              <input {...register('hrEmail')} type="email" className="input" />
            </FormField>
            <FormField label="HR Phone">
              <input {...register('hrPhone')} className="input" />
            </FormField>
            <FormField label="HR Designation">
              <input {...register('hrDesignation')} className="input" placeholder="e.g. HR Manager" />
            </FormField>
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
