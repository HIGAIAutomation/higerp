"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Mail, 
  DollarSign, 
  Search, 
  FileText,
  MessageSquare,
  Shield,
  Activity,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ClientLog {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  content: string;
  rating?: number; // For daily satisfaction (1-5)
  milestone?: string; // For weekly achievements
  budgetStatus?: 'under' | 'on-track' | 'over'; // For weekly budget check
}

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  valEstimate: number;
  status: 'active' | 'onboarding' | 'paused' | 'lead';
  health: 'excellent' | 'good' | 'at-risk';
  assignedManager: string;
  logs: ClientLog[];
}

const SEED_CLIENTS: Client[] = [
  {
    id: 'c1',
    companyName: 'Starlight Industries',
    contactName: 'Elena Rostova',
    contactEmail: 'elena@starlight.io',
    valEstimate: 85000,
    status: 'active',
    health: 'excellent',
    assignedManager: 'Sarah Connor',
    logs: [
      {
        id: 'l1',
        type: 'daily',
        date: '2026-05-21',
        content: 'Completed frontend design review. Client is highly satisfied with the glassmorphism aesthetic.',
        rating: 5
      },
      {
        id: 'l2',
        type: 'daily',
        date: '2026-05-20',
        content: 'Integrated Auth API endpoints. Minor latency on login requests, optimization ongoing.',
        rating: 4
      },
      {
        id: 'l3',
        type: 'weekly',
        date: '2026-05-18',
        content: 'Completed Milestone 2 (User Authentication & Access Dashboard). Ready for deployment to staging.',
        milestone: 'Milestone 2 Sign-off',
        budgetStatus: 'on-track'
      }
    ]
  },
  {
    id: 'c2',
    companyName: 'Vortex Global',
    contactName: 'Marcus Vance',
    contactEmail: 'marcus.v@vortex.com',
    valEstimate: 142000,
    status: 'active',
    health: 'good',
    assignedManager: 'John Doe',
    logs: [
      {
        id: 'l4',
        type: 'daily',
        date: '2026-05-21',
        content: 'Database migration completed. Run checks on backup scripts today.',
        rating: 4
      },
      {
        id: 'l5',
        type: 'weekly',
        date: '2026-05-15',
        content: 'Data pipeline architecture draft finalized. Budget slightly impacted by extra RDS compute capacity needed.',
        milestone: 'Data Pipeline Design',
        budgetStatus: 'under'
      }
    ]
  },
  {
    id: 'c3',
    companyName: 'Apex Healthcare',
    contactName: 'Dr. Sarah Lin',
    contactEmail: 's.lin@apexhealth.org',
    valEstimate: 60000,
    status: 'onboarding',
    health: 'at-risk',
    assignedManager: 'Sarah Connor',
    logs: [
      {
        id: 'l6',
        type: 'daily',
        date: '2026-05-20',
        content: 'Client requested major changes to HIPAA compliance logging workflow. Delays expected.',
        rating: 2
      },
      {
        id: 'l7',
        type: 'weekly',
        date: '2026-05-15',
        content: 'Struggling with slow feedback loops from the client legal team. Blockers flagged.',
        milestone: 'Compliance Audit Init',
        budgetStatus: 'over'
      }
    ]
  }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [logTypeTab, setLogTypeTab] = useState<'daily' | 'weekly'>('daily');
  
  // Modals / Forms
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    valEstimate: '',
    status: 'onboarding' as Client['status'],
    health: 'good' as Client['health'],
    assignedManager: '',
  });

  const [newLog, setNewLog] = useState({
    content: '',
    rating: '5',
    milestone: '',
    budgetStatus: 'on-track' as ClientLog['budgetStatus'],
  });

  // Load clients from localStorage or seed
  useEffect(() => {
    const stored = localStorage.getItem('hig_clients_data');
    if (stored) {
      try {
        setClients(JSON.parse(stored));
      } catch (_) {
        setClients(SEED_CLIENTS);
      }
    } else {
      setClients(SEED_CLIENTS);
      localStorage.setItem('hig_clients_data', JSON.stringify(SEED_CLIENTS));
    }
  }, []);

  const saveToStorage = (updated: Client[]) => {
    setClients(updated);
    localStorage.setItem('hig_clients_data', JSON.stringify(updated));
    if (selectedClient) {
      const reselected = updated.find(c => c.id === selectedClient.id);
      if (reselected) setSelectedClient(reselected);
    }
  };

  // Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.companyName || !newClient.contactName) return;

    const created: Client = {
      id: 'c_' + Date.now(),
      companyName: newClient.companyName,
      contactName: newClient.contactName,
      contactEmail: newClient.contactEmail,
      valEstimate: Number(newClient.valEstimate) || 0,
      status: newClient.status,
      health: newClient.health,
      assignedManager: newClient.assignedManager || 'Unassigned',
      logs: [],
    };

    const updated = [created, ...clients];
    saveToStorage(updated);
    
    // Reset Form
    setNewClient({
      companyName: '',
      contactName: '',
      contactEmail: '',
      valEstimate: '',
      status: 'onboarding',
      health: 'good',
      assignedManager: '',
    });
    setShowAddClientForm(false);
  };

  // Add Log Entry
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newLog.content) return;

    const createdLog: ClientLog = {
      id: 'l_' + Date.now(),
      type: logTypeTab,
      date: new Date().toISOString().split('T')[0],
      content: newLog.content,
      rating: logTypeTab === 'daily' ? Number(newLog.rating) : undefined,
      milestone: logTypeTab === 'weekly' ? newLog.milestone || undefined : undefined,
      budgetStatus: logTypeTab === 'weekly' ? newLog.budgetStatus : undefined,
    };

    const updated = clients.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          logs: [createdLog, ...c.logs]
        };
      }
      return c;
    });

    saveToStorage(updated);
    
    // Reset Form
    setNewLog({
      content: '',
      rating: '5',
      milestone: '',
      budgetStatus: 'on-track',
    });
    setShowAddLogForm(false);
  };

  // Filtered clients list
  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.assignedManager.toLowerCase().includes(search.toLowerCase())
  );

  // Stats calculation
  const totalValue = clients.reduce((acc, c) => acc + c.valEstimate, 0);
  const activeCount = clients.filter(c => c.status === 'active').length;
  const atRiskCount = clients.filter(c => c.health === 'at-risk').length;
  const logsCount = clients.reduce((acc, c) => acc + c.logs.filter(l => l.date === new Date().toISOString().split('T')[0]).length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Client Portfolio</h1>
            <p className="text-muted-foreground mt-1 font-inter">
              Track contract values, manage account health, and post daily operational logs or weekly reports.
            </p>
          </div>
          <button
            onClick={() => setShowAddClientForm(true)}
            className="px-5 py-3 bg-primary text-background font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/10 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add New Client
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Accounts</p>
              <h3 className="text-2xl font-extrabold text-primary">{clients.length}</h3>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Contract Value</p>
              <h3 className="text-2xl font-extrabold text-primary">${totalValue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Contracts</p>
              <h3 className="text-2xl font-extrabold text-primary">{activeCount} / {clients.length}</h3>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${atRiskCount > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-teal-500/10 text-teal-500'}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accounts At Risk</p>
              <h3 className="text-2xl font-extrabold text-primary">{atRiskCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Client Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients by name, representative, or manager..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-accent text-sm shadow-sm font-inter"
              />
            </div>

            {/* Clients Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                    }}
                    className={`p-6 bg-card rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      isSelected 
                        ? 'border-accent shadow-md bg-secondary/30' 
                        : 'border-border'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          client.status === 'onboarding' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          client.status === 'paused' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-secondary text-muted-foreground border border-border'
                        }`}>
                          {client.status}
                        </span>

                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          client.health === 'excellent' ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' :
                          client.health === 'good' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          Health: {client.health}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-primary mb-1">{client.companyName}</h3>
                      <div className="space-y-1 text-xs text-muted-foreground font-inter mb-4">
                        <p className="flex items-center"><User className="h-3 w-3 mr-1.5" /> {client.contactName}</p>
                        <p className="flex items-center"><Mail className="h-3 w-3 mr-1.5" /> {client.contactEmail}</p>
                        <p className="flex items-center"><Shield className="h-3 w-3 mr-1.5" /> Account Owner: {client.assignedManager}</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 flex items-center justify-between mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contract Size</p>
                        <p className="text-base font-extrabold text-primary">${client.valEstimate.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center text-xs font-bold text-accent">
                        View Logs
                        <ChevronRight className="h-4 w-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="col-span-full bg-card rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-sm">No clients found</p>
                  <p className="text-xs mt-1">Try refining your search keyword or create a new client profile.</p>
                </div>
              )}
            </div>
          </div>

          {/* Logs & Actions Detail Panel */}
          <div className="lg:col-span-1">
            {selectedClient ? (
              <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                {/* Header */}
                <div className="p-6 border-b border-border bg-secondary/30">
                  <h3 className="text-lg font-bold text-primary truncate">{selectedClient.companyName}</h3>
                  <p className="text-xs text-muted-foreground font-inter mt-1 truncate">Logs & Reporting Pipeline</p>

                  {/* Tabs: Daily vs Weekly */}
                  <div className="flex mt-4 bg-secondary p-1 rounded-xl">
                    <button
                      onClick={() => setLogTypeTab('daily')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        logTypeTab === 'daily' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Daily Logs
                    </button>
                    <button
                      onClick={() => setLogTypeTab('weekly')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        logTypeTab === 'weekly' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Weekly Reports
                    </button>
                  </div>
                </div>

                {/* Log Feed */}
                <div className="p-6 flex-1 overflow-y-auto max-h-[350px] space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                      {logTypeTab === 'daily' ? 'Daily Check-Ins' : 'Weekly Milestones'}
                    </h4>
                    <button
                      onClick={() => setShowAddLogForm(true)}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Write Entry
                    </button>
                  </div>

                  {selectedClient.logs.filter(l => l.type === logTypeTab).length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs italic font-inter">No {logTypeTab} entries recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 relative pl-3 border-l border-border ml-1">
                      {selectedClient.logs
                        .filter(l => l.type === logTypeTab)
                        .map((log) => (
                          <div key={log.id} className="relative space-y-1">
                            <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-accent border-2 border-card ring-4 ring-accent/10"></span>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center font-inter">
                                <Clock className="h-3 w-3 mr-1" /> {log.date}
                              </span>

                              {log.type === 'daily' && log.rating && (
                                <span className="text-[10px] bg-secondary text-muted-foreground border border-border px-1.5 py-0.5 rounded font-bold">
                                  Rating: {log.rating}/5
                                </span>
                              )}

                              {log.type === 'weekly' && log.budgetStatus && (
                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                  log.budgetStatus === 'on-track' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  log.budgetStatus === 'under' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                  Budget: {log.budgetStatus}
                                </span>
                              )}
                            </div>

                            {log.milestone && (
                              <p className="text-xs font-bold text-primary flex items-center">
                                <MessageSquare className="h-3.5 w-3.5 mr-1 text-accent" />
                                {log.milestone}
                              </p>
                            )}
                            <p className="text-xs text-foreground/80 leading-relaxed font-inter">{log.content}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-secondary/20 rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[500px]">
                <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="font-semibold text-sm">No Client Selected</p>
                <p className="text-xs mt-1 max-w-[200px] mx-auto">
                  Click on any client card to inspect their satisfaction ratings, milestone history, and add progress logs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add Client */}
        {showAddClientForm && (
          <div className="fixed inset-0 bg-[#09090B]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Building2 className="text-accent h-6 w-6" /> Create Client Profile
                </h3>
                <button 
                  onClick={() => setShowAddClientForm(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">COMPANY NAME *</label>
                  <input
                    required
                    type="text"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">REP NAME *</label>
                    <input
                      required
                      type="text"
                      value={newClient.contactName}
                      onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">REP EMAIL</label>
                    <input
                      type="email"
                      value={newClient.contactEmail}
                      onChange={(e) => setNewClient({ ...newClient, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">CONTRACT VALUE (USD)</label>
                    <input
                      type="number"
                      value={newClient.valEstimate}
                      onChange={(e) => setNewClient({ ...newClient, valEstimate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">ASSIGNED MANAGER</label>
                    <input
                      type="text"
                      value={newClient.assignedManager}
                      onChange={(e) => setNewClient({ ...newClient, assignedManager: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                      placeholder="e.g. Sarah Connor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">STATUS</label>
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient({ ...newClient, status: e.target.value as Client['status'] })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground"
                    >
                      <option value="active" className="bg-card text-foreground">Active</option>
                      <option value="onboarding" className="bg-card text-foreground">Onboarding</option>
                      <option value="paused" className="bg-card text-foreground">Paused</option>
                      <option value="lead" className="bg-card text-foreground">Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">HEALTH STATUS</label>
                    <select
                      value={newClient.health}
                      onChange={(e) => setNewClient({ ...newClient, health: e.target.value as Client['health'] })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground"
                    >
                      <option value="excellent" className="bg-card text-foreground">Excellent</option>
                      <option value="good" className="bg-card text-foreground">Good</option>
                      <option value="at-risk" className="bg-card text-foreground">At Risk</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/10 cursor-pointer"
                >
                  Create Client
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Log Entry */}
        {showAddLogForm && selectedClient && (
          <div className="fixed inset-0 bg-[#09090B]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <FileText className="text-accent h-6 w-6" /> Write {logTypeTab === 'daily' ? 'Daily Log' : 'Weekly Report'}
                </h3>
                <button 
                  onClick={() => setShowAddLogForm(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-4">
                <p className="text-xs text-muted-foreground font-inter">
                  Filing entry for account: <strong className="text-primary">{selectedClient.companyName}</strong>
                </p>

                {logTypeTab === 'daily' ? (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">CLIENT SATISFACTION RATING (1-5)</label>
                    <select
                      value={newLog.rating}
                      onChange={(e) => setNewLog({ ...newLog, rating: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground"
                    >
                      <option value="5" className="bg-card text-foreground">5 - Excellent (Highly Satisfied)</option>
                      <option value="4" className="bg-card text-foreground">4 - Good</option>
                      <option value="3" className="bg-card text-foreground">3 - Neutral / Average</option>
                      <option value="2" className="bg-card text-foreground">2 - Poor</option>
                      <option value="1" className="bg-card text-foreground">1 - Critical (High Risk)</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">MILESTONE ACHIEVED</label>
                      <input
                        type="text"
                        value={newLog.milestone}
                        onChange={(e) => setNewLog({ ...newLog, milestone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
                        placeholder="e.g. Completed Sprint 3 demo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">BUDGET STATUS</label>
                      <select
                        value={newLog.budgetStatus}
                        onChange={(e) => setNewLog({ ...newLog, budgetStatus: e.target.value as ClientLog['budgetStatus'] })}
                        className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground"
                      >
                        <option value="on-track" className="bg-card text-foreground">On Track</option>
                        <option value="under" className="bg-card text-foreground">Under Budget</option>
                        <option value="over" className="bg-card text-foreground">Over Budget</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">LOG ENTRY / DETAILS *</label>
                  <textarea
                    required
                    rows={4}
                    value={newLog.content}
                    onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm resize-none text-foreground focus:outline-none focus:border-accent"
                    placeholder="Write detailed progress notes, action items, or blockers..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/10 cursor-pointer"
                >
                  Post Log Entry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
