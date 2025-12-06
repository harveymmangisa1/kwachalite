import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';
// In your header component
import { StreakBadge } from '@/components/streak/StreakDisplay';


interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, children, icon }: PageHeaderProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col gap-4 mb-6 px-4 pt-4 sm:px-6 sm:pt-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent">
          <div className="relative flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <div className='sm:hidden'>
            <UserNav />
          </div>
        </header>
        <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              {icon && icon}
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
        {user && <StreakBadge userId={user.id} />}
    </div>
  );
}