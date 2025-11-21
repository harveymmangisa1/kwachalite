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
import { Briefcase, LogOut, Play, Settings, User, Check, Building2 } from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { SyncStatus } from './sync-status';
import { cn } from '@/lib/utils';

export function UserNav() {
  const { user, logout } = useAuth();
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
  const [isClient, setIsClient] = React.useState(false);
  const [tourCompleted, setTourCompleted] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
    const tourStatus = localStorage.getItem('kwachalite-tour-completed');
    setTourCompleted(tourStatus === 'true');
  }, []);

  // Enhanced user data handling
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userInitials = getUserInitials(userName);
  const businessInitials = 'B';

  const avatarSrc = activeWorkspace === 'business' ? undefined : user?.user_metadata?.avatar_url;
  const avatarFallback = activeWorkspace === 'business' ? businessInitials : userInitials;

  // Enhanced workspace switching with better visual feedback
  const handleWorkspaceChange = (workspace: 'personal' | 'business') => {
    setActiveWorkspace(workspace);
  };

  // Improved logout with confirmation
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  if (!isClient || !user) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SyncStatus />
      
      {/* Workspace Indicator */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
        {activeWorkspace === 'business' ? (
          <>
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium">Business</span>
          </>
        ) : (
          <>
            <User className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium">Personal</span>
          </>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-9 w-9 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Avatar className="h-9 w-9 ring-2 ring-background">
              <AvatarImage
                src={avatarSrc || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarFallback}`}
                alt={userName}
                className="transition-opacity duration-200"
              />
              <AvatarFallback 
                className={cn(
                  "font-semibold",
                  activeWorkspace === 'business' 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700"
                )}
              >
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64" 
          align="end" 
          forceMount
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarSrc}
                  alt={userName}
                />
                <AvatarFallback className="text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onSelect={() => handleWorkspaceChange('personal')}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  activeWorkspace === 'personal' 
                    ? "bg-green-100 text-green-700" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Personal</span>
                  <span className="text-xs text-muted-foreground">Your personal workspace</span>
                </div>
              </div>
              {activeWorkspace === 'personal' && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onSelect={() => handleWorkspaceChange('business')}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  activeWorkspace === 'business' 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Business</span>
                  <span className="text-xs text-muted-foreground">Team workspace</span>
                </div>
              </div>
              {activeWorkspace === 'business' && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="flex items-center gap-3 py-2">
                <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Settings</span>
                  <span className="text-xs text-muted-foreground">Manage your preferences</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onSelect={() => window.dispatchEvent(new CustomEvent('start-tour'))}
            className="flex items-center gap-3 py-2"
          >
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Play className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {tourCompleted ? 'Restart Tour' : 'Quick Tour'}
              </span>
              <span className="text-xs text-muted-foreground">
                {tourCompleted ? 'Watch the tutorial again' : 'Learn how to use the app'}
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onSelect={handleLogout}
            className="flex items-center gap-3 py-2 text-red-600 focus:text-red-700"
          >
            <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Log out</span>
              <span className="text-xs text-muted-foreground">Sign out of your account</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Helper function to get user initials
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}