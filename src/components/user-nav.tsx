
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Building, Check, ChevronsUpDown, User, HelpCircle, Info } from 'lucide-react';
import React from 'react';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { useAuth } from '@/hooks/use-auth';

export function UserNav() {
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
  const { userName, logout } = useAuth();
  
  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitials}`} alt={userName || 'User'} data-ai-hint="person avatar" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userName ? `${userName.split(' ')[0].toLowerCase()}@example.com` : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                <span>
                    {activeWorkspace === 'personal' ? 'Personal' : 'My Business'} Workspace
                </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setActiveWorkspace('personal')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Personal</span>
                        {activeWorkspace === 'personal' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveWorkspace('business')}>
                        <Building className="mr-2 h-4 w-4" />
                        <span>My Business</span>
                        {activeWorkspace === 'business' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/about">
                <Info className="mr-2 h-4 w-4" />
                About
             </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
           <Link href="/" onClick={() => logout()}>Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
