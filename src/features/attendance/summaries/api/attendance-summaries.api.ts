import { z } from 'zod';

import { AllTimeAttendanceSummary } from '@/features/attendance/summaries/model/interfaces';
import { DailyDataRecord } from '@/features/attendance/summaries/model/types';
import { createClient } from '@/lib/supabase/server';

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
export const DailyDataSchema = z.object({
  date: z.string(),
  hours_worked: z.number().nullable(),
  lunch_taken_minutes: z.number().nullable(),
});

const DailyDataArraySchema = z.array(DailyDataSchema);

export const getDailyDataRecords = async ({
  p_employee_id,
  p_start_date,
  p_end_date,
}: {
  p_employee_id: string;
  p_start_date: string;
  p_end_date: string;
}): Promise<DailyDataRecord[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_daily_data_record', {
    p_employee_id,
    p_start_date,
    p_end_date,
  });

  if (error) {
    console.error(error);
    return [];
  }

  const parsed = DailyDataArraySchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid data shape:', parsed.error);
    return [];
  }

  return parsed.data;
};
