"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  Briefcase, 
  Calendar,
  FileCheck,
  Download,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Search,
  Filter,
  X,
  Plus
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  moduleDetails?: any;
  client?: any;
  clientId?: string;
  price?: number | string;
  whatsappNumber?: string;
  clientEmail?: string;
  clientAddress?: string;
}

interface GeneratedDoc {
  id: string;
  templateId: string;
  entityType: string;
  entityId: string;
  filePath: string;
  status: string;
  createdAt: string;
  template?: {
    name: string;
    category: string;
  };
}

export default function WebAppProjectsPage() {
  const { user } = useAuth();
  const isStaffOrClient = user?.role ? ['superadmin', 'admin', 'employee', 'client'].includes(user.role) : false;

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<Record<string, GeneratedDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pay Now States
  const [payments, setPayments] = useState<any[]>([]);
  const [payModalData, setPayModalData] = useState<{
    projectId: string;
    projectName: string;
    phaseNum: number;
    amount: number;
    invoiceNumber: string;
  } | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Filtration states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM

  // Client Request Modules States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPhase, setRequestPhase] = useState<number>(1);
  const [requestModules, setRequestModules] = useState<Array<{ name: string; description: string }>>([
    { name: '', description: '' }
  ]);

  const handleRequestModulesClick = () => {
    alert("you should pay extra charges for this module - once module created team will be contact you");
    const currentProj = projects[0];
    if (currentProj) {
      const modules = Array.isArray(currentProj.moduleDetails) ? currentProj.moduleDetails : [];
      let maxPhase = 0;
      modules.forEach((m: any, idx: number) => {
        const total = modules.length;
        const chunkSize = Math.ceil(total / 4) || 1;
        const defaultPhase = Math.floor(idx / chunkSize) + 1;
        const phase = m.phase || defaultPhase;
        if (phase > maxPhase) {
          maxPhase = phase;
        }
      });
      setRequestPhase(maxPhase + 1);
    } else {
      setRequestPhase(1);
    }
    setRequestModules([{ name: '', description: '' }]);
    setShowRequestModal(true);
  };

  const handleAddModuleField = () => {
    setRequestModules([...requestModules, { name: '', description: '' }]);
  };

  const handleRemoveModuleField = (index: number) => {
    if (requestModules.length > 1) {
      setRequestModules(requestModules.filter((_, i) => i !== index));
    }
  };

  const handleModuleFieldChange = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...requestModules];
    updated[index][field] = value;
    setRequestModules(updated);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentProj = projects[0];
    if (!currentProj) return;

    const validNewModules = requestModules.filter(m => m.name.trim() !== '');
    if (validNewModules.length === 0) {
      alert("Please add at least one module with a name.");
      return;
    }

    try {
      setLoading(true);
      const existingModules = Array.isArray(currentProj.moduleDetails) ? currentProj.moduleDetails : [];
      const newModulesToAppend = validNewModules.map((m, idx) => ({
        id: `cmod_${Date.now()}_${idx}`,
        name: m.name.trim(),
        description: m.description.trim(),
        status: 'new',
        phase: Number(requestPhase),
        isNewRequest: true
      }));

      const updatedModuleDetails = [...existingModules, ...newModulesToAppend];

      await fetchWithAuth(`/projects/${currentProj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleDetails: updatedModuleDetails }),
      });

      alert("Your request for new modules/phase has been submitted successfully! The team will contact you shortly.");
      setShowRequestModal(false);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to request modules:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/projects');
      let filtered = data.filter((p: Project) => p.category === 'Web/App Development' || !p.category);
      if (user?.role === 'client') {
        filtered = filtered.filter((p: Project) => p.clientId === user.id || p.client?.id === user.id);
      }
      setProjects(filtered);
      
      // Load payment tracking records
      let paymentsData = [];
      try {
        if (user?.role === 'client') {
          paymentsData = await fetchWithAuth('/project-payments/client');
        } else if (user?.role === 'superadmin' || user?.role === 'admin') {
          paymentsData = await fetchWithAuth('/project-payments');
        }
      } catch (payErr) {
        console.error("Failed to load payments", payErr);
      }
      setPayments(paymentsData);
      
      const docsMap: Record<string, GeneratedDoc[]> = {};
      for (const proj of filtered) {
        try {
          const docs = await fetchWithAuth(`/document/entity/PROJECT/${proj.id}`);
          docsMap[proj.id] = docs;
        } catch (err) {
          console.error(`Failed to load docs for project ${proj.id}`, err);
        }
      }
      setProjectDocs(docsMap);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load Web/App Development projects. Make sure backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  const getPhasePayment = (projId: string, phaseNum: number) => {
    return payments.find(p => {
      if (p.projectId !== projId) return false;
      const inv = p.invoiceNumber.toUpperCase();
      if (phaseNum === 1) {
        return inv.includes('ADVANCE') || inv.includes('PHASE-1') || inv.includes('PART1');
      }
      if (phaseNum === 2) {
        return inv.includes('PHASE-2') || inv.includes('PART2');
      }
      if (phaseNum === 3) {
        return inv.includes('PHASE-3') || inv.includes('PART3');
      }
      if (phaseNum === 4) {
        return inv.includes('PHASE-4') || inv.includes('PART4');
      }
      return inv.includes(`PHASE-${phaseNum}`) || inv.includes(`PART${phaseNum}`);
    });
  };

  const handlePayNowClick = (proj: Project, phaseNum: number) => {
    const existing = getPhasePayment(proj.id, phaseNum);
    const amount = Math.round(Number(proj.price || 0) * 0.25);
    let invoiceNumber = existing?.invoiceNumber || '';
    if (!invoiceNumber) {
      const parts = proj.id.split('-');
      let suffix = `PHASE-${phaseNum}`;
      if (phaseNum === 1) suffix = 'ADVANCE';
      
      if (proj.id.startsWith('higp-') && parts.length >= 4) {
        invoiceNumber = `p/${parts[1]}/${parts[2]}-${parts[3]}-${suffix}`;
      } else {
        invoiceNumber = `INV-${proj.id}-${suffix}`;
      }
    }
    setPayModalData({
      projectId: proj.id,
      projectName: proj.name,
      phaseNum,
      amount,
      invoiceNumber
    });
    setUtrNumber('');
    setPaySuccess(false);
  };

  const handleSubmitPaymentConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalData || !utrNumber.trim()) return;
    setIsSubmittingPay(true);
    try {
      await fetchWithAuth('/project-payments/client/submit-payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: payModalData.projectId,
          invoiceNumber: payModalData.invoiceNumber,
          amount: payModalData.amount,
          utrNumber: utrNumber.trim()
        })
      });
      setPaySuccess(true);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to submit transaction details. Please try again.');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateModuleStatus = async (projectId: string, moduleId: string, newStatus: string) => {
    try {
      const proj = projects.find(p => p.id === projectId);
      if (!proj) return;
      
      const modules = proj.moduleDetails || [];
      const updatedModules = modules.map((m: any, idx: number) => {
        const id = m.id || `mod_${idx}`;
        if (id === moduleId) {
          return { ...m, status: newStatus };
        }
        return m;
      });

      await fetchWithAuth(`/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleDetails: updatedModules }),
      });
      
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, moduleDetails: updatedModules } : p));
    } catch (err) {
      console.error("Failed to update module status:", err);
      alert("Error updating module status.");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'on_hold': return 'bg-secondary text-muted-foreground border border-border';
      default: return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

  // Filter projects based on selections
  const filteredProjects = projects.filter(p => {
    if (selectedProjectId !== 'all' && p.id !== selectedProjectId) return false;
    if (dateFilter) {
      const projMonth = p.startDate ? p.startDate.substring(0, 7) : '';
      if (projMonth !== dateFilter) return false;
    }
    return true;
  });

  if (!user || !isStaffOrClient) {
    return (
      <DashboardLayout>
        <div className="font-sans min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-[32px] p-8 border border-border shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 mb-6 animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              This project dashboard is restricted to staff members. Your account does not possess the permissions necessary to view restricted project category pipelines.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fullWidth={true}>
      <div className="font-sans min-h-screen pb-12 px-4 md:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Web/App Development Projects</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Track your custom web & application build pipelines</p>
          </div>
          
          {user?.role === 'client' && projects.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                type="button"
                onClick={handleRequestModulesClick}
                className="px-5 py-3 bg-accent text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-accent/10 flex items-center gap-2 cursor-pointer text-sm"
              >
                <Plus className="h-5 w-5" />
                Request New Phase & Modules
              </button>
            </div>
          )}

          {user?.role !== 'client' && (
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer w-full sm:max-w-[200px] truncate"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id.replace(/-/g, '/')} - {p.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="month" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer w-full"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
            <p className="text-sm text-muted-foreground font-semibold">Loading project list...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-semibold">No Web/App development projects found for these filters.</p>
              </div>
            ) : (
              filteredProjects.map((proj) => {
                return (
                  <div key={proj.id} className="bg-card rounded-[32px] p-6 md:p-8 border border-border shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(proj.status)}`}>
                          {proj.status}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center font-semibold bg-secondary/50 px-3 py-1.5 rounded-xl border border-border">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground/60" />
                          {proj.startDate ? proj.startDate.split('T')[0] : 'N/A'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">{proj.name}</h3>
                      <p className="text-base text-muted-foreground mb-8 font-medium leading-relaxed max-w-4xl">{proj.description}</p>
                      
                      {/* Project Details Panel (Price, WhatsApp, etc.) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 bg-secondary/30 p-6 rounded-2xl border border-border text-sm font-semibold text-muted-foreground">
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Project ID</span>
                          <span className="text-foreground text-base font-bold uppercase truncate block">{proj.id.replace(/-/g, '/')}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client ID</span>
                          <span className="text-foreground text-base font-bold uppercase truncate block">{proj.client?.id ? proj.client.id.replace(/-/g, '/') : 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Project Price</span>
                          <span className="text-foreground text-base font-bold">Rs. {proj.price !== undefined ? Number(proj.price).toLocaleString() : '0'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">WhatsApp Contact</span>
                          <span className="text-foreground text-base font-bold truncate block">{proj.whatsappNumber || 'Not Provided'}</span>
                        </div>
                        {proj.clientEmail && (
                          <div className="col-span-1 sm:col-span-2 md:col-span-1">
                            <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client Email</span>
                            <span className="text-foreground text-base font-bold truncate block" title={proj.clientEmail}>{proj.clientEmail}</span>
                          </div>
                        )}
                        {proj.clientAddress && (
                          <div className="col-span-1 sm:col-span-2 md:col-span-1">
                            <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client Address</span>
                            <span className="text-foreground text-base font-bold truncate block" title={proj.clientAddress}>{proj.clientAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">PROJECT MODULES & PHASES</p>
                        <div className="text-xs font-semibold text-muted-foreground">
                          {proj.moduleDetails?.length || 0} Total Modules
                        </div>
                      </div>
                      
                      {(() => {
                        const modules = Array.isArray(proj.moduleDetails) ? proj.moduleDetails : [];
                        if (modules.length === 0) {
                          return <p className="text-sm italic text-muted-foreground p-6 bg-secondary/30 rounded-2xl text-center border border-dashed border-border">No modules assigned yet.</p>;
                        }
                        
                        const phaseGroups: Record<number, any[]> = {};
                        modules.forEach((m: any, idx: number) => {
                          const total = modules.length;
                          const chunkSize = Math.ceil(total / 4) || 1;
                          const defaultPhase = Math.floor(idx / chunkSize) + 1;
                          const phase = m.phase || defaultPhase;
                          if (!phaseGroups[phase]) phaseGroups[phase] = [];
                          phaseGroups[phase].push({ ...m, id: m.id || `mod_${idx}`, status: m.status || 'new' });
                        });
                        const sortedPhases = Object.keys(phaseGroups).map(Number).sort((a, b) => a - b);
                        
                        return (
                          <div className="space-y-6">
                            {sortedPhases.map(phaseNum => {
                              const isPhaseLive = phaseGroups[phaseNum].every(m => m.status === 'live');
                              return (
                                <div key={phaseNum} className="space-y-4">
                                  <div className="flex items-center justify-between flex-wrap gap-3">
                                    <h4 className="text-xs font-black text-accent uppercase tracking-widest bg-secondary/80 px-3 py-1.5 rounded-lg border border-border inline-block shadow-sm">
                                      Phase {phaseNum} Delivery
                                    </h4>
                                    {isPhaseLive && (
                                      user?.role === 'client' ? (
                                        (() => {
                                          const payment = getPhasePayment(proj.id, phaseNum);
                                          if (payment?.status === 'paid') {
                                            return (
                                              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Phase Paid
                                              </span>
                                            );
                                          }
                                          if (payment?.status === 'pending' && payment.utrNumber) {
                                            return (
                                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Verification Pending
                                              </span>
                                            );
                                          }
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => handlePayNowClick(proj, phaseNum)}
                                              className="bg-accent hover:bg-accent/95 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 flex items-center gap-1.5 cursor-pointer"
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              Pay Now
                                            </button>
                                          );
                                        })()
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            window.location.href = `/dashboard/projects/payments?projectId=${proj.id}&paymentType=phase&phaseIdx=${phaseNum - 1}`;
                                          }}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Ask Payment
                                        </button>
                                      )
                                    )}
                                  </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {phaseGroups[phaseNum].map(mod => (
                                    <div key={mod.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4 hover:border-accent/30 transition-colors">
                                      <div className="flex-1">
                                        <div className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                                          {mod.name}
                                          {mod.isNewRequest && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">New</span>
                                          )}
                                        </div>
                                        {mod.description && (
                                          <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                                        <select 
                                          value={mod.status}
                                          onChange={(e) => handleUpdateModuleStatus(proj.id, mod.id, e.target.value)}
                                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg cursor-pointer appearance-none outline-none border focus:ring-2 focus:ring-accent/20 transition-all ${
                                            mod.status === 'live' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            mod.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            mod.status === 'ready_for_testing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            mod.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                          }`}
                                        >
                                          <option value="new">New</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="ready_for_testing">Ready for Testing</option>
                                          <option value="completed">Completed</option>
                                          <option value="live">Live</option>
                                        </select>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Request New Phase & Modules Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#09090B]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Briefcase className="text-accent h-6 w-6" /> Request Phase & Modules
              </h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Target Phase Number *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={requestPhase}
                  onChange={(e) => setRequestPhase(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                  placeholder="e.g. 4"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Modules to Add</span>
                  <button
                    type="button"
                    onClick={handleAddModuleField}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Another
                  </button>
                </div>

                {requestModules.map((mod, idx) => (
                  <div key={idx} className="p-4 bg-secondary/35 border border-border rounded-2xl relative space-y-3">
                    {requestModules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModuleField(idx)}
                        className="absolute top-2 right-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Module Name *</label>
                      <input
                        required
                        type="text"
                        value={mod.name}
                        onChange={(e) => handleModuleFieldChange(idx, 'name', e.target.value)}
                        className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent"
                        placeholder="e.g. Stripe Payment Integration"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Description (optional)</label>
                      <textarea
                        rows={2}
                        value={mod.description}
                        onChange={(e) => handleModuleFieldChange(idx, 'description', e.target.value)}
                        className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent resize-none"
                        placeholder="Provide details on scope, screens, etc."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-accent/10 cursor-pointer text-sm"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-3 bg-secondary border border-border text-foreground font-semibold rounded-xl hover:bg-secondary/80 cursor-pointer text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Now Modal with QR & UTR Confirm */}
      {payModalData && (
        <div className="fixed inset-0 bg-[#09090B]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-center">
            {!paySuccess ? (
              <form onSubmit={handleSubmitPaymentConfirm} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Confirm Phase Payment</h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Please scan the QR code and pay the specified amount for Phase {payModalData.phaseNum}.
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-2xl border border-border space-y-1.5 text-left text-sm font-semibold">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider flex-shrink-0">Project:</span>
                    <span className="text-foreground truncate">{payModalData.projectName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider flex-shrink-0">Phase:</span>
                    <span className="text-accent font-bold">Phase {payModalData.phaseNum}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider flex-shrink-0">Amount Due:</span>
                    <span className="text-foreground font-black">Rs. {payModalData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider flex-shrink-0">Invoice No:</span>
                    <span className="text-foreground font-mono text-xs font-bold uppercase truncate">{payModalData.invoiceNumber}</span>
                  </div>
                </div>

                <div className="flex justify-center p-3 bg-white rounded-2xl border border-border shadow-inner max-w-[200px] mx-auto">
                  <img
                    src="/qr_code.jpeg"
                    alt="HIG AI Automation QR Code"
                    className="w-full h-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/200x200?text=Scan+QR+To+Pay";
                    }}
                  />
                </div>

                <div className="text-left space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Transaction reference / UTR Number *
                  </label>
                  <input
                    required
                    type="text"
                    pattern="[a-zA-Z0-9]{6,24}"
                    title="Please enter a valid Transaction ID or UTR Reference number (6-24 alphanumeric characters)"
                    placeholder="Enter 12-digit UTR or Txn Ref ID"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-sm font-semibold focus:outline-none focus:border-accent text-center tracking-widest placeholder:tracking-normal"
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Enter the reference number after completing the transaction. Our finance team will verify the payment using this UTR.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/10 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmittingPay ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Confirm Payment Done"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayModalData(null)}
                    className="px-5 py-3 bg-secondary border border-border text-foreground font-semibold rounded-xl hover:bg-secondary/80 cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed max-w-xs mx-auto">
                    Your payment details for **Phase {payModalData.phaseNum}** have been submitted successfully.
                  </p>
                  <div className="mt-4 p-3 bg-secondary/30 rounded-xl inline-block border border-border font-mono text-xs font-bold text-accent">
                    Ref UTR: {utrNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPayModalData(null)}
                  className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-accent/10 cursor-pointer text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
