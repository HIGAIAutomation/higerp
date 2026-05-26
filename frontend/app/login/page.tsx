'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { KeyRound, User, AlertCircle, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="HIG Logo" className="h-16 object-contain mb-4 rounded-2xl shadow-lg border border-slate-800" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            HIG AI <span className="text-accent font-semibold">ERP</span>
          </h1>
          <p className="text-slate-400 mt-2 font-inter text-sm">
            Sign in to access your enterprise dashboard
          </p>
        </div>

        <div className="glass border border-white/5 rounded-3xl p-8 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-accent text-[#09090B] font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-accent/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm font-inter text-slate-400">
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
