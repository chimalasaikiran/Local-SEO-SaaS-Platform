"use client";

import React from 'react';
import { useAuth } from '../../../stores/auth-context';

export default function DashboardPage() {
  const { user, activeOrganization } = useAuth();

  const cards = [
    { name: 'Locations', value: '0', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Keywords tracked', value: '0', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Reviews', value: '0', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Visibility Score', value: '—', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with <span className="font-semibold text-gray-700">{activeOrganization?.name}</span> today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`w-12 h-12 rounded-full ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} /></svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{card.name}</p>
            <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center h-64 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available Yet</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">Connect your Google Business Profile to start tracking your local SEO performance.</p>
        <button className="mt-5 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
          Connect Integration
        </button>
      </div>

    </div>
  );
}
