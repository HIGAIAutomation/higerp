"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/stats";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchWithAuth } from "@/lib/api";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Briefcase, 
  DollarSign, 
  Loader2, 
  Key, 
  ShieldCheck, 
  Calendar, 
  Download, 
  Send,
  FileCheck2,
  Tv,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Image as ImageIcon
} from "lucide-react";

// Native SVG Instagram Icon to avoid Lucide version export issues
function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface ContentSheetItem {
  id: string;
  date: string;
  day: string;
  contentType: string; // "Poster" | "Reel"
  topic: string;
  specialDay?: string;
  viralIdea: string;
  caption: string;
  keywords: string;
  hashtags: string;
  postingTime: string;
  runAdCampaign: string;
  leadGoal: string;
  cta: string;
}

const ClientInstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ClientFacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const ClientYouTubeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const MAHARAJA_CATERING_DATA: ContentSheetItem[] = [
  {
    id: "mc_1",
    date: "2026-06-01",
    day: "Monday",
    contentType: "Poster",
    topic: "Luxury Wedding Feast",
    specialDay: "",
    viralIdea: "Premium banana leaf wedding poster",
    caption: "Make your wedding unforgettable with authentic South Indian catering",
    keywords: "Wedding Catering, Banana Leaf Meals",
    hashtags: "#WeddingCatering #SriMaharajaCatering",
    postingTime: "07:00 PM",
    runAdCampaign: "YES",
    leadGoal: "Wedding Leads",
    cta: "DM For Booking"
  },
  {
    id: "mc_2",
    date: "2026-06-02",
    day: "Tuesday",
    contentType: "Reel",
    topic: "Wedding Feast Cinematic",
    specialDay: "",
    viralIdea: "Slow motion serving + guest reactions",
    caption: "A wedding feast is an emotion.",
    keywords: "Wedding Food Reel",
    hashtags: "#WeddingFood #FoodReels",
    postingTime: "06:30 PM",
    runAdCampaign: "YES",
    leadGoal: "High Wedding Leads",
    cta: "Watch Full Reel"
  },
  {
    id: "mc_3",
    date: "2026-06-03",
    day: "Wednesday",
    contentType: "Poster",
    topic: "Traditional Meals",
    specialDay: "",
    viralIdea: "Close-up traditional food photography",
    caption: "Traditional taste served with perfection.",
    keywords: "Traditional Meals",
    hashtags: "#TraditionalFood",
    postingTime: "01:00 PM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Save Post"
  },
  {
    id: "mc_4",
    date: "2026-06-04",
    day: "Thursday",
    contentType: "Reel",
    topic: "Kitchen BTS",
    specialDay: "",
    viralIdea: "Fast-cut cooking edits",
    caption: "Fresh ingredients, Premium taste.",
    keywords: "Kitchen BTS",
    hashtags: "#KitchenLife",
    postingTime: "11:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Follow Us"
  },
  {
    id: "mc_5",
    date: "2026-06-05",
    day: "Friday",
    contentType: "Poster",
    topic: "1000+ Guests Service",
    specialDay: "",
    viralIdea: "Large crowd catering visuals",
    caption: "We handle grand celebrations with ease.",
    keywords: "Big Event Catering",
    hashtags: "#GrandWedding",
    postingTime: "08:00 AM",
    runAdCampaign: "YES",
    leadGoal: "Bulk Leads",
    cta: "Call Now"
  },
  {
    id: "mc_6",
    date: "2026-06-06",
    day: "Saturday",
    contentType: "Reel",
    topic: "Before & After Setup",
    specialDay: "",
    viralIdea: "Empty hall to luxury setup transition",
    caption: "Transforming empty halls beautifully.",
    keywords: "Event Setup",
    hashtags: "#TransformationReel",
    postingTime: "06:30 PM",
    runAdCampaign: "YES",
    leadGoal: "Event Leads",
    cta: "Share Reel"
  },
  {
    id: "mc_8",
    date: "2026-06-08",
    day: "Monday",
    contentType: "Poster",
    topic: "World Environment Day Poster",
    specialDay: "World Environment Day",
    viralIdea: "Green-themed eco-friendly catering design",
    caption: "Celebrate sustainably with eco-friendly traditional catering.",
    keywords: "Eco Catering",
    hashtags: "#EnvironmentDay #EcoFriendly",
    postingTime: "08:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Book Event"
  },
  {
    id: "mc_9",
    date: "2026-06-09",
    day: "Tuesday",
    contentType: "Poster",
    topic: "Wedding Package Offer",
    specialDay: "",
    viralIdea: "Luxury gold-themed package poster",
    caption: "Affordable premium wedding catering packages.",
    keywords: "Wedding Package",
    hashtags: "#WeddingOffer",
    postingTime: "07:00 PM",
    runAdCampaign: "YES",
    leadGoal: "Direct Leads",
    cta: "WhatsApp Us"
  },
  {
    id: "mc_10",
    date: "2026-06-10",
    day: "Wednesday",
    contentType: "Reel",
    topic: "Guest Reactions",
    specialDay: "",
    viralIdea: "Happy customer emotional clips",
    caption: "Nothing beats happy customers.",
    keywords: "Customer Review",
    hashtags: "#CustomerLove",
    postingTime: "06:30 PM",
    runAdCampaign: "YES",
    leadGoal: "Trust Leads",
    cta: "Tag Friends"
  },
  {
    id: "mc_11",
    date: "2026-06-11",
    day: "Thursday",
    contentType: "Poster",
    topic: "Father's Day Celebration",
    specialDay: "Father's Day",
    viralIdea: "Family celebration dining visuals",
    caption: "Celebrate fathers and family moments with unforgettable food.",
    keywords: "Family Catering",
    hashtags: "#FathersDay",
    postingTime: "07:00 PM",
    runAdCampaign: "YES",
    leadGoal: "Family Event Leads",
    cta: "Book Celebration"
  },
  {
    id: "mc_12",
    date: "2026-06-12",
    day: "Friday",
    contentType: "Poster",
    topic: "Corporate Catering",
    specialDay: "",
    viralIdea: "Modern buffet setup",
    caption: "Professional catering for business events.",
    keywords: "Corporate Catering",
    hashtags: "#CorporateEvents",
    postingTime: "08:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Enquire Now"
  },
  {
    id: "mc_13",
    date: "2026-06-13",
    day: "Saturday",
    contentType: "Reel",
    topic: "Top 5 Wedding Dishes",
    specialDay: "",
    viralIdea: "Fast transition dish reel",
    caption: "Top dishes everyone loves.",
    keywords: "Wedding Menu",
    hashtags: "#WeddingFood",
    postingTime: "11:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Comment Favorite Dish"
  },
  {
    id: "mc_14",
    date: "2026-06-14",
    day: "Sunday",
    contentType: "Poster",
    topic: "Healthy Vegetarian Meals",
    specialDay: "International Yoga Day",
    viralIdea: "Healthy South Indian vegetarian meal poster",
    caption: "Healthy living begins with healthy food choices.",
    keywords: "Healthy Vegetarian Meals",
    hashtags: "#YogaDay",
    postingTime: "08:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Enquire Today"
  },
  {
    id: "mc_15",
    date: "2026-06-15",
    day: "Monday",
    contentType: "Poster",
    topic: "Customer Reviews",
    specialDay: "",
    viralIdea: "Happy customer testimonial poster",
    caption: "Our customers remember our food forever.",
    keywords: "Best Caterers",
    hashtags: "#CustomerReview",
    postingTime: "01:00 PM",
    runAdCampaign: "NO",
    leadGoal: "Trust Building",
    cta: "Tag Friends"
  },
  {
    id: "mc_17",
    date: "2026-06-17",
    day: "Wednesday",
    contentType: "Reel",
    topic: "One Day With Catering Team",
    specialDay: "",
    viralIdea: "Day-in-life storytelling reel",
    caption: "The hard work behind every successful event.",
    keywords: "Catering Team",
    hashtags: "#BehindTheScenes",
    postingTime: "06:30 PM",
    runAdCampaign: "YES",
    leadGoal: "Brand Awareness",
    cta: "Follow For More"
  },
  {
    id: "mc_18",
    date: "2026-06-18",
    day: "Thursday",
    contentType: "Poster",
    topic: "Booking Open 2026",
    specialDay: "",
    viralIdea: "Luxury booking announcement poster",
    caption: "2026 wedding bookings now open.",
    keywords: "Wedding Booking",
    hashtags: "#Wedding2026",
    postingTime: "07:00 PM",
    runAdCampaign: "YES",
    leadGoal: "High Intent Leads",
    cta: "WhatsApp Now"
  },
  {
    id: "mc_19",
    date: "2026-06-19",
    day: "Friday",
    contentType: "Poster",
    topic: "Festival Catering",
    specialDay: "",
    viralIdea: "Colorful festive meal visuals",
    caption: "Celebrate festivals with authentic flavors.",
    keywords: "Festival Catering",
    hashtags: "#FestivalFood",
    postingTime: "08:00 AM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Book Event"
  },
  {
    id: "mc_20",
    date: "2026-06-20",
    day: "Saturday",
    contentType: "Poster",
    topic: "Live Counter",
    specialDay: "",
    viralIdea: "Interactive dosa/live food station",
    caption: "Live counters your guests will love.",
    keywords: "Live Counter",
    hashtags: "#LiveCounter",
    postingTime: "07:00 PM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Book Now"
  },
  {
    id: "mc_22",
    date: "2026-06-22",
    day: "Monday",
    contentType: "Poster",
    topic: "Brand Story",
    specialDay: "",
    viralIdea: "Founder story premium design",
    caption: "Serving happiness through food.",
    keywords: "Premium Catering",
    hashtags: "#BrandStory",
    postingTime: "01:00 PM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "Follow Us"
  },
  {
    id: "mc_23",
    date: "2026-06-23",
    day: "Tuesday",
    contentType: "Poster",
    topic: "Signature Dishes",
    specialDay: "",
    viralIdea: "Premium food collage design",
    caption: "Taste your guests will never forget.",
    keywords: "Signature Dishes",
    hashtags: "#FoodLovers",
    postingTime: "01:00 PM",
    runAdCampaign: "NO",
    leadGoal: "-",
    cta: "DM Menu"
  },
  {
    id: "mc_24",
    date: "2026-06-24",
    day: "Wednesday",
    contentType: "Poster",
    topic: "Wedding Season Booking",
    specialDay: "",
    viralIdea: "Urgency countdown poster",
    caption: "Prime wedding dates are filling fast.",
    keywords: "Wedding Booking",
    hashtags: "#WeddingSeason",
    postingTime: "07:00 PM",
    runAdCampaign: "YES",
    leadGoal: "Urgent Leads",
    cta: "Reserve Today"
  }
];

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
}

