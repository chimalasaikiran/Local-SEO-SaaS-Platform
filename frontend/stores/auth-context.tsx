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
  hasPermission: (permission: string) => boolean;
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

  const hasPermission = useCallback((permission: string) => {
    if (!activeOrganization) return false;
    const role = activeOrganization.role;
    if (role === 'OWNER' || role === 'ADMIN') return true;
    
    // MEMBER
    if (role === 'MEMBER') {
      if (permission.endsWith('.delete')) return false;
      return true; // allows read, update, create, run
    }
    
    // VIEWER
    if (role === 'VIEWER') {
      return permission.endsWith('.read');
    }
    
    return false;
  }, [activeOrganization]);

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
        logout,
        hasPermission
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
