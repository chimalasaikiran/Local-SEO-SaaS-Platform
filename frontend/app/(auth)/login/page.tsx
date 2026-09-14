"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../stores/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/login', { email, password });
      await refreshAuth();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50/30 relative overflow-hidden font-sans">
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Locentra</span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded ml-2 uppercase">AI SEO</span>
        </div>
        <div className="text-sm text-gray-600 hidden md:flex items-center space-x-4">
          <span>Need assistance?</span>
          <Link href="#" className="font-medium hover:text-emerald-600 transition flex items-center">
            Help Center
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Floating Badges */}
        <div className="absolute -top-12 -right-8 bg-white shadow-xl rounded-xl p-3 flex flex-col items-center animate-bounce z-20" style={{ animationDuration: '3s' }}>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">#1</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Google Map Pack</span>
              <span className="text-xs font-bold text-emerald-600">Top 3 in Local Search &uarr;</span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 -left-12 bg-white shadow-xl rounded-xl p-3 flex items-center space-x-3 z-20">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-500 uppercase">Monthly Local Traffic</span>
            <span className="text-xs font-bold text-emerald-600">+142% auto-optimized</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 sm:p-10 w-full relative">

          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
              Locentra Intelligence v3.2
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-gray-500">Log in to manage your local SEO rankings and automations</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember for 30 days
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In to Locentra \u2192'}
            </button>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Start a 14-day free trial
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 w-full flex flex-col md:flex-row justify-between px-8 text-xs text-gray-500 font-medium z-10">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
          All systems operational
        </div>
        <div className="flex space-x-6">
          <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-gray-900 transition-colors">Security</Link>
          <span>&copy; 2026 Locentra Inc.</span>
        </div>
      </div>
    </div>
  );
}
