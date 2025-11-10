'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Users, 
  Target, 
  TrendingUp, 
  Filter,
  SortAsc,
  Calendar
} from 'lucide-react';
import { GroupCard } from '@/components/savings/group-card';
import { CreateGroupModal } from '@/components/savings/create-group-modal';
import { useAppStore } from '@/lib/data';
import type { SavingsGroup } from '@/lib/types';

export default function GroupSavingsPage() {
  const { 
    savingsGroups, 
    groupMembers, 
    groupInvitations,
    addSavingsGroup,
    addGroupInvitation 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('my-groups');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'progress'>('created');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Memoized filtered and sorted groups
  const filteredGroups = useMemo(() => {
    let filtered = savingsGroups;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(group => group.status === filterStatus);
    }

    // Filter by tab
    if (selectedTab === 'my-groups') {
      // TODO: Filter by groups where user is a member
      // For now, show all groups
    } else if (selectedTab === 'invitations') {
      // TODO: Show groups where user has pending invitations
      filtered = [];
    }

    // Sort groups
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          const progressA = (a.currentAmount / a.targetAmount) * 100;
          const progressB = (b.currentAmount / b.targetAmount) * 100;
          return progressB - progressA;
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [savingsGroups, searchQuery, filterStatus, selectedTab, sortBy]);

  // Get member count for each group
  const getMemberCount = (groupId: string) => {
    return groupMembers.filter(member => member.groupId === groupId).length;
  };

  // Get user role for each group
  const getUserRole = (groupId: string): 'admin' | 'member' => {
    // TODO: Get actual user role from auth
    // For now, assume admin for groups created by user
    const group = savingsGroups.find(g => g.id === groupId);
    return group?.createdBy === 'current-user' ? 'admin' : 'member';
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalGroups = savingsGroups.length;
    const activeGroups = savingsGroups.filter(g => g.status === 'active').length;
    const completedGroups = savingsGroups.filter(g => g.status === 'completed').length;
    const totalSaved = savingsGroups.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = savingsGroups.reduce((sum, g) => sum + g.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalGroups,
      activeGroups,
      completedGroups,
      totalSaved,
      totalTarget,
      overallProgress,
    };
  }, [savingsGroups]);

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Savings</h1>
          <p className="text-muted-foreground">
            Save together with friends, family, or colleagues.
          </p>
        </div>
        <CreateGroupModal>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </CreateGroupModal>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeGroups} active, {statistics.completedGroups} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalSaved.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalTarget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overallProgress.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of total target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus(
              filterStatus === 'all' ? 'active' : 
              filterStatus === 'active' ? 'completed' : 'all'
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterStatus === 'all' ? 'All' : filterStatus}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(
              sortBy === 'created' ? 'name' : 
              sortBy === 'name' ? 'progress' : 'created'
            )}
          >
            <SortAsc className="h-4 w-4 mr-2" />
            {sortBy === 'created' ? 'Latest' : sortBy === 'name' ? 'Name' : 'Progress'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {groupInvitations.filter(i => i.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {groupInvitations.filter(i => i.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  memberCount={getMemberCount(group.id)}
                  userRole={getUserRole(group.id)}
                  onView={() => {
                    // TODO: Navigate to group detail page
                    console.log('View group:', group.id);
                  }}
                  onManage={() => {
                    // TODO: Open manage modal
                    console.log('Manage group:', group.id);
                  }}
                  onContribute={() => {
                    // TODO: Open contribution modal
                    console.log('Contribute to group:', group.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery 
                    ? 'No groups match your search criteria.'
                    : 'You haven\'t joined any savings groups yet.'
                  }
                </p>
                <CreateGroupModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Group
                  </Button>
                </CreateGroupModal>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Discover Public Groups</h3>
              <p className="text-muted-foreground text-center">
                Browse and request to join public savings groups from the community.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Coming soon - feature under development!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {groupInvitations.filter(i => i.status === 'pending').length > 0 ? (
            <div className="space-y-4">
              {groupInvitations
                .filter(i => i.status === 'pending')
                .map((invitation) => {
                  const group = savingsGroups.find(g => g.id === invitation.groupId);
                  return group ? (
                    <Card key={invitation.id}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <h4 className="font-semibold">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Invited by {invitation.invitedBy} • {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                          {invitation.message && (
                            <p className="text-sm mt-2 italic">"{invitation.message}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Decline
                          </Button>
                          <Button size="sm">
                            Accept
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any pending group invitations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}