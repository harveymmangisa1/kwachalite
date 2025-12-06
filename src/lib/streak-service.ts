import { supabase } from './supabase';
import type { UserStreak, DailyActivity, StreakMilestone, StreakUpdateResult } from './types';

/**
 * Streak Service
 * Manages user engagement streaks and gamification features
 */
export class StreakService {
    /**
     * Record user activity and update streak
     */
    static async recordActivity(userId: string, activityType: string): Promise<StreakUpdateResult | null> {
        try {
            const { data, error } = await supabase.rpc('update_user_streak', {
                p_user_id: userId,
                p_activity_type: activityType
            });

            if (error) {
                console.error('Error updating streak:', error);
                return null;
            }

            return data?.[0] || null;
        } catch (error) {
            console.error('Error in recordActivity:', error);
            return null;
        }
    }

    /**
     * Get user's current streak data
     */
    static async getUserStreak(userId: string): Promise<UserStreak | null> {
        try {
const { data, error } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error fetching user streak:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserStreak:', error);
            return null;
        }
    }

    /**
     * Get user's daily activities for a date range
     */
    static async getDailyActivities(
        userId: string,
        startDate?: string,
        endDate?: string
    ): Promise<DailyActivity[]> {
        try {
            let query = db
                .from('daily_activities')
                .select('*')
                .eq('user_id', userId)
                .order('activity_date', { ascending: false });

            if (startDate) {
                query = query.gte('activity_date', startDate);
            }
            if (endDate) {
                query = query.lte('activity_date', endDate);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching daily activities:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getDailyActivities:', error);
            return [];
        }
    }

    /**
     * Get user's achieved milestones
     */
    static async getMilestones(userId: string): Promise<StreakMilestone[]> {
        try {
            const { data, error } = await db
                .from('streak_milestones')
                .select('*')
                .eq('user_id', userId)
                .order('achieved_at', { ascending: false });

            if (error) {
                console.error('Error fetching milestones:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getMilestones:', error);
            return [];
        }
    }

    /**
     * Use a streak freeze
     */
    static async useStreakFreeze(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('use_streak_freeze', {
                p_user_id: userId
            });

            if (error) {
                console.error('Error using streak freeze:', error);
                return false;
            }

            return data === true;
        } catch (error) {
            console.error('Error in useStreakFreeze:', error);
            return false;
        }
    }

    /**
     * Get streak statistics
     */
    static async getStreakStats(userId: string) {
        try {
            const [streak, activities, milestones] = await Promise.all([
                this.getUserStreak(userId),
                this.getDailyActivities(userId),
                this.getMilestones(userId)
            ]);

            // Calculate additional stats
            const last7Days = activities.slice(0, 7);
            const last30Days = activities.slice(0, 30);

            const totalActivities = activities.reduce((sum, day) =>
                sum + day.activities.length, 0
            );

            const avgActivitiesPerDay = activities.length > 0
                ? totalActivities / activities.length
                : 0;

            return {
                currentStreak: streak?.current_streak || 0,
                longestStreak: streak?.longest_streak || 0,
                totalActiveDays: streak?.total_active_days || 0,
                streakFreezeCount: streak?.streak_freeze_count || 0,
                lastActivityDate: streak?.last_activity_date || null,
                last7DaysActive: last7Days.length,
                last30DaysActive: last30Days.length,
                totalActivities,
                avgActivitiesPerDay: Math.round(avgActivitiesPerDay * 10) / 10,
                milestones: milestones.length,
                recentMilestones: milestones.slice(0, 3),
                isStreakActive: this.isStreakActive(streak),
                daysUntilStreakBreak: this.getDaysUntilStreakBreak(streak)
            };
        } catch (error) {
            console.error('Error in getStreakStats:', error);
            return null;
        }
    }

    /**
     * Check if streak is currently active (activity within last 24 hours)
     */
    private static isStreakActive(streak: UserStreak | null): boolean {
        if (!streak) return false;

        const lastActivity = new Date(streak.last_activity_date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        return diffDays <= 1;
    }

    /**
     * Calculate days until streak breaks (if no activity)
     */
    private static getDaysUntilStreakBreak(streak: UserStreak | null): number {
        if (!streak) return 0;

        const lastActivity = new Date(streak.last_activity_date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) return 0; // Streak already broken
        if (diffDays === 1) return 0; // Last day to maintain streak
        return 1; // Still have today
    }

    /**
     * Get milestone badge info
     */
    static getMilestoneBadge(milestoneType: string, value: number) {
        const badges: Record<string, { emoji: string; title: string; description: string; color: string }> = {
            first_day: {
                emoji: '🌟',
                title: 'First Step',
                description: 'Started your financial journey!',
                color: 'bg-yellow-500'
            },
            week_streak: {
                emoji: '🔥',
                title: '7 Day Streak',
                description: 'One week of consistent tracking!',
                color: 'bg-orange-500'
            },
            month_streak: {
                emoji: '💎',
                title: '30 Day Streak',
                description: 'A full month of dedication!',
                color: 'bg-blue-500'
            },
            quarter_streak: {
                emoji: '👑',
                title: '90 Day Streak',
                description: 'Quarter year champion!',
                color: 'bg-purple-500'
            },
            hundred_days: {
                emoji: '💯',
                title: '100 Day Streak',
                description: 'Century of consistency!',
                color: 'bg-green-500'
            },
            year_streak: {
                emoji: '🏆',
                title: '365 Day Streak',
                description: 'Full year legend!',
                color: 'bg-red-500'
            }
        };

        return badges[milestoneType] || {
            emoji: '⭐',
            title: `${value} Day Streak`,
            description: 'Keep it up!',
            color: 'bg-gray-500'
        };
    }

    /**
     * Get motivational message based on streak
     */
    static getMotivationalMessage(currentStreak: number): string {
        if (currentStreak === 0) {
            return "Start your streak today! 🚀";
        } else if (currentStreak === 1) {
            return "Great start! Come back tomorrow to keep it going! 💪";
        } else if (currentStreak < 7) {
            return `${currentStreak} days strong! Keep the momentum! 🔥`;
        } else if (currentStreak < 30) {
            return `Amazing! ${currentStreak} day streak! You're building a habit! 💎`;
        } else if (currentStreak < 100) {
            return `Incredible! ${currentStreak} days of consistency! 👑`;
        } else if (currentStreak < 365) {
            return `Legendary! ${currentStreak} day streak! You're unstoppable! 🏆`;
        } else {
            return `MASTER! ${currentStreak} days! You're an inspiration! 🌟`;
        }
    }
}

/**
 * Activity type constants for tracking
 */
export const ACTIVITY_TYPES = {
    LOGIN: 'login',
    TRANSACTION_ADDED: 'transaction_added',
    SAVINGS_CONTRIBUTION: 'savings_contribution',
    BILL_PAID: 'bill_paid',
    GOAL_UPDATED: 'goal_updated',
    BUDGET_CREATED: 'budget_created',
    CLIENT_ADDED: 'client_added',
    INVOICE_CREATED: 'invoice_created',
    QUOTE_CREATED: 'quote_created',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];
