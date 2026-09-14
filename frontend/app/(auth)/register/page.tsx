"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../stores/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!agreed) {
      return setError('You must agree to the Terms of Service');
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/register', { name, email, password, organizationName });
      await refreshAuth();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50/30 relative overflow-hidden py-12 font-sans">
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
          <span>Already have an account?</span>
          <Link href="/login" className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg font-medium transition text-emerald-600 flex items-center shadow-sm">
            Sign In &rarr;
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg mt-8">

        {/* Floating Badges */}
        <div className="absolute -top-8 -right-8 bg-white shadow-xl rounded-xl p-3 flex flex-col items-center animate-bounce z-20" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">14-Day Free Access</span>
              <span className="text-xs font-bold text-emerald-600">No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 sm:p-10 w-full relative">

          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100 flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
              Get Started in 60 Seconds
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create your account</h1>
            <p className="text-sm text-gray-500">Automate your local Google rankings and dominate map packs.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                placeholder="Sarah Jenkins"
              />
            </div>

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
                  placeholder="sarah@apexdental.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                  placeholder="At least 8 chars"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Organization Name</label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50 text-sm transition-shadow shadow-sm hover:bg-white focus:bg-white outline-none"
                placeholder="Apex Dental Clinic"
              />
            </div>

            <div className="flex items-start mt-6">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  I agree to Locentra's <Link href="#" className="text-emerald-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating Account...' : 'Start Free 14-Day Trial \u2192'}
            </button>

            <div className="mt-8 text-center text-sm text-gray-500 pb-2">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign In to Locentra
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
