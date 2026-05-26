"use client";

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { fetchWithAuth } from '@/lib/api';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Play, 
  Square, 
  CheckSquare, 
  UserPlus, 
  ListTodo, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Trash2
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  username: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  location: 'Office' | 'WFH' | 'Client Site';
  status: 'Present' | 'Late' | 'WFH' | 'Left Early';
}

interface AssignedTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Username
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  createdAt: string;
}

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', username: 'Sarah Connor', date: '2026-05-21', checkIn: '09:00 AM', checkOut: '06:00 PM', location: 'Office', status: 'Present' },
  { id: 'att2', username: 'John Doe', date: '2026-05-21', checkIn: '08:45 AM', checkOut: '05:30 PM', location: 'WFH', status: 'WFH' },
  { id: 'att3', username: 'Elena Rostova', date: '2026-05-21', checkIn: '09:45 AM', checkOut: '06:15 PM', location: 'Client Site', status: 'Late' },
];

const SEED_TASKS: AssignedTask[] = [
  { id: 't1', title: 'Verify User Control Gateways', description: 'Run validation scripts on the newly deployed Next.js/Tailwind layout guards.', assignedTo: 'Sarah Connor', priority: 'high', deadline: '2026-05-24', status: 'in-progress', createdAt: '2026-05-21' },
  { id: 't2', title: 'Generate PDF Quotation Templates', description: 'Hook up the template generation engine to compile CRM sales quotes automatically.', assignedTo: 'John Doe', priority: 'medium', deadline: '2026-05-27', status: 'pending', createdAt: '2026-05-21' },
  { id: 't3', title: 'Complete Client Onboarding HIPAA audit', description: 'Review security check logs filed by Elena for Apex Healthcare.', assignedTo: 'Sarah Connor', priority: 'high', deadline: '2026-05-23', status: 'review', createdAt: '2026-05-20' },
];

