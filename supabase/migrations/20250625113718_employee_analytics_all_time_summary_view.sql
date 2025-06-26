create or replace view employee_analytics_summary_all_time_view
with
  (security_invoker = on) as
select
  employee_id,
  -- Sum of basic attendance metrics
  SUM(total_days) as total_days,
  SUM(total_hours) as total_hours,
  -- Weighted average of daily hours (total hours / total days)
  case
    when SUM(total_days) > 0 then ROUND(SUM(total_hours)::NUMERIC / SUM(total_days), 2)
    else 0
  end as avg_daily_hours,
  SUM(leave_days) as leave_days,
  -- Calculate overall leave rate: total leave days / total required workdays
  case
    when SUM(total_days) + SUM(leave_days) > 0 then ROUND(
      (SUM(leave_days) * 100.0) / (SUM(total_days) + SUM(leave_days)),
      2
    )
    else 0
  end as leave_rate,
  -- Combine all leave dates into a single JSONB array
  case
    when COUNT(leave_dates) > 0 then (
      select
        JSONB_AGG(
          distinct date_val
          order by
            date_val
        )
      from
        (
          select
            JSONB_ARRAY_ELEMENTS_TEXT(leave_dates)::DATE as date_val
          from
            public.attendance_summaries s2
          where
            s2.employee_id = s1.employee_id
            and leave_dates != '[]'::JSONB
            and leave_dates is not null
        ) combined_dates
    )
    else '[]'::JSONB
  end as leave_dates,
  -- Get all home work dates from attendance_records
  COALESCE(
    (
      select
        JSONB_AGG(
          work_date
          order by
            work_date
        )
      from
        public.attendance_records ar
      where
        ar.employee_id = s1.employee_id
        and ar.work_mode = 'home'
    ),
    '[]'::JSONB
  ) as home_work_dates,
  -- Get all office work dates from attendance_records
  COALESCE(
    (
      select
        JSONB_AGG(
          work_date
          order by
            work_date
        )
      from
        public.attendance_records ar
      where
        ar.employee_id = s1.employee_id
        and ar.work_mode = 'office'
    ),
    '[]'::JSONB
  ) as office_work_dates,
  -- Weighted average of lunch minutes
  case
    when SUM(total_days) > 0 then ROUND(
      SUM(avg_lunch_minutes * total_days)::NUMERIC / SUM(total_days),
      0
    )
    else 0
  end as avg_lunch_minutes,
  SUM(home_days) as home_days,
  SUM(office_days) as office_days,
  -- Calculate total required workdays (total_days + leave_days)
  SUM(total_days) + SUM(leave_days) as required_workdays,
  -- Time pattern insights from attendance_records
  (
    select
      case
        when COUNT(*) > 0 then EXTRACT(
          hour
          from
            AVG(clock_in)
        ) || ':' || LPAD(
          EXTRACT(
            minute
            from
              AVG(clock_in)
          )::TEXT,
          2,
          '0'
        )
        else null
      end
    from
      public.attendance_records ar
    where
      ar.employee_id = s1.employee_id
      and ar.clock_in is not null
  ) as avg_clock_in_time,
  (
    select
      case
        when COUNT(*) > 0 then EXTRACT(
          hour
          from
            AVG(clock_out)
        ) || ':' || LPAD(
          EXTRACT(
            minute
            from
              AVG(clock_out)
          )::TEXT,
          2,
          '0'
        )
        else null
      end
    from
      public.attendance_records ar
    where
      ar.employee_id = s1.employee_id
      and ar.clock_out is not null
  ) as avg_clock_out_time,
  -- Consistency metrics - shows the time difference between daily clock ins
  (
    select
      ROUND(
        STDDEV(
          EXTRACT(
            EPOCH
            from
              clock_in
          ) / 60
        ),
        2
      )
    from
      public.attendance_records ar
    where
      ar.employee_id = s1.employee_id
      and ar.clock_in is not null
  ) as clock_in_consistency_minutes,
  -- Preferred home work days (top 2 most common days)
  (
    select
      JSONB_AGG(
        day_name
        order by
          day_count desc
      )
    from
      (
        select
          case EXTRACT(
              DOW
              from
                work_date
            )
            when 1 then 'Monday'
            when 2 then 'Tuesday'
            when 3 then 'Wednesday'
            when 4 then 'Thursday'
            when 5 then 'Friday'
            when 6 then 'Saturday'
            when 0 then 'Sunday'
          end as day_name,
          COUNT(*) as day_count
        from
          public.attendance_records ar
        where
          ar.employee_id = s1.employee_id
          and ar.work_mode = 'home'
        group by
          EXTRACT(
            DOW
            from
              work_date
          )
        order by
          day_count desc
        limit
          2
      ) top_home_days
  ) as preferred_home_days,
  -- Incomplete records tracking
  COALESCE(
    (
      select
        JSONB_AGG(
          work_date
          order by
            work_date
        )
      from
        public.attendance_records ar
      where
        ar.employee_id = s1.employee_id
        and (
          ar.clock_in is null
          or ar.clock_out is null
        )
    ),
    '[]'::JSONB
  ) as incomplete_records_dates,
  -- Get all dates from public_holidays
  COALESCE(
  (
    select
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'name', name,
          'date', date
        )
        order by
          date
      )
    from
      public.public_holidays ph
  ),
  '[]'::JSONB
  ) as public_holidays_dates,
  -- Work mode preferences (percentages)
  case
    when SUM(total_days) > 0 then ROUND((SUM(home_days) * 100.0) / SUM(total_days), 2)
    else 0
  end as home_work_percentage,
  case
    when SUM(total_days) > 0 then ROUND((SUM(office_days) * 100.0) / SUM(total_days), 2)
    else 0
  end as office_work_percentage,
  -- Attendance rate (complement of leave rate)
  case
    when SUM(total_days) + SUM(leave_days) > 0 then ROUND(
      (SUM(total_days) * 100.0) / (SUM(total_days) + SUM(leave_days)),
      2
    )
    else 0
  end as attendance_rate
from
  public.attendance_summaries s1
group by
  employee_id
order by
  employee_id;