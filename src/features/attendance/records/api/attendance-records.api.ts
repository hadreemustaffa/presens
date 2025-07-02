import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { createClient } from '@/lib/supabase/server';

export async function getAttendanceRecord({
  employee_id,
  work_date,
}: Pick<AttendanceRecord, 'employee_id' | 'work_date'>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('attendance_records')
    .select()
    .eq('employee_id', employee_id)
    .eq('work_date', work_date)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return data;
}

export async function getAllAttendanceRecords({ employee_id }: Pick<AttendanceRecord, 'employee_id'>) {
  const supabase = await createClient();

  if (!employee_id) {
    return [];
  }

  const { data, error } = await supabase.from('attendance_records').select().eq('employee_id', employee_id);

  if (error) {
    console.error(error);
  }

  if (!data) {
    return [];
  }

  return data as AttendanceRecord[];
}

export async function getAllEmployeesAttendanceRecords() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('attendance_with_user').select();

  if (error) {
    console.error(error);
  }

  if (!data) {
    return [];
  }

  return data as AttendanceRecordWithUserDetails[];
}
