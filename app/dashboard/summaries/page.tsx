import dayjs from 'dayjs';

import { getActiveUser, getAllTimeSummary, getDailyDataRecords, getUsers } from '@/api/dashboard';
import Summary from '@/app/dashboard/summaries/components/all-time/summary';
import { DEFAULT_CHART_TIMEFRAME, MIN_DAYS_FOR_SUMMARIES } from '@/lib/constants';

type SearchParams = Promise<{ employee_id?: string; timeframe?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const { user, isAdmin } = await getActiveUser();
  const searchParams = await props.searchParams;

  // If admin, allow selecting user from search params, else use self
  const selectedUserId =
    isAdmin && searchParams.employee_id ? searchParams.employee_id : user.user_metadata.employee_id;

  const selectedChartTimeframe = searchParams.timeframe ? searchParams.timeframe : DEFAULT_CHART_TIMEFRAME;

  const summary = await getAllTimeSummary({ employee_id: selectedUserId });

  const isChartTimeframeMoreThanAWeek = Number(searchParams.timeframe) > 7;

  const users = getUsers();

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

  return <Summary summary={summary} dailyDataRecord={resolvedDailyDataRecord} users={resolvedUsers} />;
}
