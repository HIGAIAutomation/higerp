"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  FileText,
  Search,
  Trash2,
  Trash,
  X,
  IndianRupee,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useUndo } from '@/components/providers/undo-provider';

interface Lead {
  id: string;
  uniqueId?: string;
  companyName: string;
  contact: string;
  source: string;
  valEstimate: string;
  status: string;
  interestedService?: string;
  requirements?: string;
  metadata?: any;
}

export default function ClosedLeadsPage() {
  const { showUndo } = useUndo();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search, Selection, and detail expansion states
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, won, lost
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [leadDocs, setLeadDocs] = useState<Record<string, any[]>>({});
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const leadsData: Lead[] = await fetchWithAuth('/crm/leads');
      // Filter only closed leads (won/lost)
      const closed = leadsData.filter(l => l.status === 'won' || l.status === 'lost');
      setLeads(closed);

      const docsMap: Record<string, any[]> = {};
      for (const lead of closed) {
        try {
          const docs = await fetchWithAuth(`/document/entity/LEAD/${lead.id}`);
          docsMap[lead.id] = docs;
        } catch (err) {
          console.error(`Failed to load docs for lead ${lead.id}`, err);
        }
      }
      setLeadDocs(docsMap);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load closed leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  const handleReopenLead = async (lead: Lead) => {
    try {
      setError(null);
      setSuccessMsg(null);
      
      const payload = {
        companyName: lead.companyName,
        contact: lead.contact,
        source: lead.source,
        valEstimate: parseFloat(lead.valEstimate) || 0,
        status: 'new', // Move back to active pipeline by changing status to 'new'
        interestedService: lead.interestedService || null,
        requirements: lead.requirements || null,
        metadata: lead.metadata || {}
      };

      await fetchWithAuth(`/crm/leads/${lead.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Lead for "${lead.companyName}" successfully reopened and moved back to active pipeline.`);
      await loadData();
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reopen lead.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await fetchWithAuth(`/crm/leads/${id}`, {
        method: 'DELETE'
      });
      setSelectedLeadIds(prev => prev.filter(item => item !== id));
      await loadData();

      showUndo(`Closed lead for "${lead.companyName}" has been deleted.`, async () => {
        await fetchWithAuth('/crm/leads', {
          method: 'POST',
          body: JSON.stringify({
            companyName: lead.companyName,
            contact: lead.contact,
            source: lead.source,
            valEstimate: parseFloat(lead.valEstimate) || 0,
            status: lead.status,
            interestedService: lead.interestedService,
            requirements: lead.requirements,
            metadata: lead.metadata
          })
        });
        await loadData();
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete lead.');
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredLeads.map(l => l.id);
      setSelectedLeadIds(allFilteredIds);
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleDeleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    const selectedList = leads.filter(l => selectedLeadIds.includes(l.id));
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      
      await Promise.all(
        selectedLeadIds.map(id => 
          fetchWithAuth(`/crm/leads/${id}`, {
            method: 'DELETE'
          })
        )
      );
      
      setSelectedLeadIds([]);
      await loadData();

      showUndo(`Deleted ${selectedList.length} closed leads.`, async () => {
        await Promise.all(
          selectedList.map(lead => 
            fetchWithAuth('/crm/leads', {
              method: 'POST',
              body: JSON.stringify({
                companyName: lead.companyName,
                contact: lead.contact,
                source: lead.source,
                valEstimate: parseFloat(lead.valEstimate) || 0,
                status: lead.status,
                interestedService: lead.interestedService,
                requirements: lead.requirements,
                metadata: lead.metadata
              })
            })
          )
        );
        await loadData();
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete some leads.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (l.uniqueId && l.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && l.status === statusFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Closed Leads Archive</h1>
            <p className="text-muted-foreground mt-1 font-inter">View, search, and analyze leads that have completed the sales pipeline (Won & Lost stages).</p>
          </div>
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

        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <h2 className="text-xl font-bold text-primary">Archive Records</h2>
            </div>
            {selectedLeadIds.length > 0 && (
              <button
                onClick={handleDeleteSelectedLeads}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 cursor-pointer self-start"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected ({selectedLeadIds.length})
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-secondary/30 p-4 rounded-2xl border border-border">
            <div className="relative w-full sm:max-w-xs flex items-center">
              <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search by company, unique ID..."
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="All">All Closed</option>
                <option value="won">Won Leads</option>
                <option value="lost">Lost Leads</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
              <p className="text-sm text-muted-foreground">Loading closed archive...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
              No closed leads in archive matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto font-inter">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <th className="pb-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                        onChange={(e) => handleSelectAllLeads(e.target.checked)}
                        className="h-4 w-4 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                      />
                    </th>
                    <th className="pb-4">Lead ID</th>
                    <th className="pb-4">Company</th>
                    <th className="pb-4">Contact</th>
                    <th className="pb-4">Interested Service</th>
                    <th className="pb-4">Contract Value</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredLeads.map((l) => {
                    const docs = leadDocs[l.id] || [];
                    const crdDoc = docs.find((d: any) => d.template?.name === 'Client Requirement Document');
                    const isExpanded = expandedLeadId === l.id;
                    const meta = l.metadata || {};

                    return (
                      <React.Fragment key={l.id}>
                        <tr 
                          className={`hover:bg-secondary/20 transition-colors ${
                            selectedLeadIds.includes(l.id) ? 'bg-accent/[0.01]' : ''
                          }`}
                        >
                          <td className="py-4">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(l.id)}
                              onChange={() => handleToggleSelectLead(l.id)}
                              className="h-4 w-4 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 font-mono text-xs font-semibold text-accent">{l.uniqueId || 'N/A'}</td>
                          <td className="py-4">
                            <div className="font-bold text-primary">{l.companyName}</div>
                            <div className="text-[10px] text-muted-foreground">Source: {l.source}</div>
                          </td>
                          <td className="py-4 text-muted-foreground text-xs">{l.contact}</td>
                          <td className="py-4 text-xs font-medium text-foreground/80">{l.interestedService || 'N/A'}</td>
                          <td className="py-4 font-bold text-primary">₹{Number(l.valEstimate).toLocaleString('en-IN')}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              l.status === 'won' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {l.status === 'won' ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Won
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Lost
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleReopenLead(l)}
                                title="Reopen Lead (Move to active pipeline)"
                                className="p-1 rounded bg-secondary hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 border border-border hover:border-indigo-500/20 transition-all cursor-pointer"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setExpandedLeadId(isExpanded ? null : l.id)}
                                title="Inspect Lead Requirements"
                                className="p-1 rounded bg-secondary hover:bg-accent/10 text-muted-foreground hover:text-accent border border-border hover:border-accent/20 transition-all cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              {crdDoc && (
                                <button
                                  onClick={() => handleDownloadDoc(crdDoc.id, `${l.companyName}_Requirement_Document`)}
                                  disabled={downloadingDocId === crdDoc.id}
                                  title="Download Client Requirement Document"
                                  className="p-1 rounded bg-secondary hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 border border-border hover:border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {downloadingDocId === crdDoc.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <FileText className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteLead(l.id)}
                                title="Delete Lead"
                                className="p-1 rounded bg-secondary hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border hover:border-rose-500/20 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-secondary/10">
                              <div className="p-6 border-l-2 border-accent/40 space-y-4 text-xs">
                                <div>
                                  <h4 className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-1">Requirements Summary</h4>
                                  <p className="text-foreground bg-secondary/30 p-3 rounded-xl border border-border/40 whitespace-pre-line leading-relaxed">
                                    {l.requirements || 'No details provided.'}
                                  </p>
                                </div>

                                {meta.category && (
                                  <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mb-2">Category: {meta.category}</h4>
                                    {meta.category === 'Web/App Development' && meta.modules && (
                                      <div className="space-y-1">
                                        <div className="font-semibold text-muted-foreground mb-1">Modules Breakdown:</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {meta.modules.map((m: any, idx: number) => (
                                            <div key={idx} className="bg-secondary/40 p-2.5 rounded-xl border border-border/50">
                                              <div className="flex justify-between font-bold text-foreground mb-0.5">
                                                <span>{m.name}</span>
                                                <span className="text-primary">₹{m.price}</span>
                                              </div>
                                              {m.description && <div className="text-[10px] text-muted-foreground">{m.description}</div>}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {meta.category === 'Digital Marketing' && (
                                      <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                          <div className="text-muted-foreground text-[10px] uppercase font-bold">Reels Count</div>
                                          <div className="text-sm font-bold text-primary mt-0.5">{meta.reelsCount || 0}</div>
                                        </div>
                                        <div>
                                          <div className="text-muted-foreground text-[10px] uppercase font-bold">Posters Count</div>
                                          <div className="text-sm font-bold text-primary mt-0.5">{meta.postersCount || 0}</div>
                                        </div>
                                        <div>
                                          <div className="text-muted-foreground text-[10px] uppercase font-bold">Branding Kits</div>
                                          <div className="text-sm font-bold text-primary mt-0.5">{meta.brandingKits || 'No'}</div>
                                        </div>
                                        <div>
                                          <div className="text-muted-foreground text-[10px] uppercase font-bold">Social Platforms</div>
                                          <div className="text-sm font-bold text-primary mt-0.5">{meta.platforms || 'N/A'}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
