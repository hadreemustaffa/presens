create or replace view employee_analytics_summary_all_time_view
with
  (security_invoker = on) as
with
  employee_date_ranges as (
    select
      employee_id,
      MIN(work_date) as start_date,
      CURRENT_DATE as end_date
    from
      public.attendance_records
    group by
      employee_id
  ),
  employee_calendar as (
    select
      edr.employee_id,
      generate_series(edr.start_date, edr.end_date, INTERVAL '1 day')::DATE as work_date
    from
      employee_date_ranges edr
  ),
  required_workdays_calc as (
    select
      employee_id,
      COUNT(*) as required_workdays
    from
      employee_calendar
    where
      EXTRACT(
        DOW
        from
          work_date
      ) not in (0, 6) -- exclude Sun(0) & Sat(6)
      and work_date not in (
        select
          date
        from
          public_holidays
      )
    group by
      employee_id
  ),
  leave_dates_calc as (
    select
      ec.employee_id,
      JSONB_AGG(
        ec.work_date
        order by
          ec.work_date
      ) as leave_dates
    from
      employee_calendar ec
      left join public.attendance_records ar on (
        ec.employee_id = ar.employee_id
        and ec.work_date = ar.work_date
      )
    where
      EXTRACT(
        DOW
        from
          ec.work_date
      ) not in (0, 6) -- exclude weekends
      and ec.work_date not in (
        select
          date
        from
          public_holidays
      )
      and ar.work_date is null -- no attendance record = leave
    group by
      ec.employee_id
  )
select
  ar.employee_id,
  -- Total days with clock-in/out
  COUNT(*) filter (
    where
      ar.clock_in is not null
      and ar.clock_out is not null
  ) as total_days,
  -- Total work hours (excluding lunch)
  SUM(
    EXTRACT(
      EPOCH
      from
        (ar.clock_out - ar.clock_in)
    ) - COALESCE(
      EXTRACT(
        EPOCH
        from
          (ar.lunch_in - ar.lunch_out)
      ),
      0
    )
  ) / 3600 as total_hours,
  -- Average daily hours
  AVG(
    EXTRACT(
      EPOCH
      from
        (ar.clock_out - ar.clock_in)
    ) - COALESCE(
      EXTRACT(
        EPOCH
        from
          (ar.lunch_in - ar.lunch_out)
      ),
      0
    )
  ) / 3600 as avg_daily_hours,
  -- Work mode preference
  COUNT(*) filter (
    where
      ar.work_mode = 'office'
  ) as office_days,
  COUNT(*) filter (
    where
      ar.work_mode = 'home'
  ) as home_days,
  -- Required working days calculation
  COALESCE(rw.required_workdays, 0) as required_workdays,
  -- Leave calculations
  COALESCE(rw.required_workdays, 0) - COUNT(*) filter (
    where
      ar.clock_in is not null
      and ar.clock_out is not null
  ) as leave_days,
  -- Leave rate as percentage
  case
    when COALESCE(rw.required_workdays, 0) > 0 then ROUND(
      (
        COALESCE(rw.required_workdays, 0) - COUNT(*) filter (
          where
            ar.clock_in is not null
            and ar.clock_out is not null
        )
      ) * 100.0 / rw.required_workdays,
      2
    )
    else 0
  end as leave_rate_percent,
  -- Leave dates in JSONB format
  COALESCE(ld.leave_dates, '[]'::JSONB) as leave_dates,
  -- Average lunch minutes
  COALESCE(
    AVG(
      EXTRACT(
        EPOCH
        from
          (lunch_in - lunch_out)
      ) / 60
    ) filter (
      where
        lunch_out is not null
        and lunch_in is not null
    ),
    0
  ) as avg_lunch_minutes
from
  public.attendance_records ar
  left join required_workdays_calc rw on ar.employee_id = rw.employee_id
  left join leave_dates_calc ld on ar.employee_id = ld.employee_id
group by
  ar.employee_id,
  rw.required_workdays,
  ld.leave_dates
order by
  ar.employee_id;