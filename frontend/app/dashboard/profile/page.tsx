"use client";

import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Phone, 
  Save, 
  Edit2, 
  Loader2, 
  CheckCircle2,
  Briefcase, 
  Calendar, 
  ListTodo, 
  Check, 
  Layers, 
  Download, 
  IndianRupee, 
  ShieldCheck, 
  FileText, 
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  PenTool
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { DocumentPreviewModal } from '@/components/dashboard/DocumentPreviewModal';

interface Project {
  id: string;
  name: string;
  category?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  price: number;
  postCount: number;
  videoCount: number;
  platforms?: string;
  socialCredentials?: any;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  gstinNumber?: string;
  clientOccupation?: string;
  projectInclusions?: string;
  deliveryCode?: boolean;
  deliveryDocs?: boolean;
  deliveryDb?: boolean;
  deliveryQa?: boolean;
  deliveryPayment?: boolean;
  whatsappNumber?: string;
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
  compiledHtml?: string | null;
  template?: {
    name: string;
    category: string;
  };
}

const formatNameStyle = (username?: string): string => {
  if (!username) return 'Guest User';
  let clean = username.replace(/([a-zA-Z]+)(\d+)/g, '$1 $2');
  return clean
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isClient = user?.role === 'user' || user?.role === 'client';
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectDocs, setProjectDocs] = useState<GeneratedDoc[]>([]);
  const [profileLoading, setProfileLoading] = useState(isClient);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Social media credentials states
  const [socialCreds, setSocialCreds] = useState({
    instagram: { username: '', password: '' },
    facebook: { username: '', password: '' },
    youtube: { username: '', password: '' }
  });
  const [showInstaPass, setShowInstaPass] = useState(false);
  const [showFbPass, setShowFbPass] = useState(false);
  const [showYtPass, setShowYtPass] = useState(false);
  const [savingSocialCreds, setSavingSocialCreds] = useState(false);

  useEffect(() => {
    if (activeProject?.socialCredentials) {
      try {
        const creds = typeof activeProject.socialCredentials === 'string'
          ? JSON.parse(activeProject.socialCredentials)
          : activeProject.socialCredentials;
        if (creds) {
          setSocialCreds({
            instagram: {
              username: creds.instagram?.username || '',
              password: creds.instagram?.password || ''
            },
            facebook: {
              username: creds.facebook?.username || '',
              password: creds.facebook?.password || ''
            },
            youtube: {
              username: creds.youtube?.username || '',
              password: creds.youtube?.password || ''
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse social credentials:", e);
      }
    }
  }, [activeProject]);

  const handleSaveSocialCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    
    setSavingSocialCreds(true);
    try {
      const updatedProj = await fetchWithAuth(`/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialCredentials: socialCreds
        })
      });
      
      setActiveProject(updatedProj);
      alert('Social media page credentials saved securely!');
    } catch (err: any) {
      console.error("Failed to save social credentials:", err);
      alert(err.message || 'Failed to save social credentials.');
    } finally {
      setSavingSocialCreds(false);
    }
  };

  // CEO Signature management
  const [ceoSignature, setCeoSignature] = useState<string | null>(null);
  const [ceoSignMode, setCeoSignMode] = useState<'draw' | 'upload'>('draw');
  const [savingCeoSig, setSavingCeoSig] = useState(false);
  const ceoSigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchWithAuth('/document/ceo-signature')
        .then(res => {
          if (res && res.signatureData) {
            setCeoSignature(res.signatureData);
          }
        })
        .catch(err => console.error("Error loading CEO signature:", err));
    }
  }, [user]);

  const handleSaveCeoSignature = async (sigData?: string) => {
    let dataUrl = sigData;
    if (!dataUrl && ceoSignMode === 'draw') {
      if (ceoSigCanvas.current && !ceoSigCanvas.current.isEmpty()) {
        dataUrl = ceoSigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      } else {
        alert('Please draw a signature first.');
        return;
      }
    }
    
    if (!dataUrl) {
      alert('Please select or draw a signature.');
      return;
    }

    setSavingCeoSig(true);
    try {
      await fetchWithAuth('/document/ceo-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: dataUrl })
      });
      setCeoSignature(dataUrl);
      alert('CEO E-Signature saved successfully and applied dynamically to all company slots across all documents!');
    } catch (err) {
      console.error(err);
      alert('Failed to save CEO signature.');
    } finally {
      setSavingCeoSig(false);
    }
  };

  const handleRemoveCeoSignature = async () => {
    if (!confirm('Are you sure you want to remove the CEO E-Signature? This will revert all agreements back to the default Mr. Ajay S text.')) return;
    setSavingCeoSig(true);
    try {
      await fetchWithAuth('/document/ceo-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: '' })
      });
      setCeoSignature(null);
      if (ceoSigCanvas.current) ceoSigCanvas.current.clear();
      alert('CEO E-Signature removed.');
    } catch (err) {
      console.error(err);
      alert('Failed to remove CEO signature.');
    } finally {
      setSavingCeoSig(false);
    }
  };

  const handleCeoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await handleSaveCeoSignature(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchClientData = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const allProjects = await fetchWithAuth('/projects');
      const filtered = allProjects.filter((p: Project) => p.clientId === user?.id);

      if (filtered.length > 0) {
        const proj = filtered[0];
        setActiveProject(proj);

        // Fetch generated documents for this client's project
        const docs = await fetchWithAuth(`/document/entity/PROJECT/${proj.id}`);
        setProjectDocs(docs);
      }
    } catch (err) {
      console.error("Failed to load client workspace data:", err);
      setProfileError("Unable to retrieve project pipeline.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && user) {
      fetchClientData();
    }
  }, [isClient, user]);

  const handleDownloadDoc = async (docId: string, docName: string) => {
    try {
      setDownloadingDocId(docId);
      const { downloadPdf } = await import('@/lib/download-pdf');
      await downloadPdf(docId, docName, setDownloadingDocId);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const [previewDoc, setPreviewDoc] = useState<GeneratedDoc | null>(null);

  const handlePreviewDoc = async (doc: GeneratedDoc) => {
    try {
      setPreviewDoc(doc);
      if (!doc.compiledHtml) {
        const data = await fetchWithAuth(`/document/${doc.id}`);
        setPreviewDoc(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
      alert('Failed to load document preview');
      setPreviewDoc(null);
    }
  };

  const handleSignDocument = async (signatureData: string, applyToAll: boolean = false) => {
    if (!previewDoc) return;
    try {
      const docsToSign = applyToAll 
        ? projectDocs.filter(d => d.status !== 'signed')
        : [previewDoc];
      
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
      
      const currentUpdated = signedDocs.find(d => d.id === previewDoc.id) || signedDocs[0];
      setPreviewDoc(currentUpdated);
      
      setProjectDocs(prev => {
        return prev.map(d => {
          const updated = signedDocs.find(sd => sd.id === d.id);
          return updated || d;
        });
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUnsignDocument = async (applyToAll: boolean = false) => {
    if (!previewDoc) return;
    try {
      const docsToUnsign = applyToAll 
        ? projectDocs.filter(d => d.status === 'signed')
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
        return prev.map(d => {
          const updated = unsignedDocs.find(ud => ud.id === d.id);
          return updated || d;
        });
      });
    } catch (error) {
      console.error('Error removing signature:', error);
      alert('Failed to remove signature from document');
    }
  };

  const getPreviewNavInfo = () => {
    if (!previewDoc) return { hasNext: false, hasPrev: false, index: -1, docs: [] };
    const index = projectDocs.findIndex(d => d.id === previewDoc.id);
    return {
      hasNext: index !== -1 && index < projectDocs.length - 1,
      hasPrev: index > 0,
      index,
      docs: projectDocs
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
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    if (user) {
      const u = user as any;
      setFormData({
        username: u.username || '',
        email: u.email || '',
        phone: u.whatsappNumber || '',
        company: u.tenantId || 'Default', // Just a placeholder for now
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      await refreshProfile();
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout fullWidth={true}>
      <div className="space-y-8 py-8 w-full">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2 font-inter">
            Manage your account settings, personal information, and preferences.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-bold">{successMsg}</p>
          </div>
        )}

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="flex items-end gap-6">
                <div className="h-24 w-24 rounded-full bg-white p-1.5 shadow-lg border-2 border-indigo-100 flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-black text-3xl">
                    {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-extrabold text-slate-800">{formatNameStyle(user?.username)}</h2>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">{user?.role || 'Client Account'}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`pb-2 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  isEditing ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-slate-700"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> Company / Organization
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-slate-700"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* CEO Signature Card (visible only to superadmin/CEO) */}
        {user?.role === 'superadmin' && (
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm mt-8 relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <PenTool className="h-6 w-6 text-indigo-600" />
                CEO Corporate Signature
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1 font-inter">
                Draw or upload your CEO signature. This signature will automatically apply to all company documents in the "For: HIGAI AUTOMATION LLP" slot.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Signature View */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 font-inter">Active Corporate Signature</h4>
                  <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50 flex items-center justify-center min-h-[140px]">
                    {ceoSignature ? (
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center max-w-[280px]">
                        <img src={ceoSignature} alt="CEO E-Signature" className="max-h-[80px] object-contain" />
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 text-xs italic font-medium font-inter">
                        No corporate signature set.<br/>Using default italic "Ajay S" text.
                      </div>
                    )}
                  </div>
                </div>
                {ceoSignature && (
                  <button
                    type="button"
                    onClick={handleRemoveCeoSignature}
                    className="w-full bg-rose-500/10 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
                  >
                    Delete Signature
                  </button>
                )}
              </div>

              {/* Set New Signature Pad */}
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setCeoSignMode('draw')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${ceoSignMode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Draw
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCeoSignMode('upload')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${ceoSignMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Upload
                  </button>
                </div>

                {ceoSignMode === 'draw' ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-[140px]">
                      <SignatureCanvas 
                        ref={ceoSigCanvas}
                        canvasProps={{ className: 'w-full h-full' }}
                        minWidth={0.8}
                        maxWidth={2.2}
                        backgroundColor="#f8fafc"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => ceoSigCanvas.current?.clear()}
                        className="text-xs text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        Clear Signature Pad
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveCeoSignature()}
                      disabled={savingCeoSig}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {savingCeoSig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save CEO E-Signature
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl h-[140px] flex flex-col items-center justify-center cursor-pointer text-center p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span className="text-xs font-bold text-slate-700">Click to upload signature image</span>
                      <span className="text-[10px] text-slate-400 mt-1">PNG or JPG</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                        onChange={handleCeoFileUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Service Scope & Project Overview (visible to client portal users) */}
        {isClient && activeProject && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                <Layers className="h-6 w-6 text-indigo-600" />
                Service Scope & Project Overview
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                View your complete client profile details, campaign targets, and delivery compliance states below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Client Relations Profile */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Client Relations Profile
                </h3>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Client ID</span>
                    <span className="text-slate-800 text-sm font-bold uppercase">{activeProject.clientId ? activeProject.clientId.replace(/-/g, '/') : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Full Name</span>
                    <span className="text-slate-800 text-sm font-bold">{activeProject.clientName || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Email Address</span>
                    <span className="text-slate-800 text-sm font-bold break-all">{activeProject.clientEmail || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Phone Number (WhatsApp)</span>
                    <span className="text-slate-800 text-sm font-bold">{activeProject.whatsappNumber || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Billing Address</span>
                    <span className="text-slate-800 text-sm font-bold">{activeProject.clientAddress || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">GSTIN Number</span>
                    <span className="text-slate-800 text-sm font-bold uppercase">{activeProject.gstinNumber || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Occupation</span>
                    <span className="text-slate-800 text-sm font-bold">{activeProject.clientOccupation || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Project Specifications */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  Project Specifications
                </h3>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Project ID</span>
                    <span className="text-slate-800 text-sm font-bold uppercase">{activeProject.id ? activeProject.id.replace(/-/g, '/') : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Project Name</span>
                    <span className="text-slate-800 text-sm font-bold">{activeProject.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Category</span>
                    <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-100">
                      {activeProject.category || 'Digital Marketing'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Pricing (Budget)</span>
                    <span className="text-indigo-600 text-sm font-black flex items-center gap-0.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {activeProject.price ? Number(activeProject.price).toLocaleString('en-IN') : '0.00'}
                    </span>
                  </div>
                  {(!activeProject.category || activeProject.category === 'Digital Marketing') && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Active Platforms</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {activeProject.platforms ? activeProject.platforms.split(',').map((plat, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-bold uppercase">
                            {plat.trim()}
                          </span>
                        )) : <span className="text-slate-400 italic">None specified</span>}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Target Deliverables</span>
                    <div className="flex gap-4 mt-1 font-extrabold text-slate-800">
                      <span>🖼️ {activeProject.postCount || 0} Posters</span>
                      <span>🎥 {activeProject.videoCount || 0} Videos</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-0.5">Milestone Duration</span>
                    <div className="text-slate-800 text-xs font-bold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(activeProject.startDate).toLocaleDateString()} – {new Date(activeProject.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  {activeProject.projectInclusions && (
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1.5">Included Deliverables</span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium text-slate-600 leading-normal">
                        {activeProject.projectInclusions.split('\n').map((inc, i) => inc && (
                          <li key={i}>{inc.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Credentials Section */}
            {(!activeProject.category || activeProject.category === 'Digital Marketing') && (
              <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm mt-8 relative overflow-hidden">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <Layers className="h-6 w-6 text-indigo-600" />
                  Social Media Access & Page Credentials
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Manage login details for the 3 active social media platforms we handle for your brand. All passwords are saved in a highly secure database repository.
                </p>
              </div>

              <form onSubmit={handleSaveSocialCreds} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Instagram Professional */}
                  <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 hover:border-pink-300 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-4xl">📸</span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                        IG
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Instagram</h4>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Professional Account</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Username / Email</label>
                        <input
                          type="text"
                          value={socialCreds.instagram.username}
                          onChange={(e) => setSocialCreds({
                            ...socialCreds,
                            instagram: { ...socialCreds.instagram, username: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-slate-700"
                          placeholder="instagram_handle"
                        />
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Password</label>
                        <div className="relative">
                          <input
                            type={showInstaPass ? "text" : "password"}
                            value={socialCreds.instagram.password}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              instagram: { ...socialCreds.instagram, password: e.target.value }
                            })}
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-slate-700"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowInstaPass(!showInstaPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            {showInstaPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facebook Page */}
                  <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 hover:border-blue-300 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-4xl">👥</span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-100">
                        FB
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Facebook</h4>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Business Page</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Username / Email</label>
                        <input
                          type="text"
                          value={socialCreds.facebook.username}
                          onChange={(e) => setSocialCreds({
                            ...socialCreds,
                            facebook: { ...socialCreds.facebook, username: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                          placeholder="facebook_username"
                        />
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Password</label>
                        <div className="relative">
                          <input
                            type={showFbPass ? "text" : "password"}
                            value={socialCreds.facebook.password}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              facebook: { ...socialCreds.facebook, password: e.target.value }
                            })}
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFbPass(!showFbPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            {showFbPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Channel */}
                  <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 hover:border-red-300 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-4xl">📺</span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-red-100">
                        YT
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">YouTube</h4>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Channel Handle</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Username / Email</label>
                        <input
                          type="text"
                          value={socialCreds.youtube.username}
                          onChange={(e) => setSocialCreds({
                            ...socialCreds,
                            youtube: { ...socialCreds.youtube, username: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-medium text-slate-700"
                          placeholder="youtube_channel_name"
                        />
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-slate-500 block uppercase tracking-wider text-[9px] font-black">Password</label>
                        <div className="relative">
                          <input
                            type={showYtPass ? "text" : "password"}
                            value={socialCreds.youtube.password}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              youtube: { ...socialCreds.youtube, password: e.target.value }
                            })}
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-medium text-slate-700"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowYtPass(!showYtPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            {showYtPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSocialCreds}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-150 transition-all disabled:opacity-70 active:scale-95 cursor-pointer"
                  >
                    {savingSocialCreds ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Brand Credentials
                  </button>
                </div>
              </form>
            </div>
            )}

            {/* Project Documents Section */}
            {projectDocs.length > 0 && (
              <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="h-32 w-32" />
                </div>
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    Secure Documents
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Access and download your finalized agreements and project documents.
                  </p>
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectDocs.map((doc) => (
                    <div key={doc.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/80 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col group">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-xl shadow-sm group-hover:scale-110 group-hover:text-indigo-500 transition-transform">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 truncate" title={doc.template?.name || "Document"}>
                            {doc.template?.name || "Project Document"}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          doc.status === 'signed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status === 'signed' ? '✅ Signed' : '⏳ Pending'}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {doc.status !== 'signed' ? (
                            <button
                              type="button"
                              onClick={() => handlePreviewDoc(doc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white hover:bg-accent/80 hover:scale-105 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-md shadow-accent/15"
                              title="Sign Document"
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              Sign
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePreviewDoc(doc)}
                              className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleDownloadDoc(doc.id, doc.template?.name || 'Document')}
                            disabled={downloadingDocId === doc.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                          >
                            {downloadingDocId === doc.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
