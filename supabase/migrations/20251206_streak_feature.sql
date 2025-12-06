-- ============================================
-- STREAK FEATURE IMPLEMENTATION
-- ============================================
-- Tracks user engagement streaks for gamification

-- ============================================
-- USER STREAKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Current streak
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Last activity tracking
    last_activity_date DATE NOT NULL,
    last_activity_type TEXT NOT NULL,
    
    -- Streak milestones
    total_active_days INTEGER DEFAULT 0,
    streak_freeze_count INTEGER DEFAULT 0, -- Number of streak freezes available
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- ============================================
-- DAILY ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    
    -- Activity types completed today
    activities JSONB DEFAULT '[]'::jsonb,
    
    -- Activity counts
    transactions_count INTEGER DEFAULT 0,
    savings_count INTEGER DEFAULT 0,
    bills_paid_count INTEGER DEFAULT 0,
    goals_updated_count INTEGER DEFAULT 0,
    
    -- Points/rewards
    points_earned INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, activity_date)
);

-- ============================================
-- STREAK MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS streak_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    milestone_type TEXT NOT NULL CHECK (milestone_type IN (
        'first_day', 'week_streak', 'month_streak', 'quarter_streak', 
        'year_streak', 'hundred_days', 'custom'
    )),
    milestone_value INTEGER NOT NULL, -- e.g., 7 for week, 30 for month
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Reward info
    reward_type TEXT, -- 'badge', 'points', 'feature_unlock'
    reward_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate milestones
    UNIQUE(user_id, milestone_type, milestone_value)
);

-- ============================================
-- STREAK FREEZE HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS streak_freeze_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    freeze_date DATE NOT NULL,
    reason TEXT, -- 'manual', 'auto', 'reward'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freeze_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- User Streaks
DROP POLICY IF EXISTS "Users can manage their own streaks" ON user_streaks;
CREATE POLICY "Users can manage their own streaks" 
ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- Daily Activities
DROP POLICY IF EXISTS "Users can manage their own daily_activities" ON daily_activities;
CREATE POLICY "Users can manage their own daily_activities" 
ON daily_activities FOR ALL USING (auth.uid() = user_id);

-- Streak Milestones
DROP POLICY IF EXISTS "Users can view their own milestones" ON streak_milestones;
CREATE POLICY "Users can view their own milestones" 
ON streak_milestones FOR ALL USING (auth.uid() = user_id);

-- Streak Freeze History
DROP POLICY IF EXISTS "Users can view their own freeze_history" ON streak_freeze_history;
CREATE POLICY "Users can view their own freeze_history" 
ON streak_freeze_history FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS daily_activities_user_id_idx ON daily_activities(user_id);
CREATE INDEX IF NOT EXISTS daily_activities_date_idx ON daily_activities(activity_date);
CREATE INDEX IF NOT EXISTS streak_milestones_user_id_idx ON streak_milestones(user_id);
CREATE INDEX IF NOT EXISTS streak_freeze_history_user_id_idx ON streak_freeze_history(user_id);

-- ============================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS user_streaks_updated_at ON user_streaks;
CREATE TRIGGER user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS daily_activities_updated_at ON daily_activities;
CREATE TRIGGER daily_activities_updated_at BEFORE UPDATE ON daily_activities
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- HELPER FUNCTION: Update Streak
-- ============================================
CREATE OR REPLACE FUNCTION update_user_streak(
    p_user_id UUID,
    p_activity_type TEXT
)
RETURNS TABLE(
    current_streak INTEGER,
    longest_streak INTEGER,
    is_new_milestone BOOLEAN,
    milestone_type TEXT
) AS $$
DECLARE
    v_last_activity_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_today DATE := CURRENT_DATE;
    v_is_new_milestone BOOLEAN := FALSE;
    v_milestone_type TEXT := NULL;
BEGIN
    -- Get or create user streak record
    INSERT INTO user_streaks (user_id, last_activity_date, last_activity_type, current_streak, longest_streak, total_active_days)
    VALUES (p_user_id, v_today, p_activity_type, 1, 1, 1)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Get current streak data
    SELECT last_activity_date, user_streaks.current_streak, user_streaks.longest_streak
    INTO v_last_activity_date, v_current_streak, v_longest_streak
    FROM user_streaks
    WHERE user_id = p_user_id;
    
    -- Calculate new streak
    IF v_last_activity_date = v_today THEN
        -- Same day, no streak change
        NULL;
    ELSIF v_last_activity_date = v_today - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        v_current_streak := v_current_streak + 1;
        
        -- Update longest streak if needed
        IF v_current_streak > v_longest_streak THEN
            v_longest_streak := v_current_streak;
        END IF;
        
        -- Check for milestones
        IF v_current_streak = 7 THEN
            v_is_new_milestone := TRUE;
            v_milestone_type := 'week_streak';
            INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
            VALUES (p_user_id, 'week_streak', 7)
            ON CONFLICT DO NOTHING;
        ELSIF v_current_streak = 30 THEN
            v_is_new_milestone := TRUE;
            v_milestone_type := 'month_streak';
            INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
            VALUES (p_user_id, 'month_streak', 30)
            ON CONFLICT DO NOTHING;
        ELSIF v_current_streak = 100 THEN
            v_is_new_milestone := TRUE;
            v_milestone_type := 'hundred_days';
            INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
            VALUES (p_user_id, 'hundred_days', 100)
            ON CONFLICT DO NOTHING;
        ELSIF v_current_streak = 365 THEN
            v_is_new_milestone := TRUE;
            v_milestone_type := 'year_streak';
            INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
            VALUES (p_user_id, 'year_streak', 365)
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Update streak record
        UPDATE user_streaks
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_activity_date = v_today,
            last_activity_type = p_activity_type,
            total_active_days = total_active_days + 1
        WHERE user_id = p_user_id;
    ELSE
        -- Streak broken, reset to 1
        v_current_streak := 1;
        
        UPDATE user_streaks
        SET current_streak = 1,
            last_activity_date = v_today,
            last_activity_type = p_activity_type,
            total_active_days = total_active_days + 1
        WHERE user_id = p_user_id;
    END IF;
    
    -- Record daily activity
    INSERT INTO daily_activities (user_id, activity_date, activities)
    VALUES (p_user_id, v_today, jsonb_build_array(jsonb_build_object('type', p_activity_type, 'timestamp', NOW())))
    ON CONFLICT (user_id, activity_date) 
    DO UPDATE SET 
        activities = daily_activities.activities || jsonb_build_array(jsonb_build_object('type', p_activity_type, 'timestamp', NOW())),
        updated_at = NOW();
    
    -- Return results
    RETURN QUERY SELECT v_current_streak, v_longest_streak, v_is_new_milestone, v_milestone_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Use Streak Freeze
-- ============================================
CREATE OR REPLACE FUNCTION use_streak_freeze(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_freeze_count INTEGER;
BEGIN
    -- Check if user has freezes available
    SELECT streak_freeze_count INTO v_freeze_count
    FROM user_streaks
    WHERE user_id = p_user_id;
    
    IF v_freeze_count > 0 THEN
        -- Use a freeze
        UPDATE user_streaks
        SET streak_freeze_count = streak_freeze_count - 1,
            last_activity_date = CURRENT_DATE
        WHERE user_id = p_user_id;
        
        -- Record freeze usage
        INSERT INTO streak_freeze_history (user_id, freeze_date, reason)
        VALUES (p_user_id, CURRENT_DATE, 'manual');
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION update_user_streak TO authenticated;
GRANT EXECUTE ON FUNCTION use_streak_freeze TO authenticated;
