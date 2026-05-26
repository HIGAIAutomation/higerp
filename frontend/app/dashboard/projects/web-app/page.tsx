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

  const handleDownloadDoc = async (docId: string, docName: string) => {
    try {
      setDownloadingDocId(docId);
      const doc = await fetchWithAuth(`/document/${docId}`);
      if (!doc || !doc.compiledHtml) {
        alert('Document layout content is empty or not found.');
        return;
      }
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.zIndex = '-9999';
      container.style.width = '800px';
      container.style.background = '#ffffff';

      // Inject print styling overrides specifically optimized for Letter size PDF export
      const printStyles = `
        <style>
          .legal-document-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .legal-document-wrapper .contract-container {
            font-family: var(--font-inter), 'Inter', sans-serif !important;
            color: #0f172a !important;
            line-height: 1.6 !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .legal-document-wrapper .header {
            text-align: center !important;
            margin-bottom: 35px !important;
            border-bottom: 2px solid #0f172a !important;
            padding-bottom: 20px !important;
          }
          .legal-document-wrapper .header h1 {
            font-family: var(--font-playfair), 'Playfair Display', serif !important;
            font-size: 22pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            text-transform: uppercase !important;
            margin: 0 0 8px 0 !important;
            letter-spacing: 0.5px !important;
          }
          .legal-document-wrapper .header p {
            font-size: 10pt !important;
            font-style: italic !important;
            color: #64748b !important;
            margin: 0 !important;
          }
          .legal-document-wrapper .section {
            margin-bottom: 24px !important;
            page-break-inside: avoid !important;
          }
          .legal-document-wrapper .section h2 {
            font-family: var(--font-playfair), 'Playfair Display', serif !important;
            font-size: 13pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            text-transform: uppercase !important;
            margin-bottom: 10px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding-bottom: 6px !important;
            letter-spacing: 0.5px !important;
          }
          .legal-document-wrapper .section p, 
          .legal-document-wrapper .section ol, 
          .legal-document-wrapper .section ul {
            font-size: 10.5pt !important;
            color: #334155 !important;
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            text-align: justify !important;
          }
          .legal-document-wrapper .signatures {
            margin-top: 45px !important;
            display: table !important;
            width: 100% !important;
            table-layout: fixed !important;
            page-break-inside: avoid !important;
          }
          .legal-document-wrapper .sig-col {
            display: table-cell !important;
            width: 48% !important;
            vertical-align: top !important;
            font-size: 10.5pt !important;
          }
          .legal-document-wrapper .sig-col:first-child {
            padding-right: 25px !important;
          }
          .legal-document-wrapper .sig-col:last-child {
            padding-left: 25px !important;
          }
          .legal-document-wrapper .sig-line {
            border-bottom: 1.5px solid #0f172a !important;
            margin-top: 40px !important;
            margin-bottom: 8px !important;
          }
          .legal-document-wrapper .sig-label {
            font-size: 8.5pt !important;
            font-weight: bold !important;
            color: #475569 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
        </style>
      `;

      container.innerHTML = printStyles + `
        <div class="legal-document-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2E9EDE; padding-bottom: 12px; margin-bottom: 25px;">
            <img src="/logo.png" style="height: 32px; width: auto; object-fit: contain; border-radius: 6px;" />
            <div style="text-align: right;">
              <span style="font-family: sans-serif; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE PORTAL</span>
              <br/>
              <span style="font-family: sans-serif; font-size: 8px; font-weight: 600; color: #64748b; tracking: 0.5px;">OFFICIAL SECURE DOCUMENT</span>
            </div>
          </div>
          ${doc.compiledHtml}
        </div>
      `;
      document.body.appendChild(container);

      const opt: any = {
        margin: [20, 20, 20, 20],
        filename: `${docName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] }
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Could not compile PDF document.');
    } finally {
      setDownloadingDocId(null);
    }
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

                    <div className="pt-4 border-t border-border">
                      <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">PROJECT CONTRACTS</p>
                      {docs.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground">No documents generated yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {docs.slice(0, 3).map((doc) => {
                            const name = doc.template?.name || 'Agreement';
                            const isDownloading = downloadingDocId === doc.id;
                            return (
                              <button
                                key={doc.id}
                                disabled={isDownloading}
                                onClick={() => handleDownloadDoc(doc.id, name)}
                                className="w-full flex items-center justify-between text-left p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors text-xs font-semibold text-foreground cursor-pointer disabled:opacity-70"
                              >
                                <span className="flex items-center truncate">
                                  <FileCheck className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                                  <span className="truncate">{name}</span>
                                </span>
                                {isDownloading ? (
                                  <Loader2 className="h-3.5 w-3.5 text-accent animate-spin flex-shrink-0" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
