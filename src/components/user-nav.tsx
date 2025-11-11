
'use client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Link } from 'react-router-dom';
import { Briefcase, LogOut, Play, Settings, User } from 'lucide-react';
import { useAppStore } from '@/lib/data';


export function UserNav() {
  const { user, logout } = useAuth();
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
  const [isClient, setIsClient] = React.useState(false);
  const [tourCompleted, setTourCompleted] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
    // Check tour completion status
    const tourStatus = localStorage.getItem('kwachalite-tour-completed');
    setTourCompleted(tourStatus === 'true');
  }, []);

  if (!isClient || !user) {
    return (
       <div className="hidden sm:block">
         <Skeleton className="h-8 w-8 rounded-full" />
       </div>
    );
  }

  const handleWorkspaceChange = (workspace: 'personal' | 'business') => {
    setActiveWorkspace(workspace);
  };
  
  const userInitials = user?.user_metadata?.name || user?.email?.charAt(0).toUpperCase() || 'U';
  const businessInitials = 'B'; // Placeholder for business initials

  const avatarSrc = activeWorkspace === 'business' ? undefined : user?.user_metadata?.avatar_url;
  const avatarFallback = activeWorkspace === 'business' ? businessInitials : userInitials;

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
src={avatarSrc || `https://placehold.co/100x100.png?text=${avatarFallback}`}
                 alt={user?.user_metadata?.name || user?.email || 'User'}
              />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
<p className="text-sm font-medium leading-none">
                 {user?.user_metadata?.name || user?.email}
               </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => handleWorkspaceChange('personal')}>
                <User className="mr-2 h-4 w-4" />
                <span>Personal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleWorkspaceChange('business')}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Business</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link to="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('start-tour'))}>
            <Play className="mr-2 h-4 w-4" />
            <span>{tourCompleted ? 'Restart Tour' : 'Quick Tour'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
