import dayjs from 'dayjs';

import { getActiveUser, getAttendanceRecord } from '@/api/dashboard';
import AddAttendanceRecordForm from '@/components/add-attendance-record-form';
import { SectionCards } from '@/components/section-cards';
import { Button } from '@/components/ui/button';
import { UserMetadata } from '@/types/interfaces';

export default async function DashboardPage() {
  const { user, isAdmin } = await getActiveUser();
  const userMetadata = user.user_metadata as UserMetadata;

  const record = await getAttendanceRecord({
    employee_id: userMetadata.employee_id,
    work_date: dayjs().format('YYYY-MM-DD'),
  });

  return (
    <div className="flex h-full w-full flex-col justify-between gap-12 p-4">
      {record ? (
        <>
          <SectionCards {...record} />
          <div className="w-full">
            <form className="grid grid-cols-2 justify-between gap-4">
              <Button size={'lg'}>Clock Out</Button>
              <Button size={'lg'}>Lunch Out</Button>
            </form>
          </div>
        </>
      ) : (
        <AddAttendanceRecordForm {...userMetadata} />
      )}
    </div>
  );
}
