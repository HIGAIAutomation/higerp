"use client";

import HIGLogo from "@/components/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Briefcase,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    CreditCard,
    LayoutDashboard,
    LifeBuoy,
    LogOut,
    Package,
    ShieldAlert,
    TrendingUp,
    UserCheck,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "HRMS", href: "/dashboard/hrms", icon: Users },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
  { name: "CRM", href: "/dashboard/crm", icon: TrendingUp },
  { name: "Finance", href: "/dashboard/finance", icon: CreditCard },
  { name: "Assets", href: "/dashboard/assets", icon: Package },
  { name: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { name: "Clients", href: "/dashboard/clients", icon: UserCheck },
  { name: "Attendance & Tasks", href: "/dashboard/attendance-tasks", icon: ClipboardCheck },
];

export function Sidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [projectsExpanded, setProjectsExpanded] = useState(pathname.startsWith("/dashboard/projects"));
  const [hrmsExpanded, setHrmsExpanded] = useState(pathname.startsWith("/dashboard/hrms"));
  const [crmExpanded, setCrmExpanded] = useState(pathname.startsWith("/dashboard/crm"));
  const [projectCategory, setProjectCategory] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'superadmin';
  const pageAccessList = user?.pageAccess || [];
  const isClientUser = user?.role === 'client' || user?.id?.startsWith('higc-') || (user?.role === 'user' && !(user as any).employee);

  useEffect(() => {
    if (isClientUser) {
      import('@/lib/api').then(({ fetchWithAuth }) => {
        fetchWithAuth('/projects')
          .then((allProjects: any) => {
            const filtered = allProjects.filter((p: any) => p.clientId === user?.id);
            if (filtered.length > 0) {
              setProjectCategory(filtered[0].category || 'Digital Marketing');
            }
          })
          .catch((err) => console.error("Error fetching projects in sidebar:", err));
      });
    }
  }, [user, isClientUser]);

  // Determine project tracking link based on category
  let projectTrackHref = "/dashboard"; // Default fallback
  if (projectCategory) {
    const cat = projectCategory.toLowerCase();
    if (cat.includes("web") || cat.includes("app")) {
      projectTrackHref = "/dashboard/projects/web-app";
    } else if (cat.includes("marketing")) {
      projectTrackHref = "/dashboard/projects/digital-marketing";
    } else if (cat.includes("automation")) {
      projectTrackHref = "/dashboard/projects/automation";
    } else if (cat.includes("ai")) {
      projectTrackHref = "/dashboard/projects/ai";
    }
  }

  // Filter navigation links
  let visibleNavigation: any[] = [];
  
  const isAdmin = isSuperAdmin || user?.role === 'admin';

  if (user?.role === "intern") {
    visibleNavigation = [
      { name: "My Profile", href: "/dashboard/profile", icon: UserCheck },
      { name: "Internship Tracking (Coming Soon)", href: "#", icon: ClipboardCheck, disabled: true }
    ];
  } else if (isClientUser) {
    let trackName = "Project Tracking";
    if (projectCategory) {
      const cat = projectCategory.toLowerCase();
      if (cat.includes("web") || cat.includes("app")) {
        trackName = "Web/App Dev Tracking";
      } else if (cat.includes("marketing")) {
        trackName = "Digital Marketing Tracking";
      } else if (cat.includes("automation")) {
        trackName = "Automation Tracking";
      } else if (cat.includes("ai")) {
        trackName = "AI Dev Tracking";
      }
    }
    visibleNavigation = [
      { name: "My Profile", href: "/dashboard/profile", icon: UserCheck },
      { name: trackName, href: projectTrackHref, icon: Briefcase },
      { name: "Payment", href: "/dashboard/payments", icon: CreditCard },
    ];
  } else if (isAdmin) {
    // Admin and Superadmin see all pages, including Dashboard home
    visibleNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ...navigation.filter((item) => item.href !== "/dashboard"),
      { name: "My Profile", href: "/dashboard/profile", icon: UserCheck }
    ];
  } else {
    // Employees see My Profile + their allowed pages
    visibleNavigation = [
      { name: "My Profile", href: "/dashboard/profile", icon: UserCheck }
    ];
    const filteredNav = navigation.filter((item) => {
      // Hide Dashboard home link for employees since they don't access dashboard home page
      return pageAccessList.includes(item.href) && item.href !== "/dashboard";
    });
    visibleNavigation = [...visibleNavigation, ...filteredNav];
  }

  // If superadmin, add Access Control to the menu list
  if (isSuperAdmin) {
    visibleNavigation.push({
      name: "Access Control",
      href: "/dashboard/access-control",
      icon: ShieldAlert
    });
  }

  const initials = user?.username 
    ? user.username.slice(0, 2).toUpperCase() 
    : "US";

  return (
    <div className="flex h-full w-64 flex-col bg-card text-foreground border-r border-border shadow-2xl">
      <div className="flex h-20 items-center px-6 gap-3">
        <HIGLogo size={36} className="rounded-lg" />
        <span className="text-xl font-bold tracking-tight text-foreground">
          AI <span className="text-accent font-semibold">ERP</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {visibleNavigation.map((item) => {
          if (item.href === "/dashboard/hrms") {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setHrmsExpanded(!hrmsExpanded)}
                  className={cn(
                    "w-full group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                    pathname.startsWith("/dashboard/hrms")
                      ? "bg-accent/10 text-accent shadow-inner"
                      : "text-foreground/70 hover:bg-accent/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </div>
                  {hrmsExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground/50" />
                  )}
                </button>
                {hrmsExpanded && (
                  <div className="pl-8 space-y-1 pr-2 transition-all duration-200">
                    <Link
                      href="/dashboard/hrms"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/hrms"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Employee Directory
                    </Link>
                    <Link
                      href="/dashboard/hrms/offboarding"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/hrms/offboarding"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Offboarding
                    </Link>
                    <Link
                      href="/dashboard/hrms/payroll"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/hrms/payroll"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Payroll Tracking
                    </Link>
                    <Link
                      href="/dashboard/hrms/birthdays"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/hrms/birthdays"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Birthdays & Posters
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          if (item.href === "/dashboard/projects") {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className={cn(
                    "w-full group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                    pathname.startsWith("/dashboard/projects")
                      ? "bg-accent/10 text-accent shadow-inner"
                      : "text-foreground/70 hover:bg-accent/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </div>
                  {projectsExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground/50" />
                  )}
                </button>
                {projectsExpanded && (
                  <div className="pl-8 space-y-1 pr-2 transition-all duration-200">
                    <Link
                      href="/dashboard/projects"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/projects"
                          ? "text-accent bg-accent/5"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      All Projects
                    </Link>
                    <Link
                      href="/dashboard/projects/digital-marketing"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/projects/digital-marketing"
                          ? "text-accent bg-accent/5"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Digital Marketing
                    </Link>
                    {isSuperAdmin && (
                      <>
                        <Link
                          href="/dashboard/projects/web-app"
                          onClick={onClose}
                          className={cn(
                            "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                            pathname === "/dashboard/projects/web-app"
                              ? "text-accent bg-accent/5"
                              : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                          )}
                        >
                          Web/App Development
                        </Link>
                        <Link
                          href="/dashboard/projects/automation"
                          onClick={onClose}
                          className={cn(
                            "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                            pathname === "/dashboard/projects/automation"
                              ? "text-accent bg-accent/5"
                              : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                          )}
                        >
                          Automation
                        </Link>
                        <Link
                          href="/dashboard/projects/ai"
                          onClick={onClose}
                          className={cn(
                            "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                            pathname === "/dashboard/projects/ai"
                              ? "text-accent bg-accent/5"
                              : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                          )}
                        >
                          AI Development
                        </Link>
                        <Link
                          href="/dashboard/projects/payments"
                          onClick={onClose}
                          className={cn(
                            "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                            pathname === "/dashboard/projects/payments"
                              ? "text-accent bg-accent/5"
                              : "text-amber-600 hover:text-amber-500 hover:bg-accent/5"
                          )}
                        >
                          Payment Tracking
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          }

          if (item.href === "/dashboard/crm") {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCrmExpanded(!crmExpanded)}
                  className={cn(
                    "w-full group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                    pathname.startsWith("/dashboard/crm")
                      ? "bg-accent/10 text-accent shadow-inner"
                      : "text-foreground/70 hover:bg-accent/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </div>
                  {crmExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground/50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground/50" />
                  )}
                </button>
                {crmExpanded && (
                  <div className="pl-8 space-y-1 pr-2 transition-all duration-200">
                    <Link
                      href="/dashboard/crm"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/crm"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Sales Pipeline
                    </Link>
                    <Link
                      href="/dashboard/crm/services"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/crm/services"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Available Services
                    </Link>
                    <Link
                      href="/dashboard/crm/followups"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/crm/followups"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Follow Ups
                    </Link>
                    <Link
                      href="/dashboard/crm/closed-leads"
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                        pathname === "/dashboard/crm/closed-leads"
                          ? "text-accent bg-accent/5 font-bold"
                          : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      Closed Leads
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === item.href
                  ? "bg-accent/10 text-accent shadow-inner font-bold"
                  : "text-foreground/70 hover:bg-accent/5 hover:text-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* User Session Profile & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center px-3 py-3 rounded-xl bg-accent/5">
          <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-xs font-semibold truncate text-foreground">
              {user?.username 
                ? user.username.replace(/([a-zA-Z]+)(\d+)/g, '$1 $2').split(/[\s_-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
                : 'Guest'}
            </p>
            <p className="text-[10px] text-foreground/50 capitalize truncate">{user?.role || 'Guest'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl border border-border text-foreground/70 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
