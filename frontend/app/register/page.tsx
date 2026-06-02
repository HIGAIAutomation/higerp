'use client';

import HIGLogo from '@/components/logo';
import { useAuth } from '@/components/providers/auth-provider';
import { AlertCircle, Calendar, CheckCircle2, KeyRound, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'employee' | 'intern'>('employee');
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register(username, password, dob, address);
      // generate HRMS record id
      const raw = localStorage.getItem('hrms_records')
      const records = raw ? JSON.parse(raw) : []
      const nextEmpId = (records:any[]) => {
        const emp = records.filter((r:any)=>r.type==='employee')
        return `emp${String(emp.length+1).padStart(3,'0')}`
      }
      const id = role === 'employee' ? nextEmpId(records) : `int${String(records.filter((r:any)=>r.type==='intern').length+1).padStart(3,'0')}`
      const record = { id, type: role, data: { username, dob, address, ...formData }, status: 'pending', createdAt: new Date().toISOString() }
      records.push(record)
      localStorage.setItem('hrms_records', JSON.stringify(records))
      const arRaw = localStorage.getItem('access_requests')
      const ars = arRaw ? JSON.parse(arRaw) : []
      ars.push({ id, type: role, status: 'pending', requestedAt: new Date().toISOString() })
      localStorage.setItem('access_requests', JSON.stringify(ars))
      alert(`Registered and saved HR record ${id}. Awaiting super admin approval.`)
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Orbs - Responsive sizing */}
      <div className="absolute top-[-30%] left-[-20%] sm:top-[-20%] sm:left-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-indigo-500/10 blur-3xl sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] sm:bottom-[-20%] sm:right-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-accent/10 blur-3xl sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <HIGLogo size={48} className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl shadow-md border border-slate-200 bg-white p-1" />
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 font-inter text-xs sm:text-sm px-2">
            Register your credentials to get access
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl w-full">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-slate-500 font-inter text-xs sm:text-sm max-w-xs">
                Your account has been created. Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-250 text-rose-600 text-xs sm:text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Role
                </label>
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="role" value="employee" checked={role==='employee'} onChange={()=>setRole('employee')} /> Employee</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="role" value="intern" checked={role==='intern'} onChange={()=>setRole('intern')} /> Intern</label>
                </div>
              </div>

              {/* layout: responsive grid for fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* conditional fields for employee/intern */}
              {role === 'employee' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">First name</label>
                    <input type="text" placeholder="First name" onChange={e=>setFormData((s:any)=>({...s, firstName: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Last name</label>
                    <input type="text" placeholder="Last name" onChange={e=>setFormData((s:any)=>({...s, lastName: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Contact number</label>
                    <input type="text" placeholder="Contact number" onChange={e=>setFormData((s:any)=>({...s, contact: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Emergency contact</label>
                    <input type="text" placeholder="Emergency contact" onChange={e=>setFormData((s:any)=>({...s, emergencyContact: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Aadhar</label>
                    <input type="text" placeholder="Aadhar" onChange={e=>setFormData((s:any)=>({...s, aadhar: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">PAN</label>
                    <input type="text" placeholder="PAN" onChange={e=>setFormData((s:any)=>({...s, pan: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Highest qualification</label>
                    <input type="text" placeholder="Highest qualification" onChange={e=>setFormData((s:any)=>({...s, qualification: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">College name</label>
                    <input type="text" placeholder="College name" onChange={e=>setFormData((s:any)=>({...s, college: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Year of passing</label>
                    <input type="text" placeholder="Year of passing" onChange={e=>setFormData((s:any)=>({...s, yearOfPassing: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Previous company</label>
                    <input type="text" placeholder="Previous company" onChange={e=>setFormData((s:any)=>({...s, previousCompany: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Designation</label>
                    <select onChange={e=>setFormData((s:any)=>({...s, designation: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm">
                      <option value="">Select</option>
                      <option value="developer">developer</option>
                      <option value="designer">designer</option>
                      <option value="prompt engineer">prompt engineer</option>
                      <option value="hr">hr</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Years of experience</label>
                    <input type="text" placeholder="Years of experience" onChange={e=>setFormData((s:any)=>({...s, experience: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Previous salary</label>
                    <input type="text" placeholder="Previous salary" onChange={e=>setFormData((s:any)=>({...s, previousSalary: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Expected salary</label>
                    <input type="text" placeholder="Expected salary" onChange={e=>setFormData((s:any)=>({...s, expectedSalary: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Reason for leaving</label>
                    <input type="text" placeholder="Reason for leaving" onChange={e=>setFormData((s:any)=>({...s, reasonForLeaving: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Notice period</label>
                    <input type="text" placeholder="Notice period" onChange={e=>setFormData((s:any)=>({...s, noticePeriod: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>

                  <h4 className="mt-3 font-bold lg:col-span-3">Finance details</h4>
                  <div className="space-y-2 lg:col-span-3">
                    <input type="text" placeholder="Holder name" onChange={e=>setFormData((s:any)=>({...s, bankHolder: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                    <input type="text" placeholder="Bank account no" onChange={e=>setFormData((s:any)=>({...s, bankAccount: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                    <input type="text" placeholder="IFSC" onChange={e=>setFormData((s:any)=>({...s, ifsc: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                    <input type="text" placeholder="Branch" onChange={e=>setFormData((s:any)=>({...s, branch: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                    <input type="text" placeholder="UPI id" onChange={e=>setFormData((s:any)=>({...s, upi: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                    <textarea placeholder="EPF/ESI details" onChange={e=>setFormData((s:any)=>({...s, epfDetails: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm resize-none" />
                  </div>
                </>
              )}

              {role === 'intern' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Student name</label>
                    <input type="text" placeholder="Student name" onChange={e=>setFormData((s:any)=>({...s, studentName: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Register number</label>
                    <input type="text" placeholder="Register number" onChange={e=>setFormData((s:any)=>({...s, registerNumber: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">College name</label>
                    <input type="text" placeholder="College name" onChange={e=>setFormData((s:any)=>({...s, college: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Start date</label>
                    <input type="date" onChange={e=>setFormData((s:any)=>({...s, startDate: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">End date</label>
                    <input type="date" onChange={e=>setFormData((s:any)=>({...s, endDate: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Domain</label>
                    <select onChange={e=>setFormData((s:any)=>({...s, domain: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm">
                      <option value="">Select domain</option>
                      <option value="web development">web development</option>
                      <option value="full stack">full stack</option>
                      <option value="python">python</option>
                      <option value="data analyst">data analyst</option>
                      <option value="vibe coding">vibe coding</option>
                      <option value="ai prompting">ai prompting</option>
                      <option value="ui/ux">ui/ux</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">Price</label>
                    <select onChange={e=>setFormData((s:any)=>({...s, price: e.target.value}))} className="w-full pl-4 pr-4 py-3 bg-sky-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm">
                      <option value="">Select price</option>
                      <option value="25000">25000</option>
                      <option value="5000">5000</option>
                      <option value="8000">8000</option>
                      <option value="15000">15000</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-sky-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-sky-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-sky-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 sm:top-3.5 left-0 pl-3 sm:pl-4 flex items-start pointer-events-none">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-1" />
                  </div>
                  <textarea
                    placeholder="Enter your street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-sky-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] hover:bg-accent/90 transition-all shadow-xl shadow-accent/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-center text-xs sm:text-sm font-inter text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:underline font-bold">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
