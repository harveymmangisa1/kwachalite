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
    <Card className="flex flex-col rounded-2xl shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-blue-900">Group Savings Goal</CardTitle>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
            <Crown className="h-3 w-3 text-yellow-600" />
            <span className="text-xs font-medium text-blue-800">Group</span>
          </div>
        </div>
        <CardDescription className="text-blue-700">
          Collaborative savings with {goal.members?.length || 0} members
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Goal Details */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-blue-900">{goal.name}</h3>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalContributions)}
          </div>
          <div className="text-sm text-blue-600">
            of {formatCurrency(goal.targetAmount)} goal
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-100" />
          <div className="flex justify-between text-sm text-blue-600">
            <span>Remaining: {formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-900">Group Members</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMember(!showAddMember)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memberName" className="text-blue-700">Member Name</Label>
                  <Input
                    id="memberName"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Enter name"
                    className="bg-white border-blue-200"
                  />
                </div>
                <div>
                  <Label htmlFor="contribution" className="text-blue-700">Contribution</Label>
                  <Input
                    id="contribution"
                    type="number"
                    value={newMemberContribution}
                    onChange={(e) => setNewMemberContribution(e.target.value)}
                    placeholder="0.00"
                    className="bg-white border-blue-200"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddMember}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!newMemberName || !newMemberContribution}
              >
                Add Contribution
              </Button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {goal.members?.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{member.name}</p>
                    <p className="text-sm text-blue-600">{formatCurrency(member.contribution)}</p>
                  </div>
                </div>
                <div className="text-sm text-blue-600">
                  {member.joinedAt && `Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-blue-600">
                No members yet. Add members to start saving together!
              </div>
            )}
          </div>
        </div>

        {/* Goal Info */}
        <div className="pt-2 border-t border-blue-200">
          <div className="text-sm text-blue-600 space-y-1">
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