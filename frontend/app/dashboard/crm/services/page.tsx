'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { useUndo } from '@/components/providers/undo-provider';
import { 
  Layers, 
  IndianRupee, 
  Loader2, 
  AlertCircle,
  Cpu,
  Zap,
  CheckCircle,
  Plus,
  Tag,
  FileText,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  tiers: { id: string; name: string; price: number }[];
}

export default function ServicesCatalogPage() {
  const { showUndo } = useUndo();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [lifetimePrice, setLifetimePrice] = useState('');

  // Editing & Filter State
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
          description: 'Basic intelligence package for growing enterprises.',
          basePrice: 1500,
          tiers: [
            { id: 't1', name: 'Monthly', price: 150 },
            { id: 't2', name: 'Yearly', price: 1500 },
            { id: 't3', name: 'Lifetime', price: 10000 }
          ]
        },
        {
          id: '2',
          name: 'Enterprise AI Automation',
          description: 'Custom neural workflows and smart factory connections.',
          basePrice: 5000,
          tiers: [
            { id: 't4', name: 'Monthly', price: 500 },
            { id: 't5', name: 'Yearly', price: 5000 },
            { id: 't6', name: 'Lifetime', price: 35000 }
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

  const handleStartEdit = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description || '');
    setBasePrice(String(pkg.basePrice));
    
    const monthly = pkg.tiers.find(t => t.name === 'Monthly')?.price;
    const yearly = pkg.tiers.find(t => t.name === 'Yearly')?.price;
    const lifetime = pkg.tiers.find(t => t.name === 'Lifetime')?.price;
    
    setMonthlyPrice(monthly ? String(monthly) : '');
    setYearlyPrice(yearly ? String(yearly) : '');
    setLifetimePrice(lifetime ? String(lifetime) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPackageId(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setMonthlyPrice('');
    setYearlyPrice('');
    setLifetimePrice('');
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const tiers = [];
      if (monthlyPrice) {
        tiers.push({ name: 'Monthly', price: parseFloat(monthlyPrice) });
      }
      if (yearlyPrice) {
        tiers.push({ name: 'Yearly', price: parseFloat(yearlyPrice) });
      }
      if (lifetimePrice) {
        tiers.push({ name: 'Lifetime', price: parseFloat(lifetimePrice) });
      }

      const payload = {
        name,
        description: description || null,
        basePrice: parseFloat(basePrice) || 0,
        tiers
      };

      if (editingPackageId) {
        await fetchWithAuth(`/crm/packages/${editingPackageId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Service / Product updated successfully!');
      } else {
        await fetchWithAuth('/crm/packages', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Service / Product added successfully to catalog!');
      }

      handleCancelEdit();
      await loadPackages();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save service. Ensure your NestJS server is online.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await fetchWithAuth(`/crm/packages/${id}`, {
        method: 'DELETE'
      });
      setSelectedIds(prev => prev.filter(item => item !== id));
      await loadPackages();

      showUndo(`Service "${pkg.name}" has been deleted.`, async () => {
        const payload = {
          name: pkg.name,
          description: pkg.description,
          basePrice: pkg.basePrice,
          tiers: pkg.tiers.map(t => ({ name: t.name, price: t.price }))
        };
        await fetchWithAuth('/crm/packages', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await loadPackages();
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete service.');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredPackages.map(pkg => pkg.id);
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const selectedPkgs = packages.filter(p => selectedIds.includes(p.id));
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      
      await Promise.all(
        selectedIds.map(id => 
          fetchWithAuth(`/crm/packages/${id}`, {
            method: 'DELETE'
          })
        )
      );
      
      setSelectedIds([]);
      await loadPackages();

      showUndo(`Deleted ${selectedPkgs.length} services.`, async () => {
        await Promise.all(
          selectedPkgs.map(pkg => 
            fetchWithAuth('/crm/packages', {
              method: 'POST',
              body: JSON.stringify({
                name: pkg.name,
                description: pkg.description,
                basePrice: pkg.basePrice,
                tiers: pkg.tiers.map(t => ({ name: t.name, price: t.price }))
              })
            })
          )
        );
        await loadPackages();
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete some services.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (pkg.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (tierFilter === 'All') return matchesSearch;
    return matchesSearch && pkg.tiers?.some(t => t.name === tierFilter);
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Available Services</h1>
            <p className="text-muted-foreground mt-1 font-inter">
              Add new offerings, set licensing structures, and outline pricing for lead and quote calculations.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-semibold text-sm">
            <Cpu className="h-4 w-4" />
            Service Catalog
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Add New Service Form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {editingPackageId ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-primary" />}
                <h2 className="text-xl font-bold text-primary">
                  {editingPackageId ? 'Edit Service' : 'Create Service'}
                </h2>
              </div>
              {editingPackageId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary rounded-lg border border-border hover:border-foreground/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitService} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">PRODUCT/SERVICE NAME</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Premium IoT Analytics Node"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of features, constraints, or configurations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60 resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">BASE LICENSE FEE (INR)</label>
                <div className="relative flex items-center">
                  <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">PRICING TIERS (OPTIONAL)</p>
                
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">MONTHLY CHARGES (INR)</label>
                  <div className="relative flex items-center">
                    <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">YEARLY CHARGES (INR)</label>
                  <div className="relative flex items-center">
                    <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1500"
                      value={yearlyPrice}
                      onChange={(e) => setYearlyPrice(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">LIFETIME CHARGES (INR)</label>
                  <div className="relative flex items-center">
                    <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 10000"
                      value={lifetimePrice}
                      onChange={(e) => setLifetimePrice(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg disabled:opacity-70 text-xs mt-6 cursor-pointer ${
                  editingPackageId 
                    ? 'bg-accent text-background shadow-accent/10' 
                    : 'bg-primary text-background shadow-primary/10'
                }`}
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : editingPackageId ? 'Update Service' : 'Add to Catalog'}
              </button>
            </form>
          </div>

          {/* Catalog Listings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-3xl border border-border shadow-sm">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {filteredPackages.length > 0 && (
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filteredPackages.length > 0 && selectedIds.length === filteredPackages.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select All</span>
                  </label>
                )}
                
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Selected ({selectedIds.length})
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <div className="relative w-full sm:max-w-xs flex items-center">
                  <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs font-semibold text-foreground placeholder-muted-foreground/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Filter Tiers:</span>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="All">All Packages</option>
                    <option value="Monthly">Has Monthly Price</option>
                    <option value="Yearly">Has Yearly Price</option>
                    <option value="Lifetime">Has Lifetime Price</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-24">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-inter text-sm">Loading catalog items...</p>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="bg-secondary/30 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-sm">No products matched</p>
                <p className="text-xs mt-1">Try resetting filters or create a service template to populate the CRM catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className={`bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-accent/40 transition-colors relative overflow-hidden group ${
                      selectedIds.includes(pkg.id) ? 'border-accent/60 bg-accent/[0.02]' : 'border-border'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-6 text-muted-foreground/5 group-hover:text-accent/5 transition-colors pointer-events-none">
                      <Zap className="h-20 w-20" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3 z-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(pkg.id)}
                            onChange={() => handleToggleSelect(pkg.id)}
                            className="h-4.5 w-4.5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Active Product
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 z-10">
                          <button
                            onClick={() => handleStartEdit(pkg)}
                            title="Edit service"
                            className="p-1.5 rounded-lg bg-secondary hover:bg-accent/10 text-muted-foreground hover:text-accent border border-border hover:border-accent/20 transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            title="Delete service"
                            className="p-1.5 rounded-lg bg-secondary hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border hover:border-rose-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-primary text-lg capitalize">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground mt-1 font-medium font-inter">{pkg.description}</p>
                        )}
                      </div>

                      <div className="bg-secondary/30 p-4 border border-border rounded-xl flex items-center gap-3">
                        <IndianRupee className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Base License Fee</p>
                          <p className="text-sm font-black text-primary mt-0.5">₹{Number(pkg.basePrice).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase mb-2">Pricing Tiers</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {pkg.tiers && pkg.tiers.length > 0 ? (
                          pkg.tiers.map((t: any) => (
                            <div key={t.id} className="bg-secondary/40 border border-border rounded-xl px-3 py-2 text-center flex-1 min-w-[70px] shadow-sm">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{t.name}</p>
                              <p className="text-xs font-black text-primary mt-0.5">₹{Number(t.price).toLocaleString('en-IN')}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic font-inter">No custom pricing tiers configured.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
