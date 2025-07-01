import { redirect } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { AllTimeAttendanceSummary, AttendanceRecord, AttendanceRecordWithUserDetails } from '@/types/interfaces';

export const getActiveUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/');
  }

  const isAdmin = user.user_metadata.user_role === 'admin';

  return {
    user,
    isAdmin,
  };
});

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

export const getAllTimeSummary = async ({ employee_id }: { employee_id: string }) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('employee_analytics_summary_all_time_view')
    .select()
    .eq('employee_id', employee_id)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return data as AllTimeAttendanceSummary;
};

// because the returning data is in type <json>, we need to type parse it
const DailyHoursSchema = z.object({
  date: z.string(),
  hours_worked: z.number().nullable(),
  lunch_taken_minutes: z.number().nullable(),
});

const DailyHoursArraySchema = z.array(DailyHoursSchema);

export type DailyHoursRecord = z.infer<typeof DailyHoursSchema>;

export const getDailyHoursRecord = async ({
  p_employee_id,
  p_start_date,
  p_end_date,
}: {
  p_employee_id: string;
  p_start_date: string;
  p_end_date: string;
}): Promise<DailyHoursRecord[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_daily_hours_record', {
    p_employee_id,
    p_start_date,
    p_end_date,
  });

  if (error) {
    console.error(error);
    return [];
  }

  const parsed = DailyHoursArraySchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid data shape:', parsed.error);
    return [];
  }

  return parsed.data;
};
