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
  ShieldAlert
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
  const isSuperAdmin = user?.role === 'superadmin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<Record<string, GeneratedDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

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
              This project dashboard is restricted to **Super Admin** users only. Your account does not possess the permissions necessary to view restricted project category pipelines.
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

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'on_hold': return 'bg-secondary text-muted-foreground border border-border';
      default: return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Web/App Development Projects</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Track your custom web & application build pipelines</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-semibold">No active Web/App development projects.</p>
              </div>
            ) : (
              projects.map((proj) => {
                const docs = projectDocs[proj.id] || [];
                return (
                  <div key={proj.id} className="bg-card rounded-[32px] p-6 border border-border shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(proj.status)}`}>
                          {proj.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center font-semibold">
                          <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground/60" />
                          {proj.startDate ? proj.startDate.split('T')[0] : 'N/A'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{proj.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 font-medium leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex-1 flex flex-col">
                      <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">PROJECT MODULES & PHASES</p>
                      
                      {(() => {
                        const modules = proj.moduleDetails || [];
                        if (modules.length === 0) {
                          return <p className="text-xs italic text-muted-foreground">No modules assigned.</p>;
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
                          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {sortedPhases.map(phaseNum => (
                              <div key={phaseNum} className="space-y-2">
                                <h4 className="text-[10px] font-black text-accent uppercase tracking-widest bg-secondary/50 p-1.5 rounded-lg border border-border inline-block">
                                  Phase {phaseNum}
                                </h4>
                                <div className="space-y-2 pl-1 border-l-2 border-secondary ml-1">
                                  {phaseGroups[phaseNum].map(mod => (
                                    <div key={mod.id} className="bg-secondary/30 p-2.5 rounded-xl border border-border flex flex-col gap-2">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1 pr-2">
                                          <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                            {mod.name}
                                            {mod.isNewRequest && (
                                              <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">New</span>
                                            )}
                                          </div>
                                        </div>
                                        <select 
                                          value={mod.status}
                                          onChange={(e) => handleUpdateModuleStatus(proj.id, mod.id, e.target.value)}
                                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded cursor-pointer appearance-none outline-none border focus:ring-1 focus:ring-accent ${
                                            mod.status === 'live' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            mod.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            mod.status === 'ready_for_testing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            mod.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                          }`}
                                        >
                                          <option value="new">New</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="ready_for_testing">Ready Test</option>
                                          <option value="completed">Completed</option>
                                          <option value="live">Live</option>
                                        </select>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
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
