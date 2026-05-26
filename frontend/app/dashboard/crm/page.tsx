"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  TrendingUp, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Layers,
  DollarSign,
  User,
  ExternalLink
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contact: string;
  source: string;
  valEstimate: string;
  status: string;
}

interface Package {
  id: string;
  name: string;
  basePrice: string;
  tiers: { id: string; name: string; price: string }[];
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingQuote, setGeneratingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    companyName: '',
    contact: '',
    source: 'Website',
    valEstimate: '',
  });

  // Quote Generation Selection
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, packagesData] = await Promise.all([
        fetchWithAuth('/crm/leads'),
        fetchWithAuth('/crm/packages'),
      ]);
      setLeads(leadsData);
      setPackages(packagesData);
      
      // Auto-select first options
      if (leadsData.length > 0) setSelectedLeadId(leadsData[0].id);
      if (packagesData.length > 0) setSelectedPackageId(packagesData[0].id);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback
      setLeads([
        { id: '1', companyName: 'Acme Corp', contact: 'wile.e@acme.com', source: 'Cold Outreach', valEstimate: '45000', status: 'new' },
        { id: '2', companyName: 'Wayne Enterprises', contact: 'bruce@wayne.com', source: 'Referral', valEstimate: '120000', status: 'new' },
      ]);
      setPackages([
        {
          id: '1',
          name: 'AI Starter Pack',
          basePrice: '1500',
          tiers: [
            { id: 't1', name: 'Monthly', price: '150' },
            { id: 't2', name: 'Annual', price: '1500' }
          ]
        },
        {
          id: '2',
          name: 'Enterprise AI Automation',
          basePrice: '5000',
          tiers: [
            { id: 't3', name: 'Monthly', price: '500' },
            { id: 't4', name: 'Annual', price: '5000' }
          ]
        }
      ]);
      if (!selectedLeadId) setSelectedLeadId('1');
      if (!selectedPackageId) setSelectedPackageId('1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const payload = {
        ...form,
        valEstimate: parseFloat(form.valEstimate) || 0,
      };

      await fetchWithAuth('/crm/leads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setForm({
        companyName: '',
        contact: '',
        source: 'Website',
        valEstimate: '',
      });

      await loadData();
      setSuccessMsg('Lead added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to add lead. Please check the backend connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuote = async () => {
    if (!selectedLeadId || !selectedPackageId) return;
    try {
      setGeneratingQuote(true);
      setError(null);
      setSuccessMsg(null);

      const result = await fetchWithAuth(`/crm/leads/${selectedLeadId}/quote`, {
        method: 'POST',
        body: JSON.stringify({ packageId: selectedPackageId }),
      });

      setSuccessMsg(`Quotation dynamically generated and saved: ${result.name}!`);
    } catch (err) {
      console.error(err);
      setError('Failed to compile Sales Quotation. Verify NestJS server status.');
    } finally {
      setGeneratingQuote(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">CRM & Sales Funnel</h1>
          <p className="text-muted-foreground mt-1 font-inter">Monitor opportunities, track value estimates, and compile professional sales quotes instantly.</p>
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
          {/* Add New Lead Form */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Plus className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Capture Lead</h2>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">COMPANY NAME</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter company name"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CONTACT EMAIL / PHONE</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., contact@client.com"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SOURCE</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                  >
                    <option className="bg-card text-foreground">Website</option>
                    <option className="bg-card text-foreground">Cold Outreach</option>
                    <option className="bg-card text-foreground">Referral</option>
                    <option className="bg-card text-foreground">Social Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">ESTIMATED VALUE (USD)</label>
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-3 text-muted-foreground h-4 w-4" />
                    <input
                      required
                      type="number"
                      placeholder="e.g., 25000"
                      value={form.valEstimate}
                      onChange={(e) => setForm({ ...form, valEstimate: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-70 text-xs"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : 'Add Lead'}
                </button>
              </form>
            </div>

            {/* Smart Quote Generator Card */}
            <div className="bg-primary text-background rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-accent" />
                Sales Quote Automator
              </h3>
              <p className="text-xs text-background/70 mb-6 font-inter">Select a lead and bundle an AI automation package to generate a formal quote PDF instantly.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-background/50 mb-1">SELECT LEAD</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background/10 border border-background/10 rounded-xl focus:outline-none focus:border-accent text-xs text-background cursor-pointer"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id} className="text-foreground bg-card">{l.companyName} (${Number(l.valEstimate).toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-background/50 mb-1">SELECT PACKAGE</label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background/10 border border-background/10 rounded-xl focus:outline-none focus:border-accent text-xs text-background cursor-pointer"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id} className="text-foreground bg-card">{p.name} (${Number(p.basePrice).toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateQuote}
                  disabled={generatingQuote || leads.length === 0 || packages.length === 0}
                  className="w-full py-3 bg-accent text-primary font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 text-xs shadow-md"
                >
                  {generatingQuote ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : 'Compile Sales Quote'}
                </button>
              </div>
            </div>
          </div>

          {/* Leads Pipelines and Offerings */}
          <div className="xl:col-span-2 space-y-8">
            {/* Leads Funnel Table */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Sales Pipeline</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading leads...</p>
                </div>
              ) : (
                <div className="overflow-x-auto font-inter">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        <th className="pb-4">Company</th>
                        <th className="pb-4">Contact</th>
                        <th className="pb-4">Source</th>
                        <th className="pb-4">Estimate</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 font-bold text-primary">{l.companyName}</td>
                          <td className="py-4 text-muted-foreground">{l.contact}</td>
                          <td className="py-4 font-medium text-foreground/80">{l.source}</td>
                          <td className="py-4 font-bold text-primary">${Number(l.valEstimate).toLocaleString()}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AI Packages Offerings */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Layers className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Available AI Suites</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-6 border border-border rounded-3xl bg-secondary/30 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-primary text-base mb-2">{pkg.name}</h4>
                      <p className="text-xs text-muted-foreground mb-4 font-semibold">Base License Fee: ${Number(pkg.basePrice).toLocaleString()}</p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2">Pricing Tiers</p>
                      <div className="flex items-center justify-between">
                        {pkg.tiers?.map((t: any) => (
                          <div key={t.id} className="bg-card border border-border rounded-xl p-2 text-center w-[48%] shadow-sm">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.name}</p>
                            <p className="text-xs font-extrabold text-primary">${Number(t.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
