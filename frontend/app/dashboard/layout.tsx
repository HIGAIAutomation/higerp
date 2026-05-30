'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ShieldAlert, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayoutGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans">
        <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
        <p className="text-slate-500 font-inter text-sm animate-pulse">
          Loading your enterprise session...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Permission check
  const isSuperAdmin = user.role === 'superadmin';
  
  // Dashboard home page is accessible by all authenticated users
  const isDashboardRoot = pathname === '/dashboard';
  
  // Check if user has explicit access to this route prefix
  const userAccessList = user.pageAccess || [];
  const hasAccess = isSuperAdmin || isDashboardRoot || userAccessList.some(path => {
    // Exact match or matches as folder prefix
    return pathname === path || pathname.startsWith(path + '/');
  });

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md z-10 bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="inline-flex p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-6 shadow-inner text-rose-500">
            <ShieldAlert className="h-12 w-12" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-500 mt-3 font-inter text-sm max-w-xs mx-auto leading-relaxed">
            You do not have permission to view this page. Please contact your system administrator to request access.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="py-3 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <button
              onClick={() => logout()}
              className="py-3 px-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
}
