import dayjs from 'dayjs';

import { getActiveUser, getAttendanceRecord } from '@/api/dashboard';
import { ActivityCards } from '@/components/activity-cards';
import AddAttendanceRecordForm from '@/components/forms/add-attendance-record-form';
import QuickActions from '@/components/quick-actions';
import StatusCard from '@/components/status-card';
import { UserMetadata } from '@/types/interfaces';

export default async function DashboardPage() {
  const { user } = await getActiveUser();
  const userMetadata = user.user_metadata as UserMetadata;

  const record = await getAttendanceRecord({
    employee_id: userMetadata.employee_id,
    work_date: dayjs().format('YYYY-MM-DD'),
  });

  if (!record) {
    return (
      <div className="flex h-full w-full flex-col justify-between gap-12 p-4">
        <AddAttendanceRecordForm />
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-1 grid-rows-[auto_1fr] gap-y-4 p-4 @[1024px]/main:grid-cols-3 @[1024px]/main:gap-x-4">
      <div className="flex flex-col gap-4 @[1024px]/main:col-span-2">
        <QuickActions {...record} />
        <StatusCard {...record} />
      </div>
      <ActivityCards {...record} />
    </div>
  );
}
