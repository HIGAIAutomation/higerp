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
  X,
  Eye
} from 'lucide-react';

import { DocumentPreviewModal } from '@/components/dashboard/DocumentPreviewModal';

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
  clientEmail?: string;
  clientAddress?: string;
  gstinNumber?: string;
  clientOccupation?: string;
  techStack?: { frontend: string; backend: string; database: string; hosting: string };
  apiList?: { name: string; chargeType: string; amount: string }[];
  domainDetails?: { name: string; charge: string; renewalPeriod: string };
  serverDetails?: { name: string; storage: string; costPerMonth: string };
}

interface GeneratedDoc {
  id: string;
  templateId: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  status: string;
  template?: {
    name: string;
    category: string;
  };
  compiledHtml?: string;
  signatureData?: string;
  signedAt?: string;
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
  const [previewDoc, setPreviewDoc] = useState<GeneratedDoc | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

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

  const [newApiName, setNewApiName] = useState('');
  const [newApiChargeType, setNewApiChargeType] = useState('Monthly');
  const [newApiAmount, setNewApiAmount] = useState('');

  const handleAddApiInput = () => {
    if (!newApiName.trim()) return;
    setForm(prev => ({
      ...prev,
      apiList: [...prev.apiList, { name: newApiName.trim(), chargeType: newApiChargeType, amount: newApiAmount.trim() }]
    }));
    setNewApiName('');
    setNewApiAmount('');
  };

  const handleRemoveApiInput = (index: number) => {
    setForm(prev => ({
      ...prev,
      apiList: prev.apiList.filter((_, i) => i !== index)
    }));
  };

  const [editModuleInputs, setEditModuleInputs] = useState<any[]>([]);
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
    
