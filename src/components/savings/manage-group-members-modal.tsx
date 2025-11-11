'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Crown, 
  User, 
  MoreHorizontal, 
  Shield, 
  ShieldOff,
  UserMinus,
  Search,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import { InviteMembersModal } from './invite-members-modal';
import type { SavingsGroup } from '@/lib/types';

interface ManageGroupMembersModalProps {
  children: React.ReactNode;
  group: SavingsGroup;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManageGroupMembersModal({ 
  children, 
  group, 
  open, 
  onOpenChange 
}: ManageGroupMembersModalProps) {
  const { toast } = useToast();
  const { groupMembers, updateGroupMember, removeGroupMember } = useAppStore();
  const [isOpen, setIsOpen] = useState(open || false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members for this group
  const groupMembersList = groupMembers.filter(member => member.groupId === group.id);
  
  // Filter by search query
  const filteredMembers = groupMembersList.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const changeMemberRole = (memberId: string, newRole: 'admin' | 'member') => {
    const member = groupMembersList.find(m => m.id === memberId);
    if (member) {
      updateGroupMember({ ...member, role: newRole });
      toast({
        title: 'Role updated',
        description: `Member role changed to ${newRole}.`,
      });
    }
  };

  const removeMember = (memberId: string) => {
    removeGroupMember(memberId);
    toast({
      title: 'Member removed',
      description: 'Member has been removed from group.',
    });
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  const adminCount = groupMembersList.filter(m => m.role === 'admin').length;
  const memberCount = groupMembersList.filter(m => m.role === 'member').length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Members - {group.name}
          </DialogTitle>
          <DialogDescription>
            Add, remove, or manage member roles for this savings group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{adminCount}</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{memberCount}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <InviteMembersModal groupId={group.id} groupName={group.name} group={group}>
              <Button variant="outline" className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            </InviteMembersModal>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 w-fit">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role === 'admin' ? (
                              <DropdownMenuItem onClick={() => changeMemberRole(member.id, 'member')}>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeMemberRole(member.id, 'admin')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => removeMember(member.id)}
                              className="text-destructive"
                              disabled={member.role === 'admin' && adminCount <= 1}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove from Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Users className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {searchQuery ? 'No members found matching your search.' : 'No members in this group yet.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}