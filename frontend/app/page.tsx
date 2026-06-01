import Link from "next/link";
import Image from "next/image";
import { LogIn, UserPlus, MapPin, Phone, Mail, Building2, FileText, Shield } from "lucide-react";
import HIGLogo from "@/components/logo";

const modules = [
  { name: 'HRMS', href: '/dashboard/hrms', icon: '👥', desc: 'Talent & Payroll' },
  { name: 'Projects', href: '/dashboard/projects', icon: '🚀', desc: 'Project Tracker' },
  { name: 'CRM', href: '/dashboard/crm', icon: '📈', desc: 'Sales Pipeline' },
  { name: 'Finance', href: '/dashboard/finance', icon: '💰', desc: 'Financial Control' },
];

const companyDetails = {
  name: 'HIG AI Automation LLP',
  registration: 'AAO-4218', // LLP Registration Number
  gstin: 'GSTIN: 33ACFHH7098M1ZK',
  address: 'Chennai, Tamil Nadu, India',
  email: 'info@higai.in',
  phone: '+91 98765 43210',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col text-center relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Floating Header */}
      <header className="sticky top-0 z-50 px-6 pt-6">
        <div className="max-w-7xl mx-auto glass border border-primary/10 px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
          <Link href="/" className="flex items-center gap-3">
            <HIGLogo size={40} className="rounded-xl shadow-md" />
            <div className="text-left">
              <p className="text-sm font-bold text-primary leading-tight">HIG AI Automation</p>
              <p className="text-[10px] text-muted-foreground font-semibold tracking-wide">Enterprise ERP Platform</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" /> Chennai, India</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-accent" /> Reg: {companyDetails.registration}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-primary font-bold text-sm hover:bg-primary/5 transition-all flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-primary/10"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Company Logo — Large Hero */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150" />
          <Image
            src="/logo.png"
            alt="HIG AI Automation LLP"
            width={120}
            height={120}
            className="relative rounded-3xl shadow-2xl shadow-accent/30 border-4 border-white/10"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-4">
          AI-FIRST ENTERPRISE OPERATING SYSTEM
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-4">
          HIG AI <span className="text-accent">Automation</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-inter mb-2">
          The complete digital operating system for your enterprise.
          Intelligent, automated, and built for the future.
        </p>
        <p className="text-xs text-muted-foreground/60 mb-8">
          {companyDetails.name} · {companyDetails.registration} · {companyDetails.gstin}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-primary text-background font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20 w-full sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl glass border border-primary/10 text-primary font-bold hover:bg-primary/5 transition-all w-full sm:w-auto"
          >
            Book a Demo
          </Link>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="p-5 rounded-2xl glass border border-primary/5 text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-3xl mb-2">{module.icon}</div>
              <div className="font-bold text-sm">{module.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{module.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer with Company Info */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-6">
            <div className="flex items-start gap-3">
              <HIGLogo size={48} className="rounded-xl mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-primary text-sm">{companyDetails.name}</p>
                <p className="text-xs text-muted-foreground mt-1">AI-powered ERP & Automation Platform</p>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md inline-block w-fit">
                    LLP Reg: {companyDetails.registration}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md inline-block w-fit">
                    {companyDetails.gstin}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Contact</p>
              <div className="space-y-2">
                <a href={`mailto:${companyDetails.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  {companyDetails.email}
                </a>
                <a href={`tel:${companyDetails.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  {companyDetails.phone}
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  {companyDetails.address}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Platform</p>
              <div className="grid grid-cols-2 gap-1">
                {['HRMS', 'Projects', 'CRM', 'Finance', 'Assets', 'Knowledge'].map(m => (
                  <Link
                    key={m}
                    href={`/dashboard/${m.toLowerCase()}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">
              © {new Date().getFullYear()} {companyDetails.name}. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Built with ❤️ in Chennai, India
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
