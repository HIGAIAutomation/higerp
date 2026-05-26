"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  LifeBuoy, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Cpu,
  Bookmark,
  Sparkles,
  Inbox
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  aiSummary: string;
  createdAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/support/tickets');
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback
      setTickets([
        { id: '1', title: 'Database Out of memory exception during peak loads', description: 'At 15:30 we noticed a severe slowdown in query execution times on postgres local dev port. Looks like the connection limit was exceeded.', priority: 'critical', status: 'open', aiSummary: 'Postgres server slow down at 15:30 due to connection pool limit exhaustion.', createdAt: '2026-05-17T11:45:00Z' },
        { id: '2', title: 'Need to add email notifications for employee onboarding', description: 'Currently HRMS module creates agreements inside the DB but HR receives no automated email. Requesting SES template integration.', priority: 'medium', status: 'open', aiSummary: 'Feature Request: Email alerts via Amazon SES when onboarding suite generates.', createdAt: '2026-05-17T11:46:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await fetchWithAuth('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setForm({
        title: '',
        description: '',
        priority: 'medium',
      });

      await loadTickets();
      setSuccess('Support ticket logged. Backend AI agent compiling summary...');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to log ticket. Ensure NestJS support module is operational.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Support Helpdesk</h1>
          <p className="text-muted-foreground mt-1 font-inter">Log customer issues, assign severity levels, and utilize intelligent AI ticket summaries.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center border border-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* File Support Ticket Form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Plus className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">Raise Help Ticket</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Ticket Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., VPN connection timing out"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:bg-card text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Priority Severity</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:bg-card text-sm font-semibold cursor-pointer"
                >
                  <option value="low">Low (General Inquiry)</option>
                  <option value="medium">Medium (Standard Bug)</option>
                  <option value="high">High (Slight Operational Block)</option>
                  <option value="critical">Critical (System Downtime)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Full Description</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe what occurred, steps to reproduce, error codes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:bg-card text-sm font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-75 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : 'Submit Help Ticket'}
              </button>
            </form>
          </div>

          {/* Ticket Queue */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <LifeBuoy className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Intelligent Ticket Queue</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading helpdesk queue...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-sm text-muted-foreground">Inbox Zero! No outstanding customer issues.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-6 border border-border rounded-3xl bg-secondary/30 hover:bg-secondary/50 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.priority === 'critical' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : t.priority === 'high'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-secondary text-muted-foreground border border-border'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] bg-sky-500/10 text-sky-500 font-bold px-2 py-0.5 rounded-full uppercase border border-sky-500/20">
                            {t.status}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.createdAt ? t.createdAt.split('T')[0] : 'Just now'}</span>
                      </div>

                      <h4 className="font-bold text-primary text-base mb-2">{t.title}</h4>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-inter">{t.description}</p>

                      {/* Dynamic AI Summary section */}
                      {t.aiSummary && (
                        <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-start space-x-3 mt-4">
                          <div className="p-1 bg-accent/10 text-accent rounded-lg flex-shrink-0 mt-0.5">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-accent tracking-wider uppercase mb-0.5">AI Ticket Digest</p>
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium font-inter">{t.aiSummary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
