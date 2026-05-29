"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Users, 
  UserMinus, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Calendar,
  Download,
  Info
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
  documents?: any[];
}

export default function OffboardingPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [form, setForm] = useState({
    relievingDate: new Date().toISOString().split('T')[0],
    reason: 'Resignation',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hrms/employees');
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const result = await fetchWithAuth(`/hrms/employees/${selectedEmpId}/close`, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setSuccessMsg(`Employee status updated to Inactive. Closing Agreement generated successfully!`);
      setSelectedEmpId('');
      setForm({
        relievingDate: new Date().toISOString().split('T')[0],
        reason: 'Resignation',
      });
      await fetchEmployees();
    } catch (err: any) {
      console.error(err);
      setError('Failed to offboard employee. Please make sure the backend is active.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeEmployees = employees.filter(e => e.status === 'active');
  const inactiveEmployees = employees.filter(e => e.status === 'inactive');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Employee Offboarding</h1>
          <p className="text-muted-foreground mt-1 font-inter">Gracefully close employee lifecycles and generate relieving document agreements.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center border border-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Offboarding workspace form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <UserMinus className="h-6 w-6 text-rose-500" />
              <h2 className="text-xl font-bold text-primary">Close Employee</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SELECT ACTIVE EMPLOYEE</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">RELIEVING DATE</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="date"
                    value={form.relievingDate}
                    onChange={(e) => setForm({ ...form, relievingDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">REASON FOR CLOSING</label>
                <select
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                >
                  <option value="Resignation">Resignation</option>
                  <option value="Termination">Termination</option>
                  <option value="Contract Ended">Contract Ended</option>
                  <option value="Retirement">Retirement</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedEmpId}
                className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-rose-600/10 disabled:opacity-50 disabled:hover:scale-100 text-xs cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing Offboarding...
                  </>
                ) : 'Close Employee & Generate Agreement'}
              </button>
            </form>
          </div>

          {/* Closed employee list */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <UserMinus className="h-6 w-6 text-muted-foreground" />
                  <h2 className="text-xl font-bold text-primary">Offboarded Employee Log</h2>
                </div>
                <span className="text-xs bg-secondary text-primary font-bold px-3 py-1 rounded-full border border-border">
                  Closed: {inactiveEmployees.length}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading offboarded employees...</p>
                </div>
              ) : (
                <div className="overflow-x-auto font-inter">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Designation</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-right">Closing Agreement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {inactiveEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground italic font-semibold">
                            No offboarded employees found in logs.
                          </td>
                        </tr>
                      ) : (
                        inactiveEmployees.map((emp) => {
                          const closingDoc = emp.documents?.find(d => d.template?.name === 'Closing Agreement');
                          return (
                            <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="py-4 font-bold text-primary">{emp.firstName} {emp.lastName}</td>
                              <td className="py-4 text-muted-foreground">{emp.email}</td>
                              <td className="py-4 font-medium text-foreground/80">{emp.designation}</td>
                              <td className="py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                  {emp.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                {closingDoc ? (
                                  <button
                                    onClick={() => handleDownloadDoc(closingDoc.id, 'Relieving_Experience_Letter')}
                                    disabled={downloadingDocId === closingDoc.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-background font-bold rounded-xl hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer shadow-sm"
                                  >
                                    {downloadingDocId === closingDoc.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Download className="h-3.5 w-3.5" />
                                    )}
                                    Download
                                  </button>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No document found</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
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