export default function AttendanceTasksPage() {
  const { user } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'attendance' | 'tasks'>('attendance');
  
  // State lists
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [usersList, setUsersList] = useState<{ id: string; username: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Clock state
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Active shift state (Clock-In)
  const [activeShift, setActiveShift] = useState<{ checkInTime: string; location: AttendanceRecord['location'] } | null>(null);
  const [shiftDuration, setShiftDuration] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [clockLocation, setClockLocation] = useState<AttendanceRecord['location']>('Office');
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as AssignedTask['priority'],
    deadline: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Clock updating
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch users & data load
  useEffect(() => {
    // 1. Fetch Users (for task assignee dropdown)
    const loadAssignees = async () => {
      setLoadingUsers(true);
      try {
        const users = await fetchWithAuth('/auth/users');
        if (users && Array.isArray(users)) {
          setUsersList(users.map((u: any) => ({ id: u.id, username: u.username })));
        } else {
          setUsersList([{ id: '1', username: 'Sarah Connor' }, { id: '2', username: 'John Doe' }]);
        }
      } catch (_) {
        // Fallback
        setUsersList([
          { id: '1', username: 'Sarah Connor' },
          { id: '2', username: 'John Doe' },
          { id: '3', username: 'Elena Rostova' }
        ]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadAssignees();

    // 2. Load Attendance Logs
    const storedAttendance = localStorage.getItem('hig_attendance_data');
    if (storedAttendance) {
      try { setAttendance(JSON.parse(storedAttendance)); } catch (_) { setAttendance(SEED_ATTENDANCE); }
    } else {
      setAttendance(SEED_ATTENDANCE);
      localStorage.setItem('hig_attendance_data', JSON.stringify(SEED_ATTENDANCE));
    }

    // 3. Load Tasks
    const storedTasks = localStorage.getItem('hig_tasks_data');
    if (storedTasks) {
      try { setTasks(JSON.parse(storedTasks)); } catch (_) { setTasks(SEED_TASKS); }
    } else {
      setTasks(SEED_TASKS);
      localStorage.setItem('hig_tasks_data', JSON.stringify(SEED_TASKS));
    }

    // 4. Load Active Shift (for logged-in user)
    const storedShift = localStorage.getItem(`hig_active_shift_${user?.username || 'guest'}`);
    if (storedShift) {
      try {
        const parsed = JSON.parse(storedShift);
        setActiveShift(parsed);
      } catch (_) {}
    }
  }, [user]);

  // Live Shift Timer Effect
  useEffect(() => {
    if (activeShift) {
      const checkInDate = new Date(activeShift.checkInTime);
      
      const updateTimer = () => {
        const diffMs = Date.now() - checkInDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        const pad = (num: number) => String(num).padStart(2, '0');
        setShiftDuration(`${pad(diffHrs)}:${pad(diffMins)}:${pad(diffSecs)}`);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setShiftDuration('00:00:00');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeShift]);

  // Trigger Notification
  const triggerNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, message: msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // Clock In Action
  const handleClockIn = () => {
    if (activeShift) return;
    const now = new Date();
    const newShift = {
      checkInTime: now.toISOString(),
      location: clockLocation
    };
    
    setActiveShift(newShift);
    localStorage.setItem(`hig_active_shift_${user?.username || 'guest'}`, JSON.stringify(newShift));

    // Save check-in entry to logs
    const checkInString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
    
    const newRecord: AttendanceRecord = {
      id: 'att_' + Date.now(),
      username: user?.username || 'Guest',
      date: now.toISOString().split('T')[0],
      checkIn: checkInString,
      location: clockLocation,
      status: clockLocation === 'WFH' ? 'WFH' : (isLate ? 'Late' : 'Present')
    };

    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    localStorage.setItem('hig_attendance_data', JSON.stringify(updated));

    triggerNotification('success', `Clocked in successfully at ${checkInString}!`);
  };

  // Clock Out Action
  const handleClockOut = () => {
    if (!activeShift) return;
    const now = new Date();
    const checkOutString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Find today's checkin log and attach checkout time
    const todayStr = now.toISOString().split('T')[0];
    const updated = attendance.map(rec => {
      if (rec.username === (user?.username || 'Guest') && rec.date === todayStr && !rec.checkOut) {
        return {
          ...rec,
          checkOut: checkOutString,
          status: rec.status === 'Present' && now.getHours() < 17 ? 'Left Early' : rec.status
        } as AttendanceRecord;
      }
      return rec;
    });

    setAttendance(updated);
    localStorage.setItem('hig_attendance_data', JSON.stringify(updated));

    // Purge shift session
    setActiveShift(null);
    localStorage.removeItem(`hig_active_shift_${user?.username || 'guest'}`);

    triggerNotification('success', `Clocked out successfully at ${checkOutString}! Shift ended.`);
  };

  // Create Task Action
  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.assignedTo) {
      triggerNotification('error', 'Please fill in the task title and assignee.');
      return;
    }

    const created: AssignedTask = {
      id: 't_' + Date.now(),
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      priority: taskForm.priority,
      deadline: taskForm.deadline || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [created, ...tasks];
    setTasks(updated);
    localStorage.setItem('hig_tasks_data', JSON.stringify(updated));

    // Reset Form
    setTaskForm({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      deadline: '',
    });

    triggerNotification('success', `Task assigned to ${created.assignedTo}!`);
  };

  // Advance Task Status
  const handleMoveTask = (taskId: string, direction: 'forward' | 'backward') => {
    const statusOrder: AssignedTask['status'][] = ['pending', 'in-progress', 'review', 'completed'];
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const index = statusOrder.indexOf(t.status);
        let newIndex = direction === 'forward' ? index + 1 : index - 1;
        if (newIndex >= 0 && newIndex < statusOrder.length) {
          return { ...t, status: statusOrder[newIndex] };
        }
      }
      return t;
    });

    setTasks(updated);
    localStorage.setItem('hig_tasks_data', JSON.stringify(updated));
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem('hig_tasks_data', JSON.stringify(updated));
    triggerNotification('success', 'Task removed.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Operations Hub</h1>
            <p className="text-muted-foreground mt-1 font-inter">
              Log daily shifts, track corporate attendance records, and assign execution tasks to colleagues.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-secondary p-1 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'attendance'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              Attendance Logs
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'tasks'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Task Assignments
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {notification && (
          <div className={`p-4 rounded-2xl border flex items-center animate-in fade-in ${
            notification.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-rose-600" />
            )}
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
        )}

        {/* TAB 1: Attendance Section */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            {/* Clock Controller */}
            <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm text-center relative overflow-hidden">
              <h2 className="text-lg font-bold text-primary mb-1">Shift Controller</h2>
              <p className="text-xs text-muted-foreground mb-6 font-inter">{currentDate}</p>

              {/* Time display */}
              <div className="py-6 px-4 bg-secondary/30 border border-border rounded-3xl mb-6">
                <span className="text-4xl font-extrabold text-primary tracking-tight font-mono">{currentTime}</span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Checked Location
                </p>
                
                {/* Location select dropdown */}
                {!activeShift ? (
                  <select
                    value={clockLocation}
                    onChange={(e) => setClockLocation(e.target.value as AttendanceRecord['location'])}
                    className="mt-2 text-xs font-bold text-primary bg-secondary border border-border rounded-lg px-3 py-1 outline-none text-foreground"
                  >
                    <option value="Office" className="bg-card text-foreground">Office HQ</option>
                    <option value="WFH" className="bg-card text-foreground">Work From Home (WFH)</option>
                    <option value="Client Site" className="bg-card text-foreground">Client Site</option>
                  </select>
                ) : (
                  <span className="inline-block mt-2 text-xs font-extrabold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase">
                    {activeShift.location}
                  </span>
                )}
              </div>

              {/* Shift counter if on duty */}
              {activeShift && (
                <div className="mb-6 p-4 bg-accent/5 border border-accent/10 rounded-2xl animate-pulse">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider">ACTIVE SHIFT DURATION</p>
                  <p className="text-2xl font-extrabold text-primary font-mono mt-1">{shiftDuration}</p>
                </div>
              )}

              {/* Action buttons */}
              {!activeShift ? (
                <button
                  onClick={handleClockIn}
                  className="w-full py-4 bg-primary text-background font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Clock In
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-rose-600/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-white text-white" />
                  Clock Out
                </button>
              )}
            </div>

            {/* Attendance list table */}
            <div className="xl:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Attendance Ledger
                </h3>
                <span className="text-xs bg-secondary text-primary font-bold px-3 py-1 rounded-full border border-border">
                  Total logs: {attendance.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-inter text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="pb-4">Employee</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Check-In</th>
                      <th className="pb-4">Check-Out</th>
                      <th className="pb-4">Location</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-4 font-bold text-primary">{rec.username}</td>
                        <td className="py-4 text-muted-foreground">{rec.date}</td>
                        <td className="py-4 font-semibold text-foreground/80">{rec.checkIn}</td>
                        <td className="py-4 text-muted-foreground">{rec.checkOut || <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded border border-accent/20">Active Shift</span>}</td>
                        <td className="py-4 font-medium text-foreground/80">{rec.location}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            rec.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            rec.status === 'WFH' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            rec.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs italic">No shift logs found in the database.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Task Assignment Section */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
            
            {/* Create Task Form */}
            <div className="xl:col-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-accent" />
                Delegate Task
              </h3>

              <form onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">TASK TITLE *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter short task name"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">ASSIGNEE *</label>
                  {loadingUsers ? (
                    <div className="flex items-center py-2.5 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading users...
                    </div>
                  ) : (
                    <select
                      required
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground font-medium"
                    >
                      <option value="" className="bg-card text-foreground">Select Assignee</option>
                      {usersList.map((usr) => (
                        <option key={usr.id} value={usr.username} className="bg-card text-foreground">{usr.username}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">PRIORITY</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as AssignedTask['priority'] })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none text-foreground"
                    >
                      <option value="low" className="bg-card text-foreground">Low</option>
                      <option value="medium" className="bg-card text-foreground">Medium</option>
                      <option value="high" className="bg-card text-foreground">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">DEADLINE</label>
                    <input
                      type="date"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-xs focus:outline-none text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">SCOPE DETAILS</label>
                  <textarea
                    rows={3}
                    placeholder="Scope, files, context..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none resize-none text-foreground placeholder-muted-foreground/60"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Assign Task
                </button>
              </form>
            </div>

            {/* Kanban columns board */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Column rendering list helper */}
              {(['pending', 'in-progress', 'review', 'completed'] as AssignedTask['status'][]).map((status) => {
                const columnTasks = tasks.filter(t => t.status === status);
                const colTitleMap = {
                  'pending': 'Pending',
                  'in-progress': 'In Progress',
                  'review': 'QA / Review',
                  'completed': 'Completed'
                };
                
                return (
                  <div key={status} className="bg-secondary/30 border border-border rounded-3xl p-4 space-y-4 min-h-[500px]">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-border">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{colTitleMap[status]}</span>
                      <span className="text-[10px] bg-secondary text-muted-foreground font-bold px-2 py-0.5 rounded-full border border-border">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {columnTasks.map((t) => (
                        <div 
                          key={t.id} 
                          className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-between hover:shadow transition-shadow group"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                t.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                t.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-secondary text-muted-foreground border border-border'
                              }`}>
                                {t.priority}
                              </span>

                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-rose-500 transition-opacity p-0.5 rounded cursor-pointer"
                                title="Remove task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <h4 className="text-xs font-bold text-primary leading-snug mb-1">{t.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-inter line-clamp-3 mb-4">{t.description}</p>
                          </div>

                          <div className="border-t border-border pt-3 flex items-center justify-between mt-2">
                            <div>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">Assignee</p>
                              <p className="text-[10px] font-bold text-primary truncate max-w-[90px]">{t.assignedTo}</p>
                            </div>

                            {/* Move controls */}
                            <div className="flex items-center gap-1.5">
                              {status !== 'pending' && (
                                <button
                                  onClick={() => handleMoveTask(t.id, 'backward')}
                                  className="p-1 rounded bg-secondary border border-border hover:bg-secondary/80 text-foreground cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                              )}
                              {status !== 'completed' && (
                                <button
                                  onClick={() => handleMoveTask(t.id, 'forward')}
                                  className="p-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}

                      {columnTasks.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/20">
                          <CheckSquare className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-[10px] italic">Column is empty</p>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
