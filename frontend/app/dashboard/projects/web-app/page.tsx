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
  Filter
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
  const isStaff = ['superadmin', 'admin', 'employee'].includes(user?.role);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<Record<string, GeneratedDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtration states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM

  if (!user || !isStaff) {
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/projects');
      const filtered = data.filter((p: Project) => p.category === 'Web/App Development' || !p.category);
      setProjects(filtered);
      
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

  return (
    <DashboardLayout fullWidth={true}>
      <div className="font-sans min-h-screen pb-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Web/App Development Projects</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Track your custom web & application build pipelines</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedProjectId} 
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.id.replace(/-/g, '/')} - {p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <input 
                type="month" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
              />
            </div>
          </div>
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
                  <div key={proj.id} className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8 bg-secondary/30 p-6 rounded-2xl border border-border text-sm font-semibold text-muted-foreground">
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Project ID</span>
                          <span className="text-foreground text-base font-bold uppercase">{proj.id.replace(/-/g, '/')}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client ID</span>
                          <span className="text-foreground text-base font-bold uppercase">{proj.client?.id ? proj.client.id.replace(/-/g, '/') : 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Project Price</span>
                          <span className="text-foreground text-base font-bold">Rs. {proj.price !== undefined ? Number(proj.price).toLocaleString() : '0'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">WhatsApp Contact</span>
                          <span className="text-foreground text-base font-bold">{proj.whatsappNumber || 'Not Provided'}</span>
                        </div>
                        {proj.clientEmail && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client Email</span>
                            <span className="text-foreground text-base font-bold truncate block" title={proj.clientEmail}>{proj.clientEmail}</span>
                          </div>
                        )}
                        {proj.clientAddress && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-xs text-muted-foreground/75 block uppercase tracking-wider mb-1">Client Address</span>
                            <span className="text-foreground text-base font-bold truncate block" title={proj.clientAddress}>{proj.clientAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">PROJECT MODULES & PHASES</p>
                        <div className="text-xs font-semibold text-muted-foreground">
                          {proj.moduleDetails?.length || 0} Total Modules
                        </div>
                      </div>
                      
                      {(() => {
                        const modules = proj.moduleDetails || [];
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
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-accent uppercase tracking-widest bg-secondary/80 px-3 py-1.5 rounded-lg border border-border inline-block shadow-sm">
                                      Phase {phaseNum} Delivery
                                    </h4>
                                    {isPhaseLive && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          window.location.href = `/dashboard/projects/payments?projectId=${proj.id}&paymentType=phase&phaseIdx=${phaseNum - 1}`;
                                        }}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Ask Payment
                                      </button>
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
    </DashboardLayout>
  );
}
