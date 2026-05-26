"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Users, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Mail,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  joiningDate: string;
  status: string;
  salaryBasis: string;
}

export default function HRMSPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    salaryBasis: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  // Success response from creation (contains auto-generated docs)
  const [onboardingDocs, setOnboardingDocs] = useState<any[]>([]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hrms/employees');
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Mock fallback
      setEmployees([
        { id: '1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@hig.ai', designation: 'AI Research Director', joiningDate: '2026-04-10', status: 'active', salaryBasis: '8500' },
        { id: '2', firstName: 'John', lastName: 'Doe', email: 'john@hig.ai', designation: 'Senior AI Engineer', joiningDate: '2026-05-01', status: 'active', salaryBasis: '6200' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const payload = {
        ...form,
        salaryBasis: parseFloat(form.salaryBasis) || 0,
        joiningDate: new Date(form.joiningDate).toISOString(),
      };

      const result = await fetchWithAuth('/hrms/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Display the auto-generated documents returned in NestJS result
      if (result.documents) {
        setOnboardingDocs(result.documents);
      }
      
      // Reset form & reload directory
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        designation: '',
        salaryBasis: '',
        joiningDate: new Date().toISOString().split('T')[0],
      });

      await fetchEmployees();
    } catch (err: any) {
      console.error(err);
      setError('Failed to onboard employee. Please make sure the backend is active.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">HRMS & Talent Management</h1>
          <p className="text-muted-foreground mt-1 font-inter">Manage employee lifecycle and trigger instant onboarding legal documentation.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Onboard New Employee Form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <UserPlus className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">Onboard Talent</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">FIRST NAME</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full pl-3 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">LAST NAME</label>
                <input
                  required
                  type="text"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">EMAIL ADDRESS</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="email"
                    placeholder="name@hig.ai"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">DESIGNATION</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="text"
                    placeholder="e.g., Software Architect"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SALARY BASIS (MONTHLY USD)</label>
                <div className="relative flex items-center">
                  <DollarSign className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="number"
                    placeholder="e.g., 5000"
                    value={form.salaryBasis}
                    onChange={(e) => setForm({ ...form, salaryBasis: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">JOINING DATE</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-70 disabled:hover:scale-100 text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Onboarding...
                  </>
                ) : 'Onboard & Generate Docs'}
              </button>
            </form>
          </div>

          {/* Directory & Generated Docs */}
          <div className="xl:col-span-2 space-y-8">
            {/* Auto-generated Onboarding Docs Feed */}
            {onboardingDocs.length > 0 && (
              <div className="bg-primary text-background rounded-3xl p-8 shadow-xl animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center space-x-3 mb-6 border-b border-background/10 pb-4">
                  <FileText className="h-6 w-6 text-accent" />
                  <div>
                    <h2 className="text-xl font-bold">Generated Onboarding Suite</h2>
                    <p className="text-xs text-background/50">Documents dynamically compiled and ready in database</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onboardingDocs.map((doc: any, index: number) => (
                    <div key={index} className="p-4 rounded-2xl bg-background/5 border border-background/10 flex items-center justify-between hover:bg-background/10 transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-accent/20 rounded-lg mr-3">
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-background max-w-[180px] truncate">{doc.name || 'Onboarding Document'}</p>
                          <p className="text-[10px] text-background/50">Status: {doc.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Generated
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employee Directory */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-primary">Employee Directory</h2>
                </div>
                <span className="text-xs bg-secondary text-primary font-bold px-3 py-1 rounded-full border border-border">
                  Total: {employees.length}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading directory...</p>
                </div>
              ) : (
                <div className="overflow-x-auto font-inter">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Designation</th>
                        <th className="pb-4">Joined</th>
                        <th className="pb-4">Salary</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 font-bold text-primary">{emp.firstName} {emp.lastName}</td>
                          <td className="py-4 text-muted-foreground">{emp.email}</td>
                          <td className="py-4 font-medium text-foreground/80">{emp.designation}</td>
                          <td className="py-4 text-muted-foreground">{emp.joiningDate ? emp.joiningDate.split('T')[0] : 'N/A'}</td>
                          <td className="py-4 font-bold text-primary">${Number(emp.salaryBasis).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
