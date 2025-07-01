import dayjs from 'dayjs';
import { Suspense } from 'react';

import { getActiveUser, getAllTimeSummary, getDailyHoursRecord } from '@/api/dashboard';
import AttendanceCalendar from '@/app/dashboard/summaries/components/all-time/attendance-calendar';
import { DailyDataChart } from '@/app/dashboard/summaries/components/all-time/daily-data-chart';
import { MetricsCard } from '@/app/dashboard/summaries/components/all-time/metrics-card';
import { PreferredHomeDaysCard } from '@/app/dashboard/summaries/components/all-time/preferred-home-days-card';
import { WorkModeChart } from '@/app/dashboard/summaries/components/all-time/work-mode-chart';
import { MIN_DAYS_FOR_SUMMARIES } from '@/lib/constants';

export default async function Page() {
  const { user } = await getActiveUser();

  const summary = await getAllTimeSummary({ employee_id: user.user_metadata.employee_id });

  const dailyDataRecord = getDailyHoursRecord({
    p_employee_id: user.user_metadata.employee_id,
    p_start_date: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    p_end_date: dayjs().format('YYYY-MM-DD'),
  });

  if (!summary) {
    return (
      <div className="flex h-full flex-col gap-4 px-4">
        <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border">
          <div>No data available</div>
        </div>
      </div>
    );
  }

  if (summary.total_days < MIN_DAYS_FOR_SUMMARIES) {
    return (
      <div className="flex h-full flex-col gap-4 px-4">
        <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border">
          <p>
            You&apos;ll see summaries here once you have {MIN_DAYS_FOR_SUMMARIES - summary.total_days} more days of
            attendance.
          </p>
          <p>This ensures your insights are relevant and informative.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
      <div className="flex flex-col gap-4">
        <MetricsCard {...summary} />
        <div className="grid grid-cols-1 gap-4 @[840px]/main:grid-cols-2 @[1400px]/main:grid-cols-4">
          <Suspense
            fallback={
              <div className="bg-card col-span-full h-80 animate-pulse rounded-md @[840px]/main:col-span-2 @[1248px]/main:h-auto"></div>
            }
          >
            <DailyDataChart record={dailyDataRecord} />
          </Suspense>

          <AttendanceCalendar
            home_work_dates={summary.home_work_dates}
            office_work_dates={summary.office_work_dates}
            leave_dates={summary.leave_dates}
            public_holidays_dates={summary.public_holidays_dates}
            incomplete_records_dates={summary.incomplete_records_dates}
          />

          <div className="flex h-full flex-col gap-4">
            {summary.preferred_home_days && <PreferredHomeDaysCard preferred_home_days={summary.preferred_home_days} />}

            <WorkModeChart
              home_days={summary.home_days}
              home_work_percentage={summary.home_work_percentage}
              office_days={summary.office_days}
              office_work_percentage={summary.office_work_percentage}
              total_days={summary.total_days}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
