"use client";

import React, { useState } from 'react';
import { useAuth } from '../stores/auth-context';

export function OrganizationSwitcher() {
  const { organizations, activeOrganization, setActiveOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeOrganization) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 transition"
      >
        <span>{activeOrganization.name}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizations</span>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrganization(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${org.id === activeOrganization.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="truncate mr-2">{org.name}</span>
                  {org.id === activeOrganization.id && (
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
