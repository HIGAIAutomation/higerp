"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';

interface Lead {
  id: string;
  uniqueId?: string;
  companyName: string;
  contact: string;
}

interface FollowUp {
  id: string;
  leadId: string;
  dateTime: string;
  endDateTime?: string;
  notes: string;
  synced: boolean;
  lead?: Lead;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [notes, setNotes] = useState('');

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, followUpsData] = await Promise.all([
        fetchWithAuth('/crm/leads'),
        fetchWithAuth('/crm/followups')
      ]);
      setLeads(leadsData.filter((l: any) => l.status !== 'won' && l.status !== 'lost'));
      setFollowUps(followUpsData);
      if (leadsData.length > 0) {
        setSelectedLeadId(leadsData[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch scheduled follow-up records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !dateTime) {
      setError('Please select a client and target start date/time.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await fetchWithAuth('/crm/followups', {
        method: 'POST',
        body: JSON.stringify({
          leadId: selectedLeadId,
          dateTime: new Date(dateTime).toISOString(),
          endDateTime: endDateTime ? new Date(endDateTime).toISOString() : undefined,
          notes
        })
      });

      setSuccessMsg('Follow-up scheduled and sync request dispatched to Google Calendar!');
      setNotes('');
      setDateTime('');
      setEndDateTime('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to schedule follow-up callback invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFollowUp = async (id: string) => {
    try {
      setError(null);
      await fetchWithAuth(`/crm/followups/${id}`, {
        method: 'DELETE'
      });
      setSuccessMsg('Scheduled follow-up cancelled successfully.');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to cancel the callback reminder.');
    }
  };

  // Calendar Helper functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compile calendar cells
  const calendarCells = [];
  
  // Padding from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Padding for next month to complete the row of 7 days
  const totalSlotsNeeded = Math.ceil(calendarCells.length / 7) * 7;
  const nextMonthDaysCount = totalSlotsNeeded - calendarCells.length;
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const getFollowUpsForDate = (date: Date) => {
    return followUps.filter(f => {
      const fDate = new Date(f.dateTime);
      return fDate.getDate() === date.getDate() &&
             fDate.getMonth() === date.getMonth() &&
             fDate.getFullYear() === date.getFullYear();
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">CRM Scheduler & Calendar</h1>
          <p className="text-muted-foreground mt-1 font-inter">Schedule follow-up activities, track reminders on a Teams-style interface, and sync automatically with your Google Calendar.</p>
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
          {/* Follow-up Scheduler Form */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <CalendarCheck className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-bold text-primary">Schedule callback</h2>
              </div>

              <form onSubmit={handleScheduleFollowUp} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">SELECT CLIENT LEAD</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground cursor-pointer"
                  >
                    {leads.length === 0 ? (
                      <option value="">No Active Leads Available</option>
                    ) : (
                      leads.map((l) => (
                        <option key={l.id} value={l.id} className="bg-card text-foreground">
                          {l.companyName} ({l.uniqueId || 'N/A'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">FROM (START TIME)</label>
                    <input
                      required
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">TO (END TIME)</label>
                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">FOLLOW UP PURPOSE & AGENDA</label>
                  <textarea
                    rows={4}
                    placeholder="Enter discussion topics, phone number context, callback reasons..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60 resize-none"
                  />
                </div>

                <div className="p-3 bg-secondary/50 rounded-xl border border-border text-[10px] text-muted-foreground flex items-start space-x-2">
                  <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    This callback reminder will be synced directly with your Google Calendar (<strong>aiautomationhig@gmail.com</strong>) through automated invitation feeds.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || leads.length === 0}
                  className="w-full py-3 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg disabled:opacity-50 text-xs cursor-pointer bg-primary text-background shadow-primary/10"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add to Calendar
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Teams Style Monthly Calendar View */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">
                    {monthNames[month]} {year}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Monthly calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => {
                  const dayFollowUps = getFollowUpsForDate(cell.date);
                  const isToday = new Date().toDateString() === cell.date.toDateString();

                  return (
                    <div 
                      key={idx} 
                      className={`min-h-[90px] p-2 bg-secondary/20 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        cell.isCurrentMonth 
                          ? 'border-border/60 text-foreground' 
                          : 'border-border/10 text-muted-foreground/30 bg-transparent'
                      } ${isToday ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold font-mono ${
                          isToday ? 'bg-accent text-background rounded-full w-5 h-5 flex items-center justify-center' : ''
                        }`}>
                          {cell.day}
                        </span>
                        {dayFollowUps.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        )}
                      </div>
                      
                      <div className="space-y-1 overflow-y-auto max-h-[60px] pr-0.5">
                        {dayFollowUps.map((f) => (
                          <div 
                            key={f.id}
                            title={`${f.lead?.companyName || 'Callback'}: ${f.notes}`}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 truncate font-semibold cursor-default"
                          >
                            {new Date(f.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {f.endDateTime ? `-${new Date(f.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} - {f.lead?.companyName || 'Callback'}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List / Timeline View of upcoming events */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center">
                <Clock className="h-5 w-5 text-accent mr-2" />
                Upcoming Callback Agenda
              </h3>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : followUps.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No upcoming follow-ups scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {followUps.map((f) => {
                    const isPassed = new Date(f.dateTime).getTime() < Date.now();
                    return (
                      <div 
                        key={f.id} 
                        className={`p-4 bg-secondary/30 rounded-2xl border border-border/80 flex items-start justify-between gap-4 transition-all hover:bg-secondary/40 ${
                          isPassed ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
                              {f.lead?.uniqueId || 'N/A'}
                            </span>
                            <span className="font-bold text-primary">{f.lead?.companyName || 'Lead Callback'}</span>
                          </div>
                          <div className="text-xs font-semibold text-foreground/80 flex items-center space-x-1.5">
                            <span>
                              {new Date(f.dateTime).toLocaleDateString()} from {new Date(f.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {f.endDateTime ? ` to ${new Date(f.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ` to ${new Date(new Date(f.dateTime).getTime() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                          {f.notes && (
                            <p className="text-xs text-muted-foreground whitespace-pre-line bg-secondary/10 p-2 rounded-xl mt-2 border border-border/40 font-inter">
                              {f.notes}
                            </p>
                          )}
                          <div className="pt-1.5 flex items-center space-x-2">
                            {f.synced ? (
                              <span className="inline-flex items-center text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                Synced with Google Calendar
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[9px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 animate-pulse" title="Google blocks basic passwords. Please set a valid GMAIL_APP_PASSWORD in backend/.env to sync.">
                                Sync Failed (Verify App Password)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFollowUp(f.id)}
                          title="Cancel scheduled follow up"
                          className="p-2 rounded bg-secondary hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border hover:border-rose-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
