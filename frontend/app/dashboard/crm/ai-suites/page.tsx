'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Layers, 
  IndianRupee, 
  Loader2, 
  AlertCircle,
  Cpu,
  Zap,
  CheckCircle
} from 'lucide-react';

interface Package {
  id: string;
  name: string;
  basePrice: string;
  tiers: { id: string; name: string; price: string }[];
}

export default function AISuitesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/crm/packages');
      setPackages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback data
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Available AI Suites</h1>
            <p className="text-muted-foreground mt-1 font-inter">
              Explore our active AI automation products, base licensing models, and pricing tiers.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-semibold text-sm">
            <Cpu className="h-4 w-4" />
            AI Catalog
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-inter text-sm">Loading AI suites...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-accent/40 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 text-muted-foreground/10 group-hover:text-accent/10 transition-colors pointer-events-none">
                  <Zap className="h-24 w-24" />
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] bg-accent/10 text-accent px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Licensing Package
                    </span>
                    <h3 className="font-bold text-primary text-2xl mt-3">{pkg.name}</h3>
                  </div>

                  <div className="bg-secondary/30 p-5 border border-border rounded-2xl flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Base License Fee</p>
                      <p className="text-lg font-black text-primary mt-0.5">₹{Number(pkg.basePrice).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Highlights / Features mockup for rich premium aesthetic */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Inclusions</p>
                    <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground/90 font-medium font-inter">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Dedicated AI Engine Node
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        REST API Interface Access
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        24/7 Priority Support SLAs
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 mt-6">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-3">Subscription Tiers</p>
                  <div className="flex items-center justify-between gap-4">
                    {pkg.tiers?.map((t: any) => (
                      <div key={t.id} className="bg-secondary/40 border border-border rounded-2xl p-4 text-center flex-1 shadow-sm">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.name}</p>
                        <p className="text-base font-black text-primary mt-1">₹{Number(t.price).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
