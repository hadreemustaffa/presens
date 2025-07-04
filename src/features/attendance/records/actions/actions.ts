'use server';

import {
  clockOutSchema,
  deleteMultipleRecordsSchema,
  deleteRecordSchema,
  editRecordSchema,
  editRemarksSchema,
} from '@/features/attendance/records/actions/schemas';
import { createAttendanceRecordsService } from '@/features/attendance/records/services/records';
import { WorkMode } from '@/features/shared/model/enums';
import { ActionResult } from '@/features/shared/model/interfaces';
import { validatedAction } from '@/lib/middleware';

export const clockInHome = async (): Promise<ActionResult> => {
  const service = await createAttendanceRecordsService();
  return service.clockIn(WorkMode.Home);
};

export const clockInOffice = async (): Promise<ActionResult> => {
  const service = await createAttendanceRecordsService();
  return service.clockIn(WorkMode.Office);
};

export const clockOut = validatedAction(clockOutSchema, async (data) => {
  const service = await createAttendanceRecordsService();
  const { remark, other_remark } = data;
  return service.clockOut(remark, other_remark);
});

export const lunchOut = async (): Promise<ActionResult> => {
  const service = await createAttendanceRecordsService();
  return service.lunchOut();
};

export const lunchIn = async (): Promise<ActionResult> => {
  const service = await createAttendanceRecordsService();
  return service.lunchIn();
};

export const editRemarks = validatedAction(editRemarksSchema, async (data) => {
  const service = await createAttendanceRecordsService();
  const { work_date, employee_id, remarks, other_remarks } = data;
  return service.editRemarks(work_date, employee_id, remarks, other_remarks);
});

export const editRecord = validatedAction(editRecordSchema, async (data) => {
  const service = await createAttendanceRecordsService();
  return service.editRecord(data);
});

export const deleteRecord = validatedAction(deleteRecordSchema, async (data) => {
  const service = await createAttendanceRecordsService();
  const { id } = data;
  return service.deleteRecord(id);
});

export const deleteMultipleRecords = validatedAction(deleteMultipleRecordsSchema, async (data) => {
  const service = await createAttendanceRecordsService();
  const { ids } = data;
  return service.deleteMultipleRecords(ids);
});
