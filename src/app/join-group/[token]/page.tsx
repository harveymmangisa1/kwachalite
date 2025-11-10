'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Target, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import type { SavingsGroup, GroupInvitation } from '@/lib/types';

export default function JoinGroupPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    savingsGroups, 
    groupInvitations, 
    updateGroupInvitation, 
    addGroupMember 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invitation, setInvitation] = useState<GroupInvitation | null>(null);
  const [group, setGroup] = useState<SavingsGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // Find invitation by token
    const foundInvitation = groupInvitations.find(inv => inv.token === token);
    
    if (!foundInvitation) {
      setError('Invitation not found or has expired');
      setLoading(false);
      return;
    }

    // Check if invitation is still valid
    const now = new Date();
    const expiresAt = new Date(foundInvitation.expiresAt);
    
    if (now > expiresAt) {
      setError('This invitation has expired');
      setLoading(false);
      return;
    }

    // Find the group
    const foundGroup = savingsGroups.find(g => g.id === foundInvitation.groupId);
    
    if (!foundGroup) {
      setError('Group not found');
      setLoading(false);
      return;
    }

    setInvitation(foundInvitation);
    setGroup(foundGroup);
    setLoading(false);
  }, [token, groupInvitations, savingsGroups]);

  const handleJoinGroup = async () => {
    if (!invitation || !group) return;

    setJoining(true);
    
    try {
      // TODO: Get actual user ID from auth
      const userId = 'current-user';
      const userName = 'Current User'; // TODO: Get from auth
      const userEmail = 'user@example.com'; // TODO: Get from auth

      // Create group member record
      const newMember = {
        id: new Date().toISOString(),
        groupId: group.id,
        userId,
        name: userName,
        email: userEmail,
        role: 'member' as const,
        joinedAt: new Date().toISOString(),
        totalContributed: 0,
        status: 'active' as const,
      };

      // Update invitation status
      const updatedInvitation = {
        ...invitation,
        status: 'accepted' as const,
        acceptedAt: new Date().toISOString(),
      };

      // Add member and update invitation
      addGroupMember(newMember);
      updateGroupInvitation(updatedInvitation);

      toast({
        title: 'Successfully joined group!',
        description: `You are now a member of "${group.name}"`,
      });

      // Navigate to group page
      navigate(`/dashboard/savings/groups/${group.id}`);
      
    } catch (error) {
      toast({
        title: 'Error joining group',
        description: 'Failed to join the group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleDecline = () => {
    if (!invitation) return;

    try {
      const updatedInvitation = {
        ...invitation,
        status: 'rejected' as const,
      };

      updateGroupInvitation(updatedInvitation);

      toast({
        title: 'Invitation declined',
        description: 'You have declined the group invitation.',
      });

      navigate('/dashboard/savings/groups');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to decline invitation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error || 'This invitation link is not valid.'}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard/savings/groups')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = group.targetAmount > 0 
    ? (group.currentAmount / group.targetAmount) * 100 
    : 0;

  const daysLeft = group.deadline 
    ? Math.ceil((new Date(group.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/savings/groups')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{group.name}</CardTitle>
                <CardDescription className="text-base">
                  You've been invited to join this savings group!
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {group.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Group Description */}
            {group.description && (
              <div>
                <h3 className="font-medium mb-2">About this group</h3>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
            )}

            {/* Group Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">
                  {progressPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">
                  {/* TODO: Get actual member count */}
                  1+ members
                </div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              
              {daysLeft !== null && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">
                    {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                  </div>
                  <div className="text-sm text-muted-foreground">Time left</div>
                </div>
              )}
            </div>

            {/* Financial Goal */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Savings Goal</h3>
              <div className="text-2xl font-bold mb-1">
                {group.currentAmount.toLocaleString()} / {group.targetAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {group.currency || 'MWK'} • Target: {group.targetAmount.toLocaleString()}
              </div>
            </div>

            {/* Invitation Details */}
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Invited by:</strong> {invitation.invitedBy}<br />
                <strong>Invited:</strong> {new Date(invitation.createdAt).toLocaleDateString()}<br />
                <strong>Expires:</strong> {new Date(invitation.expiresAt).toLocaleDateString()}
              </AlertDescription>
            </Alert>

            {/* Custom Message */}
            {invitation.message && (
              <div className="bg-muted/50 border-l-4 border-primary p-4 rounded">
                <h4 className="font-medium mb-2">Personal Message</h4>
                <p className="italic">"{invitation.message}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={joining}
                className="flex-1"
              >
                Decline
              </Button>
              <Button 
                onClick={handleJoinGroup}
                disabled={joining}
                className="flex-1"
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Group
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}