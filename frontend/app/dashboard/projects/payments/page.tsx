"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldAlert,
  Send,
  Check
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category?: string;
  status: string;
}

interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  status: string;
  whatsappSent: boolean;
  updatedBy?: string;
  createdAt: string;
  project: {
    name: string;
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<PaymentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingBill, setSubmittingBill] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    projectId: '',
    invoiceNumber: '',
    amount: '',
    dueDate: ''
  });

  const fetchData = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoading(true);
      // Fetch projects for selection
      const projectsData = await fetchWithAuth('/projects');
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setForm(f => ({ ...f, projectId: projectsData[0].id }));
      }

      // Fetch payment ledger
      const paymentsData = await fetchWithAuth('/project-payments');
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch billing data. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="font-sans min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-[32px] p-8 border border-border shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 mb-6 animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              This payment tracking portal is restricted to **Super Admin** users only. Your account does not possess the permissions necessary to view financial billing pipelines.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      alert('Please select a project first.');
      return;
    }
    setSubmittingBill(true);
    try {
      const response = await fetchWithAuth('/project-payments', {
        method: 'POST',
        body: JSON.stringify({
          projectId: form.projectId,
          invoiceNumber: form.invoiceNumber,
          amount: parseFloat(form.amount),
          dueDate: form.dueDate
        })
      });
      // Refresh payments ledger
      const paymentsData = await fetchWithAuth('/project-payments');
      setPayments(paymentsData);
      setForm({
        projectId: projects[0]?.id || '',
        invoiceNumber: '',
        amount: '',
        dueDate: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate project invoice.');
    } finally {
      setSubmittingBill(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    setUpdatingId(paymentId);
    try {
      await fetchWithAuth(`/project-payments/${paymentId}/pay`, {
        method: 'PUT'
      });
      // Refresh ledger
      const paymentsData = await fetchWithAuth('/project-payments');
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
      alert('Failed to mark payment as received.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getWhatsAppMessageLink = (payment: PaymentInvoice) => {
    const message = `Dear Customer, a bill for your project "${payment.project.name}" (Invoice: ${payment.invoiceNumber}) of amount Rs. ${payment.amount} has been generated. Due date: ${payment.dueDate.split('T')[0]}. Please pay before the due date. Thank you!`;
    const encodedText = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  };

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Payment Control Centre</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Generate project invoices, dispatch WhatsApp reminders, and audit payment receipts.</p>
          </div>
          <img src="/logo.png" alt="HIG Logo" className="h-12 object-contain hidden md:block rounded-xl border border-border shadow-sm" />
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Bill Generator Form */}
          <div className="lg:col-span-4 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col items-center mb-6">
              <img src="/logo.png" alt="HIG Logo" className="h-10 object-contain mb-3 rounded-xl border border-border shadow-sm" />
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-accent" strokeWidth={3} />
                <h2 className="text-xl font-bold text-accent tracking-tight font-sans">Issue New Bill</h2>
              </div>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Select Project/Client</label>
                <div className="relative">
                  <select
                    required
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold cursor-pointer appearance-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Invoice / Bill Number</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. INV-2026-001"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Amount (Rs)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Due Date</label>
                <input
                  required
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBill}
                className="w-full py-3.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl active:scale-[0.99] transition-all flex items-center justify-center shadow-lg shadow-accent/15 disabled:opacity-70 cursor-pointer text-sm uppercase tracking-wider mt-4"
              >
                {submittingBill ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : 'Compile & Issue Bill'}
              </button>
            </form>
          </div>

          {/* Payments Ledger */}
          <div className="lg:col-span-8 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-indigo-500" />
                <h2 className="text-2xl font-bold text-primary tracking-tight">Invoice Status Ledger</h2>
              </div>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/20">
                Audited Ledger
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-2xl border border-border">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
                <p className="text-xs text-muted-foreground font-semibold">Generating financial statements...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                <CreditCard className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-semibold">No invoices generated yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-3">
                      <th className="pb-3">Bill Number</th>
                      <th className="pb-3">Project / Client</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-semibold text-foreground/85">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-4 font-bold text-foreground">{p.invoiceNumber}</td>
                        <td className="py-4 text-foreground/90">{p.project.name}</td>
                        <td className="py-4 text-accent font-bold">Rs. {parseFloat(p.amount).toLocaleString()}</td>
                        <td className="py-4 flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {p.dueDate.split('T')[0]}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {p.status}
                          </span>
                          {p.updatedBy && (
                            <span className="block text-[8px] text-muted-foreground mt-1 font-semibold">
                              Cleared by: {p.updatedBy}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {p.status !== 'paid' ? (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => handleMarkAsPaid(p.id)}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all font-bold hover:scale-105 cursor-pointer disabled:opacity-50 text-[10px] uppercase tracking-wider border border-emerald-500/20 inline-flex items-center gap-1"
                                title="Mark Paid"
                              >
                                {updatingId === p.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                Mark Paid
                              </button>
                              <a
                                href={getWhatsAppMessageLink(p)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all font-bold hover:scale-105 cursor-pointer text-[10px] uppercase tracking-wider border border-indigo-500/20 inline-flex items-center gap-1"
                              >
                                <Send className="h-3 w-3" />
                                Remind WA
                              </a>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              Cleared
                            </span>
                          )}
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
    </DashboardLayout>
  );
}
