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
  Clock,
  User,
  Share2,
  Video,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Download,
  FileText,
  X,
  Bell,
  BarChart2,
  History,
  Upload,
  Search,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  HelpCircle,
  Pencil,
  Trash2
} from 'lucide-react';

// Inline Branded Platform SVG Icons to bypass lucide-react missing export issues
const InstagramIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YouTubeIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const SendIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ChatIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Define Interface for Content Sheet Item
interface ContentSheetItem {
  id: string;
  date: string;
  day: string;
  contentType: string; // "Poster" | "Reel"
  topic: string;
  specialDay?: string; // added support for special days
  viralIdea: string;
  caption: string;
  keywords: string;
  hashtags: string;
  postingTime: string;
  runAdCampaign: string; // "YES" | "NO"
  leadGoal: string;
  cta: string;
}

interface Project {
  id: string;
  name: string;
  category?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  clientId?: string;
  client?: any;
}

// Maharaja Catering 21 items Seed Data - Updated with Special Day columns
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

export default function DigitalMarketingPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'project_manager';
  const isClient = user?.role === 'client' || user?.id?.startsWith('higc-') || (user?.role === 'user' && !(user as any).employee);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-06"); // Set target month default
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'fb' | 'youtube'>('instagram');
  const [activeTab, setActiveTab] = useState<'operations' | 'chatgpt'>('operations');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Operations States - Synced to LocalStorage per project & month
  const [contentItems, setContentItems] = useState<ContentSheetItem[]>([]);
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, 'inprogress' | 'completed' | 'posted'>>({});
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, 'inprogress' | 'running'>>({});
  
  // Drag over files state
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline row editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContentSheetItem>>({});

  // Interactive ChatBot States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: `👋 Hello! I am your HIG AI Marketing Assistant.\n\nI have successfully analyzed Maharaja Catering's campaign strategy and content calendar. I can instantly help you:\n\n• 📝 **Draft posts/reels captions**\n• #️⃣ **Generate high-engagement hashtags**\n• 🎯 **Write Meta Lead-Gen ad copies**\n• 🌿 **Suggest holiday greeting content**\n\nHow can I help you elevate your digital marketing today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on new message or when opened
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : chatInput;
    const trimmedText = rawText.trim();
    if (!trimmedText || chatLoading) return;

    if (textToSend === undefined) {
      setChatInput('');
    }

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const nextMessages = [...chatMessages, { sender: 'user' as const, text: trimmedText, timestamp }];
    setChatMessages(nextMessages);
    setChatLoading(true);

    setTimeout(() => {
      let aiText = '';
      const lowerText = trimmedText.toLowerCase();

      if (lowerText.includes('hashtag') || lowerText.includes('#')) {
        aiText = `🔥 **Viral High-Engagement Hashtags for Maharaja Catering:**\n\n**General Catering Reach:**\n#SriMaharajaCatering #MaharajaCatering #TirunelveliCatering #TamilNaduCatering #WeddingFeast #SouthIndianCatering\n\n**Visual Reels Cinematic:**\n#CateringReels #FoodCinematic #CateringBTS #TirunelveliFoodie #WeddingFoodGasm\n\n**High-Intent Wedding Planning:**\n#WeddingPlannersTN #TamilWeddingCatering #TraditionalCatering #TirunelveliWeddings #TNWeddings\n\n*💡 Tip: Instagram works best with a balanced mix of 10-15 hashtags. Copy these right into your post caption!*`;
      } else if (lowerText.includes('caption') || lowerText.includes('write a caption') || lowerText.includes('post caption')) {
        aiText = `📝 **High-Converting Instagram Caption for Maharaja Catering:**\n\n---\n✨ **A wedding feast is not just food; it is an emotion!** ✨\n\nMake your special day unforgettable with the authentic, heritage flavors of South India served with absolute perfection. From traditional banana leaf wedding feasts to modern luxury live counters, we turn your wedding into a culinary celebration.\n\n🌿 **Why Sri Maharaja Catering?**\n• Authentic heritage recipes passed down generations\n• Professional hygiene-first preparation & premium presentation\n• Impeccable hospitality & service\n• Seamlessly handling grand events of 1000+ guests\n\n📞 **Bookings open for wedding season 2026!** Call us at **63817 26852** or DM us to schedule a tasting session.\n\n📍 Address: PPCQ+XH5, 6, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu\n---\n\n*Would you like me to write a video reel script or draft a different theme?*`;
      } else if (lowerText.includes('ad copy') || lowerText.includes('campaign copy') || lowerText.includes('ad campaign')) {
        aiText = `🎯 **Meta Lead-Gen Ads Copy (Optimized for Wedding & Event Leads):**\n\n---\n📢 **Primary Text:**\nAre you planning a grand wedding in Tirunelveli or surrounding districts? 🌟 Give your guests a feast they will remember for a lifetime!\n\nSri Maharaja Catering brings you the ultimate traditional South Indian wedding feast with premium hospitalities, authentic tastes, and flawless service. From traditional leaf service to premium buffet counters, we customize everything to match your dream wedding. \n\n🔒 *We are offering special booking discounts for late 2026 wedding slots. Book today to lock in prime dates!*\n\n👉 **Headline:** Authentic Wedding Catering - Book Taste Test Today!\n📋 **Description:** Premium catering packages for grand weddings & events.\n🏷️ **Call to Action (CTA):** Learn More / Get Quote\n---\n\n*This ad copy is highly optimized to capture high-intent leads using standard Meta Lead Forms!*`;
      } else if (lowerText.includes('environment') || lowerText.includes('green') || lowerText.includes('june 5')) {
        aiText = `🌿 **World Environment Day (June 5th) Campaign Strategy:**\n\n**Campaign Concept:** "Green Plate, Clean Planet" — highlight zero-plastic, eco-friendly catering options.\n\n**📝 Instagram Caption:**\n---\n🌱 **Taste that's rich, service that's green!** 🌱\n\nThis World Environment Day, Sri Maharaja Catering renews its commitment to sustainable celebrations. We serve our premium traditional flavors with eco-friendly serving leaves, biodegradable cutlery, and zero food-waste protocols.\n\nCelebrate your milestones responsibly without compromising on the authentic, luxurious taste you love!\n\n📞 Contact us to plan your green event: **63817 26852**\n---`;
      } else if (lowerText.includes('father') || lowerText.includes('june 14') || lowerText.includes('june 11')) {
        aiText = `👨 **Father's Day Special Campaign Copy (June 2026):**\n\n**📝 Post Caption:**\n---\n❤️ **Celebrating the First Hero: Happy Father's Day!** 👨‍👦\n\nFathers show love through silent actions, but today, let's treat them out loud! Gather the family and celebrate Dad with a traditional feast he will absolutely cherish. \n\nAt Sri Maharaja Catering, we prepare family feasts filled with love, heritage, and flavors that connect generations. \n\n🎁 *Special Gift: Book a Father's Day family event with us and receive a customized dessert counter for Dad!*\n\n📞 Call us to reserve: **63817 26852**\n---`;
      } else if (lowerText.includes('yoga') || lowerText.includes('june 21') || lowerText.includes('june 14')) {
        aiText = `🧘 **International Yoga Day Special Campaign Copy (June 21st):**\n\n**📝 Healthy Vegetarian Feast Caption:**\n---\n🧘‍♀️ **Healthy living begins with healthy food choices!** 🌿\n\nThis International Yoga Day, Sri Maharaja Catering celebrates wellness with our special **Satvik & Healthy Vegetarian Menu**. Crafted with fresh, nutrient-rich ingredients, organic vegetables, and heritage herbs, we prove that healthy food can be extraordinarily delicious!\n\nBring purity and wellness to your celebrations.\n\n📞 DM us to customize a healthy menu: **63817 26852**\n---`;
      } else if (lowerText.includes('biryani') || lowerText.includes('briyani')) {
        aiText = `🔥 **The King of Feasts: Maharaja's Signature Biryani!** 👑\n\nSlow-cooked to perfection with premium long-grain basmati, authentic spices, and succulent meats. Every spoonful of our signature Biryani is an explosion of heritage flavors!\n\nServings available for family events, corporate lunches, and grand weddings.\n\n📞 Call **63817 26852** for bulk event orders. We handle deliveries with custom hot-packs to keep it perfectly fresh!`;
      } else {
        aiText = `I hear you! As your **Sri Maharaja Catering** AI Assistant, I've got you covered. \n\nHere is a quick marketing outline based on your query:\n\n✨ **Creative Post Idea:** Let's showcase the behind-the-scenes preparation or customer testimonials in Palayamkottai, Tirunelveli.\n\n✍️ **Proposed Caption draft:**\n"Serving happiness through authentic flavors. Every event is a masterpiece for us!"\n\n📞 **Contact Info to include:** Call **63817 26852** or visit us in Palayamkottai, Tirunelveli.\n\n*Feel free to ask for something specific like 'hashtags', 'wedding caption', 'ad copy', or 'Father\\'s day'!*`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
      setChatLoading(false);
    }, 1200);
  };

  // Dynamic ChatGPT Tab Chat History
  const [chatGptMessages, setChatGptMessages] = useState<Array<{ sender: 'user' | 'gpt'; text: string; timestamp: string }>>([
    {
      sender: 'user',
      text: `I need a high-converting digital marketing calendar for "maharaja catering" in Tamil Nadu. The deliverables promised to the client are 15 posters and 6 reels for a month. We must deliver these on respective days. \n\nWe also need to run 2 ad campaigns per month to get wedding and event leads. The calendar must specify special holiday posters (India and Tamil Nadu), posting times, lead goals, and strong CTAs for each post type. \n\nCan you generate a chronological 21-row content strategy starting in June 2026? Alternate between Posters and Reels where appropriate.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    },
    {
      sender: 'gpt',
      text: `Certainly! Here is a premium, localized, high-converting content calendar designed for "Sri Maharaja Catering" targeting the South Indian wedding and event market in Tamil Nadu.

I have structured this calendar to alternate between high-fidelity Posters and highly engaging video Reels. Special days (like World Environment Day, Father's Day, and International Yoga Day) are highlighted with specific content themes.

Here is a summary of the 21-row calendar synced into your Operations Hub:
• **15 Posters / 6 Reels** configured for optimal reach.
• **Special Day Columns** mapped natively matching your custom dates.
• **High-Intent CTAs** (DM For Booking, WhatsApp Now, Enquire Today).
• **2 Lead-Gen Ad Campaigns** configured under your ad operations board.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);
  const [chatGptInput, setChatGptInput] = useState('');
  const [chatGptLoading, setChatGptLoading] = useState(false);
  const chatGptEndRef = useRef<HTMLDivElement>(null);

  // Scroll chatgpt to bottom on new message
  useEffect(() => {
    if (chatGptEndRef.current) {
      chatGptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatGptMessages, activeTab]);

  const handleSendChatGptMessage = (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : chatGptInput;
    const trimmedText = rawText.trim();
    if (!trimmedText || chatGptLoading) return;

    if (textToSend === undefined) {
      setChatGptInput('');
    }

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const nextMessages = [...chatGptMessages, { sender: 'user' as const, text: trimmedText, timestamp }];
    setChatGptMessages(nextMessages);
    setChatGptLoading(true);

    setTimeout(() => {
      let aiText = '';
      const lowerText = trimmedText.toLowerCase();

      if (lowerText.includes('hashtag') || lowerText.includes('#')) {
        aiText = `Here are the viral, high-engagement hashtags parsed and suggested for **Sri Maharaja Catering** (Tirunelveli region):\n\n### 🔥 General Catering & Wedding Reach (High Volume)\n\`#SriMaharajaCatering #MaharajaCatering #TirunelveliCatering #TamilNaduCatering #WeddingFeast #TraditionalFeast #SouthIndianCatering\`\n\n### 📸 Reels & Short Video Cinematic Reach\n\`#CateringReels #FoodCinematic #CateringBTS #TirunelveliFoodie #WeddingFoodGasm #FoodReels\`\n\n### 🎯 Niche Wedding Planning & Lead Capture\n\`#WeddingPlannersTN #TamilWeddingCatering #TraditionalCatering #TirunelveliWeddings #TNWeddings\`\n\n*💡 Advice: We recommend combining 5 high-reach hashtags with 5 localized Tirunelveli hashtags for maximum regional visibility. These are already synchronized to your digital calendar files.*`;
      } else if (lowerText.includes('caption') || lowerText.includes('write a caption') || lowerText.includes('post caption')) {
        aiText = `Here is a high-converting Instagram & Facebook copy template customized for **Sri Maharaja Catering**:\n\n---\n✨ **A Wedding Feast is not just food; it is an emotion!** ✨\n\nMake your special day unforgettable with the authentic, heritage flavors of South India served with absolute perfection. From traditional banana leaf wedding feasts to modern luxury live counters, we turn your wedding into a culinary celebration.\n\n🌿 **Why Sri Maharaja Catering?**\n• Authentic heritage recipes passed down generations\n• Professional hygiene-first preparation & premium presentation\n• Impeccable hospitality & service\n• Seamlessly handling grand events of 1000+ guests\n\n📞 **Bookings open for wedding season 2026!** Call us at **63817 26852** or DM us to schedule a tasting session.\n\n📍 Address: PPCQ+XH5, 6, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu\n---\n\nWould you like me to draft a localized Tamil caption instead, or a short script for a behind-the-scenes video reel?`;
      } else if (lowerText.includes('ad copy') || lowerText.includes('campaign copy') || lowerText.includes('ad campaign')) {
        aiText = `Here is high-converting **Meta Ads Copy (optimized for lead capture campaigns)**:\n\n### 🎯 Meta Ad Brief for Sri Maharaja Catering\n\n**1. Primary Text:**\nAre you planning a grand wedding in Tirunelveli or surrounding districts? 🌟 Give your guests a feast they will remember for a lifetime!\n\nSri Maharaja Catering brings you the ultimate traditional South Indian wedding feast with premium hospitalities, authentic tastes, and flawless service. From traditional leaf service to premium buffet counters, we customize everything to match your dream wedding. \n\n🔒 *We are offering special booking discounts for late 2026 wedding slots. Book today to lock in prime dates!*\n\n**2. Headline:**\nAuthentic Wedding Catering - Book Taste Test Today!\n\n**3. Description:**\nPremium catering packages for grand weddings & events.\n\n**4. Call to Action (CTA):**\nLearn More / Get Quote\n\n*💡 Ad Strategy Tip: Pair this with a high-quality cinematic video of your kitchen setup or live food serving stations to capture local wedding leads instantly.*`;
      } else if (lowerText.includes('environment') || lowerText.includes('green') || lowerText.includes('june 5')) {
        aiText = `Here is a special green-campaign concept and social media copy designed for **World Environment Day (June 5th)**:\n\n### 🌿 Campaign Strategy: "Sustainable Celebrations"\n*Goal: Showcase the eco-friendly efforts of Sri Maharaja Catering, appealing to modern environmentally conscious clients.*\n\n**📝 Post Copy:**\n---\n🌱 **Taste that's rich, service that's green!** 🌱\n\nThis World Environment Day, Sri Maharaja Catering renews its commitment to sustainable celebrations. We serve our premium traditional flavors with eco-friendly serving leaves, biodegradable sugarcane-bagasse tableware, and strict zero food-waste protocols.\n\nCelebrate your milestones responsibly without compromising on the authentic, luxurious taste you love!\n\n📞 Contact us to plan your sustainable green event: **63817 26852**\n---`;
      } else if (lowerText.includes('father') || lowerText.includes('june 14') || lowerText.includes('june 11')) {
        aiText = `Here is a custom Father's Day greeting post campaign draft for your content stream:\n\n### 👨 Father's Day Campaign Concept (June 2026)\n*Objective: Evoke warm family feelings and capture private celebration catering leads.*\n\n**📝 Caption Draft:**\n---\n❤️ **Celebrating the First Hero: Happy Father's Day!** 👨‍👦\n\nFathers show love through silent actions, but today, let's treat them out loud! Gather the family and celebrate Dad with a traditional feast he will absolutely cherish. \n\nAt Sri Maharaja Catering, we prepare family feasts filled with love, heritage, and flavors that connect generations. \n\n🎁 *Special Gift: Book a Father's Day family event with us and receive a customized dessert counter for Dad!*\n\n📞 Call us to reserve: **63817 26852**\n---`;
      } else if (lowerText.includes('yoga') || lowerText.includes('june 21')) {
        aiText = `Here is a wellness marketing poster concept and copy designed for **International Yoga Day (June 21st)**:\n\n### 🧘 International Yoga Day Strategy\n*Objective: Tap into the healthy-eating market segments by promoting customized satvik and organic catering options.*\n\n**📝 Healthy Vegetarian Feast Caption:**\n---\n🧘‍♀️ **Healthy living begins with healthy food choices!** 🌿\n\nThis International Yoga Day, Sri Maharaja Catering celebrates wellness with our special **Satvik & Healthy Vegetarian Menu**. Crafted with fresh, nutrient-rich ingredients, organic vegetables, and heritage herbs, we prove that healthy food can be extraordinarily delicious!\n\nBring purity and wellness to your celebrations.\n\n📞 DM us to customize a healthy menu: **63817 26852**\n---`;
      } else if (lowerText.includes('biryani') || lowerText.includes('briyani')) {
        aiText = `Ah, the undisputed **King of Feasts: Maharaja's Signature Biryani!** 👑\n\nHere is some high-converting caption copy for your Biryani promo reel:\n\n---\n🔥 **The King of Feasts: Maharaja's Signature Biryani!** 👑\n\nSlow-cooked to perfection with premium long-grain basmati, authentic spices, and succulent meats. Every spoonful of our signature Biryani is an explosion of heritage flavors!\n\nServings available for family events, corporate lunches, and grand weddings in Tirunelveli.\n\n📞 Call **63817 26852** for bulk event orders. We handle deliveries with custom hot-packs to keep it perfectly fresh!\n---`;
      } else {
        aiText = `Hello! I am ChatGPT, fine-tuned specifically for **Sri Maharaja Catering** digital marketing. \n\nI have parsed your query. Here is a custom strategic solution for your digital marketing hub:\n\n✨ **Creative Visual Idea:** Showcase a high-definition slow-motion video of serving steaming hot payasam or ladlefuls of aromatic Biryani to guests in Palayamkottai, Tirunelveli.\n\n✍️ **Proposed Social Copy:**\n"Serving happiness through authentic South Indian recipes passed down for generations. Make your celebration historic!"\n\n📞 **Contact info to integrate:** Call **63817 26852** or DM us to book your wedding menu testing session.\n\n*Feel free to ask me to write captions, hashtags, ad copies, or sustainable campaign ideas!*`;
      }

      setChatGptMessages(prev => [...prev, {
        sender: 'gpt',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
      setChatGptLoading(false);
    }, 1200);
  };

  // Fetch Projects List
  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/projects');
      let filtered = data.filter((p: Project) => p.category === 'Digital Marketing');
      if (user?.role === 'client') {
        filtered = filtered.filter((p: Project) => p.clientId === user.id || p.client?.id === user.id);
      }
      
      // Seed a default project in state in case backend has no digital marketing projects
      const fallbackList = filtered.length > 0 ? filtered : [
        {
          id: 'maharaja-catering-fallback-id',
          name: 'maharaja catering',
          category: 'Digital Marketing',
          description: 'South Indian Wedding Catering Services marketing',
          startDate: '2026-05-01',
          endDate: '2027-05-01',
          status: 'Active'
        }
      ];
      
      setProjects(fallbackList);
      setSelectedProjectId(fallbackList[0].id);
      setError(null);
    } catch (err) {
      console.error(err);
      const fallback = [
        {
          id: 'maharaja-catering-fallback-id',
          name: 'maharaja catering',
          category: 'Digital Marketing',
          description: 'South Indian Wedding Catering Services marketing',
          startDate: '2026-05-01',
          endDate: '2027-05-01',
          status: 'Active'
        }
      ];
      setProjects(fallback);
      setSelectedProjectId(fallback[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

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

  // Fetch month-wise content sheet from database
  const fetchContentSheet = async (projectId: string, month: string) => {
    if (!projectId || !month) return;
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/marketing/${projectId}/sheets?month=${month}`);
      
      if (data && data.items) {
        setContentItems(data.items || []);
        setPlatformStatuses(data.statuses || {});
        setCampaignStatuses(data.campaigns || {});
      } else {
        // Fallback: check if Maharaja Catering is selected to seed initial demo data
        const currentProj = projects.find(p => p.id === projectId);
        if (currentProj?.name.toLowerCase().includes('catering') || projectId === 'maharaja-catering-fallback-id') {
          const seededData = getSeededDataForMonth(month);
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
          
          // Save demo data to database so it exists there from now on
          await saveStateToStorage(seededData, initialMap, initialCampMap, projectId, month);
        } else {
          setContentItems([]);
          setPlatformStatuses({});
          setCampaignStatuses({});
        }
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch content sheet:', err);
      setContentItems([]);
      setPlatformStatuses({});
      setCampaignStatuses({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    fetchContentSheet(selectedProjectId, selectedMonth);
  }, [selectedProjectId, selectedMonth, projects]);

  // Save changes helper to database
  const saveStateToStorage = async (
    items: ContentSheetItem[], 
    statuses: Record<string, 'inprogress' | 'completed' | 'posted'>, 
    campaigns: Record<string, 'inprogress' | 'running'>,
    projectId: string = selectedProjectId,
    month: string = selectedMonth
  ) => {
    if (!projectId || !month) return;
    
    // Optional: still keep localStorage as local cache fallback
    const storageKeyItems = `higerp_sheet_items_${projectId}_${month}`;
    const storageKeyStatuses = `higerp_sheet_statuses_${projectId}_${month}`;
    const storageKeyCampaigns = `higerp_campaign_statuses_${projectId}_${month}`;
    localStorage.setItem(storageKeyItems, JSON.stringify(items));
    localStorage.setItem(storageKeyStatuses, JSON.stringify(statuses));
    localStorage.setItem(storageKeyCampaigns, JSON.stringify(campaigns));

    try {
      await fetchWithAuth(`/marketing/${projectId}/sheets?month=${month}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          statuses,
          campaigns,
        }),
      });
    } catch (err) {
      console.error('Failed to save content sheet to database:', err);
    }
  };

  // Status Handlers
  const handleUpdateStatus = (itemId: string, newStatus: 'inprogress' | 'completed' | 'posted') => {
    const nextStatuses = {
      ...platformStatuses,
      [`${itemId}_${activePlatform}`]: newStatus
    };
    setPlatformStatuses(nextStatuses);
    saveStateToStorage(contentItems, nextStatuses, campaignStatuses);
  };

  const handleUpdateCampaignStatus = (itemId: string, newStatus: 'inprogress' | 'running') => {
    const nextCampaigns = {
      ...campaignStatuses,
      [itemId]: newStatus
    };
    setCampaignStatuses(nextCampaigns);
    saveStateToStorage(contentItems, platformStatuses, nextCampaigns);
  };

  // Load Maharaja Catering Demo Data
  const handleLoadDemoData = () => {
    setContentItems(MAHARAJA_CATERING_DATA);
    
    // Set some nice initial statuses
    const initialMap: Record<string, 'inprogress' | 'completed' | 'posted'> = {};
    const initialCampMap: Record<string, 'inprogress' | 'running'> = {};
    
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

      if (item.runAdCampaign === 'YES') {
        initialCampMap[item.id] = item.id === 'mc_1' || item.id === 'mc_2' ? 'running' : 'inprogress';
      }
    });

    setPlatformStatuses(initialMap);
    setCampaignStatuses(initialCampMap);
    saveStateToStorage(MAHARAJA_CATERING_DATA, initialMap, initialCampMap);
  };

  // Clear sheet data
  const handleClearData = () => {
    setContentItems([]);
    setPlatformStatuses({});
    setCampaignStatuses({});
    saveStateToStorage([], {}, {});
  };

  // CSV Sheet Downloader
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
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
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

  // Row Edit Handlers
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

  const handleDeleteRow = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this row?")) return;
    const nextItems = contentItems.filter(item => item.id !== itemId);
    setContentItems(nextItems);
    await saveStateToStorage(nextItems, platformStatuses, campaignStatuses);
  };

  const handleAddNewRow = async () => {
    const newId = `new_${Date.now()}`;
    
    // Auto-calculate next date based on last item or default to today YYYY-MM-DD
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
    }
    
    const dObj = new Date(nextDate);
    const dayName = !isNaN(dObj.getTime()) ? dObj.toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday';

    const newItem: ContentSheetItem = {
      id: newId,
      date: nextDate,
      day: dayName,
      contentType: 'Poster',
      topic: 'New Content Topic',
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

  // CSV Parser
  const parseCSVText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    // Robust cell-parser that handles commas inside double quotes correctly
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
      // Strip outer quotes and trim values
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

  // Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseCSVText(text);
        if (parsed.length > 0) {
          setContentItems(parsed);
          
          // Reset status mappings
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
          saveStateToStorage(parsed, initialMap, initialCampMap);
        } else {
          alert('Could not parse any valid rows. Please check headers: Date, Day, Content Type, Topic...');
        }
      }
    };
    reader.readAsText(file);
  };

  // KPI Calculations
  const totalPosters = contentItems.filter(item => item.contentType === 'Poster').length;
  const totalReels = contentItems.filter(item => item.contentType === 'Reel').length;

  const deliveredPosters = contentItems.filter(item => {
    if (item.contentType !== 'Poster') return false;
    const status = platformStatuses[`${item.id}_${activePlatform}`];
    return status === 'posted' || status === 'completed';
  }).length;

  const deliveredReels = contentItems.filter(item => {
    if (item.contentType !== 'Reel') return false;
    const status = platformStatuses[`${item.id}_${activePlatform}`];
    return status === 'posted' || status === 'completed';
  }).length;

  const adCampaignRows = contentItems.filter(item => item.runAdCampaign === 'YES');
  const totalAdCampaigns = adCampaignRows.length;
  const runningAdCampaigns = adCampaignRows.filter(item => campaignStatuses[item.id] === 'running').length;

  const totalLeadsForecast = adCampaignRows.reduce((acc, curr) => {
    const status = campaignStatuses[curr.id];
    if (status === 'running') {
      // Aggregate mockup lead count for campaign (e.g. 15-20 mockup leads per running campaign)
      return acc + 18;
    }
    return acc;
  }, 0);

  // Filters search query
  const filteredContentItems = contentItems.filter(item => 
    item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hashtags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Generate and Download PDF Report
  const handleDownloadPdfReport = async () => {
    if (!selectedProject) return;
    setDownloadingReport(true);

    try {
      const activePlatformName = 
        activePlatform === 'instagram' ? 'Instagram' : 
        activePlatform === 'fb' ? 'Facebook' : 'YouTube';

      const reportDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

      // Rows for content table
      const contentRowsHtml = filteredContentItems.map((item, idx) => {
        const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
        const statusBadgeStyle = 
          status === 'posted' ? 'background: #ecfdf5; color: #059669;' : 
          status === 'completed' ? 'background: #eff6ff; color: #2563eb;' : 
          'background: #fffbeb; color: #d97706;';

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px;">
            <td style="padding: 10px; font-weight: bold; color: #1e293b;">${item.date}<br/><span style="font-size: 8px; color: #64748b;">${item.day}</span></td>
            <td style="padding: 10px;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase;
                ${item.contentType === 'Reel' ? 'background: #fdf2f8; color: #db2777;' : 'background: #f0f9ff; color: #0284c7;'}">
                ${item.contentType}
              </span>
            </td>
            <td style="padding: 10px; font-weight: 600; color: #0f172a;">
              ${item.topic}
              ${item.specialDay ? `<br/><span style="font-size: 8px; font-weight: bold; color: #d97706; background: #fffbeb; padding: 1px 4px; border-radius: 4px; display: inline-block; margin-top: 2px;">✨ ${item.specialDay}</span>` : ''}
            </td>
            <td style="padding: 10px; color: #475569; font-size: 9px; max-width: 180px; word-break: break-all;">${item.viralIdea}</td>
            <td style="padding: 10px; color: #64748b; font-size: 8px; max-width: 140px; word-break: break-all;">${item.hashtags}</td>
            <td style="padding: 10px; font-weight: bold; text-align: center;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 8px; font-weight: 800; text-transform: uppercase; ${statusBadgeStyle}">
                ${status}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      // Rows for ad campaigns table
      const campaignRowsHtml = adCampaignRows.map(item => {
        const campStatus = campaignStatuses[item.id] || 'inprogress';
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px;">
            <td style="padding: 10px; font-weight: bold; color: #1e293b;">${item.date}</td>
            <td style="padding: 10px; font-weight: 600; color: #0f172a;">${item.topic}</td>
            <td style="padding: 10px; font-weight: bold; color: #6366f1;">${item.leadGoal}</td>
            <td style="padding: 10px; color: #475569;">${item.cta}</td>
            <td style="padding: 10px; text-align: center;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 8px; font-weight: 800; text-transform: uppercase;
                ${campStatus === 'running' ? 'background: #ecfdf5; color: #059669;' : 'background: #fffbeb; color: #d97706;'}">
                ${campStatus === 'running' ? 'Running' : 'In Progress'}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; background: #ffffff; padding: 20px;">
          <!-- Corporate Letterhead Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 24px;">
            <img src="/logo.png" style="height: 36px; object-fit: contain;" />
            <div style="text-align: right;">
              <div style="font-size: 11px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px;">HIG ENTERPRISE AI ERP</div>
              <div style="font-size: 9px; font-weight: 700; color: #6366f1; text-transform: uppercase; margin-top: 2px;">Digital Marketing Hub Report</div>
            </div>
          </div>

          <!-- Report Meta Details -->
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 18pt; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ${selectedProject.name}
            </h1>
            <div style="display: flex; gap: 16px; align-items: center; font-size: 10px; color: #64748b; font-weight: 600;">
              <span>Period: ${selectedMonth}</span>
              <span>•</span>
              <span>Platform Analyzed: ${activePlatformName}</span>
              <span>•</span>
              <span>Generated On: ${reportDate}</span>
              <span>•</span>
              <span>Prepared by: ${user?.username || 'Marketing Specialist'}</span>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div style="display: table; width: 100%; table-layout: fixed; margin-bottom: 24px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">
            <div style="display: table-cell; padding: 14px; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 18pt; font-weight: 900; color: #0284c7;">${deliveredPosters} / ${totalPosters}</div>
              <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">Posters Delivered</div>
            </div>
            <div style="display: table-cell; padding: 14px; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 18pt; font-weight: 900; color: #db2777;">${deliveredReels} / ${totalReels}</div>
              <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">Reels Delivered</div>
            </div>
            <div style="display: table-cell; padding: 14px; text-align: center; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 18pt; font-weight: 900; color: #10b981;">${runningAdCampaigns} / ${totalAdCampaigns}</div>
              <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">Ad Campaigns Running</div>
            </div>
            <div style="display: table-cell; padding: 14px; text-align: center;">
              <div style="font-size: 18pt; font-weight: 900; color: #6366f1;">~${totalLeadsForecast}</div>
              <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px;">Mock Leads Generated</div>
            </div>
          </div>

          <!-- Chronological Content Plan Table -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
              Content Calendar Delivery Tracker (${activePlatformName})
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 9px; color: #475569;">
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Date</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Type</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Topic</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Viral Idea</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Hashtags</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${contentRowsHtml || '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8; font-style: italic;">No content items active.</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- Ad Campaigns Table -->
          ${totalAdCampaigns > 0 ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 11pt; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
              Ad Campaigns Operations Phase
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 9px; color: #475569;">
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Date</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Topic</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">Lead Goal</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase;">CTA</th>
                  <th style="padding: 8px; font-weight: 800; text-transform: uppercase; text-align: center;">Running State</th>
                </tr>
              </thead>
              <tbody>
                ${campaignRowsHtml}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 30px; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; font-style: italic;">
            <span>Confidential Report • Generated by HIG Digital Marketing ERP System</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      `;

      const filename = `${selectedProject.name.replace(/\s+/g, '_')}_Marketing_Hub_${selectedMonth}`;
      const { downloadPdfFromHtml } = await import('@/lib/download-pdf');
      await downloadPdfFromHtml(htmlContent, filename, setDownloadingReport);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Could not compile PDF report.');
      setDownloadingReport(false);
    }
  };

  return (
    <DashboardLayout fullWidth={viewMode === 'table'}>
      <div className="font-sans min-h-screen bg-transparent pb-16 antialiased">
        
        {/* ===== Page Header ===== */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-sky-50 text-[#2E9EDE] border border-sky-100">
                <Share2 className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Digital Marketing Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Upload spreadsheets, alternate content delivery (poster-reel), and track ad operations campaigns securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            
            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
              <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value || "2026-06")}
                className="bg-transparent text-foreground focus:outline-none text-sm font-bold cursor-pointer"
              />
            </div>

            {/* Upload CSV Button */}
            {!isClient && (
              <div>
                <input
                  type="file"
                  id="headerCsvUpload"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('headerCsvUpload')?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-[#2E9EDE] hover:bg-[#1c85be] text-white font-bold rounded-2xl active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-sky-100 text-sm uppercase tracking-wider font-extrabold"
                  title="Select and parse Excel-saved CSV content sheet"
                >
                  <Upload className="h-4 w-4" />
                  Upload Content Sheet
                </button>
              </div>
            )}

            {/* Download PDF Button */}
            {contentItems.length > 0 && (
              <button
                type="button"
                disabled={downloadingReport}
                onClick={handleDownloadPdfReport}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-background font-bold rounded-2xl hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-md text-sm"
              >
                {downloadingReport ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Compiling Report...</>
                ) : (
                  <><Download className="h-4 w-4" /> Download Hub Report</>
                )}
              </button>
            )}

            {/* Project Selector */}
            {!isClient && (
              <div className="w-full sm:w-64">
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-sm font-semibold cursor-pointer appearance-none shadow-sm"
                  >
                    {projects.length === 0 ? (
                      <option value="">No Active Projects</option>
                    ) : (
                      projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ===== Operations vs ChatGPT Tab Selector ===== */}
        {!isClient && (
          <div className="flex space-x-2 bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl max-w-sm mb-8 border border-border/40 shadow-inner animate-in fade-in duration-300">
            <button
              type="button"
              onClick={() => setActiveTab('operations')}
              className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'operations'
                  ? 'bg-card text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-border/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <BarChart2 className="h-4 w-4 text-[#2E9EDE]" />
              Operations Hub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chatgpt')}
              className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'chatgpt'
                  ? 'bg-[#2E9EDE] text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Sparkles className="h-4 w-4 text-sky-200" />
              🤖 ChatGPT Strategy
            </button>
          </div>
        )}

        {activeTab === 'operations' && (
          <>
            {/* ===== Branded Top Account Segmented Selector ===== */}
            <div className="bg-card/40 backdrop-blur-md rounded-[32px] p-6 border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Active Posting Account (Toggles State Separately)</span>
                  <h3 className="text-sm font-bold text-foreground">Select Platform to View & Update Deliverables</h3>
                </div>

            {/* Platform Segmented Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-secondary/80 p-1.5 rounded-2xl w-full md:w-auto max-w-md border border-border/40 shadow-inner">
              
              {/* Instagram Selector */}
              <button
                type="button"
                onClick={() => setActivePlatform('instagram')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activePlatform === 'instagram'
                    ? 'bg-[#2E9EDE] text-white shadow-lg shadow-sky-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </button>

              {/* Facebook Selector */}
              <button
                type="button"
                onClick={() => setActivePlatform('fb')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activePlatform === 'fb'
                    ? 'bg-[#2E9EDE] text-white shadow-lg shadow-sky-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </button>

              {/* YouTube Selector */}
              <button
                type="button"
                onClick={() => setActivePlatform('youtube')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activePlatform === 'youtube'
                    ? 'bg-[#2E9EDE] text-white shadow-lg shadow-sky-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <YouTubeIcon className="h-4 w-4" />
                YouTube
              </button>

            </div>
          </div>
        </div>

        {/* ===== KPI Metrics Grid (Real-time recalculations) ===== */}
        {contentItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in duration-300">
            
            {/* Image Posts (Posters) KPI Card */}
            <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Posters Target</span>
                </div>
                {deliveredPosters >= 15 && totalPosters > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2E9EDE]/15 text-[#2E9EDE] border border-[#2E9EDE]/25">Met</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Pending</span>
                )}
              </div>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-extrabold text-foreground">{deliveredPosters}</span>
                <span className="text-muted-foreground font-bold">/</span>
                <span className="text-lg font-bold text-muted-foreground">{totalPosters || 15}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Delivered</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#2E9EDE] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, totalPosters > 0 ? (deliveredPosters / totalPosters) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Video Posts (Reels) KPI Card */}
            <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20">
                    <Video className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reels Target</span>
                </div>
                {deliveredReels >= 6 && totalReels > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2E9EDE]/15 text-[#2E9EDE] border border-[#2E9EDE]/25">Met</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Pending</span>
                )}
              </div>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-extrabold text-foreground">{deliveredReels}</span>
                <span className="text-muted-foreground font-bold">/</span>
                <span className="text-lg font-bold text-muted-foreground">{totalReels || 6}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Delivered</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#2E9EDE] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, totalReels > 0 ? (deliveredReels / totalReels) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Ad Campaigns Running Card */}
            <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ad Campaigns</span>
                </div>
                {runningAdCampaigns >= 2 && totalAdCampaigns > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2E9EDE]/15 text-[#2E9EDE] border border-[#2E9EDE]/25">Active</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Setup</span>
                )}
              </div>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-extrabold text-foreground">{runningAdCampaigns}</span>
                <span className="text-muted-foreground font-bold">/</span>
                <span className="text-lg font-bold text-muted-foreground">{totalAdCampaigns}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Running</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#2E9EDE] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, totalAdCampaigns > 0 ? (runningAdCampaigns / totalAdCampaigns) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Total Account Delivery Score Card */}
            <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Channel Score</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Score</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {Math.round(((deliveredPosters + deliveredReels) / Math.max(1, totalPosters + totalReels)) * 100)}%
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Total Delivery Rate</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#2E9EDE] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((deliveredPosters + deliveredReels) / Math.max(1, totalPosters + totalReels)) * 100)}%` }}
                />
              </div>
            </div>

          </div>
        )}

        {/* ===== Setup / CSV Upload Zone ===== */}
        {contentItems.length === 0 ? (
          <div className="bg-card rounded-[32px] p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Animated Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                  dragActive ? 'border-indigo-500 bg-indigo-500/5 scale-102' : 'border-border hover:border-indigo-500/40 hover:bg-secondary/40'
                }`}
              >
                <input
                  type="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="csvFile" className="cursor-pointer w-full flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 animate-bounce" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Upload Content Sheet Spreadsheet</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Drag and drop your content calendar CSV file here, or click to browse.
                  </p>
                </label>
              </div>

              {/* Separator Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-border/80"></div>
                <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest px-4">Or Quick Start</span>
                <div className="flex-grow border-t border-border/80"></div>
              </div>

              {/* Preload Maharaja Catering Seed Button */}
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/15 cursor-pointer text-sm uppercase tracking-widest"
              >
                <Sparkles className="h-5 w-5 text-amber-300 animate-spin" />
                Load Maharaja Catering Demo Content Sheet
              </button>
              
              <p className="text-[11px] text-muted-foreground font-semibold">
                Loads the complete 21-row content sheet with posters & reels, lead goals, CTAs, and ad campaign indicators.
              </p>

            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            
            {/* ==================================================== */}
            {/* CHRONOLOGICAL FEED (Left Columns)                    */}
            {/* ==================================================== */}
            <div className={`${viewMode === 'table' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6 transition-all duration-300`}>
              
              <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                
                {/* Calendar Title & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5 mb-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h2 className="text-xl font-bold text-foreground">Content Calendar Sheet Stream</h2>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      Showing {filteredContentItems.length} items in chronological delivery order (Poster - Reel)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-secondary p-1 rounded-xl border border-border/40 select-none">
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'table'
                            ? 'bg-card text-foreground shadow-sm border border-border/10'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Sheet View
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'cards'
                            ? 'bg-card text-foreground shadow-sm border border-border/10'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Card View
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search calendar topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-xs font-semibold"
                      />
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    {/* Clear Button */}
                    {!isClient && (
                      <button
                        type="button"
                        onClick={handleClearData}
                        className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl transition-all cursor-pointer font-bold text-xs"
                        title="Clear content calendar"
                      >
                        Clear Sheet
                      </button>
                    )}
                  </div>
                </div>

                {/* Alternating Chronological Post Stream (Poster - Reel) */}
                {viewMode === 'table' ? (
                  /* ================= SHEET TABLE VIEW ================= */
                  <div className="overflow-x-auto w-full border border-border/85 rounded-2xl shadow-inner max-h-[850px] overflow-y-auto bg-card select-none">
                    <table className="w-full border-collapse text-left text-xs text-foreground divide-y divide-border">
                      <thead className="sticky top-0 bg-[#E8F1D7] dark:bg-[#1a2d19] text-[#42613D] dark:text-[#a5c3a1] font-black uppercase text-[10px] tracking-wider z-10 border-b border-[#D2DEC1] dark:border-[#263c25]">
                        <tr>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Date</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Day</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Type</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Topic</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Special Day</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Content / Viral Idea</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Caption</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Keywords</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Hashtags</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Posting Time</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Run Ad Campaign</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">Lead Goal</th>
                          <th className="px-4 py-3 border-r border-[#D2DEC1] dark:border-[#263c25]">CTA</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredContentItems.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="text-center py-16 bg-secondary/10 text-muted-foreground font-semibold">
                              <HelpCircle className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                              <h4>No Items Match Filter</h4>
                              <p className="text-xs mt-1">Try resetting your search query.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredContentItems.map((item) => {
                            const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
                            
                            return (
                              <tr 
                                key={item.id} 
                                className={`hover:bg-secondary/35 transition-all even:bg-secondary/15 ${
                                  status === 'posted' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                                  status === 'completed' ? 'bg-blue-500/5 hover:bg-blue-500/10' : ''
                                }`}
                              >
                                {/* Date */}
                                <td className="px-4 py-3 font-bold border-r border-border/40 whitespace-nowrap text-foreground">{item.date}</td>
                                {/* Day */}
                                <td className="px-4 py-3 text-muted-foreground border-r border-border/40 whitespace-nowrap">{item.day}</td>
                                {/* Type */}
                                <td className="px-4 py-3 border-r border-border/40 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border shadow-sm ${
                                    item.contentType === 'Reel' 
                                      ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' 
                                      : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                                  }`}>
                                    {item.contentType === 'Reel' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                                    {item.contentType}
                                  </span>
                                </td>
                                {/* Topic */}
                                <td className="px-4 py-3 font-extrabold border-r border-border/40 text-foreground whitespace-nowrap">{item.topic}</td>
                                {/* Special Day */}
                                <td className="px-4 py-3 border-r border-border/40 font-medium">
                                  {item.specialDay ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                                      ✨ {item.specialDay}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </td>
                                {/* Content / Viral Idea */}
                                <td className="px-4 py-3 border-r border-border/40 font-semibold text-indigo-400 min-w-[200px]">
                                  {item.viralIdea ? (
                                    <span className="flex items-center gap-1">
                                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                                      {item.viralIdea}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </td>
                                {/* Caption */}
                                <td className="px-4 py-3 border-r border-border/40 min-w-[280px]">
                                  <div 
                                    className="max-h-[60px] overflow-y-auto pr-1 text-[11px] font-medium text-foreground/80 leading-relaxed select-all hover:bg-secondary/60 p-1.5 rounded transition-all cursor-pointer" 
                                    title="Double click or select text to copy"
                                  >
                                    {item.caption}
                                  </div>
                                </td>
                                {/* Keywords */}
                                <td className="px-4 py-3 border-r border-border/40 min-w-[150px]">
                                  <div className="flex flex-wrap gap-1">
                                    {item.keywords.split(',').map((kw, kIdx) => kw.trim() && (
                                      <span key={kIdx} className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/40 whitespace-nowrap">
                                        {kw.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                {/* Hashtags */}
                                <td className="px-4 py-3 border-r border-border/40 min-w-[180px]">
                                  <div className="flex flex-wrap gap-1">
                                    {item.hashtags.split(' ').map((tag, tIdx) => tag.trim() && (
                                      <span key={tIdx} className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                {/* Posting Time */}
                                <td className="px-4 py-3 border-r border-border/40 font-bold text-muted-foreground whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                                    <Clock className="h-2.5 w-2.5" />
                                    {item.postingTime}
                                  </span>
                                </td>
                                {/* Run Ad Campaign */}
                                <td className="px-4 py-3 border-r border-border/40 text-center whitespace-nowrap">
                                  {item.runAdCampaign === 'YES' ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest shadow-sm">
                                      ★ YES ★
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[9px] font-black bg-secondary text-muted-foreground/60 px-2 py-0.5 rounded-lg border border-border/60 uppercase tracking-widest">
                                      NO
                                    </span>
                                  )}
                                </td>
                                {/* Lead Goal */}
                                <td className="px-4 py-3 border-r border-border/40 font-bold text-indigo-400 whitespace-nowrap">
                                  {item.leadGoal !== '-' ? (
                                    <span className="bg-indigo-500/10 px-2 py-0.5 rounded text-[10px]">
                                      {item.leadGoal}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </td>
                                {/* CTA */}
                                <td className="px-4 py-3 border-r border-border/40 whitespace-nowrap">
                                  {item.cta ? (
                                    <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-amber-500/20">
                                      {item.cta}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </td>
                                {/* Status */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                      status === 'posted' ? 'bg-emerald-500' :
                                      status === 'completed' ? 'bg-blue-500' :
                                      'bg-amber-500 animate-pulse'
                                    }`}></span>
                                    
                                    {isClient ? (
                                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${
                                        status === 'posted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        status === 'completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                        'bg-secondary border-border text-foreground'
                                      }`}>
                                        {status === 'posted' ? '🟢 Posted' :
                                         status === 'completed' ? '🔵 Completed' :
                                         '🟡 In Progress'}
                                      </span>
                                    ) : (
                                      <select
                                        value={status}
                                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black focus:outline-none focus:ring-1 focus:ring-indigo-500/10 cursor-pointer border shadow-sm select-none ${
                                          status === 'posted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                          status === 'completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                          'bg-secondary border-border text-foreground'
                                        }`}
                                      >
                                        <option value="inprogress" className="bg-card text-foreground font-semibold">🟡 In Progress</option>
                                        <option value="completed" className="bg-card text-foreground font-semibold">🔵 Completed</option>
                                        <option value="posted" className="bg-card text-foreground font-semibold">🟢 Posted</option>
                                      </select>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* ================= ORIGINAL CARD VIEW ================= */
                  <div className="space-y-6 max-h-[850px] overflow-y-auto pr-2">
                    {filteredContentItems.length === 0 ? (
                      <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
                        <HelpCircle className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-foreground">No Items Match Filter</h4>
                        <p className="text-xs text-muted-foreground mt-1">Try resetting your search filter query.</p>
                      </div>
                    ) : (
                      filteredContentItems.map((item, idx) => {
                        const status = platformStatuses[`${item.id}_${activePlatform}`] || 'inprogress';
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-start gap-4 shadow-sm hover:shadow-md ${
                              status === 'posted' ? 'bg-[#2E9EDE]/5 border-[#2E9EDE]/20 hover:border-[#2E9EDE]/40' :
                              status === 'completed' ? 'bg-sky-50/50 border-sky-100 hover:border-sky-300' :
                              'bg-card border-border hover:border-[#2E9EDE]/30'
                            }`}
                          >
                            
                            {/* Date and Content Type Visual Indicator */}
                            <div className="flex flex-row md:flex-col items-center justify-between md:justify-start md:items-start gap-2.5 md:w-32 flex-shrink-0">
                              
                              {/* Date Badge */}
                              <div>
                                <p className="text-xs font-black text-foreground">{item.date}</p>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-0.5">{item.day}</p>
                              </div>

                              {/* Content Type Badge */}
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase border shadow-sm ${
                                item.contentType === 'Reel' 
                                  ? 'bg-[#2E9EDE]/5 text-[#2E9EDE] border-[#2E9EDE]/15' 
                                  : 'bg-[#2E9EDE]/15 text-[#2E9EDE] border-[#2E9EDE]/25'
                              }`}>
                                {item.contentType === 'Reel' ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                                {item.contentType}
                              </span>

                              {/* Time Badge */}
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
                                <Clock className="h-3 w-3" />
                                {item.postingTime}
                              </span>

                            </div>

                            {/* Post Contents Body */}
                            <div className="flex-grow space-y-3">
                              <div>
                                {/* Special Day Badge */}
                                {item.specialDay && (
                                  <span className="inline-flex items-center gap-1 bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse mb-2.5 block w-fit">
                                    ✨ Special Day: {item.specialDay}
                                  </span>
                                )}

                                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">
                                  {item.topic}
                                </h3>
                                
                                {/* Viral Content Idea */}
                                {item.viralIdea && (
                                  <p className="text-xs text-[#2E9EDE] font-semibold italic mt-1.5 flex items-center gap-1">
                                    <Lightbulb className="h-3.5 w-3.5 text-[#2E9EDE] flex-shrink-0" />
                                    Viral Idea: {item.viralIdea}
                                  </p>
                                )}
                              </div>

                              {/* Post Caption Body */}
                              {item.caption && (
                                <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 text-xs font-semibold text-foreground/80 leading-relaxed max-w-2xl">
                                  {item.caption}
                                </div>
                              )}

                              {/* Keywords and Hashtags */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {item.hashtags.split(' ').map((tag, tIdx) => tag && (
                                  <span key={tIdx} className="text-[10px] font-bold text-[#2E9EDE] bg-[#2E9EDE]/5 px-2.5 py-0.5 rounded-md">
                                    {tag}
                                  </span>
                                ))}
                                {item.keywords.split(',').map((kw, kIdx) => kw && (
                                  <span key={kIdx} className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-md border border-border/40">
                                    {kw.trim()}
                                  </span>
                                ))}
                              </div>

                              {/* CTA & Campaign Tag */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {item.cta && (
                                  <span className="text-[10px] font-extrabold bg-[#2E9EDE]/10 text-[#2E9EDE] px-3 py-1 rounded-full uppercase tracking-wider border border-[#2E9EDE]/20">
                                    CTA: {item.cta}
                                  </span>
                                )}
                                {item.runAdCampaign === 'YES' && (
                                  <span className="text-[9px] font-bold bg-[#2E9EDE]/10 text-[#2E9EDE] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#2E9EDE]/20 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Campaign Configured
                                  </span>
                                )}
                              </div>

                            </div>

                            {/* Branded Status Selection dropdown for active account */}
                            <div className="flex-shrink-0 md:w-36 mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                              
                              {/* Branded status indicator */}
                              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                status === 'posted' ? 'bg-[#2E9EDE] text-white border-[#2E9EDE]' :
                                status === 'completed' ? 'bg-[#2E9EDE]/10 text-[#2E9EDE] border-[#2E9EDE]/20' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {status === 'posted' ? 'Posted' : status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>

                              {/* Interactive Status Selector */}
                              {!isClient && (
                                <div className="w-full relative">
                                  <select
                                    value={status}
                                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-[#2E9EDE]/10 cursor-pointer border shadow-sm select-none ${
                                      status === 'posted' ? 'bg-[#2E9EDE] border-[#2E9EDE] text-white' :
                                      status === 'completed' ? 'bg-[#2E9EDE]/10 border-[#2E9EDE]/20 text-[#2E9EDE]' :
                                      'bg-secondary border-border text-foreground'
                                    }`}
                                  >
                                    <option value="inprogress" className="bg-card text-foreground font-semibold">🟡 In Progress</option>
                                    <option value="completed" className="bg-card text-foreground font-semibold">🔵 Completed</option>
                                    <option value="posted" className="bg-card text-foreground font-semibold">🟢 Posted</option>
                                  </select>
                                </div>
                              )}

                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* ==================================================== */}
            {/* AD CAMPAIGNS PANEL & STATS (Right Columns)            */}
            {/* ==================================================== */}
            <div className={`${viewMode === 'table' ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 space-y-0' : 'lg:col-span-4 space-y-6'} transition-all duration-300`}>
              
              {/* Ad Campaigns operations tracker card */}
              <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                
                {/* Title */}
                <div className="border-b border-border pb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5.5 w-5.5 text-[#2E9EDE]" />
                    <h2 className="text-lg font-bold text-foreground">Ad Campaigns Operations</h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Manage active running lead-gen campaign phases configured from the sheet
                  </p>
                </div>

                {/* Campaigns List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {adCampaignRows.length === 0 ? (
                    <div className="text-center py-8 bg-secondary/35 rounded-2xl border border-dashed border-border">
                      <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-bold">No Ad Campaigns</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rows with Run Ad Campaign === YES appear here</p>
                    </div>
                  ) : (
                    adCampaignRows.map((item) => {
                      const activeState = campaignStatuses[item.id] || 'inprogress';

                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded-xl border transition-all duration-300 space-y-3 ${
                            activeState === 'running'
                              ? 'bg-[#2E9EDE]/5 border-[#2E9EDE]/20 shadow-sm'
                              : 'bg-secondary/40 border-border'
                          }`}
                        >
                          {/* Header info */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-muted-foreground">{item.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              activeState === 'running'
                                ? 'bg-[#2E9EDE]/10 text-[#2E9EDE] border border-[#2E9EDE]/20'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {activeState === 'running' ? 'Running' : 'In Progress'}
                            </span>
                          </div>

                          {/* Topic and leads info */}
                          <div>
                            <h4 className="text-xs font-extrabold text-foreground leading-tight">{item.topic}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] font-bold text-[#2E9EDE] bg-[#2E9EDE]/10 px-2 py-0.5 rounded">
                                Goal: {item.leadGoal}
                              </span>
                              <span className="text-[9px] font-semibold text-muted-foreground">
                                CTA: {item.cta}
                              </span>
                            </div>
                          </div>

                          {/* Ad running phase action toggles */}
                          <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-4">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Running State</span>
                            
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCampaignStatus(item.id, 'inprogress')}
                                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                  activeState === 'inprogress'
                                    ? 'bg-slate-200 border-slate-300 text-slate-700 shadow-sm'
                                    : 'bg-card border-border hover:bg-secondary text-muted-foreground'
                                }`}
                              >
                                In Progress
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCampaignStatus(item.id, 'running')}
                                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                  activeState === 'running'
                                    ? 'bg-[#2E9EDE]/20 border-[#2E9EDE]/30 text-[#2E9EDE] shadow-sm'
                                    : 'bg-card border-border hover:bg-secondary text-muted-foreground'
                                }`}
                              >
                                Run
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Mapped platforms information card */}
              <div className="bg-card rounded-[32px] p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5.5 w-5.5 text-[#2E9EDE]" />
                  <h3 className="text-base font-extrabold text-foreground">Employee Accounts</h3>
                </div>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  Statuses are synchronized live into the active system state. Changing platforms in the top tabs toggles the workspace to update specific credentials records.
                </p>

                <div className="p-3 bg-secondary/50 rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                    <span>Instagram Profile:</span>
                    <span className="text-[10px] text-[#2E9EDE] font-extrabold bg-[#2E9EDE]/10 px-2 py-0.5 rounded-md uppercase">Connected</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                    <span>Facebook Page:</span>
                    <span className="text-[10px] text-[#2E9EDE] font-extrabold bg-[#2E9EDE]/10 px-2 py-0.5 rounded-md uppercase">Connected</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                    <span>YouTube Channel:</span>
                    <span className="text-[10px] text-[#2E9EDE] font-extrabold bg-[#2E9EDE]/10 px-2 py-0.5 rounded-md uppercase">Connected</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </>
    )}

      {/* ===== ChatGPT Prompt Strategy Workspace Clone ===== */}
      {activeTab === 'chatgpt' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
          
          {/* Mock Browser/ChatGPT Header */}
          <div className="bg-[#171717] rounded-[32px] border border-zinc-800 text-zinc-200 overflow-hidden shadow-2xl flex flex-col h-[650px]">
            
            {/* Mock Address Bar */}
            <div className="bg-[#0d0d0d] px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold truncate">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
                <span className="font-mono text-zinc-500 truncate">chatgpt.com/share/6a1a465b-bb28-8323-919a-2b0feaee6fab</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChatGptMessages([
                    {
                      sender: 'user',
                      text: `I need a high-converting digital marketing calendar for "maharaja catering" in Tamil Nadu. The deliverables promised to the client are 15 posters and 6 reels for a month. We must deliver these on respective days. \n\nWe also need to run 2 ad campaigns per month to get wedding and event leads. The calendar must specify special holiday posters (India and Tamil Nadu), posting times, lead goals, and strong CTAs for each post type. \n\nCan you generate a chronological 21-row content strategy starting in June 2026? Alternate between Posters and Reels where appropriate.`,
                      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    },
                    {
                      sender: 'gpt',
                      text: `Certainly! Here is a premium, localized, high-converting content calendar designed for "Sri Maharaja Catering" targeting the South Indian wedding and event market in Tamil Nadu.

I have structured this calendar to alternate between high-fidelity Posters and highly engaging video Reels. Special days (like World Environment Day, Father's Day, and International Yoga Day) are highlighted with specific content themes.

Here is a summary of the 21-row calendar synced into your Operations Hub:
• **15 Posters / 6 Reels** configured for optimal reach.
• **Special Day Columns** mapped natively matching your custom dates.
• **High-Intent CTAs** (DM For Booking, WhatsApp Now, Enquire Today).
• **2 Lead-Gen Ad Campaigns** configured under your ad operations board.`,
                      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    }
                  ])}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border border-zinc-700 active:scale-95"
                  title="Reset conversation thread"
                >
                  Reset Thread
                </button>
                <a
                  href="https://chatgpt.com/share/6a1a465b-bb28-8323-919a-2b0feaee6fab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 flex-shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Open Live Thread
                </a>
              </div>
            </div>

            {/* Conversation Box */}
            <div className="p-6 flex-grow space-y-6 overflow-y-auto bg-[#212121] flex flex-col">
              
              {chatGptMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 items-start p-5 rounded-2xl border border-zinc-800/80 max-w-4xl w-full ${
                    msg.sender === 'user'
                      ? 'bg-[#2f2f2f] text-zinc-100 mr-auto'
                      : 'bg-[#2f2f2f] text-zinc-200 ml-auto border-l-4 border-l-emerald-500'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <div className="h-9 w-9 rounded-full bg-indigo-600 border border-indigo-500 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs shadow-sm uppercase">
                      {user?.username ? user.username[0] : 'U'}
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black shadow-sm">
                      GPT
                    </div>
                  )}

                  <div className="space-y-2 flex-grow">
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${
                      msg.sender === 'user' ? 'text-indigo-400' : 'text-emerald-400'
                    }`}>
                      {msg.sender === 'user' ? 'Campaign Prompt Strategy' : 'Catering Campaign response'}
                    </span>
                    <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-zinc-200">
                      {msg.text}
                    </p>
                    <span className="text-[9px] font-bold text-zinc-500 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* ChatGPT Typing Cursor */}
              {chatGptLoading && (
                <div className="flex gap-4 items-start bg-[#2f2f2f] p-5 rounded-2xl border border-zinc-800/80 max-w-4xl w-full ml-auto border-l-4 border-l-emerald-500 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black shadow-sm">
                    GPT
                  </div>
                  <div className="space-y-2 flex-grow">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">
                      ChatGPT is typing...
                    </span>
                    <div className="flex items-center space-x-1.5 py-2">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatGptEndRef} />
            </div>

            {/* ChatGPT Pill-Shaped Signature Input Bar */}
            <div className="bg-[#171717] px-6 py-4 border-t border-zinc-800 flex flex-col gap-3">
              
              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto w-full">
                <button
                  type="button"
                  onClick={() => handleSendChatGptMessage('Suggest hashtags')}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white bg-[#2f2f2f] hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  #️⃣ Suggestions for catering hashtags
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatGptMessage('Write a post caption')}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white bg-[#2f2f2f] hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  📝 Instagram caption for luxury wedding
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatGptMessage('Draft Meta ad copy')}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white bg-[#2f2f2f] hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  🎯 High-intent Meta Lead ad copy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatGptMessage('World Environment Day strategy')}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white bg-[#2f2f2f] hover:bg-zinc-800 border border-zinc-700/60 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  🌿 Sustainable campaign copy
                </button>
              </div>

              {/* Text Input Container */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatGptMessage();
                }}
                className="relative max-w-3xl mx-auto w-full flex items-center bg-[#2f2f2f] border border-zinc-700/80 rounded-3xl p-1.5 shadow-inner"
              >
                <input
                  type="text"
                  placeholder="Message ChatGPT..."
                  value={chatGptInput}
                  onChange={(e) => setChatGptInput(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none pl-4 pr-14 py-2.5"
                  disabled={chatGptLoading}
                />
                <button
                  type="submit"
                  disabled={!chatGptInput.trim() || chatGptLoading}
                  className="absolute right-3 top-3 h-8 w-8 bg-zinc-100 hover:bg-zinc-200 text-black font-bold flex items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:hover:bg-zinc-100 cursor-pointer shadow-md flex-shrink-0"
                  title="Send message"
                >
                  <SendIcon className="h-4 w-4 text-black" />
                </button>
              </form>

              <div className="text-center text-[9px] text-zinc-500 font-semibold italic">
                ChatGPT can make mistakes. Verify important info. • Scraped shared thread 6a1a465b-bb28-8323-919a-2b0feaee6fab
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ===== Interactive Floating ChatGPT Pop-up Widget ===== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Widget Window */}
        {chatOpen && (
          <div className="w-[380px] h-[520px] bg-[#212121] border border-zinc-800 shadow-2xl rounded-[28px] overflow-hidden mb-4 flex flex-col animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="p-4 bg-[#0d0d0d] border-b border-zinc-800 text-zinc-200 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 rounded-full bg-[#10a37f] flex items-center justify-center shadow-inner border border-zinc-800">
                  <span className="text-[10px] font-black text-white">GPT</span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-[#0d0d0d]"></span>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wide uppercase text-zinc-100">ChatGPT</h4>
                  <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    GPT-4 Model Active
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => setChatMessages([
                    {
                      sender: 'ai',
                      text: `👋 Hello! I am your ChatGPT Marketing Copilot for **Sri Maharaja Catering**.\n\nI can instantly write copy or brainstorm for you:\n• 📝 **Draft posts/reels captions**\n• #️⃣ **Generate high-engagement hashtags**\n• 🎯 **Write Meta Lead-Gen ad copies**\n• 🌿 **Suggest holiday greeting content**\n\nWhat would you like me to do?`,
                      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    }
                  ])}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-white active:scale-95 cursor-pointer"
                  title="Reset conversation"
                >
                  <History className="h-4 w-4" />
                </button>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-white active:scale-95 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#212121] flex flex-col text-zinc-200">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-zinc-700 text-white rounded-tr-none'
                        : 'bg-[#2f2f2f] border border-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 mt-1.5 px-1 tracking-wider uppercase">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              
              {/* Typing loader */}
              {chatLoading && (
                <div className="flex items-center space-x-1.5 self-start bg-[#2f2f2f] border border-zinc-850 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm animate-pulse">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="px-4 py-2 bg-[#171717] border-t border-zinc-800 flex flex-wrap gap-1.5 justify-start">
              <button
                type="button"
                onClick={() => handleSendMessage('Suggest hashtags')}
                className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-2 py-1 rounded-lg transition-all cursor-pointer"
              >
                #️⃣ Hashtags
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Write a caption')}
                className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-2 py-1 rounded-lg transition-all cursor-pointer"
              >
                📝 Caption
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Write Ad copy')}
                className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-2 py-1 rounded-lg transition-all cursor-pointer"
              >
                🎯 Meta Ad Copy
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Environment Day')}
                className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-2 py-1 rounded-lg transition-all cursor-pointer"
              >
                🌿 June 5th
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#0d0d0d] border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Message ChatGPT..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow bg-[#2f2f2f] border border-zinc-700/60 rounded-2xl px-3.5 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700/50"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200 text-black flex items-center justify-center rounded-full disabled:opacity-30 disabled:hover:bg-zinc-100 transition-all cursor-pointer flex-shrink-0"
              >
                <SendIcon className="h-4 w-4 text-black" />
              </button>
            </form>
          </div>
        )}

        {/* Floating trigger button */}
        <button
          type="button"
          onClick={() => setChatOpen(!chatOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer relative ${
            chatOpen
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 rotate-90'
              : 'bg-[#10a37f] hover:scale-105 shadow-emerald-600/30 border border-emerald-500/30'
          }`}
        >
          {chatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">GPT</span>
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-amber-500 text-black text-[9px] font-black uppercase flex items-center justify-center rounded-full border border-card animate-pulse shadow-sm">
                AI
              </span>
            </>
          )}
        </button>
      </div>

      </div>
    </DashboardLayout>
  );
}
