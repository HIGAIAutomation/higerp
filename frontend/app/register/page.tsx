'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { KeyRound, User, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import HIGLogo from '@/components/logo';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      setError('Username and password are required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register(username, password, dob, address);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8 flex flex-col items-center">
          <HIGLogo size={64} className="mb-4 rounded-2xl shadow-md border border-slate-200 bg-white p-1" />
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 font-inter text-sm">
            Register your credentials to get access
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-slate-500 font-inter text-sm max-w-xs">
                Your account has been created. Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-250 text-rose-600 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    placeholder="Enter your street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm font-inter resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] hover:bg-accent/90 transition-all shadow-xl shadow-accent/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-inter text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:underline font-bold">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
