'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/pocketbase';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar onCollapseChange={handleSidebarCollapse} />
      </div>
      
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50">
            <Sidebar onCollapseChange={handleSidebarCollapse} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
