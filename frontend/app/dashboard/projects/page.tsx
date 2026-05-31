"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { useUndo } from '@/components/providers/undo-provider';
import { 
  Briefcase, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FolderOpen,
  Calendar,
  Layers,
  MessageSquare,
  Download,
  FileCheck,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category?: string;
  description: string;
  clientName?: string;
  startDate: string;
  endDate: string;
  status: string;
  whatsappNumber?: string;
  price?: number | string;
  modules?: string;
  deliveryCode?: boolean;
  deliveryDocs?: boolean;
  deliveryDb?: boolean;
  deliveryQa?: boolean;
  deliveryPayment?: boolean;
  postCount?: number | string;
  videoCount?: number | string;
  platforms?: string;
  client?: {
    id?: string;
    username: string;
    email?: string;
  };
  moduleDetails?: { name: string; price: number; description?: string; completed: boolean }[];
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

interface PricingTier {
  id: string;
  name: string;
  price: number;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  tiers: PricingTier[];
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { showUndo } = useUndo();
  const isSuperAdmin = user?.role === 'superadmin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<Record<string, GeneratedDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Service Catalog states
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('base');

  // Module Details States for Create/Edit Form
  const [moduleInputs, setModuleInputs] = useState<{ name: string; price: string; description: string; completed: boolean }[]>([]);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModulePrice, setNewModulePrice] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  const [editModuleInputs, setEditModuleInputs] = useState<{ name: string; price: string; description: string; completed: boolean }[]>([]);
  const [newEditModuleName, setNewEditModuleName] = useState('');
  const [newEditModulePrice, setNewEditModulePrice] = useState('');
  const [newEditModuleDescription, setNewEditModuleDescription] = useState('');

  const handleAddModuleInput = () => {
    const trimmedName = newModuleName.trim();
    const parsedPrice = parseFloat(newModulePrice);
    const trimmedDesc = newModuleDescription.trim();
    if (!trimmedName || isNaN(parsedPrice)) return;
    
    const updatedInputs = [...moduleInputs, { name: trimmedName, price: String(parsedPrice), description: trimmedDesc, completed: false }];
    setModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setForm(prev => ({
      ...prev,
      price: String(totalPrice),
      modules: updatedInputs.map(m => m.name).join(', ')
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
      price: String(totalPrice),
      modules: updatedInputs.map(m => m.name).join(', ')
    }));
  };

  const handleAddEditModuleInput = () => {
    const trimmedName = newEditModuleName.trim();
    const parsedPrice = parseFloat(newEditModulePrice);
    const trimmedDesc = newEditModuleDescription.trim();
    if (!trimmedName || isNaN(parsedPrice)) return;
    
    const updatedInputs = [...editModuleInputs, { name: trimmedName, price: String(parsedPrice), description: trimmedDesc, completed: false }];
    setEditModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setEditForm(prev => ({
      ...prev,
      price: String(totalPrice),
      modules: updatedInputs.map(m => m.name).join(', ')
    }));
    
    setNewEditModuleName('');
    setNewEditModulePrice('');
    setNewEditModuleDescription('');
  };

  const handleRemoveEditModuleInput = (index: number) => {
    const updatedInputs = editModuleInputs.filter((_, i) => i !== index);
    setEditModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setEditForm(prev => ({
      ...prev,
      price: String(totalPrice),
      modules: updatedInputs.map(m => m.name).join(', ')
    }));
  };

  const handleToggleModuleCompletion = async (project: Project, moduleIndex: number) => {
    try {
      const currentDetails = project.moduleDetails ? [...project.moduleDetails] : [];
      if (currentDetails[moduleIndex]) {
        currentDetails[moduleIndex].completed = !currentDetails[moduleIndex].completed;
      }
      
      await fetchWithAuth(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...project,
          moduleDetails: currentDetails
        }),
      });
      await fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to update module status.');
    }
  };

  // Platforms States
  const [newPlatformText, setNewPlatformText] = useState('');
  const [newEditPlatformText, setNewEditPlatformText] = useState('');

  // Dynamically extract unique platforms across all projects
  const availablePlatforms = React.useMemo(() => {
    const defaultPlats = ['Instagram', 'Facebook', 'YouTube', 'LinkedIn'];
    const customPlats = new Set<string>();
    
    projects.forEach((proj) => {
      if (proj.platforms) {
        proj.platforms.split(',').forEach((plat) => {
          const trimmed = plat.trim();
          if (trimmed && !defaultPlats.includes(trimmed)) {
            customPlats.add(trimmed);
          }
        });
      }
    });

    return [...defaultPlats, ...Array.from(customPlats)];
  }, [projects]);

  const handleTogglePlatform = (plat: string, isChecked: boolean) => {
    const current = form.platforms ? form.platforms.split(',').map(p => p.trim()).filter(Boolean) : [];
    let updated;
    if (isChecked) {
      updated = [...current, plat];
    } else {
      updated = current.filter(p => p !== plat);
    }
    setForm({ ...form, platforms: updated.join(', ') });
  };

  const handleToggleEditPlatform = (plat: string, isChecked: boolean) => {
    const current = editForm.platforms ? editForm.platforms.split(',').map(p => p.trim()).filter(Boolean) : [];
    let updated;
    if (isChecked) {
      updated = [...current, plat];
    } else {
      updated = current.filter(p => p !== plat);
    }
    setEditForm({ ...editForm, platforms: updated.join(', ') });
  };

  const handleAddCustomPlatform = () => {
    const trimmed = newPlatformText.trim();
    if (!trimmed) return;
    
    const current = form.platforms ? form.platforms.split(',').map(p => p.trim()).filter(Boolean) : [];
    if (!current.includes(trimmed)) {
      setForm({ ...form, platforms: [...current, trimmed].join(', ') });
    }
    setNewPlatformText('');
  };

  const handleAddCustomEditPlatform = () => {
    const trimmed = newEditPlatformText.trim();
    if (!trimmed) return;
    
    const current = editForm.platforms ? editForm.platforms.split(',').map(p => p.trim()).filter(Boolean) : [];
    if (!current.includes(trimmed)) {
      setEditForm({ ...editForm, platforms: [...current, trimmed].join(', ') });
    }
    setNewEditPlatformText('');
  };

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientName: '',
    category: 'Web/App Development',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    whatsappNumber: '',
    price: '',
    modules: '',
    postCount: '0',
    videoCount: '0',
    clientUsername: '',
    clientPassword: '',
    platforms: 'Instagram, Facebook, YouTube, LinkedIn',
    projectInclusions: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    clientName: '',
    description: '',
    category: 'Web/App Development',
    startDate: '',
    endDate: '',
    status: 'active',
    whatsappNumber: '',
    price: '',
    modules: '',
    deliveryCode: false,
    deliveryDocs: false,
    deliveryDb: false,
    deliveryQa: false,
    deliveryPayment: false,
    postCount: '0',
    videoCount: '0',
    clientUsername: '',
    clientPassword: '',
    platforms: '',
    projectInclusions: '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/projects');
      setProjects(data);
      
      // Fetch documents for each project
      const docsMap: Record<string, GeneratedDoc[]> = {};
      for (const proj of data) {
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
      // Fallback
      setProjects([
        { id: '1', name: 'Project Titan', description: 'Enterprise AI Knowledge Retrieval Engine for Banking Partner.', startDate: '2026-05-15', endDate: '2026-11-15', status: 'active', category: 'AI Development' },
        { id: '2', name: 'Sales Agent Automatons', description: 'Fully integrated customer support agents.', startDate: '2026-05-20', endDate: '2026-08-20', status: 'active', category: 'Automation' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await fetchWithAuth('/crm/packages');
      setPackages(data);
    } catch (err) {
      console.error('Failed to load packages', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchPackages();
  }, []);

  const handlePackageChange = (packageId: string) => {
    setSelectedPackageId(packageId);
    if (!packageId) {
      setSelectedPricingModel('base');
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setForm(prev => ({
        ...prev,
        name: pkg.name,
        description: pkg.description || '',
        price: String(pkg.basePrice)
      }));
      setSelectedPricingModel('base');
    }
  };

  const handlePricingModelChange = (modelName: string) => {
    setSelectedPricingModel(modelName);
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!pkg) return;
    
    if (modelName === 'base') {
      setForm(prev => ({ ...prev, price: String(pkg.basePrice) }));
    } else {
      const tier = pkg.tiers?.find(t => t.name === modelName);
      if (tier) {
        setForm(prev => ({ ...prev, price: String(tier.price) }));
      }
    }
  };

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          moduleDetails: form.category === 'Web/App Development' ? moduleInputs.map(m => ({ name: m.name, price: parseFloat(m.price), description: m.description, completed: m.completed })) : undefined
        }),
      });

      // Reset form
      setForm({
        name: '',
        description: '',
        clientName: '',
        category: 'Web/App Development',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        whatsappNumber: '',
        price: '',
        modules: '',
        postCount: '0',
        videoCount: '0',
        clientUsername: '',
        clientPassword: '',
        platforms: 'Instagram, Facebook, YouTube, LinkedIn',
        projectInclusions: '',
      });
      setModuleInputs([]);
      setSelectedPackageId('');
      setSelectedPricingModel('base');

      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create project. Please verify that the backend application is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setEditForm({
      name: proj.name,
      clientName: proj.clientName || '',
      description: proj.description || '',
      category: proj.category || 'Web/App Development',
      startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
      endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
      status: proj.status || 'active',
      whatsappNumber: proj.whatsappNumber || '',
      price: proj.price !== undefined ? String(proj.price) : '0',
      modules: proj.modules || '',
      deliveryCode: !!proj.deliveryCode,
      deliveryDocs: !!proj.deliveryDocs,
      deliveryDb: !!proj.deliveryDb,
      deliveryQa: !!proj.deliveryQa,
      deliveryPayment: !!proj.deliveryPayment,
      postCount: proj.postCount !== undefined ? String(proj.postCount) : '0',
      videoCount: proj.videoCount !== undefined ? String(proj.videoCount) : '0',
      clientUsername: proj.client?.username || '',
      clientPassword: '',
      platforms: proj.platforms || '',
      projectInclusions: (proj as any).projectInclusions || '',
    });
    
    const details = proj.moduleDetails || [];
    setEditModuleInputs(details.map(m => ({
      name: m.name,
      price: String(m.price),
      description: m.description || '',
      completed: !!m.completed
    })));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    // Frontend validations
    const oldModules = editingProject.modules
      ? editingProject.modules.split(',').map((m: string) => m.trim()).filter(Boolean)
      : [];
    const newModules = editForm.modules
      ? editForm.modules.split(',').map((m: string) => m.trim()).filter(Boolean)
      : [];

    if (newModules.length > oldModules.length) {
      const oldPrice = Number(editingProject.price || 0);
      const newPrice = Number(editForm.price || 0);
      if (newPrice <= oldPrice) {
        setError('Target modules count has increased. You must increase the project price.');
        return;
      }

      if (!editForm.endDate) {
        setError('Target modules count has increased. You must specify an estimated end date extension.');
        return;
      }
      const oldEndDate = editingProject.endDate ? new Date(editingProject.endDate).getTime() : null;
      const newEndDate = new Date(editForm.endDate).getTime();
      if (oldEndDate && newEndDate <= oldEndDate) {
        setError('Target modules count has increased. You must extend the estimated end date.');
        return;
      }
    }

    if (editForm.status === 'completed') {
      if (
        !editForm.deliveryCode ||
        !editForm.deliveryDocs ||
        !editForm.deliveryDb ||
        !editForm.deliveryQa ||
        !editForm.deliveryPayment
      ) {
        setError('Cannot complete the project until all 5 delivery checklist items are completed.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      await fetchWithAuth(`/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          moduleDetails: editForm.category === 'Web/App Development' ? editModuleInputs.map(m => ({ name: m.name, price: parseFloat(m.price), description: m.description, completed: m.completed })) : undefined
        }),
      });
      setEditingProject(null);
      setEditModuleInputs([]);
      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update project. Please ensure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    try {
      setDeleting(true);
      setError(null);
      await fetchWithAuth(`/projects/${id}`, {
        method: 'DELETE',
      });
      setProjectToDelete(null);
      await fetchProjects();

      showUndo(`Project "${proj.name}" has been deleted.`, async () => {
        await fetchWithAuth('/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: proj.name,
            clientName: proj.clientName || '',
            description: proj.description || '',
            category: proj.category || 'Web/App Development',
            startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
            endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
            whatsappNumber: proj.whatsappNumber || '',
            price: proj.price !== undefined ? String(proj.price) : '',
            modules: proj.modules || '',
            postCount: proj.postCount !== undefined ? String(proj.postCount) : '0',
            videoCount: proj.videoCount !== undefined ? String(proj.videoCount) : '0',
            clientUsername: proj.client?.username || '',
            clientPassword: '',
            platforms: proj.platforms || '',
            projectInclusions: (proj as any).projectInclusions || '',
            moduleDetails: proj.moduleDetails
          }),
        });
        await fetchProjects();
      });
    } catch (err) {
      console.error(err);
      setError('Failed to delete project. Please ensure the backend is running.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'on_hold':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'active':
      default:
        return 'bg-sky-50 text-sky-600 border border-sky-100';
    }
  };

  // Progress Bar Helper
  const getProjectProgress = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };



  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Digital Marketing':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'Automation':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'AI Development':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Web/App Development':
      default:
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    }
  };

  const filteredProjects = projects.filter(proj => 
    activeFilter === 'All' || (proj.category || 'Web/App Development') === activeFilter
  );

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen pb-12">
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Project Form Card */}
          <div className="lg:col-span-5 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center space-x-3 mb-8">
              <Plus className="h-6 w-6 text-accent" strokeWidth={3} />
              <h2 className="text-2xl font-bold text-accent tracking-tight">New Project Setup</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CHOOSE SERVICE/PRODUCT TEMPLATE</label>
                <div className="relative">
                  <select
                    value={selectedPackageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                  >
                    <option value="">-- Select a Service/Product (Optional) --</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (Base License: ₹{pkg.basePrice})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {selectedPackageId && (
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PRICING MODEL</label>
                  <div className="relative">
                    <select
                      value={selectedPricingModel}
                      onChange={(e) => handlePricingModelChange(e.target.value)}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                    >
                      <option value="base">Base License Fee (₹{packages.find(p => p.id === selectedPackageId)?.basePrice})</option>
                      {packages.find(p => p.id === selectedPackageId)?.tiers?.map((tier) => (
                        <option key={tier.id} value={tier.name}>
                          {tier.name} Charges (₹{tier.price})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PROJECT NAME</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Project Apollo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT NAME</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SpaceX Corp"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT USERNAME (PORTAL ACCESS)</label>
                  <input
                    type="text"
                    placeholder="e.g. client123"
                    value={form.clientUsername}
                    onChange={(e) => setForm({ ...form, clientUsername: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT PASSWORD (PORTAL ACCESS)</label>
                  <input
                    type="password"
                    placeholder="e.g. password123"
                    value={form.clientPassword}
                    onChange={(e) => setForm({ ...form, clientPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PROJECT CATEGORY</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setForm({
                        ...form,
                        category: newCategory,
                        modules: newCategory === 'Digital Marketing' ? '' : form.modules
                      });
                    }}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                  >
                    <option value="Web/App Development">Web/App Development</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Automation">Automation</option>
                    <option value="AI Development">AI Development</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">DESCRIPTION</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Define scope, milestones, or core deliverables..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PRICE (RS)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">WHATSAPP NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. +919876543210"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {form.category === 'Web/App Development' ? (
                <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                  <label className="block text-xs font-bold text-accent uppercase tracking-wider">Project Modules & Pricing</label>
                  
                  {moduleInputs.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {moduleInputs.map((mod, idx) => (
                        <div key={idx} className="bg-card p-3 rounded-xl border border-border text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-foreground">{mod.name}</div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-accent">Rs. {Number(mod.price).toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveModuleInput(idx)}
                                className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {mod.description && (
                            <div className="text-[11px] text-muted-foreground font-medium leading-normal">{mod.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Module Name (e.g. Auth)"
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Price (Rs)"
                          value={newModulePrice}
                          onChange={(e) => setNewModulePrice(e.target.value)}
                          className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Module Description / Subtext (e.g. Secure login & registration)"
                        value={newModuleDescription}
                        onChange={(e) => setNewModuleDescription(e.target.value)}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModuleInput}
                      className="w-full py-3.5 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      + Add Module
                    </button>
                  </div>
                </div>
              ) : form.category !== 'Digital Marketing' && (
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET MODULES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="e.g. Auth, Dashboard, API Integration"
                    value={form.modules}
                    onChange={(e) => setForm({ ...form, modules: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              )}

              {form.category === 'Digital Marketing' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET IMAGE POST COUNT</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={form.postCount}
                      onChange={(e) => setForm({ ...form, postCount: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET VIDEO POST COUNT</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={form.videoCount}
                      onChange={(e) => setForm({ ...form, videoCount: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {form.category === 'Digital Marketing' && (
                <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                  <label className="block text-xs font-bold text-accent uppercase tracking-wider">Active Platforms Selection</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePlatforms.map((plat) => {
                      const isChecked = form.platforms ? form.platforms.split(',').map(p => p.trim()).includes(plat) : false;
                      return (
                        <label key={plat} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleTogglePlatform(plat, e.target.checked)}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{plat}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <input
                      type="text"
                      placeholder="Add custom platform (e.g. TikTok)"
                      value={newPlatformText}
                      onChange={(e) => setNewPlatformText(e.target.value)}
                      className="flex-grow px-3.5 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold focus:outline-none text-foreground placeholder-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPlatform}
                      className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">ADDITIONAL DOCUMENT DETAILS / INCLUSIONS (ONE PER LINE)</label>
                <textarea
                  rows={4}
                  placeholder={`e.g. Special training session for staff\nAll server deployment credentials included\nSupport SLA extended by 30 days`}
                  value={form.projectInclusions}
                  onChange={(e) => setForm({ ...form, projectInclusions: e.target.value })}
                  className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">START DATE</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">ESTIMATED END DATE</label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center shadow-lg shadow-accent/10 disabled:opacity-70 cursor-pointer text-base uppercase tracking-wider mt-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Compiling Suite...
                  </>
                ) : 'Launch & Auto-Generate Docs'}
              </button>
            </form>
          </div>

          {/* Active Delivery Engines (Projects) List */}
          <div className="lg:col-span-7 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <FolderOpen className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-accent tracking-tight">Active Delivery Engines</h2>
              </div>
              
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-secondary p-1 rounded-2xl border border-border">
                {['All', 'Web/App Development', 'Digital Marketing', 'Automation', 'AI Development'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      activeFilter === cat
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-muted-foreground hover:text-accent hover:bg-secondary/50'
                    }`}
                  >
                    {cat === 'Web/App Development' ? 'Web/App' : cat === 'AI Development' ? 'AI' : cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                <p className="text-sm text-muted-foreground font-semibold font-inter">Loading active pipeline...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                    <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-semibold">
                      {projects.length === 0 ? 'No active projects running.' : `No projects found under "${activeFilter}".`}
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((proj) => {
                    const docs = projectDocs[proj.id] || [];
                    const progress = getProjectProgress(proj.startDate, proj.endDate);
                    
                    return (
                      <div key={proj.id} className="bg-secondary/40 rounded-[32px] p-6 border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(proj.status || 'active')}`}>
                              {proj.status || 'active'}
                            </span>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getCategoryBadgeStyle(proj.category || 'Web/App Development')}`}>
                              {proj.category || 'Web/App Development'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-muted-foreground flex items-center font-semibold">
                              <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground/60" />
                              {proj.startDate ? proj.startDate.split('T')[0] : 'N/A'}
                            </span>
                            {isSuperAdmin && (
                              <div className="flex items-center space-x-2 border-l border-border pl-3">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(proj)}
                                  className="text-muted-foreground hover:text-accent transition-colors p-1 cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setProjectToDelete(proj)}
                                  className="text-muted-foreground hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-accent mb-2">{proj.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-semibold mb-6">{proj.description}</p>

                        {/* Project Details Panel (Price, WhatsApp, Modules, Deliveries) */}
                        <div className="grid grid-cols-2 gap-4 mb-6 bg-card p-5 rounded-2xl border border-border text-xs font-semibold text-muted-foreground">
                          <div>
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Project Price</span>
                            <span className="text-foreground text-sm font-bold">Rs. {proj.price !== undefined ? Number(proj.price).toLocaleString() : '0'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">WhatsApp Contact</span>
                            <span className="text-foreground text-sm font-bold">{proj.whatsappNumber || 'Not Provided'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-2 font-bold">Modules & Progress</span>
                            {proj.category === 'Web/App Development' && proj.moduleDetails && proj.moduleDetails.length > 0 ? (
                              <div className="space-y-2 bg-secondary/30 p-4 rounded-xl border border-border/60">
                                {proj.moduleDetails.map((mod, idx) => (
                                  <label key={idx} className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={!!mod.completed}
                                        onChange={() => handleToggleModuleCompletion(proj, idx)}
                                        className="h-4 w-4 rounded text-accent border-border bg-card focus:ring-accent/20 cursor-pointer"
                                      />
                                      <span className={`text-xs ${mod.completed ? 'line-through text-muted-foreground/70 font-semibold' : 'text-foreground font-semibold'}`}>
                                        {mod.name}
                                      </span>
                                    </div>
                                    <span className="text-[10.5px] text-accent font-bold">Rs. {Number(mod.price).toLocaleString()}</span>
                                  </label>
                                ))}
                              </div>
                            ) : proj.modules ? (
                              <div className="flex flex-wrap gap-1">
                                {proj.modules.split(',').map((m, idx) => (
                                  <span key={idx} className="bg-secondary text-foreground px-2.5 py-0.5 rounded-lg text-[10.5px] border border-border font-medium">
                                    {m.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-[11px]">No modules specified</span>
                            )}
                          </div>
                          
                            {proj.category === 'Digital Marketing' && (
                              <div className="col-span-2 grid grid-cols-2 gap-4 pt-3 border-t border-border">
                                <div>
                                  <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Target Image Posts</span>
                                  <span className="text-foreground text-sm font-bold">{proj.postCount !== undefined ? proj.postCount : 0} posts</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Target Video Posts</span>
                                  <span className="text-foreground text-sm font-bold">{proj.videoCount !== undefined ? proj.videoCount : 0} videos</span>
                                </div>
                              </div>
                            )}

                          {/* Checklist Status Indicator */}
                          <div className="col-span-2 pt-3 border-t border-border">
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-1.5 font-bold">Deliveries</span>
                            {proj.category === 'Digital Marketing' ? (
                              <div className="grid grid-cols-5 gap-1.5 text-[10px] font-bold text-center">
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryCode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Strategy
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryDocs ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Content
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryDb ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Design
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryQa ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Schedule
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryPayment ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Report
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-5 gap-1.5 text-[10px] font-bold text-center">
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryCode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Code
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryDocs ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Contract
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryDb ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  DB
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryQa ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  QA
                                </div>
                                <div className={`p-1.5 rounded-lg border transition-colors ${proj.deliveryPayment ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                  Pay
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Sleek Progress Bar */}
                        {proj.startDate && proj.endDate && (
                          <div className="space-y-1 mb-6">
                            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <span>Project Duration</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-6 border-t border-border">
                          <p className="text-[11px] font-bold text-accent mb-4 tracking-widest uppercase">AUTO-GENERATED DOCUMENTATION</p>
                          
                          {docs.length === 0 ? (
                            <div className="flex items-center text-muted-foreground py-3 italic bg-card border border-dashed border-border rounded-2xl justify-center text-sm font-semibold">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin text-accent" />
                              Compiling documentation suite...
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {docs.map((doc) => {
                                const name = doc.template?.name || 'Legal Agreement';
                                const isDownloading = downloadingDocId === doc.id;
                                
                                return (
                                  <button
                                    key={doc.id}
                                    disabled={isDownloading}
                                    onClick={() => handleDownloadDoc(doc.id, name)}
                                    className="w-full flex items-center justify-between text-left p-4 rounded-2xl border border-border bg-card hover:bg-secondary/40 hover:shadow-sm transition-all text-sm font-semibold text-emerald-500 cursor-pointer disabled:opacity-75"
                                  >
                                    <span className="flex items-center truncate">
                                      <FileCheck className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
                                      <span className="truncate pr-2">{name}</span>
                                    </span>
                                    {isDownloading ? (
                                      <Loader2 className="h-4 w-4 text-accent animate-spin flex-shrink-0" />
                                    ) : (
                                      <Download className="h-4 w-4 text-accent flex-shrink-0 hover:scale-110 transition-transform" />
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
        </div>

        {/* Edit Project Modal */}
        {editingProject && (() => {
          const oldModulesCount = editingProject.modules
            ? editingProject.modules.split(',').map((m: string) => m.trim()).filter(Boolean).length
            : 0;
          const newModulesCount = editForm.modules
            ? editForm.modules.split(',').map((m: string) => m.trim()).filter(Boolean).length
            : 0;
          const modulesIncreased = newModulesCount > oldModulesCount;

          const oldPriceValue = Number(editingProject.price || 0);
          const newPriceValue = Number(editForm.price || 0);
          const priceValid = newPriceValue > oldPriceValue;

          const oldEndDateVal = editingProject.endDate ? new Date(editingProject.endDate).getTime() : null;
          const newEndDateVal = editForm.endDate ? new Date(editForm.endDate).getTime() : null;
          const dateValid = oldEndDateVal && newEndDateVal ? newEndDateVal > oldEndDateVal : !!newEndDateVal;

          const showModulesWarning = modulesIncreased && (!priceValid || !dateValid);

          const isCompleting = editForm.status === 'completed';
          const allDeliveriesChecked = 
            editForm.deliveryCode &&
            editForm.deliveryDocs &&
            editForm.deliveryDb &&
            editForm.deliveryQa &&
            editForm.deliveryPayment;
          const showDeliveryWarning = isCompleting && !allDeliveriesChecked;

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-card rounded-[32px] p-8 border border-border shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)} 
                  className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="flex items-center space-x-3 mb-6">
                  <Edit2 className="h-6 w-6 text-accent" strokeWidth={2.5} />
                  <h2 className="text-2xl font-bold text-accent tracking-tight">Edit Project</h2>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PROJECT NAME</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Project Apollo"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT NAME</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. SpaceX Corp"
                      value={editForm.clientName}
                      onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT USERNAME (PORTAL ACCESS)</label>
                      <input
                        type="text"
                        placeholder="e.g. client123"
                        value={editForm.clientUsername}
                        onChange={(e) => setEditForm({ ...editForm, clientUsername: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">NEW CLIENT PASSWORD</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep same"
                        value={editForm.clientPassword}
                        onChange={(e) => setEditForm({ ...editForm, clientPassword: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PROJECT CATEGORY</label>
                    <div className="relative">
                      <select
                        value={editForm.category}
                        onChange={(e) => {
                          const newCategory = e.target.value;
                          setEditForm({
                            ...editForm,
                            category: newCategory,
                            modules: newCategory === 'Digital Marketing' ? '' : editForm.modules
                          });
                        }}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                      >
                        <option value="Web/App Development">Web/App Development</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Automation">Automation</option>
                        <option value="AI Development">AI Development</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PROJECT STATUS</label>
                    <div className="relative">
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                      >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">DESCRIPTION</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Define scope, milestones, or core deliverables..."
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">PRICE (RS)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60000"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">WHATSAPP CONTACT</label>
                      <input
                        type="text"
                        placeholder="e.g. +919876543210"
                        value={editForm.whatsappNumber}
                        onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {editForm.category === 'Web/App Development' ? (
                    <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                      <label className="block text-xs font-bold text-accent uppercase tracking-wider">Project Modules & Pricing</label>
                      
                      {editModuleInputs.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {editModuleInputs.map((mod, idx) => (
                            <div key={idx} className="bg-card p-3 rounded-xl border border-border text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-foreground">{mod.name}</div>
                                <div className="flex items-center space-x-3">
                                  <span className="font-bold text-accent">Rs. {Number(mod.price).toLocaleString()}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditModuleInput(idx)}
                                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {mod.description && (
                                <div className="text-[11px] text-muted-foreground font-medium leading-normal">{mod.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Module Name"
                              value={newEditModuleName}
                              onChange={(e) => setNewEditModuleName(e.target.value)}
                              className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Price (Rs)"
                              value={newEditModulePrice}
                              onChange={(e) => setNewEditModulePrice(e.target.value)}
                              className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Module Description / Subtext"
                            value={newEditModuleDescription}
                            onChange={(e) => setNewEditModuleDescription(e.target.value)}
                            className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEditModuleInput}
                          className="w-full py-3.5 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                        >
                          + Add Module
                        </button>
                      </div>
                    </div>
                  ) : editForm.category !== 'Digital Marketing' && (
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET MODULES (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        placeholder="e.g. Auth, Dashboard, API Integration"
                        value={editForm.modules}
                        onChange={(e) => setEditForm({ ...editForm, modules: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  )}

                    {editForm.category === 'Digital Marketing' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET IMAGE POST COUNT</label>
                          <input
                            type="number"
                            placeholder="e.g. 10"
                            value={editForm.postCount}
                            onChange={(e) => setEditForm({ ...editForm, postCount: e.target.value })}
                            className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">TARGET VIDEO POST COUNT</label>
                          <input
                            type="number"
                            placeholder="e.g. 5"
                            value={editForm.videoCount}
                            onChange={(e) => setEditForm({ ...editForm, videoCount: e.target.value })}
                            className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                          />
                        </div>
                      </div>
                    )}

                  {editForm.category === 'Digital Marketing' && (
                    <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                      <label className="block text-xs font-bold text-accent uppercase tracking-wider">Active Platforms Selection</label>
                      <div className="grid grid-cols-2 gap-3">
                        {availablePlatforms.map((plat) => {
                          const isChecked = editForm.platforms ? editForm.platforms.split(',').map(p => p.trim()).includes(plat) : false;
                          return (
                            <label key={plat} className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleToggleEditPlatform(plat, e.target.checked)}
                                  className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{plat}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border/40">
                        <input
                          type="text"
                          placeholder="Add custom platform (e.g. TikTok)"
                          value={newEditPlatformText}
                          onChange={(e) => setNewEditPlatformText(e.target.value)}
                          className="flex-grow px-3.5 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold focus:outline-none text-foreground placeholder-muted-foreground"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomEditPlatform}
                          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">ADDITIONAL DOCUMENT DETAILS / INCLUSIONS (ONE PER LINE)</label>
                    <textarea
                      rows={4}
                      placeholder={`e.g. Special training session for staff\nAll server deployment credentials included\nSupport SLA extended by 30 days`}
                      value={editForm.projectInclusions}
                      onChange={(e) => setEditForm({ ...editForm, projectInclusions: e.target.value })}
                      className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold resize-none leading-relaxed"
                    />
                  </div>

                  {/* Delivery Checklist - Category Specific */}
                  <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                    <span className="block text-xs font-bold text-accent uppercase tracking-wider">PROJECT DELIVERY CHECKLIST</span>
                    {editForm.category === 'Digital Marketing' ? (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryCode}
                            onChange={(e) => setEditForm({ ...editForm, deliveryCode: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Content Strategy Delivered
                          </span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryDocs}
                            onChange={(e) => setEditForm({ ...editForm, deliveryDocs: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Content Created & Approved
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryDb}
                            onChange={(e) => setEditForm({ ...editForm, deliveryDb: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Designs Completed
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryQa}
                            onChange={(e) => setEditForm({ ...editForm, deliveryQa: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Posts Scheduled & Published
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryPayment}
                            onChange={(e) => setEditForm({ ...editForm, deliveryPayment: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Monthly Report Submitted
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryCode}
                            onChange={(e) => setEditForm({ ...editForm, deliveryCode: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Source Code Transferred
                          </span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryDocs}
                            onChange={(e) => setEditForm({ ...editForm, deliveryDocs: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Contract & NDA Signed
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryDb}
                            onChange={(e) => setEditForm({ ...editForm, deliveryDb: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Database Handed Over
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryQa}
                            onChange={(e) => setEditForm({ ...editForm, deliveryQa: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Quality Assurance Passed
                          </span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editForm.deliveryPayment}
                            onChange={(e) => setEditForm({ ...editForm, deliveryPayment: e.target.checked })}
                            className="h-5 w-5 rounded text-accent border-border bg-secondary focus:ring-accent/20 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                            Final Payment Settled
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">START DATE</label>
                      <input
                        required
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">ESTIMATED END DATE</label>
                      <input
                        required
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Warnings Section */}
                  {showModulesWarning && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="font-bold">Target Modules Count Increased ({oldModulesCount} → {newModulesCount})</span>
                      </div>
                      <p className="pl-6 text-amber-500/80">
                        You must increase the price (currently Rs. {oldPriceValue.toLocaleString()} → Rs. {newPriceValue.toLocaleString() || '0'}) and extend the estimated end date.
                      </p>
                    </div>
                  )}

                  {showDeliveryWarning && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                        <span className="font-bold">Checklist Incomplete for Completion</span>
                      </div>
                      <p className="pl-6 text-rose-500/80">
                        You cannot set the project status to Completed until all 5 project deliveries are checked and delivered.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center shadow-lg shadow-accent/10 disabled:opacity-70 cursor-pointer text-base uppercase tracking-wider mt-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Saving changes...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* Delete Confirmation Modal */}
        {projectToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-2xl max-w-md w-full relative text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-accent mb-2">Delete Project?</h3>
              <p className="text-sm text-muted-foreground mb-6 font-semibold">
                Are you sure you want to delete <strong>{projectToDelete.name}</strong>? This action cannot be undone and will permanently delete all associated documents.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(projectToDelete.id)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center cursor-pointer"
                >
                  {deleting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
