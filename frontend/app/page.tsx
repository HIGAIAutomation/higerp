import HIGLogo from "@/components/logo";
import { LogIn, Mail, MapPin, Phone, Shield, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const modules = [
  { name: 'HRMS', href: '/dashboard/hrms', icon: '👥', desc: 'Talent & Payroll' },
  { name: 'Projects', href: '/dashboard/projects', icon: '🚀', desc: 'Project Tracker' },
  { name: 'CRM', href: '/dashboard/crm', icon: '📈', desc: 'Sales Pipeline' },
  { name: 'Finance', href: '/dashboard/finance', icon: '💰', desc: 'Financial Control' },
];

const companyDetails = {
  name: 'HIG AI Automation LLP',
  registration: 'AAO-4218',
  gstin: 'GSTIN: 33ACFHH7098M1ZK',
  address: 'Chennai, Tamil Nadu, India',
  email: 'info@higai.in',
  phone: '+91 98765 43210',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col text-center relative overflow-hidden">
      {/* Background gradient blobs - Responsive sizing */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 sm:-top-40 sm:-left-40 w-64 h-64 sm:w-[600px] sm:h-[600px] rounded-full bg-accent/5 blur-2xl sm:blur-3xl" />
        <div className="absolute -bottom-40 -right-40 sm:-bottom-40 sm:-right-40 w-64 h-64 sm:w-[600px] sm:h-[600px] rounded-full bg-primary/5 blur-2xl sm:blur-3xl" />
      </div>

      {/* Floating Header - Mobile optimized */}
      <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="max-w-7xl mx-auto glass border border-primary/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg flex-wrap gap-3 sm:gap-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <HIGLogo size={32} className="rounded-lg sm:rounded-xl shadow-md flex-shrink-0" />
            <div className="text-left hidden sm:block">
              <p className="text-xs sm:text-sm font-bold text-primary leading-tight">HIG AI Automation</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold tracking-wide">Enterprise ERP Platform</p>
            </div>
          </Link>

          {/* Desktop info - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent flex-shrink-0" /> Chennai, India</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-accent flex-shrink-0" /> Reg: {companyDetails.registration}</span>
          </div>

          {/* Buttons - Responsive sizing */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-primary font-bold text-xs sm:text-sm hover:bg-primary/5 transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
            >
              <LogIn className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
              <span className="sm:hidden">In</span>
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-background font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 sm:gap-1.5 shadow-md shadow-primary/10 whitespace-nowrap"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile optimized */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 gap-4 sm:gap-8">
        {/* Company Logo */}
        <div className="mb-4 sm:mb-8 relative">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150" />
          <Image
            src="/logo.png"
            alt="HIG AI Automation LLP"
            width={80}
            height={80}
            className="relative rounded-2xl sm:rounded-3xl shadow-2xl shadow-accent/30 border-4 border-white/10"
            priority
          />
        </div>

        <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary font-medium text-[10px] sm:text-sm tracking-wide">
          AI-FIRST ENTERPRISE OPERATING SYSTEM
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-primary mb-2 sm:mb-4 leading-tight">
          HIG AI <span className="text-accent">Automation</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-inter mb-1 sm:mb-2">
          The complete digital operating system for your enterprise.
          Intelligent, automated, and built for the future.
        </p>

        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mb-6 sm:mb-16">
          {companyDetails.name} · {companyDetails.registration} · {companyDetails.gstin}
        </p>

        {/* CTA Buttons - Responsive stack */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-primary text-background font-bold text-sm sm:text-base hover:scale-105 transition-all shadow-xl shadow-primary/20 w-full sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl glass border border-primary/10 text-primary font-bold text-sm sm:text-base hover:bg-primary/5 transition-all w-full sm:w-auto"
          >
            Book a Demo
          </Link>
        </div>

        {/* Module Cards - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="p-4 sm:p-5 rounded-lg sm:rounded-2xl glass border border-primary/5 text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl mb-2">{module.icon}</div>
              <div className="font-bold text-xs sm:text-sm">{module.name}</div>
              <div className="text-[8px] sm:text-[10px] text-muted-foreground mt-0.5">{module.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer - Mobile optimized */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left mb-4 sm:mb-6">
            {/* Company Info */}
            <div className="flex items-start gap-2 sm:gap-3">
              <HIGLogo size={40} className="rounded-lg sm:rounded-xl mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-primary text-xs sm:text-sm">{companyDetails.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">AI-powered ERP & Automation Platform</p>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md inline-block w-fit">
                    LLP Reg: {companyDetails.registration}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md inline-block w-fit break-all">
                    {companyDetails.gstin}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">Contact</p>
              <div className="space-y-1 sm:space-y-2">
                <a href={`mailto:${companyDetails.email}`} className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors break-all">
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0 mt-0.5" />
                  {companyDetails.email}
                </a>
                <a href={`tel:${companyDetails.phone}`} className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0" />
                  {companyDetails.phone}
                </a>
                <div className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0 mt-0.5" />
                  <span>{companyDetails.address}</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">Platform</p>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                {['HRMS', 'Projects', 'CRM', 'Finance', 'Assets', 'Knowledge'].map(m => (
                  <Link
                    key={m}
                    href={`/dashboard/${m.toLowerCase()}`}
                    className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-border/40 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} {companyDetails.name}. All rights reserved.
            </p>
            {/* removed tagline as requested */}
          </div>
        </div>
      </footer>
    </main>
  );
}
