import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Users, Target, Plus, UserPlus, Crown } from 'lucide-react';
import type { SavingsGoal, GroupMember } from '@/lib/types';

interface GroupSavingsCardProps {
  goal: SavingsGoal;
  onUpdateGoal: (goal: SavingsGoal) => void;
}

export function GroupSavingsCard({ goal, onUpdateGoal }: GroupSavingsCardProps) {
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberContribution, setNewMemberContribution] = React.useState('');
  const [showAddMember, setShowAddMember] = React.useState(false);

  // Calculate group statistics
  const totalContributions = goal.currentAmount;
  const progress = goal.targetAmount > 0 ? (totalContributions / goal.targetAmount) * 100 : 0;
  const remainingAmount = goal.targetAmount - totalContributions;

  const handleAddMember = () => {
    if (newMemberName && newMemberContribution) {
      // In a real implementation, this would add to a members list
      // For now, we'll just update the current amount
      const contribution = parseFloat(newMemberContribution);
      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + contribution
      };
      onUpdateGoal(updatedGoal);
      
      setNewMemberName('');
      setNewMemberContribution('');
      setShowAddMember(false);
    }
  };

  return (
    <Card className="flex flex-col card-elevated bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">Group Savings Goal</CardTitle>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-primary/20">
            <Crown className="h-3 w-3 text-warning" />
            <span className="text-xs font-medium text-primary">Group</span>
          </div>
        </div>
        <CardDescription className="text-muted-foreground">
          Collaborative savings with {goal.members?.length || 0} members
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Goal Details */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-foreground">{goal.name}</h3>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalContributions)}
          </div>
          <div className="text-sm text-muted-foreground">
            of {formatCurrency(goal.targetAmount)} goal
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Remaining: {formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Group Members</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memberName" className="text-muted-foreground">Member Name</Label>
                  <Input
                    id="memberName"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="contribution" className="text-muted-foreground">Contribution</Label>
                  <Input
                    id="contribution"
                    type="number"
                    value={newMemberContribution}
                    onChange={(e) => setNewMemberContribution(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddMember}
                className="w-full"
                disabled={!newMemberName || !newMemberContribution}
              >
                Add Contribution
              </Button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {goal.members?.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(member.contribution)}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {member.joinedAt && `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-muted-foreground">
                No members yet. Add members to start saving together!
              </div>
            )}
          </div>
        </div>

        {/* Goal Info */}
        <div className="pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Target Date:</span>
              <span>{new Date(goal.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Goal Type:</span>
              <span className="font-medium">Group Savings</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}