'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { fetchWithAuth } from '@/lib/api';
import { 
  Gift, 
  Calendar, 
  Download, 
  Search, 
  Users, 
  Cake, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: string;
  dob: string | null;
  designation: string | null;
}

export default function BirthdaysPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/auth/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load directory details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'hr') {
      fetchUsers();
    } else {
      setError('Unauthorized access. Only HR or Administrators can access birthday listings.');
      setLoading(false);
    }
  }, [currentUser]);

  // Helper to parse dates and calculate days remaining
  const getBirthdayStatus = (dobString: string | null) => {
    if (!dobString) return { daysLeft: 999, message: 'No date set', label: 'Not Set', isToday: false };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Clean up string format
      const cleanDob = dobString.trim().replace(/\//g, '-');
      const parts = cleanDob.split('-');
      let month = 0;
      let day = 0;

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        } else {
          // DD-MM-YYYY
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[0], 10);
        }
      } else if (parts.length === 2) {
        // MM-DD
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
      } else {
        return { daysLeft: 999, message: 'Invalid Format', label: 'Invalid Date', isToday: false };
      }

      if (isNaN(month) || isNaN(day)) {
        return { daysLeft: 999, message: 'Invalid Format', label: 'Invalid Date', isToday: false };
      }

      const bdayThisYear = new Date(today.getFullYear(), month, day);
      bdayThisYear.setHours(0, 0, 0, 0);

      let daysLeft = 0;
      let isToday = false;

      if (bdayThisYear.getTime() === today.getTime()) {
        isToday = true;
        daysLeft = 0;
      } else if (bdayThisYear.getTime() < today.getTime()) {
        const bdayNextYear = new Date(today.getFullYear() + 1, month, day);
        daysLeft = Math.ceil((bdayNextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        daysLeft = Math.ceil((bdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      const formattedDate = new Date(2000, month, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });

      if (isToday) {
        return { daysLeft, message: 'Birthday Today! 🎉', label: formattedDate, isToday: true };
      } else if (daysLeft === 1) {
        return { daysLeft, message: 'Tomorrow!', label: formattedDate, isToday: false };
      } else {
        return { daysLeft, message: `In ${daysLeft} days`, label: formattedDate, isToday: false };
      }
    } catch (_) {
      return { daysLeft: 999, message: 'Invalid Format', label: 'Invalid Date', isToday: false };
    }
  };

  // Canvas wishing poster generator
  const handleDownloadPoster = (username: string, designation: string | null, dob: string | null) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; 
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw deep, premium gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, '#0f172a'); // slate 900
    gradient.addColorStop(0.4, '#1e1b4b'); // indigo 950
    gradient.addColorStop(1, '#311042'); // deep plum
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // Draw premium gold frames
    ctx.strokeStyle = '#eab308'; // amber 500
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, 1000, 1270);
    
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(65, 65, 950, 1220);

    // Draw stylized background stars / circles
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(234, 179, 8, 0.4)' : 'rgba(168, 85, 247, 0.4)';
      const x = Math.random() * 920 + 80;
      const y = Math.random() * 1150 + 80;
      const r = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title: HAPPY BIRTHDAY
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 6;

    const goldGrad = ctx.createLinearGradient(0, 320, 0, 480);
    goldGrad.addColorStop(0, '#fef08a'); // light yellow
    goldGrad.addColorStop(1, '#ca8a04'); // dark yellow
    ctx.fillStyle = goldGrad;
    ctx.textAlign = 'center';
    
    ctx.font = '900 80px sans-serif';
    ctx.fillText('HAPPY BIRTHDAY', 540, 390);

    // Ribbon divider
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(390, 430, 300, 6);

    // User's name
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 90px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username.toUpperCase(), 540, 560);

    // Designation (if set)
    if (designation) {
      ctx.shadowBlur = 0;
      ctx.font = 'semibold italic 36px sans-serif';
      ctx.fillStyle = '#a855f7'; // Purple designation text
      ctx.fillText(designation, 540, 620);
    }

    // Wish messages
    ctx.shadowBlur = 0;
    ctx.font = '500 38px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Wishing you a brilliant year ahead filled with', 540, 760);
    ctx.fillText('immense success, joy, and new accomplishments.', 540, 820);

    // Balloons vectors
    // Balloon 1 (Red/Pink)
    ctx.fillStyle = '#ec4899'; // pink 500
    ctx.beginPath();
    ctx.ellipse(280, 1020, 75, 105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 1125);
    ctx.quadraticCurveTo(270, 1190, 300, 1220);
    ctx.stroke();

    // Balloon 2 (Purple)
    ctx.fillStyle = '#a855f7'; // purple 500
    ctx.beginPath();
    ctx.ellipse(800, 1000, 75, 105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(800, 1105);
    ctx.quadraticCurveTo(810, 1170, 780, 1200);
    ctx.stroke();

    // Gift Box Silhouette or graphic details
    ctx.fillStyle = '#eab308';
    ctx.fillRect(490, 950, 100, 100);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(535, 950, 10, 100);
    ctx.fillRect(490, 995, 100, 10);
    // Ribbon bow
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(515, 940, 20, 0, Math.PI * 2);
    ctx.arc(565, 940, 20, 0, Math.PI * 2);
    ctx.fill();

    // Company branding footer
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#eab308';
    ctx.fillText('HIG AI AUTOMATION LLP', 540, 1140);

    ctx.font = '500 24px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('Empowering Enterprise Workspace Celebrations', 540, 1195);

    // Save
    const link = document.createElement('a');
    link.download = `Birthday_Poster_${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Filter and sort users
  const sortedUsers = [...users]
    .map(u => ({ ...u, statusInfo: getBirthdayStatus(u.dob) }))
    .filter(u => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        u.username.toLowerCase().includes(searchLower) ||
        (u.designation && u.designation.toLowerCase().includes(searchLower)) ||
        (u.dob && u.dob.includes(searchLower));
      
      return matchesSearch && u.dob !== null;
    })
    .sort((a, b) => a.statusInfo.daysLeft - b.statusInfo.daysLeft);

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Birthdays & Posters</h1>
            <p className="text-muted-foreground mt-1 font-inter">
              Monitor upcoming employee birthdays, view schedules, and download custom wishing posters.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
            <Cake className="h-4 w-4" />
            Celebrations Desk
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-inter">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/70">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search employee, designation, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-primary placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-inter text-sm"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-24">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-inter text-sm">Loading birthday records...</p>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="bg-secondary/30 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-sm">No birthdays found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or make sure users have set their birth dates in Access Control.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedUsers.map((u) => {
                  const { isToday, label, message } = u.statusInfo;
                  return (
                    <div 
                      key={u.id} 
                      className={`bg-card rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm flex flex-col justify-between ${
                        isToday 
                          ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-gradient-to-br from-card to-amber-500/5' 
                          : 'border-border hover:border-accent/40'
                      }`}
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-primary text-base flex items-center gap-1.5 capitalize">
                              {u.username}
                              {isToday && (
                                <span className="animate-bounce">🎉</span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground font-inter mt-0.5">
                              {u.designation || 'Specialist'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-inter ${
                            isToday 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            <Cake className="h-3 w-3" />
                            {isToday ? 'Today!' : message}
                          </span>
                        </div>

                        <div className="bg-secondary/20 p-4 border border-border rounded-2xl flex items-center gap-3">
                          <Calendar className={`h-5 w-5 ${isToday ? 'text-amber-500' : 'text-muted-foreground/75'}`} />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-inter">Birthday Date</p>
                            <p className="text-xs font-bold text-primary mt-0.5">{label}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-border bg-secondary/10 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-inter uppercase font-semibold">
                          Wishes Poster
                        </span>
                        <button
                          onClick={() => handleDownloadPoster(u.username, u.designation, u.dob)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
