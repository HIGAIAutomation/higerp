'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { fetchWithAuth } from '@/lib/api';
import { 
  Users, 
  Shield, 
  CheckSquare, 
  Square, 
  IndianRupee, 
  Briefcase, 
  Edit3, 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  Lock,
  UserCheck,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: string;
  dob: string | null;
  address: string | null;
  designation: string | null;
  salary: number | string | null;
  pageAccess: string[] | null;
  createdAt: string;
}

const AVAILABLE_MODULES = [
  { name: 'HRMS', path: '/dashboard/hrms' },
  { name: 'Projects', path: '/dashboard/projects' },
  { name: 'CRM', path: '/dashboard/crm' },
  { name: 'Finance', path: '/dashboard/finance' },
  { name: 'Assets', path: '/dashboard/assets' },
  { name: 'Knowledge', path: '/dashboard/knowledge' },
  { name: 'Support', path: '/dashboard/support' },
  { name: 'Clients', path: '/dashboard/clients' },
  { name: 'Attendance & Tasks', path: '/dashboard/attendance-tasks' },
];

export default function AccessControlPage() {
  const { user: currentUser, refreshProfile } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editDesignation, setEditDesignation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editPageAccess, setEditPageAccess] = useState<string[]>([]);
  const [editEmail, setEditEmail] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/auth/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'superadmin') {
      fetchUsers();
    }
  }, [currentUser]);

  if (currentUser?.role !== 'superadmin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Lock className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-primary">Unauthorized Access</h2>
          <p className="text-muted-foreground mt-2 font-inter">
            Only system super administrators can access user controls.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleEditClick = (user: UserItem) => {
    setEditingUser(user);
    setEditDesignation(user.designation || '');
    setEditSalary(user.salary ? String(user.salary) : '');
    setEditRole(user.role);
    setEditPageAccess(user.pageAccess || []);
    setEditEmail(user.email || '');
    setEditDob(user.dob || '');
    setEditAddress(user.address || '');
    setSaveSuccess(false);
  };

  const handleToggleModule = (path: string) => {
    if (editPageAccess.includes(path)) {
      setEditPageAccess(editPageAccess.filter(p => p !== path));
    } else {
      setEditPageAccess([...editPageAccess, path]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await fetchWithAuth(`/auth/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          designation: editDesignation || null,
          salary: editSalary === '' ? null : Number(editSalary),
          role: editRole,
          pageAccess: editRole === 'client' ? ['/dashboard/projects'] : editPageAccess,
          email: editEmail || null,
          dob: editDob || null,
          address: editAddress || null,
        }),
      });

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
      
      // If editing own record, refresh current profile
      if (editingUser.id === currentUser.id) {
        await refreshProfile();
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setEditingUser(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update user access');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* Header removed as requested */}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-inter">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-inter text-sm">Loading users list...</p>
          </div>
        ) : (
          <>
            {/* User List Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-secondary/30 flex items-center justify-between">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Registered Users ({users.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-inter text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase bg-secondary/20">
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Salary</th>
                      <th className="px-6 py-4">Page Access</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground/80">
                    {users.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      return (
                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-primary flex items-center gap-1.5">
                              {u.username}
                              {isSelf && (
                                <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-md font-normal">
                                  You
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              u.role === 'superadmin' 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                : u.role === 'client'
                                ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                : u.role === 'pending'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              {u.role === 'superadmin' && <Shield className="h-3 w-3" />}
                              {u.role === 'pending' && <AlertCircle className="h-3 w-3" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {u.designation || <span className="text-muted-foreground/40 italic text-xs">Not Set</span>}
                          </td>
                          <td className="px-6 py-4 font-semibold text-primary">
                            {u.salary 
                              ? `₹${Number(u.salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                              : <span className="text-muted-foreground/40 italic text-xs font-normal">Not Set</span>
                            }
                          </td>
                          <td className="px-6 py-4">
                            {u.role === 'superadmin' ? (
                              <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                All Pages (*)
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {(!u.pageAccess || u.pageAccess.length === 0) ? (
                                  <span className="text-muted-foreground/40 italic text-xs">No pages allowed</span>
                                ) : (
                                  u.pageAccess.map(p => {
                                    const modName = AVAILABLE_MODULES.find(m => m.path === p)?.name || p;
                                    return (
                                      <span key={p} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/5 font-semibold">
                                        {modName}
                                      </span>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEditClick(u)}
                              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-accent hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
                              title="Edit User Access"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="px-6 py-5 border-b border-border bg-secondary/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-muted-foreground" />
                      Configure: {editingUser.username}
                    </h3>
                    <button 
                      onClick={() => setEditingUser(null)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-6 font-inter text-sm overflow-y-auto">
                    {saveSuccess ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
                          <Check className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-primary text-base">Settings Saved!</h4>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                          User access details have been successfully updated.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Designation Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Job Designation
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                              <Briefcase className="h-4 w-4" />
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. Lead Developer, AI Specialist"
                              value={editDesignation}
                              onChange={(e) => setEditDesignation(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>

                        {/* Salary Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Salary (Monthly INR)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                              <IndianRupee className="h-4 w-4" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 5000"
                              value={editSalary}
                              onChange={(e) => setEditSalary(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                              <Mail className="h-4 w-4" />
                            </div>
                            <input
                              type="email"
                              placeholder="e.g. user@example.com"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>

                        {/* Date of Birth Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. YYYY-MM-DD"
                              value={editDob}
                              onChange={(e) => setEditDob(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>

                        {/* Address Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. City, Country"
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>

                        {/* System Role */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            System Role
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              setEditRole(newRole);
                              if (newRole === 'client') {
                                setEditPageAccess(['/dashboard/projects']);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                          >
                            <option value="pending">Pending (Awaiting Approval)</option>
                            <option value="user">User</option>
                            <option value="client">Client</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        </div>

                        {/* Module Access Checkboxes */}
                        {editRole !== 'superadmin' && (
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                              Allowed ERP Modules
                            </label>
                            <div className="space-y-2 bg-secondary/30 p-4 border border-border rounded-2xl max-h-[220px] overflow-y-auto">
                              {AVAILABLE_MODULES.map((m) => {
                                const isChecked = editPageAccess.includes(m.path);
                                const isDisabled = editRole === 'client' && m.path !== '/dashboard/projects';
                                return (
                                  <div 
                                    key={m.path}
                                    onClick={() => {
                                      if (!isDisabled) {
                                        handleToggleModule(m.path);
                                      }
                                    }}
                                    className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors select-none ${
                                      isDisabled 
                                        ? 'opacity-50 cursor-not-allowed bg-secondary/20' 
                                        : 'hover:bg-secondary/70 cursor-pointer'
                                    }`}
                                  >
                                    {isChecked ? (
                                      <CheckSquare className="h-5 w-5 text-accent flex-shrink-0" />
                                    ) : (
                                      <Square className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
                                    )}
                                    <span className="font-semibold text-primary text-xs">{m.name}</span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">{m.path}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-3.5 rounded-2xl bg-primary text-background font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
