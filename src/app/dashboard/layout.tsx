
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar, MobileNav, MobileSidebar, MobileSidebarProvider, MobileSidebarTrigger } from '@/components/sidebar';
import { TourTrigger } from '@/components/tour-trigger';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/error-boundary';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Wallet } from 'lucide-react';

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
            {/* Desktop Sidebar Skeleton - Hidden on mobile */}
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
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header Skeleton */}
                <header className="sm:hidden flex items-center justify-between px-4 py-4 border-b border-border/60 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-lg" />
                    </div>
                </header>
                
                {/* Content Skeleton */}
                <div className="flex-1 container-padding py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
                    <div className="space-y-3 sm:space-y-4">
                        <Skeleton className="h-8 sm:h-10 w-40 sm:w-56 rounded-xl" />
                        <Skeleton className="h-4 sm:h-6 w-32 sm:w-96 rounded-lg" />
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-32 sm:h-40 rounded-2xl" />
                        <Skeleton className="h-32 sm:h-40 rounded-2xl" />
                        <Skeleton className="h-32 sm:h-40 rounded-2xl" />
                    </div>
                    <Skeleton className="h-60 sm:h-80 rounded-2xl" />
                </div>
                
                {/* Mobile Navigation Skeleton - Only on mobile */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
                    <div className="bg-card/95 backdrop-blur-md border-t border-border/60 h-18">
                        <div className="flex items-center justify-around h-full px-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-10 w-10 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <ErrorBoundary>
      <MobileSidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden sm:block">
            <Sidebar />
          </div>
          
          {/* Mobile Sidebar - Only shown when explicitly opened */}
          <MobileSidebar />
          
          {/* Main Content Area */}
          <div className="flex flex-col sm:pl-20">
            {/* Mobile Header */}
            <header className="sm:hidden flex items-center justify-between px-4 py-4 border-b border-border/60 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <MobileSidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">KwachaLite</span>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 pb-24 sm:pb-8 min-h-screen">
              <DashboardHeader />
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
              
              {/* Mobile Navigation - Only shown on mobile */}
              <MobileNav />
            </main>
            
            {/* Tour Trigger */}
            <TourTrigger />
          </div>
        </div>
      </MobileSidebarProvider>
    </ErrorBoundary>
  );
}