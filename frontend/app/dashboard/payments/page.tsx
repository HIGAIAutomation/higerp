"use client";

import DashboardLayout from '@/components/layout/dashboard-layout';
import HIGLogo from '@/components/logo';
import { fetchWithAuth } from '@/lib/api';
import {
    AlertCircle,
    Clock,
    CreditCard,
    Download,
    Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  status: string;
  utrNumber?: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    whatsappNumber?: string;
    price: number;
    modules: string;
  };
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<PaymentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvId, setDownloadingInvId] = useState<string | null>(null);

  const fetchClientPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/project-payments/client');
      setPayments(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load your payment history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPayments();
  }, []);

  const handleDownloadInvoice = async (p: PaymentInvoice) => {
    setDownloadingInvId(p.id);
    try {
      const invoiceHtml = `
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; padding: 25px 35px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
            .company { font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: 1px; }
            .company-sub { font-size: 9px; font-weight: 600; color: #64748b; margin-top: 2px; }
            .header-right { text-align: right; }
            .invoice-title { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: 1px; }
            .invoice-number { font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px; }
            .project-price { font-size: 10px; font-weight: 700; color: #0f172a; margin-top: 3px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .meta-block label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 2px; }
            .meta-block span { font-size: 12px; font-weight: 600; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            thead th { background: #f1f5f9; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            tbody td { padding: 8px 10px; font-size: 12px; font-weight: 500; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .total-row td { font-weight: 800; font-size: 13px; color: #1e293b; background: #f8fafc; border-top: 2px solid #2563eb; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-paid { background: #d1fae5; color: #059669; }
            .status-pending { background: #fef3c7; color: #d97706; }
            .sign-section { margin-top: 20px; display: flex; justify-content: flex-end; }
            .sign-box { text-align: center; width: 160px; }
            .sign-header { font-size: 8px; font-weight: 700; color: #64748b; margin-bottom: 3px; letter-spacing: 0.5px; text-transform: uppercase; }
            .sign-image { height: 45px; margin-bottom: 2px; }
            .sign-label { font-size: 10px; font-weight: 700; color: #0f172a; }
            .sign-sub { font-size: 8px; font-weight: 600; color: #64748b; margin-top: 1px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">HIG AI AUTOMATION LLP</div>
              <div class="company-sub">Enterprise Resource Planning Portal</div>
            </div>
            <div class="header-right">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${p.invoiceNumber.split('#').pop()?.split('-PHASE')[0]?.trim()}</div>
              <div class="project-price">Total Project: Rs. ${p.project.price.toLocaleString()}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-block">
              <label>Bill To</label>
              <span>${p.project.clientName}</span>
            </div>
            <div class="meta-block">
              <label>Project</label>
              <span>${p.project.name}</span>
            </div>
            <div class="meta-block">
              <label>Invoice Date</label>
              <span>${p.createdAt.split('T')[0]}</span>
            </div>
            <div class="meta-block">
              <label>Due Date</label>
              <span>${p.dueDate.split('T')[0]}</span>
            </div>
            <div class="meta-block">
              <label>Email</label>
              <span>${p.project.clientEmail}</span>
            </div>
            <div class="meta-block">
              <label>Address</label>
              <span>${p.project.clientAddress}</span>
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

          <div class="sign-section">
            <div class="sign-box">
              <div style="font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 4px; letter-spacing: 1px;">AUTHORIZED BY</div>
              <div class="sign-line"></div>
              <div class="sign-label">Mr. Ajay S</div>
              <div class="sign-sub">CEO, HIG AI Automation LLP</div>
            </div>
          </div>

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

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">My Payments & Invoices</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">View your project invoice statements and verify payment clearance status.</p>
          </div>
          <HIGLogo size={48} className="hidden md:block rounded-xl border border-border shadow-sm" />
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="h-6 w-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-primary tracking-tight">Invoice History Ledger</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-2xl border border-border">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
              <p className="text-xs text-muted-foreground font-semibold">Generating your financial statements...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
              <CreditCard className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-semibold">No invoices generated yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop view table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-3">
                      <th className="pb-3">Bill Number</th>
                      <th className="pb-3">Project</th>
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
                        <td className="py-4 font-sans">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : p.utrNumber
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {p.status === 'paid' ? 'Paid' : p.utrNumber ? 'Verify Req' : 'Pending'}
                          </span>
                          {p.utrNumber && (
                            <div className="mt-1 block text-[8px] text-blue-500 font-mono uppercase font-bold tracking-wider">
                              Ref UTR: {p.utrNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-right">
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
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view card list */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {payments.map((p) => (
                  <div key={p.id} className="bg-secondary/10 p-5 rounded-2xl border border-border space-y-4 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Bill Number</span>
                        <span className="text-xs font-black text-foreground font-mono">{p.invoiceNumber}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : p.utrNumber
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {p.status === 'paid' ? 'Paid' : p.utrNumber ? 'Verify Req' : 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Project:</span>
                        <span className="text-foreground text-right">{p.project.name}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="text-accent font-bold">Rs. {parseFloat(p.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="text-foreground">{p.dueDate.split('T')[0]}</span>
                      </div>
                      {p.utrNumber && (
                        <div className="flex justify-between gap-4 pt-2 border-t border-border/40">
                          <span className="text-muted-foreground">Ref UTR:</span>
                          <span className="text-blue-500 font-mono font-bold uppercase">{p.utrNumber}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={downloadingInvId === p.id}
                      onClick={() => handleDownloadInvoice(p)}
                      className="w-full py-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-xl transition-all font-bold cursor-pointer disabled:opacity-50 text-[10px] uppercase tracking-wider border border-sky-500/20 flex items-center justify-center gap-1.5"
                    >
                      {downloadingInvId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download Invoice PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
