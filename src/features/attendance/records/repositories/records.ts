import { SupabaseClient } from '@supabase/supabase-js';

import { AttendanceRecord } from '@/features/attendance/records/model/interfaces';

export class AttendanceRecordsRepository {
  constructor(private supabase: SupabaseClient) {}

  async insertRecord(record: AttendanceRecord): Promise<{ error: unknown }> {
    return await this.supabase.from('attendance_records').insert(record);
  }

  async updateRecord(
    updates: Partial<AttendanceRecord>,
    employeeId: string,
    workDate: string,
  ): Promise<{ error: unknown }> {
    return await this.supabase
      .from('attendance_records')
      .update(updates)
      .eq('employee_id', employeeId)
      .eq('work_date', workDate);
  }

  async updateRecordById(
    updates: Partial<AttendanceRecord>,
    employeeId: string,
    workDate: string,
  ): Promise<{ error: unknown }> {
    return await this.supabase
      .from('attendance_records')
      .update(updates)
      .eq('employee_id', employeeId)
      .eq('work_date', workDate);
  }

  async deleteRecord(id: number): Promise<{ error: unknown; count: number }> {
    const { error, count } = await this.supabase.from('attendance_records').delete({ count: 'exact' }).eq('id', id);
    return { error, count: count ?? 0 };
  }

  async deleteMultipleRecords(ids: number[]): Promise<{ error: unknown; count: number }> {
    const { error, count } = await this.supabase.from('attendance_records').delete({ count: 'exact' }).in('id', ids);
    return { error, count: count ?? 0 };
  }
}
