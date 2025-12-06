'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminGuard } from '@/components/admin-guard';
import { 
  Users, 
  UserPlus, 
  Activity, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  activeToday: number;
  newSignups: number;
  totalTransactions: number;
  totalErrors: number;
  activeStreaks: number;
  averageStreak: number;
}

interface RecentActivity {
  id: string;
  type: 'signup' | 'transaction' | 'error' | 'login';
  message: string;
  timestamp: string;
  userId?: string;
}

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  resolved: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeToday: 0,
    newSignups: 0,
    totalTransactions: 0,
    totalErrors: 0,
    activeStreaks: 0,
    averageStreak: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active users today (from user_metadata last_login)
      const { count: activeToday } = await supabase
        .from('user_metadata')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', `${today}T00:00:00`);

      // Get new signups today
      const { count: newSignups } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);

      // Get total transactions
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Get total errors
      const { count: totalErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });

      // Get streak statistics
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak');

      const activeStreaks = streakData?.filter(s => s.current_streak > 0).length || 0;
      const averageStreak = streakData?.reduce((sum, s) => sum + s.current_streak, 0) / (streakData?.length || 1) || 0;

      // Get recent errors
      const { data: recentErrorsData } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent activity (mock for now, would come from analytics_events)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'signup',
          message: 'New user signed up',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: '2',
          type: 'transaction',
          message: 'Transaction recorded',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: '3',
          type: 'login',
          message: 'User logged in',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ];

      setStats({
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        newSignups: newSignups || 0,
        totalTransactions: totalTransactions || 0,
        totalErrors: totalErrors || 0,
        activeStreaks,
        averageStreak: Math.round(averageStreak),
      });

      setRecentActivity(mockActivity);
      setRecentErrors(recentErrorsData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadAdminData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return <UserPlus className="h-4 w-4" />;
      case 'transaction': return <CreditCard className="h-4 w-4" />;
      case 'login': return <Users className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {format(lastUpdated, 'MMM d, yyyy HH:mm:ss')}
          </p>
        </div>
        <Button onClick={loadAdminData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Users active in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSignups.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              New users today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStreaks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Users with active streaks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Average streak length
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Errors logged to date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-blue-600">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentErrors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent errors</p>
              ) : (
                recentErrors.map((error) => (
                  <div key={error.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                    <div className="text-red-600 mt-0.5">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(error.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {error.error_type}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {error.error_message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All Users
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Error Logs
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Analytics Events
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminGuard>
  );
}