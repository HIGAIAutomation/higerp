"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Users, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Calendar,
  Download,
  Printer
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

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Adjustment Modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalIsPrint, setModalIsPrint] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    bonus: 0,
    incentive: 0,
    pf: 0,
    esi: 0,
    otherDeductions: 0
  });

  const openAdjustModal = (emp: Employee, isPrint: boolean) => {
    const basic = Number(emp.salaryBasis || 0);
    const defaultPf = Math.round(basic * 0.12);
    const defaultEsi = Math.round(basic * 0.0075);
    
    setSelectedEmployee(emp);
    setModalIsPrint(isPrint);
    setAdjustForm({
      bonus: 0,
      incentive: 0,
      pf: defaultPf,
      esi: defaultEsi,
      otherDeductions: 0
    });
    setShowAdjustModal(true);
  };

  // Month selector - Default to current month/year
  const defaultMonth = (() => {
    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  })();
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hrms/employees');
      // Show both active and inactive in payroll logs
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
    await downloadPdf(docId, docName);
  };

  const handlePrintDoc = async (docId: string, docName: string) => {
    const doc = await fetchWithAuth(`/document/${docId}`);
    if (!doc || !doc.compiledHtml) {
      throw new Error('Document layout content is empty or not found.');
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!printDoc) {
      throw new Error('Could not open print document context.');
    }

    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          color: #0f172a;
        }
        .legal-document-wrapper {
          padding: 0 !important;
          margin: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
        }
        .legal-document-wrapper * {
          color: #0f172a !important;
          background-color: transparent !important;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    `;

    printDoc.write(`
      <html>
        <head>
          <title>${docName}</title>
          ${printStyles}
        </head>
        <body>
          <div class="legal-document-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2E9EDE; padding-bottom: 12px; margin-bottom: 25px;">
              <div style="text-align: left;">
                <span style="font-family: sans-serif; font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE</span>
              </div>
              <div style="text-align: right;">
                <span style="font-family: sans-serif; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE PORTAL</span>
                <br/>
                <span style="font-family: sans-serif; font-size: 8px; font-weight: 600; color: #64748b; tracking: 0.5px;">OFFICIAL SECURE PAYSLIP</span>
              </div>
            </div>
            ${doc.compiledHtml}
          </div>
        </body>
      </html>
    `);
    printDoc.close();

    await new Promise((resolve) => setTimeout(resolve, 500));
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleGeneratePayslip = async (
    emp: Employee,
    isPrint = false,
    adjustments?: { bonus: number; incentive: number; pf: number; esi: number; otherDeductions: number }
  ) => {
    try {
      setGeneratingId(emp.id);
      setError(null);
      setSuccessMsg(null);

      // Trigger backend compilation
      const generatedDoc = await fetchWithAuth(`/hrms/employees/${emp.id}/payslip`, {
        method: 'POST',
        body: JSON.stringify({
          month: selectedMonth,
          ...adjustments
        }),
      });

      if (!generatedDoc || !generatedDoc.id) {
        throw new Error('Failed to retrieve generated document details.');
      }

      const filename = `Payslip_${emp.firstName}_${emp.lastName}_${selectedMonth.replace(/\s+/g, '_')}`;
      
      if (isPrint) {
        await handlePrintDoc(generatedDoc.id, filename);
      } else {
        await handleDownloadDoc(generatedDoc.id, filename);
      }

      setSuccessMsg(`Payslip for ${emp.firstName} ${emp.lastName} generated successfully!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate payslip. Please verify that the backend is active.');
    } finally {
      setGeneratingId(null);
    }
  };

  const monthOptions = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Payroll & Payslips</h1>
            <p className="text-muted-foreground mt-1 font-inter">Manage compensations, run monthly payrolls, and compile official employee salary payslips.</p>
          </div>

          <div className="flex items-center space-x-3 bg-card px-4 py-2.5 rounded-2xl border border-border">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payroll Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-primary focus:outline-none cursor-pointer"
            >
              {monthOptions.map(m => (
                <option key={m} value={m} className="bg-card text-foreground">{m}</option>
              ))}
            </select>
          </div>
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

        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">Employee Payroll Console</h2>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Loading employee directories...</p>
            </div>
          ) : (
            <div className="overflow-x-auto font-inter">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <th className="pb-4">Employee</th>
                    <th className="pb-4">Designation</th>
                    <th className="pb-4">Base Salary</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Payroll Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground italic font-semibold">
                        No employees found to process payroll.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-4 font-bold text-primary">{emp.firstName} {emp.lastName}</td>
                        <td className="py-4 font-medium text-foreground/80">{emp.designation}</td>
                        <td className="py-4 font-bold text-primary">₹{Number(emp.salaryBasis).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            emp.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              onClick={() => openAdjustModal(emp, false)}
                              disabled={generatingId === emp.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-background font-bold rounded-xl hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer shadow-sm disabled:opacity-75"
                            >
                              {generatingId === emp.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Compiling...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5" />
                                  Payslip
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openAdjustModal(emp, true)}
                              disabled={generatingId === emp.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary font-bold rounded-xl border border-border hover:bg-accent/10 hover:text-accent transition-all text-xs cursor-pointer shadow-sm disabled:opacity-75"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdjustModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl p-8 border border-border shadow-2xl animate-in zoom-in-95 duration-200 text-foreground font-inter">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <IndianRupee className="h-6 w-6 text-accent" />
                Adjust Payslip Components
              </h3>
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Adjust earnings and deductions for <strong className="text-primary">{selectedEmployee.firstName} {selectedEmployee.lastName}</strong> ({selectedEmployee.designation}) for <strong className="text-primary">{selectedMonth}</strong>.
              </p>
              <div className="mt-3 p-3 bg-secondary/30 rounded-2xl border border-border flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Base Salary Basis:</span>
                <span className="text-primary font-bold">₹{Number(selectedEmployee.salaryBasis).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Bonus</label>
                  <input 
                    type="number" 
                    value={adjustForm.bonus}
                    onChange={(e) => setAdjustForm({ ...adjustForm, bonus: Number(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Incentive</label>
                  <input 
                    type="number" 
                    value={adjustForm.incentive}
                    onChange={(e) => setAdjustForm({ ...adjustForm, incentive: Number(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">PF (Deduction)</label>
                  <input 
                    type="number" 
                    value={adjustForm.pf}
                    onChange={(e) => setAdjustForm({ ...adjustForm, pf: Number(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">ESI (Deduction)</label>
                  <input 
                    type="number" 
                    value={adjustForm.esi}
                    onChange={(e) => setAdjustForm({ ...adjustForm, esi: Number(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Other Deduct.</label>
                  <input 
                    type="number" 
                    value={adjustForm.otherDeductions}
                    onChange={(e) => setAdjustForm({ ...adjustForm, otherDeductions: Number(e.target.value) })}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-5 py-2.5 bg-secondary text-primary font-bold rounded-xl border border-border hover:bg-accent/10 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  handleGeneratePayslip(selectedEmployee, modalIsPrint, adjustForm);
                }}
                className="px-5 py-2.5 bg-primary text-background font-bold rounded-xl hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer shadow-md"
              >
                {modalIsPrint ? 'Confirm & Print' : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
