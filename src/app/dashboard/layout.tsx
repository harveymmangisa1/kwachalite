'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar, MobileNav, MobileSidebar, MobileSidebarProvider } from '@/components/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/error-boundary';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/20">
            <div className="hidden sm:flex flex-col gap-4 p-4 border-r bg-card/50 backdrop-blur-sm h-full shadow-lg">
                <div className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
                <div className="w-8 h-px bg-border/50 mx-auto" />
                <div className="flex flex-col gap-3 mt-4">
                    <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
                    <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
                    <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
                    <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
                </div>
            </div>
            <div className="flex-1 container-padding py-6 space-y-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
    )
  }

  return (
    <ErrorBoundary>
      <MobileSidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-background to-muted/20">
          <Sidebar />
          <MobileSidebar />
          <div className="flex flex-col sm:pl-16">
            <main className="flex-1 pb-20 sm:pb-6 min-h-screen">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
            <MobileNav />
          </div>
        </div>
      </MobileSidebarProvider>
    </ErrorBoundary>
  );
}