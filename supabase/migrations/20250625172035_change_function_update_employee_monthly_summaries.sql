CREATE OR REPLACE FUNCTION update_employee_monthly_summaries(p_employee_id TEXT) 
RETURNS VOID
SET search_path = 'public' AS $$
BEGIN
    INSERT INTO public.attendance_summaries (
        employee_id, year, month, total_days, total_hours, avg_daily_hours,
        leave_days, leave_rate, leave_dates, avg_lunch_minutes, 
        home_days, office_days, created_at
    )
    WITH employee_months AS (
        -- Get all months that have attendance records for this employee
        SELECT DISTINCT 
            p_employee_id as employee_id,
            EXTRACT(YEAR FROM work_date)::INTEGER as year,
            EXTRACT(MONTH FROM work_date)::INTEGER as month
        FROM public.attendance_records 
        WHERE employee_id = p_employee_id
    ),
    
    workday_calendar AS (
        -- Generate all workdays for each month (excluding weekends and holidays)
        SELECT 
            em.employee_id,
            em.year,
            em.month,
            calendar.work_date
        FROM employee_months em
        CROSS JOIN LATERAL (
            SELECT generate_series(
                DATE_TRUNC('month', MAKE_DATE(em.year, em.month, 1)),
                CASE 
                    WHEN em.year = EXTRACT(YEAR FROM CURRENT_DATE) 
                     AND em.month = EXTRACT(MONTH FROM CURRENT_DATE) THEN
                        CURRENT_DATE
                    ELSE
                        DATE_TRUNC('month', MAKE_DATE(em.year, em.month, 1)) + INTERVAL '1 month' - INTERVAL '1 day'
                END,
                INTERVAL '1 day'
            )::DATE AS work_date
        ) calendar
        WHERE EXTRACT(DOW FROM calendar.work_date) NOT IN (0, 6) -- No weekends
          AND NOT EXISTS (
              SELECT 1 FROM public.public_holidays ph 
              WHERE ph.date = calendar.work_date
          )
    ),
    
    attendance_aggregates AS (
        -- Calculate attendance statistics per month
        SELECT
            ar.employee_id,
            EXTRACT(YEAR FROM ar.work_date)::INTEGER as year,
            EXTRACT(MONTH FROM ar.work_date)::INTEGER as month,
            
            -- Attendance counts
            COUNT(*) FILTER (WHERE clock_in IS NOT NULL AND clock_out IS NOT NULL) AS total_days,
            COUNT(*) FILTER (WHERE work_mode = 'office') AS office_days,
            COUNT(*) FILTER (WHERE work_mode = 'home') AS home_days,
            
            -- Time calculations
            COALESCE(SUM(
                EXTRACT(EPOCH FROM (clock_out - clock_in)) - 
                COALESCE(EXTRACT(EPOCH FROM (lunch_in - lunch_out)), 0)
            ) / 3600, 0) AS total_hours,
            
            COALESCE(AVG(
                EXTRACT(EPOCH FROM (clock_out - clock_in)) - 
                COALESCE(EXTRACT(EPOCH FROM (lunch_in - lunch_out)), 0)
            ) / 3600, 0) AS avg_daily_hours,
            
            COALESCE(AVG(EXTRACT(EPOCH FROM (lunch_in - lunch_out)) / 60) FILTER (
                WHERE lunch_out IS NOT NULL AND lunch_in IS NOT NULL
            ), 0) AS avg_lunch_minutes
            
        FROM public.attendance_records ar
        WHERE ar.employee_id = p_employee_id
        GROUP BY ar.employee_id, EXTRACT(YEAR FROM ar.work_date), EXTRACT(MONTH FROM ar.work_date)
    ),
    
    leave_calculations AS (
        -- Calculate leave days and dates per month
        SELECT 
            wc.employee_id,
            wc.year,
            wc.month,
            COUNT(*) AS required_workdays,
            COUNT(*) FILTER (WHERE ar.work_date IS NULL AND wc.work_date <= CURRENT_DATE) AS leave_days,
            JSONB_AGG(wc.work_date ORDER BY wc.work_date) FILTER (
                WHERE ar.work_date IS NULL AND wc.work_date <= CURRENT_DATE
            ) AS leave_dates
        FROM workday_calendar wc
        LEFT JOIN public.attendance_records ar ON (
            ar.employee_id = wc.employee_id 
            AND ar.work_date = wc.work_date
        )
        GROUP BY wc.employee_id, wc.year, wc.month
    )
    
    -- Final result combining all calculations
    SELECT 
        lc.employee_id,
        lc.year,
        lc.month,
        COALESCE(aa.total_days, 0)::INTEGER,
        COALESCE(aa.total_hours, 0)::INTEGER,
        COALESCE(aa.avg_daily_hours, 0)::SMALLINT,
        COALESCE(lc.leave_days, 0)::INTEGER,
        CASE 
            WHEN lc.required_workdays > 0 THEN
                ROUND(COALESCE(lc.leave_days, 0) * 100.0 / lc.required_workdays, 2)
            ELSE 0
        END AS leave_rate,
        COALESCE(lc.leave_dates, '[]'::JSONB),
        COALESCE(aa.avg_lunch_minutes, 0)::INTEGER,
        COALESCE(aa.home_days, 0)::INTEGER,
        COALESCE(aa.office_days, 0)::INTEGER,
        CURRENT_TIMESTAMP
    FROM leave_calculations lc
    LEFT JOIN attendance_aggregates aa ON (
        aa.employee_id = lc.employee_id 
        AND aa.year = lc.year 
        AND aa.month = lc.month
    )
    
    -- Handle conflicts (upsert)
    ON CONFLICT (employee_id, year, month) 
    DO UPDATE SET
        total_days = EXCLUDED.total_days,
        total_hours = EXCLUDED.total_hours,
        avg_daily_hours = EXCLUDED.avg_daily_hours,
        leave_days = EXCLUDED.leave_days,
        leave_rate = EXCLUDED.leave_rate,
        leave_dates = EXCLUDED.leave_dates,
        avg_lunch_minutes = EXCLUDED.avg_lunch_minutes,
        home_days = EXCLUDED.home_days,
        office_days = EXCLUDED.office_days,
        updated_at = CURRENT_TIMESTAMP;
        
END;
$$ LANGUAGE plpgsql;