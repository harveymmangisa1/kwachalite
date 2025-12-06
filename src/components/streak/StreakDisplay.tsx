import { useEffect, useState } from 'react';
import { Flame, Trophy, Calendar, Zap, Award, Snowflake, TrendingUp, Target, Star } from 'lucide-react';
import { StreakService, ACTIVITY_TYPES } from '@/lib/streak-service';
import type { UserStreak, StreakMilestone } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface StreakDisplayProps {
    userId: string;
    compact?: boolean;
}

export function StreakDisplay({ userId, compact = false }: StreakDisplayProps) {
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadStreakData();
    }, [userId]);

    const loadStreakData = async () => {
        try {
            setLoading(true);
            const [streakData, statsData, milestonesData] = await Promise.all([
                StreakService.getUserStreak(userId),
                StreakService.getStreakStats(userId),
                StreakService.getMilestones(userId)
            ]);

            setStreak(streakData);
            setStats(statsData);
            setMilestones(milestonesData);
        } catch (error) {
            console.error('Error loading streak data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseFreeze = async () => {
        const success = await StreakService.useStreakFreeze(userId);

        if (success) {
            toast({
                title: "Streak Freeze Activated! ❄️",
                description: "Your streak is protected for today.",
            });
            loadStreakData();
        } else {
            toast({
                title: "No Freezes Available",
                description: "Complete milestones to earn streak freezes!",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <Card className="overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-neutral-50 to-neutral-100 animate-pulse" />
            </Card>
        );
    }

    if (compact) {
        return <StreakBadgeCompact currentStreak={streak?.current_streak || 0} />;
    }

    const currentStreak = streak?.current_streak || 0;
    const longestStreak = streak?.longest_streak || 0;
    const nextMilestone = getNextMilestone(currentStreak);
    const progressToNext = nextMilestone ? (currentStreak / nextMilestone) * 100 : 100;

    return (
        <div className="space-y-4">
            {/* Main Streak Card - Improved Readability */}
            <Card className="overflow-hidden border shadow-lg">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Your Streak
                                </h3>
                                <p className="text-white/90 text-sm">
                                    {StreakService.getMotivationalMessage(currentStreak)}
                                </p>
                            </div>
                        </div>

                        {streak && streak.streak_freeze_count > 0 && (
                            <Button
                                onClick={handleUseFreeze}
                                size="sm"
                                variant="secondary"
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            >
                                <Snowflake className="w-4 h-4 mr-2" />
                                Freeze ({streak.streak_freeze_count})
                            </Button>
                        )}
                    </div>

                    {/* Large Streak Counter */}
                    <div className="text-center py-6">
                        <div className="inline-flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl md:text-7xl font-black text-white">
                                    {currentStreak}
                                </span>
                                <span className="text-2xl md:text-3xl font-bold text-white/80">
                                    days
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 mt-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">Current Streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress to Next Milestone */}
                    {nextMilestone && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center justify-between text-white text-sm mb-2">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    <span className="font-medium">Next: {getMilestoneName(nextMilestone)}</span>
                                </div>
                                <span className="font-bold">{currentStreak}/{nextMilestone}</span>
                            </div>
                            <Progress value={Math.min(progressToNext, 100)} className="h-2 bg-white/20" />
                            <p className="text-white/70 text-xs mt-2 text-center">
                                {nextMilestone - currentStreak} more days to unlock {getMilestoneEmoji(nextMilestone)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Section - White Background for Better Readability */}
                <div className="p-6 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Trophy className="w-5 h-5 text-yellow-600" />}
                            label="Best Streak"
                            value={longestStreak}
                            suffix="days"
                            bgColor="bg-yellow-50"
                            textColor="text-yellow-900"
                        />
                        <StatCard
                            icon={<Calendar className="w-5 h-5 text-blue-600" />}
                            label="Total Days"
                            value={stats?.totalActiveDays || 0}
                            suffix="days"
                            bgColor="bg-blue-50"
                            textColor="text-blue-900"
                        />
                        <StatCard
                            icon={<Zap className="w-5 h-5 text-purple-600" />}
                            label="This Week"
                            value={stats?.last7DaysActive || 0}
                            suffix="/7"
                            bgColor="bg-purple-50"
                            textColor="text-purple-900"
                        />
                        <StatCard
                            icon={<Award className="w-5 h-5 text-green-600" />}
                            label="Achievements"
                            value={milestones.length}
                            suffix=""
                            bgColor="bg-green-50"
                            textColor="text-green-900"
                        />
                    </div>
                </div>
            </Card>

            {/* Achievement Badges */}
            {milestones.length > 0 && (
                <Card className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-900">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Recent Achievements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {milestones.slice(0, 6).map((milestone) => {
                            const badge = StreakService.getMilestoneBadge(
                                milestone.milestone_type,
                                milestone.milestone_value
                            );
                            return (
                                <div
                                    key={milestone.id}
                                    className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-sm">
                                        {badge.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-neutral-900 truncate">
                                            {badge.title}
                                        </p>
                                        <p className="text-xs text-neutral-600 truncate">
                                            {badge.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Activity Heatmap */}
            <Card className="p-6">
                <h4 className="font-bold text-lg mb-4 text-neutral-900">Activity This Week</h4>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const hasActivity = stats?.last7DaysActive > i;

                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-full aspect-square rounded-lg transition-all ${hasActivity
                                            ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-md'
                                            : 'bg-neutral-200'
                                        }`}
                                >
                                    {hasActivity && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Flame className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-neutral-600">
                                    {dayName}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// Improved Stat Card Component
function StatCard({
    icon,
    label,
    value,
    suffix,
    bgColor,
    textColor
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix: string;
    bgColor: string;
    textColor: string;
}) {
    return (
        <div className={`${bgColor} rounded-lg p-4 border border-neutral-200`}>
            <div className="mb-2">
                {icon}
            </div>
            <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl md:text-3xl font-bold ${textColor}`}>
                        {value}
                    </span>
                    {suffix && (
                        <span className="text-sm font-medium text-neutral-600">
                            {suffix}
                        </span>
                    )}
                </div>
                <p className="text-xs font-medium text-neutral-600">
                    {label}
                </p>
            </div>
        </div>
    );
}

// Compact Badge for Header
function StreakBadgeCompact({ currentStreak }: { currentStreak: number }) {
    if (currentStreak === 0) return null;

    return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <Flame className="w-4 h-4" />
            <div className="flex items-baseline gap-1">
                <span className="text-base font-bold">{currentStreak}</span>
                <span className="text-xs opacity-90">day streak</span>
            </div>
        </div>
    );
}

// Exported Badge for Header
export function StreakBadge({ userId }: { userId: string }) {
    const [currentStreak, setCurrentStreak] = useState(0);

    useEffect(() => {
        StreakService.getUserStreak(userId).then(streak => {
            setCurrentStreak(streak?.current_streak || 0);
        });
    }, [userId]);

    return <StreakBadgeCompact currentStreak={currentStreak} />;
}

// Helper Functions
function getNextMilestone(currentStreak: number): number | null {
    const milestones = [7, 30, 90, 100, 365];
    return milestones.find(m => m > currentStreak) || null;
}

function getMilestoneEmoji(milestone: number): string {
    const emojis: Record<number, string> = {
        7: '🔥',
        30: '💎',
        90: '👑',
        100: '💯',
        365: '🏆'
    };
    return emojis[milestone] || '⭐';
}

function getMilestoneName(milestone: number): string {
    const names: Record<number, string> = {
        7: 'Week Warrior',
        30: 'Month Master',
        90: 'Quarter Champion',
        100: 'Century Club',
        365: 'Year Legend'
    };
    return names[milestone] || `${milestone} Days`;
}
