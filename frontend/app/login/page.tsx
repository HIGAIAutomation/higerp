'use client';

import HIGLogo from '@/components/logo';
import { useAuth } from '@/components/providers/auth-provider';
import { AlertCircle, KeyRound, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Orbs - Responsive sizing */}
      <div className="absolute top-[-30%] left-[-20%] sm:top-[-20%] sm:left-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-indigo-500/10 blur-3xl sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] sm:bottom-[-20%] sm:right-[-10%] w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-accent/10 blur-3xl sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <HIGLogo size={48} className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl shadow-md border border-slate-200 bg-white p-1" />
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HIG AI <span className="text-accent font-semibold">ERP</span>
          </h1>
          <p className="text-slate-500 mt-2 font-inter text-xs sm:text-sm px-2">
            Sign in to access your enterprise dashboard
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-250 text-rose-600 text-xs sm:text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] hover:bg-accent/90 transition-all shadow-xl shadow-accent/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-center text-xs sm:text-sm font-inter text-slate-500">
            First time here?{' '}
            <Link href="/register" className="text-accent hover:underline font-bold">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
