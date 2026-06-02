'use client';

import HIGLogo from '@/components/logo';
import { fetchWithAuth } from '@/lib/api';
import { AlertCircle, Award, Briefcase, CheckCircle2, ChevronLeft, DollarSign, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type RegistrationType = 'employee' | 'intern' | null;

export default function RegisterEmployeePage() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee form state
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '', lastName: '', contactNumber: '', email: '', address: '', dob: '',
    emergencyContactNumber: '', aadharCard: '', panNumber: '', nationalId: '',
    highestQualification: '', collegeName: '', yearOfPassing: '', certificateId: '', marksheetId: '',
    previousCompanyName: '', designation: '', yearOfExperience: '', previousSalary: '', expectedSalary: '',
    reasonForLeaving: '', noticePeriodjl: '', profileImage: '' as string | null,
    bankHolderName: '', bankAccountNumber: '', ifscCode: '', branchName: '', upiId: '', efPfDetails: ''
  });

  // Intern form state
  const [internForm, setInternForm] = useState({
    studentName: '', registerNumber: '', collegeName: '', startDate: '', endDate: '',
    domain: '', price: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (fieldName === 'profileImage') {
          setEmployeeForm({ ...employeeForm, profileImage: event.target?.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitEmployeeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const payload = {
        type: 'employee',
        ...employeeForm,
        status: 'pending_approval'
      };
      
      const response = await fetchWithAuth('/hrms/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitInternForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internForm.studentName || !internForm.collegeName || !internForm.domain) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const payload = {
        type: 'intern',
        ...internForm,
        status: 'pending_approval'
      };
      
      const response = await fetchWithAuth('/hrms/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!registrationType) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-30%] left-[-20%] sm:top-[-20%] sm:left-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-indigo-500/10 blur-3xl sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-20%] sm:bottom-[-20%] sm:right-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-accent/10 blur-3xl sm:blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center">
            <HIGLogo size={56} className="mb-4 rounded-2xl shadow-md border border-slate-200 bg-white p-1" />
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Join Our Team
            </h1>
            <p className="text-slate-500 mt-3 font-inter text-sm sm:text-base px-4">
              Register as an Employee or Intern to get started
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Employee Registration */}
            <div 
              onClick={() => setRegistrationType('employee')}
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-xl rounded-3xl p-8 cursor-pointer transition-all group"
            >
              <div className="mb-6">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Employee</h2>
                <p className="text-slate-600 text-sm mt-2">Join as a full-time employee with comprehensive benefits</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Salary & Benefits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Career Growth
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Insurance Coverage
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
                Register as Employee
              </button>
            </div>

            {/* Internship Registration */}
            <div 
              onClick={() => setRegistrationType('intern')}
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-accent hover:shadow-xl rounded-3xl p-8 cursor-pointer transition-all group"
            >
              <div className="mb-6">
                <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Internship</h2>
                <p className="text-slate-600 text-sm mt-2">Join as an intern and gain hands-on experience</p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Learn & Develop
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Mentorship
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Certificate
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all">
                Register as Intern
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account? <Link href="/login" className="text-accent hover:underline font-bold">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Employee Registration Form
  if (registrationType === 'employee') {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setRegistrationType(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-semibold"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Selection
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900">Employee Registration</h1>
              <p className="text-slate-600 mt-2">Please fill in all required details</p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <h2 className="text-2xl font-bold text-slate-900">Registration Submitted!</h2>
                <p className="text-slate-600 max-w-md">
                  Your employee registration has been submitted for approval. A super admin will review and approve your account shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={submitEmployeeForm} className="space-y-8">
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-250 text-rose-600 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'First Name *', value: employeeForm.firstName, field: 'firstName', type: 'text' },
                      { label: 'Last Name *', value: employeeForm.lastName, field: 'lastName', type: 'text' },
                      { label: 'Email *', value: employeeForm.email, field: 'email', type: 'email' },
                      { label: 'Contact Number *', value: employeeForm.contactNumber, field: 'contactNumber', type: 'tel' },
                      { label: 'Date of Birth *', value: employeeForm.dob, field: 'dob', type: 'date' },
                      { label: 'Emergency Contact *', value: employeeForm.emergencyContactNumber, field: 'emergencyContactNumber', type: 'tel' },
                    ].map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{field.label}</label>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Address *</label>
                      <textarea
                        value={employeeForm.address}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm resize-none"
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Documents & Identification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Aadhar Card Number', field: 'aadharCard' },
                      { label: 'PAN Number', field: 'panNumber' },
                      { label: 'National ID', field: 'nationalId' },
                    ].map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{field.label}</label>
                        <input
                          type="text"
                          value={employeeForm[field.field as keyof typeof employeeForm] as string}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Profile Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'profileImage')}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Education & Qualifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Highest Qualification', field: 'highestQualification', type: 'text' },
                      { label: 'College Name', field: 'collegeName', type: 'text' },
                      { label: 'Year of Passing', field: 'yearOfPassing', type: 'number' },
                      { label: 'Certificate ID', field: 'certificateId', type: 'text' },
                      { label: 'Marksheet ID', field: 'marksheetId', type: 'text' },
                    ].map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{field.label}</label>
                        <input
                          type={field.type}
                          value={employeeForm[field.field as keyof typeof employeeForm] as string}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    Work Experience
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Previous Company Name', field: 'previousCompanyName', type: 'text' },
                      { label: 'Designation', field: 'designation', type: 'select', options: ['Developer', 'Designer', 'Prompt Engineer', 'HR', 'Manager', 'Analyst'] },
                      { label: 'Years of Experience', field: 'yearOfExperience', type: 'number' },
                      { label: 'Previous Salary', field: 'previousSalary', type: 'number' },
                      { label: 'Expected Salary', field: 'expectedSalary', type: 'number' },
                      { label: 'Notice Period (days)', field: 'noticePeriodjl', type: 'number' },
                    ].map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={employeeForm[field.field as keyof typeof employeeForm] as string}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                            disabled={isSubmitting}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={employeeForm[field.field as keyof typeof employeeForm] as string}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                            disabled={isSubmitting}
                          />
                        )}
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Reason for Leaving Previous Company</label>
                      <textarea
                        value={employeeForm.reasonForLeaving}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, reasonForLeaving: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm resize-none"
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Finance Details */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Account Holder Name', field: 'bankHolderName', type: 'text' },
                      { label: 'Bank Account Number', field: 'bankAccountNumber', type: 'text' },
                      { label: 'IFSC Code', field: 'ifscCode', type: 'text' },
                      { label: 'Branch Name', field: 'branchName', type: 'text' },
                      { label: 'UPI ID', field: 'upiId', type: 'text' },
                    ].map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{field.label}</label>
                        <input
                          type={field.type}
                          value={employeeForm[field.field as keyof typeof employeeForm] as string}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, [field.field]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">EPF/PF Details</label>
                      <textarea
                        value={employeeForm.efPfDetails}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, efPfDetails: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm resize-none"
                        rows={3}
                        placeholder="Enter EPF/PF details..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRegistrationType(null)}
                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Internship Registration Form
  if (registrationType === 'intern') {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setRegistrationType(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-semibold"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Selection
          </button>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900">Internship Registration</h1>
              <p className="text-slate-600 mt-2">Join our internship program and gain valuable experience</p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <h2 className="text-2xl font-bold text-slate-900">Registration Submitted!</h2>
                <p className="text-slate-600 max-w-md">
                  Your internship application has been submitted. A super admin will review and approve your account soon.
                </p>
              </div>
            ) : (
              <form onSubmit={submitInternForm} className="space-y-6">
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-250 text-rose-600 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Student Name *', value: internForm.studentName, field: 'studentName', type: 'text' },
                    { label: 'Registration Number *', value: internForm.registerNumber, field: 'registerNumber', type: 'text' },
                    { label: 'College Name *', value: internForm.collegeName, field: 'collegeName', type: 'text' },
                    { label: 'Start Date *', value: internForm.startDate, field: 'startDate', type: 'date' },
                    { label: 'End Date *', value: internForm.endDate, field: 'endDate', type: 'date' },
                  ].map((field) => (
                    <div key={field.field} className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">{field.label}</label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => setInternForm({ ...internForm, [field.field]: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Domain *</label>
                    <select
                      value={internForm.domain}
                      onChange={(e) => setInternForm({ ...internForm, domain: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Domain</option>
                      <option value="web-development">Web Development</option>
                      <option value="full-stack">Full Stack</option>
                      <option value="python">Python</option>
                      <option value="data-analyst">Data Analyst</option>
                      <option value="vibe-coding">VIBE Coding</option>
                      <option value="ai-prompting">AI Prompting</option>
                      <option value="ui-ux">UI/UX</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Stipend *</label>
                    <select
                      value={internForm.price}
                      onChange={(e) => setInternForm({ ...internForm, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Stipend</option>
                      <option value="5000">₹5,000</option>
                      <option value="8000">₹8,000</option>
                      <option value="15000">₹15,000</option>
                      <option value="25000">₹25,000</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRegistrationType(null)}
                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
