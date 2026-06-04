"use client";

import { DocumentPreviewModal } from '@/components/dashboard/DocumentPreviewModal';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { fetchWithAuth } from '@/lib/api';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    Download,
    Edit2,
    Eye,
    EyeOff,
    FileText,
    Fingerprint,
    Globe,
    IndianRupee,
    Layers,
    Loader2,
    Mail,
    MapPin,
    PenTool,
    Phone,
    Save,
    ShieldCheck,
    Tag,
    User
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

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

  const isClient = user?.role === 'client' || user?.id?.startsWith('higc-') || (user?.role === 'user' && !(user as any).employee);
  const isEmployee = (user as any)?.employee?.metadata?.roleType === 'employee';
  const isIntern = (user as any)?.employee?.metadata?.roleType === 'intern';
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
    const fetchEmployeeDocs = async () => {
      const u = user as any;
      if (u?.employee?.id) {
        try {
          const empData = await fetchWithAuth(`/hrms/employees/${u.employee.id}`);
          if (empData && empData.documents) {
            setProjectDocs(empData.documents);
          }
        } catch (err) {
          console.error("Failed to load employee/intern documents:", err);
        }
      }
    };

    if ((user as any)?.employee?.id) {
      fetchEmployeeDocs();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const u = user as any;
      const emp = u.employee;
      
      let fullName = u.username || '';
      let email = u.email || '';
      let phone = u.whatsappNumber || '';
      let company = u.tenantId || 'Default';

      if (emp) {
        if (emp.metadata?.roleType === 'intern' && emp.metadata?.studentName) {
          fullName = emp.metadata.studentName;
        } else if (emp.firstName) {
          fullName = emp.firstName + (emp.lastName ? ' ' + emp.lastName : '');
        }
        
        email = emp.email || u.email || '';
        phone = emp.metadata?.contact || u.whatsappNumber || '';
        company = emp.metadata?.college || emp.metadata?.previousCompany || 'HIG AI Automation';
      }

      setFormData({
        username: fullName,
        email: email,
        phone: phone,
        company: company,
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
      <div className="space-y-4 py-4 w-full">
        <div>
          <h1 className="text-sm font-bold text-[#2E9EDE] tracking-tight">My Profile</h1>
          <p className="text-[10px] text-slate-400 mt-0.5 font-inter">
            Manage your account settings, personal information, and preferences.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold">{successMsg}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="h-12 sm:h-16 bg-gradient-to-r from-[#2E9EDE] to-[#1c85be]"></div>
          
          <div className="px-3 sm:px-4 pb-4">
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 -mt-6 sm:-mt-8 mb-4">
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white p-0.5 shadow-md border-2 border-sky-100 flex-shrink-0">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center text-[#2E9EDE] font-black text-xs sm:text-sm">
                    {(formData.username || user?.username || 'US').substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{formData.username || formatNameStyle(user?.username)}</h2>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : (user as any)?.employee?.metadata?.roleType || 'Client Account'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center justify-center gap-1 px-2 py-1 rounded-md font-bold text-[10px] transition-colors whitespace-nowrap flex-shrink-0 ${
                  isEditing ? 'bg-slate-100 text-slate-600' : 'bg-sky-50 text-[#2E9EDE] hover:bg-sky-100'
                }`}
              >
                <Edit2 className="h-2.5 w-2.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[#2E9EDE]" /> Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-xs text-slate-700"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-[#2E9EDE]" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-xs text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-[#2E9EDE]" /> Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-xs text-slate-700"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-[#2E9EDE]" /> Company / Organization
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-xs text-slate-700"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2E9EDE] hover:bg-[#1c85be] text-white font-bold text-xs rounded-lg shadow-md shadow-sky-100 transition-all disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* CEO Signature Card (visible only to superadmin/CEO) */}
        {user?.role === 'superadmin' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mt-6 relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                <PenTool className="h-4 w-4 text-[#2E9EDE]" />
                CEO Corporate Signature
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-inter">
                Draw or upload your CEO signature. This signature will automatically apply to all company documents.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Signature View */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-inter">Active Corporate Signature</h4>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-center min-h-[100px]">
                    {ceoSignature ? (
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center max-w-[200px]">
                        <img src={ceoSignature} alt="CEO E-Signature" className="max-h-[60px] object-contain" />
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 text-[10px] italic font-medium font-inter">
                        No corporate signature set.<br/>Using default italic "Ajay S" text.
                      </div>
                    )}
                  </div>
                </div>
                {ceoSignature && (
                  <button
                    type="button"
                    onClick={handleRemoveCeoSignature}
                    className="w-full bg-rose-500/10 text-rose-600 py-1.5 rounded-lg font-bold hover:bg-rose-500 hover:text-white transition-all text-xs cursor-pointer"
                  >
                    Delete Signature
                  </button>
                )}
              </div>

              {/* Set New Signature Pad */}
              <div className="space-y-3">
                <div className="flex gap-2 p-0.5 bg-slate-100 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setCeoSignMode('draw')}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded transition-colors cursor-pointer ${ceoSignMode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Draw
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCeoSignMode('upload')}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded transition-colors cursor-pointer ${ceoSignMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Upload
                  </button>
                </div>

                {ceoSignMode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-[100px]">
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
                        className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        Clear Signature Pad
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveCeoSignature()}
                      disabled={savingCeoSig}
                      className="w-full bg-[#2E9EDE] hover:bg-[#1c85be] text-white py-1.5 rounded-lg font-bold shadow-md shadow-sky-100 flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      {savingCeoSig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>Save CEO E-Signature</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-colors rounded-xl h-[100px] flex flex-col items-center justify-center cursor-pointer text-center p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E9EDE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span className="text-[10px] font-bold text-slate-700">Click to upload signature image</span>
                      <span className="text-[8px] text-slate-400">PNG or JPG</span>
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
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-t border-slate-200 pt-5">
              <h2 className="text-base font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2E9EDE]" />
                Service Scope & Project Overview
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                View your complete client profile details, campaign targets, and delivery compliance states below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1: Client Relations Profile */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#2E9EDE]" />
                  Client Relations Profile
                </h3>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Fingerprint className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Client ID</span>
                      <span className="text-slate-800 text-xs font-bold uppercase block truncate">{activeProject.clientId ? activeProject.clientId.replace(/-/g, '/') : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Full Name</span>
                      <span className="text-slate-800 text-xs font-bold block truncate">{activeProject.clientName || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Email Address</span>
                      <span className="text-slate-800 text-xs font-bold block break-all">{activeProject.clientEmail || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Phone Number</span>
                      <span className="text-slate-800 text-xs font-bold block truncate">{activeProject.whatsappNumber || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Occupation</span>
                      <span className="text-slate-800 text-xs font-bold block truncate">{activeProject.clientOccupation || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Billing Address</span>
                      <span className="text-slate-800 text-xs font-bold block leading-relaxed">{activeProject.clientAddress || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">GSTIN Number</span>
                      <span className="text-slate-800 text-xs font-bold uppercase block">{activeProject.gstinNumber || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Project Specifications */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#2E9EDE]" />
                  Project Specifications
                </h3>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Compass className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Project ID</span>
                      <span className="text-slate-800 text-xs font-bold uppercase block truncate">{activeProject.id ? activeProject.id.replace(/-/g, '/') : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Project Name</span>
                      <span className="text-slate-800 text-xs font-bold block truncate">{activeProject.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Category</span>
                      <span className="inline-flex px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[8px] font-black uppercase mt-0.5">
                        {activeProject.category || 'Digital Marketing'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <IndianRupee className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Pricing (Budget)</span>
                      <span className="text-[#2E9EDE] text-xs font-black flex items-center gap-0.5 mt-0.5">
                        ₹{activeProject.price ? Number(activeProject.price).toLocaleString('en-IN') : '0.00'}
                      </span>
                    </div>
                  </div>

                  {(!activeProject.category || activeProject.category === 'Digital Marketing') && (
                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Active Platforms</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activeProject.platforms ? activeProject.platforms.split(',').map((plat, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[8px] font-bold uppercase">
                              {plat.trim()}
                            </span>
                          )) : <span className="text-slate-400 italic text-[10px]">None specified</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Target Deliverables</span>
                      {activeProject.category === 'Web/App Development' ? (
                        <span className="text-slate-800 text-xs font-bold block mt-0.5">
                          📦 {activeProject.moduleDetails?.length || 0} Modules
                        </span>
                      ) : (
                        <div className="flex gap-2 font-bold text-slate-800 text-xs mt-0.5">
                          <span>🖼️ {activeProject.postCount || 0} Posters</span>
                          <span>🎥 {activeProject.videoCount || 0} Videos</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Milestone Duration</span>
                      <span className="text-slate-800 text-xs font-semibold block mt-0.5">
                        {new Date(activeProject.startDate).toLocaleDateString()} – {new Date(activeProject.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {activeProject.projectInclusions && (
                    <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex items-start gap-2.5">
                      <div className="p-1 rounded bg-sky-50 text-[#2E9EDE] flex-shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold mb-1">Included Deliverables</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] font-medium text-slate-600 leading-relaxed">
                          {activeProject.projectInclusions.split('\n').map((inc, i) => inc && (
                            <li key={i}>{inc.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Credentials Card */}
            {(!activeProject.category || activeProject.category === 'Digital Marketing') && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mt-6">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#2E9EDE]" />
                    Social Media Credentials
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Manage login details for the 3 active social media platforms we handle for your brand.
                  </p>
                </div>

                <form onSubmit={handleSaveSocialCreds} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Instagram Professional */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:border-pink-300 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          IG
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-800">Instagram</h4>
                          <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Professional Account</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[10px] font-semibold">
                        <div className="space-y-1">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Username / Email</label>
                          <input
                            type="text"
                            value={socialCreds.instagram.username}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              instagram: { ...socialCreds.instagram, username: e.target.value }
                            })}
                            className="w-full px-2 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                            placeholder="instagram_handle"
                          />
                        </div>
                        <div className="space-y-1 relative">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Password</label>
                          <div className="relative">
                            <input
                              type={showInstaPass ? "text" : "password"}
                              value={socialCreds.instagram.password}
                              onChange={(e) => setSocialCreds({
                                ...socialCreds,
                                instagram: { ...socialCreds.instagram, password: e.target.value }
                              })}
                              className="w-full pl-2 pr-8 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                              placeholder="••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowInstaPass(!showInstaPass)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            >
                              {showInstaPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Facebook Page */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:border-blue-300 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          FB
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-800">Facebook</h4>
                          <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Business Page</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[10px] font-semibold">
                        <div className="space-y-1">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Username / Email</label>
                          <input
                            type="text"
                            value={socialCreds.facebook.username}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              facebook: { ...socialCreds.facebook, username: e.target.value }
                            })}
                            className="w-full px-2 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                            placeholder="facebook_username"
                          />
                        </div>
                        <div className="space-y-1 relative">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Password</label>
                          <div className="relative">
                            <input
                              type={showFbPass ? "text" : "password"}
                              value={socialCreds.facebook.password}
                              onChange={(e) => setSocialCreds({
                                ...socialCreds,
                                facebook: { ...socialCreds.facebook, password: e.target.value }
                              })}
                              className="w-full pl-2 pr-8 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                              placeholder="••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowFbPass(!showFbPass)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            >
                              {showFbPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* YouTube Channel */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:border-red-300 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          YT
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-800">YouTube</h4>
                          <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Channel Handle</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-[10px] font-semibold">
                        <div className="space-y-1">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Username / Email</label>
                          <input
                            type="text"
                            value={socialCreds.youtube.username}
                            onChange={(e) => setSocialCreds({
                              ...socialCreds,
                              youtube: { ...socialCreds.youtube, username: e.target.value }
                            })}
                            className="w-full px-2 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                            placeholder="youtube_channel_name"
                          />
                        </div>
                        <div className="space-y-1 relative">
                          <label className="text-slate-500 block uppercase tracking-wider text-[8px] font-black">Password</label>
                          <div className="relative">
                            <input
                              type={showYtPass ? "text" : "password"}
                              value={socialCreds.youtube.password}
                              onChange={(e) => setSocialCreds({
                                ...socialCreds,
                                youtube: { ...socialCreds.youtube, password: e.target.value }
                              })}
                              className="w-full pl-2 pr-8 py-1 rounded-md border border-slate-200 bg-white focus:border-[#2E9EDE] focus:ring-1 focus:ring-sky-100 transition-all font-medium text-slate-700 text-xs"
                              placeholder="••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowYtPass(!showYtPass)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            >
                              {showYtPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingSocialCreds}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#2E9EDE] hover:bg-[#1c85be] text-white font-bold text-xs rounded-lg shadow-md shadow-sky-100 transition-all disabled:opacity-70 active:scale-95 cursor-pointer"
                    >
                      {savingSocialCreds ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>Save Brand Credentials</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Employee Additional Details */}
        {isEmployee && (user as any)?.employee && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2E9EDE]" />
                Employment Records & Details
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                View your complete registered employment details, credentials, and verification values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1: Academic & Professional */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#2E9EDE]" />
                  Academic & Professional Details
                </h3>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 text-[10px] font-semibold text-slate-600">
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Qualification</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.qualification || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">College / University</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.college || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Year of Passing</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.yearOfPassing || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Previous Company</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.previousCompany || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Experience (Years)</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.experience || '0'} Years</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Previous Salary</span>
                    <span className="text-slate-800 text-xs font-bold">₹{(user as any).employee.metadata?.previousSalary || '0'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Expected Salary</span>
                    <span className="text-slate-800 text-xs font-bold">₹{(user as any).employee.metadata?.expectedSalary || (user as any).employee.salaryBasis || '0'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Notice Period</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.noticePeriod || '0'} Days</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Reason for Leaving</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.reasonForLeaving || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Documents, Verification & Bank Details */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Identity & Verification
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 text-[10px] font-semibold text-slate-600">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Aadhar Number</span>
                        <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.aadhar || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">PAN Card</span>
                        <span className="text-slate-800 text-xs font-bold uppercase">{(user as any).employee.metadata?.pan || 'Not Provided'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Emergency Contact</span>
                      <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.emergencyContact || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-[#2E9EDE]" />
                    Bank Account & Payments
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 text-[10px] font-semibold text-slate-600">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Bank Holder Name</span>
                      <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.bankHolder || 'Not Provided'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Account Number</span>
                        <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.bankAccount || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">IFSC Code</span>
                        <span className="text-slate-800 text-xs font-bold uppercase">{(user as any).employee.metadata?.ifsc || 'Not Provided'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Branch Name</span>
                        <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.branch || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">UPI ID</span>
                        <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.upi || 'Not Provided'}</span>
                      </div>
                    </div>
                    {((user as any).employee.metadata?.epfDetails || (user as any).employee.metadata?.epf) && (
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">EPF Details</span>
                        <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.epfDetails || (user as any).employee.metadata?.epf}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intern Additional Details */}
        {isIntern && (user as any)?.employee && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2E9EDE]" />
                Internship Records & Details
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                View your registered internship specs, institution credentials, and program timelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1: College & Timeline */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#2E9EDE]" />
                  Academic Institution Details
                </h3>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 text-[10px] font-semibold text-slate-600">
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">College / Institution</span>
                    <span className="text-slate-800 text-xs font-bold">{(user as any).employee.metadata?.college || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Register / Student ID Number</span>
                    <span className="text-slate-800 text-xs font-bold uppercase">{(user as any).employee.metadata?.registerNumber || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Internship Timeline</span>
                    <div className="text-slate-800 text-xs font-bold flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {(user as any).employee.metadata?.startDate ? new Date((user as any).employee.metadata.startDate).toLocaleDateString() : 'N/A'} – {(user as any).employee.metadata?.endDate ? new Date((user as any).employee.metadata.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Program Specifications */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#2E9EDE]" />
                  Program Specifications
                </h3>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 text-[10px] font-semibold text-slate-600">
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Internship Domain</span>
                    <span className="inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border bg-sky-50 text-[#2E9EDE] border-sky-100">
                      {(user as any).employee.metadata?.domain || 'Web/App Development'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase tracking-wider mb-0.5">Program Value / Fees</span>
                    <span className="text-[#2E9EDE] text-xs font-black flex items-center gap-0.5 mt-0.5">
                      ₹{(user as any).employee.metadata?.price ? Number((user as any).employee.metadata.price).toLocaleString('en-IN') : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secure Documents Section */}
        {projectDocs.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="h-16 w-16 text-[#2E9EDE]" />
            </div>
            <div className="relative z-10 mb-4">
              <h3 className="text-xs font-bold text-[#2E9EDE] tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure Onboarding & Project Documents
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Access, sign, and download your finalized agreements, offer letters, and corporate documents.
              </p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectDocs.map((doc) => (
                <div key={doc.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/80 hover:bg-white hover:border-sky-300 hover:shadow-sm transition-all duration-300 flex flex-col group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-1.5 bg-white border border-slate-200 text-[#2E9EDE] rounded-lg shadow-sm group-hover:scale-105 group-hover:text-[#1c85be] transition-transform flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-800 truncate" title={doc.template?.name || "Document"}>
                        {doc.template?.name || "Agreement Document"}
                      </h4>
                      <p className="text-[8px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Clock className="h-2 w-2 flex-shrink-0" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between">
                    {doc.status === 'signed' ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Signed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending
                      </span>
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      {doc.status !== 'signed' ? (
                        <button
                          type="button"
                          onClick={() => handlePreviewDoc(doc)}
                          className="p-1.5 rounded bg-sky-50 text-[#2E9EDE] hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-sky-100 flex items-center justify-center"
                          title="Sign Document"
                        >
                          <PenTool className="h-3.5 w-3.5 flex-shrink-0" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePreviewDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-[#2E9EDE] hover:bg-sky-50 rounded transition-colors cursor-pointer border border-transparent flex items-center justify-center"
                          title="Preview Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(doc.id, doc.template?.name || 'Document')}
                        disabled={downloadingDocId === doc.id}
                        className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-[#2E9EDE] text-slate-600 transition-all disabled:opacity-50 active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Download Document"
                      >
                        {downloadingDocId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2E9EDE] flex-shrink-0" />
                        ) : (
                          <Download className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
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
    </DashboardLayout>
  );
}
