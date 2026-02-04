import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UsersIcon } from 'lucide-react';
import type { SavingsGroup } from '@/lib/types';

interface GroupCardProps {
  group: SavingsGroup;
  memberCount?: number;
  userRole?: 'admin' | 'member';
  onView?: () => void;
  onManage?: () => void;
  onContribute?: () => void;
  onInviteMembers?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {group.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-gray-500">
        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto" />
        <p>Group savings feature is temporarily disabled.</p>
      </CardContent>
    </Card>
  );
}