import React from 'react';

import { getActiveUser } from '@/api';
import {
  getAllAttendanceRecords,
  getAllEmployeesAttendanceRecords,
} from '@/features/attendance/records/api/attendance-records.api';
import { DataTable } from '@/features/attendance/records/components/data-table';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';

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
