DROP FUNCTION get_daily_hours_record(text,date,date);
DROP FUNCTION get_daily_data_record(text,date,date);

CREATE OR REPLACE FUNCTION get_daily_data_record(
  p_employee_id TEXT,
  p_start_date DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE SQL
AS $$
  SELECT COALESCE(
    (
      SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'date', work_date::TEXT,
          'hours_worked',
            CASE
              WHEN clock_in IS NOT NULL AND clock_out IS NOT NULL THEN
                ROUND(EXTRACT(EPOCH FROM (clock_out - clock_in - (lunch_in - lunch_out))) / 3600.0, 2)
              ELSE NULL
            END,
          'lunch_taken_minutes',
            CASE
              WHEN lunch_in IS NOT NULL AND lunch_out IS NOT NULL THEN
                ROUND(EXTRACT(EPOCH FROM (lunch_in - lunch_out)) / 60.0, 0)
              ELSE NULL
            END
        )
        ORDER BY work_date
      )
      FROM public.attendance_records ar
      WHERE ar.employee_id = p_employee_id
        AND ar.work_date BETWEEN p_start_date AND p_end_date
    ),
    '[]'::JSONB
  );
$$;