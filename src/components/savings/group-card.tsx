'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Plus, Eye, Settings, UserPlus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { InviteMembersModal } from './invite-members-modal';
import { ManageGroupMembersModal } from './manage-group-members-modal';
import type { SavingsGroup } from '@/lib/types';

interface GroupCardProps {
  group: SavingsGroup;
  memberCount?: number;
  userRole?: 'admin' | 'member';
  onView?: () => void;
  onManage?: () => void;
  onContribute?: () => void;
  onInviteMembers?: () => void;
}

export function GroupCard({ 
  group, 
  memberCount = 0, 
  userRole = 'member',
  onView,
  onManage,
  onContribute,
  onInviteMembers 
}: GroupCardProps) {
  const progressPercentage = group.targetAmount > 0 
    ? (group.currentAmount / group.targetAmount) * 100 
    : 0;

  const isCompleted = group.currentAmount >= group.targetAmount;
  const daysLeft = group.deadline 
    ? Math.ceil((new Date(group.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {group.name}
            </CardTitle>
            {group.description && (
              <CardDescription className="line-clamp-2">
                {group.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {group.status}
            </Badge>
            {!group.isPublic && (
              <Badge variant="outline" className="text-xs">
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {formatCurrency(group.currentAmount)} / {formatCurrency(group.targetAmount)}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            {isCompleted && <span className="text-green-600 font-medium">Goal Reached! 🎉</span>}
          </div>
        </div>

        {/* Group Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{memberCount} members</span>
          </div>
          
          {daysLeft !== null && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={daysLeft < 7 ? "text-orange-600" : ""}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          {userRole === 'admin' && (
            <>
              <InviteMembersModal groupId={group.id} groupName={group.name} group={group}>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </InviteMembersModal>
              <ManageGroupMembersModal group={group}>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </ManageGroupMembersModal>
            </>
          )}
          
          {group.status === 'active' && !isCompleted && (
            <Button 
              size="sm" 
              onClick={onContribute}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}