"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api/client';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  activeOrganization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setActiveOrganization: (orgId: string) => void;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<{ user: User; organizations: Organization[] }>('/auth/me');
      setUser(data.user);
      setOrganizations(data.organizations);

      // Auto-select first org if none selected, or re-select current if still exists
      if (data.organizations.length > 0) {
        const currentActiveId = localStorage.getItem('activeOrgId');
        const orgToSelect = data.organizations.find((o: Organization) => o.id === currentActiveId) || data.organizations[0];
        setActiveOrganizationState(orgToSelect);
        localStorage.setItem('activeOrgId', orgToSelect.id);
      } else {
        setActiveOrganizationState(null);
        localStorage.removeItem('activeOrgId');
      }
    } catch (error) {
      setUser(null);
      setOrganizations([]);
      setActiveOrganizationState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const setActiveOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setActiveOrganizationState(org);
      localStorage.setItem('activeOrgId', org.id);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
      setOrganizations([]);
      setActiveOrganizationState(null);
      localStorage.removeItem('activeOrgId');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        activeOrganization,
        isLoading,
        isAuthenticated: !!user,
        setActiveOrganization,
        refreshAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
