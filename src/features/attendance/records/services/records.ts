import { revalidatePath } from 'next/cache';

import { AttendanceRecord } from '@/features/attendance/records/model/interfaces';
import { AttendanceRecordsRepository } from '@/features/attendance/records/repositories/records';
import { handleDatabaseError } from '@/features/shared/lib/utils';
import { Remarks, WorkMode } from '@/features/shared/model/enums';
import { ActionResult } from '@/features/shared/model/interfaces';
import { getActiveUser } from '@/features/users/api/users.api';
import { DASHBOARD_PATH, RECORDS_PATH } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDate, getCurrentTime } from '@/lib/utils';

const createAttendanceRecord = (
  employeeId: string,
  workMode: WorkMode,
  additionalFields: Partial<AttendanceRecord> = {},
): AttendanceRecord => {
  const { ...fieldsWithoutId } = additionalFields;
  return {
    employee_id: employeeId,
    work_date: getCurrentDate(),
    work_mode: workMode,
    ...fieldsWithoutId,
  } as AttendanceRecord;
};

export class AttendanceRecordsService {
  constructor(private repository: AttendanceRecordsRepository) {}

  async clockIn(workMode: WorkMode): Promise<ActionResult> {
    const { user } = await getActiveUser();
    const employeeId = user.user_metadata.employee_id;

    const record = createAttendanceRecord(employeeId, workMode, {
      clock_in: getCurrentTime(),
    });

    const { error } = await this.repository.insertRecord(record);

    if (error) {
      return handleDatabaseError(error, 'Failed to clock in. Please try again.');
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  }

  async clockOut(remark?: Remarks | null, otherRemark?: string): Promise<ActionResult> {
    const { user } = await getActiveUser();
    const employeeId = user.user_metadata.employee_id;

    const updates = {
      clock_out: getCurrentTime(),
      remarks: otherRemark ?? remark ?? null,
    };

    const { error } = await this.repository.updateRecord(updates, employeeId, getCurrentDate());

    if (error) {
      return handleDatabaseError(error, 'Failed to clock out. Please try again.');
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: 'You have clocked out.' };
  }

  async lunchOut(): Promise<ActionResult> {
    return this.updateLunchTime('lunch_out', 'Failed to lunch out. Please try again.');
  }

  async lunchIn(): Promise<ActionResult> {
    return this.updateLunchTime('lunch_in', 'Failed to lunch in. Please try again.');
  }

  private async updateLunchTime(field: 'lunch_out' | 'lunch_in', errorMessage: string): Promise<ActionResult> {
    const { user } = await getActiveUser();
    const employeeId = user.user_metadata.employee_id;

    const updates = { [field]: getCurrentTime() };

    const { error } = await this.repository.updateRecord(updates, employeeId, getCurrentDate());

    if (error) {
      return handleDatabaseError(error, errorMessage);
    }

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  }

  async editRemarks(
    workDate: string,
    employeeId: string,
    remarks?: Remarks | null,
    otherRemarks?: string,
  ): Promise<ActionResult> {
    const updates = {
      remarks: otherRemarks ?? remarks,
    };

    const { error } = await this.repository.updateRecord(updates, employeeId, workDate);

    if (error) {
      return handleDatabaseError(error, 'Failed to save new remarks. Please try again.');
    }

    revalidatePath(RECORDS_PATH);
    return { success: 'New remarks have been saved.' };
  }

  async editRecord(data: {
    employee_id: string;
    clock_in: string;
    lunch_out: string;
    lunch_in: string;
    clock_out: string;
    work_date: string;
    work_mode: WorkMode;
  }): Promise<ActionResult> {
    const { employee_id, work_date, ...updates } = data;

    const { error } = await this.repository.updateRecord(updates, employee_id, work_date);

    if (error) {
      return handleDatabaseError(error, 'Failed to edit record. Please try again.');
    }

    revalidatePath(RECORDS_PATH);
    return { success: 'Record has been edited.' };
  }

  async deleteRecord(id: number): Promise<ActionResult> {
    const { error, count } = await this.repository.deleteRecord(id);

    if (error) {
      return handleDatabaseError(error, 'Failed to delete record. Please try again.');
    }

    if (count === 0) {
      return {
        error: 'You do not have permission to delete this record, or it does not exist.',
      };
    }

    revalidatePath(RECORDS_PATH);
    return { success: 'Record has been deleted.' };
  }

  async deleteMultipleRecords(ids: number[]): Promise<ActionResult> {
    const { error, count } = await this.repository.deleteMultipleRecords(ids);

    if (error) {
      return handleDatabaseError(error, 'Failed to delete selected records. Please try again.');
    }

    if (count === 0) {
      return {
        error: 'You do not have permission to delete these records, or they do not exist.',
      };
    }

    revalidatePath(RECORDS_PATH);
    return { success: 'Records have been deleted.' };
  }
}

// Factory function for creating service instance
export const createAttendanceRecordsService = async (): Promise<AttendanceRecordsService> => {
  const supabase = await createClient();
  const repository = new AttendanceRecordsRepository(supabase);
  return new AttendanceRecordsService(repository);
};
