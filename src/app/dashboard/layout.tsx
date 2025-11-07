
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar, MobileNav, MobileSidebar, MobileSidebarProvider, MobileSidebarTrigger } from '@/components/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/error-boundary';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

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
        <div className="flex min-h-screen w-full bg-background">
            <div className="hidden sm:flex flex-col gap-4 p-4 border-r border-border/60 bg-card/50 backdrop-blur-sm h-full">
                <div className="flex items-center gap-3 p-2">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>
                <div className="w-10 h-px bg-border/60 mx-auto" />
                <div className="flex flex-col gap-3 mt-4">
                    <Skeleton className="h-11 w-11 rounded-xl mx-auto" />
                    <Skeleton className="h-11 w-11 rounded-xl mx-auto" />
                    <Skeleton className="h-11 w-11 rounded-xl mx-auto" />
                    <Skeleton className="h-11 w-11 rounded-xl mx-auto" />
                </div>
            </div>
            <div className="flex-1 container-padding py-8 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-56 rounded-xl" />
                    <Skeleton className="h-6 w-96 rounded-lg" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
                <Skeleton className="h-80 rounded-2xl" />
            </div>
        </div>
    )
  }

  return (
    <ErrorBoundary>
      <MobileSidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Sidebar />
          <MobileSidebar />
          <div className="flex flex-col sm:pl-20">
            <header className="sm:hidden flex items-center justify-between px-4 py-4 border-b border-border/60 bg-card/50 backdrop-blur-sm">
              <MobileSidebarTrigger />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </header>
            <main className="flex-1 pb-24 sm:pb-8 min-h-screen">
                <DashboardHeader />
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
              <MobileNav />
            </main>
          </div>
        </div>
      </MobileSidebarProvider>
    </ErrorBoundary>
  );
}