interface GeneratedDoc {
  id: string;
  templateId: string;
  entityType: string;
  entityId: string;
  filePath: string;
  status: string;
  createdAt: string;
  template?: {
    name: string;
    category: string;
  };
}

const recentDocsAdmin = [
  { name: "SOW - Project Alpha.pdf", type: "Statement of Work", date: "2 mins ago", status: "Generated" },
  { name: "NDA - Global Tech.pdf", type: "NDA", date: "15 mins ago", status: "Signed" },
  { name: "Invoice #8291.pdf", type: "Invoice", date: "1 hour ago", status: "Sent" },
  { name: "Offer Letter - Sarah.pdf", type: "Offer Letter", date: "3 hours ago", status: "Generated" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isClient = user?.role === "user";

  // Client States
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<GeneratedDoc[]>([]);
  const [loading, setLoading] = useState(isClient);
  const [error, setError] = useState<string | null>(null);
  
  // Credentials States
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [instaUser, setInstaUser] = useState("");
  const [instaPass, setInstaPass] = useState("");
  const [submittingCreds, setSubmittingCreds] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Content Calendar Tracking States
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-06");
  const [contentItems, setContentItems] = useState<ContentSheetItem[]>([]);
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, 'inprogress' | 'completed' | 'posted'>>({});
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'fb' | 'youtube'>('instagram');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'posted' | 'completed' | 'inprogress'>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Sync Content Calendar data and statuses from LocalStorage for the active client project
  useEffect(() => {
    if (!activeProject) return;

    const storageKeyItems = `higerp_sheet_items_${activeProject.id}_${selectedMonth}`;
    const storageKeyStatuses = `higerp_sheet_statuses_${activeProject.id}_${selectedMonth}`;

    const savedItems = localStorage.getItem(storageKeyItems);
    const savedStatuses = localStorage.getItem(storageKeyStatuses);

    if (savedItems) {
      try {
        setContentItems(JSON.parse(savedItems));
      } catch (_) {
        setContentItems([]);
      }
    } else {
      if (activeProject.name.toLowerCase().includes('catering') || activeProject.id === 'maharaja-catering-fallback-id') {
        setContentItems(MAHARAJA_CATERING_DATA);
      } else {
        setContentItems([]);
      }
    }

    if (savedStatuses) {
      try {
        setPlatformStatuses(JSON.parse(savedStatuses));
      } catch (_) {
        setPlatformStatuses({});
      }
    } else {
      if (activeProject.name.toLowerCase().includes('catering') || activeProject.id === 'maharaja-catering-fallback-id') {
        const initialMap: Record<string, 'inprogress' | 'completed' | 'posted'> = {};
        MAHARAJA_CATERING_DATA.forEach((item, idx) => {
          if (idx < 5) {
            initialMap[`${item.id}_instagram`] = 'posted';
            initialMap[`${item.id}_fb`] = 'posted';
            initialMap[`${item.id}_youtube`] = 'completed';
          } else if (idx < 10) {
            initialMap[`${item.id}_instagram`] = 'completed';
            initialMap[`${item.id}_fb`] = 'inprogress';
            initialMap[`${item.id}_youtube`] = 'inprogress';
          } else {
            initialMap[`${item.id}_instagram`] = 'inprogress';
            initialMap[`${item.id}_fb`] = 'inprogress';
            initialMap[`${item.id}_youtube`] = 'inprogress';
          }
        });
        setPlatformStatuses(initialMap);
      } else {
        setPlatformStatuses({});
      }
    }
  }, [activeProject, selectedMonth]);

  useEffect(() => {
    if (isClient) {
      fetchClientData();
    }
  }, [isClient, user]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all projects and filter by this client's user ID
      const allProjects = await fetchWithAuth('/projects');
      const filtered = allProjects.filter((p: Project) => p.clientId === user?.id);
      setProjects(filtered);

      if (filtered.length > 0) {
        const proj = filtered[0];
        setActiveProject(proj);

        // Pre-fill existing credentials if present
        if (proj.socialCredentials?.instagram) {
          setInstaUser(proj.socialCredentials.instagram.username || "");
          setInstaPass(proj.socialCredentials.instagram.password || "");
        }

        // Fetch generated documents for this client's project
        const docs = await fetchWithAuth(`/document/entity/PROJECT/${proj.id}`);
        setProjectDocs(docs);
      }
    } catch (err) {
      console.error("Failed to load client workspace data:", err);
      setError("Unable to retrieve project pipeline. Please contact your project manager.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      setSubmittingCreds(true);
      setCredsSuccess(false);

      const payload = {
        socialCredentials: {
          instagram: {
            username: instaUser,
            password: instaPass,
          }
        }
      };

      await fetchWithAuth(`/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setCredsSuccess(true);
      
      // Update local state
      setActiveProject({
        ...activeProject,
        socialCredentials: payload.socialCredentials
      });

      // Clear success indicator after a brief delay
      setTimeout(() => setCredsSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to store credentials securely:", err);
      alert("Error saving account credentials. Try again or contact support.");
    } finally {
      setSubmittingCreds(false);
    }
  };

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  // Rendering loading state for clients
  if (isClient && loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans">
          <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
          <p className="text-sm text-muted-foreground font-semibold">Loading secure client workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  // 1. CLIENT DASHBOARD LAYOUT
  if (isClient) {
    // Stats calculation
    const postersTotal = contentItems.filter(item => item.contentType === 'Poster').length;
    const postersDelivered = contentItems.filter(item => 
      item.contentType === 'Poster' && 
      (platformStatuses[`${item.id}_${activePlatform}`] === 'posted' || 
       platformStatuses[`${item.id}_${activePlatform}`] === 'completed')
    ).length;

    const reelsTotal = contentItems.filter(item => item.contentType === 'Reel').length;
    const reelsDelivered = contentItems.filter(item => 
      item.contentType === 'Reel' && 
      (platformStatuses[`${item.id}_${activePlatform}`] === 'posted' || 
       platformStatuses[`${item.id}_${activePlatform}`] === 'completed')
    ).length;

    const adCampaignsTotal = contentItems.filter(item => item.runAdCampaign === 'YES').length;
    const adCampaignsRunning = contentItems.filter(item => 
      item.runAdCampaign === 'YES' && 
      (platformStatuses[`${item.id}_${activePlatform}`] === 'posted' || 
       platformStatuses[`${item.id}_${activePlatform}`] === 'completed')
    ).length;

    // Filter items
    const filteredContentItems = contentItems.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.topic.toLowerCase().includes(searchLower) ||
        (item.caption && item.caption.toLowerCase().includes(searchLower)) ||
        (item.specialDay && item.specialDay.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
      if (statusFilter === 'all') return true;
      if (statusFilter === 'posted') return status === 'posted';
      if (statusFilter === 'completed') return status === 'completed';
      if (statusFilter === 'inprogress') return status === 'inprogress';

      return true;
    });

    const toggleItemExpanded = (id: string) => {
      setExpandedItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    return (
      <DashboardLayout>
        <div className="font-sans min-h-screen pb-12 space-y-8 bg-slate-50 -mx-8 -my-8 p-8 text-slate-800 border-l border-slate-200">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-indigo-600 animate-pulse" />
                Project Track
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Welcome back, <span className="font-bold text-indigo-600">{user?.username}</span>. Monitor daily plan content sheets, months, and publishing statuses below.
              </p>
            </div>
            {activeProject && (
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="relative flex items-center justify-center h-3 w-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500 relative" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Scope</p>
                  <p className="text-sm font-black text-slate-850">{activeProject.name}</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center border border-rose-200 shadow-sm">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {!activeProject ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-300 shadow-sm">
              <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Campaigns</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your account does not possess an active project scope yet. Once our team initializes your service plan, your details will display here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Sidebar / Controls */}
              <div className="space-y-6 lg:col-span-1">
                {/* Select Month and Project Card */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400/40 transition-all duration-300">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    Select Month
                  </h3>
                  
                  <div className="relative">
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => {
                        if (e.target.value) setSelectedMonth(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 hover:border-slate-300 transition-all duration-200 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Branded Platform Swapper (Instagram, Facebook, YouTube) */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tv className="h-4 w-4 text-indigo-500" />
                    Brand Platforms
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePlatform('instagram')}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
                        activePlatform === 'instagram'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white border-transparent shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <ClientInstagramIcon className="h-4.5 w-4.5" />
                        Instagram
                      </span>
                      {activePlatform === 'instagram' && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePlatform('fb')}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
                        activePlatform === 'fb'
                          ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white border-transparent shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <ClientFacebookIcon className="h-4.5 w-4.5" />
                        Facebook
                      </span>
                      {activePlatform === 'fb' && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePlatform('youtube')}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
                        activePlatform === 'youtube'
                          ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white border-transparent shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <ClientYouTubeIcon className="h-4.5 w-4.5" />
                        YouTube
                      </span>
                      {activePlatform === 'youtube' && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    Delivery Progress
                  </h3>

                  <div className="space-y-4">
                    {/* Posters Metrics */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-sky-500" />
                          Posters
                        </span>
                        <span className="font-extrabold text-slate-900">{postersDelivered} / {postersTotal}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${postersTotal > 0 ? (postersDelivered / postersTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Reels Metrics */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5 text-pink-500" />
                          Reels
                        </span>
                        <span className="font-extrabold text-slate-900">{reelsDelivered} / {reelsTotal}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${reelsTotal > 0 ? (reelsDelivered / reelsTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Ad Campaigns metrics */}
                    {adCampaignsTotal > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Tv className="h-3.5 w-3.5 text-amber-500" />
                            Ad Campaigns
                          </span>
                          <span className="font-extrabold text-slate-900">{adCampaignsRunning} / {adCampaignsTotal}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${adCampaignsTotal > 0 ? (adCampaignsRunning / adCampaignsTotal) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Daily Plan content list (TABULAR FORMAT) */}
              <div className="space-y-6 lg:col-span-2">
                {/* Search & Filter Header */}
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search calendar topics or captions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>

                    {/* Quick Stats Pill */}
                    <span className="inline-flex self-start sm:self-auto px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                      {filteredContentItems.length} Items Found
                    </span>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                        statusFilter === 'all'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('posted')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                        statusFilter === 'posted'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      🟢 Posted
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                        statusFilter === 'completed'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      🔵 Scheduled
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('inprogress')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                        statusFilter === 'inprogress'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      🟡 In Progress
                    </button>
                  </div>
                </div>

                {/* Tabular Column Wise Layout container */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-24">Date</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-20">Type</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">Topic</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-24">Time</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-24">Ad Promo</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-28">Status</th>
                          <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider w-24 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContentItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-20 text-slate-400">
                              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <h4 className="text-sm font-bold text-slate-700 mb-1">No Matching Content</h4>
                              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                No content entries match the selected filters or search queries.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredContentItems.map((item) => {
                            const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
                            const isExpanded = !!expandedItems[item.id];
                            
                            // Format date for table (e.g. 01 Jun)
                            const dateObj = new Date(item.date);
                            const dayNum = item.date.split('-')[2] || item.date;
                            const monthShort = item.date.split('-')[1] 
                              ? dateObj.toLocaleString('default', { month: 'short' }) 
                              : 'Jun';

                            return (
                              <React.Fragment key={item.id}>
                                <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                  {/* Date Column */}
                                  <td className="py-4 px-4 border-b border-slate-100">
                                    <div className="font-extrabold text-slate-800 text-xs">{dayNum} {monthShort}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold">{item.day.slice(0, 3)}</div>
                                  </td>

                                  {/* Type Column */}
                                  <td className="py-4 px-4 border-b border-slate-100">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                                      item.contentType === 'Reel' 
                                        ? 'bg-pink-50 text-pink-700 border-pink-100' 
                                        : 'bg-sky-50 text-sky-700 border-sky-100'
                                    }`}>
                                      {item.contentType}
                                    </span>
                                  </td>

                                  {/* Topic Column */}
                                  <td className="py-4 px-4 border-b border-slate-100 max-w-xs">
                                    <div className="font-bold text-slate-800 text-xs truncate" title={item.topic}>
                                      {item.topic}
                                    </div>
                                    {item.specialDay && (
                                      <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.2 mt-1 rounded text-[8px] font-black uppercase tracking-wider">
                                        ✨ {item.specialDay}
                                      </span>
                                    )}
                                  </td>

                                  {/* Time Column */}
                                  <td className="py-4 px-4 border-b border-slate-100 text-[11px] font-bold text-slate-600">
                                    {item.postingTime}
                                  </td>

                                  {/* Ad Promo Column */}
                                  <td className="py-4 px-4 border-b border-slate-100">
                                    <span className={`text-[10px] font-black uppercase ${
                                      item.runAdCampaign === 'YES' 
                                        ? 'text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md' 
                                        : 'text-slate-400'
                                    }`}>
                                      {item.runAdCampaign === 'YES' ? 'Yes' : 'No'}
                                    </span>
                                  </td>

                                  {/* Status Column */}
                                  <td className="py-4 px-4 border-b border-slate-100">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                      status === 'posted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                      status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                      'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        status === 'posted' ? 'bg-emerald-500' :
                                        status === 'completed' ? 'bg-blue-500' :
                                        'bg-amber-500'
                                      }`} />
                                      {status === 'posted' ? 'Posted' : status === 'completed' ? 'Scheduled' : 'In Progress'}
                                    </span>
                                  </td>

                                  {/* Action Column */}
                                  <td className="py-4 px-4 border-b border-slate-100 text-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleItemExpanded(item.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                                    >
                                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Table Drawer Row */}
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={7} className="bg-slate-50/70 border-b border-slate-200 p-5">
                                      <div className="space-y-4 text-left max-w-4xl">
                                        {item.caption && (
                                          <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caption Content</p>
                                            <p className="text-xs text-slate-800 italic font-medium bg-white p-3 rounded-xl border border-slate-200 leading-relaxed shadow-sm">
                                              "{item.caption}"
                                            </p>
                                          </div>
                                        )}

                                        {item.viralIdea && (
                                          <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Viral Content Direction</p>
                                            <p className="text-xs text-slate-800 font-semibold bg-white p-3 rounded-xl border border-slate-200 leading-relaxed shadow-sm">
                                              {item.viralIdea}
                                            </p>
                                          </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Keywords & Hashtags */}
                                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                            {item.keywords && (
                                              <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Target Keywords</p>
                                                <p className="text-xs text-slate-700 font-medium">{item.keywords}</p>
                                              </div>
                                            )}
                                            {item.hashtags && (
                                              <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Optimized Hashtags</p>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                  {item.hashtags.split(' ').map((tag, tIdx) => tag && (
                                                    <span key={tIdx} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Paid Ad Details */}
                                          {item.runAdCampaign === 'YES' && (
                                            <div className="space-y-3 bg-gradient-to-r from-indigo-50 to-transparent p-4 rounded-xl border border-indigo-100/60">
                                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">🎯 Ad Campaign Details</p>
                                              <div className="space-y-1.5 text-xs">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-slate-500 font-medium">Lead Goal:</span>
                                                  <span className="font-bold text-slate-800">{item.leadGoal}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-slate-500 font-medium">Action Link / CTA:</span>
                                                  <span className="font-black text-indigo-600">{item.cta}</span>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // 2. ADMIN/SUPERADMIN DASHBOARD LAYOUT (CURRENT STANDARD)
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 font-inter">
            Welcome back, <span className="font-bold text-primary">{user?.username || 'Guest'}</span>. Here's what's happening today.
          </p>
        </div>

        {/* Profile & Designation Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-3xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Designation</p>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {user?.designation || (
                  <span className="text-muted-foreground italic font-normal">Pending Designation Allocation</span>
                )}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Compensation</p>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {user?.salary ? (
                  `$${Number(user.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                ) : (
                  <span className="text-muted-foreground italic font-normal">Pending Salary Calculation</span>
                )}
              </h3>
            </div>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Automated Documents */}
          <div className="lg:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Recent Automation</h2>
              <button className="text-sm font-semibold text-accent hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentDocsAdmin.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm mr-4">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs font-bold text-emerald-500 mb-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {doc.status}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {doc.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-primary rounded-3xl p-8 text-background shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            <h2 className="text-xl font-bold mb-4">AI Insights</h2>
            <div className="space-y-6 relative z-10">
              <div className="p-4 rounded-2xl bg-background/10 backdrop-blur-md border border-background/10">
                <p className="text-sm font-semibold text-accent mb-1">Revenue Forecast</p>
                <p className="text-xs text-background/70">Projected 12% growth next month based on current CRM pipeline.</p>
              </div>
              <div className="p-4 rounded-2xl bg-background/10 backdrop-blur-md border border-background/10">
                <p className="text-sm font-semibold text-accent mb-1">Support Load</p>
                <p className="text-xs text-background/70">Ticket volume is down 5%. AI summaries have saved 14 hours of agent time.</p>
              </div>
              <button className="w-full py-3 rounded-xl bg-accent text-primary font-bold text-sm hover:scale-[1.02] transition-transform">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TrendingUp({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
