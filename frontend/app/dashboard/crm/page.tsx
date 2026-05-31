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
  IndianRupee,
  User,
  ExternalLink,
  Search,
  Edit2,
  Trash2,
  X,
  Upload
} from 'lucide-react';
import { useUndo } from '@/components/providers/undo-provider';

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
  const { showUndo } = useUndo();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingQuote, setGeneratingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search, Filter, Selection & Edit states
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    companyName: '',
    contact: '',
    source: 'Website',
    valEstimate: '',
    status: 'new',
    interestedService: '',
    requirements: '',
    category: 'Web/App Development',
    reelsCount: '0',
    postersCount: '0',
    brandingKits: 'No',
    platforms: 'Instagram, Facebook, YouTube, LinkedIn',
  });

  const [moduleInputs, setModuleInputs] = useState<{ name: string; price: string; description: string }[]>([]);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModulePrice, setNewModulePrice] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [leadDocs, setLeadDocs] = useState<Record<string, any[]>>({});
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  
  // Bulk Modules upload states
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Project setup on won lead states
  const [showProjectSetupModal, setShowProjectSetupModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    clientUsername: '',
    clientPassword: '',
    startDate: '',
    endDate: '',
    whatsappNumber: ''
  });

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const parsedModules: { name: string; price: string; description: string }[] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      // Split by comma or tab
      const parts = line.split(/[,\t]/);
      const name = parts[0]?.trim();
      const priceVal = parseFloat(parts[1]?.trim() || '0');
      const description = parts.slice(2).join(',').trim();
      
      if (name && !isNaN(priceVal)) {
        parsedModules.push({
          name,
          price: String(priceVal),
          description: description || ''
        });
      }
    }
    
    if (parsedModules.length > 0) {
      const updatedInputs = [...moduleInputs, ...parsedModules];
      setModuleInputs(updatedInputs);
      const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setForm(prev => ({
        ...prev,
        valEstimate: String(totalPrice)
      }));
      setBulkText('');
      setShowBulkInput(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setBulkText(text);
        setShowBulkInput(true);
      }
    };
    reader.readAsText(file);
  };

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
      
      const docsMap: Record<string, any[]> = {};
      for (const lead of leadsData) {
        try {
          const docs = await fetchWithAuth(`/document/entity/LEAD/${lead.id}`);
          docsMap[lead.id] = docs;
        } catch (err) {
          console.error(`Failed to load docs for lead ${lead.id}`, err);
        }
      }
      setLeadDocs(docsMap);

      if (leadsData.length > 0) setSelectedLeadId(leadsData[0].id);
      if (packagesData.length > 0) setSelectedPackageId(packagesData[0].id);
      setError(null);
    } catch (err) {
      console.error(err);
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

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const metadata = {
        category: form.category,
        modules: form.category === 'Web/App Development' ? moduleInputs : undefined,
        reelsCount: form.category === 'Digital Marketing' ? parseInt(form.reelsCount) || 0 : undefined,
        postersCount: form.category === 'Digital Marketing' ? parseInt(form.postersCount) || 0 : undefined,
        brandingKits: form.category === 'Digital Marketing' ? form.brandingKits : undefined,
        platforms: form.category === 'Digital Marketing' ? form.platforms : undefined
      };

      const payload = {
        companyName: form.companyName,
        contact: form.contact,
        source: form.source,
        valEstimate: parseFloat(form.valEstimate) || 0,
        status: form.status || 'new',
        interestedService: form.interestedService || null,
        requirements: form.requirements || null,
        metadata
      };

      // Intercept if status is won to gather missing project info
      if (payload.status === 'won') {
        const defaultUsername = form.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        setProjectForm({
          clientUsername: defaultUsername,
          clientPassword: 'ChangeMe123!',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          whatsappNumber: form.contact.match(/\d{10,15}/)?.[0] || form.contact
        });
        setShowProjectSetupModal(true);
        setSubmitting(false);
        return;
      }

      if (editingLeadId) {
        await fetchWithAuth(`/crm/leads/${editingLeadId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Lead updated successfully!');
      } else {
        await fetchWithAuth('/crm/leads', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg('Lead captured successfully! Client Requirement Document generated.');
      }

      handleCancelEdit();
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save lead. Please check the backend connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmProjectSetup = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const metadata = {
        category: form.category,
        modules: form.category === 'Web/App Development' ? moduleInputs : undefined,
        reelsCount: form.category === 'Digital Marketing' ? parseInt(form.reelsCount) || 0 : undefined,
        postersCount: form.category === 'Digital Marketing' ? parseInt(form.postersCount) || 0 : undefined,
        brandingKits: form.category === 'Digital Marketing' ? form.brandingKits : undefined,
        platforms: form.category === 'Digital Marketing' ? form.platforms : undefined
      };

      const payload = {
        companyName: form.companyName,
        contact: form.contact,
        source: form.source,
        valEstimate: parseFloat(form.valEstimate) || 0,
        status: 'won',
        interestedService: form.interestedService || null,
        requirements: form.requirements || null,
        metadata
      };

      // 1. Create or update the lead record as 'won'
      if (editingLeadId) {
        await fetchWithAuth(`/crm/leads/${editingLeadId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAuth('/crm/leads', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      // 2. Automate the creation of a corresponding project
      const projectPayload = {
        name: form.interestedService || `${form.companyName} Project`,
        clientName: form.companyName,
        clientUsername: projectForm.clientUsername,
        clientPassword: projectForm.clientPassword,
        category: form.category,
        description: form.requirements || '',
        startDate: projectForm.startDate,
        endDate: projectForm.endDate,
        whatsappNumber: projectForm.whatsappNumber,
        price: parseFloat(form.valEstimate) || 0,
        moduleDetails: form.category === 'Web/App Development' ? moduleInputs : undefined,
        postCount: form.category === 'Digital Marketing' ? parseInt(form.postersCount) || 0 : undefined,
        videoCount: form.category === 'Digital Marketing' ? parseInt(form.reelsCount) || 0 : undefined,
        platforms: form.category === 'Digital Marketing' ? form.platforms : undefined,
      };

      await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(projectPayload),
      });

      setSuccessMsg('Lead marked as Won and Project successfully created!');
      setShowProjectSetupModal(false);
      handleCancelEdit();
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register project setup details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (lead: Lead | any) => {
    setEditingLeadId(lead.id);
    const meta = lead.metadata || {};
    setForm({
      companyName: lead.companyName || '',
      contact: lead.contact || '',
      source: lead.source || 'Website',
      valEstimate: String(lead.valEstimate || ''),
      status: lead.status || 'new',
      interestedService: lead.interestedService || '',
      requirements: lead.requirements || '',
      category: meta.category || 'Web/App Development',
      reelsCount: String(meta.reelsCount || 0),
      postersCount: String(meta.postersCount || 0),
      brandingKits: meta.brandingKits || 'No',
      platforms: meta.platforms || 'Instagram, Facebook, YouTube, LinkedIn',
    });
    setModuleInputs(meta.modules || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingLeadId(null);
    setForm({
      companyName: '',
      contact: '',
      source: 'Website',
      valEstimate: '',
      status: 'new',
      interestedService: '',
      requirements: '',
      category: 'Web/App Development',
      reelsCount: '0',
      postersCount: '0',
      brandingKits: 'No',
      platforms: 'Instagram, Facebook, YouTube, LinkedIn',
    });
    setModuleInputs([]);
  };

  const handleAddModuleInput = () => {
    const trimmedName = newModuleName.trim();
    const parsedPrice = parseFloat(newModulePrice);
    const trimmedDesc = newModuleDescription.trim();
    if (!trimmedName || isNaN(parsedPrice)) return;
    
    const updatedInputs = [...moduleInputs, { name: trimmedName, price: String(parsedPrice), description: trimmedDesc }];
    setModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setForm(prev => ({
      ...prev,
      valEstimate: String(totalPrice)
    }));
    
    setNewModuleName('');
    setNewModulePrice('');
    setNewModuleDescription('');
  };

  const handleRemoveModuleInput = (index: number) => {
    const updatedInputs = moduleInputs.filter((_, i) => i !== index);
    setModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setForm(prev => ({
      ...prev,
      valEstimate: String(totalPrice)
    }));
  };

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
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

      showUndo(`Lead for "${lead.companyName}" has been deleted.`, async () => {
        await fetchWithAuth('/crm/leads', {
          method: 'POST',
          body: JSON.stringify({
            companyName: lead.companyName,
            contact: lead.contact,
            source: lead.source,
            valEstimate: parseFloat(lead.valEstimate) || 0
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

      showUndo(`Deleted ${selectedList.length} leads.`, async () => {
        await Promise.all(
          selectedList.map(lead => 
            fetchWithAuth('/crm/leads', {
              method: 'POST',
              body: JSON.stringify({
                companyName: lead.companyName,
                contact: lead.contact,
                source: lead.source,
                valEstimate: parseFloat(lead.valEstimate) || 0
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
      l.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && l.status === statusFilter;
  });

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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {editingLeadId ? <Edit2 className="h-5 w-5 text-accent" /> : <Plus className="h-5 w-5 text-primary" />}
                  <h2 className="text-xl font-bold text-primary">
                    {editingLeadId ? 'Edit Lead' : 'Capture Lead'}
                  </h2>
                </div>
                {editingLeadId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary rounded-lg border border-border hover:border-foreground/20 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitLead} className="space-y-4">
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
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">ESTIMATED VALUE (INR)</label>
                  <div className="relative flex items-center">
                    <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
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

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">STATUS</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                  >
                    <option className="bg-card text-foreground" value="new">New</option>
                    <option className="bg-card text-foreground" value="contacted">Contacted</option>
                    <option className="bg-card text-foreground" value="followup">Follow Up</option>
                    <option className="bg-card text-foreground" value="negotiation">Negotiation</option>
                    <option className="bg-card text-foreground" value="won">Won</option>
                    <option className="bg-card text-foreground" value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">INTERESTED SERVICE</label>
                  <input
                    type="text"
                    placeholder="e.g., E-commerce Platform, SEO Campaign"
                    value={form.interestedService}
                    onChange={(e) => setForm({ ...form, interestedService: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CLIENT REQUIREMENTS</label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed client requirements..."
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SERVICE CATEGORY</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                  >
                    <option className="bg-card text-foreground" value="Web/App Development">Web/App Development</option>
                    <option className="bg-card text-foreground" value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>

                {form.category === 'Web/App Development' && (
                  <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border">
                    <div className="flex justify-between items-center pb-1 border-b border-border/40">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project Modules Builder</label>
                      <button
                        type="button"
                        onClick={() => setShowBulkInput(!showBulkInput)}
                        className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        {showBulkInput ? "Add Manually" : "Bulk Upload (CSV)"}
                      </button>
                    </div>
                    
                    {moduleInputs.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
                        {moduleInputs.map((mod, idx) => (
                          <div key={idx} className="flex justify-between items-start bg-secondary/50 p-2.5 rounded-xl border border-border/50 text-xs">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="font-bold text-foreground truncate">{mod.name}</div>
                              {mod.description && <div className="text-[10px] text-muted-foreground line-clamp-1">{mod.description}</div>}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-primary">₹{Number(mod.price).toLocaleString('en-IN')}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveModuleInput(idx)}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1 rounded transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {showBulkInput ? (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-muted-foreground">Paste lines: Name, Price, Description</span>
                          <label className="text-[10px] font-bold text-accent hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            Upload CSV/TXT
                            <input
                              type="file"
                              accept=".csv,.txt"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <textarea
                          rows={4}
                          placeholder={`Login Module, 15000, OAuth and email registration\nAdmin Dashboard, 45000, Analytics and user moderation\nRazorpay Gateway, 12000, Core billing flows`}
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs text-foreground placeholder-muted-foreground/60 resize-none font-mono"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={handleBulkImport}
                            className="flex-1 py-1.5 bg-accent text-background font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer"
                          >
                            Import Modules
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBulkText('');
                              setShowBulkInput(false);
                            }}
                            className="px-3 py-1.5 bg-secondary border border-border text-foreground font-semibold rounded-lg hover:bg-secondary/80 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          placeholder="Module Name"
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Price (INR)"
                            value={newModulePrice}
                            onChange={(e) => setNewModulePrice(e.target.value)}
                            className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60"
                          />
                          <button
                            type="button"
                            onClick={handleAddModuleInput}
                            className="py-1.5 bg-accent text-background font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer"
                          >
                            Add Module
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Brief description (optional)"
                          value={newModuleDescription}
                          onChange={(e) => setNewModuleDescription(e.target.value)}
                          className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60"
                        />
                      </div>
                    )}
                  </div>
                )}

                {form.category === 'Digital Marketing' && (
                  <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Digital Marketing Deliverables</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-muted-foreground mb-1">REELS COUNT</label>
                        <input
                          type="number"
                          value={form.reelsCount}
                          onChange={(e) => setForm({ ...form, reelsCount: e.target.value })}
                          className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-muted-foreground mb-1">POSTERS COUNT</label>
                        <input
                          type="number"
                          value={form.postersCount}
                          onChange={(e) => setForm({ ...form, postersCount: e.target.value })}
                          className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-muted-foreground mb-1">BRANDING KIT REQUIRED?</label>
                      <select
                        value={form.brandingKits}
                        onChange={(e) => setForm({ ...form, brandingKits: e.target.value })}
                        className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground cursor-pointer"
                      >
                        <option className="bg-card">No</option>
                        <option className="bg-card">Yes (Standard)</option>
                        <option className="bg-card">Yes (Premium)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-muted-foreground mb-1">TARGET PLATFORMS</label>
                      <input
                        type="text"
                        placeholder="e.g. Instagram, Facebook"
                        value={form.platforms}
                        onChange={(e) => setForm({ ...form, platforms: e.target.value })}
                        className="w-full px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg disabled:opacity-70 text-xs cursor-pointer ${
                    editingLeadId 
                      ? 'bg-accent text-background shadow-accent/10' 
                      : 'bg-primary text-background shadow-primary/10'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : editingLeadId ? 'Update Lead' : 'Add Lead'}
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
                      <option key={l.id} value={l.id} className="text-foreground bg-card">{l.companyName} (₹{Number(l.valEstimate).toLocaleString('en-IN')})</option>
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
                      <option key={p.id} value={p.id} className="text-foreground bg-card">{p.name} (₹{Number(p.basePrice).toLocaleString('en-IN')})</option>
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
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-primary">Sales Pipeline</h2>
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
                    placeholder="Search company, contact..."
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="All">All Leads</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="followup">Follow Up</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading leads...</p>
                </div>
              ) : filteredLeads.filter(l => l.status !== 'won' && l.status !== 'lost').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-semibold">
                  No leads matched
                </div>
              ) : (
                <div className="overflow-x-auto font-inter">
                  <table className="w-full text-left border-collapse">
                     <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        <th className="pb-4 w-10">
                          <input
                            type="checkbox"
                            checked={filteredLeads.filter(l => l.status !== 'won' && l.status !== 'lost').length > 0 && selectedLeadIds.length === filteredLeads.filter(l => l.status !== 'won' && l.status !== 'lost').length}
                            onChange={(e) => handleSelectAllLeads(e.target.checked)}
                            className="h-4 w-4 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                        </th>
                        <th className="pb-4">Lead ID</th>
                        <th className="pb-4">Company</th>
                        <th className="pb-4">Contact</th>
                        <th className="pb-4">Interested Service</th>
                        <th className="pb-4">Estimate</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {filteredLeads.filter(l => l.status !== 'won' && l.status !== 'lost').map((l) => {
                        const docs = leadDocs[l.id] || [];
                        const crdDoc = docs.find((d: any) => d.template?.name === 'Client Requirement Document');
                        return (
                          <tr 
                            key={l.id} 
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
                            <td className="py-4 font-bold text-primary">{l.companyName}</td>
                            <td className="py-4 text-muted-foreground text-xs">{l.contact}</td>
                            <td className="py-4 text-xs font-medium text-foreground/80">{l.interestedService || 'N/A'}</td>
                            <td className="py-4 font-bold text-primary">₹{Number(l.valEstimate).toLocaleString('en-IN')}</td>
                            <td className="py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                {l.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
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
                                  onClick={() => handleStartEdit(l)}
                                  title="Edit lead"
                                  className="p-1 rounded bg-secondary hover:bg-accent/10 text-muted-foreground hover:text-accent border border-border hover:border-accent/20 transition-all cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(l.id)}
                                  title="Delete lead"
                                  className="p-1 rounded bg-secondary hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border hover:border-rose-500/20 transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        {showProjectSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary">Setup Project Workspace</h3>
                  <p className="text-xs text-muted-foreground mt-1">Provide project configuration details to set up the client portal workspace for {form.companyName}.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowProjectSetupModal(false)}
                  className="p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Client Username</label>
                    <input
                      type="text"
                      required
                      value={projectForm.clientUsername}
                      onChange={(e) => setProjectForm({ ...projectForm, clientUsername: e.target.value })}
                      placeholder="e.g. clientusername"
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Client Password (New User)</label>
                    <input
                      type="password"
                      required
                      value={projectForm.clientPassword}
                      onChange={(e) => setProjectForm({ ...projectForm, clientPassword: e.target.value })}
                      placeholder="Enter secure password"
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      required
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Target Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">WhatsApp Contact (Billing Updates)</label>
                  <input
                    type="text"
                    required
                    value={projectForm.whatsappNumber}
                    onChange={(e) => setProjectForm({ ...projectForm, whatsappNumber: e.target.value })}
                    placeholder="Enter phone with country code"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmProjectSetup}
                  disabled={submitting || !projectForm.clientUsername || !projectForm.startDate || !projectForm.endDate}
                  className="flex-1 py-3 bg-accent text-background font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Won & Launch Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectSetupModal(false)}
                  className="px-4 py-3 bg-secondary border border-border text-foreground font-bold rounded-xl hover:bg-secondary/80 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