    setForm(prev => ({
      ...prev,
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
    
    // Find max phase and id if needed
    const maxPhase = editModuleInputs.reduce((max, m) => Math.max(max, m.phase || 1), 1);
    const newModule = { 
      id: `mod_${Date.now()}`,
      name: trimmedName, 
      price: String(parsedPrice), 
      description: trimmedDesc, 
      completed: false,
      status: 'new',
      phase: maxPhase
    };
    const updatedInputs = [...editModuleInputs, newModule];
    setEditModuleInputs(updatedInputs);
    
    const totalPrice = updatedInputs.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
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
    clientEmail: '',
    clientAddress: '',
    gstinNumber: '',
    clientOccupation: '',
    techStack: { frontend: '', backend: '', database: '', hosting: '' },
    apiList: [] as { name: string; chargeType: string; amount: string }[],
    domainDetails: { name: '', charge: '', renewalPeriod: '' },
    serverDetails: { name: '', storage: '', costPerMonth: '' },
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
    clientEmail: '',
    clientAddress: '',
    gstinNumber: '',
    clientOccupation: '',
    techStack: { frontend: '', backend: '', database: '', hosting: '' },
    apiList: [] as { name: string; chargeType: string; amount: string }[],
    domainDetails: { name: '', charge: '', renewalPeriod: '' },
    serverDetails: { name: '', storage: '', costPerMonth: '' },
  });

  // Auto-calculate budget for Web/App Development
  useEffect(() => {
    if (form.category === 'Web/App Development') {
      let total = 0;
      // 1. Modules
      moduleInputs.forEach(mod => {
        total += parseFloat(mod.price) || 0;
      });
      // 2. Domain Charge
      const domainVal = parseFloat((form.domainDetails?.charge || '').replace(/[^0-9.]/g, '')) || 0;
      total += domainVal;
      // 3. Server Cost
      const serverVal = parseFloat((form.serverDetails?.costPerMonth || '').replace(/[^0-9.]/g, '')) || 0;
      total += serverVal;
      // 4. API initial charge
      form.apiList?.forEach(api => {
        total += parseFloat((api.amount || '').replace(/[^0-9.]/g, '')) || 0;
      });
      
      setForm(prev => {
        if (prev.price === String(total)) return prev;
        return { ...prev, price: String(total) };
      });
    }
  }, [moduleInputs, form.domainDetails?.charge, form.serverDetails?.costPerMonth, form.apiList, form.category]);

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

  const handlePreviewDoc = async (doc: GeneratedDoc) => {
    try {
      setPreviewDoc(doc);
      if (!doc.compiledHtml) {
        // Fetch the full document including HTML if not loaded
        const res = await fetchWithAuth(`/document/${doc.id}`);
        const data = await res.json();
        setPreviewDoc(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
      alert('Failed to load document preview');
      setPreviewDoc(null);
    }
  };

  const getPreviewNavInfo = () => {
    if (!previewDoc || !previewDoc.entityId) return { hasNext: false, hasPrev: false, index: -1, docs: [] };
    const docs = projectDocs[previewDoc.entityId] || [];
    const index = docs.findIndex(d => d.id === previewDoc.id);
    return {
      hasNext: index !== -1 && index < docs.length - 1,
      hasPrev: index > 0,
      index,
      docs
    };
  };

  const handleNextPreview = () => {
    const { hasNext, index, docs } = getPreviewNavInfo();
    if (hasNext) handlePreviewDoc(docs[index + 1]);
  };

  const handlePrevPreview = () => {
    const { hasPrev, index, docs } = getPreviewNavInfo();
    if (hasPrev) handlePreviewDoc(docs[index - 1]);
  };

  const handleSignDocument = async (signatureData: string, applyToAll: boolean = false) => {
    if (!previewDoc) return;
    try {
      const entityId = previewDoc.entityId;
      const docsToSign = applyToAll 
        ? (projectDocs[entityId] || []).filter(d => d.status !== 'signed')
        : [previewDoc];
      
      // Ensure we at least sign the current document if it was somehow skipped
      if (applyToAll && !docsToSign.find(d => d.id === previewDoc.id)) {
        docsToSign.push(previewDoc);
      }

      const signedDocs = await Promise.all(docsToSign.map(async (docToSign) => {
        const updatedDoc = await fetchWithAuth(`/document/${docToSign.id}/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signatureData })
        });
        return updatedDoc;
      }));
      
      // Update local state
      const currentUpdated = signedDocs.find(d => d.id === previewDoc.id) || signedDocs[0];
      setPreviewDoc(currentUpdated);
      
      // Update the documents list for this project
      setProjectDocs(prev => {
        const pDocs = prev[entityId] || [];
        return {
          ...prev,
          [entityId]: pDocs.map(d => {
            const updated = signedDocs.find(sd => sd.id === d.id);
            return updated || d;
          })
        };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUnsignDocument = async (applyToAll: boolean = false) => {
    if (!previewDoc) return;
    try {
      const entityId = previewDoc.entityId;
      const docsToUnsign = applyToAll 
        ? (projectDocs[entityId] || []).filter(d => d.status === 'signed')
        : [previewDoc];

      if (docsToUnsign.length === 0) return;

      const unsignedDocs = await Promise.all(docsToUnsign.map(async (doc) => {
        return await fetchWithAuth(`/document/${doc.id}/unsign`, {
          method: 'POST',
        });
      }));
      
      const currentUpdated = unsignedDocs.find(d => d.id === previewDoc.id) || unsignedDocs[0];
      if (currentUpdated) setPreviewDoc(currentUpdated);
      
      setProjectDocs(prev => {
        const pDocs = prev[entityId] || [];
        return {
          ...prev,
          [entityId]: pDocs.map(d => {
            const updated = unsignedDocs.find(ud => ud.id === d.id);
            return updated || d;
          })
        };
      });
    } catch (error) {
      console.error('Error removing signature:', error);
      alert('Failed to remove signature from document');
    }
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
          moduleDetails: form.category !== 'Digital Marketing' ? moduleInputs.map(m => ({ name: m.name, price: parseFloat(m.price), description: m.description, completed: m.completed })) : undefined
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
        clientEmail: '',
        clientAddress: '',
        gstinNumber: '',
        clientOccupation: '',
        techStack: { frontend: '', backend: '', database: '', hosting: '' },
        apiList: [],
        domainDetails: { name: '', charge: '', renewalPeriod: '' },
        serverDetails: { name: '', storage: '', costPerMonth: '' },
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
      clientEmail: proj.clientEmail || '',
      clientAddress: proj.clientAddress || '',
      gstinNumber: proj.gstinNumber || '',
      clientOccupation: proj.clientOccupation || '',
      techStack: proj.techStack || { frontend: '', backend: '', database: '', hosting: '' },
      apiList: proj.apiList || [],
      domainDetails: proj.domainDetails || { name: '', charge: '', renewalPeriod: '' },
      serverDetails: proj.serverDetails || { name: '', storage: '', costPerMonth: '' },
    });
    
    const details = proj.moduleDetails || [];
    setEditModuleInputs(details.map((m: any) => ({
      ...m,
      price: m.price ? String(m.price) : ''
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

    if (editForm.status === 'completed' && editForm.category !== 'Digital Marketing') {
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
          moduleDetails: editForm.category !== 'Digital Marketing' ? editModuleInputs.map(m => ({ ...m, price: m.price ? parseFloat(m.price) : null })) : undefined
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
    <DashboardLayout fullWidth={true}>
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
                    autoComplete="off"
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
                    autoComplete="new-password"
                    placeholder="e.g. password123"
                    value={form.clientPassword}
                    onChange={(e) => setForm({ ...form, clientPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT EMAIL</label>
                  <input
                    type="email"
                    placeholder="e.g. client@spacey.com"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT ADDRESS</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St, NY"
                    value={form.clientAddress}
                    onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">GSTIN NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    value={form.gstinNumber}
                    onChange={(e) => setForm({ ...form, gstinNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT OCCUPATION (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. Director, Business Owner"
                    value={form.clientOccupation}
                    onChange={(e) => setForm({ ...form, clientOccupation: e.target.value })}
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

              {form.category === 'Web/App Development' && (
                <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                  <label className="block text-xs font-bold text-accent uppercase tracking-wider">Technology Stack (For Documents)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Frontend (e.g. React, Next.js)"
                        value={form.techStack.frontend}
                        onChange={(e) => setForm({ ...form, techStack: { ...form.techStack, frontend: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Backend (e.g. Node.js, Python)"
                        value={form.techStack.backend}
                        onChange={(e) => setForm({ ...form, techStack: { ...form.techStack, backend: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Database (e.g. MongoDB, PostgreSQL)"
                        value={form.techStack.database}
                        onChange={(e) => setForm({ ...form, techStack: { ...form.techStack, database: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Hosting (e.g. AWS, Vercel)"
                        value={form.techStack.hosting}
                        onChange={(e) => setForm({ ...form, techStack: { ...form.techStack, hosting: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.category === 'Web/App Development' && (
                <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                  <label className="block text-xs font-bold text-accent uppercase tracking-wider">Domain & Server Details</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Domain Name (e.g. google.com)"
                        value={form.domainDetails.name}
                        onChange={(e) => setForm({ ...form, domainDetails: { ...form.domainDetails, name: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Domain Charge (e.g. Rs 1000)"
                        value={form.domainDetails.charge}
                        onChange={(e) => setForm({ ...form, domainDetails: { ...form.domainDetails, charge: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Renewal Period (e.g. Yearly)"
                        value={form.domainDetails.renewalPeriod}
                        onChange={(e) => setForm({ ...form, domainDetails: { ...form.domainDetails, renewalPeriod: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Server Name (e.g. AWS EC2)"
                        value={form.serverDetails.name}
                        onChange={(e) => setForm({ ...form, serverDetails: { ...form.serverDetails, name: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Storage (e.g. 50GB)"
                        value={form.serverDetails.storage}
                        onChange={(e) => setForm({ ...form, serverDetails: { ...form.serverDetails, storage: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Cost per Month (e.g. Rs 500)"
                        value={form.serverDetails.costPerMonth}
                        onChange={(e) => setForm({ ...form, serverDetails: { ...form.serverDetails, costPerMonth: e.target.value } })}
                        className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <label className="block text-xs font-bold text-accent uppercase tracking-wider mb-4">API Integrations</label>
                    {form.apiList.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {form.apiList.map((api, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-card p-3 rounded-xl border border-border text-xs">
                            <div>
                              <span className="font-bold text-foreground">{api.name}</span>
                              <span className="text-muted-foreground ml-2">({api.chargeType})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveApiInput(idx)}
                              className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="API Name (e.g. Stripe)"
                          value={newApiName}
                          onChange={(e) => setNewApiName(e.target.value)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <select
                          value={newApiChargeType}
                          onChange={(e) => setNewApiChargeType(e.target.value)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Subscription">Subscription</option>
                          <option value="One-time">One-time</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Amount"
                          value={newApiAmount}
                          onChange={(e) => setNewApiAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleAddApiInput}
                          className="w-full py-3 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                        >
                          Add API
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

              {form.category !== 'Digital Marketing' && (
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

              {form.category !== 'Digital Marketing' && (
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
              )}

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
                    onClick={() => { setActiveFilter(cat); setSelectedProjectId(''); }}
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
                {filteredProjects.length > 0 && (
                  <div>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none"
                    >
                      <option value="">-- Select a Project to View Details --</option>
                      {filteredProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                    <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-semibold">
                      {projects.length === 0 ? 'No active projects running.' : `No projects found under "${activeFilter}".`}
                    </p>
                  </div>
                ) : !selectedProjectId || !filteredProjects.find(p => p.id === selectedProjectId) ? (
                  <div className="text-center py-16 bg-secondary/30 rounded-[24px] border border-dashed border-border">
                    <FolderOpen className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-semibold">
                      Please select a project from the dropdown above to view its details.
                    </p>
                  </div>
                ) : (
                  [filteredProjects.find(p => p.id === selectedProjectId)!].map((proj) => {
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
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Project ID</span>
                            <span className="text-foreground text-sm font-bold uppercase">{proj.id.replace(/-/g, '/')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Client ID</span>
                            <span className="text-foreground text-sm font-bold uppercase">{proj.client?.id ? proj.client.id.replace(/-/g, '/') : 'Not Provided'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Project Price</span>
                            <span className="text-foreground text-sm font-bold">Rs. {proj.price !== undefined ? Number(proj.price).toLocaleString() : '0'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">WhatsApp Contact</span>
                            <span className="text-foreground text-sm font-bold">{proj.whatsappNumber || 'Not Provided'}</span>
                          </div>
                          {proj.clientEmail && (
                            <div>
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Client Email</span>
                              <span className="text-foreground text-sm font-bold">{proj.clientEmail}</span>
                            </div>
                          )}
                          {proj.clientOccupation && (
                            <div>
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Client Occupation</span>
                              <span className="text-foreground text-sm font-bold">{proj.clientOccupation}</span>
                            </div>
                          )}
                          {proj.clientAddress && (
                            <div className="col-span-2">
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">Client Address</span>
                              <span className="text-foreground text-sm font-bold">{proj.clientAddress}</span>
                            </div>
                          )}
                          {proj.gstinNumber && (
                            <div className="col-span-2">
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-0.5">GSTIN Number</span>
                              <span className="text-foreground text-sm font-bold uppercase">{proj.gstinNumber}</span>
                            </div>
                          )}
                          {proj.category !== 'Digital Marketing' && (
                            <div className="col-span-2">
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-2 font-bold">Modules & Progress</span>
                              {proj.category !== 'Digital Marketing' && proj.moduleDetails && proj.moduleDetails.length > 0 ? (
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
                          )}
                          
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
                          {proj.category !== 'Digital Marketing' && (
                            <div className="col-span-2 pt-3 border-t border-border">
                              <span className="text-[10px] text-muted-foreground/75 block uppercase tracking-wider mb-1.5 font-bold">Deliveries</span>
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
                            </div>
                          )}
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
                              <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                              No documentation generated.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {docs.map((doc) => {
                                const name = doc.template?.name || 'Legal Agreement';
                                const isDownloading = downloadingDocId === doc.id;
                                
                                return (
                                  <div
                                    key={doc.id}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-secondary/40 hover:shadow-sm transition-all"
                                  >
                                    <div className="flex items-center truncate max-w-[70%]">
                                      <FileCheck className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
                                      <div className="flex flex-col truncate">
                                        <span className="truncate pr-2 text-sm font-semibold text-emerald-500">{name}</span>
                                        {doc.status === 'signed' && (
                                          <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full w-fit mt-1">
                                            Signed on {new Date(doc.signedAt!).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handlePreviewDoc(doc)}
                                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
                                        title="Preview and Sign"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <button
                                        disabled={isDownloading}
                                        onClick={() => handleDownloadDoc(doc.id, name)}
                                        className="p-2 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-full transition-colors disabled:opacity-50"
                                        title="Download PDF"
                                      >
                                        {isDownloading ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Download className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
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
          const showDeliveryWarning = editForm.category !== 'Digital Marketing' && isCompleting && !allDeliveriesChecked;

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
                        autoComplete="off"
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
                        autoComplete="new-password"
                        placeholder="Leave blank to keep same"
                        value={editForm.clientPassword}
                        onChange={(e) => setEditForm({ ...editForm, clientPassword: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT EMAIL</label>
                      <input
                        type="email"
                        placeholder="e.g. client@spacey.com"
                        value={editForm.clientEmail}
                        onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT ADDRESS</label>
                      <input
                        type="text"
                        placeholder="e.g. 123 Main St, NY"
                        value={editForm.clientAddress}
                        onChange={(e) => setEditForm({ ...editForm, clientAddress: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">GSTIN NUMBER</label>
                      <input
                        type="text"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={editForm.gstinNumber}
                        onChange={(e) => setEditForm({ ...editForm, gstinNumber: e.target.value })}
                        className="w-full px-5 py-4 bg-secondary border-none rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:bg-secondary/80 focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-2 uppercase tracking-wider">CLIENT OCCUPATION (OPTIONAL)</label>
                      <input
                        type="text"
                        placeholder="e.g. Director, Business Owner"
                        value={editForm.clientOccupation}
                        onChange={(e) => setEditForm({ ...editForm, clientOccupation: e.target.value })}
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

                  {editForm.category === 'Web/App Development' && (
                    <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                      <label className="block text-xs font-bold text-accent uppercase tracking-wider">Technology Stack (For Documents)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Frontend (e.g. React, Next.js)"
                            value={editForm.techStack.frontend}
                            onChange={(e) => setEditForm({ ...editForm, techStack: { ...editForm.techStack, frontend: e.target.value } })}
                            className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Backend (e.g. Node.js, Python)"
                            value={editForm.techStack.backend}
                            onChange={(e) => setEditForm({ ...editForm, techStack: { ...editForm.techStack, backend: e.target.value } })}
                            className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Database (e.g. MongoDB, PostgreSQL)"
                            value={editForm.techStack.database}
                            onChange={(e) => setEditForm({ ...editForm, techStack: { ...editForm.techStack, database: e.target.value } })}
                            className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Hosting (e.g. AWS, Vercel)"
                            value={editForm.techStack.hosting}
                            onChange={(e) => setEditForm({ ...editForm, techStack: { ...editForm.techStack, hosting: e.target.value } })}
                            className="w-full px-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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

                  {editForm.category !== 'Digital Marketing' && (
                    <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                      <label className="block text-xs font-bold text-accent uppercase tracking-wider">Project Modules & Pricing</label>
                      
                      {editModuleInputs.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {editModuleInputs.map((mod, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border text-xs space-y-2 ${mod.isNewRequest && !mod.price ? 'bg-amber-50/50 border-amber-200' : 'bg-card border-border'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-foreground flex items-center gap-2">
                                    {mod.name}
                                    {mod.isNewRequest && !mod.price && (
                                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">New</span>
                                    )}
                                  </div>
                                  {mod.description && (
                                    <div className="text-[11px] text-muted-foreground font-medium leading-normal mt-1">{mod.description}</div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 ml-4">
                                  {mod.isNewRequest && !mod.price ? (
                                    <input
                                      type="number"
                                      placeholder="Set Price"
                                      value={mod.price || ''}
                                      onChange={(e) => {
                                        const next = [...editModuleInputs];
                                        next[idx].price = e.target.value;
                                        setEditModuleInputs(next);
                                        // Update total price
                                        const newTotal = next.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
                                        setEditForm(prev => ({ ...prev, price: String(newTotal) }));
                                      }}
                                      className="w-24 px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                                    />
                                  ) : (
                                    <span className="font-bold text-accent">Rs. {Number(mod.price).toLocaleString()}</span>
                                  )}
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditModuleInput(idx)}
                                    className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
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

                  {editForm.category !== 'Digital Marketing' && (
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
                  )}

                  {/* Delivery Checklist - Category Specific */}
                  {editForm.category !== 'Digital Marketing' && (
                    <div className="bg-secondary/40 p-6 rounded-2xl border border-border space-y-4">
                      <span className="block text-xs font-bold text-accent uppercase tracking-wider">PROJECT DELIVERY CHECKLIST</span>
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
                    </div>
                  )}

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
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc?.id || ''}
        documentName={previewDoc?.template?.name || 'Document'}
        compiledHtml={previewDoc?.compiledHtml || null}
        onSign={handleSignDocument}
        onUnsign={handleUnsignDocument}
        status={previewDoc?.status}
        onNext={handleNextPreview}
        onPrev={handlePrevPreview}
        hasNext={getPreviewNavInfo().hasNext}
        hasPrev={getPreviewNavInfo().hasPrev}
      />
    </DashboardLayout>
  );
}
