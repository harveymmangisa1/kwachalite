-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'signup', 'login', 'transaction', etc.
    user_id UUID REFERENCES auth.users(id),
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Stats Table (pre-aggregated for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    dau INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT,
    error_message TEXT,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    severity TEXT, -- 'critical', 'high', 'medium', 'low'
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Usage Table
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access analytics tables
CREATE POLICY "Service role only for analytics_events" ON analytics_events
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role only for daily_stats" ON daily_stats
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role only for error_logs" ON error_logs
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role only for feature_usage" ON feature_usage
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');