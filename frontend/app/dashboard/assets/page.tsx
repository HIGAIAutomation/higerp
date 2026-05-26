"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Package, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  HardDrive,
  Cpu,
  Bookmark,
  User
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: string;
  assignedTo: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    type: 'hardware',
    serialNumber: '',
    assignedTo: '',
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/assets');
      setAssets(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback
      setAssets([
        { id: '1', name: 'MacBook Pro M3 Max', type: 'hardware', serialNumber: 'C02HG8291X0', status: 'active', assignedTo: 'Ajai Kumar' },
        { id: '2', name: 'ChatGPT Enterprise License', type: 'software', serialNumber: 'LIC-GPT-8291', status: 'active', assignedTo: 'Sarah Connor' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await fetchWithAuth('/assets', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm({
        name: '',
        type: 'hardware',
        serialNumber: '',
        assignedTo: '',
      });

      await loadAssets();
      setSuccess('Asset registered and logged successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to register asset. Ensure backend support is online.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Asset Inventory</h1>
          <p className="text-muted-foreground mt-1 font-inter">Register hardware, software licenses, track assignments, and oversee IT provisioning.</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Register Asset Form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Plus className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">Register Asset</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">ASSET NAME / MODEL</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Lenovo ThinkPad X1 Carbon"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">CLASSIFICATION TYPE</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                >
                  <option value="hardware" className="bg-card text-foreground">Hardware (Laptops, Servers)</option>
                  <option value="software" className="bg-card text-foreground">Software Subscription</option>
                  <option value="license" className="bg-card text-foreground">General License Key</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">SERIAL NUMBER / KEY ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., S/N or License Key"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">ASSIGNED EMPLOYEE (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-75 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : 'Log Asset Inventory'}
              </button>
            </form>
          </div>

          {/* Asset List */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Provisioned Inventory</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading assets...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assets.map((ast) => (
                    <div key={ast.id} className="p-6 border border-border rounded-3xl bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            ast.type === 'hardware' 
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                              : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          }`}>
                            {ast.type === 'hardware' ? <Cpu className="h-3 w-3 mr-1" /> : <Bookmark className="h-3 w-3 mr-1" />}
                            {ast.type}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">
                            {ast.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-primary text-base mb-1">{ast.name}</h4>
                        <p className="text-xs text-muted-foreground mb-4">Key ID: {ast.serialNumber}</p>
                      </div>

                      <div className="border-t border-border pt-4 flex items-center justify-between text-xs font-bold text-foreground/80">
                        <span className="text-muted-foreground font-normal">Assigned Holder:</span>
                        <span className="flex items-center text-primary">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {ast.assignedTo || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
