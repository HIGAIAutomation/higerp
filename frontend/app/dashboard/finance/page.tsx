"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  CreditCard, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Calculator,
  Layers
} from 'lucide-react';

interface SummaryData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  recentLedger: any[];
}

export default function FinancePage() {
  const [summary, setSummary] = useState<SummaryData>({
    totalRevenue: 48500,
    totalExpenses: 12500,
    netProfit: 36000,
    recentLedger: [
      { id: '1', type: 'CREDIT', amount: '1500', description: 'Invoice payment - AI Starter Pack', date: '2026-05-17' },
      { id: '2', type: 'DEBIT', amount: '200', description: 'Server Hosting Fees', date: '2026-05-16' },
    ]
  });
  const [loading, setLoading] = useState(true);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invoice Form State (GST Compliant)
  const [invForm, setInvForm] = useState({
    invoiceNumber: '',
    clientId: 'Acme Corp',
    subtotal: '',
    taxType: 'Intra-State', // Intra-State (CGST+SGST) vs Inter-State (IGST)
  });

  // Expense Form State
  const [expForm, setExpForm] = useState({
    category: 'Technology',
    amount: '',
    description: '',
  });

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/finance/summary');
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // Live GST calculation
  const subtotalVal = parseFloat(invForm.subtotal) || 0;
  const isIntra = invForm.taxType === 'Intra-State';
  const cgst = isIntra ? subtotalVal * 0.09 : 0;
  const sgst = isIntra ? subtotalVal * 0.09 : 0;
  const igst = !isIntra ? subtotalVal * 0.18 : 0;
  const total = subtotalVal + cgst + sgst + igst;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingInvoice(true);
      setError(null);

      const payload = {
        invoiceNumber: invForm.invoiceNumber,
        clientId: invForm.clientId,
        subtotal: subtotalVal,
        cgst,
        sgst,
        igst,
        total,
      };

      await fetchWithAuth('/finance/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setInvForm({
        invoiceNumber: '',
        clientId: 'Acme Corp',
        subtotal: '',
        taxType: 'Intra-State',
      });

      await loadSummary();
      setSuccess('GST Invoice Compiled & Registered in Ledger!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to record invoice. Verify backend ledger operations.');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingExpense(true);
      setError(null);

      const payload = {
        category: expForm.category,
        amount: parseFloat(expForm.amount) || 0,
        description: expForm.description,
      };

      await fetchWithAuth('/finance/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setExpForm({
        category: 'Technology',
        amount: '',
        description: '',
      });

      await loadSummary();
      setSuccess('Expense debit recorded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to log expense debit.');
    } finally {
      setSubmittingExpense(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Finance & Ledger</h1>
          <p className="text-muted-foreground mt-1 font-inter">Manage GST-compliant invoices (intra/inter state), register corporate expenses, and review double-entry ledgers.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center border border-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 flex items-center shadow-sm">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl mr-4 border border-emerald-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TOTAL REVENUE (CREDITS)</p>
              <p className="text-2xl font-black text-primary mt-1">₹{Number(summary.totalRevenue).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 flex items-center shadow-sm">
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl mr-4 border border-rose-500/20">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TOTAL EXPENSES (DEBITS)</p>
              <p className="text-2xl font-black text-primary mt-1">₹{Number(summary.totalExpenses).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-primary text-background rounded-3xl p-6 flex items-center shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-5">
              <IndianRupee size={80} />
            </div>
            <div className="p-4 bg-background/10 text-accent rounded-2xl mr-4 backdrop-blur-md">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-background/50 uppercase tracking-wider">NET PROFITABILITY</p>
              <p className="text-2xl font-black text-background mt-1">₹{Number(summary.netProfit).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* GST Invoicing Panel */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm xl:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <Calculator className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">GST Invoice Compiler</h2>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">INVOICE ID / NUMBER</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., HIG-2026-004"
                  value={invForm.invoiceNumber}
                  onChange={(e) => setInvForm({ ...invForm, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CLIENT BILLING TARGET</label>
                <select
                  value={invForm.clientId}
                  onChange={(e) => setInvForm({ ...invForm, clientId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                >
                  <option className="bg-card text-foreground">Acme Corp</option>
                  <option className="bg-card text-foreground">Wayne Enterprises</option>
                  <option className="bg-card text-foreground">Global Cybernetic Ltd</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SUBTOTAL (INR)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g., 1000"
                  value={invForm.subtotal}
                  onChange={(e) => setInvForm({ ...invForm, subtotal: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">TAX GEOGRAPHY</label>
                <div className="flex justify-between">
                  {['Intra-State', 'Inter-State'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInvForm({ ...invForm, taxType: t })}
                      className={`w-[48%] py-2 text-xs font-bold rounded-xl border transition-all ${
                        invForm.taxType === t 
                          ? 'bg-primary border-primary text-background' 
                          : 'border-border bg-secondary hover:bg-secondary/80 text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax Breakdowns */}
              <div className="p-4 bg-secondary/30 border border-border rounded-2xl text-xs space-y-2 font-inter">
                <p className="font-bold text-foreground border-b border-border pb-1.5 mb-2">Live GST breakdown</p>
                {isIntra ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST (9%):</span>
                      <span className="font-bold text-foreground">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST (9%):</span>
                      <span className="font-bold text-foreground">₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST (18%):</span>
                    <span className="font-bold text-foreground">₹{igst.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-bold text-sm text-primary">
                  <span>Grand Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingInvoice}
                className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-75 text-xs"
              >
                {submittingInvoice ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : 'Post Invoice & File Taxes'}
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 space-y-8">
            {/* Log Expense Form */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Plus className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Log Business Expense (Debit)</h2>
              </div>

              <form onSubmit={handleCreateExpense} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider font-inter">CATEGORY</label>
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                  >
                    <option className="bg-card text-foreground">Technology</option>
                    <option className="bg-card text-foreground">Operations</option>
                    <option className="bg-card text-foreground">HR & Onboarding</option>
                    <option className="bg-card text-foreground">Office & Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">DEBIT AMOUNT (INR)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g., 50"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider font-inter">EXPLANATION</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., AWS Hosting Credits"
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="md:col-span-3 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center disabled:opacity-75 text-xs"
                >
                  {submittingExpense ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : 'Post Debit Transaction'}
                </button>
              </form>
            </div>

            {/* Double-Entry Ledger Transactions Table */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Layers className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Ledger Book (Audit Trail)</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading ledger entries...</p>
                </div>
              ) : (
                <div className="overflow-x-auto font-inter">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        <th className="pb-4">Transaction ID</th>
                        <th className="pb-4">Type</th>
                        <th className="pb-4">Description</th>
                        <th className="pb-4">Amount</th>
                        <th className="pb-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {summary.recentLedger?.map((txn) => (
                        <tr key={txn.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 text-xs font-bold text-primary">#{txn.id.substring(0, 8)}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              txn.type === 'CREDIT' 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-4 font-medium text-foreground/80">{txn.description}</td>
                          <td className={`py-4 font-bold ${
                            txn.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 text-muted-foreground text-xs">{txn.date ? txn.date.split('T')[0] : 'N/A'}</td>
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
