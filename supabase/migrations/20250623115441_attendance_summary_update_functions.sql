CREATE OR REPLACE FUNCTION update_attendance_summaries(p_employee_id TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
    employee_cursor CURSOR FOR
        SELECT DISTINCT employee_id 
        FROM public.attendance_records 
        WHERE (p_employee_id IS NULL OR employee_id = p_employee_id);
BEGIN
    -- Loop through each employee (or specific employee if provided)
    FOR rec IN employee_cursor LOOP
        PERFORM update_employee_monthly_summaries(rec.employee_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_employee_monthly_summaries(p_employee_id TEXT)
RETURNS VOID AS $$
DECLARE
    month_rec RECORD;
    summary_data RECORD;
    month_cursor CURSOR FOR
        SELECT DISTINCT 
            EXTRACT(YEAR FROM work_date)::INTEGER as year,
            EXTRACT(MONTH FROM work_date)::INTEGER as month
        FROM public.attendance_records 
        WHERE employee_id = p_employee_id
        ORDER BY year, month;
BEGIN
    -- Loop through each month for the employee
    FOR month_rec IN month_cursor LOOP
        
        -- Calculate monthly summary data
        WITH monthly_calendar AS (
            SELECT generate_series(
                DATE_TRUNC('month', MAKE_DATE(month_rec.year, month_rec.month, 1)),
                DATE_TRUNC('month', MAKE_DATE(month_rec.year, month_rec.month, 1)) + INTERVAL '1 month' - INTERVAL '1 day',
                INTERVAL '1 day'
            )::DATE AS work_date
        ),
        required_workdays_calc AS (
            SELECT COUNT(*) AS required_workdays
            FROM monthly_calendar mc
            WHERE EXTRACT(DOW FROM mc.work_date) NOT IN (0, 6) -- exclude weekends
              AND mc.work_date NOT IN (SELECT date FROM public.public_holidays WHERE date IS NOT NULL)
        ),
        leave_dates_calc AS (
            SELECT JSONB_AGG(mc.work_date ORDER BY mc.work_date) AS leave_dates
            FROM monthly_calendar mc
            LEFT JOIN public.attendance_records ar ON (
                ar.employee_id = p_employee_id 
                AND ar.work_date = mc.work_date
            )
            WHERE EXTRACT(DOW FROM mc.work_date) NOT IN (0, 6) -- exclude weekends
              AND mc.work_date NOT IN (SELECT date FROM public.public_holidays WHERE date IS NOT NULL)
              AND ar.work_date IS NULL -- no attendance record = leave
        ),
        attendance_stats AS (
            SELECT
                -- Total days with complete clock-in/out
                COUNT(*) FILTER (
                    WHERE clock_in IS NOT NULL AND clock_out IS NOT NULL
                ) AS total_days,
                
                -- Total work hours (excluding lunch)
                COALESCE(
                    SUM(
                        EXTRACT(EPOCH FROM (clock_out - clock_in)) - 
                        COALESCE(EXTRACT(EPOCH FROM (lunch_in - lunch_out)), 0)
                    ) / 3600, 0
                ) AS total_hours,
                
                -- Average daily hours
                COALESCE(
                    AVG(
                        EXTRACT(EPOCH FROM (clock_out - clock_in)) - 
                        COALESCE(EXTRACT(EPOCH FROM (lunch_in - lunch_out)), 0)
                    ) / 3600, 0
                ) AS avg_daily_hours,
                
                -- Work mode counts
                COUNT(*) FILTER (WHERE work_mode = 'office') AS office_days,
                COUNT(*) FILTER (WHERE work_mode = 'home') AS home_days,
                
                -- Average lunch minutes
                COALESCE(
                    AVG(EXTRACT(EPOCH FROM (lunch_in - lunch_out)) / 60) FILTER (
                        WHERE lunch_out IS NOT NULL AND lunch_in IS NOT NULL
                    ), 0
                ) AS avg_lunch_minutes
                
            FROM public.attendance_records ar
            WHERE ar.employee_id = p_employee_id
              AND EXTRACT(YEAR FROM ar.work_date) = month_rec.year
              AND EXTRACT(MONTH FROM ar.work_date) = month_rec.month
        )
        SELECT 
            -- Basic attendance data
            ast.total_days,
            ast.total_hours::INTEGER,
            ast.avg_daily_hours::SMALLINT,
            ast.office_days::INTEGER,
            ast.home_days::INTEGER,
            ast.avg_lunch_minutes::INTEGER,
            
            -- Leave calculations  
            COALESCE(rwc.required_workdays, 0) AS required_workdays,
            GREATEST(COALESCE(rwc.required_workdays, 0) - ast.total_days, 0) AS leave_days,
            CASE 
                WHEN COALESCE(rwc.required_workdays, 0) > 0 THEN
                    ROUND(
                        GREATEST(COALESCE(rwc.required_workdays, 0) - ast.total_days, 0) * 100.0 / rwc.required_workdays, 
                        2
                    )
                ELSE 0
            END AS leave_rate,
            
            -- Leave dates
            COALESCE(ldc.leave_dates, '[]'::JSONB) AS leave_dates
            
        INTO summary_data
        FROM attendance_stats ast
        CROSS JOIN required_workdays_calc rwc
        CROSS JOIN leave_dates_calc ldc;
        
        -- Insert or update the summary record
        INSERT INTO public.attendance_summaries (
            employee_id,
            year,
            month,
            total_days,
            total_hours,
            avg_daily_hours,
            leave_days,
            leave_rate,
            leave_dates,
            avg_lunch_minutes,
            home_days,
            office_days,
            created_at
        ) VALUES (
            p_employee_id,
            month_rec.year,
            month_rec.month,
            summary_data.total_days,
            summary_data.total_hours,
            summary_data.avg_daily_hours,
            summary_data.leave_days,
            summary_data.leave_rate,
            summary_data.leave_dates,
            summary_data.avg_lunch_minutes,
            summary_data.home_days,
            summary_data.office_days,
            CURRENT_TIMESTAMP
        )
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
            
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create unique constraint to support ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_summaries_employee_year_month 
ON public.attendance_summaries (employee_id, year, month);