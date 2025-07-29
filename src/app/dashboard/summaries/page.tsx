import dayjs from 'dayjs';

import { getActiveUser } from '@/api';
import { getAllTimeSummary, getDailyDataRecords } from '@/features/attendance/summaries/api/attendance-summaries.api';
import Summary from '@/features/attendance/summaries/components/all-time/summary';
import UserSelect from '@/features/attendance/summaries/components/user-select';
import { SummarySearchParams } from '@/features/attendance/summaries/model/types';
import { getUsers } from '@/features/users/api/users.api';
import { DEFAULT_CHART_TIMEFRAME, MIN_DAYS_FOR_SUMMARIES } from '@/lib/constants';

export const metadata = {
  title: 'Summaries',
  description: 'View attendance summaries for insights.',
};

export default async function Page(props: { searchParams: SummarySearchParams }) {
  const { user, isAdmin } = await getActiveUser();
  const searchParams = await props.searchParams;

  // If admin, allow selecting user from search params, else use self
  const selectedUserId =
    isAdmin && searchParams.employee_id ? searchParams.employee_id : user.user_metadata.employee_id;

  const selectedChartTimeframe = searchParams.timeframe ? searchParams.timeframe : DEFAULT_CHART_TIMEFRAME;

  const summary = await getAllTimeSummary({ employee_id: selectedUserId });

  const isChartTimeframeMoreThanAWeek = Number(searchParams.timeframe) > 7;

  const users = await getUsers();

  const dailyDataRecord = getDailyDataRecords({
    p_employee_id: selectedUserId,
    p_start_date: isChartTimeframeMoreThanAWeek
      ? dayjs().subtract(Number(selectedChartTimeframe), 'days').startOf('month').format('YYYY-MM-DD')
      : dayjs().subtract(Number(selectedChartTimeframe), 'days').format('YYYY-MM-DD'),
    p_end_date: dayjs().format('YYYY-MM-DD'),
  });

  const [resolvedUsers, resolvedDailyDataRecord] = await Promise.all([users, dailyDataRecord]);

  if (!summary) {
    return (
      <div className="flex h-full flex-col gap-4 px-4">
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
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border text-center">
          <div>No data available</div>
        </div>
      </div>
    );
  }

  if (summary.total_days < MIN_DAYS_FOR_SUMMARIES) {
    return (
      <div className="flex h-full flex-col gap-4 px-4">
        {user?.user_metadata.user_role === 'admin' ? (
          <>
            <div className="flex flex-row items-center justify-between">
              <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
              <UserSelect
                users={users}
                activeUser={{
                  email: user.user_metadata.email,
                  full_name: user.user_metadata.full_name,
                  department: user.user_metadata.department,
                  employee_id: user.user_metadata.employee_id,
                }}
              />
            </div>
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border p-4 text-center">
              <p>
                {`${selectedUserId === user.user_metadata.employee_id ? "You'll see summaries here once you have" : "This employee's summaries will be available after"}  ${MIN_DAYS_FOR_SUMMARIES - summary.total_days} more days of attendance.`}
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="my-2 text-xl font-bold">All Time Summary</h2>
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border p-4 text-center">
              <p>
                You&apos;ll see summaries here once you have {MIN_DAYS_FOR_SUMMARIES - summary.total_days} more days of
                attendance.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return <Summary summary={summary} dailyDataRecord={resolvedDailyDataRecord} users={resolvedUsers} />;
}
