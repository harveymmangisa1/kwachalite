import { supabase } from './supabase';

export interface AnalyticsEvent {
  event_type: 'signup' | 'login' | 'transaction' | 'budget_created' | 'goal_created' | 'bill_created' | 'feature_used';
  user_id?: string;
  properties?: Record<string, any>;
}

export interface ErrorLog {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface FeatureUsage {
  feature_name: string;
  user_id?: string;
  usage_count?: number;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async trackEvent(event: AnalyticsEvent) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: event.event_type,
          user_id: event.user_id,
          properties: event.properties || {},
        });

      if (error) {
        console.error('Failed to track analytics event:', error);
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  /**
   * Log an error
   */
  static async logError(error: ErrorLog) {
    try {
      const { error: insertError } = await supabase
        .from('error_logs')
        .insert({
          error_type: error.error_type,
          error_message: error.error_message,
          stack_trace: error.stack_trace,
          user_id: error.user_id,
          severity: error.severity,
        });

      if (insertError) {
        console.error('Failed to log error:', insertError);
      }
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUsage(usage: FeatureUsage) {
    try {
      const { error } = await supabase
        .from('feature_usage')
        .insert({
          feature_name: usage.feature_name,
          user_id: usage.user_id,
          usage_count: usage.usage_count || 1,
        });

      if (error) {
        console.error('Failed to track feature usage:', error);
      }
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }

  /**
   * Get daily stats for a date range
   */
  static async getDailyStats(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('Failed to get daily stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return [];
    }
  }

  /**
   * Get recent errors
   */
  static async getRecentErrors(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get recent errors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting recent errors:', error);
      return [];
    }
  }

  /**
   * Get feature usage stats
   */
  static async getFeatureUsageStats(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('feature_usage')
        .select(`
          feature_name,
          usage_count,
          user_id,
          last_used_at
        `)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get feature usage stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting feature usage stats:', error);
      return [];
    }
  }

  /**
   * Aggregate daily stats (should be run by a cron job)
   */
  static async aggregateDailyStats(date: string) {
    try {
      // Get DAU for the date
      const { count: dau } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .eq('event_type', 'login')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Get new signups for the date
      const { count: newSignups } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'signup')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Get total transactions for the date
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Get total errors for the date
      const { count: totalErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Upsert daily stats
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          date,
          dau: dau || 0,
          new_signups: newSignups || 0,
          total_transactions: totalTransactions || 0,
          total_errors: totalErrors || 0,
        }, {
          onConflict: 'date',
        });

      if (error) {
        console.error('Failed to aggregate daily stats:', error);
      }
    } catch (error) {
      console.error('Error aggregating daily stats:', error);
    }
  }
}

// Helper function to automatically track errors
export const trackError = (error: Error, context?: string, userId?: string) => {
  AnalyticsService.logError({
    error_type: error.name || 'UnknownError',
    error_message: error.message || 'Unknown error occurred',
    stack_trace: error.stack,
    user_id: userId,
    severity: 'critical', // Default to critical, can be overridden
  });
};

// Helper function to track feature usage
export const trackFeature = (featureName: string, userId?: string) => {
  AnalyticsService.trackFeatureUsage({
    feature_name: featureName,
    user_id: userId,
  });
};