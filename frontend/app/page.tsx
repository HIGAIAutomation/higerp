import Link from "next/link";
import { LogIn, UserPlus, Shield } from "lucide-react";

const modules = [
  { name: 'HRMS', href: '/dashboard/hrms' },
  { name: 'Projects', href: '/dashboard/projects' },
  { name: 'CRM', href: '/dashboard/crm' },
  { name: 'Finance', href: '/dashboard/finance' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative">
      {/* Floating Header */}
      <header className="absolute top-6 left-6 right-6 z-50">
        <div className="max-w-7xl mx-auto glass border border-primary/10 px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <img src="/logo.png" alt="HIG Logo" className="h-8 object-contain rounded-lg" />
            HIG AI <span className="text-accent font-semibold">ERP</span>
          </Link>
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

      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pt-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-4">
          AI-FIRST ENTERPRISE OPERATING SYSTEM
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
          HIG AI <span className="text-accent">Automation</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
          The complete digital operating system for your enterprise. 
          Intelligent, automated, and built for the future.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="p-4 rounded-2xl glass border border-primary/5 text-primary font-semibold hover:bg-primary/10 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              {module.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
