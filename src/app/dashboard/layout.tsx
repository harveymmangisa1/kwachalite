import { Sidebar, MobileNav } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
