'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar, MobileNav } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!user) {
    return null; // Or a redirect component
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      <div className="flex flex-col sm:pl-14">
        {/* Mobile Header and Main Content */}
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
