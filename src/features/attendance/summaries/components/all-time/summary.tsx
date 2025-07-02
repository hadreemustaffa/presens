'use client';

import { Suspense } from 'react';

import AttendanceCalendar from '@/features/attendance/summaries/components/all-time/attendance-calendar';
import DailyDataChart from '@/features/attendance/summaries/components/all-time/daily-data-chart';
import MetricsCard from '@/features/attendance/summaries/components/all-time/metrics-card';
import PreferredHomeDaysCard from '@/features/attendance/summaries/components/all-time/preferred-home-days-card';
import WorkModeChart from '@/features/attendance/summaries/components/all-time/work-mode-chart';
import UserSelect from '@/features/attendance/summaries/components/user-select';
import { AllTimeAttendanceSummary } from '@/features/attendance/summaries/model/interfaces';
import { DailyDataRecord } from '@/features/attendance/summaries/model/types';
import { useUser } from '@/features/users/hooks/use-user';
import { UserMetadata } from '@/features/users/model/interfaces';

export default function Summary({
  summary,
  dailyDataRecord,
  users,
}: {
  summary: AllTimeAttendanceSummary;
  dailyDataRecord: DailyDataRecord[];
  users: UserMetadata[];
}) {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row items-center justify-between">
        <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
        {user?.user_metadata.user_role === 'admin' && (
          <UserSelect
            users={users}
            activeUser={{
              email: user.user_metadata.email,
              full_name: user.user_metadata.full_name,
              department: user.user_metadata.department,
              employee_id: user.user_metadata.employee_id,
            }}
          />
        )}
      </div>
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
