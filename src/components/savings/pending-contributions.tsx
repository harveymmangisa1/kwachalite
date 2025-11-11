'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import type { GroupContribution, SavingsGroup } from '@/lib/types';

interface PendingContributionsProps {
  group: SavingsGroup;
  trigger?: React.ReactNode;
}

export function PendingContributions({ group, trigger }: PendingContributionsProps) {
  const { toast } = useToast();
  const { groupContributions, updateGroupContribution, updateSavingsGroup, addGroupActivity } = useAppStore();
  
  const [selectedContribution, setSelectedContribution] = useState<GroupContribution | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Get pending contributions for this group
  const pendingContributions = groupContributions.filter(
    contribution => contribution.groupId === group.id && contribution.status === 'pending'
  );

  if (pendingContributions.length === 0) {
    return null;
  }

  const handleApprove = async (contribution: GroupContribution) => {
    setIsVerifying(true);
    
    try {
      // Update contribution status
      const updatedContribution: GroupContribution = {
        ...contribution,
        status: 'confirmed',
        confirmedBy: 'current-user', // TODO: Get from auth
        confirmedAt: new Date().toISOString(),
      };

      updateGroupContribution(updatedContribution);

      // Update group current amount
      updateSavingsGroup({
        ...group,
        currentAmount: group.currentAmount + contribution.amount,
        updatedAt: new Date().toISOString(),
      });

      // Add activity log
      addGroupActivity({
        id: `activity-${Date.now()}`,
        groupId: group.id,
        type: 'contribution_made',
        userId: contribution.memberId,
        description: `Contribution of ${formatCurrency(contribution.amount)} was approved`,
        metadata: {
          contributionId: contribution.id,
          amount: contribution.amount,
        },
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Contribution approved!',
        description: `${formatCurrency(contribution.amount)} has been added to the group total.`,
      });

      setSelectedContribution(null);
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error approving contribution',
        description: 'Failed to approve the contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContribution || !rejectionReason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this contribution.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Update contribution status
      const updatedContribution: GroupContribution = {
        ...selectedContribution,
        status: 'rejected',
        confirmedBy: 'current-user', // TODO: Get from auth
        confirmedAt: new Date().toISOString(),
        rejectionReason: rejectionReason.trim(),
      };

      updateGroupContribution(updatedContribution);

      // Add activity log
      addGroupActivity({
        id: `activity-${Date.now()}`,
        groupId: group.id,
        type: 'contribution_made',
        userId: selectedContribution.memberId,
        description: `Contribution of ${formatCurrency(selectedContribution.amount)} was rejected`,
        metadata: {
          contributionId: selectedContribution.id,
          amount: selectedContribution.amount,
          rejectionReason: rejectionReason.trim(),
        },
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Contribution rejected',
        description: `The contribution has been rejected and the member will be notified.`,
      });

      setSelectedContribution(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: 'Error rejecting contribution',
        description: 'Failed to reject the contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="relative">
      <Clock className="h-4 w-4 mr-2" />
      Pending Review
      {pendingContributions.length > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
          {pendingContributions.length}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <Dialog open={!!selectedContribution} onOpenChange={(open) => !open && setSelectedContribution(null)}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        
        {selectedContribution && (
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Contribution
              </DialogTitle>
              <DialogDescription>
                Review the contribution details and proof of payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 form-scroll-container">
              {/* Contribution Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contribution Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Amount</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedContribution.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <p className="capitalize">{selectedContribution.method.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Submitted</Label>
                    <p>{formatDate(selectedContribution.contributedAt)}</p>
                  </div>

                  {selectedContribution.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-muted-foreground">{selectedContribution.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {selectedContribution.status}
                    </Badge>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Awaiting verification</span>
                  </div>
                </CardContent>
              </Card>

              {/* Proof of Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proof of Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedContribution.proofFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedContribution.proofFile}</p>
                            <p className="text-sm text-muted-foreground">Proof document</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                      
                      {selectedContribution.proofUrl && (
                        <div className="text-center">
                          <img 
                            src={selectedContribution.proofUrl} 
                            alt="Proof of payment" 
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No proof of payment uploaded</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedContribution)}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this contribution. This will be shared with the member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this contribution is being rejected..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="flex-1"
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                className="flex-1"
                disabled={isVerifying || !rejectionReason.trim()}
              >
                {isVerifying ? 'Rejecting...' : 'Reject Contribution'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}