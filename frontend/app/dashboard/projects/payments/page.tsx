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
  Check,
  Download
} from 'lucide-react';
import HIGLogo from '@/components/logo';

interface Project {
  id: string;
  name: string;
  category?: string;
  status: string;
  price?: number;
  whatsappNumber?: string;
  adCampaigns?: Array<{
    id: string;
    name: string;
    spend: number;
  }>;
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
    whatsappNumber?: string;
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
  const [downloadingInvId, setDownloadingInvId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'billing' | 'reminders'>('billing');

  // Form State
  const [form, setForm] = useState({
    projectId: '',
    invoiceNumber: '',
    amount: '',
    dueDate: ''
  });
  
  const [additionalPayment, setAdditionalPayment] = useState<number>(0);

  // Auto-calculate billing amount based on selected project
  useEffect(() => {
    const selectedProj = projects.find(p => p.id === form.projectId);
    if (!selectedProj) return;

    let basePrice = Number(selectedProj.price || 0);
    let campaignSpend = 0;
    let serviceCharge = 0;

    if (selectedProj.category === 'Digital Marketing') {
      const campaigns = selectedProj.adCampaigns || [];
      campaignSpend = campaigns.reduce((acc, c) => acc + Number(c.spend || 0), 0);
      if (campaigns.length > 2) {
        serviceCharge = 500;
      }
    }

    const calculatedTotal = basePrice + campaignSpend + serviceCharge + Number(additionalPayment || 0);
    setForm(f => ({ ...f, amount: calculatedTotal.toString() }));
  }, [form.projectId, additionalPayment, projects]);

  const generateNextInvoiceNumber = (existingPayments: PaymentInvoice[]) => {
    const currentYear = new Date().getFullYear();
    const prefix = `HIG/${currentYear}/`;
    
    const yearPayments = existingPayments.filter(p => p.invoiceNumber && p.invoiceNumber.startsWith(prefix));
    
    let maxNum = 0;
    yearPayments.forEach(p => {
      const parts = p.invoiceNumber.split('/');
      const numPart = parts[parts.length - 1];
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    });
    
    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    return `${prefix}${formattedNum}`;
  };

  const fetchData = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoading(true);
      // Fetch projects for selection
      const projectsData = await fetchWithAuth('/projects');
      setProjects(projectsData);

      // Fetch payment ledger
      const paymentsData = await fetchWithAuth('/project-payments');
      setPayments(paymentsData);
      setError(null);

      const nextInv = generateNextInvoiceNumber(paymentsData);
      setForm(f => ({
        ...f,
        projectId: projectsData[0]?.id || '',
        invoiceNumber: nextInv
      }));
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

      // Automatically send bill to client WhatsApp number if available
      const selectedProj = projects.find(p => p.id === form.projectId);
      if (selectedProj && selectedProj.whatsappNumber) {
        const message = `Dear Customer, a bill for your project "${selectedProj.name}" (Invoice: ${form.invoiceNumber}) of amount Rs. ${parseFloat(form.amount).toLocaleString()} has been generated. Due date: ${form.dueDate}. Please pay before the due date. Thank you!`;
        const encodedText = encodeURIComponent(message);
        const phone = selectedProj.whatsappNumber.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
      }

      // Refresh payments ledger
      const paymentsData = await fetchWithAuth('/project-payments');
      setPayments(paymentsData);
      setAdditionalPayment(0);
      const nextInv = generateNextInvoiceNumber(paymentsData);
      setForm({
        projectId: projects[0]?.id || '',
        invoiceNumber: nextInv,
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

  const handleDownloadInvoice = async (p: PaymentInvoice) => {
    setDownloadingInvId(p.id);
    try {
      const invoiceHtml = `
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: 1px; }
            .company-sub { font-size: 10px; font-weight: 600; color: #64748b; margin-top: 4px; }
            .invoice-title { font-size: 28px; font-weight: 800; color: #2563eb; text-align: right; }
            .invoice-number { font-size: 12px; font-weight: 600; color: #64748b; text-align: right; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .meta-block label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px; }
            .meta-block span { font-size: 14px; font-weight: 600; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            thead th { background: #f1f5f9; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            tbody td { padding: 14px 16px; font-size: 13px; font-weight: 500; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .total-row td { font-weight: 800; font-size: 15px; color: #1e293b; background: #f8fafc; border-top: 2px solid #2563eb; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-paid { background: #d1fae5; color: #059669; }
            .status-pending { background: #fef3c7; color: #d97706; }
            .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">HIG AI AUTOMATION LLP</div>
              <div class="company-sub">Enterprise Resource Planning Portal</div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${p.invoiceNumber}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-block">
              <label>Bill To / Project</label>
              <span>${p.project.name}</span>
            </div>
            <div class="meta-block">
              <label>Invoice Number</label>
              <span>${p.invoiceNumber}</span>
            </div>
            <div class="meta-block">
              <label>Issue Date</label>
              <span>${p.createdAt.split('T')[0]}</span>
            </div>
            <div class="meta-block">
              <label>Due Date</label>
              <span>${p.dueDate.split('T')[0]}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
                <th style="text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Project services for ${p.project.name}</td>
                <td><span class="status-badge ${p.status === 'paid' ? 'status-paid' : 'status-pending'}">${p.status}</span></td>
                <td style="text-align:right">Rs. ${parseFloat(p.amount).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="text-align:right">Total Payable:</td>
                <td style="text-align:right">Rs. ${parseFloat(p.amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${p.updatedBy ? `<p style="font-size:11px; color:#64748b; margin-bottom: 20px;">Payment cleared by: <strong>${p.updatedBy}</strong></p>` : ''}

          <div class="footer">
            <p>This is a computer-generated invoice from HIG Enterprise Portal.</p>
            <p style="margin-top:4px;">HIG AI Automation LLP &bull; All Rights Reserved &copy; ${new Date().getFullYear()}</p>
          </div>
        </body>
        </html>
      `;

      const { downloadPdfFromHtml } = await import('@/lib/download-pdf');
      await downloadPdfFromHtml(invoiceHtml, `Invoice_${p.invoiceNumber.replace(/\//g, '-')}`);
    } catch (err) {
      console.error(err);
      alert('Failed to download invoice PDF.');
    } finally {
      setDownloadingInvId(null);
    }
  };

  const getWhatsAppMessageLink = (payment: PaymentInvoice) => {
    const phone = payment.project.whatsappNumber ? payment.project.whatsappNumber.replace(/\D/g, '') : '';
    const message = `Dear Customer, a bill for your project "${payment.project.name}" (Invoice: ${payment.invoiceNumber}) of amount Rs. ${parseFloat(payment.amount).toLocaleString()} has been generated. Due date: ${payment.dueDate.split('T')[0]}. Please pay before the due date. Thank you!`;
    const encodedText = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  };

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Payment Control Centre</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Generate project invoices, dispatch WhatsApp reminders, and audit payment receipts.</p>
          </div>
          <HIGLogo size={48} className="hidden md:block rounded-xl border border-border shadow-sm" />
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === 'billing'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
          >
            Billing Console
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === 'reminders'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
          >
            Weekly Payment Reminders
          </button>
        </div>

        {activeTab === 'billing' ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Clients Directory Table */}
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-emerald-500" />
                  <h2 className="text-xl font-bold text-primary tracking-tight">Clients Directory & Billing Estimator</h2>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                  Active Clients/Projects: {projects.length}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-3">
                      <th className="pb-3">Client / Project</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Base Price</th>
                      <th className="pb-3">Campaign Spends</th>
                      <th className="pb-3">Est. Bill Amount</th>
                      <th className="pb-3">WhatsApp Number</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground/85 font-semibold">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground italic font-semibold">
                          No active projects found.
                        </td>
                      </tr>
                    ) : (
                      projects.map((p) => {
                        const isDM = p.category === 'Digital Marketing';
                        const campSpends = isDM ? (p.adCampaigns || []).reduce((acc, c) => acc + Number(c.spend || 0), 0) : 0;
                        const serviceCharge = isDM && (p.adCampaigns || []).length > 2 ? 500 : 0;
                        const totalEst = Number(p.price || 0) + campSpends + serviceCharge;

                        return (
                          <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3.5 font-bold text-foreground">{p.name}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                isDM 
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3.5 text-foreground/80">Rs. {Number(p.price || 0).toLocaleString()}</td>
                            <td className="py-3.5 text-foreground/80">
                              {isDM ? (
                                <span>Rs. {campSpends.toLocaleString()} <span className="text-[10px] text-muted-foreground">({p.adCampaigns?.length} campaigns)</span></span>
                              ) : '-'}
                            </td>
                            <td className="py-3.5 font-bold text-accent">Rs. {totalEst.toLocaleString()}</td>
                            <td className="py-3.5 text-muted-foreground">{p.whatsappNumber || 'N/A'}</td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setForm(f => ({ ...f, projectId: p.id }));
                                  const element = document.getElementById('issue-bill-form-section');
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className="px-3 py-1.5 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider border border-accent/20 cursor-pointer"
                              >
                                Select & Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="issue-bill-form-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Bill Generator Form */}
              <div className="lg:col-span-4 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex flex-col items-center mb-6">
                  <HIGLogo size={40} className="mb-3 rounded-xl border border-border shadow-sm" />
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

                  {/* Math Breakdown Display */}
                  {(() => {
                    const p = projects.find(proj => proj.id === form.projectId);
                    if (!p) return null;
                    const isDM = p.category === 'Digital Marketing';
                    const basePrice = Number(p.price || 0);
                    const campSpends = isDM ? (p.adCampaigns || []).reduce((acc, c) => acc + Number(c.spend || 0), 0) : 0;
                    const serviceCharge = isDM && (p.adCampaigns || []).length > 2 ? 500 : 0;

                    return (
                      <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs space-y-2 font-semibold">
                        <h4 className="font-bold text-primary flex items-center gap-1.5 mb-2">
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          Auto-calculated Invoice Estimate
                        </h4>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Project Price:</span>
                          <span className="font-semibold text-primary">Rs. {basePrice.toLocaleString()}</span>
                        </div>
                        {isDM && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ad Campaigns Spend ({p.adCampaigns?.length} campaigns):</span>
                              <span className="font-semibold text-primary">Rs. {campSpends.toLocaleString()}</span>
                            </div>
                            {serviceCharge > 0 && (
                              <div className="flex justify-between text-indigo-400">
                                <span className="font-medium">Campaign Service Charge (&gt; 2 campaigns):</span>
                                <span className="font-bold">Rs. 500</span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-accent">
                          <span>Subtotal estimate:</span>
                          <span>Rs. {(basePrice + campSpends + serviceCharge).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}

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
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Additional Payments (Rs)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500 (extra requests, taxes, etc.)"
                      value={additionalPayment || ''}
                      onChange={(e) => setAdditionalPayment(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Total Amount (Rs)</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 5000"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 text-sm font-semibold font-mono"
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
                    ) : 'Compile, Issue & Auto-Send'}
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
                            <td className="py-4 text-right">
                              <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                <button
                                  type="button"
                                  disabled={downloadingInvId === p.id}
                                  onClick={() => handleDownloadInvoice(p)}
                                  className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-lg transition-all font-bold hover:scale-105 cursor-pointer disabled:opacity-50 text-[10px] uppercase tracking-wider border border-sky-500/20 inline-flex items-center gap-1"
                                  title="Download Invoice"
                                >
                                  {downloadingInvId === p.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Download className="h-3 w-3" />
                                  )}
                                  Invoice
                                </button>
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
                              </div>
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
        ) : (
          <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-indigo-500" />
                <h2 className="text-2xl font-bold text-primary tracking-tight">Payment Follow-up Queue (Weekly 3x)</h2>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/20">
                Weekly schedule: Mon, Wed, Fri
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-6 font-medium">
              Below are active pending invoices configured for automatic follow-up reminders (weekly 3 times). Once a bill is marked as paid, reminders automatically stop.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-3">
                    <th className="pb-3">Invoice Number</th>
                    <th className="pb-3">Project / Client</th>
                    <th className="pb-3">Bill Amount</th>
                    <th className="pb-3">WhatsApp Phone</th>
                    <th className="pb-3">Follow-up Schedule</th>
                    <th className="pb-3">Reminder Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground/85 font-semibold">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground italic font-semibold">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const isPaid = p.status === 'paid';
                      return (
                        <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 font-bold text-foreground">{p.invoiceNumber}</td>
                          <td className="py-4 text-foreground/90">{p.project.name}</td>
                          <td className="py-4 text-accent font-bold">Rs. {parseFloat(p.amount).toLocaleString()}</td>
                          <td className="py-4 text-muted-foreground">{p.project.whatsappNumber || 'N/A'}</td>
                          <td className="py-4 text-indigo-400">
                            {isPaid ? 'Stopped (Paid)' : 'Mon, Wed, Fri (9:00 AM)'}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}>
                              {isPaid ? 'Inactive (Paid)' : 'Active (3x Weekly)'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {!isPaid ? (
                              <button
                                onClick={() => {
                                  const phone = p.project.whatsappNumber?.replace(/\D/g, '') || '';
                                  const message = `Payment Reminder: A pending bill of Rs. ${parseFloat(p.amount).toLocaleString()} for project "${p.project.name}" (Invoice: ${p.invoiceNumber}) is awaiting payment. Please settle it soon. Thank you!`;
                                  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider border border-indigo-500/20 cursor-pointer inline-flex items-center gap-1"
                              >
                                <Send className="h-3 w-3" />
                                Send Manual WA
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Cleared
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
