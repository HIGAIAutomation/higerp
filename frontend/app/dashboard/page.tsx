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
  Image as ImageIcon,
  IndianRupee,
  Pencil,
  X,
  Save,
  Undo,
  Plus,
  Trash2,
  Upload
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
  const isClient = user?.role === "user" || user?.role === "client";

  // Client States
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDocs, setProjectDocs] = useState<GeneratedDoc[]>([]);
  const [loading, setLoading] = useState(isClient);
  const [error, setError] = useState<string | null>(null);

  // Birthday Wishes States
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);

  const checkIsBirthday = () => {
    if (!user?.dob) return false;
    try {
      const today = new Date();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      
      const cleanDob = user.dob.trim().replace(/\//g, '-');
      const parts = cleanDob.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return parts[1] === todayMonth && parts[2] === todayDay;
        } else {
          return parts[1] === todayMonth && parts[0] === todayDay;
        }
      } else if (parts.length === 2) {
        return parts[0] === todayMonth && parts[1] === todayDay;
      }
    } catch (e) {
      console.error("Error parsing DOB:", e);
    }
    return false;
  };

  useEffect(() => {
    if (user?.dob) {
      const birthdayToday = checkIsBirthday();
      setIsBirthdayToday(birthdayToday);
      
      const dismissed = sessionStorage.getItem(`birthday_dismissed_${user.id}`);
      if (birthdayToday && !dismissed) {
        setShowBirthdayModal(true);
      }
    }
  }, [user]);

  const renderBirthdayModal = () => {
    if (!showBirthdayModal || !user) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-900 text-white rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="absolute top-8 left-8 text-pink-400 text-3xl animate-bounce">🎈</div>
          <div className="absolute top-12 right-12 text-purple-400 text-3xl animate-bounce delay-150">🎉</div>
          <div className="absolute bottom-16 left-16 text-yellow-450 text-3xl animate-bounce delay-300">🎂</div>
          <div className="absolute bottom-12 right-12 text-sky-400 text-3xl animate-bounce delay-75">🎁</div>

          <div className="space-y-6 my-6">
            <div className="inline-flex p-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
              <span className="text-5xl animate-bounce">👑</span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
              HAPPY BIRTHDAY!
            </h1>
            
            <div className="h-1 bg-amber-500/40 w-32 mx-auto rounded-full" />

            <h2 className="text-3xl font-extrabold capitalize text-white tracking-wide">
              {user.username}
            </h2>

            {user.designation && (
              <p className="text-indigo-300 text-sm font-semibold tracking-wider uppercase">
                {user.designation}
              </p>
            )}

            <p className="text-slate-200 text-base max-w-md mx-auto leading-relaxed font-inter font-medium pt-2">
              HIG AI Automation LLP wishes you a wonderful birthday! May your day be filled with celebration, joy, and a fantastic year of accomplishments ahead. 🌟
            </p>
          </div>

          <button
            onClick={() => {
              setShowBirthdayModal(false);
              sessionStorage.setItem(`birthday_dismissed_${user.id}`, 'true');
            }}
            className="mt-6 px-8 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Thank You! 🎉
          </button>
        </div>
      </div>
    );
  };
  
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
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'month'>('today');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("2026-06-01");

  // Keep selectedDateFilter aligned with selectedMonth if month changes
  useEffect(() => {
    if (selectedMonth && selectedDateFilter) {
      const monthPart = selectedDateFilter.slice(0, 7);
      if (monthPart !== selectedMonth) {
        setSelectedDateFilter(`${selectedMonth}-01`);
      }
    }
  }, [selectedMonth]);

  // Set today's local date dynamically after hydration to avoid mismatch
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localTodayStr = `${yyyy}-${mm}-${dd}`;
    setSelectedDateFilter(localTodayStr);
    setSelectedMonth(`${yyyy}-${mm}`);
  }, []);

  // View state and editing states
  const [currentView, setCurrentView] = useState<'content-sheet' | 'daily-status'>('daily-status');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContentSheetItem>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, 'inprogress' | 'running'>>({});

  const saveStateToStorage = async (
    items: ContentSheetItem[],
    statuses: Record<string, 'inprogress' | 'completed' | 'posted'>,
    campaigns: Record<string, 'inprogress' | 'running'> = campaignStatuses
  ) => {
    if (!activeProject) return;

    try {
      await fetchWithAuth(`/marketing/${activeProject.id}/sheets?month=${selectedMonth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          statuses,
          campaigns
        }),
      });
    } catch (err) {
      console.error('Failed to save content sheet to backend database:', err);
    }
  };

  const getSeededDataForMonth = (targetMonth: string): ContentSheetItem[] => {
    return MAHARAJA_CATERING_DATA.map(item => {
      const dayStr = item.date.split('-')[2] || '01';
      const newDate = `${targetMonth}-${dayStr}`;
      let newDay = item.day;
      try {
        const dateObj = new Date(newDate);
        if (!isNaN(dateObj.getTime())) {
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          newDay = daysOfWeek[dateObj.getDay()];
        }
      } catch (e) {
        console.error("Error calculating day for", newDate, e);
      }
      return {
        ...item,
        date: newDate,
        day: newDay
      };
    });
  };

  // Sync Content Calendar data and statuses from backend for the active client project
  useEffect(() => {
    if (!activeProject) return;

    const fetchSheetData = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/marketing/${activeProject.id}/sheets?month=${selectedMonth}`);
        if (data && data.items && data.items.length > 0) {
          setContentItems(data.items || []);
          setPlatformStatuses(data.statuses || {});
          setCampaignStatuses(data.campaigns || {});
        } else {
          // Fallback if no sheet in DB yet
          if (activeProject.name.toLowerCase().includes('catering') || activeProject.id === 'maharaja-catering-fallback-id') {
            const seededData = getSeededDataForMonth(selectedMonth);
            setContentItems(seededData);
            
            // Seed clean initial statuses (all in progress for a new month/clean slate)
            const initialMap: Record<string, 'inprogress' | 'completed' | 'posted'> = {};
            const initialCampMap: Record<string, 'inprogress' | 'running'> = {};
            seededData.forEach((item) => {
              initialMap[`${item.id}_instagram`] = 'inprogress';
              initialMap[`${item.id}_fb`] = 'inprogress';
              initialMap[`${item.id}_youtube`] = 'inprogress';
              if (item.runAdCampaign === 'YES') {
                initialCampMap[item.id] = 'inprogress';
              }
            });
            setPlatformStatuses(initialMap);
            setCampaignStatuses(initialCampMap);
            
            // Proactively save to DB so it persists
            await saveStateToStorage(seededData, initialMap, initialCampMap);
          } else {
            setContentItems([]);
            setPlatformStatuses({});
            setCampaignStatuses({});
          }
        }
      } catch (err) {
        console.error("Failed to load sheet from backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, [activeProject, selectedMonth]);

  // Row Edit Handlers for Client
  const handleStartEdit = (item: ContentSheetItem) => {
    setEditingItemId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItemId) return;
    const nextItems = contentItems.map(item => 
      item.id === editingItemId ? { ...item, ...editForm } as ContentSheetItem : item
    );
    setContentItems(nextItems);
    setEditingItemId(null);
    setEditForm({});
    await saveStateToStorage(nextItems, platformStatuses, campaignStatuses);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm({});
  };

  // Individual Add, Delete, Clear, and Export handlers for Client
  const handleDeleteRow = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this content row?")) return;
    const nextItems = contentItems.filter(item => item.id !== itemId);
    setContentItems(nextItems);
    await saveStateToStorage(nextItems, platformStatuses, campaignStatuses);
  };

  const handleAddNewRow = async () => {
    const newId = `mc_new_${Date.now()}`;
    
    // Auto-calculate next date based on last item or default to today's date formatted as YYYY-MM-DD
    let nextDate = new Date().toISOString().split('T')[0];
    if (contentItems.length > 0) {
      const lastDateStr = contentItems[contentItems.length - 1].date;
      try {
        const d = new Date(lastDateStr);
        d.setDate(d.getDate() + 1);
        if (!isNaN(d.getTime())) {
          nextDate = d.toISOString().split('T')[0];
        }
      } catch (_) {}
    } else {
      nextDate = `${selectedMonth}-01`;
    }
    
    const dObj = new Date(nextDate);
    const dayName = !isNaN(dObj.getTime()) ? dObj.toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday';

    const newItem: ContentSheetItem = {
      id: newId,
      date: nextDate,
      day: dayName,
      contentType: 'Poster',
      topic: 'New Campaign Topic',
      specialDay: '',
      viralIdea: '',
      caption: '',
      keywords: '',
      hashtags: '',
      postingTime: '07:00 PM',
      runAdCampaign: 'NO',
      leadGoal: '-',
      cta: ''
    };
    
    const nextItems = [...contentItems, newItem];
    setContentItems(nextItems);
    setEditingItemId(newId);
    setEditForm(newItem);
    await saveStateToStorage(nextItems, platformStatuses, campaignStatuses);
  };

  const handleClearData = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete the entire content sheet for this month. Are you sure you want to proceed?")) return;
    setContentItems([]);
    await saveStateToStorage([], platformStatuses, campaignStatuses);
  };

  const handleDownloadCsvSheet = () => {
    if (contentItems.length === 0) return;
    
    const headers = [
      "Date",
      "Day",
      "Content Type",
      "Topic",
      "Special Day",
      "Content / Viral Idea",
      "Caption",
      "Keywords",
      "Hashtags",
      "Posting Time",
      "Run Ad Campaign",
      "Lead Goal",
      "CTA"
    ];
    
    const rows = contentItems.map(item => [
      item.date,
      item.day,
      item.contentType,
      item.topic,
      item.specialDay || "",
      item.viralIdea || "",
      item.caption || "",
      item.keywords || "",
      item.hashtags || "",
      item.postingTime || "",
      item.runAdCampaign,
      item.leadGoal || "",
      item.cta || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `content_sheet_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust Client-Side CSV Parser
  const parseCSVText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const parseCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(v => v.replace(/^["']|["']$/g, '').trim());
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    const parsedRows: ContentSheetItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);

      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

      const getValueByHeader = (name: string, fallbackIdx: number) => {
        const idx = headers.findIndex(h => h.includes(name.toLowerCase()));
        return idx !== -1 && values[idx] !== undefined ? values[idx] : (values[fallbackIdx] || '');
      };

      const date = getValueByHeader('date', 0) || new Date().toISOString().split('T')[0];
      const day = getValueByHeader('day', 1) || 'Monday';
      const contentType = getValueByHeader('content type', 2) || getValueByHeader('type', 2) || 'Poster';
      const topic = getValueByHeader('topic', 3) || 'Untitled Content';
      const specialDay = getValueByHeader('special day', 4) || '';
      const viralIdea = getValueByHeader('viral idea', 5) || getValueByHeader('content / viral idea', 5) || getValueByHeader('idea', 5) || '';
      const caption = getValueByHeader('caption', 6) || '';
      const keywords = getValueByHeader('keywords', 7) || '';
      const hashtags = getValueByHeader('hashtags', 8) || '';
      const postingTime = getValueByHeader('posting time', 9) || getValueByHeader('time', 9) || '07:00 PM';
      const runAdCampaign = getValueByHeader('run ad campaign', 10) || getValueByHeader('campaign', 10) || 'NO';
      const leadGoal = getValueByHeader('lead goal', 11) || getValueByHeader('goal', 11) || '-';
      const cta = getValueByHeader('cta', 12) || '';

      parsedRows.push({
        id: `csv_${i}_${Date.now()}`,
        date,
        day,
        contentType: contentType.toLowerCase().includes('reel') ? 'Reel' : 'Poster',
        topic,
        specialDay,
        viralIdea,
        caption,
        keywords,
        hashtags,
        postingTime,
        runAdCampaign: runAdCampaign.toUpperCase().includes('YES') || runAdCampaign.toUpperCase() === 'Y' ? 'YES' : 'NO',
        leadGoal,
        cta
      });
    }

    return parsedRows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const parsed = parseCSVText(text);
          if (parsed.length > 0) {
            setContentItems(parsed);
            
            // Set statuses clean slate
            const initialMap: Record<string, 'inprogress' | 'completed' | 'posted'> = {};
            const initialCampMap: Record<string, 'inprogress' | 'running'> = {};
            parsed.forEach((item) => {
              initialMap[`${item.id}_instagram`] = 'inprogress';
              initialMap[`${item.id}_fb`] = 'inprogress';
              initialMap[`${item.id}_youtube`] = 'inprogress';
              if (item.runAdCampaign === 'YES') {
                initialCampMap[item.id] = 'inprogress';
              }
            });
            setPlatformStatuses(initialMap);
            setCampaignStatuses(initialCampMap);
            await saveStateToStorage(parsed, initialMap, initialCampMap);
          } else {
            alert('Could not parse any valid rows. Please check headers: Date, Day, Content Type, Topic...');
          }
        }
      };
      reader.readAsText(file);
    }
  };

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
      <DashboardLayout fullWidth={true}>
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
      if (statusFilter !== 'all') {
        if (statusFilter === 'posted' && status !== 'posted') return false;
        if (statusFilter === 'completed' && status !== 'completed') return false;
        if (statusFilter === 'inprogress' && status !== 'inprogress') return false;
      }

      // Date Filter Mode (filters by selectedDateFilter when today mode is active)
      if (dateFilterMode === 'today') {
        const targetDate = selectedDateFilter || (() => {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        })();
        
        const normalizeDateStr = (dStr: string) => {
          if (!dStr) return '';
          const cleanStr = dStr.split('T')[0];
          const parts = cleanStr.split(/[-/]/);
          if (parts.length === 3) {
            // Check for DD-MM-YYYY or DD/MM/YYYY
            if (parts[0].length <= 2 && parts[2].length === 4 && !isNaN(Number(parts[1]))) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            // Check for YYYY-MM-DD or YYYY/MM/DD
            if (parts[0].length === 4 && !isNaN(Number(parts[1]))) {
              return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
          }
          // Fallback parsing
          try {
            const d = new Date(cleanStr);
            if (!isNaN(d.getTime())) {
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
          } catch(e) {}
          return cleanStr;
        };

        const targetStr = normalizeDateStr(targetDate);
        const itemStr = normalizeDateStr(item.date);
        
        if (itemStr !== targetStr) return false;
      }

      return true;
    });

    const toggleItemExpanded = (id: string) => {
      setExpandedItems(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    return (
      <DashboardLayout fullWidth={true}>
        {renderBirthdayModal()}
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
            <div className="flex flex-wrap items-center gap-4">
              {/* View Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">View Mode:</label>
                <select
                  value={currentView}
                  onChange={(e) => {
                    setCurrentView(e.target.value as 'content-sheet' | 'daily-status');
                    setEditingItemId(null);
                    setEditForm({});
                  }}
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-2xl py-2.5 px-4 text-xs font-extrabold shadow-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="content-sheet">📄 Content Sheet View</option>
                  <option value="daily-status">📊 Daily Process / Status View</option>
                </select>
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
          ) : currentView === 'content-sheet' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Search, Upload, Export, Add, and Clear Action Deck for Content Sheet */}
              <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Month Selector */}
                    <div className="relative w-44">
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                          if (e.target.value) setSelectedMonth(e.target.value);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      />
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-4 top-3.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search calendar topic, caption, hashtags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Actions Deck */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* CSV Upload */}
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Sheet
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>

                    {/* CSV Export */}
                    <button
                      type="button"
                      onClick={handleDownloadCsvSheet}
                      disabled={contentItems.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export Calendar
                    </button>

                    {/* Add Content Row */}
                    <button
                      type="button"
                      onClick={handleAddNewRow}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Row
                    </button>

                    {/* Clear Sheet */}
                    <button
                      type="button"
                      onClick={handleClearData}
                      disabled={contentItems.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear Sheet
                    </button>

                    {/* Quick Stats Pill */}
                    <span className="inline-flex px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-indigo-600 tracking-wider shadow-sm">
                      {contentItems.filter(item => {
                        const query = searchQuery.toLowerCase();
                        return item.topic.toLowerCase().includes(query) ||
                          (item.caption && item.caption.toLowerCase().includes(query)) ||
                          (item.hashtags && item.hashtags.toLowerCase().includes(query)) ||
                          (item.specialDay && item.specialDay.toLowerCase().includes(query));
                      }).length} Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Sheet Table */}
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1400px]">
                    <thead>
                      <tr className="bg-[#E8F1D7]">
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-32">Date</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-24">Day</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-24">Type</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-48">Topic</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-36">Special Day</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-64">Viral Idea</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-80">Caption</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-40">Keywords</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-48">Hashtags</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-28">Time</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-24">Ad Promo</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-32">Lead Goal</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-32">CTA</th>
                        <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-wider w-28 text-center sticky right-0 bg-[#E8F1D7] shadow-l border-l border-slate-200">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentItems.filter(item => {
                        const query = searchQuery.toLowerCase();
                        return item.topic.toLowerCase().includes(query) ||
                          (item.caption && item.caption.toLowerCase().includes(query)) ||
                          (item.hashtags && item.hashtags.toLowerCase().includes(query)) ||
                          (item.specialDay && item.specialDay.toLowerCase().includes(query));
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={14} className="text-center py-20 text-slate-400">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-sm font-bold text-slate-700 mb-1">No Matching Content Items</h4>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                              Try adjusting your search query or select another month.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        contentItems.filter(item => {
                          const query = searchQuery.toLowerCase();
                          return item.topic.toLowerCase().includes(query) ||
                            (item.caption && item.caption.toLowerCase().includes(query)) ||
                            (item.hashtags && item.hashtags.toLowerCase().includes(query)) ||
                            (item.specialDay && item.specialDay.toLowerCase().includes(query));
                        }).map((item) => {
                          const isEditing = editingItemId === item.id;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                              {isEditing ? (
                                <>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="date" 
                                      value={editForm.date || ''} 
                                      onChange={e => setEditForm({ ...editForm, date: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <select 
                                      value={editForm.day || ''} 
                                      onChange={e => setEditForm({ ...editForm, day: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                    >
                                      <option value="Monday">Monday</option>
                                      <option value="Tuesday">Tuesday</option>
                                      <option value="Wednesday">Wednesday</option>
                                      <option value="Thursday">Thursday</option>
                                      <option value="Friday">Friday</option>
                                      <option value="Saturday">Saturday</option>
                                      <option value="Sunday">Sunday</option>
                                    </select>
                                  </td>
                                  <td className="py-2 px-2">
                                    <select 
                                      value={editForm.contentType || 'Poster'} 
                                      onChange={e => setEditForm({ ...editForm, contentType: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                    >
                                      <option value="Poster">Poster</option>
                                      <option value="Reel">Reel</option>
                                    </select>
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.topic || ''} 
                                      onChange={e => setEditForm({ ...editForm, topic: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.specialDay || ''} 
                                      onChange={e => setEditForm({ ...editForm, specialDay: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <textarea 
                                      value={editForm.viralIdea || ''} 
                                      onChange={e => setEditForm({ ...editForm, viralIdea: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold min-h-[60px]"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <textarea 
                                      value={editForm.caption || ''} 
                                      onChange={e => setEditForm({ ...editForm, caption: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium min-h-[60px] leading-relaxed"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.keywords || ''} 
                                      onChange={e => setEditForm({ ...editForm, keywords: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <textarea 
                                      value={editForm.hashtags || ''} 
                                      onChange={e => setEditForm({ ...editForm, hashtags: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium min-h-[60px]"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.postingTime || ''} 
                                      onChange={e => setEditForm({ ...editForm, postingTime: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <select 
                                      value={editForm.runAdCampaign || 'NO'} 
                                      onChange={e => setEditForm({ ...editForm, runAdCampaign: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                    >
                                      <option value="YES">YES</option>
                                      <option value="NO">NO</option>
                                    </select>
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.leadGoal || ''} 
                                      onChange={e => setEditForm({ ...editForm, leadGoal: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input 
                                      type="text" 
                                      value={editForm.cta || ''} 
                                      onChange={e => setEditForm({ ...editForm, cta: e.target.value })} 
                                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center sticky right-0 bg-slate-50 border-l border-slate-200 shadow-l flex items-center justify-center gap-1 min-h-[76px]">
                                    <button 
                                      type="button" 
                                      onClick={handleSaveEdit} 
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
                                      title="Save Row"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={handleCancelEdit} 
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                                      title="Cancel Changes"
                                    >
                                      <Undo className="h-4 w-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-4 px-4 font-extrabold text-slate-800 text-xs">{item.date}</td>
                                  <td className="py-4 px-4 font-bold text-slate-600 text-xs">{item.day}</td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                                      item.contentType === 'Reel' 
                                        ? 'bg-pink-50 text-pink-700 border-pink-100' 
                                        : 'bg-sky-50 text-sky-700 border-sky-100'
                                      }`}>
                                      {item.contentType}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-bold text-slate-800 text-xs max-w-[200px] truncate" title={item.topic}>{item.topic}</td>
                                  <td className="py-4 px-4">
                                    {item.specialDay ? (
                                      <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                                        ✨ {item.specialDay}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="py-4 px-4 text-xs font-semibold text-slate-700 max-w-[250px] truncate" title={item.viralIdea}>{item.viralIdea}</td>
                                  <td className="py-4 px-4 text-xs font-medium text-slate-600 max-w-[320px] truncate leading-relaxed" title={item.caption}>{item.caption}</td>
                                  <td className="py-4 px-4 text-xs font-semibold text-slate-500 max-w-[150px] truncate" title={item.keywords}>{item.keywords || '-'}</td>
                                  <td className="py-4 px-4 text-xs font-medium text-indigo-600 max-w-[200px] truncate" title={item.hashtags}>{item.hashtags || '-'}</td>
                                  <td className="py-4 px-4 text-xs font-bold text-slate-600">{item.postingTime}</td>
                                  <td className="py-4 px-4">
                                    <span className={`text-[10px] font-black uppercase ${
                                      item.runAdCampaign === 'YES' 
                                        ? 'text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md' 
                                        : 'text-slate-400'
                                    }`}>
                                      {item.runAdCampaign === 'YES' ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-xs font-bold text-slate-600">{item.leadGoal || '-'}</td>
                                  <td className="py-4 px-4 text-xs font-black text-indigo-600">{item.cta || '-'}</td>
                                  <td className="py-4 px-4 text-center sticky right-0 bg-white border-l border-slate-200 shadow-l flex items-center justify-center gap-1.5">
                                    <button 
                                      type="button" 
                                      onClick={() => handleStartEdit(item)} 
                                      className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 cursor-pointer transition-colors"
                                      title="Edit Row"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeleteRow(item.id)} 
                                      className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

                  {/* Date & Status Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                    {/* Date Scope Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const yyyy = today.getFullYear();
                          const mm = String(today.getMonth() + 1).padStart(2, '0');
                          const dd = String(today.getDate()).padStart(2, '0');
                          setSelectedDateFilter(`${yyyy}-${mm}-${dd}`);
                          setDateFilterMode('today');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                          dateFilterMode === 'today' && selectedDateFilter === (() => {
                            const today = new Date();
                            const yyyy = today.getFullYear();
                            const mm = String(today.getMonth() + 1).padStart(2, '0');
                            const dd = String(today.getDate()).padStart(2, '0');
                            return `${yyyy}-${mm}-${dd}`;
                          })()
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        📅 Today's Post Only
                      </button>

                      {/* Select Specific Date input box */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Date:</span>
                        <input
                          type="date"
                          value={selectedDateFilter}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedDateFilter(e.target.value);
                              setDateFilterMode('today');
                            }
                          }}
                          className="bg-transparent border-none text-[10px] font-black uppercase text-indigo-650 focus:outline-none cursor-pointer w-32"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setDateFilterMode('month')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                          dateFilterMode === 'month'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        📅 Full Month Calendar
                      </button>
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                          statusFilter === 'all'
                            ? 'bg-slate-105 text-indigo-600 border-indigo-200'
                            : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        All Statuses
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
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
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
                </div>

                {/* Daily Plan content list (TABULAR OR CARD FORMAT) */}
                {dateFilterMode === 'today' ? (
                  // BEAUTIFUL CARD FORMAT GRID
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {filteredContentItems.length === 0 ? (
                      <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-slate-200 shadow-sm text-slate-400">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-sm font-bold text-slate-700 mb-1">No Post Scheduled for Today</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          There is no content scheduled for today. You can select "Full Month Calendar" to view other days.
                        </p>
                        <div className="mt-4 p-4 bg-slate-100 rounded text-left text-xs font-mono overflow-auto max-w-md mx-auto">
                          <strong>DEBUG INFO:</strong><br />
                          selectedDateFilter: {selectedDateFilter}<br />
                          targetDate: {selectedDateFilter || (() => {
                            const today = new Date();
                            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          })()}<br />
                          Total Items: {contentItems.length}<br />
                          Sample item date: {contentItems[0]?.date}<br />
                          targetStr: {(() => {
                            const dStr = selectedDateFilter || (() => {
                              const today = new Date();
                              return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            })();
                            if (!dStr) return '';
                            const cleanStr = dStr.split('T')[0];
                            const parts = cleanStr.split(/[-/]/);
                            if (parts.length === 3) {
                              if (parts[0].length <= 2 && parts[2].length === 4 && !isNaN(Number(parts[1]))) {
                                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                              }
                              if (parts[0].length === 4 && !isNaN(Number(parts[1]))) {
                                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                              }
                            }
                            return cleanStr;
                          })()}<br />
                          itemStr (first): {(() => {
                            const dStr = contentItems[0]?.date;
                            if (!dStr) return '';
                            const cleanStr = dStr.split('T')[0];
                            const parts = cleanStr.split(/[-/]/);
                            if (parts.length === 3) {
                              if (parts[0].length <= 2 && parts[2].length === 4 && !isNaN(Number(parts[1]))) {
                                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                              }
                              if (parts[0].length === 4 && !isNaN(Number(parts[1]))) {
                                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                              }
                            }
                            return cleanStr;
                          })()}
                        </div>
                      </div>
                    ) : (
                      filteredContentItems.map((item) => {
                        const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
                        
                        // Icon mapping
                        const getPlatformIcon = () => {
                          if (activePlatform === 'instagram') return <ClientInstagramIcon className="h-5 w-5" />;
                          if (activePlatform === 'fb') return <ClientFacebookIcon className="h-5 w-5" />;
                          return <ClientYouTubeIcon className="h-5 w-5" />;
                        };

                        const getPlatformGradient = () => {
                          if (activePlatform === 'instagram') return 'from-purple-600 via-pink-500 to-orange-400';
                          if (activePlatform === 'fb') return 'from-blue-700 to-blue-500';
                          return 'from-red-600 to-rose-500';
                        };

                        const getPlatformBg = () => {
                          if (activePlatform === 'instagram') return 'bg-gradient-to-tr from-purple-50/30 via-pink-50/20 to-orange-50/10 border-purple-200/60 hover:border-purple-300/80';
                          if (activePlatform === 'fb') return 'bg-gradient-to-tr from-blue-50/30 to-slate-50/10 border-blue-200/60 hover:border-blue-300/80';
                          return 'bg-gradient-to-tr from-red-50/30 to-slate-50/10 border-red-200/60 hover:border-red-300/80';
                        };

                        return (
                          <div 
                            key={item.id} 
                            className={`flex flex-col justify-between bg-white rounded-[32px] border ${getPlatformBg()} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group`}
                          >
                            {/* Card Content Top half */}
                            <div className="p-6 space-y-5">
                              
                              {/* Header: ContentType badge & Posting Time & Platform */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                                    item.contentType === 'Reel' 
                                      ? 'bg-pink-50 text-pink-700 border-pink-100' 
                                      : 'bg-sky-50 text-sky-700 border-sky-100'
                                  }`}>
                                    {item.contentType === 'Reel' ? <Play className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                                    {item.contentType}
                                  </span>
                                  
                                  <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-slate-600">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    {item.postingTime}
                                  </span>
                                </div>

                                <div className={`h-8 w-8 rounded-xl bg-gradient-to-r ${getPlatformGradient()} text-white flex items-center justify-center shadow-md scale-95 hover:scale-100 transition-transform duration-200`}>
                                  {getPlatformIcon()}
                                </div>
                              </div>

                              {/* Topic & Date */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date} ({item.day})</span>
                                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-950 transition-colors">
                                  {item.topic}
                                </h4>
                              </div>

                              {/* Special Day Sparkles banner */}
                              {item.specialDay && (
                                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 px-3.5 py-2 rounded-2xl animate-pulse">
                                  <span className="text-base">✨</span>
                                  <div>
                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Celebrating Special Day</p>
                                    <p className="text-xs font-bold text-slate-700">{item.specialDay}</p>
                                  </div>
                                </div>
                              )}

                              {/* Viral Content Strategy Box */}
                              {item.viralIdea && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-wider">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    <span>Viral Concept & Execution</span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                    {item.viralIdea}
                                  </p>
                                </div>
                              )}

                              {/* Caption Quote block */}
                              {item.caption && (
                                <div className="space-y-2">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Caption Copywriting</p>
                                  <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                    <span className="absolute -top-3 left-3 text-3xl font-serif text-slate-200 select-none">“</span>
                                    <p className="text-xs text-slate-700 italic font-medium leading-relaxed relative z-10">
                                      {item.caption}
                                    </p>
                                    
                                    {/* Keywords / Hashtags */}
                                    {item.hashtags && (
                                      <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-100">
                                        {item.hashtags.split(' ').map((tag, tIdx) => tag && (
                                          <span key={tIdx} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/60">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Ad Campaign specification */}
                              {item.runAdCampaign === 'YES' && (
                                <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 p-4 rounded-2xl space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                      🎯 Lead-Gen Ad Campaign
                                    </span>
                                    <span className="text-[8px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Meta Sponsored</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="space-y-0.5">
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Lead Goal</p>
                                      <p className="font-extrabold text-slate-800">{item.leadGoal || 'Customer Acquisition'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Call To Action</p>
                                      <p className="font-black text-indigo-600">{item.cta || 'Sign Up Now'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Card Footer: Status Bar & Badge */}
                            <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publishing Status</span>
                              
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                status === 'posted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <span className="relative flex h-2 w-2">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    status === 'posted' ? 'bg-emerald-400' :
                                    status === 'completed' ? 'bg-blue-400' :
                                    'bg-amber-400'
                                  }`} />
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                    status === 'posted' ? 'bg-emerald-500' :
                                    status === 'completed' ? 'bg-blue-500' :
                                    'bg-amber-500'
                                  }`} />
                                </span>
                                {status === 'posted' ? 'Posted Live' : status === 'completed' ? 'Scheduled' : 'In Progress'}
                              </span>
                            </div>

                            {/* Status Bottom thick highlight border */}
                            <div className={`h-1.5 w-full ${
                              status === 'posted' ? 'bg-emerald-500' :
                              status === 'completed' ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`} />

                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  // ORIGINAL TABLE LAYOUT FOR FULL MONTH
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
                )}

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
      {renderBirthdayModal()}
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
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Compensation</p>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {user?.salary ? (
                  `₹${Number(user.salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
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
