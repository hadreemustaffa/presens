import React from 'react';

import { getActiveUser, getAllAttendanceRecords, getAllEmployeesAttendanceRecords } from '@/api/dashboard';
import { DataTable } from '@/components/data-table';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/lib/types/interfaces';

export default async function RecordsPage() {
  const { user, isAdmin } = await getActiveUser();

  let records: (AttendanceRecord | AttendanceRecordWithUserDetails)[] = [];

  if (isAdmin) {
    records = await getAllEmployeesAttendanceRecords();
  } else {
    records = await getAllAttendanceRecords({
      employee_id: user.user_metadata.employee_id,
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <DataTable data={records} isAdmin={isAdmin} />
    </div>
  );
}
