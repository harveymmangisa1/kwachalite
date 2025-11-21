import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Sidebar, MobileSidebar, MobileSidebarProvider } from '@/components/sidebar';

export default function AppLayout() {
  return (
    <MobileSidebarProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 sm:pl-16">
            <Header />
            <div className="p-4 sm:p-6">
              <Outlet />
            </div>
          </main>
          <MobileSidebar />
        </div>
        <Toaster />
      </div>
    </MobileSidebarProvider>
  );
}
