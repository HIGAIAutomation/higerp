"use client";

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  Briefcase, 
  Calendar,
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  MessageSquare,
  Clock,
  User,
  Share2,
  Video,
  Image,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Download,
  FileText,
  Bell,
  X,
  BellRing,
  BarChart2,
  History
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  category?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  postCount?: number | string;
  videoCount?: number | string;
}

interface SocialPost {
  id?: string;
  platform: string;
  postType: string;
  status: string;
  comments: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface AdCampaign {
  id: string;
  name: string;
  spend: number;
  leads: number;
  startDate: string;
  updatedBy: string;
}

interface SpecialDayPoster {
  holidayName: string;
  scheduledDate: string;
  isPlannedOnFirstDay: boolean;
  status: string;
  updatedBy?: string;
}

const INDIAN_HOLIDAYS = [
  { name: "New Year's Day", date: "01-01", type: "India" },
  { name: "Pongal", date: "01-14", type: "Tamil Nadu" },
  { name: "Thiruvalluvar Day", date: "01-16", type: "Tamil Nadu" },
  { name: "Republic Day", date: "01-26", type: "India" },
  { name: "Tamil New Year / Puthandu", date: "04-14", type: "Tamil Nadu" },
  { name: "May Day / Labor Day", date: "05-01", type: "India & Tamil Nadu" },
  { name: "Independence Day", date: "08-15", type: "India" },
  { name: "Gandhi Jayanti", date: "10-02", type: "India" },
  { name: "Ayudha Puja", date: "10-23", type: "Tamil Nadu" },
  { name: "Deepavali / Diwali", date: "11-12", type: "India & Tamil Nadu" },
  { name: "Christmas Day", date: "12-25", type: "India & Tamil Nadu" }
];

export default function DigitalMarketingPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  const [updatingPostId, setUpdatingPostId] = useState<string | null>(null);
  const [updatingPosterId, setUpdatingPosterId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Campaign alert popup state
  const [showCampaignAlert, setShowCampaignAlert] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [alertCampaignCount, setAlertCampaignCount] = useState(0);

  // Dashboard Data
  const [socialPosts, setSocialPosts] = useState<Record<string, SocialPost>>({});
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [holidayPosters, setHolidayPosters] = useState<Record<string, SpecialDayPoster>>({});
  const [isPlannedOnFirstDay, setIsPlannedOnFirstDay] = useState(false);
  const [firstDayUpdatedBy, setFirstDayUpdatedBy] = useState<string>('');

  // Post update history states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form States
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    spend: '',
    leads: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [allProjectsPosts, setAllProjectsPosts] = useState<any[]>([]);
  const [allProjectsHistory, setAllProjectsHistory] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/projects');
      const filtered = data.filter((p: Project) => p.category === 'Digital Marketing');
      setProjects(filtered);
      if (filtered.length > 0) {
        setSelectedProjectId(filtered[0].id);
      } else {
        setSelectedProjectId('');
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch projects. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchProjectMarketingData = async (projId: string) => {
    if (!projId) return;
    try {
      setLoading(true);
      // Fetch social posts
      const postsData = await fetchWithAuth(`/marketing/${projId}/posts?month=${selectedMonth}`);
      const postsMap: Record<string, SocialPost> = {};
      postsData.forEach((post: any) => {
        postsMap[`${post.platform}-${post.postType}`] = post;
      });
      setSocialPosts(postsMap);

      // Fetch history records to count targets
      try {
        const historyData = await fetchWithAuth(`/marketing/${projId}/posts/history?month=${selectedMonth}`);
        setHistoryRecords(historyData);
      } catch (hErr) {
        console.error('Failed to fetch post history in marketing data:', hErr);
        setHistoryRecords([]);
      }

      // Fetch campaigns
      const campaignsData = await fetchWithAuth(`/marketing/${projId}/campaigns`);
      setCampaigns(campaignsData);

      // Check monthly campaign frequency and trigger alert
      const monthCampaigns = campaignsData.filter((c: AdCampaign) => c.startDate.startsWith(selectedMonth));
      const monthCount = monthCampaigns.length;
      setAlertCampaignCount(monthCount);
      if (monthCount < 2 && !dismissedAlerts.has(projId)) {
        setShowCampaignAlert(true);
      }

      // Fetch holiday posters for the selected month
      const specialDaysData = await fetchWithAuth(`/marketing/${projId}/special-days?month=${selectedMonth}`);
      const posterMap: Record<string, SpecialDayPoster> = {};
      let plannedOnFirst = false;
      let firstUpdatedUser = '';
      specialDaysData.forEach((p: any) => {
        if (p.holidayName === 'FIRST_DAY_PLANNING') {
          plannedOnFirst = p.isPlannedOnFirstDay;
          firstUpdatedUser = p.updatedBy;
        } else {
          posterMap[p.holidayName] = p;
        }
      });
      setHolidayPosters(posterMap);
      setIsPlannedOnFirstDay(plannedOnFirst);
      setFirstDayUpdatedBy(firstUpdatedUser);

      setError(null);
    } catch (err) {
      console.error(err);
      // Non-fatal: marketing data may not exist yet for all project categories
      setSocialPosts({});
      setCampaigns([]);
      setHolidayPosters({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      setShowCampaignAlert(false);
      fetchProjectMarketingData(selectedProjectId);
    }
  }, [selectedProjectId, selectedMonth]);

  const handleDismissAlert = () => {
    setShowCampaignAlert(false);
    setDismissedAlerts(prev => new Set(prev).add(selectedProjectId));
  };

  const handleUpdateSocialPost = async (platform: string, postType: string, status: string, comments: string) => {
    const key = `${platform}-${postType}`;
    setUpdatingPostId(key);
    try {
      await fetchWithAuth(`/marketing/${selectedProjectId}/posts`, {
        method: 'POST',
        body: JSON.stringify({ platform, postType, status, comments, month: selectedMonth })
      });
      // Refresh local marketing data to ensure targets met, history, and status are all in sync
      await fetchProjectMarketingData(selectedProjectId);
    } catch (err) {
      console.error(err);
      alert('Failed to update social post details.');
    } finally {
      setUpdatingPostId(null);
    }
  };

  const fetchPendingWorksData = async () => {
    try {
      setLoadingPending(true);
      const usersData = await fetchWithAuth('/marketing/users');
      setUsers(usersData);
      const postsData = await fetchWithAuth(`/marketing/posts/all?month=${selectedMonth}`);
      setAllProjectsPosts(postsData);
      const historyData = await fetchWithAuth(`/marketing/posts/history/all?month=${selectedMonth}`);
      setAllProjectsHistory(historyData);
    } catch (err) {
      console.error('Failed to fetch pending works data:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleUpdatePendingPost = async (
    projId: string,
    platform: string,
    postType: string,
    fields: { status?: string; comments?: string; assignedTo?: string | null; dueDate?: string | null }
  ) => {
    try {
      const existing = allProjectsPosts.find(
        p => p.projectId === projId && p.platform === platform && p.postType === postType
      );

      const body = {
        platform,
        postType,
        status: fields.status !== undefined ? fields.status : (existing?.status || 'inprogress'),
        comments: fields.comments !== undefined ? fields.comments : (existing?.comments || ''),
        month: selectedMonth,
        assignedTo: fields.assignedTo !== undefined ? fields.assignedTo : (existing?.assignedTo || null),
        dueDate: fields.dueDate !== undefined ? fields.dueDate : (existing?.dueDate || null)
      };

      await fetchWithAuth(`/marketing/${projId}/posts`, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      await fetchPendingWorksData();
    } catch (err) {
      console.error('Failed to update pending post:', err);
      alert('Failed to update task assignment/due date.');
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingWorksData();
    }
  }, [activeTab, selectedMonth]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmittingCampaign(true);
    try {
      const response = await fetchWithAuth(`/marketing/${selectedProjectId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify({
          name: campaignForm.name,
          spend: parseFloat(campaignForm.spend),
          leads: parseInt(campaignForm.leads, 10),
          startDate: campaignForm.startDate
        })
      });
      const updated = [response, ...campaigns];
      setCampaigns(updated);
      const monthCount = updated.filter(c => c.startDate.startsWith(selectedMonth)).length;
      setAlertCampaignCount(monthCount);
      if (monthCount >= 2) setShowCampaignAlert(false);
      setCampaignForm({
        name: '',
        spend: '',
        leads: '',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      alert('Failed to log campaign.');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleUpdateHolidayPosterStatus = async (holidayName: string, scheduledDate: string, status: string) => {
    setUpdatingPosterId(holidayName);
    try {
      const response = await fetchWithAuth(`/marketing/${selectedProjectId}/special-days`, {
        method: 'POST',
        body: JSON.stringify({
          holidayName,
          month: selectedMonth,
          scheduledDate,
          status
        })
      });
      setHolidayPosters(prev => ({
        ...prev,
        [holidayName]: response
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update holiday poster.');
    } finally {
      setUpdatingPosterId(null);
    }
  };

  const handleToggleFirstDayPlanning = async (checked: boolean) => {
    try {
      const response = await fetchWithAuth(`/marketing/${selectedProjectId}/special-days`, {
        method: 'POST',
        body: JSON.stringify({
          holidayName: 'FIRST_DAY_PLANNING',
          month: selectedMonth,
          scheduledDate: `${selectedMonth}-01`,
          isPlannedOnFirstDay: checked
        })
      });
      setIsPlannedOnFirstDay(response.isPlannedOnFirstDay);
      setFirstDayUpdatedBy(response.updatedBy);
    } catch (err) {
      console.error(err);
      alert('Failed to update first day planning state.');
    }
  };

  const handleDownloadReport = async () => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject) return;

    setDownloadingReport(true);
    try {
      const campaignsThisMonth = campaigns.filter(c => c.startDate.startsWith(selectedMonth));
      const totalSpend = campaignsThisMonth.reduce((sum, c) => sum + Number(c.spend), 0);
      const totalLeads = campaignsThisMonth.reduce((sum, c) => sum + c.leads, 0);
      const frequencyMet = campaignsThisMonth.length >= 2;

      const platforms = ['instagram', 'fb', 'youtube', 'linkedin'];
      const platformNames: Record<string, string> = { instagram: 'Instagram', fb: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn' };
      const types = ['image', 'video'];

      const socialRows = platforms.flatMap(plat =>
        types.map(type => {
          const post = socialPosts[`${plat}-${type}`];
          return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">${platformNames[plat]}</td>
              <td style="padding: 8px 12px; color: #475569; text-transform: capitalize;">${type}</td>
              <td style="padding: 8px 12px;">
                <span style="display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                  ${post?.status === 'posted' ? 'background: #ecfdf5; color: #059669;' : post?.status === 'completed' ? 'background: #eff6ff; color: #2563eb;' : 'background: #fffbeb; color: #d97706;'}">
                  ${post?.status || 'inprogress'}
                </span>
              </td>
              <td style="padding: 8px 12px; color: #64748b; font-size: 11px;">${post?.comments || '—'}</td>
              <td style="padding: 8px 12px; color: #94a3b8; font-size: 10px;">${post?.updatedBy ? `By: ${post.updatedBy}` : '—'}</td>
            </tr>`;
        })
      ).join('');

      const campaignRows = campaigns.length > 0
        ? campaigns.map(c => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">${c.name}</td>
              <td style="padding: 8px 12px; color: #475569;">${c.startDate.split('T')[0]}</td>
              <td style="padding: 8px 12px; font-weight: 700; color: #0284c7;">Rs. ${Number(c.spend).toLocaleString()}</td>
              <td style="padding: 8px 12px;">
                <span style="background: #ecfdf5; color: #059669; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700;">${c.leads} Leads</span>
              </td>
              <td style="padding: 8px 12px; color: #94a3b8; font-size: 10px;">${c.updatedBy}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; font-size: 12px;">No campaigns logged yet.</td></tr>`;

      const [selYear, selMonth] = selectedMonth.split('-');
      const currentYear = parseInt(selYear, 10);
      const currentMonthInt = parseInt(selMonth, 10);
      const monthHolidays = INDIAN_HOLIDAYS.filter(h => parseInt(h.date.split('-')[0], 10) === currentMonthInt);
      const holidayRows = monthHolidays.length > 0
        ? monthHolidays.map(h => {
            const poster = holidayPosters[h.name];
            return `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">${h.name}</td>
                <td style="padding: 8px 12px; color: #475569;">${currentYear}-${h.date}</td>
                <td style="padding: 8px 12px; font-size: 10px; color: #6366f1; font-weight: 600;">${h.type}</td>
                <td style="padding: 8px 12px;">
                  <span style="padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;
                    ${poster?.status === 'posted' ? 'background: #ecfdf5; color: #059669;' : poster?.status === 'designed' ? 'background: #eff6ff; color: #2563eb;' : 'background: #f8fafc; color: #94a3b8;'}">
                    ${poster?.status || 'Pending'}
                  </span>
                </td>
              </tr>`;
          }).join('')
        : `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; font-size: 12px;">No major holidays this month.</td></tr>`;

      const reportDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

      const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; background: #ffffff; padding: 0;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2E9EDE; padding-bottom: 12px; margin-bottom: 28px;">
            <img src="/logo.png" style="height: 34px; object-fit: contain;" />
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE PORTAL</div>
              <div style="font-size: 8px; font-weight: 600; color: #64748b;">DIGITAL MARKETING PERFORMANCE REPORT</div>
            </div>
          </div>

          <!-- Report Title -->
          <div style="margin-bottom: 28px;">
            <h1 style="font-size: 20pt; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${selectedProject.name}
            </h1>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">Period: ${selectedMonth}</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">•</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">Category: ${selectedProject.category || 'General'}</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">•</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">Generated: ${reportDate}</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">•</span>
              <span style="font-size: 10px; font-weight: 600; color: #64748b;">Prepared by: ${user?.username || 'Admin'}</span>
            </div>
          </div>

          <!-- Summary KPIs -->
          <div style="display: table; width: 100%; table-layout: fixed; margin-bottom: 28px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="display: table-cell; padding: 16px 20px; background: #f8fafc; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 22pt; font-weight: 800; color: #2E9EDE;">${campaignsThisMonth.length}</div>
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Campaigns This Month</div>
            </div>
            <div style="display: table-cell; padding: 16px 20px; background: #f8fafc; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 22pt; font-weight: 800; color: #059669;">Rs. ${totalSpend.toLocaleString()}</div>
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Total Ad Spend</div>
            </div>
            <div style="display: table-cell; padding: 16px 20px; background: #f8fafc; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 22pt; font-weight: 800; color: #7c3aed;">${totalLeads}</div>
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Total Leads</div>
            </div>
            <div style="display: table-cell; padding: 16px 20px; background: ${frequencyMet ? '#ecfdf5' : '#fff7ed'}; text-align: center;">
              <div style="font-size: 22pt; font-weight: 800; color: ${frequencyMet ? '#059669' : '#ea580c'};">${frequencyMet ? '✓' : '!'}</div>
              <div style="font-size: 9px; font-weight: 700; color: ${frequencyMet ? '#059669' : '#ea580c'}; text-transform: uppercase; margin-top: 4px;">${frequencyMet ? 'Frequency Goal Met' : 'Frequency Goal Pending'}</div>
            </div>
          </div>

          <!-- Content Targets & Delivery Summary -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13pt; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; letter-spacing: 0.5px;">
              Content Targets & Delivery Summary
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Content Type</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Target Count</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Actual Delivered</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Completion Rate</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">
                    <div>Image Posts</div>
                    <div style="font-size: 8px; color: #64748b; font-weight: 500; margin-top: 2px;">
                      Instagram: ${isPlatformPostDelivered('instagram', 'image') ? 1 : 0}/${platTargetImage} • 
                      Facebook: ${isPlatformPostDelivered('fb', 'image') ? 1 : 0}/${platTargetImage} • 
                      YouTube: ${isPlatformPostDelivered('youtube', 'image') ? 1 : 0}/${platTargetImage} • 
                      LinkedIn: ${isPlatformPostDelivered('linkedin', 'image') ? 1 : 0}/${platTargetImage}
                    </div>
                  </td>
                  <td style="padding: 8px 12px; color: #475569;">${targetImagePosts}</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #2E9EDE;">${actualImagePosts}</td>
                  <td style="padding: 8px 12px; color: #475569;">${targetImagePosts > 0 ? Math.round((actualImagePosts / targetImagePosts) * 100) : 0}%</td>
                  <td style="padding: 8px 12px;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;
                      ${actualImagePosts >= targetImagePosts && targetImagePosts > 0 ? 'background: #ecfdf5; color: #059669;' : 'background: #fffbeb; color: #d97706;'}">
                      ${actualImagePosts >= targetImagePosts && targetImagePosts > 0 ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">
                    <div>Video Posts</div>
                    <div style="font-size: 8px; color: #64748b; font-weight: 500; margin-top: 2px;">
                      Instagram: ${isPlatformPostDelivered('instagram', 'video') ? 1 : 0}/${platTargetVideo} • 
                      Facebook: ${isPlatformPostDelivered('fb', 'video') ? 1 : 0}/${platTargetVideo} • 
                      YouTube: ${isPlatformPostDelivered('youtube', 'video') ? 1 : 0}/${platTargetVideo} • 
                      LinkedIn: ${isPlatformPostDelivered('linkedin', 'video') ? 1 : 0}/${platTargetVideo}
                    </div>
                  </td>
                  <td style="padding: 8px 12px; color: #475569;">${targetVideoPosts}</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #e11d48;">${actualVideoPosts}</td>
                  <td style="padding: 8px 12px; color: #475569;">${targetVideoPosts > 0 ? Math.round((actualVideoPosts / targetVideoPosts) * 100) : 0}%</td>
                  <td style="padding: 8px 12px;">
                    <span style="display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase;
                      ${actualVideoPosts >= targetVideoPosts && targetVideoPosts > 0 ? 'background: #ecfdf5; color: #059669;' : 'background: #fffbeb; color: #d97706;'}">
                      ${actualVideoPosts >= targetVideoPosts && targetVideoPosts > 0 ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Social Posts Tracker -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13pt; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; letter-spacing: 0.5px;">
              Social Post Channel Tracker
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Platform</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Type</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Status</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Notes</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Updated By</th>
                </tr>
              </thead>
              <tbody>${socialRows}</tbody>
            </table>
          </div>

          <!-- Campaign Performance -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13pt; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; letter-spacing: 0.5px;">
              Ad Campaign Performance Log
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Campaign</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Date</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Spend</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Leads</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Logged By</th>
                </tr>
              </thead>
              <tbody>${campaignRows}</tbody>
            </table>
          </div>

          <!-- Special Days Planner -->
          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13pt; font-weight: 700; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; letter-spacing: 0.5px;">
              Special Days Poster Planner (${selectedMonth})
            </h2>
            <div style="margin-bottom: 10px; padding: 10px 14px; background: ${isPlannedOnFirstDay ? '#ecfdf5' : '#fffbeb'}; border-radius: 8px; font-size: 11px; font-weight: 600; color: ${isPlannedOnFirstDay ? '#059669' : '#d97706'};">
              ${isPlannedOnFirstDay ? '✓ All posters planned on 1st of month' : '⚠ Planning on 1st of month — not yet confirmed'}
              ${firstDayUpdatedBy ? ` (by: ${firstDayUpdatedBy})` : ''}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Holiday</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Date</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Region</th>
                  <th style="padding: 10px 12px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">Status</th>
                </tr>
              </thead>
              <tbody>${holidayRows}</tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; display: table; width: 100%; table-layout: fixed;">
            <div style="display: table-cell; font-size: 9px; color: #94a3b8; font-style: italic;">
              This is a system-generated report from HIG Enterprise AI ERP. For internal use only.
            </div>
            <div style="display: table-cell; text-align: right; font-size: 9px; color: #94a3b8;">
              Confidential • ${reportDate}
            </div>
          </div>
        </div>`;

      const filename = `${selectedProject.name.replace(/\s+/g, '_')}_Marketing_Report_${selectedMonth}`;
      const { downloadPdfFromHtml } = await import('@/lib/download-pdf');
      await downloadPdfFromHtml(htmlContent, filename, setDownloadingReport);
    } catch (err) {
      console.error('Failed to compile report:', err);
      alert('Could not generate report. Ensure the backend is online.');
      setDownloadingReport(false);
    }
  };

  // Compute stats for campaigns run this month
  const campaignsThisMonth = campaigns.filter(c => c.startDate.startsWith(selectedMonth));
  const campaignsCount = campaignsThisMonth.length;
  const targetMet = campaignsCount >= 2;

  // Static list of holidays occurring in current month
  const [selYear, selMonth] = selectedMonth.split('-');
  const currentMonthInt = parseInt(selMonth, 10);
  const currentYear = parseInt(selYear, 10);
  const currentMonthHolidays = INDIAN_HOLIDAYS.filter(h => {
    const m = parseInt(h.date.split('-')[0], 10);
    return m === currentMonthInt;
  });

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'completed': return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
      case 'inprogress':
      default:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Targets from project setup
  const targetImagePosts = selectedProject ? Number(selectedProject.postCount || 0) : 0;
  const targetVideoPosts = selectedProject ? Number(selectedProject.videoCount || 0) : 0;
  const platTargetImage = targetImagePosts > 0 ? Math.ceil(targetImagePosts / 4) : 0;
  const platTargetVideo = targetVideoPosts > 0 ? Math.ceil(targetVideoPosts / 4) : 0;

  // Helper to check if a post is delivered for a platform
  const isPlatformPostDelivered = (plat: string, type: string) => {
    return historyRecords.some(
      (h) => h.platform === plat && h.postType === type && (h.status === 'posted' || h.status === 'completed')
    );
  };

  // Helper to get per-platform actual delivered count from history
  const getPlatformDeliveredCount = (plat: string, type: string) => {
    return historyRecords.filter(
      (h) => h.platform === plat && h.postType === type && (h.status === 'posted' || h.status === 'completed')
    ).length;
  };

  // Helper to get per-platform posted-only count from history
  const getPlatformPostedCount = (plat: string, type: string) => {
    return historyRecords.filter(
      (h) => h.platform === plat && h.postType === type && h.status === 'posted'
    ).length;
  };

  // Helper to get per-platform completed-only count from history
  const getPlatformCompletedCount = (plat: string, type: string) => {
    return historyRecords.filter(
      (h) => h.platform === plat && h.postType === type && h.status === 'completed'
    ).length;
  };

  // Actual posts posted or completed (calculated from history records)
  const actualImagePosts = historyRecords.filter(
    (h) => h.postType === 'image' && (h.status === 'posted' || h.status === 'completed')
  ).length;

  const actualVideoPosts = historyRecords.filter(
    (h) => h.postType === 'video' && (h.status === 'posted' || h.status === 'completed')
  ).length;

  // Compute pending tasks across all projects for the selected month
  const pendingTasks = React.useMemo(() => {
    const tasks: any[] = [];
    const platforms = ['instagram', 'fb', 'youtube', 'linkedin'];
    const platformNames: Record<string, string> = { instagram: 'Instagram', fb: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn' };

    projects.forEach((proj) => {
      const targetImage = Number(proj.postCount || 0);
      const targetVideo = Number(proj.videoCount || 0);
      const platTargetImage = targetImage > 0 ? Math.ceil(targetImage / 4) : 0;
      const platTargetVideo = targetVideo > 0 ? Math.ceil(targetVideo / 4) : 0;

      platforms.forEach((plat) => {
        // Check Image
        if (platTargetImage > 0) {
          const completedCount = allProjectsHistory.filter(
            (h) =>
              h.projectId === proj.id &&
              h.platform === plat &&
              h.postType === 'image' &&
              (h.status === 'posted' || h.status === 'completed')
          ).length;

          if (completedCount < platTargetImage) {
            const existing = allProjectsPosts.find(
              (post) =>
                post.projectId === proj.id &&
                post.platform === plat &&
                post.postType === 'image'
            );
            tasks.push({
              id: existing?.id || `${proj.id}-${plat}-image`,
              projectId: proj.id,
              projectName: proj.name,
              platform: plat,
              postType: 'image',
              taskName: `${platformNames[plat]} Image Post (${completedCount}/${platTargetImage})`,
              status: existing?.status || 'inprogress',
              assignedTo: existing?.assignedTo || '',
              dueDate: existing?.dueDate ? new Date(existing.dueDate).toISOString().split('T')[0] : '',
              comments: existing?.comments || ''
            });
          }
        }

        // Check Video
        if (platTargetVideo > 0) {
          const completedCount = allProjectsHistory.filter(
            (h) =>
              h.projectId === proj.id &&
              h.platform === plat &&
              h.postType === 'video' &&
              (h.status === 'posted' || h.status === 'completed')
          ).length;

          if (completedCount < platTargetVideo) {
            const existing = allProjectsPosts.find(
              (post) =>
                post.projectId === proj.id &&
                post.platform === plat &&
                post.postType === 'video'
            );
            tasks.push({
              id: existing?.id || `${proj.id}-${plat}-video`,
              projectId: proj.id,
              projectName: proj.name,
              platform: plat,
              postType: 'video',
              taskName: `${platformNames[plat]} Video Post (${completedCount}/${platTargetVideo})`,
              status: existing?.status || 'inprogress',
              assignedTo: existing?.assignedTo || '',
              dueDate: existing?.dueDate ? new Date(existing.dueDate).toISOString().split('T')[0] : '',
              comments: existing?.comments || ''
            });
          }
        }
      });
    });

    return tasks;
  }, [projects, allProjectsPosts, allProjectsHistory]);

  return (
    <DashboardLayout>
      <div className="font-sans min-h-screen bg-transparent pb-16">

        {/* ===== Campaign Frequency Alert Popup ===== */}
        {showCampaignAlert && selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-2xl max-w-md w-full relative animate-in zoom-in-95 duration-300">
              <div className="absolute top-5 right-5">
                <button
                  type="button"
                  onClick={handleDismissAlert}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Alert Icon */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center animate-pulse">
                    <BellRing className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
                </div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">Campaign Reminder</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">Monthly frequency target alert</p>
              </div>

              {/* Alert body */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/50 mb-6 text-center">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                  <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 block mb-1">{selectedProject.name}</span>
                  has only <span className="font-extrabold text-rose-600 dark:text-rose-400">{alertCampaignCount}</span> campaign{alertCampaignCount !== 1 ? 's' : ''} logged this month.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-2">
                  Target: <strong>2 campaigns per month</strong> per client.
                  You need <strong>{Math.max(0, 2 - alertCampaignCount)} more</strong> campaign{2 - alertCampaignCount !== 1 ? 's' : ''} for {selectedMonth}.
                </p>
              </div>

              {/* Action info */}
              <p className="text-xs text-muted-foreground text-center font-medium mb-6">
                Log a new ad campaign below to satisfy this month's target. The alert will auto-dismiss once the 2-campaign goal is met.
              </p>

              <button
                type="button"
                onClick={handleDismissAlert}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-sm"
              >
                <BarChart2 className="h-4 w-4" />
                Got it, I'll log campaigns now
              </button>
            </div>
          </div>
        )}

        {/* ===== Social Post History Modal ===== */}
        {showHistoryModal && selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-300">
              <div className="absolute top-6 right-6">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Header */}
              <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Post Update History</h2>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Showing all logs for <span className="font-semibold text-indigo-600">{selectedProject.name}</span></p>
                </div>
              </div>

              {/* Modal Body / History List */}
              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Loading history logs...</p>
                  </div>
                ) : historyRecords.length === 0 ? (
                  <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-foreground">No History Records</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Any updates to post status or comments will be recorded here.</p>
                  </div>
                ) : (
                  <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Platform</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Log Notes</th>
                          <th className="py-3 px-4">Updated By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-xs font-semibold text-foreground">
                        {historyRecords.map((record) => {
                          const dateObj = new Date(record.createdAt);
                          const formattedDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) + ' ' + dateObj.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <tr key={record.id} className="hover:bg-secondary/40 transition-colors">
                              <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">{formattedDate}</td>
                              <td className="py-3.5 px-4">
                                <span className="capitalize font-bold text-foreground">{record.platform === 'fb' ? 'Facebook' : record.platform}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 uppercase text-[10px] font-bold text-muted-foreground">
                                  {record.postType === 'video' ? <Video className="h-3 w-3 text-rose-500" /> : <Image className="h-3 w-3 text-sky-500" />}
                                  {record.postType}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColorClass(record.status)}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs truncate font-medium text-muted-foreground" title={record.comments || ''}>
                                {record.comments || <span className="text-muted-foreground/50 italic">No notes</span>}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1.5">
                                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-extrabold text-muted-foreground uppercase">
                                    {record.updatedBy ? record.updatedBy[0] : 'U'}
                                  </div>
                                  <span className="text-foreground">{record.updatedBy}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 border-t border-border pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Page Header ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Digital Marketing Hub</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Manage post channels, campaigns, and special holiday posters for all clients</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value || currentMonthStr)}
                className="bg-transparent text-foreground focus:outline-none text-sm font-semibold cursor-pointer"
              />
            </div>

            {/* Download Report Button */}
            {activeTab === 'dashboard' && selectedProjectId && (
              <button
                type="button"
                disabled={downloadingReport || loading}
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-background font-bold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-md text-sm"
              >
                {downloadingReport ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Compiling...</>
                ) : (
                  <><Download className="h-4 w-4" /> Download Report</>
                )}
              </button>
            )}

            {/* Project Selector */}
            {activeTab === 'dashboard' && (
              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm font-semibold cursor-pointer appearance-none shadow-sm"
                  >
                    {projects.length === 0 ? (
                      <option value="">No Projects Found</option>
                    ) : (
                      projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
                {selectedProject && (
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1 pl-1 uppercase tracking-wider">
                    {selectedProject.category || 'General'} Project
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== Tab Navigation ===== */}
        <div className="flex space-x-2 bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl max-w-lg mb-8 border border-border/40 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-card text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-border/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <BarChart2 className="h-4.5 w-4.5 text-indigo-500" />
            Client Tracker Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-card text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-border/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Clock className="h-4.5 w-4.5 text-rose-500" />
            Pending Works Ledger
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 text-rose-700 flex items-center border border-rose-100">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Campaign Frequency Inline Banner (non-blocking) */}
        {!loading && selectedProjectId && !targetMet && !showCampaignAlert && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Campaign Frequency Alert — {selectedMonth}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Only {campaignsCount} campaign{campaignsCount !== 1 ? 's' : ''} this month. Need {2 - campaignsCount} more to hit target.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCampaignAlert(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap underline underline-offset-2"
            >
              View Alert
            </button>
          </div>
        )}

        {activeTab === 'pending' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Render Pending Works Ledger */}
            {/* Render Pending Works Ledger */}
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-rose-500" />
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Pending Works Ledger</h2>
                </div>
                <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {pendingTasks.length} Pending Tasks
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-6 uppercase tracking-wider">
                UNCOMPLETED SOCIAL POSTS FOR {selectedMonth} ACROSS ALL DIGITAL MARKETING PROJECTS
              </p>

              {loadingPending ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-rose-500 mb-4" />
                  <p className="text-sm text-muted-foreground font-semibold">Scanning pending project tasks...</p>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border animate-in fade-in">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold text-foreground">All Targets Met!</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto font-medium">All social post targets for {selectedMonth} have been successfully posted or completed.</p>
                </div>
              ) : (
                <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="py-3.5 px-6">Project</th>
                        <th className="py-3.5 px-6">Task</th>
                        <th className="py-3.5 px-6">Current Status</th>
                        <th className="py-3.5 px-6">Due Date</th>
                        <th className="py-3.5 px-6">Assignee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
                      {pendingTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground font-bold">{task.projectName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 uppercase text-[10px] font-bold text-foreground bg-secondary px-2 py-1 rounded-md">
                              {task.postType === 'video' ? <Video className="h-3 w-3 text-rose-500" /> : <Image className="h-3 w-3 text-sky-500" />}
                              {task.taskName}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColorClass(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="date"
                              value={task.dueDate}
                              onChange={(e) => handleUpdatePendingPost(task.projectId, task.platform, task.postType, { dueDate: e.target.value || null })}
                              className="px-2 py-1 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent/10 text-xs font-semibold cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={task.assignedTo || ''}
                              onChange={(e) => handleUpdatePendingPost(task.projectId, task.platform, task.postType, { assignedTo: e.target.value || null })}
                              className="px-2 py-1 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent/10 text-xs font-semibold cursor-pointer max-w-[150px]"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.username}>{u.username}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : !selectedProjectId ? (
          <div className="text-center py-20 bg-card rounded-[32px] border border-dashed border-border shadow-sm">
            <Briefcase className="h-14 w-14 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Projects Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto font-medium">Go to the main Projects menu to create a new project.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[32px] border border-border shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
            <p className="text-sm text-muted-foreground font-semibold">Aligning client pipelines...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Target vs Actual Count Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Post Target Card */}
              <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                        <Image className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Image Posts Target (Setup)</span>
                    </div>
                    {targetImagePosts > 0 && actualImagePosts >= targetImagePosts ? (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-3xl font-extrabold text-foreground">{actualImagePosts}</span>
                    <span className="text-muted-foreground font-bold">/</span>
                    <span className="text-xl font-bold text-muted-foreground">{targetImagePosts}</span>
                    <span className="text-xs font-semibold text-muted-foreground ml-1">Delivered</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, targetImagePosts > 0 ? (actualImagePosts / targetImagePosts) * 100 : 0)}%` }}
                    />
                  </div>

                  {/* Platform breakdown */}
                  <div className="pt-3 border-t border-border mt-4 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Platform Status</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { name: 'Instagram', key: 'instagram' },
                        { name: 'Facebook', key: 'fb' },
                        { name: 'YouTube', key: 'youtube' },
                        { name: 'LinkedIn', key: 'linkedin' }
                      ].map(p => {
                        const platPosted = getPlatformPostedCount(p.key, 'image');
                        const platCompleted = getPlatformCompletedCount(p.key, 'image');
                        const platTotal = platPosted + platCompleted;
                        const isActive = platTotal > 0;
                        return (
                          <div key={p.key} className={`p-2 rounded-xl border text-[9px] font-bold ${isActive ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                            <span className="block text-[8px] opacity-70 truncate mb-1">{p.name}</span>
                            <span className="block text-sky-400">📤 {platPosted} posted</span>
                            <span className="block text-emerald-400">✅ {platCompleted} done</span>
                            <span className="block mt-0.5 text-muted-foreground">/ {platTargetImage} target</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Post Target Card */}
              <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                        <Video className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Video Posts Target (Setup)</span>
                    </div>
                    {targetVideoPosts > 0 && actualVideoPosts >= targetVideoPosts ? (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-3xl font-extrabold text-foreground">{actualVideoPosts}</span>
                    <span className="text-muted-foreground font-bold">/</span>
                    <span className="text-xl font-bold text-muted-foreground">{targetVideoPosts}</span>
                    <span className="text-xs font-semibold text-muted-foreground ml-1">Delivered</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, targetVideoPosts > 0 ? (actualVideoPosts / targetVideoPosts) * 100 : 0)}%` }}
                    />
                  </div>

                  {/* Platform breakdown */}
                  <div className="pt-3 border-t border-border mt-4 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Platform Status</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { name: 'Instagram', key: 'instagram' },
                        { name: 'Facebook', key: 'fb' },
                        { name: 'YouTube', key: 'youtube' },
                        { name: 'LinkedIn', key: 'linkedin' }
                      ].map(p => {
                        const platPosted = getPlatformPostedCount(p.key, 'video');
                        const platCompleted = getPlatformCompletedCount(p.key, 'video');
                        const platTotal = platPosted + platCompleted;
                        const isActive = platTotal > 0;
                        return (
                          <div key={p.key} className={`p-2 rounded-xl border text-[9px] font-bold ${isActive ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                            <span className="block text-[8px] opacity-70 truncate mb-1">{p.name}</span>
                            <span className="block text-rose-400">📤 {platPosted} posted</span>
                            <span className="block text-emerald-400">✅ {platCompleted} done</span>
                            <span className="block mt-0.5 text-muted-foreground">/ {platTargetVideo} target</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 1. Social Post Channels */}
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Share2 className="h-6 w-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Social Post Channel Tracker</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl border border-border active:scale-[0.98] transition-all cursor-pointer text-xs shadow-sm"
                >
                  <History className="h-3.5 w-3.5 text-indigo-500" />
                  View History
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-6 uppercase tracking-wider">TRACK VIDEO & IMAGE CONTENT ACROSS INSTAGRAM, FB, YOUTUBE, AND LINKEDIN</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Instagram', key: 'instagram' },
                  { name: 'Facebook', key: 'fb' },
                  { name: 'YouTube', key: 'youtube' },
                  { name: 'LinkedIn', key: 'linkedin' }
                ].map((plat) => (
                  <div key={plat.key} className="bg-secondary/50 rounded-2xl p-5 border border-border space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-bold text-foreground text-base">{plat.name}</span>
                    </div>

                    {['image', 'video'].map((type) => {
                      const postKey = `${plat.key}-${type}`;
                      const post = socialPosts[postKey] || { status: 'inprogress', comments: '' };
                      
                      return (
                        <div key={type} className="space-y-3 bg-card p-3.5 rounded-xl border border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center">
                              {type === 'video' ? <Video className="h-3.5 w-3.5 mr-1 text-rose-500" /> : <Image className="h-3.5 w-3.5 mr-1 text-sky-500" />}
                              {type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColorClass(post.status)}`}>
                              {post.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <select
                              value={post.status}
                              onChange={(e) => handleUpdateSocialPost(plat.key, type, e.target.value, post.comments)}
                              className="w-full text-xs font-bold text-foreground bg-secondary border border-border rounded-lg p-2 focus:outline-none focus:bg-card focus:ring-1 focus:ring-accent/10 cursor-pointer"
                            >
                              <option value="inprogress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="posted">Posted</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Write log notes..."
                              value={post.comments}
                              onChange={(e) => {
                                const currentComments = e.target.value;
                                setSocialPosts(prev => ({
                                  ...prev,
                                  [postKey]: { ...prev[postKey], platform: plat.key, postType: type, status: post.status, comments: currentComments }
                                }));
                              }}
                              className="w-full text-xs font-medium text-foreground bg-secondary border border-border rounded-lg p-2 focus:outline-none focus:bg-card focus:ring-1 focus:ring-accent/10 placeholder-muted-foreground/60"
                            />

                            <div className="flex justify-between items-center pt-2">
                              {post.updatedBy ? (
                                <span className="text-[9px] text-muted-foreground flex items-center font-medium">
                                  <Clock className="h-3 w-3 mr-0.5" />
                                  By: {post.updatedBy}
                                </span>
                              ) : (
                                <span className="text-[9px] text-muted-foreground/60 italic font-medium">No updates</span>
                              )}
                              
                              <button
                                type="button"
                                disabled={updatingPostId === postKey}
                                onClick={() => handleUpdateSocialPost(plat.key, type, post.status, post.comments)}
                                className="p-1 text-accent hover:text-accent/80 transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
                                title="Save changes"
                              >
                                {updatingPostId === postKey ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Save className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Ad Campaigns and Frequency reminder */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Campaign logger */}
              <div className="lg:col-span-5 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-sky-500" />
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Log Ad Campaign</h2>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Campaign Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Lead Gen Campaign - May"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:bg-card text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Spend (INR / Rs)</label>
                      <input
                        required
                        type="number"
                        placeholder="e.g. 1000"
                        value={campaignForm.spend}
                        onChange={(e) => setCampaignForm({ ...campaignForm, spend: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:bg-card text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Leads Acquired</label>
                      <input
                        required
                        type="number"
                        placeholder="e.g. 16"
                        value={campaignForm.leads}
                        onChange={(e) => setCampaignForm({ ...campaignForm, leads: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground/60 focus:outline-none focus:bg-card text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Start Date</label>
                    <input
                      required
                      type="date"
                      value={campaignForm.startDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:bg-card text-sm font-semibold cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCampaign}
                    className="w-full py-3.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl active:scale-[0.99] transition-all flex items-center justify-center shadow-md shadow-accent/10 disabled:opacity-70 cursor-pointer text-sm uppercase tracking-wider mt-4"
                  >
                    {submittingCampaign ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      'Save Campaign Performance'
                    )}
                  </button>
                </form>
              </div>

              {/* Campaign list & frequency checks */}
              <div className="lg:col-span-7 bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Campaign Frequency Ledger</h2>
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
                    Goal: 2 Campaigns / Month
                  </span>
                </div>

                {/* Warning / Reminder Banner */}
                {targetMet ? (
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-400">Goal Achieved for {selectedMonth}</p>
                      <p className="text-xs text-emerald-400/80 font-semibold mt-1">
                        Excellent! Met target campaign criteria of 2 campaigns per client. Total run: {campaignsCount}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-start justify-between space-x-3 cursor-pointer hover:bg-amber-500/20 transition-colors"
                    onClick={() => setShowCampaignAlert(true)}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-amber-400">⚠️ Action Required: Campaign Target</p>
                        <p className="text-xs text-amber-400/80 font-semibold mt-1">
                          Only {campaignsCount} campaign{campaignsCount !== 1 ? 's' : ''} run this month. Need {2 - campaignsCount} more campaign{2 - campaignsCount !== 1 ? 's' : ''} to meet monthly target.
                        </p>
                      </div>
                    </div>
                    <Bell className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  </div>
                )}

                {/* Campaign performance cards */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8 bg-secondary/30 rounded-2xl border border-dashed border-border">
                      <Clock className="h-8 w-8 text-muted-foreground/45 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-semibold">No campaigns logged yet.</p>
                    </div>
                  ) : (
                    campaigns.map((camp) => (
                      <div key={camp.id} className="p-4 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{camp.name}</h4>
                          <div className="flex items-center space-x-3 mt-1.5 text-xs text-muted-foreground font-semibold">
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {camp.startDate.split('T')[0]}
                            </span>
                            <span>•</span>
                            <span className="flex items-center text-foreground/80">
                              <User className="h-3.5 w-3.5 mr-1 text-muted-foreground/60" />
                              Logged by: {camp.updatedBy}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-accent">Rs. {camp.spend}</p>
                          <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                            {camp.leads} Leads
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 3. Special Days Poster Planner */}
            <div className="bg-card rounded-[32px] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Special Days Poster Planner</h2>
                </div>

                <div className="flex items-center space-x-3 bg-secondary p-3 rounded-2xl border border-border">
                  <input
                    type="checkbox"
                    id="plannedOnFirst"
                    checked={isPlannedOnFirstDay}
                    onChange={(e) => handleToggleFirstDayPlanning(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-accent border-slate-300 focus:ring-accent cursor-pointer"
                  />
                  <label htmlFor="plannedOnFirst" className="text-xs font-bold text-foreground cursor-pointer select-none">
                    All Posters Planned on 1st of Month
                  </label>
                  {firstDayUpdatedBy && (
                    <span className="text-[9px] text-muted-foreground font-semibold border-l border-border pl-3">
                      By: {firstDayUpdatedBy}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4">Continuous Special Days Reminder (India & Tamil Nadu)</p>
                
                {currentMonthHolidays.length === 0 ? (
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-dashed border-border text-center">
                    <p className="text-xs text-muted-foreground font-semibold">No major holidays mapped in India/Tamil Nadu for the current month.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMonthHolidays.map((holiday) => {
                      const poster = holidayPosters[holiday.name] || { status: 'pending' };
                      const scheduledDate = `${currentYear}-${holiday.date}`;
                      
                      return (
                        <div key={holiday.name} className="p-4 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between gap-4">
                          <div>
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {holiday.type}
                            </span>
                            <h4 className="text-sm font-bold text-foreground mt-1.5">{holiday.name}</h4>
                            <p className="text-xs text-muted-foreground font-semibold mt-1">{scheduledDate}</p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <select
                              value={poster.status}
                              onChange={(e) => handleUpdateHolidayPosterStatus(holiday.name, scheduledDate, e.target.value)}
                              className="text-xs font-bold bg-card border border-border rounded-xl p-2 focus:outline-none cursor-pointer text-foreground"
                            >
                              <option value="pending">Pending</option>
                              <option value="designed">Designed</option>
                              <option value="posted">Posted</option>
                            </select>

                            {updatingPosterId === holiday.name ? (
                              <Loader2 className="h-4 w-4 animate-spin text-accent" />
                            ) : poster.updatedBy ? (
                              <div className="text-[9px] text-muted-foreground font-semibold" title={`By ${poster.updatedBy}`}>
                                <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
